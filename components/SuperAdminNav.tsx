"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/super-admin", label: "Dashboard" },
  { href: "/super-admin/churches", label: "All Churches" },
  { href: "/super-admin/revenue", label: "Revenue Overview" },
  { href: "/super-admin/users", label: "All Users" },
  { href: "/super-admin/flags", label: "Feature Flags" },
  { href: "/super-admin/health", label: "System Health" },
] as const;

export function SuperAdminNav() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center gap-6 px-6">
        <Link href="/super-admin" className="font-semibold text-primary">
          Super Admin
        </Link>
        <nav className="flex gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm",
                pathname.startsWith(item.href)
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to app
          </Link>
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/sign-in` })}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
