"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Users, Mail, Calendar, Star, BookOpen, AlertTriangle, Pencil, Trash2, Settings } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import CustomFieldsManager from "@/components/admin/CustomFieldsManager";
import BlogEditor from "@/components/admin/BlogEditor";

const tabs = [
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "custom_fields", label: "Custom Fields", icon: Settings },
  { id: "leads", label: "Leads", icon: Mail },
  { id: "demos", label: "Demo Bookings", icon: Calendar },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "blog", label: "Blog Posts", icon: BookOpen },
];

type Lead = { id: string; first_name?: string; last_name?: string; email: string; church_name?: string; source?: string; status: string; created_date?: string };
type Demo = { id: string; first_name?: string; last_name?: string; email: string; church_name?: string; preferred_date?: string; preferred_time?: string; status: string };
type Testimonial = { id: string; author_name: string; author_title?: string; church_name?: string; quote: string; is_visible?: boolean };
type BlogPost = { id: string; title: string; excerpt?: string; category?: string; published_date?: string; created_date?: string; cover_image_url?: string; status: string };

export default function AdminPanelPage() {
  const { membership } = useOrganization();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("users");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdmin = orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/admin/leads").then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])),
      fetch("/api/admin/demos").then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])),
      fetch("/api/admin/testimonials").then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])),
      fetch("/api/admin/blog-posts").then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])),
    ])
      .then(([l, d, t, b]) => {
        setLeads(l);
        setDemos(d);
        setTestimonials(t);
        setBlogPosts(b);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch {}
  };

  const updateDemoStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/demos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setDemos((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    } catch {}
  };

  const toggleTestimonialVisibility = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !t.is_visible }),
      });
      const updated = await res.json();
      setTestimonials((prev) => prev.map((item) => (item.id === t.id ? updated : item)));
    } catch {}
  };

  const addTestimonial = async () => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: "New Testimonial",
          quote: "Edit this testimonial...",
          is_visible: false,
        }),
      });
      const created = await res.json();
      setTestimonials((prev) => [created, ...prev]);
    } catch {}
  };

  const publishBlog = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: post.status === "published" ? "draft" : "published" }),
      });
      const updated = await res.json();
      setBlogPosts((prev) => prev.map((b) => (b.id === post.id ? updated : b)));
    } catch {}
  };

  const deleteBlog = async (post: BlogPost) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await fetch(`/api/admin/blog-posts/${post.id}`, { method: "DELETE" });
      setBlogPosts((prev) => prev.filter((b) => b.id !== post.id));
    } catch {}
  };

  if (loading) return <div className="py-20 text-center text-[#9CA3AF]">Loading...</div>;
  if (!isAdmin)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#0A0A0A]">Admin Access Required</h2>
          <p className="text-[#9CA3AF] mt-1 text-sm">You need admin privileges to access this panel.</p>
        </div>
      </div>
    );

  const statusColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700",
    contacted: "bg-purple-50 text-purple-700",
    demo_booked: "bg-amber-50 text-amber-700",
    trial: "bg-green-50 text-green-700",
    customer: "bg-emerald-50 text-emerald-700",
    lost: "bg-gray-100 text-gray-500",
    pending: "bg-blue-50 text-blue-700",
    confirmed: "bg-green-50 text-green-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="max-w-6xl w-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Admin Panel</h1>
        <p className="text-sm text-[#9CA3AF]">Manage leads, demos, content, and testimonials</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Leads", value: leads.length, sub: `${leads.filter((l) => l.status === "new").length} new` },
          { label: "Demo Requests", value: demos.length, sub: `${demos.filter((d) => d.status === "pending").length} pending` },
          { label: "Testimonials", value: testimonials.length, sub: `${testimonials.filter((t) => t.is_visible).length} visible` },
          { label: "Blog Posts", value: blogPosts.length, sub: `${blogPosts.filter((b) => b.status === "published").length} published` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-[#9CA3AF] mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#0A0A0A]">{stat.value}</p>
            <p className="text-xs text-[#C9A84C] font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 bg-[#F8F8F7] rounded-xl p-1 mb-6 w-fit max-w-full">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? "bg-white text-[#0A0A0A] shadow-sm" : "text-[#9CA3AF] hover:text-[#6B7280]"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTab === "users" && <UserManagement />}
      {activeTab === "custom_fields" && <CustomFieldsManager />}

      {activeTab === "leads" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead className="bg-[#F8F8F7] border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Name / Church</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden lg:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#9CA3AF] text-sm">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-[#FDFAF5] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#0A0A0A] text-sm">
                        {lead.first_name ?? ""} {lead.last_name ?? ""}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{lead.church_name ?? ""}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280] hidden md:table-cell">{lead.email}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs capitalize text-[#9CA3AF]">{lead.source ?? ""}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${statusColors[lead.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {["new", "contacted", "demo_booked", "trial", "customer", "lost"].map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                      {typeof lead.created_date === "string" ? lead.created_date.split("T")[0] : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "demos" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead className="bg-[#F8F8F7] border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Name / Church</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden md:table-cell">Preferred Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {demos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-[#9CA3AF] text-sm">
                    No demo requests yet.
                  </td>
                </tr>
              ) : (
                demos.map((demo) => (
                  <tr key={demo.id} className="border-b border-gray-50 hover:bg-[#FDFAF5] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#0A0A0A] text-sm">
                        {demo.first_name ?? ""} {demo.last_name ?? ""}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        {demo.church_name ?? ""} · {demo.email}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280] hidden md:table-cell">
                      {demo.preferred_date ?? ""} {demo.preferred_time ?? ""}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={demo.status}
                        onChange={(e) => updateDemoStatus(demo.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${statusColors[demo.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "testimonials" && (
        <div className="space-y-4">
          <button
            onClick={addTestimonial}
            className="px-4 py-2 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
          >
            + Add Testimonial
          </button>
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-[#0A0A0A] text-sm">{t.author_name}</p>
                <p className="text-xs text-[#9CA3AF] mb-2">
                  {t.author_title ?? ""} · {t.church_name ?? ""}
                </p>
                <p className="text-sm text-[#6B7280] italic">&quot;{t.quote}&quot;</p>
              </div>
              <button
                onClick={() => toggleTestimonialVisibility(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${t.is_visible ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {t.is_visible ? "Visible" : "Hidden"}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "blog" && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setEditingPost(null);
              setShowBlogEditor(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
          >
            + New Blog Post
          </button>
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              {post.cover_image_url && (
                <div className="w-16 h-12 relative flex-shrink-0">
                  <Image src={post.cover_image_url} alt="" fill className="object-cover rounded-lg" sizes="64px" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0A0A0A] text-sm truncate">{post.title}</p>
                <p className="text-xs text-[#9CA3AF] capitalize">
                  {post.category?.replace(/_/g, " ")} · {post.published_date ?? post.created_date?.toString().split("T")[0] ?? ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => publishBlog(post)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${post.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {post.status === "published" ? "Published" : "Draft"}
                </button>
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setShowBlogEditor(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <Pencil size={14} className="text-[#6B7280]" />
                </button>
                <button onClick={() => deleteBlog(post)} className="p-1.5 rounded-lg hover:bg-red-50 transition-all">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBlogEditor && (
        <BlogEditor
          post={editingPost}
          onSave={(saved) => {
            const s = saved as BlogPost;
            if (editingPost) {
              setBlogPosts((prev) => prev.map((b) => (b.id === s.id ? s : b)));
            } else {
              setBlogPosts((prev) => [s, ...prev]);
            }
            setShowBlogEditor(false);
            setEditingPost(null);
          }}
          onClose={() => {
            setShowBlogEditor(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}
