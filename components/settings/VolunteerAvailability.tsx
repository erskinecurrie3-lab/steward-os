"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, Loader2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SKILLS = [
  "Phone calls",
  "Text/SMS",
  "Email outreach",
  "Home visits",
  "Prayer",
  "Small group facilitation",
  "Youth ministry",
  "Senior care",
  "New believers",
];

type VolunteerProfile = {
  availability_days: string[];
  preferred_contact_method: string;
  max_guests: number;
  skills: string[];
  notes: string;
  is_available: boolean;
};

export default function VolunteerAvailability() {
  useUser();
  const [form, setForm] = useState<VolunteerProfile>({
    availability_days: [],
    preferred_contact_method: "call",
    max_guests: 5,
    skills: [],
    notes: "",
    is_available: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/volunteer-profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.volunteer_profile) setForm((f) => ({ ...f, ...data.volunteer_profile }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      availability_days: f.availability_days.includes(day)
        ? f.availability_days.filter((d) => d !== day)
        : [...f.availability_days, day],
    }));
  };

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/volunteer-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteer_profile: form }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-center">
        <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-[#0A0A0A] mb-5">🙌 Volunteer Profile & Availability</h2>

      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 mb-5">
        <div>
          <p className="text-sm font-semibold text-[#0A0A0A]">Available for Guest Care</p>
          <p className="text-xs text-[#9CA3AF]">Toggle off if you&apos;re taking a break</p>
        </div>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, is_available: !f.is_available }))}
          className={`relative w-11 h-6 rounded-full transition-all ${form.is_available ? "bg-[#C9A84C]" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_available ? "left-6" : "left-1"}`}
          />
        </button>
      </div>

      <div className="mb-5">
        <label className="text-xs text-[#9CA3AF] uppercase tracking-wide font-semibold mb-2 block">
          Available Days
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.availability_days.includes(day) ? "bg-[#0A0A0A] text-white" : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"}`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="text-xs text-[#9CA3AF] uppercase tracking-wide font-semibold mb-2 block">
          Your Strengths & Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.skills.includes(skill) ? "bg-[#C9A84C]/20 text-[#A07830] border border-[#C9A84C]/30" : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"}`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">
            Preferred contact method
          </label>
          <select
            value={form.preferred_contact_method}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferred_contact_method: e.target.value }))
            }
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]"
          >
            <option value="call">Phone call</option>
            <option value="text">Text/SMS</option>
            <option value="email">Email</option>
            <option value="in_person">In-person</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">
            Max guests I can manage
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.max_guests}
            onChange={(e) =>
              setForm((f) => ({ ...f, max_guests: parseInt(e.target.value) || 5 }))
            }
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="text-xs text-[#9CA3AF] mb-1 block font-medium">
          Additional notes for your pastor
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Any constraints, preferences, or context..."
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] h-16 resize-none"
        />
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all disabled:opacity-60"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <CheckCircle size={14} />
        ) : null}
        {saving ? "Saving..." : saved ? "Profile Saved!" : "Save Volunteer Profile"}
      </button>
    </div>
  );
}
