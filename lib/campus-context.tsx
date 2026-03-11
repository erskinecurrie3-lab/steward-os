"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type CampusContextType = {
  campusId: string;
  setCampusId: (id: string) => void;
};

const CampusContext = createContext<CampusContextType | null>(null);

export function CampusProvider({
  children,
  defaultCampusId = "all",
}: {
  children: ReactNode;
  defaultCampusId?: string;
}) {
  const [campusId, setCampusId] = useState(defaultCampusId);

  return (
    <CampusContext.Provider value={{ campusId, setCampusId }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error("useCampus must be used within CampusProvider");
  }
  return ctx;
}

export function useCampusOptional() {
  return useContext(CampusContext);
}
