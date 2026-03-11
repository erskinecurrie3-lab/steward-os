"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, Lock, Eye } from "lucide-react";
import { SmsOptInDisclosure } from "@/components/forms/SmsOptIn";

export default function PrayerRequestPage() {
  const [churchName, setChurchName] = useState("Our Church");
  const [churchSlug, setChurchSlug] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "submitting" | "success">("form");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({
    submitter_name: "",
    submitter_email: "",
    submitter_phone: "",
    request_text: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("church");
    if (slug) setChurchSlug(slug);
  }, []);

  useEffect(() => {
    if (!churchSlug) return;
    fetch(`/api/church-by-slug?slug=${encodeURIComponent(churchSlug)}`)
      .then((r) => r.json())
      .then((data) => setChurchName(data.name || "Our Church"))
      .catch(() => {});
  }, [churchSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("submitting");
    try {
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          church_slug: churchSlug,
          request_text: form.request_text,
          is_anonymous: isAnonymous,
          submitter_name: isAnonymous ? "" : form.submitter_name,
          submitter_email: isAnonymous ? "" : form.submitter_email,
          submitter_phone: isAnonymous ? "" : form.submitter_phone,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit");
      }
      setStep("success");
    } catch (err) {
      setStep("form");
      alert(err instanceof Error ? err.message : "Failed to submit prayer request");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFAF5] to-[#F8F8F7]">
      <div className="bg-[#0A0A0A]">
        <div className="max-w-lg mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#A07830] flex items-center justify-center flex-shrink-0">
            <Heart size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">{churchName}</p>
            <p className="text-xs text-white/40">Prayer Request</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        {step === "success" ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-6">
              <Heart size={36} className="text-[#C9A84C]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-3">We&apos;re Praying for You 🙏</h2>
            <p className="text-[#6B7280] mb-2 leading-relaxed">
              Your prayer request has been received. Our pastoral care team will be in touch soon.
            </p>
            <p className="text-sm text-[#9CA3AF] mb-8">You are not alone — we stand with you.</p>
            <button
              onClick={() => {
                setStep("form");
                setForm({ submitter_name: "", submitter_email: "", submitter_phone: "", request_text: "" });
              }}
              className="text-sm text-[#C9A84C] font-semibold hover:text-[#A07830] transition-colors"
            >
              Submit another request →
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Share Your Prayer Request</h1>
              <p className="text-[#6B7280] text-sm leading-relaxed max-w-sm mx-auto">
                We believe in the power of prayer. Share what&apos;s on your heart and our team will pray with you.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    {isAnonymous ? <Lock size={15} className="text-[#C9A84C]" /> : <Eye size={15} className="text-[#6B7280]" />}
                    <div>
                      <p className="text-sm font-semibold text-[#0A0A0A]">{isAnonymous ? "Anonymous Request" : "Share My Name"}</p>
                      <p className="text-xs text-[#9CA3AF]">{isAnonymous ? "Your name will not be shared" : "Pastoral team will know who you are"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${isAnonymous ? "bg-[#C9A84C]" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${isAnonymous ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>

                {!isAnonymous && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#9CA3AF] mb-1.5 block font-medium">Your name *</label>
                      <input
                        required={!isAnonymous}
                        value={form.submitter_name}
                        onChange={(e) => setForm({ ...form, submitter_name: e.target.value })}
                        placeholder="First and last name"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#9CA3AF] mb-1.5 block font-medium">Email</label>
                        <input
                          type="email"
                          value={form.submitter_email}
                          onChange={(e) => setForm({ ...form, submitter_email: e.target.value })}
                          placeholder="you@email.com"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#9CA3AF] mb-1.5 block font-medium">Phone</label>
                        <input
                          type="tel"
                          value={form.submitter_phone}
                          onChange={(e) => setForm({ ...form, submitter_phone: e.target.value })}
                          placeholder="(555) 000-0000"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                        />
                        <SmsOptInDisclosure className="mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1.5 block font-medium">Your prayer request *</label>
                  <textarea
                    required
                    value={form.request_text}
                    onChange={(e) => setForm({ ...form, request_text: e.target.value })}
                    placeholder="Share what's on your heart. Be as specific or general as you'd like — God hears every word..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none transition-colors leading-relaxed"
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1.5">Your request is handled with care and confidentiality.</p>
                </div>

                <button
                  type="submit"
                  disabled={step === "submitting" || !form.request_text.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60 shadow-sm"
                >
                  {step === "submitting" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Heart size={15} /> Submit Prayer Request
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-[#9CA3AF] mt-5">🔒 All requests are kept private and shared only with the pastoral care team.</p>
          </>
        )}
      </div>
    </div>
  );
}
