"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

type Guest = {
  status?: string;
  journey_stage?: string;
  journeyStage?: string;
  is_at_risk?: boolean;
  isAtRisk?: boolean;
};
type CareNote = { createdAt: string };
type Template = { title?: string; touchpoints?: number };

type Props = { guests: Guest[]; careNotes: CareNote[]; templates: Template[] };

function buildSummary(guests: Guest[], careNotes: CareNote[], templates: Template[]): string {
  const total = guests.length;
  const byStatus: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  let atRisk = 0;
  guests.forEach((g) => {
    const s = g.status || "new_visitor";
    byStatus[s] = (byStatus[s] || 0) + 1;
    const st = g.journey_stage || g.journeyStage || "stage_1_welcome";
    byStage[st] = (byStage[st] || 0) + 1;
    if (g.is_at_risk || g.isAtRisk) atRisk++;
  });
  const retention = total > 0
    ? Math.round(
        (guests.filter((g) => ["connected", "member"].includes(g.status || "")).length / total) * 100
      )
    : 0;
  const careCoverage = total > 0 ? Math.round(((total - atRisk) / total) * 100) : 100;

  return [
    `Total guests: ${total}`,
    `Retention rate: ${retention}% (connected + members)`,
    `At-risk guests: ${atRisk}`,
    `Care coverage: ${careCoverage}%`,
    `Care notes logged: ${careNotes.length}`,
    `Journey templates: ${templates.length} (${templates.reduce((a, t) => a + (t.touchpoints || 0), 0)} total touchpoints)`,
    `Status breakdown: ${Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(", ")}`,
    `Stage breakdown: ${Object.entries(byStage).map(([k, v]) => `${k}: ${v}`).join(", ")}`,
  ].join("\n");
}

export default function AIInsightsPanel({ guests, careNotes, templates }: Props) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setInsights([]);
    try {
      const summary = buildSummary(guests, careNotes, templates);
      const res = await fetch("/api/ai/analytics-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
        credentials: "include",
      });
      const data = await res.json();
      setInsights(data.insights || []);
    } catch {
      setInsights(["Failed to generate insights."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#0A0A0A] mb-3">AI Insights Panel</h3>
      <p className="text-sm text-[#9CA3AF] mb-4">
        Get AI-powered recommendations based on your guest and care data
      </p>
      <button
        onClick={handleGenerate}
        disabled={loading || guests.length === 0}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] disabled:opacity-50 transition-all mb-4"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? "Analyzing..." : "Generate Insights"}
      </button>
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg bg-[#F8F8F7] border border-gray-100"
            >
              <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-[#A07830]" />
              </div>
              <p className="text-sm text-[#374151] leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
