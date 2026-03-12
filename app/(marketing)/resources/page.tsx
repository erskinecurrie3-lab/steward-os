"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { staticPosts, categoryLabels, categoryColors } from "@/lib/blog-posts";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  published_date: string;
  read_time_minutes: number;
  cover_image_url: string;
};

export default function ResourcesPage() {
  const [posts, setPosts] = useState<Post[]>(staticPosts);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/blog/posts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPosts(data);
      })
      .catch(() => {});
  }, []);

  const displayPosts = posts;
  const filtered = filter === "all" ? displayPosts : displayPosts.filter((p) => p.category === filter);

  return (
    <div className=" bg-white">
      <section className="py-16 lg:py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-6">
            <span className="text-[#A07830] text-xs font-medium uppercase tracking-wide">
              Resources & Blog
            </span>
          </div>
          <h1 className="text-5xl font-bold text-[#0A0A0A] mb-4">
            Insights for pastors who care.
          </h1>
          <p className="text-[#6B7280] text-lg">
            Practical guides, research, and strategies for church retention,
            visitor care, and pastoral leadership.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="pb-6">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {["all", ...Object.keys(categoryLabels)].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === cat ? "bg-[#0A0A0A] text-white" : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"}`}
              >
                {cat === "all" ? "All Topics" : categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-10 pb-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post: Post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group block"
              >
                <div className="h-44 overflow-hidden relative">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[post.category] || "bg-gray-100 text-gray-600"}`}
                    >
                      {categoryLabels[post.category] || post.category}
                    </span>
                    {post.read_time_minutes && (
                      <span className="text-xs text-[#9CA3AF]">
                        {post.read_time_minutes} min read
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#0A0A0A] leading-snug mb-2 group-hover:text-[#A07830] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF]">
                      {post.author_name}
                    </span>
                    <span className="text-xs text-[#C9A84C] font-semibold flex items-center gap-1">
                      Read more <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
