import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#A07830] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-white text-lg">StewardOS</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              The Church Care Command Center. Close the back door. Care for every person. Lead with confidence.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/signup" className="px-4 py-2 rounded-lg bg-[#C9A84C] text-[#0A0A0A] text-sm font-semibold hover:bg-[#E8D5A3] transition-colors">
                Start Free Trial
              </Link>
              <Link href="/demo" className="px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm font-medium hover:border-white/40 hover:text-white transition-colors">
                Book Demo
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/features" className="text-white/50 text-sm hover:text-white/80 transition-colors">Features</Link></li>
              <li><Link href="/visitor-journey" className="text-white/50 text-sm hover:text-white/80 transition-colors">Visitor Journey</Link></li>
              <li><Link href="/pricing" className="text-white/50 text-sm hover:text-white/80 transition-colors">Pricing</Link></li>
              <li><Link href="/implementation" className="text-white/50 text-sm hover:text-white/80 transition-colors">Implementation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-white/50 text-sm hover:text-white/80 transition-colors">About Us</Link></li>
              <li><Link href="/resources" className="text-white/50 text-sm hover:text-white/80 transition-colors">Resources</Link></li>
              <li><Link href="/contact" className="text-white/50 text-sm hover:text-white/80 transition-colors">Contact</Link></li>
              <li><Link href="/demo" className="text-white/50 text-sm hover:text-white/80 transition-colors">Book a Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-[#C9A84C] text-sm hover:text-[#E8D5A3] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[#C9A84C] text-sm hover:text-[#E8D5A3] transition-colors">Terms of Service</Link></li>
              <li><Link href="/sms-terms" className="text-[#C9A84C] text-sm hover:text-[#E8D5A3] transition-colors">SMS Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/sign-in" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9A84C] text-[#0A0A0A] text-sm font-semibold hover:bg-[#E8D5A3] transition-colors">
                  Sign In →
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/50 text-sm hover:text-white/80 transition-colors">Dashboard</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} StewardOS. All rights reserved.</p>
          <p className="text-white/30 text-sm">Built for pastors who care deeply.</p>
        </div>
      </div>
    </footer>
  );
}
