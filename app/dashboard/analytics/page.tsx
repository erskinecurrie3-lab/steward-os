"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Filter, RefreshCw } from "lucide-react";
import AIInsightsPanel from "@/components/analytics/AIInsightsPanel";
import PDFExport from "@/components/analytics/PDFExport";
import RetentionFunnelChart from "@/components/analytics/RetentionFunnelChart";
import EngagementTrendChart from "@/components/analytics/EngagementTrendChart";
import AIMessageComposer from "@/components/analytics/AIMessageComposer";
import CustomReportBuilder from "@/components/analytics/CustomReportBuilder";

const GOLD = "#C9A84C";
const COLORS = ["#C9A84C", "#0A0A0A", "#6B7280", "#E8D5A3", "#A07830", "#374151"];

const GUEST_TYPES = [
  { value: "all", label: "All Guests" },
  { value: "new_visitor", label: "New Visitors" },
  { value: "returning_visitor", label: "Returning" },
  { value: "connected", label: "Connected" },
  { value: "member", label: "Members" },
  { value: "at_risk", label: "At-Risk" },
  { value: "inactive", label: "Inactive" },
];

const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
];

type Guest = {
  id: string;
  name: string;
  email?: string | null;
  notes?: string | null;
  createdAt?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  journeyStage?: string;
  journey_stage?: string;
  isAtRisk?: boolean;
  is_at_risk?: boolean;
  visit_date?: string;
  created_date?: string;
};

function toAnalyticsGuestShape(g: Guest): Guest & { first_name: string; last_name: string; status: string; journey_stage: string; created_date: string } {
  const [first_name = "", ...rest] = (g.name || "").trim().split(/\s+/);
  const last_name = rest.join(" ") || "";
  return {
    ...g,
    first_name,
    last_name,
    status: g.status || "new_visitor",
    journey_stage: g.journeyStage || g.journey_stage || "stage_1_welcome",
    is_at_risk: g.isAtRisk ?? g.is_at_risk ?? false,
    created_date: g.createdAt || g.created_date || "",
  };
}

