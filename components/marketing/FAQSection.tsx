"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Is this just another CRM for churches?", a: "No. StewardOS is not a CRM or church management tool. It's a Visitor Journey System and Church Care Operating System — built specifically to close the back door, assimilate guests, and prevent burnout. Your existing ChMS still does attendance and giving. StewardOS does care." },
  { q: "How long does it take to set up?", a: "Most churches are fully operational within 1–2 weeks on their own. With our Implementation Package, we set everything up for you within 30 days — including your Journey Maps, workflows, and team training." },
  { q: "We're a small church. Do we have enough people to make this work?", a: "Yes — and you need it most. StewardOS is designed for churches where the pastor IS the care system. It automates the parts that fall through the cracks and gives you a simple weekly list of who needs attention." },
  { q: "What if we already use Planning Center, Breeze, or another ChMS?", a: "StewardOS complements your existing tools. It doesn't replace them. Think of it as the relational intelligence layer on top of your administrative tools." },
  { q: "How does the AI actually work?", a: "When a guest is entered into the system, the AI analyzes their profile (visit history, family status, spiritual background) and generates a personalized journey pathway. It also drafts follow-up messages, flags disengagement, and surfaces care priorities — all reviewed by you before sending." },
  { q: "Is there a long-term contract?", a: "No. StewardOS is month-to-month. You can cancel any time. We believe in earning your trust every month." },
  { q: "What does the 14-day free trial include?", a: "Full access to all features of the Growth plan. No credit card required. You can import guests, build journey maps, and run the system — completely free for 14 days." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 lg:py-32 bg-[#F8F8F7]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-4xl font-bold text-[#0A0A0A]">Questions we hear often.</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#FDFAF5] transition-colors">
                <span className="font-medium text-[#0A0A0A] text-sm pr-4">{faq.q}</span>
                <ChevronDown size={18} className={`flex-shrink-0 text-[#C9A84C] transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 border-t border-gray-50">
                  <p className="text-[#6B7280] text-sm leading-relaxed pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
