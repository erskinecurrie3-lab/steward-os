"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GuestAPI, CareNoteAPI, TaskAPI } from "@/lib/apiClient";
import { useChurchContext } from "@/lib/useChurchContext";
import AIFollowUpGenerator from "@/components/ai/AIFollowUpGenerator";
import { AlertTriangle, Users, TrendingUp, Calendar, ArrowRight, CheckCircle } from "lucide-react";

type UIGuest = {
  id: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  journey_stage?: string;
  is_at_risk?: boolean;
  next_followup_date?: string | null;
};

export default function DashboardPage() {
  const ctx = useChurchContext();
  const churchId = ctx.churchId || null;
  const [guests, setGuests] = useState<UIGuest[]>([]);
  const [, setCareNotes] = useState<unknown[]>([]);
  const [tasks, setTasks] = useState<Array<{ guestId?: string | null; dueDate?: string | null; status?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!churchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      GuestAPI.list(churchId),
      CareNoteAPI.listAll(),
      TaskAPI.list(churchId),
    ])
      .then(([g, n, t]) => {
        setGuests(Array.isArray(g) ? (g as UIGuest[]) : []);
        setCareNotes(Array.isArray(n) ? n : []);
        const taskList = Array.isArray(t) ? t : [];
        setTasks(taskList as Array<{ guestId?: string | null; dueDate?: string | null; status?: string }>);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [churchId]);

  const now = new Date();
  const atRiskGuests = guests.filter((g) => g.is_at_risk);
  const newVisitors = guests.filter((g) => g.status === "new_visitor");
  const overdueGuestIds = new Set(
    tasks
      .filter((t) => t.status === "pending" && t.dueDate && new Date(t.dueDate) <= now)
      .map((t) => t.guestId)
      .filter(Boolean)
  );
  const needsFollowup = guests.filter((g) => overdueGuestIds.has(g.id));

  const stageGroups = {
    stage_1_welcome: guests.filter((g) => g.journey_stage === "stage_1_welcome").length,
    stage_2_connect: guests.filter((g) => g.journey_stage === "stage_2_connect").length,
    stage_3_grow: guests.filter((g) => g.journey_stage === "stage_3_grow").length,
    stage_4_serve: guests.filter((g) => g.journey_stage === "stage_4_serve").length,
    stage_5_belong: guests.filter((g) => g.journey_stage === "stage_5_belong").length,
  };

  const stageColors: Record<string, string> = {
    stage_1_welcome: "bg-[#C9A84C]",
    stage_2_connect: "bg-[#C9A84C]",
    stage_3_grow: "bg-[#C9A84C]",
    stage_4_serve: "bg-[#A07830]",
    stage_5_belong: "bg-[#8B6914]",
  };

  const stageLabels: Record<string, string> = {
    stage_1_welcome: "Welcome",
    stage_2_connect: "Connect",
    stage_3_grow: "Grow",
    stage_4_serve: "Serve",
    stage_5_belong: "Belong",
  };

  const displayName = "there";

  return (
    <div className="max-w-6xl w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-1">
          Good morning{displayName ? `, ${displayName}` : ""}. 👋
        </h1>
        <p className="text-[#9CA3AF] text-sm">Here&apos;s your church care overview for today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {[
          { label: "Total Guests", value: loading ? "—" : guests.length, icon: Users, color: "text-[#A07830]", bg: "bg-[#C9A84C]/10" },
          { label: "New This Week", value: loading ? "—" : newVisitors.length, icon: TrendingUp, color: "text-[#A07830]", bg: "bg-[#C9A84C]/10" },
          { label: "Follow-Ups Due", value: loading ? "—" : needsFollowup.length, icon: Calendar, color: "text-[#A07830]", bg: "bg-[#C9A84C]/10" },
          { label: "At-Risk Alerts", value: loading ? "—" : atRiskGuests.length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-[#9CA3AF] font-medium">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={15} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-[#0A0A0A]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#0A0A0A]">Visitor Journey Pipeline</h2>
            <Link href="/dashboard/guests" className="text-xs text-[#C9A84C] font-semibold hover:text-[#A07830]">View all →</Link>
          </div>
          <div className="flex gap-3">
            {Object.entries(stageGroups).map(([stage, count]) => {
              const total = guests.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stage} className="flex-1 text-center">
                  <div className="relative h-20 bg-gray-50 rounded-lg overflow-hidden mb-2">
                    <div className={`absolute bottom-0 left-0 right-0 ${stageColors[stage]} transition-all duration-500`} style={{ height: `${Math.max(pct, 8)}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white drop-shadow">{count}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#9CA3AF] leading-tight">{stageLabels[stage]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0A0A0A]">⚠️ At-Risk Guests</h2>
          </div>
          {loading ? (
            <p className="text-sm text-[#9CA3AF]">Loading...</p>
          ) : atRiskGuests.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle size={32} className="text-[#C9A84C] mx-auto mb-2" />
              <p className="text-sm text-[#6B7280]">No at-risk guests right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskGuests.slice(0, 5).map((g) => (
                <Link key={g.id} href={`/dashboard/guests/${g.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-xs font-bold text-red-500">
                    {g.first_name?.[0]}{g.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{g.first_name} {g.last_name}</p>
                    <p className="text-xs text-[#9CA3AF]">Last seen: Unknown</p>
                  </div>
                  <ArrowRight size={14} className="text-[#9CA3AF] flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {!loading && churchId && <div className="mb-4 lg:mb-6"><AIFollowUpGenerator churchId={churchId} /></div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[#0A0A0A]">📅 Priority Follow-Ups This Week</h2>
          <Link href="/dashboard/guests" className="text-xs text-[#C9A84C] font-semibold hover:text-[#A07830]">All guests →</Link>
        </div>
        {loading ? (
          <p className="text-sm text-[#9CA3AF]">Loading...</p>
        ) : needsFollowup.length === 0 ? (
          <p className="text-sm text-[#6B7280] py-4 text-center">All follow-ups are on track. Great work! ✓</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {needsFollowup.slice(0, 6).map((g) => (
              <Link key={g.id} href={`/dashboard/guests/${g.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFAF5] border border-[#E8D5A3]/30 hover:border-[#C9A84C]/40 transition-all">
                <div className="w-9 h-9 rounded-full bg-[#C9A84C]/15 flex items-center justify-center font-bold text-[#A07830] text-sm">
                  {g.first_name?.[0]}{g.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0A0A0A] truncate">{g.first_name} {g.last_name}</p>
                  <p className="text-xs text-[#9CA3AF] capitalize">{g.journey_stage?.replace(/_/g, " ")}</p>
                </div>
                <span className="text-xs text-[#C9A84C] font-semibold flex-shrink-0">Due</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
