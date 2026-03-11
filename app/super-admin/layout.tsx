"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SuperAdminNav } from "@/components/SuperAdminNav";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    fetch("/api/super-admin/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.isSuperAdmin) {
          setAllowed(true);
        } else {
          setAllowed(false);
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        setAllowed(false);
        router.replace("/sign-in?redirect_url=/super-admin");
      });
  }, [isLoaded, router]);

  if (!isLoaded || allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <SuperAdminNav />
      <main className="p-6">{children}</main>
    </div>
  );
}
