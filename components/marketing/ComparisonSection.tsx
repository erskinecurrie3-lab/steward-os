"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const rows = [
  { label: "Clear visitor pathway for every guest", steward: true },
  { label: "Automated follow-up sequences", steward: true },
  { label: "AI-generated care messages", steward: true },
  { label: "At-risk disengagement alerts", steward: true },
  { label: "Weekly priority care list", steward: true },
  { label: "Volunteer care assignments", steward: true },
  { label: "Retention analytics & reporting", steward: true },
  { label: "Consistent care for every person", steward: true },
  { label: "Pastor mental load reduced", steward: true },
];

export default function ComparisonSection() {
  return (
    <section className="py-24 lg:py-36 bg-[#FAFAFA] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em] mb-5">The Difference</p>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#0A0A0A] leading-[1.05] mb-6 tracking-tight">
            Manual systems cost you people.
          </h2>
          <p className="text-[#6B7280] text-lg">The average church loses 40–60% of first-time visitors. Most were reachable — they just weren&apos;t reached.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="rounded-2xl border border-gray-100 overflow-hidden shadow-xl shadow-black/5">
          <div className="grid grid-cols-3 bg-[#0A0A0A] text-white">
            <div className="py-5 px-6 text-sm font-medium text-white/40" />
            <div className="py-5 px-6 text-center">
              <p className="text-sm font-semibold text-white/40">Manual / Spreadsheet</p>
            </div>
            <div className="py-5 px-6 text-center bg-[#C9A84C]/10 border-l border-[#C9A84C]/20">
              <p className="text-sm font-bold text-[#E8D5A3]">StewardOS</p>
            </div>
          </div>
          {rows.map((row, i) => (
            <div key={row.label} className={`grid grid-cols-3 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}>
              <div className="py-4 px-6 text-sm text-[#374151] font-medium">{row.label}</div>
              <div className="py-4 px-6 flex justify-center">
                <X size={16} className="text-red-300" />
              </div>
              <div className="py-4 px-6 flex justify-center bg-[#C9A84C]/3">
                <Check size={16} className="text-[#C9A84C]" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
