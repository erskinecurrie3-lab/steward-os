"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PortalAPI } from "@/lib/apiClient";
import { CheckCircle, User, Heart, Loader2 } from "lucide-react";
import { SmsOptInDisclosure, SmsOptInCheckbox } from "@/components/forms/SmsOptIn";

const stages = [
  { key: "stage_1_welcome", label: "Welcome", desc: "You're here! We're so glad you came.", emoji: "👋" },
  { key: "stage_2_connect", label: "Connect", desc: "Get connected with our community.", emoji: "🤝" },
  { key: "stage_3_grow", label: "Grow", desc: "Growing in faith and community.", emoji: "🌱" },
  { key: "stage_4_serve", label: "Serve", desc: "Using your gifts to serve others.", emoji: "💪" },
  { key: "stage_5_belong", label: "Belong", desc: "You're fully part of our family.", emoji: "❤️" },
];

function GuestPortalContent() {
  const searchParams = useSearchParams();
  const churchId = searchParams.get("church_id");

  const [step, setStep] = useState<"lookup" | "found" | "register" | "success">("lookup");
  const [email, setEmail] = useState("");
  const [looking, setLooking] = useState(false);
  const [guest, setGuest] = useState<{ id: string; first_name: string; last_name: string; journey_stage: string; [k: string]: unknown } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    smsOptIn: false,
    how_heard: "",
    spiritual_background: "",
    family_status: "",
    prayer_request: "",
    interests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [updateForm, setUpdateForm] = useState<{ phone: string; how_heard: string; prayer_request: string }>({ phone: "", how_heard: "", prayer_request: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [churchName, setChurchName] = useState("Our Church");

  useEffect(() => {
    if (!churchId) return;
    PortalAPI.getChurch(churchId)
      .then((data: unknown) => setChurchName((data as { name?: string })?.name ?? "Our Church"))
      .catch(() => {});
  }, [churchId]);

  const lookupGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId || !email.trim()) return;
    setLooking(true);
    setNotFound(false);
    try {
      const results = await PortalAPI.lookup(email.trim().toLowerCase(), churchId);
      const arr = Array.isArray(results) ? results : [];
      if (arr.length > 0) {
        setGuest(arr[0] as { id: string; first_name: string; last_name: string; journey_stage: string; phone?: string; how_heard?: string });
        setUpdateForm({
          phone: (arr[0] as { phone?: string })?.phone ?? "",
          how_heard: (arr[0] as { how_heard?: string })?.how_heard ?? "",
          prayer_request: "",
        });
        setStep("found");
      } else {
        setNotFound(true);
      }
    } finally {
      setLooking(false);
    }
  };

  const registerGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;
    if (registerForm.phone.trim() && !registerForm.smsOptIn) {
      alert("Please agree to receive SMS messages if you'd like to provide your phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await PortalAPI.create({
        church_id: churchId,
        first_name: registerForm.first_name,
        last_name: registerForm.last_name,
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone,
        how_heard: registerForm.how_heard,
        spiritual_background: registerForm.spiritual_background || "exploring",
        family_status: registerForm.family_status || "single",
        prayer_request: registerForm.prayer_request || "",
      });
      setStep("success");
    } finally {
      setSubmitting(false);
    }
  };

  const saveUpdates = async () => {
    if (!guest) return;
    setSaving(true);
    try {
      await PortalAPI.update(guest.id, {
        phone: updateForm.phone,
        how_heard: updateForm.how_heard,
        prayer_request: updateForm.prayer_request || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const currentStageIdx = guest ? stages.findIndex((s) => s.key === guest.journey_stage) : 0;

  if (!churchId) {
    return (
      <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center p-6">
        <p className="text-[#6B7280] text-sm">Please use a valid guest portal link (include ?church_id=...)</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="bg-[#0A0A0A] sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
              <Heart size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base leading-tight">{churchName}</p>
              <p className="text-xs text-white/40">Guest Journey Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        {step === "lookup" && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-4">
                <User size={28} className="text-[#C9A84C]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Welcome Back 👋</h1>
              <p className="text-[#6B7280] text-sm">Track your journey, update your preferences, or share a prayer request.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <form onSubmit={lookupGuest} className="space-y-4">
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1.5 block font-medium">Your email address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors" />
                </div>
                {notFound && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2.5">We couldn&apos;t find an account with that email. Would you like to register?</p>}
                <button type="submit" disabled={looking} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all disabled:opacity-60">
                  {looking ? <Loader2 size={16} className="animate-spin" /> : null}
                  {looking ? "Looking up..." : "Find My Journey →"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <button onClick={() => setStep("register")} className="text-xs text-[#C9A84C] font-semibold hover:text-[#A07830] transition-colors">
                  First time here? Register as a new visitor →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "found" && guest && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/15 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-[#A07830]">
                {guest.first_name?.[0]}
                {guest.last_name?.[0]}
              </div>
              <h1 className="text-xl font-bold text-[#0A0A0A]">Hi, {guest.first_name}! 👋</h1>
              <p className="text-sm text-[#9CA3AF]">Here&apos;s your journey at {churchName}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
              <h2 className="font-bold text-[#0A0A0A] mb-4">Your Journey</h2>
              <div className="space-y-3">
                {stages.map((stage, i) => {
                  const isComplete = i < currentStageIdx;
                  const isCurrent = i === currentStageIdx;
                  return (
                    <div key={stage.key} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isCurrent ? "bg-[#FDFAF5] border border-[#E8D5A3]/50" : "bg-gray-50/50"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${isComplete ? "bg-[#C9A84C]/20" : isCurrent ? "bg-[#C9A84C]" : "bg-gray-100"}`}>
                        {isComplete ? <CheckCircle size={18} className="text-[#C9A84C]" /> : <span>{stage.emoji}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm ${isCurrent ? "text-[#0A0A0A]" : isComplete ? "text-[#6B7280]" : "text-[#9CA3AF]"}`}>{stage.label}</p>
                          {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A84C] text-white font-semibold">You are here</span>}
                          {isComplete && <span className="text-xs text-[#C9A84C] font-semibold">✓ Complete</span>}
                        </div>
                        <p className={`text-xs ${isCurrent ? "text-[#6B7280]" : "text-[#9CA3AF]"}`}>{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-[#0A0A0A] mb-4">Update Your Preferences</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">Phone number</label>
                  <input value={updateForm.phone} onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })} placeholder="(555) 000-0000" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
                  <SmsOptInDisclosure className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">How did you hear about us?</label>
                  <select value={updateForm.how_heard} onChange={(e) => setUpdateForm({ ...updateForm, how_heard: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
                    <option value="">Select one</option>
                    {["Friend or family", "Social media", "Google search", "Drove by", "Invited by church member", "Other"].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">Prayer request (optional)</label>
                  <textarea value={updateForm.prayer_request} onChange={(e) => setUpdateForm({ ...updateForm, prayer_request: e.target.value })} placeholder="Share anything on your heart..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] h-20 resize-none" />
                </div>
                <button onClick={saveUpdates} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Updates"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "register" && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Welcome to {churchName}! 🎉</h1>
              <p className="text-[#6B7280] text-sm">Tell us a little about yourself so we can care for you well.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <form onSubmit={registerGuest} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-1 block">First name *</label>
                    <input required value={registerForm.first_name} onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-1 block">Last name</label>
                    <input value={registerForm.last_name} onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">Email address *</label>
                  <input type="email" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">Phone number</label>
                  <input value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="(555) 000-0000" />
                  <SmsOptInCheckbox checked={registerForm.smsOptIn} onChange={(v) => setRegisterForm({ ...registerForm, smsOptIn: v })} className="mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-1 block">Family status</label>
                    <select value={registerForm.family_status} onChange={(e) => setRegisterForm({ ...registerForm, family_status: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="married_with_kids">Married with kids</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-1 block">Faith background</label>
                    <select value={registerForm.spiritual_background} onChange={(e) => setRegisterForm({ ...registerForm, spiritual_background: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
                      <option value="">Select</option>
                      <option value="new_to_faith">New to faith</option>
                      <option value="returning">Returning to church</option>
                      <option value="regular_churchgoer">Regular churchgoer</option>
                      <option value="exploring">Just exploring</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">How did you hear about us?</label>
                  <input value={registerForm.how_heard} onChange={(e) => setRegisterForm({ ...registerForm, how_heard: e.target.value })} placeholder="Friend, social media, Google..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">Prayer request (optional)</label>
                  <textarea value={registerForm.prayer_request} onChange={(e) => setRegisterForm({ ...registerForm, prayer_request: e.target.value })} placeholder="We'd love to pray for you..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] h-20 resize-none" />
                </div>
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#1A1A1A] transition-all disabled:opacity-60">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                  {submitting ? "Registering..." : "Register & Start My Journey →"}
                </button>
              </form>
              <button onClick={() => setStep("lookup")} className="mt-3 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors w-full text-center">
                ← Back to lookup
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#C9A84C]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2">You&apos;re registered! 🎉</h2>
            <p className="text-[#6B7280] mb-2">Welcome to {churchName}.</p>
            <p className="text-[#6B7280] text-sm">We&apos;ll be in touch soon — look for a welcome email from our team.</p>
            <button
              onClick={() => {
                setStep("lookup");
                setEmail("");
              }}
              className="mt-6 text-xs text-[#C9A84C] font-semibold hover:text-[#A07830] transition-colors"
            >
              View my journey →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuestPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center"><Loader2 className="animate-spin text-[#C9A84C]" /></div>}>
      <GuestPortalContent />
    </Suspense>
  );
}
