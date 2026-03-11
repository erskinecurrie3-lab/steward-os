"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

type Props = { churchId: string | null };

export default function WorkflowBuilder({ churchId: _churchId }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
          <Zap size={24} className="text-[#A07830]" />
        </div>
        <div>
          <h3 className="font-bold text-[#0A0A0A]">Automations</h3>
          <p className="text-sm text-[#6B7280] mt-1">
            Create workflows that trigger actions when integrations receive events — for example,
            add a new Planning Center person to a journey, or send a welcome SMS when someone
            gives for the first time.
          </p>
          <Link
            href="/dashboard/workflows"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm hover:bg-[#E8D5A3] transition-colors"
          >
            <Zap size={14} /> Open Workflow Builder
          </Link>
        </div>
      </div>
    </div>
  );
}
