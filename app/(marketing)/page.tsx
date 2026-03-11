import HeroSection from "@/components/marketing/HeroSection";
import ProblemSection from "@/components/marketing/ProblemSection";
import SolutionSection from "@/components/marketing/SolutionSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import UseCaseSection from "@/components/marketing/UseCaseSection";
import ComparisonSection from "@/components/marketing/ComparisonSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import PricingSection from "@/components/marketing/PricingSection";
import FAQSection from "@/components/marketing/FAQSection";
import CTASection from "@/components/marketing/CTASection";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesGrid />
      <UseCaseSection />
      <ComparisonSection />
      <TestimonialsSection />

      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-xl mx-auto px-6">
          <LeadCaptureForm
            dark
            source="homepage"
            title="Start your free 14-day trial."
            subtitle="No credit card. No commitment. Full access."
          />
        </div>
      </section>

      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
