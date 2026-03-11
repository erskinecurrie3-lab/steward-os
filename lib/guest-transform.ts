/**
 * Map steward-os Guest shape to UI-compatible shape
 */

export type StewardGuest = {
  id: string;
  churchId: string;
  campusId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  assignedVolunteer?: string | null;
  status?: string | null;
  journeyStage?: string | null;
  isAtRisk?: boolean | null;
  createdAt: Date | string;
  campus?: { name: string } | null;
};

export type UIGuest = StewardGuest & {
  first_name: string;
  last_name: string;
  status: string;
  journey_stage: string;
  is_at_risk: boolean;
  created_date: string;
  assigned_volunteer?: string;
  next_followup_date?: string | null;
};

export function toUIGuest(g: StewardGuest): UIGuest {
  const parts = (g.name || "").trim().split(/\s+/);
  const first_name = parts[0] ?? "";
  const last_name = parts.slice(1).join(" ") ?? "";
  return {
    ...g,
    first_name,
    last_name,
    status: g.status ?? "new_visitor",
    journey_stage: g.journeyStage ?? "stage_1_welcome",
    is_at_risk: g.isAtRisk ?? false,
    created_date: typeof g.createdAt === "string" ? g.createdAt : g.createdAt.toISOString(),
    assigned_volunteer: g.assignedVolunteer ?? undefined,
    next_followup_date: undefined,
  };
}

export function toCreatePayload(form: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  visit_date?: string;
  spiritual_background?: string;
  family_status?: string;
  how_heard?: string;
  church_id?: string;
  status?: string;
  journey_stage?: string;
  [k: string]: unknown;
}) {
  const name = [form.first_name, form.last_name].filter(Boolean).join(" ").trim() || "Guest";
  const notesParts = [
    form.spiritual_background && `Background: ${form.spiritual_background}`,
    form.family_status && `Family: ${form.family_status}`,
    form.visit_date && `Visit date: ${form.visit_date}`,
    form.how_heard && `How heard: ${form.how_heard}`,
    form.notes && String(form.notes).trim(),
  ].filter(Boolean);
  const notes = notesParts.join("\n") || undefined;
  return {
    name,
    email: form.email?.trim() || undefined,
    phone: form.phone?.trim() || undefined,
    notes,
  };
}

export function toUpdatePayload(form: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  if (form.first_name !== undefined || form.last_name !== undefined) {
    const first = (form.first_name as string) ?? "";
    const last = (form.last_name as string) ?? "";
    payload.name = [first, last].filter(Boolean).join(" ").trim() || "Guest";
  }
  if (form.email !== undefined) payload.email = form.email ? String(form.email).trim() : null;
  if (form.phone !== undefined) payload.phone = form.phone ? String(form.phone).trim() : null;
  if (form.notes !== undefined) payload.notes = form.notes ? String(form.notes).trim() : null;
  if (form.assigned_volunteer !== undefined) payload.assignedVolunteer = form.assigned_volunteer ? String(form.assigned_volunteer).trim() : null;
  if (form.status !== undefined) payload.status = form.status ? String(form.status) : null;
  if (form.journey_stage !== undefined) payload.journeyStage = form.journey_stage ? String(form.journey_stage) : null;
  if (form.is_at_risk !== undefined) payload.isAtRisk = Boolean(form.is_at_risk);
  return payload;
}
