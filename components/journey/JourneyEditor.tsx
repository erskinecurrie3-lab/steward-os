"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, Save, Loader2 } from "lucide-react";

export type TouchpointDraft = {
  id?: string;
  title: string;
  description?: string;
  type: string;
  daysOffset: number;
};

export type StageDraft = {
  id?: string;
  name: string;
  label: string;
  description?: string;
};

type Props = {
  title: string;
  description: string;
  category: string;
  days: number;
  touchpointList: TouchpointDraft[];
  stages: StageDraft[];
  onSave: (data: {
    title: string;
    description: string;
    category: string;
    touchpoints: number;
    days: number;
    touchpointList: TouchpointDraft[];
    stages: StageDraft[];
  }) => Promise<void>;
  saving?: boolean;
};

export default function JourneyEditor({
  title: initTitle,
  description: initDesc,
  category: initCat,
  days: initDays,
  touchpointList: initTpList,
  stages: initStages,
  onSave,
  saving = false,
}: Props) {
  const [title, setTitle] = useState(initTitle);
  const [description, setDescription] = useState(initDesc);
  const [category, setCategory] = useState(initCat);
  const [days, setDays] = useState(initDays);
  const [touchpointList, setTouchpointList] = useState<TouchpointDraft[]>(
    initTpList.length > 0 ? initTpList : [{ title: "Welcome Call", description: "", type: "manual", daysOffset: 0 }]
  );
  const [stages, setStages] = useState<StageDraft[]>(
    initStages.length > 0 ? initStages : [{ name: "stage_1_welcome", label: "Welcome", description: "" }]
  );

  const addTouchpoint = () => {
    setTouchpointList((prev) => [...prev, { title: `Step ${prev.length + 1}`, description: "", type: "manual", daysOffset: prev.length * 7 }]);
  };

  const removeTouchpoint = (i: number) => {
    setTouchpointList((prev) => prev.filter((_, j) => j !== i));
  };

  const updateTouchpoint = (i: number, field: keyof TouchpointDraft, value: string | number) => {
    setTouchpointList((prev) => prev.map((tp, j) => (j === i ? { ...tp, [field]: value } : tp)));
  };

  const addStage = () => {
    setStages((prev) => [...prev, { name: `stage_${prev.length + 1}`, label: `Stage ${prev.length + 1}`, description: "" }]);
  };

  const removeStage = (i: number) => {
    setStages((prev) => prev.filter((_, j) => j !== i));
  };

  const updateStage = (i: number, field: keyof StageDraft, value: string) => {
    setStages((prev) => prev.map((s, j) => (j === i ? { ...s, [field]: value } : s)));
  };

  const handleSave = () => {
    onSave({ title, description, category, touchpoints: touchpointList.length, days, touchpointList, stages });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
            placeholder="Journey name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
            placeholder="e.g. Most Popular"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
          placeholder="Describe this visitor pathway"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Duration (days)</label>
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 30)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[#0A0A0A] text-sm">Touchpoints</h4>
          <button onClick={addTouchpoint} className="flex items-center gap-1.5 text-xs font-medium text-[#C9A84C] hover:text-[#A07830]">
            <Plus size={14} /> Add touchpoint
          </button>
        </div>
        <div className="space-y-2">
          {touchpointList.map((tp, i) => (
            <div key={i} className="flex gap-2 items-start p-3 rounded-xl bg-gray-50 border border-gray-100">
              <GripVertical size={16} className="text-[#9CA3AF] mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  value={tp.title}
                  onChange={(e) => updateTouchpoint(i, "title", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                  placeholder="Touchpoint title"
                />
                <div className="flex gap-2 items-center">
                  <select
                    value={tp.type}
                    onChange={(e) => updateTouchpoint(i, "type", e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="manual">Manual</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="task">Task</option>
                    <option value="automation">Automation</option>
                  </select>
                  <span className="text-xs text-[#9CA3AF]">Day</span>
                  <input
                    type="number"
                    min={0}
                    value={tp.daysOffset}
                    onChange={(e) => updateTouchpoint(i, "daysOffset", Number(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded border border-gray-200 text-xs"
                  />
                </div>
                <textarea
                  value={tp.description || ""}
                  onChange={(e) => updateTouchpoint(i, "description", e.target.value)}
                  rows={1}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#C9A84C] resize-none"
                  placeholder="Notes"
                />
              </div>
              <button onClick={() => removeTouchpoint(i)} className="p-2 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[#0A0A0A] text-sm">Stages</h4>
          <button onClick={addStage} className="flex items-center gap-1.5 text-xs font-medium text-[#C9A84C] hover:text-[#A07830]">
            <Plus size={14} /> Add stage
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {stages.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20">
              <input
                value={s.label}
                onChange={(e) => updateStage(i, "label", e.target.value)}
                className="w-24 px-2 py-1 rounded border border-transparent bg-transparent text-xs font-medium text-[#0A0A0A] focus:outline-none focus:bg-white focus:border-gray-200"
                placeholder="Label"
              />
              <input
                value={s.name}
                onChange={(e) => updateStage(i, "name", e.target.value)}
                className="w-28 px-2 py-1 rounded border border-gray-200/50 text-xs text-[#6B7280] focus:outline-none focus:border-[#C9A84C]"
                placeholder="stage_1"
              />
              <button onClick={() => removeStage(i)} className="p-1 rounded hover:bg-red-50 text-[#9CA3AF] hover:text-red-600">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm hover:bg-[#E8D5A3] disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
