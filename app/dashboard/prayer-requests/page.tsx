"use client";

import { useState, useEffect } from "react";
import { Heart, RefreshCw, Loader2, ChevronDown, ChevronUp, User, MessageSquare, Filter, Trash2 } from "lucide-react";

const URGENCY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  low: { label: "Low", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-700" },
  in_prayer: { label: "In Prayer", color: "bg-amber-100 text-amber-700" },
  followed_up: { label: "Followed Up", color: "bg-green-100 text-green-700" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600" },
};

const CATEGORY_ICONS: Record<string, string> = {
  health: "🏥",
  family: "👨‍👩‍👧",
  grief: "🕊️",
  spiritual_growth: "🌱",
  financial: "💼",
  relationships: "💞",
  work: "🏢",
  crisis: "🆘",
  praise: "🙌",
  other: "🙏",
};

type PrayerRequest = {
  id: string;
  content: string;
  requestText: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  isAnonymous: boolean;
  category: string | null;
  urgency: string | null;
  status: string;
  pastoralNotes: string | null;
  aiSummary: string | null;
  aiFollowUpAction: string | null;
  aiSuggestedResponder: string | null;
  createdAt: string;
};

function getRequestText(req: PrayerRequest): string {
  return req.requestText || req.content?.split("\n---\n")[0] || req.content || "";
}

function parseLegacyContact(content: string): { name?: string; email?: string; phone?: string } {
  const meta = content.split("\n---\n")[1] || "";
  const parts = meta.split(" | ").map((p) => p?.trim()).filter(Boolean);
  const name = parts[0] && !parts[0].includes("@") && !parts[0].match(/^\d/) ? parts[0] : undefined;
  const email = parts.find((p) => p?.includes("@"));
  const phone = parts.find((p) => p?.match(/\d/));
  return { name, email, phone };
}

function getDisplayName(req: PrayerRequest): string {
  if (req.isAnonymous) return "Anonymous";
  if (req.submitterName) return req.submitterName;
  const legacy = parseLegacyContact(req.content);
  if (legacy.name) return legacy.name;
  return "Unknown";
}

export default function PrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayer-requests", { credentials: "include" });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = requests.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterUrgency !== "all" && r.urgency !== filterUrgency) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const payload: Record<string, unknown> = { status };
      if (notes[id] !== undefined) payload.pastoral_notes = notes[id];
      await fetch(`/api/prayer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prayer request? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
      else {
        const data = await res.json().catch(() => ({}));
        alert((data as { error?: string }).error || "Failed to delete");
      }
    } catch (err) {
      alert((err as Error).message || "Failed to delete");
    }
  };

  const runAnalysis = async (id: string) => {
    setAnalyzingId(id);
    try {
      const res = await fetch("/api/prayer-requests/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayer_request_id: id }),
        credentials: "include",
      });
      if (res.ok) await load();
    } finally {
      setAnalyzingId(null);
    }
  };

  const stats = {
    critical: requests.filter((r) => r.urgency === "critical" && r.status === "new").length,
    new: requests.filter((r) => r.status === "new").length,
    total: requests.length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Prayer Requests</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">AI-triaged pastoral care queue</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-[#6B7280] hover:border-gray-300 transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-[#0A0A0A]">{stats.total}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Total Requests</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Needs Attention</p>
        </div>
        <div
          className={`rounded-xl border shadow-sm p-4 text-center ${
            stats.critical > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
          }`}
        >
          <p className={`text-2xl font-bold ${stats.critical > 0 ? "text-red-600" : "text-[#0A0A0A]"}`}>
            {stats.critical}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Critical Urgency</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#9CA3AF]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <select
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="all">All Urgency</option>
          {Object.entries(URGENCY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#9CA3AF]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={32} className="text-[#C9A84C] mx-auto mb-3 opacity-40" />
          <p className="text-[#9CA3AF]">No prayer requests match your filters.</p>
          <p className="text-xs text-[#9CA3AF] mt-2">Share your prayer form: /prayer?church=your-church-slug</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const urgency = URGENCY_CONFIG[req.urgency || "medium"] || URGENCY_CONFIG.medium;
            const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.new;
            const isExpanded = expandedId === req.id;
            const catIcon = CATEGORY_ICONS[req.category || "other"] || "🙏";
            const requestText = getRequestText(req);
            const legacyContact = parseLegacyContact(req.content || "");

            return (
              <div
                key={req.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  req.urgency === "critical" ? "border-red-200 ring-1 ring-red-100" : "border-gray-100"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-xl flex-shrink-0 mt-0.5">{catIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {req.isAnonymous ? (
                            <span className="text-sm font-semibold text-[#6B7280] italic flex items-center gap-1">
                              <User size={12} /> Anonymous
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-[#0A0A0A]">{getDisplayName(req)}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${urgency.color}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${urgency.dot}`} />
                            {urgency.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                          {req.category && (
                            <span className="text-xs text-[#9CA3AF] capitalize">
                              {req.category.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
                          {req.aiSummary || requestText}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          {new Date(req.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-[#9CA3AF] flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown size={16} className="text-[#9CA3AF] flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1">
                        <MessageSquare size={11} /> Prayer Request
                      </p>
                      <p className="text-sm text-[#374151] leading-relaxed bg-[#F8F8F7] rounded-lg p-3">
                        {requestText}
                      </p>
                    </div>

                    {req.aiFollowUpAction && (
                      <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-wide">
                          ✦ AI Pastoral Recommendation
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">{req.aiFollowUpAction}</p>
                        {req.aiSuggestedResponder && (
                          <p className="text-xs text-white/40">
                            Suggested responder:{" "}
                            <span className="text-white/70 font-semibold capitalize">
                              {req.aiSuggestedResponder.replace(/_/g, " ")}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {!req.aiFollowUpAction && (
                      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-[#9CA3AF] flex items-center gap-2">
                          {analyzingId === req.id ? (
                            <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
                          ) : (
                            "AI analysis pending"
                          )}
                        </span>
                        <button
                          onClick={() => runAnalysis(req.id)}
                          disabled={analyzingId === req.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8D5A3] disabled:opacity-60 transition-all"
                        >
                          Run AI Analysis
                        </button>
                      </div>
                    )}

                    {!req.isAnonymous && (req.submitterEmail || req.submitterPhone || legacyContact?.email || legacyContact?.phone) && (
                      <div className="flex flex-wrap gap-3 text-xs">
                        {(req.submitterEmail || legacyContact?.email) && (
                          <span className="flex items-center gap-1 text-[#6B7280]">
                            📧 {req.submitterEmail || legacyContact?.email}
                          </span>
                        )}
                        {(req.submitterPhone || legacyContact?.phone) && (
                          <span className="flex items-center gap-1 text-[#6B7280]">
                            📞 {req.submitterPhone || legacyContact?.phone}
                          </span>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2 block">
                        Pastoral Notes
                      </label>
                      <textarea
                        value={notes[req.id] ?? (req.pastoralNotes || "")}
                        onChange={(e) => setNotes((n) => ({ ...n, [req.id]: e.target.value }))}
                        placeholder="Add notes about your follow-up..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {["in_prayer", "followed_up", "closed"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(req.id, s)}
                          disabled={updatingId === req.id || req.status === s}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                            req.status === s
                              ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                              : "bg-white text-[#6B7280] border-gray-200 hover:border-gray-300 hover:text-[#0A0A0A]"
                          }`}
                        >
                          {updatingId === req.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : null}
                          {s === "in_prayer" ? "🙏 Mark In Prayer" : s === "followed_up" ? "✓ Followed Up" : "✗ Close"}
                        </button>
                      ))}
                      {req.status !== "new" && (
                        <button
                          onClick={() => updateStatus(req.id, "new")}
                          disabled={updatingId === req.id}
                          className="px-3 py-2 rounded-lg text-xs font-semibold text-[#9CA3AF] border border-gray-100 hover:border-gray-200 transition-all"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 border border-gray-100 hover:border-red-200 transition-all ml-auto"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
