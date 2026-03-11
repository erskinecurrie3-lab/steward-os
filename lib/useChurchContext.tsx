"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/** Church + auth context for dashboard and API calls */
export type ChurchContext = {
  churchId: string;
  churchDbId: string | null;
  userId: string;
  orgId: string;
  role: string;
  loading: boolean;
  isAdminOrPastor: boolean;
};

const EMPTY: ChurchContext = {
  churchId: "",
  churchDbId: null,
  userId: "",
  orgId: "",
  role: "",
  loading: true,
  isAdminOrPastor: false,
};

/**
 * Client-side church context.
 * - churchId: Clerk orgId (use for auth-scoped requests; server resolves to Church)
 * - churchDbId: Church.id from DB (fetched from /api/church)
 */
export function useChurchContext(): ChurchContext {
  const { userId, orgId, orgRole, isLoaded } = useAuth();
  const [churchDbId, setChurchDbId] = useState<string | null>(null);
  const [loadingChurch, setLoadingChurch] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId || !orgId) {
      setLoadingChurch(false);
      return;
    }
    fetch("/api/church", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setChurchDbId(data?.id ?? null))
      .catch(() => setChurchDbId(null))
      .finally(() => setLoadingChurch(false));
  }, [isLoaded, userId, orgId]);

  if (!isLoaded || !userId || !orgId) {
    return { ...EMPTY, loading: !isLoaded };
  }

  const role = (orgRole as string) ?? "org:member";
  const isAdminOrPastor =
    role === "org:admin" ||
    role.toLowerCase().includes("admin") ||
    role.toLowerCase().includes("pastor");

  return {
    churchId: orgId,
    churchDbId,
    userId,
    orgId,
    role,
    loading: loadingChurch,
    isAdminOrPastor,
  };
}
