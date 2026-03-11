"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { SmsOptInDisclosure } from "@/components/forms/SmsOptIn";

const FORMSPREE_URL = "https://formspree.io/f/xeeldlvg";

export default function IntakeForm({ pkg, onClose }: { pkg?: string; onClose: () => void }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    church_name: "",
    role: "",
    attendance_size: "",
    biggest_challenge: "",
    current_tools: "",
    timeline: "",
    package: pkg || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...form, subject: `Implementation Intake — ${form.package || "General"} — ${form.church_name}` }),
    });

    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        church_name: form.church_name,
        source: "implementation",
        status: "demo_booked",
        notes: `Package: ${form.package}. Challenge: ${form.biggest_challenge}. Tools: ${form.current_tools}. Timeline: ${form.timeline}`,
      }),
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <CheckCircle size={48} className="text-[#C9A84C] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#0A0A0A] mb-2">Application Received!</h3>
        <p className="text-[#6B7280] text-sm mb-1">We&apos;ll review your intake and reach out within 24 hours to schedule your implementation kickoff call.</p>
        <p className="text-[#9CA3AF] text-xs">Check <strong>{form.email}</strong> for confirmation.</p>
        <button onClick={onClose} className="mt-5 text-sm text-[#C9A84C] font-semibold hover:text-[#A07830]">
          Close ×
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-[#0A0A0A] mb-1">Implementation Intake Form</h3>
      <p className="text-sm text-[#6B7280] mb-6">Tell us about your church so we can prepare for your launch call.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">First name *</label>
            <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">Last name</label>
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">Email *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="(555) 000-0000" />
            <SmsOptInDisclosure className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">Your role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
              <option value="">Select...</option>
              <option>Senior Pastor</option>
              <option>Executive Pastor</option>
              <option>Church Planter</option>
              <option>Administrator</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">Church name *</label>
            <input required value={form.church_name} onChange={(e) => setForm({ ...form, church_name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">Attendance size</label>
            <select value={form.attendance_size} onChange={(e) => setForm({ ...form, attendance_size: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
              <option value="">Select...</option>
              <option value="75-150">75–150</option>
              <option value="150-300">150–300</option>
              <option value="300-400">300–400</option>
              <option value="400+">400+</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">Package interested in</label>
          <select value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
            <option value="">Not sure yet</option>
            <option value="Essentials Launch ($497)">Essentials Launch ($497)</option>
            <option value="Full System Launch ($997)">Full System Launch ($997)</option>
            <option value="Ministry Transformation ($1,497)">Ministry Transformation ($1,497)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">What tools do you currently use for guest follow-up?</label>
          <input value={form.current_tools} onChange={(e) => setForm({ ...form, current_tools: e.target.value })} placeholder="e.g. Spreadsheets, Planning Center, nothing formal..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">What&apos;s your biggest challenge with visitor retention?</label>
          <textarea value={form.biggest_challenge} onChange={(e) => setForm({ ...form, biggest_challenge: e.target.value })} placeholder="Be specific — this helps us customize your setup..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] h-20 resize-none" />
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">When do you want to launch?</label>
          <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
            <option value="">Select timeline...</option>
            <option>ASAP (this week)</option>
            <option>Within 2 weeks</option>
            <option>Within the month</option>
            <option>Next season / planning ahead</option>
          </select>
        </div>
        <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : "Submit Intake & Book Launch Call →"}
        </button>
        <p className="text-xs text-[#9CA3AF] text-center">We&apos;ll review your intake and reach out within 24 hours.</p>
      </form>
    </div>
  );
}
