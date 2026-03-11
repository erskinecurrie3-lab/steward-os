"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const } }),
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A] pt-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#C9A84C]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-[-5%] w-[500px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-[-5%] w-[400px] h-[300px] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/8 mb-8 backdrop-blur-sm">
          <Sparkles size={12} className="text-[#C9A84C]" />
          <span className="text-[#E8D5A3] text-xs font-medium tracking-widest uppercase">AI-Powered Church Care Operating System</span>
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-[1.02] tracking-tight max-w-5xl mx-auto mb-6">
          Never wonder if someone{" "}
          <span className="relative">
            <span className="text-[#C9A84C]">slipped through</span>
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C9A84C] to-[#E8D5A3] rounded-full origin-left" />
          </span>{" "}
          the cracks again.
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="text-lg lg:text-xl text-white/50 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          StewardOS installs a clear, personalized visitor journey system in your church in 30 days — so every guest is seen, followed up with, and on a pathway to belong.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link href="/signup" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-base hover:bg-[#E8D5A3] transition-all duration-300 shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_50px_rgba(201,168,76,0.5)] hover:-translate-y-0.5">
            Start Free 14-Day Trial
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white/80 font-semibold text-base hover:border-white/30 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
            Book a Demo
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="flex flex-wrap justify-center gap-6 text-sm text-white/30 mb-16">
          {["No credit card required", "Setup in under 30 days", "Cancel anytime", "Ministry-first support"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-[#C9A84C]/60" />
              {t}
            </span>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 60, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative max-w-5xl mx-auto hidden sm:block">
          <div className="absolute -inset-4 bg-[#C9A84C]/10 rounded-3xl blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A] z-10 pointer-events-none" style={{ top: "65%" }} />
          <div className="relative rounded-2xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="bg-[#1A1A1A] border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[#111] rounded-md px-3 py-1 text-xs text-white/20 border border-white/5 max-w-xs mx-auto">app.stewardos.com/dashboard</div>
              </div>
            </div>
            <div className="bg-[#0F0F0F] p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {[
                { label: "Guests This Week", value: "12", change: "+3", color: "bg-[#C9A84C]/20 text-[#E8D5A3]" },
                { label: "Follow-ups Today", value: "7", change: "Due now", color: "bg-[#C9A84C]/30 text-[#A07830]" },
                { label: "At-Risk Members", value: "3", change: "Alert", color: "bg-red-900/40 text-red-400" },
                { label: "Journey Progress", value: "84%", change: "+6%", color: "bg-green-900/40 text-green-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/5">
                  <p className="text-xs text-white/30 mb-1 truncate">{stat.label}</p>
                  <p className="text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${stat.color} font-medium`}>{stat.change}</span>
                </div>
              ))}
              <div className="col-span-2 lg:col-span-3 bg-white/5 rounded-xl p-3 lg:p-4 border border-white/5">
                <p className="text-sm font-semibold text-white/80 mb-3">Visitor Journey Pipeline</p>
                <div className="flex gap-2">
                  {["Welcome", "Connect", "Grow", "Serve", "Belong"].map((stage, i) => (
                    <div key={stage} className="flex-1">
                      <div className={`h-7 lg:h-8 rounded-lg flex items-center justify-center text-xs font-medium ${i === 0 ? "bg-[#C9A84C] text-black" : i === 1 ? "bg-[#C9A84C]/50 text-[#E8D5A3]" : i === 2 ? "bg-[#C9A84C]/20 text-[#C9A84C]/60" : "bg-white/5 text-white/20"}`}>
                        S{i + 1}
                      </div>
                      <p className="text-xs text-white/20 mt-1 text-center leading-tight hidden sm:block">{stage}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 lg:col-span-1 bg-white/5 rounded-xl p-3 lg:p-4 border border-white/5">
                <p className="text-xs font-semibold text-white/60 mb-2">Priority Care</p>
                {["Marcus T.", "Sarah K.", "The Johnsons"].map((name) => (
                  <div key={name} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-xs text-[#C9A84C] font-bold">{name[0]}</div>
                    <span className="text-xs text-white/40">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
