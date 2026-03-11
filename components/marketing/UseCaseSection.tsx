"use client";

import { motion } from "framer-motion";
import { HandHeart, UsersRound, TrendingUp } from "lucide-react";

const cases = [
  { size: "75–150 Members", role: "Bi-Vocational Pastor", challenge: "You're wearing every hat. Guest follow-up happens when you remember — which isn't always.", solution: "StewardOS runs your follow-up automatically. You get a weekly list of 3–5 people who need a call. That's it.", icon: HandHeart, dark: false },
  { size: "150–300 Members", role: "Lead Pastor with Small Team", challenge: "You have a few volunteers, but the care system is still in your head. Coordination is scattered.", solution: "Assign care tasks to your team with one click. Everyone knows their role. Nothing falls through the cracks.", icon: UsersRound, dark: false },
  { size: "300–400 Members", role: "Pastor with Admin Support", challenge: "Growth has made individual follow-up impossible. You need a scalable system, not more spreadsheets.", solution: "Analytics, custom journey maps, volunteer coordination, and retention dashboards — infrastructure that scales.", icon: TrendingUp, dark: true },
];

export default function UseCaseSection() {
  return (
    <section className="py-24 lg:py-36 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C9A84C]/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em] mb-5">Built for Your Church Size</p>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#0A0A0A] leading-[1.05] tracking-tight">
            Works exactly where you are.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <motion.div
              key={c.size}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-2xl p-8 border hover:-translate-y-1 hover:shadow-xl transition-all duration-500 ${
                c.dark ? "bg-[#0A0A0A] border-[#C9A84C]/20 shadow-[0_0_50px_rgba(201,168,76,0.08)]" : "bg-[#FAFAFA] border-gray-100"
              }`}
            >
              <div className="mb-5"><c.icon size={32} className="text-[#C9A84C]" /></div>
              <span className={`text-xs font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full ${c.dark ? "bg-[#C9A84C]/15 text-[#E8D5A3]" : "bg-[#C9A84C]/10 text-[#A07830]"}`}>
                {c.size}
              </span>
              <h3 className={`text-lg font-bold mt-4 mb-5 ${c.dark ? "text-white" : "text-[#0A0A0A]"}`}>{c.role}</h3>
              <div className="mb-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.12em] mb-2 ${c.dark ? "text-white/30" : "text-[#9CA3AF]"}`}>The Challenge</p>
                <p className={`text-sm leading-relaxed ${c.dark ? "text-white/50" : "text-[#6B7280]"}`}>{c.challenge}</p>
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.12em] mb-2 ${c.dark ? "text-[#C9A84C]" : "text-[#A07830]"}`}>With StewardOS</p>
                <p className={`text-sm leading-relaxed ${c.dark ? "text-white/80" : "text-[#374151]"}`}>{c.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
