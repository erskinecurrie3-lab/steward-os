"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  Heart,
  BarChart2,
  Map,
  ClipboardList,
  Zap,
  Mail,
  Calendar,
  Bell,
  FolderOpen,
  Settings,
  Wrench,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/lib/sidebar-context";
import { CampusSwitcher } from "../CampusSwitcher";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<Record<string, unknown>>;
  /** admin-only: show only to admin/pastor; volunteer: show to volunteers; all: everyone */
  role?: "admin" | "volunteer" | "all";
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, role: "all" },
  { href: "/dashboard/guests", label: "People & Guests", Icon: Users, role: "all" },
  { href: "/dashboard/volunteer", label: "Volunteer Portal", Icon: Heart, role: "all" },
  { href: "/dashboard/volunteer-productivity", label: "Volunteer Stats", Icon: BarChart2, role: "admin" },
  { href: "/dashboard/journey-builder", label: "Journey Builder", Icon: Map, role: "admin" },
  { href: "/dashboard/care-notes", label: "Care Notes", Icon: ClipboardList, role: "all" },
  { href: "/dashboard/workflows", label: "Workflows", Icon: Zap, role: "admin" },
  { href: "/dashboard/email-sequences", label: "Email Sequences", Icon: Mail, role: "admin" },
  { href: "/dashboard/events", label: "Events", Icon: Calendar, role: "admin" },
  { href: "/dashboard/integrations", label: "Integrations", Icon: Zap, role: "admin" },
  { href: "/dashboard/notifications", label: "Alerts", Icon: Bell, role: "admin" },
  { href: "/dashboard/analytics", label: "Analytics", Icon: BarChart2, role: "admin" },
  { href: "/dashboard/resource-library", label: "Resources", Icon: FolderOpen, role: "admin" },
  { href: "/dashboard/prayer-requests", label: "Prayer Requests", Icon: Heart, role: "admin" },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings, role: "admin" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { organization, membership } = useOrganization();
  const { user } = useUser();
  const sidebar = useSidebar();
  const sidebarOpen = sidebar?.sidebarOpen ?? true;
  const setSidebarOpen = sidebar?.setSidebarOpen ?? (() => {});
  const [mobileOpen, setMobileOpen] = useState(false);

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdminOrPastor = orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";
  const isVolunteer = metadataRole === "volunteer" && !isAdminOrPastor;

  const items = navItems.filter((item) => {
    if (item.role === "all") return true;
    if (item.role === "admin") return isAdminOrPastor;
    if (item.role === "volunteer") return isVolunteer || isAdminOrPastor;
    return true;
  });

  if (isAdminOrPastor) {
    items.push({ href: "/admin-panel", label: "Admin Panel", Icon: Wrench });
  }

  const NavContent = () => (
    <>
      {items.map(({ href, label, Icon }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" &&
            pathname.startsWith(href) &&
            (pathname.length === href.length || pathname[href.length] === "/"));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? "bg-[#C9A84C]/20 text-[#E8D5A3]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >
            <Icon size={16} className={`flex-shrink-0 ${active ? "text-[#C9A84C]" : "text-white/50"}`} />
            {sidebarOpen && <span className="font-medium">{label}</span>}
          </Link>
        );
      })}
    </>
  );

  // When no org, render minimal shell so layout doesn't break; user can sign in/create org
  const showSidebar = !!organization;

  return !showSidebar ? (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 bg-white border-b px-4 flex items-center justify-center">
      <span className="text-sm text-[#6B7280]">Loading…</span>
    </div>
  ) : (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[#0A0A0A] transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"}`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#A07830] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {sidebarOpen && <span className="font-semibold text-white text-base">StewardOS</span>}
          </Link>
        </div>

        {sidebarOpen && isAdminOrPastor && (
          <div className="px-3 py-2 border-b border-white/5">
            <CampusSwitcher churchId={organization.id} />
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavContent />
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          {sidebarOpen && (
            <div className="mb-3 px-3 py-2">
              <p className="text-xs text-white/40 truncate">{user?.primaryEmailAddress?.emailAddress ?? "Loading..."}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ redirectUrl: typeof window !== "undefined" ? window.location.origin + "/" : "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 w-full transition-all"
          >
            <LogOut size={16} className="flex-shrink-0 text-white/40" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 w-full transition-all"
          >
            {sidebarOpen ? <ChevronLeft size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-40 w-64 bg-[#0A0A0A] flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#A07830] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-white text-base">StewardOS</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavContent />
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 px-3 mb-2 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          <button
            onClick={() => signOut({ redirectUrl: typeof window !== "undefined" ? window.location.origin + "/" : "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 w-full transition-all"
          >
            <LogOut size={16} className="text-white/40" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 bg-white border-b px-4 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu size={18} />
        </button>
        <span className="font-semibold text-[#0A0A0A] truncate">
          {items
            .filter(
              (i) =>
                pathname === i.href ||
                (i.href !== "/dashboard" &&
                  pathname.startsWith(i.href) &&
                  (pathname.length === i.href.length || pathname[i.href.length] === "/"))
            )
            .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Dashboard"}
        </span>
        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
          <span className="text-[#A07830] text-sm font-semibold">
            {user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? "U"}
          </span>
        </div>
      </div>
    </>
  );
}
