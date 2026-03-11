/**
 * Volunteer references — list and upload documents for volunteers
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { createSupabaseForRequest } from "@/lib/supabase";

const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const refs = await prisma.volunteerReference.findMany({
    where: { churchId: church.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    refs.map((r) => ({
      id: r.id,
      filename: r.filename,
      url: r.url,
      fileSize: r.fileSize,
      uploadedBy: r.uploadedBy,
      createdAt: r.createdAt,
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
  const file = form.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const mime = file.type;
  if (mime && !ALLOWED_TYPES.includes(mime) && !ALLOWED_TYPES.some(() => mime.startsWith("text/"))) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["pdf", "doc", "docx", "txt", "md"];
    if (!ext || !allowedExt.includes(ext)) {
      return NextResponse.json({ error: "Invalid file type. Use PDF, DOC, DOCX, TXT, or MD." }, { status: 400 });
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `volunteer-refs/${church.id}/${Date.now()}-${safeName}`;

  let url: string | null = null;
  try {
    const supabase = await createSupabaseForRequest();
    const { data: upload, error } = await supabase.storage
      .from("volunteer-references")
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.warn("Supabase storage upload failed:", error.message);
    } else if (upload?.path) {
      const { data: signed } = await supabase.storage.from("volunteer-references").createSignedUrl(upload.path, 60 * 60 * 24 * 365);
      url = signed?.signedUrl ?? null;
    }
  } catch (e) {
    console.warn("Volunteer reference upload (Supabase):", e);
  }

  const dbUser = await prisma.user.findFirst({
    where: { clerkUserId: ctx.userId, churchId: church.id },
    select: { email: true, fullName: true },
  });
  const uploadedBy = dbUser?.fullName || dbUser?.email || null;

  const ref = await prisma.volunteerReference.create({
    data: {
      churchId: church.id,
      campusId: ctx.dbCampusId,
      filename: file.name,
      storagePath,
      url,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy,
    },
  });

  return NextResponse.json({
    id: ref.id,
    filename: ref.filename,
    url: ref.url,
    createdAt: ref.createdAt,
  });
}
