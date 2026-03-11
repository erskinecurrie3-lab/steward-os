/**
 * Import legacy CSV exports into Steward OS (PostgreSQL/Supabase).
 *
 * Loads .env automatically. Ensure DATABASE_URL is set.
 *
 * Usage:
 *   CHURCH_ID=<your-church-uuid> npx tsx scripts/migrate-legacy-data.ts
 *
 * Or with custom export path:
 *   DATA_EXPORT_PATH=/path/to/exports CHURCH_ID=<uuid> npx tsx scripts/migrate-legacy-data.ts
 *
 * Optionally create church from ChurchProfile:
 *   CREATE_CHURCH_FROM_PROFILE=true npx tsx scripts/migrate-legacy-data.ts
 *
 * Prerequisites:
 *   - Copy legacy export CSVs into data-export/ (or set DATA_EXPORT_PATH)
 *   - Have an existing church in Steward OS, or use CREATE_CHURCH_FROM_PROFILE
 */

import "dotenv/config";
import { parse } from "csv-parse/sync";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { prisma } from "../lib/db";

const DATA_EXPORT_PATH =
  process.env.DATA_EXPORT_PATH ||
  join(process.cwd(), "data-export");

function loadCsv<T extends Record<string, string>>(filename: string): T[] {
  const filePath = join(DATA_EXPORT_PATH, filename);
  if (!existsSync(filePath)) {
    console.warn(`Skipping ${filename} (not found)`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  return parse(content, { columns: true, skip_empty_lines: true }) as T[];
}

type GuestRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  journey_stage: string;
  is_at_risk: string;
  spiritual_background: string;
  family_status: string;
  visit_count: string;
  last_seen: string;
  notes: string;
  assigned_volunteer: string;
  created_date: string;
};

type CareNoteRow = {
  id: string;
  guest_id: string;
  guest_name: string;
  content: string;
  created_date: string;
};

type ChurchProfileRow = {
  id: string;
  church_name: string;
  website: string;
  pastor_name: string;
  denomination: string;
  city: string;
  state: string;
  brand_color: string;
  logo_url: string;
};

async function migrate() {
  console.log("Starting legacy data migration...");
  console.log("Data path:", DATA_EXPORT_PATH);

  let churchId: string | null = null;

  // Option 1: Create church from ChurchProfile
  if (process.env.CREATE_CHURCH_FROM_PROFILE === "true") {
    const profiles = loadCsv<ChurchProfileRow>("ChurchProfile_export.csv");
    if (profiles.length === 0) {
      throw new Error(
        "CREATE_CHURCH_FROM_PROFILE=true but ChurchProfile_export.csv not found or empty"
      );
    }
    const p = profiles[0];
    const slug =
      p.church_name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36);
    const church = await prisma.church.create({
      data: {
        name: p.church_name,
        slug,
        denomination: p.denomination || undefined,
        websiteUrl: p.website || undefined,
        address: [p.city, p.state].filter(Boolean).join(", ") || undefined,
        logoUrl: p.logo_url || undefined,
        primaryColor: p.brand_color || undefined,
      },
    });
    churchId = church.id;
    console.log("Created church:", church.name, "→", church.id);
  } else {
    churchId = process.env.CHURCH_ID || null;
    if (!churchId) {
      throw new Error(
        "Set CHURCH_ID env var (Steward OS church UUID) or CREATE_CHURCH_FROM_PROFILE=true"
      );
    }
    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) {
      throw new Error(`Church ${churchId} not found`);
    }
    console.log("Using church:", church.name);
  }

  // 1. Migrate Guests
  const guests = loadCsv<GuestRow>("Guest_export.csv");
  let importedGuests = 0;
  let skippedGuests = 0;
  for (const g of guests) {
    const name =
      [g.first_name?.trim(), g.last_name?.trim()].filter(Boolean).join(" ") || "Unknown";
    const email = g.email?.trim() || null;

    // Idempotency: skip if guest with same church+email or church+name already exists
    if (email) {
      const existing = await prisma.guest.findFirst({
        where: { churchId: churchId!, email },
      });
      if (existing) {
        skippedGuests++;
        continue;
      }
    } else {
      const existing = await prisma.guest.findFirst({
        where: { churchId: churchId!, name },
      });
      if (existing) {
        skippedGuests++;
        continue;
      }
    }

    const newId = randomUUID();

    await prisma.guest.create({
      data: {
        id: newId,
        churchId: churchId!,
        campusId: null,
        name,
        email,
        phone: g.phone?.trim() || null,
        notes: g.notes?.trim() || null,
        createdAt: g.created_date ? new Date(g.created_date) : undefined,
      },
    });
    importedGuests++;
  }
  console.log(`Guests: ${importedGuests} imported, ${skippedGuests} skipped (already exist)`);

  // 2. Migrate CareNotes
  // Steward OS CareNote has churchId/campusId/content (no guestId).
  // We prepend "[Guest: Name] " to preserve context.
  const careNotes = loadCsv<CareNoteRow>("CareNote_export.csv");
  let importedNotes = 0;
  for (const n of careNotes) {
    const guestName = n.guest_name?.trim() || "Unknown";
    const content = guestName ? `[Guest: ${guestName}] ${n.content || ""}` : (n.content || "");
    if (!content.trim()) continue;

    await prisma.careNote.create({
      data: {
        id: randomUUID(),
        churchId: churchId!,
        campusId: null,
        content: content.trim(),
        createdAt: n.created_date ? new Date(n.created_date) : undefined,
      },
    });
    importedNotes++;
  }
  console.log(`Migrated ${importedNotes} care notes`);

  console.log("Migration complete!");
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
