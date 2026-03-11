"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, HelpCircle } from "lucide-react";

const TOUR_STEPS = [
  {
    path: "/dashboard",
    title: "Welcome to StewardOS 👋",
    body: "This is your command center. At a glance, see at-risk guests, follow-ups due today, and your full visitor pipeline.",
  },
  {
    path: "/dashboard/guests",
    title: "People & Guests",
    body: "Add guests here, track their journey stage, assign volunteers, and log care notes. Click any guest to see their full profile.",
  },
  {
    path: "/dashboard/workflows",
    title: "Automated Workflows",
    body: "Build care sequences that run automatically — triggered by guest events like a new visit or becoming at-risk. Use the drag-and-drop editor and add if/then conditions.",
  },
  {
    path: "/dashboard/analytics",
    title: "Advanced Analytics",
    body: "Filter your retention and engagement data by date range, guest type, or workflow. Export reports as CSV with one click.",
  },
];

const STORAGE_KEY = "stewardos_tour_dismissed";

function pathToPageName(path: string): string {
  if (path === "/dashboard" || path === "/dashboard/") return "Dashboard";
  if (path.startsWith("/dashboard/guests")) return "Guests";
  if (path.startsWith("/dashboard/workflows")) return "Workflows";
  if (path.startsWith("/dashboard/analytics")) return "Analytics";
  return "";
}

export default function OnboardingTour() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [, setHelpOpen] = useState(false);

  const currentPageName = pathToPageName(pathname);
  const currentStep = TOUR_STEPS.find((s) => s.path === pathname || (s.path !== "/dashboard" && pathname.startsWith(s.path)));
  const currentStepIndex = TOUR_STEPS.findIndex((s) => s.path === pathname || (s.path !== "/dashboard" && pathname.startsWith(s.path)));

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed && currentStep) {
      const seen = JSON.parse(localStorage.getItem("stewardos_tour_seen") || "[]");
      if (!seen.includes(currentPageName)) {
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    }
  }, [pathname, currentStep, currentPageName]);

  const dismiss = () => {
    setVisible(false);
    const seen = JSON.parse(localStorage.getItem("stewardos_tour_seen") || "[]");
    seen.push(currentPageName);
    localStorage.setItem("stewardos_tour_seen", JSON.stringify(seen));
  };

  const dismissAll = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!currentStep) {
    return (
      <button
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[#C9A84C] text-[#0A0A0A] flex items-center justify-center shadow-lg hover:bg-[#E8D5A3] transition-colors"
        title="Help"
      >
        <HelpCircle size={18} />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[#C9A84C] text-[#0A0A0A] flex items-center justify-center shadow-lg hover:bg-[#E8D5A3] transition-colors"
        title="Show tour"
      >
        <HelpCircle size={18} />
      </button>

      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-sm w-full mx-4 bg-[#0A0A0A] text-white rounded-2xl shadow-2xl p-6 border border-[#C9A84C]/30">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#C9A84C] font-semibold uppercase tracking-wide">
                    Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg">{currentStep.title}</h3>
              </div>
              <button onClick={dismiss} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">{currentStep.body}</p>
            <div className="flex items-center justify-between">
              <button onClick={dismissAll} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Don&apos;t show again
              </button>
              <button onClick={dismiss} className="px-4 py-2 rounded-xl bg-[#C9A84C] text-[#0A0A0A] text-sm font-bold hover:bg-[#E8D5A3] transition-colors">
                Got it →
              </button>
            </div>
            <div className="flex gap-1.5 mt-4 justify-center">
              {TOUR_STEPS.map((s, i) => (
                <div
                  key={s.path}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStepIndex ? "bg-[#C9A84C]" : "bg-white/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
