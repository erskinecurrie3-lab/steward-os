"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { GuestAPI } from "@/lib/apiClient";

type Volunteer = { full_name?: string; email?: string; role?: string };
type Guest = { id: string; first_name?: string; last_name?: string; status?: string; journey_stage?: string; spiritual_background?: string; family_status?: string; is_at_risk?: boolean; notes?: string };

type VolunteerAssignerProps = {
  guest: Guest;
  volunteers: Volunteer[];
  onAssigned: (name: string) => void;
};

export default function VolunteerAssigner({ guest, volunteers, onAssigned }: VolunteerAssignerProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ volunteer_email: string; volunteer_name: string; fit_score: number; reason: string }>>([]);
  const [shown, setShown] = useState(false);

  const getSuggestions = async () => {
    if (!volunteers?.length) return;
    setLoading(true);
    setShown(true);

    try {
      const result = await apiFetch("/api/ai/volunteer-suggestions", {
        method: "POST",
        body: JSON.stringify({ guest, volunteers }),
      }) as { suggestions?: Array<{ volunteer_email: string; volunteer_name: string; fit_score: number; reason: string }> };
      setSuggestions(result.suggestions ?? []);
    } catch {
      setSuggestions([]);
    }
    setLoading(false);
  };

  const assign = async (volunteerName: string) => {
    await GuestAPI.update(guest.id, { assigned_volunteer: volunteerName });
    onAssigned(volunteerName);
    setShown(false);
    setSuggestions([]);
  };

  return (
    <div className="mt-2">
      <button
        onClick={getSuggestions}
        disabled={loading || !volunteers?.length}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A84C]/20 text-[#A07830] text-xs font-semibold hover:bg-[#C9A84C]/30 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
        AI Match Volunteer
      </button>

      {shown && !loading && suggestions.length > 0 && (
        <div className="mt-2 space-y-2 border border-[#E8D5A3]/50 rounded-xl p-3 bg-[#C9A84C]/10">
          <p className="text-xs font-semibold text-[#A07830] mb-1">AI Suggested Matches:</p>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-white border border-[#E8D5A3]/50 rounded-lg p-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-xs font-bold text-[#A07830] flex-shrink-0">
                {s.volunteer_name?.[0] ?? "V"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0A0A0A]">{s.volunteer_name}</p>
                <p className="text-xs text-[#6B7280]">{s.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#A07830]">{s.fit_score}/10</span>
                <button
                  onClick={() => assign(s.volunteer_name)}
                  className="px-2 py-1 rounded-lg bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-[#1A1A1A] transition-all"
                >
                  Assign
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setShown(false)} className="text-xs text-gray-400 hover:text-gray-600">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