export default function AnalyticsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [careNotes, setCareNotes] = useState<{ createdAt: string }[]>([]);
  const [templates, setTemplates] = useState<{ title?: string; touchpoints?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [guestType, setGuestType] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/guests", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/care-notes", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/journey-templates", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([gData, nData, tData]) => {
        const list = Array.isArray(gData) ? gData : [];
        setGuests(list.map(toAnalyticsGuestShape));
        setCareNotes(Array.isArray(nData) ? nData : []);
        setTemplates(Array.isArray(tData) ? tData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredGuests = useMemo(() => {
    let result = guests;
    if (guestType !== "all") result = result.filter((g) => g.status === guestType);
    if (dateRange !== "all") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(dateRange));
      result = result.filter((g) => new Date((g.created_date ?? g.createdAt) ?? 0) >= cutoff);
    }
    return result;
  }, [guests, guestType, dateRange]);

  const statusData = [
    { name: "New Visitor", value: filteredGuests.filter((g) => g.status === "new_visitor").length },
    { name: "Returning", value: filteredGuests.filter((g) => g.status === "returning_visitor").length },
    { name: "Connected", value: filteredGuests.filter((g) => g.status === "connected").length },
    { name: "Member", value: filteredGuests.filter((g) => g.status === "member").length },
    { name: "At Risk", value: filteredGuests.filter((g) => g.status === "at_risk").length },
    { name: "Inactive", value: filteredGuests.filter((g) => g.status === "inactive").length },
  ].filter((d) => d.value > 0);

  const stageData = [
    { name: "Welcome", value: filteredGuests.filter((g) => g.journey_stage === "stage_1_welcome").length },
    { name: "Connect", value: filteredGuests.filter((g) => g.journey_stage === "stage_2_connect").length },
    { name: "Grow", value: filteredGuests.filter((g) => g.journey_stage === "stage_3_grow").length },
    { name: "Serve", value: filteredGuests.filter((g) => g.journey_stage === "stage_4_serve").length },
    { name: "Belong", value: filteredGuests.filter((g) => g.journey_stage === "stage_5_belong").length },
  ];

  const retentionRate =
    filteredGuests.length > 0
      ? Math.round(
          (filteredGuests.filter((g) => ["connected", "member"].includes(g.status || "")).length /
            filteredGuests.length) *
            100
        )
      : 0;

  const atRiskCount = filteredGuests.filter((g) => g.is_at_risk).length;

  const exportCSV = () => {
    const headers = ["Name", "Email", "Status", "Journey Stage", "Visit Date", "At Risk"];
    const rows = filteredGuests.map((g) => [
      `${g.first_name || ""} ${g.last_name || ""}`.trim(),
      g.email || "",
      g.status || "",
      g.journey_stage?.replace(/_/g, " ") || "",
      g.visit_date || (g.created_date || g.createdAt)?.split("T")[0] || "",
      g.is_at_risk ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guests_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl w-full overflow-hidden">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">Analytics</h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF]">Church health, retention, and journey insights</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#6B7280] hover:border-[#C9A84C] hover:text-[#0A0A0A] transition-all"
          >
            <Download size={14} /> <span className="hidden sm:inline">CSV</span>
          </button>
          <PDFExport
            guests={filteredGuests}
            careNotes={careNotes}
            retentionRate={retentionRate}
            atRiskCount={atRiskCount}
            stageData={stageData}
            statusData={statusData}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-5 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Filter size={14} className="text-[#9CA3AF] flex-shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="flex-1 px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
            >
              {DATE_RANGES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <select
              value={guestType}
              onChange={(e) => setGuestType(e.target.value)}
              className="flex-1 px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
            >
              {GUEST_TYPES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between sm:ml-auto gap-3">
          {(dateRange !== "all" || guestType !== "all") && (
            <button
              onClick={() => {
                setDateRange("all");
                setGuestType("all");
              }}
              className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#A07830] font-medium"
            >
              <RefreshCw size={12} /> Reset
            </button>
          )}
          <span className="text-xs text-[#9CA3AF]">{filteredGuests.length} guests</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {[
          { label: "Total in System", value: filteredGuests.length, sub: "Matching filters" },
          { label: "Retention Rate", value: `${retentionRate}%`, sub: "Connected + members" },
          {
            label: "At-Risk Guests",
            value: atRiskCount,
            sub: "Flagged for care",
            alert: atRiskCount > 0,
          },
          {
            label: "Care Coverage",
            value: `${filteredGuests.length > 0 ? Math.round(((filteredGuests.length - atRiskCount) / filteredGuests.length) * 100) : 100}%`,
            sub: "Guests with active care",
          },
        ].map((k) => (
          <div
            key={k.label}
            className={`bg-white rounded-xl p-5 border shadow-sm ${k.alert && k.value > 0 ? "border-red-100" : "border-gray-100"}`}
          >
            <p className="text-xs text-[#9CA3AF] mb-1">{k.label}</p>
            <p
              className={`text-2xl lg:text-3xl font-bold mb-1 ${k.alert && k.value > 0 ? "text-red-500" : "text-[#0A0A0A]"}`}
            >
              {loading ? "—" : k.value}
            </p>
            <p className="text-xs text-[#9CA3AF]">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <EngagementTrendChart guests={filteredGuests} careNotes={careNotes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#0A0A0A] mb-5">Journey Stage Distribution</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-[#9CA3AF]">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Bar dataKey="value" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#0A0A0A] mb-5">Guest Status Breakdown</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-[#9CA3AF]">Loading...</div>
          ) : statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#9CA3AF] text-sm">
              No data for selected filters
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statusData} cx={70} cy={70} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-xs text-[#6B7280]">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0A0A0A]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <RetentionFunnelChart guests={filteredGuests} />
      </div>

      <div className="mb-6">
        <CustomReportBuilder guests={filteredGuests} />
      </div>

      <div className="mb-6">
        <AIMessageComposer guests={filteredGuests} />
      </div>

      <div className="mb-6">
        <AIInsightsPanel guests={filteredGuests} careNotes={careNotes} templates={templates} />
      </div>

      <div className="bg-[#0A0A0A] rounded-2xl p-6 text-white">
        <h3 className="font-bold text-[#E8D5A3] mb-4">📊 Church Health Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Retention Health</p>
            <p className="text-2xl font-bold text-[#C9A84C]">{retentionRate}%</p>
            <p className="text-white/40 text-xs mt-1">
              {retentionRate >= 50 ? "Strong retention" : retentionRate >= 30 ? "Room for improvement" : "Attention needed"}
            </p>
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Care Coverage</p>
            <p className="text-2xl font-bold text-white">
              {filteredGuests.length > 0 ? Math.round(((filteredGuests.length - atRiskCount) / filteredGuests.length) * 100) : 100}%
            </p>
            <p className="text-white/40 text-xs mt-1">Guests with active care</p>
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Filtered Guests</p>
            <p className="text-2xl font-bold text-white">{filteredGuests.length}</p>
            <p className="text-white/40 text-xs mt-1">Matching current filters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
