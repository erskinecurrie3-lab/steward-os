"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const pathToTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/guests": "People & Guests",
  "/dashboard/volunteer": "Volunteer Portal",
  "/dashboard/volunteer-productivity": "Volunteer Stats",
  "/dashboard/journey-builder": "Journey Builder",
  "/dashboard/care-notes": "Care Notes",
  "/dashboard/workflows": "Workflows",
  "/dashboard/email-sequences": "Email Sequences",
  "/dashboard/events": "Events",
  "/dashboard/integrations": "Integrations",
  "/dashboard/notifications": "Alerts",
  "/dashboard/analytics": "Analytics",
  "/dashboard/resource-library": "Resources",
  "/dashboard/prayer-requests": "Prayer Requests",
  "/dashboard/settings": "Settings",
  "/admin-panel": "Admin Panel",
};

function getPageTitle(pathname: string): string {
  if (pathToTitle[pathname]) return pathToTitle[pathname];
  for (const [path, title] of Object.entries(pathToTitle)) {
    if (path !== "/dashboard" && pathname.startsWith(path)) return title;
  }
  // Fallback for nested routes e.g. /dashboard/guests/123
  const base = pathname.split("/").slice(0, 3).join("/");
  return pathToTitle[base] ?? pathname.split("/").pop() ?? "Dashboard";
}

export function DashboardTopBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const title = getPageTitle(pathname);

  return (
    <header className="hidden lg:flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
      <h1 className="text-base font-semibold text-[#0A0A0A] truncate">{title}</h1>
      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
        <span className="text-[#A07830] text-sm font-semibold">
          {user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? "U"}
        </span>
      </div>
    </header>
  );
}
