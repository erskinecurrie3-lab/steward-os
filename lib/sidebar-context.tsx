"use client";

import { createContext, useContext, useState } from "react";

type SidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  return ctx;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultOpen);
  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}
