"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCampusOptional } from "@/lib/campus-context";

export type Campus = {
  id: string;
  name: string;
};

export function CampusSwitcher({ churchId }: { churchId: string }) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const campusContext = useCampusOptional();

  const selected = campusContext?.campusId ?? "all";
  const setSelected = campusContext?.setCampusId ?? (() => {});

  useEffect(() => {
    // Sync church first (creates Church row if needed), then fetch campuses
    fetch("/api/churches/sync", { method: "POST" })
      .then(() => fetch("/api/campuses"))
      .then((r) => r.json())
      .then((data) => {
        setCampuses(Array.isArray(data) ? data : data.campuses ?? []);
      })
      .catch(() => setCampuses([]))
      .finally(() => setLoading(false));
  }, [churchId]);

  if (loading) {
    return (
      <div className="h-8 w-32 animate-pulse rounded-lg border border-input bg-muted" />
    );
  }

  return (
    <Select
      value={selected}
      onValueChange={(v) => setSelected(v ?? "all")}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Campuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Campuses</SelectItem>
        {campuses.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
