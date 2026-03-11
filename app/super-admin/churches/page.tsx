"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Church = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  stripe_customer_id: string | null;
  user_count: number;
  guest_count: number;
  mrr: number;
};

export default function SuperAdminChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/churches")
      .then((r) => r.json())
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setChurches(res.churches ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All Churches</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-right font-medium">Users</th>
              <th className="px-4 py-3 text-right font-medium">Guests</th>
              <th className="px-4 py-3 text-right font-medium">MRR</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-left font-medium" />
            </tr>
          </thead>
          <tbody>
            {churches.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 capitalize">{c.plan}</td>
                <td className="px-4 py-3 text-right">{c.user_count}</td>
                <td className="px-4 py-3 text-right">{c.guest_count}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {c.mrr > 0 ? `$${c.mrr}` : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
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
  );
}
