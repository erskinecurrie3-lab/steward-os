"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingSection({ compact = false }: { compact?: boolean }) {
  const plans = [
    { name: "Starter", price: "$49", period: "/month", description: "For churches with 75–150 weekly attendance", features: ["Up to 150 guest profiles", "AI Visitor Journey Map (2 templates)", "Automated follow-up workflows", "Weekly priority dashboard", "At-risk alerts", "Care notes timeline", "Email support"], cta: "Start Free Trial", popular: false },
    { name: "Growth", price: "$99", period: "/month", description: "For churches with 150–300 weekly attendance", features: ["Up to 400 guest profiles", "AI Visitor Journey Map (unlimited templates)", "Advanced workflows & automations", "AI-generated messages (email + SMS)", "Volunteer assignment system", "Retention analytics dashboard", "Multi-user (up to 5 seats)", "Priority email & chat support"], cta: "Start Free Trial", popular: true },
    { name: "Network", price: "$199", period: "/month", description: "For churches with 300–400 weekly attendance", features: ["Unlimited guest profiles", "Everything in Growth", "Custom church branding", "API access & data export", "Dedicated onboarding coach", "Unlimited user seats", "White-glove support", "Quarterly strategy reviews"], cta: "Start Free Trial", popular: false },
  ];

  return (
    <section className={`${compact ? "py-12" : "py-24 lg:py-32"} bg-white`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {!compact && (
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0A0A0A] leading-tight mb-6">
              Simple pricing. Real transformation.
            </h2>
            <p className="text-[#6B7280] text-lg">14-day free trial. No credit card required. Cancel anytime.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-5 lg:p-7 border transition-all ${plan.popular ? "bg-[#0A0A0A] border-[#C9A84C]/30 shadow-xl lg:scale-105" : "bg-white border-gray-200 hover:border-[#C9A84C]/30 hover:shadow-md"}`}>
              {plan.popular && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 mb-4">
                  <span className="text-[#E8D5A3] text-xs font-semibold">Most Popular</span>
                </div>
              )}
              <h3 className={`font-bold text-xl mb-1 ${plan.popular ? "text-white" : "text-[#0A0A0A]"}`}>{plan.name}</h3>
              <p className={`text-xs mb-4 ${plan.popular ? "text-white/50" : "text-[#9CA3AF]"}`}>{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? "text-[#E8D5A3]" : "text-[#0A0A0A]"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-white/40" : "text-[#9CA3AF]"}`}>{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={15} className="flex-shrink-0 mt-0.5 text-[#C9A84C]" />
                    <span className={`text-sm ${plan.popular ? "text-white/70" : "text-[#6B7280]"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/checkout?plan=${plan.name.toLowerCase()}`} className={`w-full block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? "bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8D5A3]" : "bg-[#0A0A0A] text-white hover:bg-[#1A1A1A]"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-[#FDFAF5] border border-[#E8D5A3]/50 rounded-2xl p-7 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 mb-3">
              <span className="text-[#A07830] text-xs font-semibold">Add-On Service</span>
            </div>
            <h3 className="text-xl font-bold text-[#0A0A0A] mb-2">Launch in 30 Days — Implementation Package</h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">White-glove setup: we build your journey maps, configure your workflows, train your team, and make sure StewardOS is fully running within 30 days.</p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-3xl font-bold text-[#0A0A0A]">$497–$1,497</p>
            <p className="text-xs text-[#9CA3AF] mb-3">one-time investment</p>
            <Link href="/implementation" className="block px-5 py-2.5 rounded-xl border-2 border-[#C9A84C] text-[#A07830] font-semibold text-sm hover:bg-[#C9A84C] hover:text-white transition-all">
              View Packages
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
