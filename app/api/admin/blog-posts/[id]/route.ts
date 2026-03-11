import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.excerpt !== undefined) data.excerpt = body.excerpt ? String(body.excerpt).trim() : null;
  if (body.content !== undefined) data.content = body.content ? String(body.content).trim() : null;
  if (body.category !== undefined) data.category = String(body.category).trim();
  if (body.author_name !== undefined) data.authorName = String(body.author_name).trim();
  if (body.cover_image_url !== undefined) data.coverImageUrl = body.cover_image_url ? String(body.cover_image_url).trim() : null;
  if (body.status !== undefined) data.status = String(body.status);
  if (body.published_date !== undefined) data.publishedDate = body.published_date ? new Date(body.published_date) : null;
  if (body.slug !== undefined) data.slug = body.slug ? String(body.slug).trim() : null;

  const p = await prisma.blogPost.update({
    where: { id },
    data: data as never,
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
