/**
 * Public — List published blog posts
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function estimateReadTime(content: string | null): number {
  if (!content) return 5;
  const words = content.split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 200));
}

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedDate: "desc" },
    take: 50,
  });

  return NextResponse.json(
    posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt || "",
      category: p.category,
      author_name: p.authorName,
      published_date: p.publishedDate ? p.publishedDate.toISOString().slice(0, 10) : null,
      read_time_minutes: estimateReadTime(p.content),
      cover_image_url: p.coverImageUrl || "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
    }))
  );
}
