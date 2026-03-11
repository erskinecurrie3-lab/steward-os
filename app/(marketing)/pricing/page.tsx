import PricingSection from "@/components/marketing/PricingSection";
import FAQSection from "@/components/marketing/FAQSection";
import CTASection from "@/components/marketing/CTASection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";

export default function PricingPage() {
  return (
    <div>
      <section className="py-16 lg:py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-6">
            <span className="text-[#A07830] text-xs font-medium uppercase tracking-wide">
              Transparent Pricing
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-tight mb-4">
            Simple, honest pricing.
          </h1>
          <p className="text-xl text-[#6B7280]">
            14-day free trial. No credit card. No contracts. Cancel anytime.
          </p>
        </div>
      </section>
      <PricingSection compact />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
