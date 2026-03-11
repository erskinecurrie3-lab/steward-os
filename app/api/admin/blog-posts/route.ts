import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(
    list.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      author_name: p.authorName,
      published_date: p.publishedDate,
      cover_image_url: p.coverImageUrl,
      status: p.status,
      slug: p.slug,
      created_date: p.createdAt,
      updated_at: p.updatedAt,
    }))
  );
}

export async function POST(req: Request) {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, excerpt, content, category, author_name, cover_image_url, status } = body;
  if (!title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const slug = slugify(title) + "-" + Date.now().toString(36);
  const p = await prisma.blogPost.create({
    data: {
      title: title.trim(),
      excerpt: excerpt?.trim() || null,
      content: content?.trim() || null,
      category: category?.trim() || "leadership",
      authorName: author_name?.trim() || "StewardOS Team",
      coverImageUrl: cover_image_url?.trim() || null,
      status: status?.trim() || "draft",
      slug,
    },
  });
  return NextResponse.json({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    author_name: p.authorName,
    published_date: p.publishedDate,
    cover_image_url: p.coverImageUrl,
    status: p.status,
    slug: p.slug,
    created_date: p.createdAt,
  });
}
