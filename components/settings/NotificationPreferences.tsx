"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, CheckCircle, Loader2 } from "lucide-react";

type NotificationPrefs = {
  email_new_guest?: boolean;
  email_task_assigned?: boolean;
  email_weekly_summary?: boolean;
  sms_urgent_tasks?: boolean;
};

const DEFAULTS: NotificationPrefs = {
  email_new_guest: true,
  email_task_assigned: true,
  email_weekly_summary: false,
  sms_urgent_tasks: false,
};

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/notification-preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data?.preferences) setPrefs((p) => ({ ...DEFAULTS, ...p, ...data.preferences }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
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
      <div className="flex items-center gap-2 mb-1">
        <Bell size={18} className="text-[#C9A84C]" />
        <h2 className="font-bold text-[#0A0A0A]">Notification Preferences</h2>
      </div>
      <p className="text-xs text-[#9CA3AF] mb-5">
        Choose how you want to be notified about guest care activities.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[#A07830]" />
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">New guest registered</p>
              <p className="text-xs text-[#9CA3AF]">Email when a new visitor signs up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("email_new_guest")}
            className={`relative w-11 h-6 rounded-full transition-all ${prefs.email_new_guest !== false ? "bg-[#C9A84C]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs.email_new_guest !== false ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[#A07830]" />
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">Task assigned to you</p>
              <p className="text-xs text-[#9CA3AF]">Email when you receive a follow-up task</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("email_task_assigned")}
            className={`relative w-11 h-6 rounded-full transition-all ${prefs.email_task_assigned !== false ? "bg-[#C9A84C]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs.email_task_assigned !== false ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[#A07830]" />
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">Weekly summary</p>
              <p className="text-xs text-[#9CA3AF]">Monday digest of guest activity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("email_weekly_summary")}
            className={`relative w-11 h-6 rounded-full transition-all ${prefs.email_weekly_summary ? "bg-[#C9A84C]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs.email_weekly_summary ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3">
            <MessageSquare size={18} className="text-[#A07830]" />
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">Urgent tasks (SMS)</p>
              <p className="text-xs text-[#9CA3AF]">Text for high-priority follow-ups</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("sms_urgent_tasks")}
            className={`relative w-11 h-6 rounded-full transition-all ${prefs.sms_urgent_tasks ? "bg-[#C9A84C]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs.sms_urgent_tasks ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] disabled:opacity-60"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
        {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
      </button>
    </div>
  );
}
