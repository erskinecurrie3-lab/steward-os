/**
 * API client — StewardOS backend
 * HTTP client for app/api routes.
 */

import { toUIGuest, toCreatePayload, toUpdatePayload } from "./guest-transform";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(err || `API error: ${res.status}`);
  }
  return res.json();
}

/** Portal API (no auth) — for GuestPortal */
export const PortalAPI = {
  lookup: (email: string, churchId: string) =>
    apiFetch<unknown[]>(
      `/api/portal/guests?email=${encodeURIComponent(email)}&churchId=${encodeURIComponent(churchId)}`
    ),
  create: (data: Record<string, unknown>) =>
    fetch(`${API_BASE}/api/portal/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) =>
      r.ok ? r.json() : r.json().then((e) => { throw new Error((e as { error?: string }).error || "Portal create failed"); })
    ),
  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${API_BASE}/api/portal/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) =>
      r.ok ? r.json() : r.json().then((e) => { throw new Error((e as { error?: string }).error || "Portal update failed"); })
    ),
  getChurch: (churchId: string) => apiFetch(`/api/portal/church/${churchId}`),
};

/** Guest CRUD — maps to Prisma Guest */
export const GuestAPI = {
  list: async (churchId: string) => {
    const raw = await apiFetch<unknown[]>(`/api/guests?church_id=${encodeURIComponent(churchId)}`);
    return Array.isArray(raw) ? raw.map((g) => toUIGuest(g as Parameters<typeof toUIGuest>[0])) : [];
  },
  get: async (id: string) => {
    const raw = await apiFetch(`/api/guests/${id}`);
    return toUIGuest(raw as Parameters<typeof toUIGuest>[0]);
  },
  filter: async (query: { id?: string; church_id?: string; email?: string } = {}) => {
    if (query.id) {
      try {
        const g = await apiFetch(`/api/guests/${query.id}`);
        return [toUIGuest(g as Parameters<typeof toUIGuest>[0])];
      } catch {
        return [];
      }
    }
    const raw = await apiFetch<unknown[]>(`/api/guests`);
    return Array.isArray(raw) ? raw.map((g) => toUIGuest(g as Parameters<typeof toUIGuest>[0])) : [];
  },
  create: async (data: Record<string, unknown>) => {
    const payload = toCreatePayload(data as Parameters<typeof toCreatePayload>[0]);
    const raw = await apiFetch("/api/guests", { method: "POST", body: JSON.stringify(payload) });
    return toUIGuest(raw as Parameters<typeof toUIGuest>[0]);
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const payload = toUpdatePayload(data);
    const raw = await apiFetch(`/api/guests/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    return toUIGuest(raw as Parameters<typeof toUIGuest>[0]);
  },
  delete: (id: string) => apiFetch(`/api/guests/${id}`, { method: "DELETE" }),
};

/** Care Note CRUD */
export const CareNoteAPI = {
  list: (guestId: string) => apiFetch<unknown[]>(`/api/care-notes?guestId=${guestId}`),
  listAll: () => apiFetch<unknown[]>("/api/care-notes"),
  get: (id: string) => apiFetch(`/api/care-notes/${id}`),
  create: (data: { content: string; guestId?: string; guestName?: string; campusId?: string }) =>
    apiFetch("/api/care-notes", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { content: string }) =>
    apiFetch(`/api/care-notes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/care-notes/${id}`, { method: "DELETE" }),
};

/** Church team members (volunteers) */
export const UserAPI = {
  list: async () => {
    const users = await apiFetch<Array<{ id: string; email: string; full_name?: string; role: string }>>(
      "/api/team/users"
    );
    return Array.isArray(users) ? users : [];
  },
};

/** Task CRUD + AI generate */
export const TaskAPI = {
  list: (churchId: string) => apiFetch<unknown[]>(`/api/tasks?church_id=${encodeURIComponent(churchId)}`),
  get: (id: string) => apiFetch(`/api/tasks/${id}`),
  create: (data: Record<string, unknown>) =>
    apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/tasks/${id}`, { method: "DELETE" }),
  generate: (churchId: string) =>
    apiFetch("/api/tasks/generate", {
      method: "POST",
      body: JSON.stringify({ church_id: churchId }),
    }),
};

/** Event CRUD */
export const EventAPI = {
  list: () => apiFetch<unknown[]>("/api/events"),
  get: (id: string) => apiFetch(`/api/events/${id}`),
  create: (data: { title?: string; name?: string; start_date?: string; date?: string }) =>
    apiFetch("/api/events", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { title?: string; name?: string; start_date?: string; date?: string }) =>
    apiFetch(`/api/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/events/${id}`, { method: "DELETE" }),
};

/** Campus CRUD (admin only) */
export const CampusAPI = {
  list: () => apiFetch<unknown[]>("/api/campuses"),
  get: (id: string) => apiFetch(`/api/campuses/${id}`),
  create: (data: { name: string; address?: string; pastorName?: string; isMain?: boolean }) =>
    apiFetch("/api/campuses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; address?: string; pastorName?: string; isMain?: boolean }) =>
    apiFetch(`/api/campuses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/campuses/${id}`, { method: "DELETE" }),
};

/** Prayer Request CRUD */
export const PrayerRequestAPI = {
  list: () => apiFetch<unknown[]>("/api/prayer-requests"),
  get: (id: string) => apiFetch(`/api/prayer-requests/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/prayer-requests/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/prayer-requests/${id}`, { method: "DELETE" }),
};
