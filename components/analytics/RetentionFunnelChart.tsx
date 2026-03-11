"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#C9A84C", "#E8D5A3", "#A07830", "#6B7280", "#0A0A0A"];

const STAGES = [
  { key: "stage_1_welcome", label: "Welcome" },
  { key: "stage_2_connect", label: "Connect" },
  { key: "stage_3_grow", label: "Grow" },
  { key: "stage_4_serve", label: "Serve" },
  { key: "stage_5_belong", label: "Belong" },
];

type Guest = { journey_stage?: string; journeyStage?: string };

type Props = { guests: Guest[] };

export default function RetentionFunnelChart({ guests }: Props) {
  const data = useMemo(() => {
    return STAGES.map((s, i) => ({
      name: s.label,
      value: guests.filter((g) => (g.journey_stage || g.journeyStage || "stage_1_welcome") === s.key).length,
      fill: COLORS[i % COLORS.length],
    }));
  }, [guests]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#0A0A0A] mb-5">Retention Funnel</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} width={55} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: 12 }}
            formatter={(value) => [value ?? 0, "Guests"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} minPointSize={4}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
