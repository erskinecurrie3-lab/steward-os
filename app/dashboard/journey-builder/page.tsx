"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, LayoutTemplate, Trash2 } from "lucide-react";
import JourneyTemplateGallery, { type JourneyTemplate as SeedTemplate } from "@/components/journey/JourneyTemplateGallery";
import JourneyEditor, { type TouchpointDraft, type StageDraft } from "@/components/journey/JourneyEditor";

type DbTemplate = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  touchpoints: number;
  days: number;
  seedId: string | null;
  touchpointList: { id: string; title: string; description: string | null; type: string; daysOffset: number }[];
  stages: { id: string; name: string; label: string; description: string | null }[];
};

function toTouchpointDraft(t: { title: string; description?: string | null; type?: string; daysOffset?: number }): TouchpointDraft {
  return {
    title: t.title,
    description: t.description ?? "",
    type: t.type ?? "manual",
    daysOffset: t.daysOffset ?? 0,
  };
}

function toStageDraft(s: { name: string; label: string; description?: string | null }): StageDraft {
  return {
    name: s.name,
    label: s.label,
    description: s.description ?? "",
  };
}

export default function JourneyBuilderPage() {
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<DbTemplate | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const r = await fetch("/api/journey-templates", { credentials: "include" });
      const data = await r.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const createFromSeed = async (seed: SeedTemplate) => {
    setLoading(true);
    try {
      const touchpointList =
        seed.touchpointList?.length > 0
          ? seed.touchpointList.map((tp) => toTouchpointDraft(tp))
          : Array.from({ length: seed.touchpoints }, (_, i) => ({
              title: i === 0 ? "Welcome" : `Step ${i + 1}`,
              description: "",
              type: "manual",
              daysOffset: Math.round((i / Math.max(1, seed.touchpoints - 1)) * seed.days) || 0,
            }));
      const stages =
        seed.stages?.length > 0
          ? seed.stages.map((s) => toStageDraft(s))
          : [
              { name: "stage_1_welcome", label: "Welcome", description: "" },
              { name: "stage_2_connect", label: "Connect", description: "" },
              { name: "stage_3_engaged", label: "Engaged", description: "" },
            ];
      const r = await fetch("/api/journey-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: seed.title,
          description: seed.description,
          category: seed.category,
          touchpoints: touchpointList.length,
          days: seed.days,
          seedId: seed.id,
          touchpointList,
          stages,
        }),
      });
      const created = await r.json();
      if (r.ok && created) {
        setTemplates((prev) => [created, ...prev]);
        setSelected(created);
      }
    } finally {
      setLoading(false);
    }
  };

  const createFromScratch = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/journey-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "New Journey",
          description: "",
          category: "custom",
          touchpoints: 1,
          days: 30,
          touchpointList: [{ title: "Welcome", description: "", type: "manual", daysOffset: 0 }],
          stages: [{ name: "stage_1_welcome", label: "Welcome", description: "" }],
        }),
      });
      const created = await r.json();
      if (r.ok && created) {
        setTemplates((prev) => [created, ...prev]);
        setSelected(created);
        setShowNew(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromGallery = (seed: SeedTemplate) => {
    setShowGallery(false);
    createFromSeed(seed);
  };

  const handleSave = async (data: {
    title: string;
    description: string;
    category: string;
    touchpoints: number;
    days: number;
    touchpointList: TouchpointDraft[];
    stages: StageDraft[];
  }) => {
    if (!selected) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/journey-templates/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const updated = await r.json();
      if (r.ok && updated) {
        setTemplates((prev) => prev.map((t) => (t.id === selected.id ? updated : t)));
        setSelected(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journey template?")) return;
    try {
      const r = await fetch(`/api/journey-templates/${id}`, { method: "DELETE", credentials: "include" });
      if (r.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch {}
  };

  return (
    <div className="max-w-6xl w-full">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Journey Builder</h1>
          <p className="text-sm text-[#9CA3AF]">Design personalized visitor pathways for every guest type</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGallery(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C9A84C] text-[#A07830] font-semibold text-sm hover:bg-[#C9A84C]/10 transition-all">
            <LayoutTemplate size={16} /> Browse Templates
          </button>
          <button onClick={createFromScratch} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] disabled:opacity-60 transition-all">
            <Plus size={16} /> New Journey
          </button>
        </div>
      </div>

      <JourneyTemplateGallery open={showGallery} onClose={() => setShowGallery(false)} onSelect={handleSelectFromGallery} />

      {showNew && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-[#0A0A0A] mb-4">Create New Journey Template</h3>
          <p className="text-sm text-[#6B7280] mb-4">Start from a template above, or build from scratch. Configure touchpoints, stages, and automations to match your church&apos;s visitor pathway.</p>
          <div className="flex gap-2">
            <button onClick={() => { setShowNew(false); setShowGallery(true); }} className="px-5 py-2.5 rounded-xl border border-[#C9A84C] text-[#A07830] text-sm font-semibold hover:bg-[#C9A84C]/10">Browse Templates</button>
            <button onClick={createFromScratch} disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] disabled:opacity-60">Create from scratch</button>
            <button onClick={() => setShowNew(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-[#6B7280] text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold text-[#0A0A0A] text-sm mb-3">Journey Templates</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-[#C9A84C]" />
            </div>
          ) : templates.length === 0 ? (
            <>
              <p className="text-xs text-[#9CA3AF] mb-3">Add templates from the gallery or create new.</p>
              <button onClick={() => setShowGallery(true)} className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-[#9CA3AF] text-sm hover:border-[#C9A84C]/40 hover:text-[#A07830] transition-all">
                + Add from gallery
              </button>
            </>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className={`group flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${selected?.id === t.id ? "bg-[#C9A84C]/10 border border-[#C9A84C]/30" : "bg-gray-50 hover:bg-gray-100 border border-transparent"}`}
                  onClick={() => setSelected(t)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0A0A0A] truncate">{t.title}</p>
                    <p className="text-xs text-[#9CA3AF]">{t.touchpointList?.length ?? t.touchpoints} touchpoints · {t.days} days</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-[#9CA3AF] hover:text-red-600 transition-opacity"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => setShowGallery(true)} className="w-full py-2 rounded-xl border border-dashed border-gray-200 text-[#9CA3AF] text-xs hover:border-[#C9A84C]/40 hover:text-[#A07830] mt-2">
                + Add more
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-[#6B7280] text-sm mb-4">Select a template from the gallery or create a new one.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setShowGallery(true)} className="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm hover:bg-[#E8D5A3]">
                  Browse Template Gallery
                </button>
                <button onClick={createFromScratch} className="px-5 py-2.5 rounded-xl border border-[#C9A84C] text-[#A07830] font-semibold text-sm hover:bg-[#C9A84C]/10">
                  New Journey
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0A0A0A] text-lg">{selected.title}</h3>
              </div>
              <JourneyEditor
                title={selected.title}
                description={selected.description ?? ""}
                category={selected.category}
                days={selected.days}
                touchpointList={(selected.touchpointList ?? []).map(toTouchpointDraft)}
                stages={(selected.stages ?? []).map(toStageDraft)}
                onSave={handleSave}
                saving={saving}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
