"use client";

import { useState } from "react";
import { X, Check, Wand2, Loader2 } from "lucide-react";

export type SequenceStep = {
  id?: string;
  name: string;
  trigger_type?: string;
  journey_stage?: string;
  channel: string;
  delay_days: number;
  message_template?: string | null;
  is_active: boolean;
};

export default function SequenceStepEditor({
  step,
  onSave,
  onClose,
}: {
  step?: SequenceStep | null;
  onSave: (saved: SequenceStep) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SequenceStep>({
    name: step?.name ?? "",
    trigger_type: step?.trigger_type ?? "new_visitor_email_sequence",
    journey_stage: step?.journey_stage ?? "stage_1_welcome",
    channel: step?.channel ?? "email",
    delay_days: step?.delay_days ?? 1,
    message_template: step?.message_template ?? "",
    is_active: step?.is_active ?? true,
    ...(step?.id && { id: step.id }),
  });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const set = (k: keyof SequenceStep, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const generateTemplate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: form.delay_days,
          prompt: `Write a warm, pastoral church follow-up email for a new guest on Day ${form.delay_days} of their visitor journey. Use {first_name} placeholder. Tone: warm, genuine, pastoral — not salesy. Sign as "The Pastoral Team". Format: Subject: [subject line] then two blank lines then body.`,
        }),
      });
      const data = await res.json();
      if (data?.result) {
        set("message_template", data.result);
        if (!form.name) set("name", `Day ${form.delay_days} – Follow-Up Email`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/follow-up-sequences", {
        method: step?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(step?.id ? { id: step.id, ...form } : form),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || "Failed to save");
      onSave(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-12 px-4 pb-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-[#0A0A0A]">
            {step ? "Edit Email Step" : "New Email Step"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Step Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="e.g. Day 7 – Connect Email"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Send on Day *</label>
              <input
                type="number"
                min={0}
                required
                value={form.delay_days}
                onChange={(e) => set("delay_days", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="e.g. 7"
              />
              <p className="text-xs text-[#9CA3AF] mt-1">Days after guest is added</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => set("channel", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400 block">Email Template *</label>
              <button
                type="button"
                onClick={generateTemplate}
                disabled={generating}
                className="flex items-center gap-1 text-xs text-[#A07830] hover:text-[#C9A84C] transition-colors font-medium"
              >
                {generating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Wand2 size={11} />
                )}
                {generating ? "Writing..." : "AI Write"}
              </button>
            </div>
            <textarea
              required
              value={form.message_template ?? ""}
              onChange={(e) => set("message_template", e.target.value)}
              rows={10}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none font-mono"
              placeholder={`Subject: So glad you joined us!\n\nHi {first_name},\n\nWe're so grateful you visited this Sunday...`}
            />
            <p className="text-xs text-[#9CA3AF] mt-1">
              Start with <code className="bg-gray-100 px-1 rounded">Subject: your subject line</code>{" "}
              then the body. Use <code className="bg-gray-100 px-1 rounded">{"{first_name}"}</code> for
              personalization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <label htmlFor="is_active" className="text-sm text-[#374151]">
              Active — send this email automatically to new guests
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] flex items-center gap-2 disabled:opacity-60"
            >
              <Check size={14} /> {saving ? "Saving..." : "Save Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
