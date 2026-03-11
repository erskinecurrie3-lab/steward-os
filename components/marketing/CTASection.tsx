import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 lg:py-36 bg-[#0A0A0A] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#C9A84C]/8 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/8 mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
          <span className="text-[#E8D5A3] text-xs font-medium tracking-widest uppercase">Your church deserves a real system</span>
        </div>

        <h2 className="text-5xl lg:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
          Lead your church with the <span className="text-[#C9A84C]">confidence</span> that every person is seen.
        </h2>

        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          No more guilt on Sunday nights. No more wondering who slipped away. Start your free 14-day trial today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-base hover:bg-[#E8D5A3] transition-all duration-300 shadow-[0_0_40px_rgba(201,168,76,0.25)] hover:shadow-[0_0_60px_rgba(201,168,76,0.45)] hover:-translate-y-0.5"
          >
            Start Free 14-Day Trial
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white/70 font-semibold text-base hover:border-white/30 hover:bg-white/5 transition-all duration-300"
          >
            Book a Live Demo
          </Link>
        </div>

        <p className="text-white/20 text-sm">No credit card required · Cancel anytime · Ministry-first support</p>
      </div>
    </section>
  );
}
