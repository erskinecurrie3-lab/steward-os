/**
 * StewardOS Onboarding — Complete church signup (atomic)
 * POST /api/onboarding/complete
 *
 * Atomically creates:
 * 1. Clerk Organization
 * 2. Stripe Customer
 * 3. Church + Campus + User in Prisma (single transaction)
 *
 * On failure: rolls back DB; attempts to delete orphaned Clerk org.
 * Welcome email is best-effort (non-blocking).
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    churchName,
    denomination,
    timezone,
    campusName,
    campusAddress,
    adminName,
  } = body;

  if (!churchName?.trim()) {
    return NextResponse.json(
      { error: "Church name is required" },
      { status: 400 }
    );
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email =
    clerkUser.emailAddresses[0]?.emailAddress ??
    (clerkUser.primaryEmailAddressId
      ? clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress
      : null);

  if (!email) {
    return NextResponse.json(
      { error: "No email found for user" },
      { status: 400 }
    );
  }

  // If user already completed onboarding (unique clerk_user_id), redirect to their dashboard
  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { church: { select: { clerkOrgId: true } } },
  });
  if (existingUser?.church?.clerkOrgId) {
    return NextResponse.json({
      success: true,
      churchId: existingUser.churchId,
      orgId: existingUser.church.clerkOrgId,
      redirect: "/dashboard",
    });
  }

  let orgId: string | null = null;
  let stripeCustomerId: string | null = null;

  try {
    // 1. Create Clerk Organization (external — create first)
    const org = await client.organizations.createOrganization({
      name: churchName.trim(),
      createdBy: userId,
      publicMetadata: {}, // church_id added after DB insert
    });
    orgId = org.id;

    await client.organizations.updateOrganizationMembership({
      organizationId: org.id,
      userId,
      role: "org:admin",
    });

    // 2. Create Stripe Customer (non-blocking — church can add billing later)
    try {
      if (stripe) {
        const customer = await stripe.customers.create({
          email,
          name: churchName.trim(),
          metadata: {}, // church_id added after transaction
        });
        stripeCustomerId = customer.id;
      }
    } catch (stripeErr) {
      console.error("Stripe customer creation failed (onboarding continues):", stripeErr);
      stripeCustomerId = null; // billing can be set up later
    }

    // 3. Atomic Prisma transaction: Church + Campus + User
    const result = await prisma.$transaction(async (tx) => {
      let slug = slugify(churchName) || "church-" + Date.now();
      const existingSlug = await tx.church.findUnique({ where: { slug } });
      if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

      const church = await tx.church.create({
        data: {
          name: churchName.trim(),
          slug,
          clerkOrgId: orgId!,
          stripeCustomerId,
          denomination: denomination?.trim() || null,
          timezone: timezone || "America/New_York",
          planMemberLimit: 200,
        },
      });

      const campus = await tx.campus.create({
        data: {
          churchId: church.id,
          name: (campusName || "Main Campus").trim(),
          address: campusAddress?.trim() || null,
          isMain: true,
        },
      });

      await tx.user.create({
        data: {
          churchId: church.id,
          campusId: campus.id,
          clerkUserId: userId,
          email,
          fullName: adminName?.trim() || clerkUser.firstName || null,
          role: "admin",
        },
      });

      return { church, campus };
    });

    const { church } = result;

    // 4. Update Clerk org + user metadata (post-transaction)
    await client.organizations.updateOrganization(orgId!, {
      publicMetadata: { church_id: church.id },
    });

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        church_id: church.id,
        church_name: churchName.trim(),
      },
    });

    // 5. Update Stripe customer metadata
    if (stripe && stripeCustomerId) {
      await stripe.customers.update(stripeCustomerId, {
        metadata: { church_id: church.id },
      });
    }

    // 6. Welcome email (best-effort)
    try {
      await resend.emails.send({
        from:
          process.env.RESEND_FROM ?? "StewardOS <onboarding@stewardos.cc>",
        to: email,
        subject: `Welcome to StewardOS, ${churchName}!`,
        html: `
          <h1>Welcome to StewardOS</h1>
          <p>Hi ${adminName || "there"},</p>
          <p>Your church account for <strong>${churchName}</strong> is ready.</p>
          <p>Log in at your dashboard to get started.</p>
        `,
      });
    } catch (e) {
      console.error("Welcome email failed:", e);
    }

    return NextResponse.json({
      success: true,
      churchId: church.id,
      orgId: church.clerkOrgId,
      redirect: "/dashboard",
    });
  } catch (err) {
    // Compensation: delete orphaned Clerk org if DB transaction failed
    if (orgId) {
      try {
        await client.organizations.deleteOrganization(orgId);
      } catch (cleanupErr) {
        console.error("Failed to rollback Clerk org:", cleanupErr);
      }
    }

    console.error("Onboarding failed:", err);
    const rawMessage = err instanceof Error ? err.message : String(err);
    // Surface Clerk/Stripe errors for debugging; suggest enabling Organizations if relevant
    const isOrgError =
      /organization|organizations/i.test(rawMessage) && !rawMessage.includes("church");
    const message = isOrgError
      ? `${rawMessage} Ensure Organizations are enabled in Clerk Dashboard → Organizations`
      : rawMessage;
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
