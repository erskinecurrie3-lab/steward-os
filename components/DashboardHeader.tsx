"use client";

import Link from "next/link";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import { CampusSwitcher } from "./CampusSwitcher";

export function DashboardHeader() {
  const { signOut } = useClerk();
  const { organization, membership } = useOrganization();
  const { user } = useUser();

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = (
    (user?.publicMetadata?.role as string) ?? ""
  ).toLowerCase();
  const isAdminOrPastor =
    orgRole === "org:admin" ||
    metadataRole === "admin" ||
    metadataRole === "pastor";

  if (!organization) return null;

  return (
    <header className="flex h-14 items-center gap-4 border-b px-6">
      {isAdminOrPastor && <CampusSwitcher churchId={organization.id} />}
      <nav className="flex items-center gap-4 overflow-x-auto">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Dashboard</Link>
        <Link href="/dashboard/guests" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">People</Link>
        <Link href="/dashboard/care-notes" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Care Notes</Link>
        <Link href="/dashboard/events" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Events</Link>
        <Link href="/dashboard/email-sequences" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Email</Link>
        <Link href="/dashboard/notifications" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Alerts</Link>
        <Link href="/dashboard/prayer-requests" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Prayer</Link>
        <Link href="/dashboard/volunteer" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Volunteer</Link>
        <Link href="/dashboard/workflows" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Workflows</Link>
        <Link href="/dashboard/integrations" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Integrations</Link>
        <Link href="/dashboard/analytics" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Analytics</Link>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Settings
        </Link>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/sign-in` })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
