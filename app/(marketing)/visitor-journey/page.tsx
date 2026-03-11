import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CTASection from "@/components/marketing/CTASection";

const stages = [
  {
    number: "01",
    name: "Welcome",
    days: "Days 1–7",
    color: "bg-[#C9A84C]",
    textColor: "text-white",
    actions: [
      "Personalized welcome email within 24 hours",
      "Handwritten (or digital) note from the pastor",
      "Volunteer connection point made",
      "Visitor profile created in StewardOS",
    ],
  },
  {
    number: "02",
    name: "Connect",
    days: "Days 8–21",
    color: "bg-[#0A0A0A]",
    textColor: "text-white",
    actions: [
      "Personal phone call or text from care volunteer",
      "Invitation to a connection group or event",
      "Second-visit encouragement if they return",
      "Family or individual needs noted",
    ],
  },
  {
    number: "03",
    name: "Grow",
    days: "Days 22–45",
    color: "bg-[#C9A84C]",
    textColor: "text-white",
    actions: [
      "Small group or discipleship class invitation",
      "Personalized growth pathway suggested by AI",
      "Check-in call at 30-day mark",
      "Spiritual background and interests captured",
    ],
  },
  {
    number: "04",
    name: "Serve",
    days: "Days 46–70",
    color: "bg-purple-600",
    textColor: "text-white",
    actions: [
      "Gifts and interests identified",
      "Volunteer opportunity introduced",
      "Ministry team invitation extended",
      "Service engagement tracked",
    ],
  },
  {
    number: "05",
    name: "Belong",
    days: "Days 71–90",
    color: "bg-green-600",
    textColor: "text-white",
    actions: [
      "Membership class or covenant path offered",
      "Official member onboarding if accepted",
      "Long-term care plan transitioned to pastoral team",
      "Guest marked as 'connected' in system",
    ],
  },
];

export default function VisitorJourneyPage() {
  return (
    <div>
      <section className="py-14 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-6">
            <span className="text-[#A07830] text-xs font-medium uppercase tracking-wide">
              The Core System
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-tight mb-4">
            The Visitor Journey Map.
          </h1>
          <p className="text-base sm:text-xl text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
            Every guest who walks through your doors gets a clear, personalized
            90-day pathway from first visit to fully belonging. Built by AI. Run
            by your team.
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-16 bg-[#F8F8F7]">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 lg:overflow-visible lg:mb-16">
            {stages.map((stage, i) => (
              <div
                key={stage.number}
                className="flex flex-col items-center flex-shrink-0 w-28 lg:flex-1 lg:w-auto gap-2"
              >
                <div
                  className={`${stage.color} rounded-xl p-3 lg:p-4 text-center w-full`}
                >
                  <p
                    className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest ${stage.textColor} opacity-70`}
                  >
                    {stage.days}
                  </p>
                  <p
                    className={`text-base lg:text-xl font-bold ${stage.textColor} mt-0.5`}
                  >
                    {stage.name}
                  </p>
                </div>
                {i < stages.length - 1 && (
                  <div className="hidden lg:block text-[#C9A84C] text-xl self-center">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {stages.map((stage) => (
              <div
                key={stage.number}
                className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-7"
              >
                <div className="flex items-start gap-3 lg:gap-4">
                  <div
                    className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl ${stage.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-xs lg:text-sm">
                      {stage.number}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-base lg:text-xl font-bold text-[#0A0A0A]">
                        Stage {stage.number}: {stage.name}
                      </h3>
                      <span className="text-xs text-[#9CA3AF] bg-gray-50 px-2 py-0.5 rounded-full">
                        {stage.days}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {stage.actions.map((action) => (
                        <div key={action} className="flex items-start gap-2">
                          <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">
                            ✓
                          </span>
                          <span className="text-sm text-[#6B7280]">
                            {action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="bg-[#0A0A0A] rounded-2xl lg:rounded-3xl p-7 lg:p-10 text-white text-center">
            <p className="text-[#C9A84C] text-xs lg:text-sm font-semibold uppercase tracking-widest mb-3">
              AI Personalization
            </p>
            <h2 className="text-2xl lg:text-4xl font-bold mb-3">
              Not one journey. Hundreds of them.
            </h2>
            <p className="text-white/60 text-base lg:text-lg max-w-xl mx-auto mb-6">
              Every guest profile is different. StewardOS builds a custom
              journey for each person based on their background, family
              situation, and spiritual stage — not a one-size-fits-all
              checklist.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold hover:bg-[#E8D5A3] transition-all text-sm lg:text-base"
            >
              See It In Action <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
