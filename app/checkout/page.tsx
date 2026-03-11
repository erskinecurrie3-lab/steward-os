"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for churches just getting started with guest care.",
    features: ["Up to 150 guests", "Guest tracking & care notes", "Journey builder", "Email notifications", "1 admin user"],
    color: "border-gray-200",
    badge: null,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$99",
    period: "/month",
    description: "For growing churches ready to scale their care ministry.",
    features: ["Up to 300 guests", "Everything in Starter", "AI care message generator", "Volunteer portal", "Advanced analytics", "5 team users"],
    color: "border-[#C9A84C]",
    badge: "Most Popular",
  },
  {
    id: "network",
    name: "Network",
    price: "$199",
    period: "/month",
    description: "Full platform for established churches with large teams.",
    features: ["Unlimited guests", "Everything in Growth", "AI journey optimizer", "White-glove onboarding", "Unlimited users", "Priority support"],
    color: "border-gray-200",
    badge: null,
  },
];

export default function CheckoutPage() {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCheckout = async (plan: (typeof plans)[0]) => {
    if (!isSignedIn) {
      window.location.href = `/signup?redirect_url=${encodeURIComponent("/dashboard/settings/billing")}`;
      return;
    }
    setError("");
    setLoading(plan.id);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id === "starter" ? "growth" : plan.id }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else setError(json.error || "Failed to start checkout.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-4">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#0A0A0A] transition-colors">
            <ArrowLeft size={15} /> Back to Pricing
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0A0A0A] mb-2">Choose Your Plan</h1>
          <p className="text-[#6B7280]">Start with a 14-day free trial. Cancel anytime.</p>
        </div>

        {error && (
          <div className="max-w-sm mx-auto mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">Monthly Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 shadow-sm p-6 flex flex-col transition-all ${plan.color}`}
            >
              {plan.badge && (
                <div className="mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C9A84C] text-[#0A0A0A]">{plan.badge}</span>
                </div>
              )}
              <h3 className="font-bold text-[#0A0A0A] text-lg mb-1">{plan.name}</h3>
              <p className="text-sm text-[#9CA3AF] mb-4">{plan.description}</p>
              <div className="mb-5">
                <span className="text-3xl font-bold text-[#0A0A0A]">{plan.price}</span>
                <span className="text-sm text-[#9CA3AF]">{plan.period}</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                    <CheckCircle size={15} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan)}
                disabled={!!loading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${plan.badge ? "bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8D5A3]" : "bg-[#0A0A0A] text-white hover:bg-[#1A1A1A]"}`}
              >
                {loading === plan.id ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading === plan.id ? "Redirecting..." : isSignedIn ? "Get Started →" : "Sign up to Get Started →"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-8">
          Secure payments powered by Stripe. Test with card 4242 4242 4242 4242.
        </p>
      </div>
    </div>
  );
}
