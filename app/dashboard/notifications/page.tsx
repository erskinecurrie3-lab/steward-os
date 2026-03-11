"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, UserCheck, Calendar, TrendingDown, CheckCircle, Loader2 } from "lucide-react";

const NOTIFICATION_TYPES: Record<
  string,
  { label: string; icon: typeof Bell; color: string; bg: string }
> = {
  at_risk: { label: "At-Risk Alert", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 border-red-100" },
  milestone: { label: "Journey Milestone", icon: UserCheck, color: "text-green-600", bg: "bg-green-50 border-green-100" },
  followup_due: { label: "Follow-Up Due", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  disengagement: { label: "Disengagement Signal", icon: TrendingDown, color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
};

type Guest = {
  id: string;
  name?: string;
  status?: string;
  journeyStage?: string;
  isAtRisk?: boolean;
  lastSeen?: string | null;
  createdAt: string;
};

type CareNote = { guestId?: string | null };
type Task = { id: string; guestId?: string | null; dueDate?: string | null; status?: string; guestName?: string };

type Alert = {
  id: string;
  type: string;
  guest_id?: string;
  guest_name?: string;
  message: string;
  priority: string;
  timestamp?: string;
  isNew?: boolean;
};

type AIInsight = { type: string; title: string; body: string; priority?: number };

export default function NotificationsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [careNotes, setCareNotes] = useState<CareNote[]>([]);
  const [, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[] | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, nRes, tRes] = await Promise.all([
          fetch("/api/guests", { credentials: "include" }),
          fetch("/api/care-notes", { credentials: "include" }),
          fetch("/api/tasks", { credentials: "include" }),
        ]);
        const [g, n, t] = await Promise.all([
          gRes.json().then((d) => (Array.isArray(d) ? d : [])),
          nRes.json().then((d) => (Array.isArray(d) ? d : [])),
          tRes.json().then((d) => (Array.isArray(d) ? d : [])),
        ]);
        setGuests(g);
        setCareNotes(n);
        setTasks(t);

        const now = new Date();
        const built: Alert[] = [];

        g.forEach((guest: Guest) => {
          const name = guest.name?.trim() || "Guest";

          if (guest.isAtRisk) {
            const lastSeen = guest.lastSeen
              ? new Date(guest.lastSeen).toLocaleDateString("en-US")
              : "unknown";
            built.push({
              id: `risk_${guest.id}`,
              type: "at_risk",
              guest_id: guest.id,
              guest_name: name,
              message: `${name} has been flagged at-risk. Last seen: ${lastSeen}`,
              priority: "high",
              timestamp: guest.createdAt,
            });
          }

          if (
            guest.status === "connected" &&
            guest.journeyStage === "stage_3_grow"
          ) {
            built.push({
              id: `milestone_${guest.id}`,
              type: "milestone",
              guest_id: guest.id,
              guest_name: name,
              message: `${name} has reached Stage 3: Grow — a great moment to invite them deeper.`,
              priority: "low",
              timestamp: guest.createdAt,
            });
          }

          if (guest.status === "new_visitor" && guest.createdAt) {
            const visitDate = new Date(guest.createdAt);
            const daysSince = Math.floor(
              (now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const hasNote = n.some(
              (note: CareNote) => note.guestId === guest.id
            );
            if (daysSince > 14 && !hasNote) {
              built.push({
                id: `disengage_${guest.id}`,
                type: "disengagement",
                guest_id: guest.id,
                guest_name: name,
                message: `${name} visited ${daysSince} days ago and has no care notes. Likely to disengage.`,
                priority: "high",
                timestamp: guest.createdAt,
              });
            }
          }
        });

        (t as Task[]).forEach((task) => {
          if (
            task.status === "pending" &&
            task.dueDate &&
            new Date(task.dueDate) <= now &&
            task.guestId
          ) {
            const guest = g.find((x: Guest) => x.id === task.guestId);
            const guestName = guest?.name || task.guestName || "Guest";
            built.push({
              id: `followup_${task.guestId}_${task.id}`,
              type: "followup_due",
              guest_id: task.guestId,
              guest_name: guestName,
              message: `Follow-up with ${guestName} is overdue (due: ${new Date(task.dueDate).toLocaleDateString("en-US")})`,
              priority: "medium",
              timestamp: task.dueDate,
            });
          }
        });

        const priorityOrder: Record<string, number> = {
          high: 0,
          medium: 1,
          low: 2,
        };
        built.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        setAlerts(built);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    setAiInsights(null);
    const atRisk = guests.filter((g) => g.isAtRisk).length;
    const noNotes = guests.filter(
      (g) => !careNotes.some((n) => n.guestId === g.id)
    ).length;
    const statusBreakdown = guests.reduce(
      (a, g) => {
        const s = g.status || "new_visitor";
        a[s] = (a[s] || 0) + 1;
        return a;
      },
      {} as Record<string, number>
    );
    const stageBreakdown = guests.reduce(
      (a, g) => {
        const s = g.journeyStage || "stage_1_welcome";
        a[s] = (a[s] || 0) + 1;
        return a;
      },
      {} as Record<string, number>
    );
    const summary = [
      `Total guests: ${guests.length}`,
      `At-risk: ${atRisk}`,
      `Guests with no care notes: ${noNotes}`,
      `Care notes: ${careNotes.length}`,
      `Status: ${JSON.stringify(statusBreakdown)}`,
      `Stages: ${JSON.stringify(stageBreakdown)}`,
    ].join("\n");

    try {
      const res = await fetch("/api/ai/analytics-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
        credentials: "include",
      });
      const data = await res.json();
      const rawInsights = data.insights || [];
      setAiInsights(
        rawInsights.map((s: string) => ({
          type: "action",
          title: "Insight",
          body: s,
          priority: 1,
        }))
      );
    } catch {
      setAiInsights([
        {
          type: "warning",
          title: "Error",
          body: "Failed to generate insights.",
          priority: 1,
        },
      ]);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const dismiss = (id: string) =>
    setDismissed((prev) => new Set([...prev, id]));
  const markAllRead = () => setDismissed(new Set(alerts.map((a) => a.id)));

  const visibleAlerts = alerts.filter(
    (a) =>
      !dismissed.has(a.id) &&
      (filter === "all" ||
        a.type === filter ||
        (filter === "high" && a.priority === "high"))
  );

  const insightIcons: Record<string, string> = {
    warning: "⚠️",
    opportunity: "🌱",
    celebration: "🎉",
    action: "⚡",
  };
  const insightColors: Record<string, string> = {
    warning: "border-red-100 bg-red-50",
    opportunity: "border-[#E8D5A3]/50 bg-[#FDFAF5]",
    celebration: "border-green-100 bg-green-50",
    action: "border-blue-100 bg-blue-50",
  };

  return (
    <div className="max-w-5xl w-full">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF]">
            Real-time care alerts and disengagement signals
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={generateAIInsights}
            disabled={generatingInsights || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C9A84C]/10 text-[#A07830] font-semibold text-sm hover:bg-[#C9A84C]/20 transition-all disabled:opacity-60"
          >
            {generatingInsights ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "✦"
            )}
            <span className="hidden sm:inline">AI Insights</span>
          </button>
          {visibleAlerts.length > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-2 rounded-xl bg-gray-100 text-[#6B7280] font-semibold text-sm hover:bg-gray-200 transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-6">
        {[
          {
            type: "all",
            label: "All Alerts",
            count: alerts.filter((a) => !dismissed.has(a.id)).length,
            color: "bg-gray-50 border-gray-200",
          },
          {
            type: "high",
            label: "High Priority",
            count: alerts.filter(
              (a) => !dismissed.has(a.id) && a.priority === "high"
            ).length,
            color: "bg-red-50 border-red-100",
          },
          {
            type: "at_risk",
            label: "At-Risk",
            count: alerts.filter(
              (a) => !dismissed.has(a.id) && a.type === "at_risk"
            ).length,
            color: "bg-orange-50 border-orange-100",
          },
          {
            type: "followup_due",
            label: "Follow-Ups Due",
            count: alerts.filter(
              (a) => !dismissed.has(a.id) && a.type === "followup_due"
            ).length,
            color: "bg-amber-50 border-amber-100",
          },
        ].map((s) => (
          <button
            key={s.type}
            onClick={() => setFilter(s.type)}
            className={`rounded-xl border p-3 text-left transition-all ${s.color} ${filter === s.type ? "ring-2 ring-[#C9A84C]" : ""}`}
          >
            <p className="text-2xl font-bold text-[#0A0A0A]">
              {loading ? "—" : s.count}
            </p>
            <p className="text-xs text-[#6B7280]">{s.label}</p>
          </button>
        ))}
      </div>

      {aiInsights && aiInsights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
            <span className="text-[#C9A84C]">✦</span> AI Care Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${insightColors[insight.type] || insightColors.action}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">
                    {insightIcons[insight.type] || "💡"}
                  </span>
                  <div>
                    <p className="font-semibold text-[#0A0A0A] text-sm">
                      {insight.title}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      {insight.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-[#0A0A0A] mb-3">
          Active Alerts
          {visibleAlerts.length > 0 && (
            <span className="ml-2 text-xs font-normal text-[#9CA3AF]">
              ({visibleAlerts.length})
            </span>
          )}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#C9A84C]" size={40} />
          </div>
        ) : visibleAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-[#0A0A0A] mb-1">All clear!</p>
            <p className="text-sm text-[#9CA3AF]">
              No active alerts right now. Your church care is on track.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => {
              const config =
                NOTIFICATION_TYPES[alert.type] ?? {
                  label: "Alert",
                  icon: Bell,
                  color: "text-gray-500",
                  bg: "bg-white border-gray-100",
                };
              const Icon = config.icon;
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${config.bg} ${alert.isNew ? "ring-2 ring-[#C9A84C]/40" : ""}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}
                  >
                    <Icon size={17} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-bold ${config.color}`}
                      >
                        {config.label}
                      </span>
                      {alert.priority === "high" && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                          HIGH
                        </span>
                      )}
                      {alert.isNew && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#A07830] font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#374151]">{alert.message}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {alert.timestamp
                        ? new Date(alert.timestamp).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-1">
                    {alert.guest_id && (
                      <Link
                        href={`/dashboard/guests/${alert.guest_id}`}
                        className="text-xs font-semibold text-[#C9A84C] hover:text-[#A07830] transition-colors whitespace-nowrap"
                      >
                        View →
                      </Link>
                    )}
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors whitespace-nowrap"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-[#9CA3AF]">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Live alerts active — updates as guest data changes
      </div>
    </div>
  );
}
