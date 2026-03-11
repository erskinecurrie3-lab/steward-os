"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GuestAPI } from "@/lib/apiClient";
import { useChurchContext } from "@/lib/useChurchContext";
import CsvImportModal from "@/components/guests/CsvImportModal";
import { SmsOptInDisclosure } from "@/components/forms/SmsOptIn";
import { Plus, Search, Upload, AlertTriangle, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  new_visitor: "bg-[#C9A84C]/20 text-[#A07830]",
  returning_visitor: "bg-[#C9A84C]/20 text-[#A07830]",
  connected: "bg-[#C9A84C]/20 text-[#A07830]",
  member: "bg-[#C9A84C]/20 text-[#A07830]",
  at_risk: "bg-red-50 text-red-600",
  inactive: "bg-gray-100 text-gray-500",
};

const stageLabels: Record<string, string> = {
  stage_1_welcome: "Welcome",
  stage_2_connect: "Connect",
  stage_3_grow: "Grow",
  stage_4_serve: "Serve",
  stage_5_belong: "Belong",
};

type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  status: string;
  journey_stage: string;
  is_at_risk?: boolean;
  created_date?: string;
  visit_date?: string;
};

export default function GuestsPage() {
  const ctx = useChurchContext();
  const churchId = ctx?.churchId ?? null;
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", visit_date: "", spiritual_background: "", family_status: "" });
  const [saving, setSaving] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  useEffect(() => {
    if (!churchId) {
      setLoading(false);
      return;
    }
    GuestAPI.filter({ church_id: churchId })
      .then((g) => {
        setGuests(g as Guest[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [churchId]);

  const filtered = guests.filter((g) => {
    const matchSearch = `${g.first_name} ${g.last_name} ${g.email ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || g.status === filter || g.journey_stage === filter;
    return matchSearch && matchFilter;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;
    setSaving(true);
    try {
      const newGuest = await GuestAPI.create({ ...form, church_id: churchId, status: "new_visitor", journey_stage: "stage_1_welcome", visit_count: 1 }) as Guest;
      setGuests([newGuest, ...guests]);
      setShowForm(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", visit_date: "", spiritual_background: "", family_status: "" });
    } finally {
      setSaving(false);
    }
  };

  const refreshGuests = () => {
    if (churchId) {
      GuestAPI.filter({ church_id: churchId }).then((g) => setGuests(g as Guest[]));
    }
  };

  const handleDelete = async (e: React.MouseEvent, guest: Guest) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete ${guest.first_name} ${guest.last_name}? This cannot be undone.`)) return;
    try {
      await GuestAPI.delete(guest.id);
      setGuests((prev) => prev.filter((g) => g.id !== guest.id));
    } catch (err) {
      alert((err as Error).message || "Failed to delete guest");
    }
  };

  return (
    <div className="max-w-6xl w-full overflow-hidden">
      {showCsvImport && (
        <CsvImportModal
          churchId={churchId}
          onClose={() => setShowCsvImport(false)}
          onImported={refreshGuests}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">People & Guests</h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF]">{guests.length} people in your system</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCsvImport(true)} className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 bg-white text-[#0A0A0A] font-semibold text-sm hover:bg-gray-50 transition-all">
            <Upload size={15} /> <span className="hidden sm:inline">Import CSV</span>
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all">
            <Plus size={15} /> <span className="hidden sm:inline">Add Guest</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-5">
          <h3 className="font-bold text-[#0A0A0A] mb-4">Add New Guest</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="First name *" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
            <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
            <div>
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]" />
              <SmsOptInDisclosure className="mt-1" />
            </div>
            <input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]" />
            <select value={form.spiritual_background} onChange={(e) => setForm({ ...form, spiritual_background: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
              <option value="">Spiritual background</option>
              <option value="new_to_faith">New to Faith</option>
              <option value="returning">Returning</option>
              <option value="regular_churchgoer">Regular Churchgoer</option>
              <option value="exploring">Exploring</option>
            </select>
            <select value={form.family_status} onChange={(e) => setForm({ ...form, family_status: e.target.value })} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]">
              <option value="">Family status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="married_with_kids">Married with Kids</option>
              <option value="widowed">Widowed</option>
            </select>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving || !churchId} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all disabled:opacity-60">
                {saving ? "Saving..." : "Add Guest"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-[#6B7280] text-sm hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#C9A84C]" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280] min-w-0 max-w-[130px]">
          <option value="all">All Statuses</option>
          <option value="new_visitor">New Visitors</option>
          <option value="returning_visitor">Returning</option>
          <option value="connected">Connected</option>
          <option value="at_risk">At Risk</option>
          <option value="member">Members</option>
        </select>
      </div>

      <div className="sm:hidden space-y-2">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF] text-sm">{search ? "No guests match your search." : "No guests yet. Add your first guest!"}</div>
        ) : (
          filtered.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#C9A84C]/30 transition-colors flex items-center gap-3">
              <Link href={`/dashboard/guests/${g.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-sm font-bold text-[#A07830] flex-shrink-0">
                  {g.first_name?.[0]}
                  {g.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-[#0A0A0A] text-sm truncate">
                      {g.first_name} {g.last_name}
                    </p>
                    {g.is_at_risk && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-[#9CA3AF] truncate">{g.email}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[g.status] ?? "bg-gray-100 text-gray-600"}`}>{g.status?.replace(/_/g, " ")}</span>
              </Link>
              <button
                onClick={(e) => handleDelete(e, g)}
                className="p-2 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8F8F7] border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden md:table-cell">Visit Date</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden lg:table-cell">Journey Stage</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded w-32" />
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 bg-gray-100 rounded-full w-20" />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-5 py-4" />
                  </tr>
                ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#9CA3AF] text-sm">
                  {search ? "No guests match your search." : "No guests yet. Add your first guest!"}
                </td>
              </tr>
            ) : (
              filtered.map((g) => (
                <tr key={g.id} className="border-b border-gray-50 hover:bg-[#FDFAF5] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-xs font-bold text-[#A07830] flex-shrink-0">
                        {g.first_name?.[0]}
                        {g.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0A0A0A] text-sm">
                          {g.first_name} {g.last_name}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{g.email}</p>
                      </div>
                      {g.is_at_risk && <AlertTriangle size={14} className="text-red-500 ml-1" />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7280] hidden md:table-cell">{g.visit_date ?? g.created_date?.split("T")[0] ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[g.status] ?? "bg-gray-100 text-gray-600"}`}>{g.status?.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7280] hidden lg:table-cell">{stageLabels[g.journey_stage] ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/guests/${g.id}`} className="text-xs font-semibold text-[#C9A84C] hover:text-[#A07830] transition-colors">
                        View →
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, g)}
                        className="text-xs text-[#9CA3AF] hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
