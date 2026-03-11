"use client";

import { useState, useEffect } from "react";

type RevenueData = {
  planCounts: Record<string, number>;
  totalChurches: number;
};

export default function SuperAdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/revenue")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Revenue Overview</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h2 className="font-medium">Total Churches</h2>
          <p className="mt-2 text-3xl font-semibold">{data?.totalChurches ?? 0}</p>
        </div>
        {data?.planCounts &&
          Object.entries(data.planCounts).map(([plan, count]) => (
            <div key={plan} className="rounded-lg border p-6">
              <h2 className="font-medium capitalize">{plan}</h2>
              <p className="mt-2 text-3xl font-semibold">{count}</p>
            </div>
          ))}
      </div>
      <p className="text-sm text-muted-foreground">
        MRR by plan, churn rate, and new churches — full metrics coming soon.
      </p>
    </div>
  );
}
