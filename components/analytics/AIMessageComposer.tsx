"use client";

import { useState } from "react";
import { Wand2, Loader2, Copy } from "lucide-react";

type Guest = {
  id: string;
  name?: string;
  email?: string | null;
  first_name?: string;
  last_name?: string;
  journey_stage?: string;
  journeyStage?: string;
  spiritualBackground?: string;
  familyStatus?: string;
};

type Props = { guests: Guest[] };

export default function AIMessageComposer({ guests }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const guest = guests.find((g) => g.id === selectedId);
  const [firstName = "", ...rest] = (guest?.name || `${guest?.first_name || ""} ${guest?.last_name || ""}`.trim() || "").split(/\s+/);
  const lastName = rest.join(" ") || guest?.last_name || "";
  const journeyStage = guest?.journey_stage || guest?.journeyStage || "stage_1_welcome";

  const handleGenerate = async () => {
    if (!guest) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName || "Guest",
          lastName,
          journeyStage,
          spiritualBackground: guest.spiritualBackground || "unknown",
          familyStatus: guest.familyStatus || "unknown",
        }),
        credentials: "include",
      });
      const data = await res.json();
      setMessage(data.message || "Failed to generate");
    } catch {
      setMessage("Failed to generate message.");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = () => {
    if (message) navigator.clipboard?.writeText(message);
  };

  const displayName = (g: Guest) =>
    g.name || `${g.first_name || ""} ${g.last_name || ""}`.trim() || "Unknown";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#0A0A0A] mb-3">AI Message Composer</h3>
      <p className="text-sm text-[#9CA3AF] mb-4">Generate personalized follow-up messages for guests</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="">Select a guest...</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>
              {displayName(g)}
              {g.email ? ` (${g.email})` : ""}
            </option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedId}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      {message && (
        <div className="bg-[#F8F8F7] rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{message}</p>
          <button
            onClick={copyMessage}
            className="mt-3 flex items-center gap-1.5 text-xs text-[#C9A84C] font-semibold hover:text-[#A07830]"
          >
            <Copy size={12} /> Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}
