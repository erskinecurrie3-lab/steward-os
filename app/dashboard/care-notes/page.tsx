"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CareNoteAPI } from "@/lib/apiClient";
import { Search, Trash2 } from "lucide-react";
import CareNotesAIAssistant from "@/components/ai/CareNotesAIAssistant";

const noteTypeIcons: Record<string, string> = {
  call: "📞",
  text: "💬",
  email: "✉️",
  visit: "🤝",
  prayer: "🙏",
  other: "📋",
};
const outcomeColors: Record<string, string> = {
  connected: "bg-green-50 text-green-700",
  responded: "bg-green-50 text-green-700",
  no_answer: "bg-gray-100 text-gray-500",
  left_voicemail: "bg-blue-50 text-blue-600",
  needs_followup: "bg-amber-50 text-amber-700",
};

function parseNoteMeta(content: string): { guest_name?: string; note_type?: string; outcome?: string } {
  const guestMatch = content.match(/\[Guest: ([^\]]+)\]/);
  const metaMatch = content.match(/\[([^,\]]+),\s*([^\]]+)\]/);
  return {
    guest_name: guestMatch?.[1],
    note_type: metaMatch?.[1] ?? "other",
    outcome: metaMatch?.[2] ?? "connected",
  };
}

type Note = {
  id: string;
  content: string;
  createdAt?: string;
  guest_id?: string | null;
  guest_name?: string | null;
};

export default function CareNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    CareNoteAPI.listAll()
      .then((n) => setNotes((Array.isArray(n) ? n : []) as Note[]))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  const enriched = notes.map((n) => {
    const meta = parseNoteMeta(n.content);
    const cleanContent = n.content
      .replace(/^\[Guest: [^\]]+\]\s*\[[^\]]+\]\s*/, "")
      .replace(/^\[Guest: [^\]]+\]\s*/, "");
    return {
      ...n,
      ...meta,
      guest_name: n.guest_name ?? meta.guest_name,
      content: cleanContent,
    };
  });

  const filtered = enriched.filter((n) => `${n.guest_name ?? ""} ${n.content} ${n.note_type ?? ""}`.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this care note? This cannot be undone.")) return;
    try {
      await CareNoteAPI.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert((err as Error).message || "Failed to delete note");
    }
  };

  return (
    <div className="max-w-4xl w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Care Notes</h1>
        <p className="text-sm text-[#9CA3AF]">Complete timeline of all care interactions</p>
      </div>

      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
        <CareNotesAIAssistant />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-40 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF] text-sm">
            {search ? "No notes match your search." : "No care notes yet. Add notes from a guest's profile."}
          </div>
        ) : (
          filtered.map((note) => (
            <div key={note.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:border-[#C9A84C]/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F8F8F7] flex items-center justify-center text-base flex-shrink-0">
                  {noteTypeIcons[note.note_type ?? "other"] ?? "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {note.guest_id ? (
                        <Link
                          href={`/dashboard/guests/${note.guest_id}`}
                          className="font-semibold text-[#0A0A0A] text-sm hover:text-[#C9A84C] transition-colors"
                        >
                          {note.guest_name ?? "Guest"}
                        </Link>
                      ) : note.guest_name ? (
                        <span className="font-semibold text-[#0A0A0A] text-sm">{note.guest_name}</span>
                      ) : (
                        <span className="font-semibold text-[#0A0A0A] text-sm">Unknown guest</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${outcomeColors[note.outcome ?? "connected"] ?? "bg-gray-100 text-gray-500"}`}>
                        {(note.outcome ?? "connected").replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-[#9CA3AF] capitalize">{note.note_type ?? "note"}</span>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#374151] leading-relaxed">{note.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-[#9CA3AF]">{(note as { createdAt?: string }).createdAt?.split("T")[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
