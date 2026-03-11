import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { staticPosts, categoryLabels, categoryColors } from "@/lib/blog-posts";
import { prisma } from "@/lib/db";

function estimateReadTime(content: string | null): number {
  if (!content) return 5;
  return Math.max(3, Math.ceil(content.split(/\s+/).length / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbPost = await prisma.blogPost.findFirst({
    where: { OR: [{ id }, { slug: id }], status: "published" },
  });
  const post =
    dbPost ?
      {
        id: dbPost.id,
        title: dbPost.title,
        excerpt: dbPost.excerpt || "",
        content: dbPost.content || "",
        category: dbPost.category,
        author_name: dbPost.authorName,
        published_date: dbPost.publishedDate?.toISOString().slice(0, 10) || "",
        read_time_minutes: estimateReadTime(dbPost.content),
        cover_image_url: dbPost.coverImageUrl || "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
      }
    : staticPosts.find((p) => p.id === id) ?? null;

  if (!post) {
    return (
      <div className="pt-24 min-h-screen bg-white text-center py-20">
        <p className="text-2xl font-bold text-[#0A0A0A] mb-2">Post not found</p>
        <Link
          href="/resources"
          className="text-[#C9A84C] font-semibold hover:text-[#A07830]"
        >
          ← Back to Resources
        </Link>
      </div>
    );
  }

  const dbPosts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedDate: "desc" },
    take: 10,
  });
  const relatedFromDb = dbPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      cover_image_url: p.coverImageUrl || "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
    }));
  const related = relatedFromDb.length > 0
    ? relatedFromDb
    : staticPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="pt-16 lg:pt-20 bg-white min-h-screen">
      {/* Hero */}
      <section className="py-14 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Resources
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] || "bg-white/10 text-white/60"}`}
            >
              {categoryLabels[post.category] || post.category}
            </span>
            {post.read_time_minutes && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Clock size={11} /> {post.read_time_minutes} min read
              </span>
            )}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-5">
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
              <User size={14} className="text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                {post.author_name || "StewardOS Team"}
              </p>
              <p className="text-xs text-white/40">{post.published_date}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {post.cover_image_url && (
        <div className="max-w-3xl mx-auto px-6 lg:px-8 -mt-6 relative h-64">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover rounded-2xl shadow-xl"
            sizes="(max-width: 768px) 100vw, 672px"
            unoptimized
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
        {post.excerpt && (
          <p className="text-xl text-[#6B7280] leading-relaxed mb-8 border-l-4 border-[#C9A84C] pl-5 italic">
            {post.excerpt}
          </p>
        )}
        <div className="prose prose-lg max-w-none prose-headings:text-[#0A0A0A] prose-p:text-[#374151] prose-p:leading-relaxed prose-a:text-[#C9A84C]">
          <ReactMarkdown>{(post as { content?: string }).content || ""}</ReactMarkdown>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 py-14 bg-[#F8F8F7]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#0A0A0A] mb-6">
              More from the Blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group block"
                >
                  {p.cover_image_url && (
                    <div className="w-full h-36 relative">
                      <Image
                        src={p.cover_image_url}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category] || "bg-gray-100 text-gray-600"}`}
                    >
                      {categoryLabels[p.category] || p.category}
                    </span>
                    <h3 className="font-bold text-[#0A0A0A] text-sm mt-2 leading-snug group-hover:text-[#A07830] transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
