/**
 * Planning Center scheduled data sync jobs
 * People, Events (Services + Groups), Groups
 */

import { prisma } from "@/lib/db";
import { getValidAccessToken } from "./auth";
import {
  mapPersonToGuest,
  mapPlanToEvent,
  mapGroupsEventToEvent,
  mapGroupToGroup,
  EXTERNAL_SOURCE,
} from "./mapper";
import type {
  PCOPerson,
  PCOIncludedEmail,
  PCOIncludedPhone,
  PCOPlan,
  PCOGroupsEvent,
  PCOGroup,
} from "./mapper";

const PROVIDER = "planningcenter";
const PCO_BASE = "https://api.planningcenteronline.com";
const PCO_PEOPLE = `${PCO_BASE}/people/v2/people`;
const PCO_SERVICES = `${PCO_BASE}/services/v2`;
const PCO_GROUPS = `${PCO_BASE}/groups/v2`;
const USER_AGENT = "StewardOS (https://stewardos.cc)";
const RATE_LIMIT_DELAY_MS = 1200;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function logError(context: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[PlanningCenter:${context}]`, msg);
}

async function pcoFetch<T>(
  accessToken: string,
  url: string,
  params?: Record<string, string | number>
): Promise<T> {
  const u = new URL(url);
  if (params) {
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  }
  const res = await fetch(u.toString(), {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": USER_AGENT },
  });
  if (res.status === 401) throw new Error("Unauthorized - token may have expired");
  if (res.status === 429) throw new Error("Rate limit exceeded");
  if (!res.ok) throw new Error(`PCO API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function updateSyncResult(
  configId: string,
  churchId: string,
  syncType: string,
  synced: number,
  failed: number,
  start: number,
  error?: string
) {
  const durationMs = Date.now() - start;
  if (error) {
    await prisma.integrationConfig.updateMany({
      where: { churchId, provider: PROVIDER },
      data: { lastError: error, lastSyncStatus: "error" },
    });
    await prisma.syncJob.create({
      data: {
        churchId,
        configId,
        provider: PROVIDER,
        syncType,
        status: "failed",
        startedAt: new Date(start),
        errorMessage: error,
      },
    });
  } else {
    await prisma.integrationConfig.update({
      where: { id: configId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: `Synced ${synced}${failed > 0 ? `, ${failed} failed` : ""}`,
        lastError: null,
        syncStats: { synced, failed, durationMs },
      },
    });
    await prisma.syncJob.create({
      data: {
        churchId,
        configId,
        provider: PROVIDER,
        syncType,
        status: "completed",
        startedAt: new Date(start),
        durationMs,
        recordsSynced: synced,
        recordsFailed: failed,
      },
    });
  }
}

export async function syncPeople(churchId: string): Promise<{
  synced: number;
  failed: number;
  error?: string;
}> {
  const start = Date.now();
  let synced = 0;
  let failed = 0;

  try {
    const { accessToken, configId } = await getValidAccessToken(churchId);

    let offset = 0;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const page = await pcoFetch<{
        data: PCOPerson[];
        included?: Array<PCOIncludedEmail | PCOIncludedPhone>;
        meta?: { total_count?: number };
      }>(accessToken, PCO_PEOPLE, {
        per_page: perPage,
        offset,
        include: "emails,phone_numbers",
      });

      const people = page.data ?? [];
      const included = page.included ?? [];

      for (const person of people) {
        try {
          const data = mapPersonToGuest(person, included, churchId);
          const existing = await prisma.guest.findFirst({
            where: { churchId, externalSource: EXTERNAL_SOURCE, externalId: person.id },
          });
          if (existing) {
            await prisma.guest.update({
              where: { id: existing.id },
              data: { name: data.name, email: data.email, phone: data.phone, status: data.status },
            });
          } else {
            await prisma.guest.create({ data });
          }
          synced++;
        } catch (err) {
          logError("upsertGuest", err);
          failed++;
        }
      }

      const total = page.meta?.total_count ?? people.length;
      hasMore = people.length === perPage && offset + people.length < (total || Infinity);
      offset += people.length;
      if (hasMore) await sleep(RATE_LIMIT_DELAY_MS);
    }

    await updateSyncResult(configId, churchId, "people", synced, failed, start);
    return { synced, failed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("syncPeople", err);
    await updateSyncResult("", churchId, "people", synced, failed, start, msg);
    return { synced, failed, error: msg };
  }
}

export async function syncEvents(churchId: string): Promise<{
  synced: number;
  failed: number;
  error?: string;
}> {
  const start = Date.now();
  let synced = 0;
  let failed = 0;

  try {
    const { accessToken, configId } = await getValidAccessToken(churchId);

    // Service types + plans
    const stData = await pcoFetch<{
      data: { id: string; attributes: { name?: string; archived_at?: string | null } }[];
    }>(accessToken, `${PCO_SERVICES}/service_types`, { per_page: 100 });
    const serviceTypes = (stData.data ?? []).filter((t) => !t.attributes.archived_at);
    await sleep(RATE_LIMIT_DELAY_MS);

    for (const st of serviceTypes) {
      const plansData = await pcoFetch<{ data: PCOPlan[] }>(
        accessToken,
        `${PCO_SERVICES}/service_types/${st.id}/plans`,
        { per_page: 100, order: "-sort_date" }
      );
      const plans = plansData.data ?? [];
      const serviceName = st.attributes.name ?? "Service";

      for (const plan of plans) {
        try {
          const data = mapPlanToEvent(
            { id: plan.id, attributes: plan.attributes } as PCOPlan,
            serviceName,
            churchId
          );
          const existing = await prisma.event.findFirst({
            where: { churchId, externalSource: EXTERNAL_SOURCE, externalId: data.externalId },
          });
          if (existing) {
            await prisma.event.update({
              where: { id: existing.id },
              data: {
                name: data.name,
                date: data.date,
                description: data.description,
                ministry: data.ministry,
                isPublic: data.isPublic,
              },
            });
          } else {
            await prisma.event.create({ data });
          }
          synced++;
        } catch (err) {
          logError("upsertEvent", err);
          failed++;
        }
      }
      await sleep(RATE_LIMIT_DELAY_MS);
    }

    // Groups events
    const eventsData = await pcoFetch<{ data: PCOGroupsEvent[] }>(
      accessToken,
      `${PCO_GROUPS}/events`,
      { per_page: 100 }
    );
    const events = eventsData.data ?? [];
    for (const ev of events) {
      if (ev.attributes.canceled) continue;
      try {
        const data = mapGroupsEventToEvent(
          { id: ev.id, attributes: ev.attributes } as PCOGroupsEvent,
          churchId
        );
        const existing = await prisma.event.findFirst({
          where: { churchId, externalSource: EXTERNAL_SOURCE, externalId: data.externalId },
        });
        if (existing) {
          await prisma.event.update({
            where: { id: existing.id },
            data: {
              name: data.name,
              date: data.date,
              endDate: data.endDate,
              description: data.description,
              eventType: data.eventType,
              location: data.location,
            },
          });
        } else {
          await prisma.event.create({ data });
        }
        synced++;
      } catch (err) {
        logError("upsertGroupEvent", err);
        failed++;
      }
    }

    await updateSyncResult(configId, churchId, "events", synced, failed, start);
    return { synced, failed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("syncEvents", err);
    await updateSyncResult("", churchId, "events", synced, failed, start, msg);
    return { synced, failed, error: msg };
  }
}

export async function syncGroups(churchId: string): Promise<{
  synced: number;
  failed: number;
  error?: string;
}> {
  const start = Date.now();
  let synced = 0;
  let failed = 0;

  try {
    const { accessToken, configId } = await getValidAccessToken(churchId);

    const groupsData = await pcoFetch<{ data: PCOGroup[] }>(
      accessToken,
      `${PCO_GROUPS}/groups`,
      { per_page: 100, "where[archive_status]": "not_archived" }
    );
    const groups = groupsData.data ?? [];

    for (const g of groups) {
      try {
        const data = mapGroupToGroup(g as PCOGroup, churchId);
        const existing = await prisma.group.findFirst({
          where: { churchId, externalSource: EXTERNAL_SOURCE, externalId: data.externalId },
        });
        if (existing) {
          await prisma.group.update({
            where: { id: existing.id },
            data: {
              name: data.name,
              description: data.description,
              schedule: data.schedule,
              membershipsCount: data.membershipsCount,
              pcoGroupTypeId: data.pcoGroupTypeId,
              virtualLocationUrl: data.virtualLocationUrl,
              listed: data.listed,
              archivedAt: data.archivedAt,
            },
          });
        } else {
          await prisma.group.create({ data });
        }
        synced++;
      } catch (err) {
        logError("upsertGroup", err);
        failed++;
      }
    }

    await updateSyncResult(configId, churchId, "groups", synced, failed, start);
    return { synced, failed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("syncGroups", err);
    await updateSyncResult("", churchId, "groups", synced, failed, start, msg);
    return { synced, failed, error: msg };
  }
}
