"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { apiFetch } from "./apiClient";

/** Church profile from API (matches Church table) */
export type ChurchProfile = {
  id: string;
  name: string;
  slug?: string;
  denomination?: string;
  timezone?: string;
  logoUrl?: string;
  primaryColor?: string;
  websiteUrl?: string;
  address?: string;
  plan?: string;
};

/**
 * Church profile hook — fetches profile from /api/church.
 */
export function useChurchProfile() {
  const { user: clerkUser, isLoaded } = useUser();
  const [churchProfile, setChurchProfile] = useState<ChurchProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !clerkUser) {
      setLoading(false);
      return;
    }
    apiFetch("/api/church")
      .then((data) => {
        setChurchProfile(data as ChurchProfile);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoaded, clerkUser]);

  return {
    user: clerkUser
      ? {
          full_name: clerkUser.fullName,
          email: clerkUser.primaryEmailAddress?.emailAddress,
        }
      : null,
    churchProfile,
    churchId: churchProfile?.id ?? null,
    loading: !isLoaded || loading,
  };
}
