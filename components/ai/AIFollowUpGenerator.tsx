"use client";

import { useState } from "react";
import { Zap, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

type Props = { churchId: string | null; onTasksCreated?: (count: number) => void };

export default function AIFollowUpGenerator({ churchId, onTasksCreated }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ tasks_created?: number; message?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!churchId) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ church_id: churchId }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ tasks_created: data.tasks_created ?? 0, message: data.message });
      if (data.tasks_created > 0 && onTasksCreated) onTasksCreated(data.tasks_created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setRunning(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#FDFAF5] to-white border border-[#E8D5A3]/40 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-[#A07830]" />
        </div>
        <div>
          <h3 className="font-bold text-[#0A0A0A] text-sm">AI Follow-Up Generator</h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Scans guests not seen in 14+ days and creates personalized volunteer tasks automatically.
          </p>
        </div>
      </div>

      <button
        onClick={run}
        disabled={running || !churchId}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60"
      >
        {running ? <><Loader2 size={15} className="animate-spin" /> Analyzing guests...</> : <><Zap size={15} /> Generate Follow-Up Tasks</>}
      </button>

      {result && (
        <div className={`mt-3 flex items-start gap-2 text-xs rounded-lg px-3 py-2.5 ${(result.tasks_created ?? 0) > 0 ? "bg-[#C9A84C]/20 text-[#A07830]" : "bg-gray-50 text-[#6B7280]"}`}>
          <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />
          <span>{(result.tasks_created ?? 0) > 0 ? `✅ Created ${result.tasks_created ?? 0} new follow-up task${(result.tasks_created ?? 0) > 1 ? "s" : ""} for volunteers.` : result.message || "No new tasks needed right now."}</span>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs rounded-lg px-3 py-2.5 bg-red-50 text-red-600">
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
