/**
 * Planning Center API models → StewardOS models
 * External model mapping for sync and webhooks.
 */

export const EXTERNAL_SOURCE = "planning_center";

// --- People → Guest ---

export type PCOPerson = {
  type: string;
  id: string;
  attributes: {
    first_name?: string;
    last_name?: string;
    name?: string;
    membership?: string;
  };
  relationships?: {
    emails?: { data: { type: string; id: string }[] };
    phone_numbers?: { data: { type: string; id: string }[] };
  };
};

export type PCOIncludedEmail = {
  type: string;
  id: string;
  attributes: { address?: string; primary?: boolean };
};

export type PCOIncludedPhone = {
  type: string;
  id: string;
  attributes: { number?: string; primary?: boolean };
};

export function mapPersonToGuest(
  person: PCOPerson,
  included: Array<PCOIncludedEmail | PCOIncludedPhone>,
  churchId: string
) {
  const attrs = person.attributes;
  const name =
    attrs.name ||
    [attrs.first_name, attrs.last_name].filter(Boolean).join(" ") ||
    "Unknown";

  let email: string | null = null;
  let phone: string | null = null;
  const emailIds = new Set((person.relationships?.emails?.data ?? []).map((d) => d.id));
  const phoneIds = new Set((person.relationships?.phone_numbers?.data ?? []).map((d) => d.id));

  for (const inc of included) {
    if (inc.type === "Email" && "address" in inc.attributes && emailIds.has(inc.id)) {
      const addr = inc.attributes.address;
      if (addr && (inc.attributes.primary || !email)) email = addr;
    }
    if (inc.type === "PhoneNumber" && "number" in inc.attributes && phoneIds.has(inc.id)) {
      const num = inc.attributes.number;
      if (num && (inc.attributes.primary || !phone)) phone = num;
    }
  }

  let status = "new_visitor";
  const m = attrs.membership;
  if (m === "member") status = "member";
  else if (m === "guest") status = "new_visitor";
  else if (m === "visitor") status = "returning_visitor";

  return {
    churchId,
    name,
    email,
    phone,
    status,
    externalSource: EXTERNAL_SOURCE,
    externalId: person.id,
  };
}

// --- Plan → Event (Services) ---

export type PCOPlan = {
  id: string;
  attributes: {
    title?: string;
    short_dates?: string;
    dates?: string;
    sort_date?: string;
    last_time_at?: string;
    series_title?: string;
    public?: boolean;
  };
};

export function mapPlanToEvent(
  plan: PCOPlan,
  serviceName: string,
  churchId: string
) {
  const sortDate = plan.attributes.sort_date ?? plan.attributes.last_time_at;
  const date = sortDate ? new Date(sortDate) : new Date();
  return {
    churchId,
    campusId: null as string | null,
    name:
      plan.attributes.title ??
      plan.attributes.short_dates ??
      plan.attributes.dates ??
      "Untitled",
    date,
    description: plan.attributes.series_title ?? null,
    eventType: "service",
    ministry: serviceName,
    isPublic: plan.attributes.public ?? true,
    rsvpEnabled: false,
    externalSource: EXTERNAL_SOURCE,
    externalId: `svc:${plan.id}`,
  };
}

// --- Groups Event → Event ---

export type PCOGroupsEvent = {
  id: string;
  attributes: {
    name?: string;
    description?: string;
    starts_at?: string;
    ends_at?: string;
    canceled?: boolean;
    virtual_location_url?: string;
  };
};

export function mapGroupsEventToEvent(
  ev: PCOGroupsEvent,
  churchId: string
) {
  const startsAt = ev.attributes.starts_at
    ? new Date(ev.attributes.starts_at)
    : new Date();
  const endsAt = ev.attributes.ends_at
    ? new Date(ev.attributes.ends_at)
    : null;
  return {
    churchId,
    campusId: null as string | null,
    name: ev.attributes.name ?? "Group Event",
    date: startsAt,
    endDate: endsAt,
    description: ev.attributes.description ?? null,
    eventType: "group",
    location: ev.attributes.virtual_location_url ?? null,
    isPublic: true,
    rsvpEnabled: false,
    externalSource: EXTERNAL_SOURCE,
    externalId: `grp:${ev.id}`,
  };
}

// --- Group → Group ---

export type PCOGroup = {
  id: string;
  attributes: {
    name?: string;
    description?: string;
    description_as_plain_text?: string;
    schedule?: string;
    memberships_count?: number;
    archived_at?: string | null;
    virtual_location_url?: string;
    listed?: boolean;
  };
  relationships?: {
    group_type?: { data?: { id: string } };
  };
};

export function mapGroupToGroup(pcoGroup: PCOGroup, churchId: string) {
  const a = pcoGroup.attributes;
  return {
    churchId,
    campusId: null as string | null,
    name: a.name ?? "Unnamed Group",
    description: a.description_as_plain_text ?? a.description ?? null,
    schedule: a.schedule ?? null,
    membershipsCount: a.memberships_count ?? 0,
    externalSource: EXTERNAL_SOURCE,
    externalId: pcoGroup.id,
    pcoGroupTypeId: pcoGroup.relationships?.group_type?.data?.id ?? null,
    virtualLocationUrl: a.virtual_location_url ?? null,
    listed: a.listed ?? true,
    archivedAt: a.archived_at ? new Date(a.archived_at) : null,
  };
}
