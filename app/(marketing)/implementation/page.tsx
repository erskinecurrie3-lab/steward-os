"use client";

import { useState } from "react";
import { Check, ArrowRight, X } from "lucide-react";
import CTASection from "@/components/marketing/CTASection";
import IntakeForm from "@/components/implementation/IntakeForm";

export default function ImplementationPage() {
  const [showIntake, setShowIntake] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState("");

  const openIntake = (pkgName = "") => {
    setSelectedPkg(pkgName);
    setShowIntake(true);
  };

  const packages = [
    {
      name: "Essentials Launch",
      price: "$497",
      description:
        "For churches that want to get started fast with expert guidance.",
      includes: [
        "90-minute strategy onboarding call",
        "2 custom Visitor Journey Maps built for you",
        "Workflow configuration",
        "Team training session (1 hour)",
        "30-day email support",
      ],
    },
    {
      name: "Full System Launch",
      price: "$997",
      description: "Complete white-glove implementation — we build everything.",
      includes: [
        "Everything in Essentials",
        "5 custom Journey Maps for all guest types",
        "Guest data migration (up to 500 records)",
        "Volunteer assignment setup",
        "Custom message template library",
        "2 live training sessions",
        "60-day priority support",
      ],
      popular: true,
    },
    {
      name: "Ministry Transformation",
      price: "$1,497",
      description:
        "For churches that want the full StewardOS transformation experience.",
      includes: [
        "Everything in Full System Launch",
        "Unlimited Journey Maps",
        "Complete team onboarding program",
        "4 strategy sessions over 30 days",
        "Custom analytics dashboard setup",
        "90-day priority support",
        "Quarterly review call",
      ],
    },
  ];

  const timeline = [
    {
      week: "Week 1",
      title: "Discovery & Strategy",
      desc: "We learn your church, your people, and your current process. We define your Guest Journey stages and care priorities.",
    },
    {
      week: "Week 2",
      title: "Build & Configure",
      desc: "Your Journey Maps are built. Workflows are configured. Guest profiles are created or imported. The system goes live.",
    },
    {
      week: "Week 3",
      title: "Train & Launch",
      desc: "Your team is trained. Volunteers know their role. You run your first week on StewardOS — with us by your side.",
    },
    {
      week: "Week 4",
      title: "Review & Refine",
      desc: "We review the first month's data together. Adjust journeys, workflows, and priorities. You're now running independently.",
    },
  ];

  return (
    <div>
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-8">
            <span className="text-[#A07830] text-xs font-medium uppercase tracking-wide">
              Done-For-You Setup
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-tight mb-6">
            Launch in 30 Days — Guaranteed.
          </h1>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto mb-8 leading-relaxed">
            You don&apos;t have time to learn new software. Our implementation
            team builds StewardOS for you, trains your team, and ensures
            you&apos;re fully running — in 30 days.
          </p>
          <button
            onClick={() => openIntake()}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold hover:bg-[#E8D5A3] transition-all"
          >
            Apply Now — Book Launch Call <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="py-16 bg-[#F8F8F7]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0A0A0A] text-center mb-12">
            The 30-Day Roadmap
          </h2>
          <div className="relative">
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-[#C9A84C]/20" />
            <div className="space-y-8">
              {timeline.map((t, i) => (
                <div
                  key={t.week}
                  className={`flex gap-6 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-start`}
                >
                  <div className="hidden lg:block flex-1" />
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#0A0A0A] flex items-center justify-center flex-shrink-0 border-4 border-[#F8F8F7]">
                    <span className="text-[#C9A84C] text-xs font-bold">
                      {t.week}
                    </span>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-bold text-[#0A0A0A] mb-1">{t.title}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#0A0A0A] mb-3">
              Choose your implementation package.
            </h2>
            <p className="text-[#6B7280]">
              One-time investment. Lifetime impact.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl border p-7 ${(pkg as { popular?: boolean }).popular ? "bg-[#0A0A0A] border-[#C9A84C]/30 shadow-xl" : "bg-white border-gray-200"}`}
              >
                {(pkg as { popular?: boolean }).popular && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#C9A84C]/20 text-[#E8D5A3] text-xs font-bold mb-4">
                    Most Popular
                  </span>
                )}
                <h3
                  className={`font-bold text-xl mb-1 ${(pkg as { popular?: boolean }).popular ? "text-white" : "text-[#0A0A0A]"}`}
                >
                  {pkg.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${(pkg as { popular?: boolean }).popular ? "text-white/50" : "text-[#9CA3AF]"}`}
                >
                  {pkg.description}
                </p>
                <p
                  className={`text-4xl font-bold mb-6 ${(pkg as { popular?: boolean }).popular ? "text-[#E8D5A3]" : "text-[#0A0A0A]"}`}
                >
                  {pkg.price}
                </p>
                <ul className="space-y-2.5 mb-7">
                  {pkg.includes.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        size={15}
                        className="text-[#C9A84C] flex-shrink-0 mt-0.5"
                      />
                      <span
                        className={`text-sm ${(pkg as { popular?: boolean }).popular ? "text-white/70" : "text-[#6B7280]"}`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openIntake(pkg.name + " (" + pkg.price + ")")}
                  className={`w-full block text-center py-3 rounded-xl font-bold text-sm transition-all ${(pkg as { popular?: boolean }).popular ? "bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8D5A3]" : "bg-[#0A0A0A] text-white hover:bg-[#1A1A1A]"}`}
                >
                  Get Started — Fill Intake Form
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />

      {showIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-7 relative">
            <button
              onClick={() => setShowIntake(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#6B7280] hover:bg-gray-200 transition-all"
            >
              <X size={16} />
            </button>
            <IntakeForm
              pkg={selectedPkg}
              onClose={() => setShowIntake(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
