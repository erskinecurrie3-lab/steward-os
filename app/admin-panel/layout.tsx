import { CampusProvider } from "@/lib/campus-context";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CampusProvider>
      <DashboardShell>{children}</DashboardShell>
    </CampusProvider>
  );
}
