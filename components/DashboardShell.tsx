"use client";

import { DashboardHeader } from "./DashboardHeader";
import { CampusProvider } from "@/lib/campus-context";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <CampusProvider>
      <div className="min-h-screen">
        <DashboardHeader />
        <main className="p-6">{children}</main>
      </div>
    </CampusProvider>
  );
}
