"use client";

import { useState, useEffect } from "react";
import { useChurchContext } from "@/lib/useChurchContext";
import { Plus, Calendar, MapPin, Users, Edit, Trash2, X, Check } from "lucide-react";
import GoogleCalendarSync from "@/components/events/GoogleCalendarSync";
import AIContentAssistant from "@/components/ai/AIContentAssistant";
import { format } from "date-fns";

const EVENT_TYPES: Record<string, { label: string; color: string }> = {
  service: { label: "Service", color: "bg-blue-50 text-blue-700" },
  class: { label: "Class", color: "bg-purple-50 text-purple-700" },
  social: { label: "Social", color: "bg-green-50 text-green-700" },
  outreach: { label: "Outreach", color: "bg-orange-50 text-orange-700" },
  other: { label: "Other", color: "bg-gray-50 text-gray-600" },
};

type EventRecord = {
  id: string;
  title?: string;
  name?: string;
  start_date?: string;
  date?: string;
  end_date?: string;
  event_type?: string;
  location?: string;
  description?: string;
  is_public?: boolean;
  rsvp_enabled?: boolean;
  rsvp_count?: number;
};

type RsvpRecord = {
  id: string;
  event_id: string;
  event_title?: string;
  guest_name?: string;
  guest_email?: string;
  status: string;
};

