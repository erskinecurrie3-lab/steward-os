"use client";

import { useState, useEffect } from "react";
import { Upload, Search, Folder, FileText, Trash2, Download, Plus, Wand2, Loader2, X, Check, Image, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Files" },
  { value: "training", label: "Training" },
  { value: "policy", label: "Policy" },
  { value: "forms", label: "Forms" },
  { value: "media", label: "Media" },
  { value: "scripture", label: "Scripture" },
  { value: "other", label: "Other" },
];

const CATEGORY_COLORS: Record<string, string> = {
  training: "bg-blue-50 text-blue-700",
  policy: "bg-purple-50 text-purple-700",
  forms: "bg-green-50 text-green-700",
  media: "bg-orange-50 text-orange-700",
  scripture: "bg-[#C9A84C]/10 text-[#A07830]",
  other: "bg-gray-100 text-gray-600",
};

function getFileIcon(fileType: string | null | undefined): LucideIcon {
  if (!fileType) return FileText;
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return Video;
  return FileText;
}

type Resource = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  tags: string[];
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  is_public: boolean;
  uploaded_by?: string | null;
  created_at: string;
};

function UploadModal({
  onSave,
  onClose,
}: {
  onSave: (saved: Resource) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    tags: "",
    is_public: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("tags", form.tags);
      fd.append("is_public", String(form.is_public));
      if (file) fd.append("file", file);

      const res = await fetch("/api/resources", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0A0A0A]">Upload Resource</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="Resource name"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
              placeholder="Brief description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="welcome, onboarding"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">File (optional)</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#C9A84C]/40 transition-colors cursor-pointer"
              onClick={() => document.getElementById("res-file")?.click()}
            >
              {file ? (
                <p className="text-sm text-[#0A0A0A] font-medium">{file.name}</p>
              ) : (
                <>
                  <Upload size={20} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-sm text-[#9CA3AF]">Click to upload a file</p>
                </>
              )}
              <input
                id="res-file"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              className="accent-[#C9A84C]"
            />
            Make visible to all staff
          </label>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] flex items-center gap-2 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {uploading ? "Uploading..." : "Save Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResourceLibraryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resources", { credentials: "include" });
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = resources.filter((r) => {
    const matchCat = category === "all" || r.category === category;
    const matchSearch =
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setResources((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    }
  };

  const generateContent = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await fetch("/api/resources/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.content) setAiResult(data.content);
    } catch {
      setAiResult("Failed to generate content.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-5xl w-full">
      {showUpload && (
        <UploadModal
          onSave={(saved) => {
            setResources((prev) => [saved, ...prev]);
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">Resource Library</h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF]">Documents, training materials, and church resources</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all flex-shrink-0"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                category === c.value ? "bg-[#0A0A0A] text-white" : "bg-white border border-gray-200 text-[#6B7280] hover:border-gray-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Resources", value: resources.length },
          { label: "Categories", value: [...new Set(resources.map((r) => r.category))].filter(Boolean).length },
          { label: "Visible to Staff", value: resources.filter((r) => r.is_public).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-[#0A0A0A]">{loading ? "—" : s.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-[#9CA3AF]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Folder size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-[#9CA3AF]">
            {search || category !== "all" ? "No resources match your search." : "No resources yet. Upload your first file."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map((r) => {
            const FileIcon = getFileIcon(r.file_type);
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-[#C9A84C]/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F8F7] flex items-center justify-center flex-shrink-0">
                    <FileIcon size={18} className="text-[#9CA3AF]" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-500 transition-colors"
                      >
                        <Download size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-[#0A0A0A] text-sm mb-1 leading-tight">{r.title}</p>
                {r.description && <p className="text-xs text-[#9CA3AF] mb-2 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[r.category] || "bg-gray-100 text-gray-600"}`}
                  >
                    {r.category}
                  </span>
                  {r.is_public && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                      Staff Access
                    </span>
                  )}
                </div>
                {r.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {r.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-[#9CA3AF] bg-gray-50 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-[#0A0A0A] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Wand2 size={16} className="text-[#C9A84C]" />
          <h3 className="font-bold text-white text-sm">AI Content Generator</h3>
        </div>
        <p className="text-white/50 text-xs mb-4">
          Generate training documents, policies, or resource descriptions with AI.
        </p>
        <div className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. Volunteer onboarding guide for first-time greeter team..."
            className="flex-1 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A84C]"
            onKeyDown={(e) => e.key === "Enter" && generateContent()}
          />
          <button
            onClick={generateContent}
            disabled={aiLoading || !aiPrompt.trim()}
            className="px-4 py-2.5 rounded-lg bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {aiLoading ? "Writing..." : "Generate"}
          </button>
        </div>
        {aiResult && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{aiResult}</p>
            <button
              onClick={() => navigator.clipboard?.writeText(aiResult)}
              className="mt-2 text-xs text-[#C9A84C] hover:text-[#E8D5A3] font-semibold"
            >
              Copy →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
