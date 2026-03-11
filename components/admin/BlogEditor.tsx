"use client";

import { useState, useEffect } from "react";
import { categoryLabels } from "@/lib/blog-posts";

type Props = {
  post?: { id?: string; title?: string; excerpt?: string; content?: string; category?: string; author_name?: string; cover_image_url?: string; status?: string } | null;
  onSave: (saved: unknown) => void;
  onClose: () => void;
};

const CATEGORIES = Object.keys(categoryLabels);

export default function BlogEditor({ post, onSave, onClose }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState(post?.category ?? "leadership");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "StewardOS Team");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title ?? "");
      setExcerpt(post.excerpt ?? "");
      setContent(post.content ?? "");
      setCategory(post.category ?? "leadership");
      setAuthorName(post.author_name ?? "StewardOS Team");
      setCoverImageUrl(post.cover_image_url ?? "");
      setStatus(post.status ?? "draft");
    }
  }, [post]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim() || null,
        category,
        author_name: authorName.trim(),
        cover_image_url: coverImageUrl.trim() || null,
        status,
      };
      const url = post?.id ? `/api/admin/blog-posts/${post.id}` : "/api/admin/blog-posts";
      const method = post?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      if (res.ok) onSave(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 my-8">
        <h3 className="font-bold text-[#0A0A0A] mb-4">{post?.id ? "Edit Blog Post" : "New Blog Post"}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="Post title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
              placeholder="Short summary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] font-mono resize-y"
              placeholder="## Heading&#10;&#10;Paragraph text..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#6B7280]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Author</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="StewardOS Team"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Cover Image URL</label>
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
