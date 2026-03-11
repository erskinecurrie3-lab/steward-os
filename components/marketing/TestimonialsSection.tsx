"use client";

import { motion } from "framer-motion";

const testimonials = [
  { quote: "I used to lie awake Sunday nights thinking about the family I hadn't followed up with. StewardOS gave me a system — and gave me my sleep back.", name: "Pastor David Hernandez", title: "Lead Pastor", church: "Grace Community Church", size: "180 members", avatar: "D" },
  { quote: "We went from losing 70% of first-time visitors to retaining nearly half. The journey system showed my team exactly what to do and when.", name: "Pastor Sarah Mitchell", title: "Church Planter", church: "New Horizons Fellowship", size: "95 members", avatar: "S" },
  { quote: "I'm bi-vocational — I work 40 hours a week outside of ministry. StewardOS runs the care system for me while I'm at my day job.", name: "Pastor Kevin Brooks", title: "Senior Pastor", church: "Cornerstone Baptist", size: "240 members", avatar: "K" },
];

const stats = [
  { value: "47%", label: "Average increase in visitor retention" },
  { value: "30", label: "Days to full implementation" },
  { value: "2.3×", label: "More guests reach connected status" },
  { value: "6hrs", label: "Weekly hours saved per pastor" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-36 bg-[#FDFAF5] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }} className="text-center">
              <p className="text-4xl lg:text-6xl font-black text-[#0A0A0A] mb-2 tracking-tight">{s.value}</p>
              <p className="text-sm text-[#9CA3AF]">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.2em] mb-5">Testimonials</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A0A0A] leading-tight tracking-tight">
            Pastors who lead with confidence now.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl p-8 border border-[#F0EBE0] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex gap-0.5 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-[#C9A84C] text-sm">★</span>
                ))}
              </div>
              <blockquote className="text-[#374151] text-sm leading-relaxed mb-7 italic">&quot;{t.quote}&quot;</blockquote>
              <div className="flex items-center gap-3 pt-5 border-t border-[#F5F0E8]">
                <div className="w-11 h-11 rounded-full bg-[#C9A84C]/15 flex items-center justify-center font-bold text-[#A07830] text-lg flex-shrink-0">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-[#0A0A0A] text-sm">{t.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{t.title} · {t.church}</p>
                  <p className="text-xs text-[#C9A84C] font-medium">{t.size}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
