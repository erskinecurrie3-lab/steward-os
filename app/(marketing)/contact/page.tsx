"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    first_name: "",
    email: "",
    church_name: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "contact", status: "new" }),
      }).catch(() => {});
      await fetch("https://formspree.io/f/xeeldlvg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.first_name,
          email: form.email,
          church: form.church_name,
          message: form.message,
        }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-white min-h-screen">
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[#0A0A0A] mb-4">
              Get in Touch
            </h1>
            <p className="text-[#6B7280] text-lg">
              Questions about StewardOS? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                {[
                  {
                    icon: "📧",
                    title: "Email Us",
                    value: "hello@stewardos.com",
                  },
                  {
                    icon: "📅",
                    title: "Book a Demo",
                    value: "Schedule a 30-minute call with our team",
                  },
                  {
                    icon: "💬",
                    title: "Live Chat",
                    value: "Available Mon–Fri, 9am–5pm EST",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-5 bg-[#F8F8F7] rounded-xl border border-gray-100"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-[#0A0A0A]">
                        {item.title}
                      </p>
                      <p className="text-sm text-[#6B7280]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-[#0A0A0A] rounded-2xl text-white">
                <p className="text-[#C9A84C] text-sm font-semibold mb-2">
                  Ministry Support Promise
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  We respond to every message within one business day.
                  You&apos;re not a ticket number — you&apos;re a pastor we want
                  to help.
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle
                    size={48}
                    className="text-[#C9A84C] mx-auto mb-3"
                  />
                  <h3 className="text-2xl font-bold text-[#0A0A0A] mb-2">
                    Message Sent
                  </h3>
                  <p className="text-[#6B7280]">
                    We&apos;ll be in touch within 24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name *"
                  required
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                />
                <input
                  type="email"
                  placeholder="Email address *"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                />
                <input
                  type="text"
                  placeholder="Church name"
                  value={form.church_name}
                  onChange={(e) =>
                    setForm({ ...form, church_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                />
                <textarea
                  placeholder="How can we help you? *"
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] h-32 resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#1A1A1A] transition-all disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
