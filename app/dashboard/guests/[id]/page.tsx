"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GuestAPI, CareNoteAPI, UserAPI } from "@/lib/apiClient";
import { apiFetch } from "@/lib/apiClient";
import VolunteerAssigner from "@/components/volunteers/VolunteerAssigner";
import { ArrowLeft, Loader2, AlertTriangle, Trash2 } from "lucide-react";

const stageLabels: Record<string, string> = {
  stage_1_welcome: "Stage 1: Welcome",
  stage_2_connect: "Stage 2: Connect",
  stage_3_grow: "Stage 3: Grow",
  stage_4_serve: "Stage 4: Serve",
  stage_5_belong: "Stage 5: Belong",
};

const stages = ["stage_1_welcome", "stage_2_connect", "stage_3_grow", "stage_4_serve", "stage_5_belong"];

type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  spiritual_background?: string;
  family_status?: string;
  status: string;
  journey_stage: string;
  is_at_risk?: boolean;
  assigned_volunteer?: string;
};

type Note = { id: string; content: string; note_type?: string; outcome?: string; created_date?: string };

export default function GuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guestId = params?.id as string | undefined;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [volunteers, setVolunteers] = useState<Array<{ full_name?: string; email?: string; role?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [noteForm, setNoteForm] = useState({ content: "", note_type: "call", outcome: "connected" });
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    if (!guestId) return;
    const load = async () => {
      try {
        const [g, n, users] = await Promise.all([
          GuestAPI.filter({ id: guestId }),
          CareNoteAPI.list(guestId),
          UserAPI.list(),
        ]);
        const guestData = Array.isArray(g) ? g[0] : g;
        if (guestData) {
          setGuest(guestData as Guest);
          setEditForm(guestData as unknown as Record<string, string | boolean>);
        }
        setNotes(
          (n as Note[]).map((note) => {
            const meta = parseNoteMeta(note.content);
            return {
              ...note,
              note_type: meta.note_type,
              outcome: meta.outcome,
              created_date: (note as { createdAt?: string })?.createdAt,
            };
          })
        );
        setVolunteers(users as Array<{ full_name?: string; email?: string; role?: string }>);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [guestId]);

  function parseNoteMeta(content: string): { note_type: string; outcome: string } {
    const match = content.match(/\[([^,\]]+),\s*([^\]]+)\]/);
    if (match) return { note_type: match[1], outcome: match[2] };
    return { note_type: "other", outcome: "connected" };
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest || !guestId) return;
    setSavingNote(true);
    setNoteSaved(false);
    try {
      const fullContent = `[${noteForm.note_type}, ${noteForm.outcome}] ${noteForm.content}`;
      const note = await CareNoteAPI.create({
        content: fullContent,
        guestId,
        guestName: `${guest.first_name} ${guest.last_name}`,
      });
      const created = note as { id: string; content: string; createdAt?: string };
      setNotes([
        { id: created.id, content: created.content, note_type: noteForm.note_type, outcome: noteForm.outcome, created_date: created.createdAt },
        ...notes,
      ]);
      setNoteForm({ content: "", note_type: "call", outcome: "connected" });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
    } catch {
      setNoteSaved(false);
    } finally {
      setSavingNote(false);
    }
  };

  const advanceStage = async () => {
    if (!guest) return;
    const currentIdx = stages.indexOf(guest.journey_stage);
    if (currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1];
      const updated = await GuestAPI.update(guestId!, { journey_stage: nextStage }) as Guest;
      setGuest(updated);
    }
  };

  const toggleAtRisk = async () => {
    if (!guest) return;
    const updated = await GuestAPI.update(guestId!, { is_at_risk: !guest.is_at_risk }) as Guest;
    setGuest(updated);
  };

  const saveEdit = async () => {
    if (!guest) return;
    const updated = await GuestAPI.update(guestId!, editForm) as Guest;
    setGuest(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!guest || !guestId) return;
    if (!confirm(`Delete ${guest.first_name} ${guest.last_name}? This will remove their profile, care notes, and tasks. This cannot be undone.`)) return;
    try {
      await GuestAPI.delete(guestId);
      router.push("/dashboard/guests");
    } catch (err) {
      alert((err as Error).message || "Failed to delete guest");
    }
  };

  const generateMessage = async () => {
    if (!guest) return;
    setGenerating(true);
    try {
      const result = (await apiFetch("/api/ai/generate-message", {
        method: "POST",
        body: JSON.stringify({
          firstName: guest.first_name,
          lastName: guest.last_name,
          journeyStage: stageLabels[guest.journey_stage] ?? guest.journey_stage,
          spiritualBackground: guest.spiritual_background ?? "unknown",
          familyStatus: guest.family_status ?? "unknown",
        }),
      })) as { message?: string };
      setGeneratedMessage(result.message ?? "");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#C9A84C]" size={24} />
      </div>
    );
  }
  if (!guest) {
    return (
      <div className="py-20 text-center text-[#9CA3AF]">
        Guest not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full">
      <Link href="/dashboard/guests" className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#0A0A0A] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to People
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#C9A84C]/15 flex items-center justify-center text-lg sm:text-xl font-bold text-[#A07830] flex-shrink-0">
            {guest.first_name?.[0]}
            {guest.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
                    {guest.first_name} {guest.last_name}
                  </h1>
                  {guest.is_at_risk && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                      <AlertTriangle size={11} /> At Risk
                    </span>
                  )}
                </div>
                <p className="text-[#9CA3AF] text-xs sm:text-sm">
                  {guest.email} {guest.phone && `· ${guest.phone}`}
                </p>
                <p className="text-[#C9A84C] text-xs sm:text-sm font-medium mt-0.5">{stageLabels[guest.journey_stage]}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={toggleAtRisk} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${guest.is_at_risk ? "bg-[#C9A84C]/20 text-[#A07830] hover:bg-[#C9A84C]/30" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                  {guest.is_at_risk ? "Clear Risk" : "Flag Risk"}
                </button>
                <button onClick={() => setEditing(!editing)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-[#6B7280] hover:bg-gray-200 transition-all">
                  {editing ? "Cancel" : "Edit"}
                </button>
                <button onClick={handleDelete} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "first_name", label: "First Name" },
                { key: "last_name", label: "Last Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "next_followup_date", label: "Follow-up Date", type: "date" },
                { key: "assigned_volunteer", label: "Assigned Volunteer" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">{label}</label>
                  <input
                    type={type ?? "text"}
                    value={String(editForm[key] ?? "")}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select value={String(editForm.status ?? "")} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
                {["new_visitor", "returning_visitor", "connected", "member", "at_risk", "inactive"].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <select value={String(editForm.journey_stage ?? "")} onChange={(e) => setEditForm({ ...editForm, journey_stage: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {stageLabels[s]}
                  </option>
                ))}
              </select>
              <button onClick={saveEdit} className="col-span-2 py-2.5 rounded-lg bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all">
                Save Changes
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#0A0A0A]">Journey Progress</p>
            {stages.indexOf(guest.journey_stage) < stages.length - 1 && (
              <button onClick={advanceStage} className="text-xs font-semibold text-[#C9A84C] hover:text-[#A07830] transition-colors">
                Advance Stage →
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {stages.map((s, i) => {
              const currentIdx = stages.indexOf(guest.journey_stage);
              return <div key={s} className={`flex-1 h-2 rounded-full transition-all ${i <= currentIdx ? "bg-[#C9A84C]" : "bg-gray-100"}`} />;
            })}
          </div>
          <div className="flex justify-between mt-1">
            {stages.map((s) => (
              <p key={s} className="text-xs text-[#9CA3AF] flex-1 text-center">
                {stageLabels[s].split(": ")[1]}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#0A0A0A] mb-2">👤 Assigned Volunteer</h2>
          <p className="text-sm text-[#6B7280] mb-3">{guest.assigned_volunteer ?? "No volunteer assigned yet"}</p>
          <VolunteerAssigner guest={guest} volunteers={volunteers} onAssigned={(name) => setGuest({ ...guest, assigned_volunteer: name })} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#0A0A0A] mb-3">🤖 AI Care Message</h2>
          <p className="text-sm text-[#9CA3AF] mb-4">
            Generate a personalized follow-up message for {guest.first_name}.
          </p>
          <button onClick={generateMessage} disabled={generating} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60 mb-4">
            {generating ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Generating...
              </>
            ) : (
              "Generate Message"
            )}
          </button>
          {generatedMessage && (
            <div className="bg-[#FDFAF5] border border-[#E8D5A3]/50 rounded-xl p-4">
              <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{generatedMessage}</p>
              <button onClick={() => navigator.clipboard?.writeText(generatedMessage)} className="mt-3 text-xs text-[#C9A84C] font-semibold hover:text-[#A07830]">
                Copy Message
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#0A0A0A] mb-4">📋 Add Care Note</h2>
          <form onSubmit={addNote} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select value={noteForm.note_type} onChange={(e) => setNoteForm({ ...noteForm, note_type: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
                {["call", "text", "email", "visit", "prayer", "other"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select value={noteForm.outcome} onChange={(e) => setNoteForm({ ...noteForm, outcome: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
                {["connected", "no_answer", "left_voicemail", "responded", "needs_followup"].map((o) => (
                  <option key={o} value={o}>
                    {o.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <textarea placeholder="Note details..." required value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] h-24 resize-none" />
            {noteSaved && <p className="text-sm text-[#A07830] font-medium">✓ Note saved!</p>}
            <button type="submit" disabled={savingNote} className="w-full py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all disabled:opacity-60">
              {savingNote ? "Saving..." : "Add Note"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-[#0A0A0A] mb-5">Care Timeline</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] text-center py-6">No care notes yet. Add the first one above.</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-xs">
                    {note.note_type === "call" ? "📞" : note.note_type === "email" ? "✉️" : note.note_type === "text" ? "💬" : note.note_type === "prayer" ? "🙏" : "📋"}
                  </div>
                  <div className="w-px flex-1 bg-gray-100 mt-2" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#0A0A0A] capitalize">{note.note_type ?? "note"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${note.outcome === "connected" || note.outcome === "responded" ? "bg-[#C9A84C]/20 text-[#A07830]" : "bg-gray-100 text-[#9CA3AF]"}`}>{note.outcome?.replace(/_/g, " ")}</span>
                    <span className="text-xs text-[#9CA3AF] ml-auto">{note.created_date?.split("T")[0]}</span>
                  </div>
                  <p className="text-sm text-[#374151]">{note.content.replace(/^\[Guest: [^\]]+\]\s*/, "")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