function EventForm({
  event,
  churchId: _churchId,
  onSave,
  onClose,
}: {
  event: EventRecord | { church_id?: string };
  churchId: string | null;
  onSave: (saved: EventRecord) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "service",
    start_date: "",
    end_date: "",
    location: "",
    capacity: "",
    is_public: true,
    rsvp_enabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const e = event as EventRecord;
    if (e?.id) {
      setForm({
        title: e.title ?? e.name ?? "",
        description: e.description ?? "",
        event_type: e.event_type ?? "service",
        start_date: e.start_date ?? e.date
          ? format(new Date(e.start_date ?? e.date ?? ""), "yyyy-MM-dd'T'HH:mm")
          : "",
        end_date: e.end_date ? format(new Date(e.end_date), "yyyy-MM-dd'T'HH:mm") : "",
        location: e.location ?? "",
        capacity: "",
        is_public: e.is_public !== false,
        rsvp_enabled: e.rsvp_enabled !== false,
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
      };
      const ev = event as EventRecord;
      if (ev?.id) {
        const res = await fetch(`/api/events/${ev.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });
        const saved = await res.json();
        if (res.ok) onSave(saved);
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });
        const saved = await res.json();
        if (res.ok) onSave(saved);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0A0A0A]">
            {(event as EventRecord).id ? "Edit Event" : "New Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Event Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="e.g. Sunday Morning Service"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Event Type</label>
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              >
                {Object.entries(EVENT_TYPES).map(([v, { label }]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Capacity (optional)</label>
              <input
                type="number"
                min={0}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Start Date & Time *</label>
              <input
                required
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">End Date & Time</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="e.g. Main Sanctuary, Room 101"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
              placeholder="Describe this event..."
            />
            <AIContentAssistant
              context={`Event: ${form.title}`}
              defaultTemplate={{
                label: "Event Description",
                prompt: "Write a compelling event description for a church gathering",
                channel: "event",
              }}
              onInsert={(text) => setForm((f) => ({ ...f, description: text }))}
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                className="accent-[#C9A84C]"
              />
              Show on Guest Portal
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.rsvp_enabled}
                onChange={(e) => setForm({ ...form, rsvp_enabled: e.target.checked })}
                className="accent-[#C9A84C]"
              />
              Enable RSVP
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] flex items-center gap-2 disabled:opacity-60"
            >
              <Check size={15} /> {saving ? "Saving..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { churchDbId, loading: churchLoading } = useChurchContext();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  useEffect(() => {
    if (churchLoading) return;
    const load = async () => {
      try {
        const [eventsRes, rsvpsRes] = await Promise.all([
          fetch("/api/events", { credentials: "include" }),
          fetch("/api/events/rsvps", { credentials: "include" }),
        ]);
        const eventsData = await eventsRes.json();
        const rsvpsData = await rsvpsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setRsvps(Array.isArray(rsvpsData) ? rsvpsData : []);
      } catch {
        setEvents([]);
        setRsvps([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [churchLoading]);

  const handleSave = (saved: EventRecord) => {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === saved.id);
      return exists
        ? prev.map((e) => (e.id === saved.id ? saved : e))
        : [{ ...saved, title: saved.title ?? saved.name }, ...prev];
    });
    setFormOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setRsvps((prev) => prev.filter((r) => r.event_id !== id));
      if (selectedEvent?.id === id) setSelectedEvent(null);
    }
  };

  const getRsvpCount = (eventId: string) =>
    rsvps.filter(
      (r) => r.event_id === eventId && r.status === "attending"
    ).length;

  const upcoming = events
    .filter((e) => new Date(e.start_date ?? e.date ?? 0) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.start_date ?? a.date ?? 0).getTime() -
        new Date(b.start_date ?? b.date ?? 0).getTime()
    );
  const past = events
    .filter((e) => new Date(e.start_date ?? e.date ?? 0) < new Date())
    .sort(
      (a, b) =>
        new Date(b.start_date ?? b.date ?? 0).getTime() -
        new Date(a.start_date ?? a.date ?? 0).getTime()
    );

  const selectedRsvps = rsvps.filter((r) => r.event_id === selectedEvent?.id);

  return (
    <div className="max-w-5xl w-full">
      {(formOpen || editingEvent) && (
        <EventForm
          event={editingEvent ?? { church_id: churchDbId ?? undefined }}
          churchId={churchDbId}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Events</h1>
          <p className="text-sm text-[#9CA3AF]">
            Create and manage church events, classes, and gatherings
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all"
        >
          <Plus size={16} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Upcoming Events", value: upcoming.length },
          {
            label: "Total RSVPs",
            value: rsvps.filter((r) => r.status === "attending").length,
          },
          { label: "Past Events", value: past.length },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-[#0A0A0A]">
              {loading ? "—" : s.value}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-[#9CA3AF]">
              Loading events...
            </div>
          ) : upcoming.length === 0 && past.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Calendar size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-[#9CA3AF]">No events yet. Create your first event.</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">
                    Upcoming
                  </p>
                  <div className="space-y-3">
                    {upcoming.map((ev) => {
                      const { label, color } =
                        EVENT_TYPES[ev.event_type ?? "service"] ?? EVENT_TYPES.other;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:border-[#C9A84C]/30 ${
                            selectedEvent?.id === ev.id
                              ? "border-[#C9A84C]/50 shadow-md"
                              : "border-gray-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-[#0A0A0A]">
                                  {ev.title ?? ev.name}
                                </h3>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}
                                >
                                  {label}
                                </span>
                                {ev.is_public !== false && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                                    Public
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-[#9CA3AF]">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {format(
                                    new Date(ev.start_date ?? ev.date ?? ""),
                                    "MMM d, yyyy · h:mm a"
                                  )}
                                </span>
                                {ev.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {ev.location}
                                  </span>
                                )}
                                {ev.rsvp_enabled !== false && (
                                  <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {getRsvpCount(ev.id)} RSVPs
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingEvent(ev);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(ev.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div
                            className="mt-3 pt-3 border-t border-gray-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GoogleCalendarSync event={ev} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">
                    Past Events
                  </p>
                  <div className="space-y-2">
                    {past.slice(0, 5).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`bg-white rounded-xl border px-4 py-3 flex items-center justify-between gap-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity ${
                          selectedEvent?.id === ev.id
                            ? "border-[#C9A84C]/30"
                            : "border-gray-100"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#0A0A0A]">
                            {ev.title ?? ev.name}
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            {format(new Date(ev.start_date ?? ev.date ?? ""), "MMM d, yyyy")}
                          </p>
                        </div>
                        <span className="text-xs text-[#9CA3AF]">
                          {getRsvpCount(ev.id)} attended
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">
              <h3 className="font-bold text-[#0A0A0A] mb-1">
                {selectedEvent.title ?? selectedEvent.name}
              </h3>
              <p className="text-xs text-[#9CA3AF] mb-4">
                {format(
                  new Date(selectedEvent.start_date ?? selectedEvent.date ?? ""),
                  "EEEE, MMMM d · h:mm a"
                )}
              </p>
              {selectedEvent.description && (
                <p className="text-sm text-[#6B7280] mb-3 leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}
              <div className="mb-4">
                <GoogleCalendarSync event={selectedEvent} />
              </div>
              <div className="border-t border-gray-50 pt-4">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">
                  RSVPs ({selectedRsvps.length})
                </p>
                {selectedRsvps.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] text-center py-4">No RSVPs yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedRsvps.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-[#374151] font-medium">
                          {r.guest_name || r.guest_email}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            r.status === "attending"
                              ? "bg-green-50 text-green-700"
                              : r.status === "maybe"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#FDFAF5] border border-[#E8D5A3]/30 rounded-2xl p-6 text-center">
              <Calendar size={28} className="text-[#C9A84C]/40 mx-auto mb-2" />
              <p className="text-sm text-[#9CA3AF]">Select an event to view RSVPs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
