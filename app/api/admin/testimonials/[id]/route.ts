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
  const { is_visible, author_name, author_title, church_name, quote } = body;
  const data: Record<string, unknown> = {};
  if (typeof is_visible === "boolean") data.isVisible = is_visible;
  if (author_name !== undefined) data.authorName = String(author_name).trim();
  if (author_title !== undefined) data.authorTitle = author_title ? String(author_title).trim() : null;
  if (church_name !== undefined) data.churchName = church_name ? String(church_name).trim() : null;
  if (quote !== undefined) data.quote = String(quote).trim();
  const t = await prisma.testimonial.update({
    where: { id },
    data: data as never,
  });
  return NextResponse.json({
    id: t.id,
    author_name: t.authorName,
    author_title: t.authorTitle,
    church_name: t.churchName,
    quote: t.quote,
    is_visible: t.isVisible,
    created_at: t.createdAt,
  });
}
