"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { CareNoteAPI } from "@/lib/apiClient";
import { CheckCircle, Clock, AlertTriangle, User, Calendar, Loader2 } from "lucide-react";

const stageLabels: Record<string, string> = {
  stage_1_welcome: "Welcome",
  stage_2_connect: "Connect",
  stage_3_grow: "Grow",
  stage_4_serve: "Serve",
  stage_5_belong: "Belong",
};

export default function VolunteerPortalPage() {
  const { user } = useUser();
  const [myGuests, setMyGuests] = useState<Array<{ id: string; firstName?: string; lastName?: string; name?: string; email?: string; isAtRisk?: boolean; journey_stage?: string; journeyStage?: string; next_followup_date?: string }>>([]);
  const [notesCount, setNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guests", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const guests = Array.isArray(data) ? data : [];
        const volunteerName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "";
        const assigned = guests.filter(
          (g: { assignedVolunteer?: string; isAtRisk?: boolean }) =>
            g.assignedVolunteer === volunteerName || g.isAtRisk
        );
        const withNames = (assigned.length > 0 ? assigned : guests.slice(0, 10)).map((g: { name?: string; id: string; email?: string; isAtRisk?: boolean; journeyStage?: string }) => {
          const [first, ...rest] = (g.name || "").split(/\s+/);
          return { ...g, firstName: first, lastName: rest.join(" ") };
        });
        setMyGuests(withNames);
        return withNames;
      })
      .then(async (withNames: Array<{ id: string }>) => {
        if (withNames.length === 0) return;
        let count = 0;
        await Promise.all(withNames.map((g) => CareNoteAPI.list(g.id).then((n) => { count += Array.isArray(n) ? n.length : 0; }).catch(() => {})));
        setNotesCount(count);
      })
      .catch(() => setMyGuests([]))
      .finally(() => setLoading(false));
  }, [user]);

  const followupGuests = myGuests.filter((g) => (g as { next_followup_date?: string }).next_followup_date && new Date((g as { next_followup_date?: string }).next_followup_date!) <= new Date());
  const urgentGuests = myGuests.filter((g) => (g as { isAtRisk?: boolean }).isAtRisk);

  return (
    <div className="max-w-5xl w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Volunteer Portal</h1>
        <p className="text-sm text-[#9CA3AF]">
          {loading ? "Loading..." : `${myGuests.length} guests assigned to you · ${urgentGuests.length} urgent`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-6">
        {[
          { label: "Assigned Guests", value: myGuests.length, icon: User, color: "text-[#A07830]", bg: "bg-[#C9A84C]/10" },
          { label: "Follow-Ups Due", value: followupGuests.length, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Urgent / At-Risk", value: urgentGuests.length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
          { label: "Notes Logged", value: notesCount, icon: CheckCircle, color: "text-[#A07830]", bg: "bg-[#C9A84C]/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-[#9CA3AF]">{s.label}</p>
              <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={14} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
        </div>
      ) : myGuests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle size={36} className="text-[#C9A84C] mx-auto mb-3" />
          <p className="font-semibold text-[#0A0A0A]">No guests assigned yet.</p>
          <p className="text-sm text-[#9CA3AF]">Your pastor will assign guests to you shortly.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myGuests.map((guest) => (
            <div
              key={guest.id}
              className={`bg-white rounded-xl border shadow-sm p-4 ${(guest as { isAtRisk?: boolean }).isAtRisk ? "border-red-100" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    (guest as { isAtRisk?: boolean }).isAtRisk ? "bg-red-50 text-red-500" : "bg-[#C9A84C]/15 text-[#A07830]"
                  }`}
                >
                  {guest.firstName?.[0]}
                  {guest.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#0A0A0A] text-sm">
                      {guest.firstName} {guest.lastName}
                    </p>
                    {(guest as { isAtRisk?: boolean }).isAtRisk && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold flex items-center gap-1">
                        <AlertTriangle size={10} /> At-Risk
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-[#6B7280] font-medium capitalize">
                      {stageLabels[(guest as { journeyStage?: string }).journeyStage ?? ""] ?? "Guest"}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-0.5 text-xs text-[#9CA3AF]">
                    {guest.email && <span>{guest.email}</span>}
                    {(guest as { next_followup_date?: string }).next_followup_date && (
                      <span className={new Date((guest as { next_followup_date?: string }).next_followup_date!) <= new Date() ? "font-semibold text-amber-600" : ""}>
                        Follow-up: {(guest as { next_followup_date?: string }).next_followup_date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/dashboard/guests/${guest.id}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#C9A84C]/10 text-[#A07830] hover:bg-[#C9A84C]/20 transition-all">
                    Log Note
                  </Link>
                  <Link href={`/dashboard/guests/${guest.id}`} className="text-xs font-semibold text-[#9CA3AF] hover:text-[#6B7280]">
                    →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-[#FDFAF5] border border-[#E8D5A3]/40 rounded-2xl p-4 flex items-start gap-3">
        <Clock size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#6B7280] leading-relaxed">
          <strong className="text-[#0A0A0A]">AI Fallback:</strong> When you decline or miss a task for 24+ hours, AI automatically steps in to send a personalized message on your behalf.
        </p>
      </div>
    </div>
  );
}
