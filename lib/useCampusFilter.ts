"use client";

import { useState, useEffect } from "react";
import { useCampusOptional } from "./campus-context";

type MeResponse = {
  role: string;
  campusId: string | null;
  isAdminOrPastor: boolean;
};

export function useCampusFilter() {
  const campusContext = useCampusOptional();
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  const userCampusId = me?.campusId ?? null;
  const isAdminOrPastor = me?.isAdminOrPastor ?? false;

  // Admins and pastors see all campuses — use switcher selection or none
  if (isAdminOrPastor) {
    const selected = campusContext?.campusId ?? "all";
    const campusId = selected === "all" || !selected ? null : selected;
    return { campusId, isFiltered: !!campusId };
  }

  // Staff and volunteers are scoped to their campus
  return { campusId: userCampusId, isFiltered: !!userCampusId };
}
