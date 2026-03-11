import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    list.map((t) => ({
      id: t.id,
      author_name: t.authorName,
      author_title: t.authorTitle,
      church_name: t.churchName,
      quote: t.quote,
      is_visible: t.isVisible,
      created_at: t.createdAt,
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
  const { author_name, author_title, church_name, quote, is_visible } = body;
  if (!author_name?.trim() || !quote?.trim()) {
    return NextResponse.json({ error: "author_name and quote required" }, { status: 400 });
  }
  const t = await prisma.testimonial.create({
    data: {
      authorName: author_name.trim(),
      authorTitle: author_title?.trim() || null,
      churchName: church_name?.trim() || null,
      quote: quote.trim(),
      isVisible: is_visible !== false,
    },
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
