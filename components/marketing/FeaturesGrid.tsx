"use client";

import { motion } from "framer-motion";
import { Map, Bell, MessageSquare, LayoutDashboard, Users, Zap, BarChart2, HandMetal, ClipboardList } from "lucide-react";

const features = [
  { icon: Map, title: "AI Visitor Journey Map", body: "Personalized 90-day pathways for every guest type. First-timers, families, singles — each one guided through a clear assimilation process.", highlight: true },
  { icon: Bell, title: "At-Risk Alerts", body: "Automatic flags when someone hasn't been seen in 2–3 weeks. You'll know who needs a call before they're already gone." },
  { icon: MessageSquare, title: "AI-Generated Follow-Up Messages", body: "Personalized emails and SMS drafts created by AI, reviewed by you. Care at scale without losing the personal touch." },
  { icon: LayoutDashboard, title: "Weekly Priority Dashboard", body: "Every Monday: a curated list of who needs care that week. No more guessing. Just action." },
  { icon: Users, title: "Guest & Member Profiles", body: "Complete care history, journey stage, family info, notes, and next steps — all in one clean, unified view." },
  { icon: Zap, title: "Automated Follow-Up Workflows", body: "Set-and-forget care sequences that run on your behalf. Volunteers get assignments. Guests get consistent care." },
  { icon: BarChart2, title: "Retention Analytics", body: "Track assimilation rates, visitor return trends, and engagement health. Understand your church's retention like never before." },
  { icon: HandMetal, title: "Volunteer Care Assignments", body: "Distribute guest care across your team with automated assignments. No one person carries it all." },
  { icon: ClipboardList, title: "Care Notes Timeline", body: "A chronological care log for every person. Every call, text, visit, and prayer — documented and searchable." },
];

export default function FeaturesGrid() {
  return (
    <section className="py-24 lg:py-36 bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em] mb-5">The Platform</p>
          <h2 className="text-4xl lg:text-6xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
            Every tool you need. Nothing you don&apos;t.
          </h2>
          <p className="text-white/40 text-lg">Built specifically for the small-to-mid-size church that needs real systems without complexity.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group rounded-2xl p-7 border transition-all duration-500 hover:-translate-y-1 cursor-default ${
                f.highlight
                  ? "bg-[#C9A84C]/10 border-[#C9A84C]/25 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/15"
                  : "bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-white/15"
              }`}
            >
              <div className="mb-5"><f.icon size={28} className="text-[#C9A84C]" /></div>
              <h3 className={`font-bold text-lg mb-2.5 ${f.highlight ? "text-[#E8D5A3]" : "text-white"}`}>{f.title}</h3>
              <p className={`text-sm leading-relaxed ${f.highlight ? "text-[#C9A84C]/60" : "text-white/35"}`}>{f.body}</p>
              {f.highlight && (
                <div className="mt-5 inline-flex items-center gap-1.5 text-[#C9A84C] text-xs font-semibold">
                  Core Feature <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
    </section>
  );
}
