"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import type { CustomFieldDef } from "@/app/api/settings/custom-fields/route";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Dropdown" },
] as const;

const ENTITIES = [
  { value: "guest", label: "Guest profile" },
  { value: "lead", label: "Lead / form" },
] as const;

export default function CustomFieldsManager() {
  const [fields, setFields] = useState<CustomFieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CustomFieldDef | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const fetchFields = async () => {
    try {
      const res = await fetch("/api/settings/custom-fields");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setFields(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load custom fields");
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const saveFields = async (updated: CustomFieldDef[]) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/custom-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setFields(Array.isArray(data) ? data : updated);
      setEditing(null);
      setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addField = (field: Omit<CustomFieldDef, "id">) => {
    const id = `cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const key = (field.key || field.label)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");
    const newField: CustomFieldDef = {
      ...field,
      id,
      key: key || "field",
    };
    saveFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomFieldDef>) => {
    const updated = fields.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    );
    saveFields(updated);
  };

  const deleteField = (id: string) => {
    if (!confirm("Remove this custom field? Existing data will be preserved but the field will no longer appear on forms."))
      return;
    saveFields(fields.filter((f) => f.id !== id));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-[#9CA3AF]">
        Loading custom fields...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-[#0A0A0A] text-sm mb-1">Custom Fields</h3>
        <p className="text-xs text-[#9CA3AF]">
          Add custom fields to guest profiles and lead capture forms.
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="p-6">
        {showAdd ? (
          <FieldForm
            field={null}
            onSave={(f) => {
              addField(f);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
            saving={saving}
          />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#1A1A1A] transition-all mb-4"
          >
            <Plus size={16} /> Add custom field
          </button>
        )}

        {fields.length === 0 && !showAdd ? (
          <p className="text-sm text-[#9CA3AF] py-6">
            No custom fields yet. Add one to capture extra information on guests and leads.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field) =>
              editing?.id === field.id ? (
                <FieldForm
                  key={field.id}
                  field={field}
                  onSave={(f) => updateField(field.id, f)}
                  onCancel={() => setEditing(null)}
                  saving={saving}
                />
              ) : (
                <div
                  key={field.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 bg-[#F8F8F7]/50 hover:bg-[#F8F8F7]"
                >
                  <GripVertical size={14} className="text-[#9CA3AF] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0A0A0A] text-sm">{field.label}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {field.key} · {FIELD_TYPES.find((t) => t.value === field.type)?.label ?? field.type} ·{" "}
                      {ENTITIES.find((e) => e.value === field.entity)?.label ?? field.entity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(field)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <Pencil size={14} className="text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => deleteField(field.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldForm({
  field,
  onSave,
  onCancel,
  saving,
}: {
  field: CustomFieldDef | null;
  onSave: (f: Omit<CustomFieldDef, "id"> & { id?: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [label, setLabel] = useState(field?.label ?? "");
  const [key, setKey] = useState(field?.key ?? "");
  const [type, setType] = useState<CustomFieldDef["type"]>(field?.type ?? "text");
  const [entity, setEntity] = useState<CustomFieldDef["entity"]>(field?.entity ?? "guest");
  const [optionsStr, setOptionsStr] = useState(
    field?.options?.join(", ") ?? ""
  );
  const [required, setRequired] = useState(field?.required ?? false);

  const handleKeyFromLabel = () => {
    if (!key && label)
      setKey(label.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
  };

  const handleSave = () => {
    const k = key || label.toLowerCase().replace(/[^a-z0-9_]/g, "_") || "field";
    const options =
      type === "select" && optionsStr.trim()
        ? optionsStr.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
    onSave({
      id: field?.id,
      key: k,
      label: label || "Untitled",
      type,
      entity,
      options,
      required,
    });
  };

  return (
    <div className="p-4 rounded-xl border border-[#C9A84C]/30 bg-[#FDFAF5] space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleKeyFromLabel}
            placeholder="e.g. Baptism Date"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Key (internal)</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
            placeholder="e.g. baptism_date"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 font-mono"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CustomFieldDef["type"])}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Appears on</label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as CustomFieldDef["entity"])}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
          >
            {ENTITIES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {type === "select" && (
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">Options (comma-separated)</label>
          <input
            type="text"
            value={optionsStr}
            onChange={(e) => setOptionsStr(e.target.value)}
            placeholder="e.g. Option A, Option B, Option C"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="required" className="text-sm text-[#6B7280]">
          Required field
        </label>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !label.trim()}
          className="px-4 py-2 rounded-lg bg-[#C9A84C] text-[#0A0A0A] text-sm font-semibold hover:bg-[#E8D5A3] disabled:opacity-50 transition-all"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
