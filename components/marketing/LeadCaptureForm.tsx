"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function LeadCaptureForm({
  source = "homepage",
  title,
  subtitle,
  dark = false,
}: {
  source?: string;
  title?: string;
  subtitle?: string;
  dark?: boolean;
}) {
  const [form, setForm] = useState({ first_name: "", email: "", church_name: "", attendance_size: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source, status: "new" }),
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`text-center py-8 ${dark ? "text-white" : "text-[#0A0A0A]"}`}>
        <CheckCircle size={40} className="text-[#C9A84C] mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">You&apos;re in.</h3>
        <p className={`text-sm ${dark ? "text-white/60" : "text-[#6B7280]"}`}>We&apos;ll be in touch shortly. Check your email for next steps.</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h3 className={`text-2xl font-bold mb-2 ${dark ? "text-white" : "text-[#0A0A0A]"}`}>{title}</h3>}
      {subtitle && <p className={`text-sm mb-6 ${dark ? "text-white/60" : "text-[#6B7280]"}`}>{subtitle}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className={`px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-[#C9A84C] transition-colors ${dark ? "bg-white/10 border-white/20 text-white placeholder-white/40" : "bg-white border-gray-200 text-[#0A0A0A] placeholder-[#9CA3AF]"}`}
          />
          <input
            type="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-[#C9A84C] transition-colors ${dark ? "bg-white/10 border-white/20 text-white placeholder-white/40" : "bg-white border-gray-200 text-[#0A0A0A] placeholder-[#9CA3AF]"}`}
          />
        </div>
        <input
          type="text"
          placeholder="Church name"
          value={form.church_name}
          onChange={(e) => setForm({ ...form, church_name: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-[#C9A84C] transition-colors ${dark ? "bg-white/10 border-white/20 text-white placeholder-white/40" : "bg-white border-gray-200 text-[#0A0A0A] placeholder-[#9CA3AF]"}`}
        />
        <select
          value={form.attendance_size}
          onChange={(e) => setForm({ ...form, attendance_size: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-[#C9A84C] transition-colors ${dark ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-200 text-[#6B7280]"}`}
        >
          <option value="">Weekly attendance size</option>
          <option value="75-150">75–150</option>
          <option value="150-300">150–300</option>
          <option value="300-400">300–400</option>
          <option value="400+">400+</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Start My Free 14-Day Trial"}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  );
}
