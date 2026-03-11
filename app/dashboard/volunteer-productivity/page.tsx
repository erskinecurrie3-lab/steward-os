"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, CheckCircle, Clock, TrendingUp, Loader2, Upload, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8D5A3";

type TaskItem = {
  id?: string;
  status?: string;
  assignedVolunteer?: string | null;
  createdAt?: string;
  completedAt?: string | null;
  aiHandledAt?: string | null;
};

export default function VolunteerProductivityPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [references, setReferences] = useState<{ id: string; filename: string; url?: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refLoading, setRefLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/tasks", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setTasks((Array.isArray(data) ? data : []) as TaskItem[]))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/volunteer-references", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setReferences(Array.isArray(data) ? data : []))
      .catch(() => setReferences([]))
      .finally(() => setRefLoading(false));
  }, []);

  const totalCompleted = tasks.filter((t) => t.status === "completed").length;
  const totalPending = tasks.filter((t) => ["pending", "assigned", "accepted"].includes(t.status ?? "")).length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  const volunteerChartData = useMemo(() => {
    const byVolunteer: Record<string, { completed: number; pending: number }> = {};
    for (const t of tasks) {
      const key = t.assignedVolunteer?.trim() || "Unassigned";
      if (!byVolunteer[key]) byVolunteer[key] = { completed: 0, pending: 0 };
      if (t.status === "completed") byVolunteer[key].completed++;
      else if (["pending", "assigned", "accepted"].includes(t.status ?? "")) byVolunteer[key].pending++;
    }
    return Object.entries(byVolunteer)
      .map(([name, v]) => ({ name, completed: v.completed, pending: v.pending, total: v.completed + v.pending }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [tasks]);

  const responseTimeData = useMemo(() => {
    const byVolunteer: Record<string, number[]> = {};
    for (const t of tasks) {
      if (t.status !== "completed") continue;
      const completedAt = t.completedAt ? new Date(t.completedAt).getTime() : t.aiHandledAt ? new Date(t.aiHandledAt).getTime() : null;
      const createdAt = t.createdAt ? new Date(t.createdAt).getTime() : null;
      if (!completedAt || !createdAt) continue;
      const hours = (completedAt - createdAt) / (1000 * 60 * 60);
      const key = t.assignedVolunteer?.trim() || "Unassigned";
      if (!byVolunteer[key]) byVolunteer[key] = [];
      byVolunteer[key].push(hours);
    }
    return Object.entries(byVolunteer)
      .map(([name, hours]) => ({
        name,
        avgHours: hours.length ? Math.round((hours.reduce((a, b) => a + b, 0) / hours.length) * 10) / 10 : 0,
        count: hours.length,
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [tasks]);

  const peakHoursData = useMemo(() => {
    const byHour: Record<number, number> = {};
    for (let h = 0; h < 24; h++) byHour[h] = 0;
    for (const t of tasks) {
      if (!t.createdAt) continue;
      const h = new Date(t.createdAt).getHours();
      byHour[h] = (byHour[h] ?? 0) + 1;
    }
    const labels = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];
    return [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((h, i) => ({
      hour: labels[i],
      count: byHour[h] ?? 0,
    }));
  }, [tasks]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/volunteer-references", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await r.json();
      if (r.ok && data) {
        setReferences((prev) => [...prev, { id: data.id, filename: data.filename, url: data.url, createdAt: data.createdAt }]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Volunteer Productivity</h1>
        <p className="text-sm text-[#9CA3AF]">Task performance, response times, and assignment patterns</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length, icon: Users },
          { label: "Completed", value: totalCompleted, icon: CheckCircle },
          { label: "Pending / Active", value: totalPending, icon: Clock },
          { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0A0A0A]">{value}</p>
              <p className="text-xs text-[#9CA3AF]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-[#0A0A0A] mb-1">Completed vs Pending by Volunteer</h2>
        <p className="text-xs text-[#9CA3AF] mb-5">Top 10 volunteers by total tasks assigned</p>
        {volunteerChartData.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] text-center py-10">No volunteer task data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={volunteerChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="completed" name="Completed" stackId="a" fill={GOLD} radius={[0, 4, 4, 0]} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill={GOLD_LIGHT} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-[#0A0A0A] mb-1">Avg Response Time per Volunteer</h2>
        <p className="text-xs text-[#9CA3AF] mb-5">Hours from assignment to completion</p>
        {responseTimeData.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] text-center py-10">No response time data yet. Complete tasks with completion timestamps to see metrics.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={responseTimeData} margin={{ left: 20, right: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v: unknown) => (v != null ? `${v}h` : "-")} />
              <Bar dataKey="avgHours" fill={GOLD} radius={[4, 4, 0, 0]} name="Avg hours" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-[#0A0A0A] mb-1">Task Status Breakdown</h2>
        <p className="text-xs text-[#9CA3AF] mb-5">Distribution across all task statuses</p>
        {tasks.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] text-center py-10">No data yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["pending", "assigned", "completed", "auto_handled"].map((status) => {
              const count = tasks.filter((t) => t.status === status).length;
              return (
                <div key={status} className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-[#0A0A0A]">{count}</p>
                  <p className="text-xs text-[#9CA3AF] capitalize">{status.replace(/_/g, " ")}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-[#0A0A0A] mb-1">Peak Task Assignment Hours</h2>
        <p className="text-xs text-[#9CA3AF] mb-5">When tasks are most commonly assigned throughout the day</p>
        {tasks.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] text-center py-10">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={peakHoursData} margin={{ left: 10, right: 10 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-[#0A0A0A] mb-1">Reference Upload</h2>
        <p className="text-xs text-[#9CA3AF] mb-5">Documents and resources for volunteers (manuals, checklists, guides)</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all cursor-pointer">
            <Upload size={18} className="text-[#A07830]" />
            <span className="text-sm font-medium text-[#6B7280]">{uploading ? "Uploading…" : "Upload file"}</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.md" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        {refLoading ? (
          <p className="text-sm text-[#9CA3AF] mt-4">Loading references…</p>
        ) : references.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] mt-4">No reference files yet. Upload PDFs, docs, or guides.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {references.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                <FileText size={16} className="text-[#A07830] flex-shrink-0" />
                <span className="text-sm text-[#0A0A0A] truncate flex-1">{r.filename}</span>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#C9A84C] hover:text-[#A07830]">
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
