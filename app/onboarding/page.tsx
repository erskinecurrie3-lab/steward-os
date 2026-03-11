"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Church, User, MapPin, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SmsOptInDisclosure } from "@/components/forms/SmsOptIn";

type OnboardingData = {
  churchName: string;
  denomination: string;
  timezone: string;
  role: string;
  adminName: string;
  adminPhone: string;
  campusName: string;
  campusAddress: string;
  integrations: string[];
};

const STEPS = [
  { id: 1, title: "Church", icon: Church },
  { id: 2, title: "Your Role", icon: User },
  { id: 3, title: "Campus", icon: MapPin },
  { id: 4, title: "Integrations", icon: Plug },
];

const ROLES = [
  { value: "admin", label: "Church Admin" },
  { value: "pastor", label: "Senior Pastor" },
  { value: "staff", label: "Staff" },
  { value: "volunteer", label: "Volunteer" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
];

const INTEGRATIONS = [
  { id: "planning_center", name: "Planning Center", description: "Services, Check-ins, People" },
  { id: "church_center", name: "Church Center", description: "Church online platform" },
  { id: "proclaim", name: "Proclaim", description: "Presentation software" },
  { id: "pushpay", name: "Pushpay", description: "Giving & engagement" },
];

export default function OnboardingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    churchName: "",
    denomination: "",
    timezone: "America/New_York",
    role: "admin",
    adminName: "",
    adminPhone: "",
    campusName: "",
    campusAddress: "",
    integrations: [],
  });

  const update = <K extends keyof OnboardingData>(
    k: K,
    v: OnboardingData[K]
  ) => setData((d) => ({ ...d, [k]: v }));

  const toggleIntegration = (id: string) => {
    setData((d) => ({
      ...d,
      integrations: d.integrations.includes(id)
        ? d.integrations.filter((x) => x !== id)
        : [...d.integrations, id],
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.replace("/sign-in?redirect_url=/onboarding");
    return null;
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName: data.churchName,
          denomination: data.denomination,
          timezone: data.timezone,
          campusName: data.campusName,
          campusAddress: data.campusAddress,
          adminName: data.adminName,
          isSeniorPastor: data.role === "pastor" || data.role === "admin",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      // Set the new org as active so middleware allows dashboard access
      if (json.orgId && setActive) {
        await setActive({ organization: json.orgId });
      }
      router.push(json.redirect || "/dashboard");
    } catch (e) {
      setLoading(false);
      alert(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const canProceed =
    (step === 1 && data.churchName.trim()) ||
    (step === 2 && data.adminName.trim()) ||
    (step === 3 && data.campusName.trim()) ||
    step === 4;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isComplete && "bg-primary/20 text-primary",
                    !isActive && !isComplete && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-1",
                      isComplete ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content Card */}
        <div className="rounded-xl border bg-background shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold">Welcome to StewardOS</h1>
            <p className="text-muted-foreground text-sm">
              Step {step} of 4 — {STEPS[step - 1].title}
            </p>
          </div>

          {/* Step 1: Church name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Church name *</label>
                <Input
                  value={data.churchName}
                  onChange={(e) => update("churchName", e.target.value)}
                  placeholder="e.g. Lakewood Church"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Denomination</label>
                <Input
                  value={data.denomination}
                  onChange={(e) => update("denomination", e.target.value)}
                  placeholder="e.g. Baptist, Non-denominational"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Select
                  value={data.timezone}
                  onValueChange={(v) => update("timezone", v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your role</label>
                <Select
                  value={data.role}
                  onValueChange={(v) => update("role", v ?? "admin")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your name *</label>
                <Input
                  value={data.adminName}
                  onChange={(e) => update("adminName", e.target.value)}
                  placeholder="e.g. James Smith"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone (optional)</label>
                <Input
                  value={data.adminPhone}
                  onChange={(e) => update("adminPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                />
                <SmsOptInDisclosure />
              </div>
            </div>
          )}

          {/* Step 3: Campus */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campus name *</label>
                <Input
                  value={data.campusName}
                  onChange={(e) => update("campusName", e.target.value)}
                  placeholder="e.g. Main Campus"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Campus address</label>
                <Input
                  value={data.campusAddress}
                  onChange={(e) => update("campusAddress", e.target.value)}
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>
          )}

          {/* Step 4: Integrations */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Connect tools to streamline your workflow. You can configure these later in Settings.
              </p>
              <div className="space-y-3">
                {INTEGRATIONS.map((int) => (
                  <button
                    key={int.id}
                    type="button"
                    onClick={() => toggleIntegration(int.id)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg border p-4 text-left transition-colors",
                      data.integrations.includes(int.id)
                        ? "border-primary bg-primary/5"
                        : "border-input hover:bg-muted/50"
                    )}
                  >
                    <div>
                      <p className="font-medium">{int.name}</p>
                      <p className="text-sm text-muted-foreground">{int.description}</p>
                    </div>
                    <div
                      className={cn(
                        "size-5 rounded-md border-2 flex items-center justify-center",
                        data.integrations.includes(int.id)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )}
                    >
                      {data.integrations.includes(int.id) && (
                        <svg className="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Integration setup will be completed in your dashboard after onboarding.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed}
                className="gap-1"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Complete setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
