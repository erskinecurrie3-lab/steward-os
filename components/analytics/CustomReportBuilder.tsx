"use client";

import { useState, useMemo } from "react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type Guest = {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  status?: string;
  journey_stage?: string;
  journeyStage?: string;
  is_at_risk?: boolean;
  isAtRisk?: boolean;
  created_date?: string;
  createdAt?: string;
};

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "stage", label: "Journey Stage" },
  { key: "at_risk", label: "At Risk" },
] as const;

type Props = { guests: Guest[] };

export default function CustomReportBuilder({ guests }: Props) {
  const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set(COLUMNS.map((c) => c.key)));
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let result = [...guests];
    if (statusFilter !== "all") result = result.filter((g) => g.status === statusFilter);
    if (stageFilter !== "all") result = result.filter((g) => (g.journey_stage || g.journeyStage) === stageFilter);
    const getVal = (g: Guest, k: string) => {
      if (k === "name") return `${g.first_name || ""} ${g.last_name || ""}`.trim() || g.name || "";
      if (k === "stage") return g.journey_stage || g.journeyStage || "";
      if (k === "at_risk") return (g.is_at_risk || g.isAtRisk) ? "1" : "0";
      return String((g as Record<string, unknown>)[k] ?? "");
    };
    result.sort((a, b) => {
      const av = getVal(a, sortBy);
      const bv = getVal(b, sortBy);
      const cmp = av.localeCompare(bv);
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [guests, statusFilter, stageFilter, sortBy, sortAsc]);

  const toggleCol = (key: string) => {
    setSelectedCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const displayName = (g: Guest) =>
    `${g.first_name || ""} ${g.last_name || ""}`.trim() || g.name || "—";
  const displayStage = (g: Guest) =>
    (g.journey_stage || g.journeyStage || "")
      .replace(/stage_\d+_/g, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

  const exportCSV = () => {
    const headers = COLUMNS.filter((c) => selectedCols.has(c.key)).map((c) => c.label);
    const rows = filtered.map((g) =>
      COLUMNS.filter((c) => selectedCols.has(c.key)).map((c) => {
        if (c.key === "name") return displayName(g);
        if (c.key === "email") return g.email || "";
        if (c.key === "status") return g.status || "";
        if (c.key === "stage") return displayStage(g);
        if (c.key === "at_risk") return g.is_at_risk || g.isAtRisk ? "Yes" : "No";
        return "";
      })
    );
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statuses = [...new Set(guests.map((g) => g.status).filter(Boolean))];
  const stages = [...new Set(guests.map((g) => g.journey_stage || g.journeyStage).filter(Boolean))];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-[#0A0A0A] mb-3">Custom Report Builder</h3>
      <p className="text-sm text-[#9CA3AF] mb-4">Filter, sort, and export guest data</p>
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{String(s).replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="all">All stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{displayStage({ journey_stage: s } as Guest)}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
        >
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <button
          onClick={() => setSortAsc((a) => !a)}
          className="p-2 rounded-lg border border-gray-200 text-[#6B7280] hover:border-[#C9A84C]"
          title={sortAsc ? "Sort descending" : "Sort ascending"}
        >
          {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#9CA3AF]">{selectedCols.size} columns</span>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:border-[#C9A84C] hover:text-[#0A0A0A]"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>
      <div className="flex gap-4 mb-3 flex-wrap">
        {COLUMNS.map((c) => (
          <label key={c.key} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCols.has(c.key)}
              onChange={() => toggleCol(c.key)}
              className="accent-[#C9A84C]"
            />
            {c.label}
          </label>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100 max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {COLUMNS.filter((c) => selectedCols.has(c.key)).map((c) => (
                <th key={c.key} className="px-3 py-2 text-left font-semibold text-[#6B7280]">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-semibold text-[#6B7280] w-16">Link</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((g) => (
              <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                {selectedCols.has("name") && <td className="px-3 py-2">{displayName(g)}</td>}
                {selectedCols.has("email") && <td className="px-3 py-2">{g.email || "—"}</td>}
                {selectedCols.has("status") && <td className="px-3 py-2">{g.status || "—"}</td>}
                {selectedCols.has("stage") && <td className="px-3 py-2">{displayStage(g)}</td>}
                {selectedCols.has("at_risk") && <td className="px-3 py-2">{g.is_at_risk || g.isAtRisk ? "Yes" : "No"}</td>}
                <td className="px-3 py-2">
                  <Link href={`/dashboard/guests/${g.id}`} className="text-[#C9A84C] font-semibold hover:text-[#A07830] text-xs">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#9CA3AF] mt-2">
        Showing {Math.min(100, filtered.length)} of {filtered.length} guests
      </p>
    </div>
  );
}
