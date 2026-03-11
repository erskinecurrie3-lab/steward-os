import Link from "next/link";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import CTASection from "@/components/marketing/CTASection";
import { ArrowRight } from "lucide-react";

const deepFeatures = [
  {
    category: "Visitor Journey System",
    items: [
      { title: "AI-Powered Journey Map Builder", desc: "Build personalized 90-day assimilation pathways for every guest type in your church. The AI suggests steps, timing, and messages based on who the guest is." },
      { title: "Multi-Stage Pipeline View", desc: "See every guest's journey at a glance. Track movement from Stage 1 (Welcome) through Stage 5 (Belong) in a clean visual pipeline." },
      { title: "Journey Templates Library", desc: "Pre-built pathways for common guest types: first-time visitors, young families, singles, returning members, and more." },
    ],
  },
  {
    category: "Care Intelligence",
    items: [
      { title: "At-Risk Disengagement Alerts", desc: "Automatic flags when someone hasn't attended or been contacted in 2–3 weeks. Proactive care, not reactive regret." },
      { title: "Weekly Priority Dashboard", desc: "Every Monday morning, a curated list of who needs care this week. Prioritized by urgency, stage, and last contact." },
      { title: "AI Care Message Drafts", desc: "AI generates personalized follow-up emails and texts for each guest. You review, edit, and send — personal care at scale." },
    ],
  },
  {
    category: "Team & Workflow Tools",
    items: [
      { title: "Volunteer Care Assignments", desc: "Distribute follow-up tasks across your team. Every volunteer knows their assignment. Every guest gets consistent care." },
      { title: "Automated Follow-Up Sequences", desc: "Set-and-forget care workflows that trigger based on visit date, stage, or response. Care continues even when life gets busy." },
      { title: "Multi-User Roles", desc: "Pastor, admin, and volunteer roles with appropriate access. Your team works together without confusion." },
    ],
  },
  {
    category: "Analytics & Reporting",
    items: [
      { title: "Retention Analytics Dashboard", desc: "Track visitor return rates, connection percentages, and assimilation health over time. Know your numbers." },
      { title: "Journey Completion Reports", desc: "See which journey templates perform best. Understand where guests drop off and why." },
      { title: "Church Health Metrics", desc: "Monthly summaries of care activity, engagement trends, and at-risk populations — ready for your leadership team." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-8">
            <span className="text-[#A07830] text-xs font-medium uppercase tracking-wide">Platform Features</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-tight mb-6">
            Everything you need to care for every person.
          </h1>
          <p className="text-xl text-[#6B7280] leading-relaxed max-w-2xl mx-auto mb-8">
            StewardOS is not a feature list. It&apos;s a complete operating system for church care. Here&apos;s what it does for you.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0A0A0A] text-white font-semibold hover:bg-[#1A1A1A] transition-all">
            Start Free Trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <FeaturesGrid />

      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A0A0A]">A closer look at the platform.</h2>
          </div>
          <div className="space-y-16">
            {deepFeatures.map((group) => (
              <div key={group.category}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-gray-100" />
                  <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-widest whitespace-nowrap">{group.category}</h3>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {group.items.map((item) => (
                    <div key={item.title} className="bg-[#F8F8F7] rounded-xl p-6 border border-gray-100">
                      <h4 className="font-bold text-[#0A0A0A] mb-2">{item.title}</h4>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
