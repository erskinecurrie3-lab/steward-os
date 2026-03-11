"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const GOLD = "#C9A84C";
const DARK = "#0A0A0A";

type Guest = { created_date?: string; createdAt?: string };
type CareNote = { createdAt: string };

type Props = { guests: Guest[]; careNotes: CareNote[] };

export default function EngagementTrendChart({ guests, careNotes }: Props) {
  const data = useMemo(() => {
    const weeks: { name: string; guests: number; careNotes: number; weekStart: Date }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const label = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      weeks.push({
        name: label,
        guests: guests.filter((g) => {
          const d = new Date(g.created_date || g.createdAt || 0);
          return d >= start && d < end;
        }).length,
        careNotes: careNotes.filter((n) => {
          const d = new Date(n.createdAt);
          return d >= start && d < end;
        }).length,
        weekStart: start,
      });
    }
    return weeks;
  }, [guests, careNotes]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#0A0A0A] mb-5">Engagement Trend (Last 8 Weeks)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: 12 }}
            formatter={(value) => [value ?? 0, ""]}
            labelFormatter={(label) => `Week of ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => value.replace(/([A-Z])/g, " $1").trim()} />
          <Line type="monotone" dataKey="guests" name="New Guests" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
          <Line type="monotone" dataKey="careNotes" name="Care Notes" stroke={DARK} strokeWidth={2} dot={{ fill: DARK, r: 3 }} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
