"use client";

import { motion } from "framer-motion";
import { Map, MessageCircle, BarChart2 } from "lucide-react";

const steps = [
  { number: "01", title: "Map the Journey", body: "StewardOS builds a personalized 90-day Visitor Journey Map for every guest type — first-time visitors, families, singles, returners. Every step is clear.", icon: Map },
  { number: "02", title: "Care Automatically", body: "AI-generated follow-up messages, care assignments, and weekly priority dashboards mean your team knows exactly who to reach out to — and what to say.", icon: MessageCircle },
  { number: "03", title: "Lead with Confidence", body: "Real-time analytics, disengagement alerts, and assimilation reports give you a complete picture of your church's health — so nothing falls through the cracks.", icon: BarChart2 },
];

export default function SolutionSection() {
  return (
    <section className="py-24 lg:py-36 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A84C]/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em] mb-5">How It Works</p>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#0A0A0A] leading-[1.05] mb-6 tracking-tight">
            A complete care operating system, installed in 30 days.
          </h2>
          <p className="text-[#6B7280] text-lg leading-relaxed">
            Not another tool to manage. StewardOS is infrastructure — a complete system your whole team runs on.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-[#FAFAFA] border border-[#F0EBE0] rounded-2xl p-8 hover:border-[#C9A84C]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
            >
              <span className="absolute top-5 right-6 text-6xl font-black text-[#C9A84C]/8 leading-none select-none">{step.number}</span>
              <div className="mb-6"><step.icon size={32} className="text-[#C9A84C]" /></div>
              <h3 className="text-xl font-bold text-[#0A0A0A] mb-3">{step.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">{step.body}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-[#C9A84C]/30 to-transparent z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
