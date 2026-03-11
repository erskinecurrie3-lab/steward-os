"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/features", label: "Product" },
  { href: "/visitor-journey", label: "Visitor Journey" },
  { href: "/pricing", label: "Pricing" },
  { href: "/implementation", label: "Implementation" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function MarketingNav() {
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 shadow-[0_1px_0_rgba(201,168,76,0.1)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#A07830] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-white text-lg tracking-tight">StewardOS</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm text-white/50 hover:text-white transition-colors duration-200">
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {isSignedIn ? (
              <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-xl bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8D5A3] transition-colors font-semibold">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-white/50 hover:text-white transition-colors font-medium">
                  Sign In
                </Link>
                <Link href="/demo" className="text-sm font-medium px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:border-white/30 hover:bg-white/5 transition-colors backdrop-blur-sm">
                  Book Demo
                </Link>
                <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8D5A3] transition-colors shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                  Start Free Trial →
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#0A0A0A]/98 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="block text-sm text-white/50 hover:text-white py-2.5 transition-colors">
              {label}
            </Link>
          ))}
          <Link href="/demo" onClick={() => setMobileOpen(false)} className="block text-sm text-white/50 hover:text-white py-2.5 transition-colors">
            Book Demo
          </Link>
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-center text-sm font-semibold px-4 py-3 rounded-xl bg-[#C9A84C] text-[#0A0A0A] block">
              Start Free Trial →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
