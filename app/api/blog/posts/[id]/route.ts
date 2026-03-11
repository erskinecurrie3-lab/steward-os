/**
 * Public — Get single blog post by id or slug
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function estimateReadTime(content: string | null): number {
  if (!content) return 5;
  const words = content.split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 200));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const post = await prisma.blogPost.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      status: "published",
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content || "",
    category: post.category,
    author_name: post.authorName,
    published_date: post.publishedDate ? post.publishedDate.toISOString().slice(0, 10) : null,
    read_time_minutes: estimateReadTime(post.content),
    cover_image_url: post.coverImageUrl || "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
  });
}
