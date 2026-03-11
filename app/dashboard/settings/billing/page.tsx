"use client";

import { useState, useEffect, Suspense } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { CreditCard, TrendingUp, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    limit: "200 members",
    limitNum: 200,
    features: ["1 campus", "Guests, tasks, care notes"],
    cta: null,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$99",
    limit: "1,000 members",
    limitNum: 1000,
    features: ["3 campuses", "Integrations", "AI task gen"],
    cta: "Upgrade to Growth",
  },
  {
    id: "network",
    name: "Network",
    price: "$199",
    limit: "Unlimited",
    limitNum: 999999,
    features: ["Unlimited campuses", "White-label", "API access"],
    cta: "Upgrade to Network",
  },
];

type BillingInfo = {
  plan: string;
  planMemberLimit: number;
  memberCount: number;
  userCount: number;
  atLimit: boolean;
  hasActiveSubscription?: boolean;
};

function BillingContent() {
  const { membership } = useOrganization();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdmin = orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";

  useEffect(() => {
    const successParam = searchParams.get("success");
    if (successParam === "1") setSuccess(true);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBilling(data);
      })
      .catch(() => setError("Failed to load billing info"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      if (json.url) {
        window.location.href = json.url;
        return; // Keep loading state while redirecting
      }
      throw new Error(json.error || "No checkout URL received. Check Stripe price IDs in .env.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to open portal");
      if (json.url) window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="text-muted-foreground">Only admins can manage billing.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading billing...
      </div>
    );
  }

  const usagePercent = billing
    ? Math.min(100, (billing.memberCount / billing.planMemberLimit) * 100)
    : 0;
  const isNearLimit = billing && usagePercent >= 80 && !billing.atLimit;

  return (
    <div className="space-y-8">
      {success && (
        <div className="rounded-xl border border-[#E8D5A3]/50 bg-[#C9A84C]/10 dark:bg-[#C9A84C]/20 dark:border-[#E8D5A3]/30 p-4">
          <p className="text-sm text-[#A07830] dark:text-[#E8D5A3]">
            Payment successful! Your plan has been updated.
          </p>
        </div>
      )}

      {/* Current plan & usage */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-medium">
          <CreditCard className="size-4" />
          Current plan
        </h2>
        {billing && (
          <>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-2xl font-semibold capitalize">{billing.plan}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {billing.memberCount} / {billing.planMemberLimit} guests
                  {billing.atLimit && (
                    <span className="ml-2 font-medium text-destructive">(limit reached)</span>
                  )}
                </p>
              </div>
              {billing.hasActiveSubscription && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Manage subscription"
                  )}
                </Button>
              )}
            </div>
            <div className="mt-4">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={usagePercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    billing.atLimit
                      ? "bg-destructive"
                      : isNearLimit
                        ? "bg-amber-500"
                        : "bg-primary"
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </section>

      {/* Upgrade CTA */}
      <section className="rounded-xl border bg-card p-6">
        {billing?.atLimit && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              You&apos;ve reached your guest limit. Upgrade to add more guests and unlock more features.
            </p>
          </div>
        )}
        <h2 className="flex items-center gap-2 font-medium">
          <TrendingUp className="size-4" />
          Upgrade plan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Start a 14-day free trial. Cancel anytime. Stripe Checkout handles payment securely.
        </p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = billing?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-xl border p-6 space-y-4",
                  isCurrent && "border-primary/50 bg-primary/5"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{plan.name}</h3>
                    {isCurrent && (
                      <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-2xl font-semibold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{plan.limit}</p>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                {plan.cta && (
                  <Button
                    variant={isCurrent ? "secondary" : "default"}
                    className="w-full"
                    disabled={isCurrent || checkoutLoading !== null}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrent ? (
                      "Current plan"
                    ) : checkoutLoading === plan.id ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Redirecting to Stripe...
                      </>
                    ) : (
                      <>
                        <Zap className="size-4 mr-2" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function BillingSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
