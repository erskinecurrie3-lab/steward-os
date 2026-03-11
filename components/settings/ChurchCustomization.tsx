"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

const DEFAULT_EVENT_TYPES = [
  "Sunday Service",
  "Bible Study",
  "Youth Group",
  "Small Groups",
  "Outreach",
  "Worship Night",
  "Men's Ministry",
  "Women's Ministry",
];
const DEFAULT_MINISTRIES = [
  "Worship Team",
  "Outreach",
  "Children's Ministry",
  "Youth Ministry",
  "Small Groups",
  "Hospitality",
  "Media/AV",
  "Prayer Team",
];
const DEFAULT_CHANNELS = [
  "Email",
  "SMS",
  "Phone Call",
  "WhatsApp",
  "In-Person Visit",
];

function TagEditor({
  label,
  values = [],
  defaults,
  onChange,
}: {
  label: string;
  values: string[];
  defaults: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = (val: string) => {
    const v = val.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div>
      <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C9A84C]/15 text-[#A07830] text-xs font-semibold"
          >
            {v}
            <button type="button" onClick={() => remove(v)} className="hover:text-red-500 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add(input))}
          placeholder="Add custom..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#C9A84C]"
        />
        <button
          type="button"
          onClick={() => add(input)}
          className="px-3 py-2 rounded-lg bg-[#C9A84C]/10 text-[#A07830] hover:bg-[#C9A84C]/20 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {defaults
          .filter((d) => !values.includes(d))
          .slice(0, 5)
          .map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => add(d)}
              className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-[#9CA3AF] hover:border-[#C9A84C]/40 hover:text-[#A07830] transition-all"
            >
              + {d}
            </button>
          ))}
      </div>
    </div>
  );
}

export type ChurchProfileForm = {
  event_types?: string[];
  ministries?: string[];
  communication_channels?: string[];
};

export default function ChurchCustomization({
  profileForm,
  setProfileForm,
  onSave,
  saving,
}: {
  profileForm: ChurchProfileForm;
  setProfileForm: React.Dispatch<React.SetStateAction<ChurchProfileForm>>;
  onSave?: () => Promise<void>;
  saving?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <h2 className="font-bold text-[#0A0A0A]">Church Customization</h2>
      <p className="text-xs text-[#9CA3AF] -mt-3">
        Tailor workflows, events, and reporting to your church&apos;s specific structure.
      </p>

      <TagEditor
        label="Event Types"
        values={profileForm.event_types || []}
        defaults={DEFAULT_EVENT_TYPES}
        onChange={(v) => setProfileForm((f) => ({ ...f, event_types: v }))}
      />

      <TagEditor
        label="Ministries"
        values={profileForm.ministries || []}
        defaults={DEFAULT_MINISTRIES}
        onChange={(v) => setProfileForm((f) => ({ ...f, ministries: v }))}
      />

      <TagEditor
        label="Communication Channels"
        values={profileForm.communication_channels || []}
        defaults={DEFAULT_CHANNELS}
        onChange={(v) => setProfileForm((f) => ({ ...f, communication_channels: v }))}
      />

      {onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Customization"}
        </button>
      )}
    </div>
  );
}
