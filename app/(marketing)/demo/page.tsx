"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Bot, BarChart2, ChevronRight, Loader2 } from "lucide-react";
import { SmsOptInDisclosure } from "@/components/forms/SmsOptIn";

const SIZES = ["75-150", "150-300", "300-400", "400+"];
const CHALLENGES = [
  "Losing first-time visitors",
  "No follow-up system",
  "Volunteer coordination",
  "Tracking guest journey",
  "Communication & outreach",
  "Reporting & analytics",
];

export default function DemoPage() {
  const [formDone, setFormDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    church_name: "",
    attendance_size: "",
    role: "",
    biggest_challenge: "",
    current_tools: "",
    goals: "",
  });

  const set = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const canSubmit = !!(
    form.first_name &&
    form.email &&
    form.church_name &&
    form.attendance_size
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "pending" }),
      }).catch(() => {});
      await fetch("https://formspree.io/f/xeeldlvg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ...form, form_type: "demo_pre_qual" }),
      });
      setFormDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-6">
                <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-wide">
                  Book a Live Demo
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.08] mb-4 tracking-tight">
                See StewardOS in action —<br className="hidden lg:block" />
                <span
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #A07830)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {" "}
                  in 30 minutes.
                </span>
              </h1>
              <p className="text-white/50 leading-relaxed mb-10 text-lg">
                We&apos;ll walk you through the Visitor Journey System, show you
                how the AI works for your specific church size, and answer every
                question you have.
              </p>

              <div className="space-y-4">
                {[
                  {
                    Icon: Map,
                    title: "Live journey map walkthrough",
                    desc: "See how a first-time visitor becomes a fully connected member in 90 days.",
                  },
                  {
                    Icon: Bot,
                    title: "AI care demo",
                    desc: "Watch the AI generate personalized follow-up messages in real time.",
                  },
                  {
                    Icon: BarChart2,
                    title: "Your church's analytics",
                    desc: "We'll show you what your retention and engagement could look like.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                    className="flex gap-4 p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors"
                  >
                    <item.Icon
                      size={24}
                      className="text-[#C9A84C] flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/8">
                <p className="text-white/30 text-xs mb-4 uppercase tracking-wide font-semibold">
                  Trusted by pastors at
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    "Grace Community Church",
                    "Cornerstone Fellowship",
                    "New Life Church",
                    "Harvest City",
                  ].map((name) => (
                    <span
                      key={name}
                      className="text-xs text-white/30 font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {!formDone ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="bg-white rounded-2xl p-7 shadow-2xl shadow-black/40"
                >
                  <h2 className="text-xl font-bold text-[#0A0A0A] mb-1">
                    Tell us about your church
                  </h2>
                  <p className="text-sm text-[#9CA3AF] mb-6">
                    This helps us tailor the demo specifically to your needs —
                    takes 2 minutes.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First name *"
                        required
                        value={form.first_name}
                        onChange={(e) => set("first_name", e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={form.last_name}
                        onChange={(e) => set("last_name", e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address *"
                      required
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    />
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone number (optional)"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                      />
                      <SmsOptInDisclosure className="mt-1" />
                    </div>
                    <input
                      type="text"
                      placeholder="Church name *"
                      required
                      value={form.church_name}
                      onChange={(e) => set("church_name", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    />

                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Weekend attendance *
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set("attendance_size", s)}
                            className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${form.attendance_size === s ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#A07830]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <select
                      value={form.role}
                      onChange={(e) => set("role", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]"
                    >
                      <option value="">Your role...</option>
                      <option>Senior Pastor</option>
                      <option>Church Planter</option>
                      <option>Executive Pastor</option>
                      <option>Administrator</option>
                      <option>Other</option>
                    </select>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Biggest challenge with guest follow-up?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CHALLENGES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => set("biggest_challenge", c)}
                            className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${form.biggest_challenge === c ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#A07830]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="What tools do you currently use? (e.g. Planning Center, Breeze)"
                      value={form.current_tools}
                      onChange={(e) => set("current_tools", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    />
                    <textarea
                      placeholder="What's the #1 outcome you're hoping for from this demo?"
                      value={form.goals}
                      onChange={(e) => set("goals", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className="w-full py-3.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <ChevronRight size={15} />
                      )}
                      {loading ? "Saving..." : "Continue to Schedule →"}
                    </button>
                    <p className="text-xs text-center text-gray-400">
                      No spam. We use this to make your demo more relevant.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="calendly"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
                >
                  <div className="px-7 pt-6 pb-2">
                    <p className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wide mb-1">
                      Step 2 of 2
                    </p>
                    <h2 className="text-xl font-bold text-[#0A0A0A]">
                      Pick a time that works for you
                    </h2>
                    <p className="text-sm text-[#9CA3AF]">
                      30-minute demo · Your info has been saved ✓
                    </p>
                  </div>
                  <iframe
                    src="https://calendly.com/erskinecurrie3/steward-os-demo"
                    width="100%"
                    height="650"
                    frameBorder="0"
                    title="Book a Demo"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
