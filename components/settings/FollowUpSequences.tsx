"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, Plus } from "lucide-react";

type Sequence = {
  id: string;
  title: string;
  description: string | null;
  touchpoints: number;
  days: number;
  category: string;
  touchpointList?: { id: string }[];
};

export default function FollowUpSequences() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/journey-templates")
      .then((r) => r.json())
      .then((data) => setSequences(Array.isArray(data) ? data : []))
      .catch(() => setSequences([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-[#C9A84C]" />
          <h2 className="font-bold text-[#0A0A0A]">Follow-up Sequences</h2>
        </div>
        <Link
          href="/dashboard/journey-builder"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#C9A84C] hover:text-[#A07830]"
        >
          <Plus size={14} /> New sequence
        </Link>
      </div>
      <p className="text-xs text-[#9CA3AF] mb-5">
        Visitor pathways and automated follow-up journeys. Create and edit in the Journey Builder.
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
        </div>
      ) : sequences.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200">
          <p className="text-sm text-[#6B7280] mb-3">No follow-up sequences yet.</p>
          <Link
            href="/dashboard/journey-builder"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm hover:bg-[#E8D5A3]"
          >
            <Plus size={16} /> Create in Journey Builder
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.slice(0, 5).map((s) => (
            <Link
              key={s.id}
              href="/dashboard/journey-builder"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-[#C9A84C]/5 border border-transparent hover:border-[#C9A84C]/20 transition-all"
            >
              <div>
                <p className="font-semibold text-sm text-[#0A0A0A]">{s.title}</p>
                <p className="text-xs text-[#9CA3AF]">{s.touchpointList?.length ?? s.touchpoints} touchpoints · {s.days} days</p>
              </div>
              <ArrowRight size={16} className="text-[#9CA3AF]" />
            </Link>
          ))}
          {sequences.length > 5 && (
            <Link
              href="/dashboard/journey-builder"
              className="block text-center text-xs font-medium text-[#C9A84C] hover:text-[#A07830] py-2"
            >
              View all {sequences.length} sequences →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
