/**
 * Clerk Middleware — Route protection & onboarding redirect
 * (authMiddleware is deprecated; clerkMiddleware is the modern API)
 *
 * - Protects /dashboard/* — requires auth
 * - Redirects to /onboarding if no church_id (orgId) in session
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/features",
  "/about",
  "/blog(.*)",
  "/contact",
  "/demo",
  "/checkout",
  "/resources",
  "/implementation",
  "/privacy",
  "/terms",
  "/visitor-journey",
  "/prayer",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/signup(.*)",
  "/join",
  "/api/webhooks(.*)",
  "/api/leads(.*)",
  "/api/demo(.*)",
  "/api/prayer-requests",
  "/api/church-by-slug",
  "/api/blog(.*)",
  "/guest-portal(.*)",
]);

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  await auth.protect();
  const { userId, orgId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;
  const hasChurch = !!orgId || sessionClaims?.church_id != null;
  const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const isSuperAdmin =
    superAdminIds.includes(userId ?? "") ||
    sessionClaims?.is_superadmin === true ||
    sessionClaims?.is_superadmin === "true";

  if (!pathname.startsWith("/api")) {
    // Super-admin: skip onboarding, go to super-admin panel
    if (pathname.startsWith("/onboarding") && isSuperAdmin) {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }

    // Already registered: skip onboarding, go to dashboard
    if (pathname.startsWith("/onboarding") && hasChurch) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Super-admin: allow without org; require is_superadmin
    if (pathname.startsWith("/super-admin")) {
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // Dashboard & protected routes: require church/org
    const needsOrg = (isDashboardRoute(req) || pathname === "/dashboard") && !hasChurch;
    if (needsOrg) {
      return NextResponse.redirect(
        new URL(isSuperAdmin ? "/super-admin" : "/onboarding", req.url)
      );
    }
    if (!hasChurch && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(
        new URL(isSuperAdmin ? "/super-admin" : "/onboarding", req.url)
      );
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
