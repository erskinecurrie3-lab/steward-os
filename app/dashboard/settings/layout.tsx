"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/settings", label: "Church Profile", adminOnly: true },
  { href: "/dashboard/settings/campuses", label: "Campuses", adminOnly: true },
  { href: "/dashboard/settings/team", label: "Team", adminOnly: true },
  { href: "/dashboard/settings/integrations", label: "Integrations", adminOnly: true },
  { href: "/dashboard/settings/billing", label: "Billing", adminOnly: true },
  { href: "/dashboard/settings/notifications", label: "Notifications", adminOnly: false },
  { href: "/dashboard/settings/profile", label: "Profile", adminOnly: false },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { membership } = useOrganization();
  const { user } = useUser();

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdmin = orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";

  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your church and personal preferences.
        </p>
      </div>

      <nav className="flex gap-1 border-b" role="tablist">
        {visibleTabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard/settings"
              ? pathname === "/dashboard/settings"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
