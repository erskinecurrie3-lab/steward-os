import { Heart, Shield, Sprout } from "lucide-react";
import CTASection from "@/components/marketing/CTASection";

export default function About() {
  return (
    <div>
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-8">
            <span className="text-[#A07830] text-xs font-medium uppercase tracking-wide">Our Mission</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-tight mb-6">
            Built by people who love the local church.
          </h1>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            StewardOS was born from a simple conviction: every person who walks through a church door deserves to be fully seen, cared for, and given a clear path to belong.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#FDFAF5]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0A0A0A] mb-4">We believe the local church changes the world.</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">But too many churches are losing people — not because they don&apos;t care, but because they don&apos;t have a system. The pastor is the system. And that&apos;s a recipe for burnout, people loss, and regret.</p>
              <p className="text-[#6B7280] leading-relaxed mb-6">We built StewardOS to be the system that runs underneath. The infrastructure of care. The operating system that makes sure no one slips through — so pastors can lead with confidence instead of anxiety.</p>
              <div className="flex items-center gap-3">
                <div className="w-px h-12 bg-[#C9A84C]/30" />
                <p className="text-[#A07830] font-medium italic">&quot;Stewardship is caring well for what God has entrusted to you — including His people.&quot;</p>
              </div>
            </div>
            <div className="bg-[#0A0A0A] rounded-3xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 text-[#E8D5A3]">Our Commitments</h3>
              {[
                "Ministry-first product decisions — always",
                "We will never sell your church's data",
                "Simple enough for bi-vocational pastors",
                "Built for the 75–400 attendance church",
                "Continuous improvement, never complacency",
              ].map((c) => (
                <div key={c} className="flex items-start gap-3 mb-4">
                  <span className="text-[#C9A84C] mt-0.5">✦</span>
                  <span className="text-white/70 text-sm">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0A0A0A] text-center mb-12">What we stand for.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: Heart, title: "People Over Process", body: "Technology should serve people, not replace them. StewardOS keeps humans at the center of every care interaction." },
              { Icon: Shield, title: "Pastoral Integrity", body: "We're building for the pastor who genuinely cares. We won't build features that commoditize relationships." },
              { Icon: Sprout, title: "Sustainable Growth", body: "We care about healthy churches, not just big ones. Growth that retains people is growth that matters." },
            ].map((v) => (
              <div key={v.title} className="bg-[#F8F8F7] rounded-2xl p-6 border border-gray-100">
                <v.Icon size={28} className="text-[#C9A84C] mb-4" />
                <h3 className="font-bold text-[#0A0A0A] mb-2">{v.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
