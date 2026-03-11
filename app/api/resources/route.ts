/**
 * Church resources — list and upload
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { createSupabaseForRequest } from "@/lib/supabase";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const VALID_CATEGORIES = ["training", "policy", "forms", "media", "scripture", "other"];

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const list = await prisma.resource.findMany({
    where: { churchId: church.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(
    list.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      tags: (r.tags as string[]) || [],
      file_url: r.fileUrl,
      file_name: r.fileName,
      file_type: r.fileType,
      is_public: r.isPublic,
      uploaded_by: r.uploadedBy,
      created_at: r.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const form = await req.formData();
  const title = form.get("title") as string | null;
  const description = (form.get("description") as string | null) || "";
  const category = (form.get("category") as string | null) || "other";
  const tagsRaw = form.get("tags") as string | null;
  const is_public = form.get("is_public") === "true" || form.get("is_public") === "1";
  const file = form.get("file") as File | null;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const cat = VALID_CATEGORIES.includes(category) ? category : "other";
  const tags: string[] = tagsRaw
    ? tagsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  let fileType: string | null = null;

  if (file && file instanceof File && file.size > 0) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
    }
    const mime = file.type;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["pdf", "doc", "docx", "txt", "md", "jpg", "jpeg", "png", "gif", "webp", "mp4", "webm"];
    if (
      (mime && !ALLOWED_TYPES.includes(mime) && !mime.startsWith("image/") && !mime.startsWith("video/")) ||
      (ext && !allowedExt.includes(ext))
    ) {
      return NextResponse.json({ error: "Invalid file type. Use PDF, DOC, DOCX, TXT, MD, images, or video." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `resources/${church.id}/${Date.now()}-${safeName}`;

    try {
      const supabase = await createSupabaseForRequest();
      const { data: upload, error } = await supabase.storage
        .from("volunteer-references")
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

      if (error) {
        console.warn("Resource storage upload failed:", error.message);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
      }
      if (upload?.path) {
        const { data: signed } = await supabase.storage.from("volunteer-references").createSignedUrl(upload.path, 60 * 60 * 24 * 365);
        fileUrl = signed?.signedUrl ?? null;
      }
      fileName = file.name;
      fileType = file.type;
    } catch (e) {
      console.warn("Resource upload error:", e);
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
  }

  const dbUser = await prisma.user.findFirst({
    where: { clerkUserId: ctx.userId, churchId: church.id },
    select: { email: true, fullName: true },
  });
  const uploadedBy = dbUser?.fullName || dbUser?.email || null;

  const resource = await prisma.resource.create({
    data: {
      churchId: church.id,
      title: title.trim(),
      description: description.trim() || null,
      category: cat,
      tags,
      fileUrl,
      fileName,
      fileType,
      isPublic: is_public,
      uploadedBy,
    },
  });

  return NextResponse.json({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    tags: (resource.tags as string[]) || [],
    file_url: resource.fileUrl,
    file_name: resource.fileName,
    file_type: resource.fileType,
    is_public: resource.isPublic,
    uploaded_by: resource.uploadedBy,
    created_at: resource.createdAt,
  });
}
