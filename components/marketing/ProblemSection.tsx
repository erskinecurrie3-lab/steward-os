"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { HeartCrack, ClipboardList, Flame, DoorOpen } from "lucide-react";

const pains = [
  { icon: HeartCrack, title: "You remember faces you haven't seen in weeks.", body: "But you don't know if they left, if they're hurt, or if they just needed someone to reach out." },
  { icon: ClipboardList, title: "Your follow-up system is your memory.", body: "Sticky notes, spreadsheets, a mental list you review on Sunday night — and still people slip away." },
  { icon: Flame, title: "The weight never goes off your shoulders.", body: "You carry every visitor, every family, every conversation. It's ministry — but it's also burning you out." },
  { icon: DoorOpen, title: "The back door stays open.", body: "First-timers come. A few return. Most never connect. And you're not sure what went wrong." },
];

function AnimatedCard({ pain, index }: { pain: (typeof pains)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = pain.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white/[0.04] border border-white/8 rounded-2xl p-7 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-500 cursor-default"
    >
      <div className="mb-5"><Icon size={28} className="text-[#C9A84C]" strokeWidth={1.5} /></div>
      <h3 className="text-white font-semibold text-lg mb-3 leading-snug">{pain.title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{pain.body}</p>
    </motion.div>
  );
}

export default function ProblemSection() {
  return (
    <section className="py-24 lg:py-36 bg-[#060606] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-950/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em] mb-5">The Real Problem</p>
          <h2 className="text-4xl lg:text-6xl font-bold leading-[1.05] mb-6 tracking-tight">
            You didn&apos;t become a pastor to manage a spreadsheet.
          </h2>
          <p className="text-white/40 text-lg leading-relaxed">
            Without a clear system, caring for people becomes reactive, inconsistent, and exhausting.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-20">
          {pains.map((p, i) => <AnimatedCard key={p.title} pain={p} index={i} />)}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl mx-auto text-center">
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-[#C9A84C]/40 to-transparent mx-auto mb-8" />
          <p className="text-xl lg:text-2xl font-light text-white/60 italic leading-relaxed">
            &quot;What if you could lead your church with the confidence that every person is seen, cared for, and on a clear pathway — without adding more to your plate?&quot;
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
    </section>
  );
}
