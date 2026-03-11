"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Users, DollarSign } from "lucide-react";

type Church = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  user_count: number;
  guest_count: number;
  mrr: number;
};

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<{
    churches: Church[];
    totalMrr: number;
    totalChurches: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/churches")
      .then((r) => r.json())
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setData(res);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of all churches and revenue.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Building2 className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Churches</p>
              <p className="text-2xl font-semibold">{data.totalChurches}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Guests</p>
              <p className="text-2xl font-semibold">
                {data.churches.reduce((s, c) => s + c.guest_count, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#C9A84C]/10 p-2">
              <DollarSign className="size-5 text-[#A07830] dark:text-[#E8D5A3]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MRR</p>
              <p className="text-2xl font-semibold">
                ${data.totalMrr.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Churches table */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">All Churches</h2>
          <p className="text-sm text-muted-foreground">
            Plan, guest count, and monthly recurring revenue per church.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3 text-left font-medium">Church</th>
                <th className="px-6 py-3 text-left font-medium">Plan</th>
                <th className="px-6 py-3 text-right font-medium">Guests</th>
                <th className="px-6 py-3 text-right font-medium">MRR</th>
                <th className="px-6 py-3 text-left font-medium">Created</th>
                <th className="px-6 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.churches.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-muted-foreground">{c.slug}</span>
                  </td>
                  <td className="px-6 py-3 capitalize">{c.plan}</td>
                  <td className="px-6 py-3 text-right">{c.guest_count.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-medium">
                    {c.mrr > 0 ? `$${c.mrr}` : "—"}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/super-admin/churches/${c.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
