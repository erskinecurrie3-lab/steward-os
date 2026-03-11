"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import OnboardingTour from "@/components/onboarding/OnboardingTour";

const ADMIN_ONLY_PATHS = [
  "/dashboard/volunteer-productivity",
  "/dashboard/journey-builder",
  "/dashboard/workflows",
  "/dashboard/email-sequences",
  "/dashboard/events",
  "/dashboard/integrations",
  "/dashboard/notifications",
  "/dashboard/analytics",
  "/dashboard/resource-library",
  "/dashboard/prayer-requests",
  "/dashboard/settings",
  "/admin-panel",
];

function RoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
    const isVolunteer = metadataRole === "volunteer";
    if (!isVolunteer) return;

    const isAdminPath = ADMIN_ONLY_PATHS.some(
      (p) => pathname === p || (pathname.startsWith(p) && (pathname.length === p.length || pathname[p.length] === "/"))
    );
    if (isAdminPath) router.replace("/dashboard");
  }, [pathname, router, user?.publicMetadata?.role]);

  return <>{children}</>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </SidebarProvider>
  );
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar();
  const sidebarOpen = sidebar?.sidebarOpen ?? true;
  const marginLeft = sidebarOpen ? "lg:ml-60" : "lg:ml-16";

  return (
    <div className="min-h-screen flex bg-[#F8F8F7]">
      <DashboardSidebar />
      <main
        className={`flex-1 transition-all duration-300 ${marginLeft} min-w-0 pt-14 lg:pt-0`}
      >
        <DashboardTopBar />
        <div className="p-4 lg:p-8 overflow-x-hidden">
          <RoleGate>{children}</RoleGate>
        </div>
      </main>
      <OnboardingTour />
    </div>
  );
}
