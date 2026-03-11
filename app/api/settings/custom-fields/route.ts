/**
 * Custom Fields API — Church-scoped custom field definitions
 * GET: List custom fields
 * PUT: Replace all custom fields
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export type CustomFieldDef = {
  id: string;
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  entity: "guest" | "lead";
  options?: string[];
  required?: boolean;
};

function getCustomFields(churchSettings: unknown): CustomFieldDef[] {
  const settings = churchSettings as { customFields?: CustomFieldDef[] } | null;
  return Array.isArray(settings?.customFields) ? settings.customFields : [];
}

export async function GET() {
  try {
    const ctx = await requireChurchWithUser();
    if (!ctx.isAdminOrPastor) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const church = await getChurchByClerkOrg(ctx.orgId);
    if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });
    const fields = getCustomFields(church.churchSettings);
    return NextResponse.json(fields);
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const ctx = await requireChurchWithUser();
    if (!ctx.isAdminOrPastor) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const church = await getChurchByClerkOrg(ctx.orgId);
    if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

    const body = await req.json();
    const fields = Array.isArray(body) ? body : body.customFields ?? [];

    const validTypes = ["text", "number", "date", "select", "checkbox"];
    const validEntities = ["guest", "lead"];
    const normalized = fields.map((f: unknown, i: number) => {
      const x = f as Record<string, unknown>;
      const id = typeof x.id === "string" ? x.id : `cf_${Date.now()}_${i}`;
      const key = (typeof x.key === "string" ? x.key : `field_${i}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_");
      const label = typeof x.label === "string" ? x.label : "Untitled Field";
      const type = validTypes.includes(String(x.type)) ? (x.type as string) : "text";
      const entity = validEntities.includes(String(x.entity)) ? (x.entity as string) : "guest";
      const options = Array.isArray(x.options) ? x.options.filter((o) => typeof o === "string") : undefined;
      const required = Boolean(x.required);
      return { id, key, label, type, entity, options, required };
    });

    const current = (church.churchSettings as Record<string, unknown>) ?? {};
    await prisma.church.update({
      where: { id: church.id },
      data: {
        churchSettings: { ...current, customFields: normalized },
      },
    });
    return NextResponse.json(normalized);
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
