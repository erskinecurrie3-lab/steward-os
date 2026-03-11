"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ChurchDetail = {
  church: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  userCount: number;
  guestCount: number;
  guests: { id: string; name: string; email: string | null }[];
  tasks: { id: string; title: string; status: string }[];
};

export default function ChurchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ChurchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/super-admin/churches/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!data) return null;

  const { church, userCount, guestCount, guests, tasks } = data;

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const res = await fetch("/api/super-admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId: church.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      if (json.url) window.location.href = json.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Impersonation failed");
    } finally {
      setImpersonating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/churches" className="text-sm text-muted-foreground hover:text-foreground">
          ← Churches
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{church.name}</h1>
          <p className="text-muted-foreground">
            {church.slug} · {church.plan}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImpersonate}
          disabled={impersonating}
        >
          {impersonating ? "Redirecting..." : "Impersonate admin"}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Users</h2>
          <p className="mt-1 text-2xl font-semibold">{userCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Guests</h2>
          <p className="mt-1 text-2xl font-semibold">{guestCount}</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-medium">Recent Guests</h2>
        <div className="divide-y">
          {guests.slice(0, 10).map((g) => (
            <div key={g.id} className="flex items-center justify-between px-4 py-2">
              <span>{g.name}</span>
              <span className="text-sm text-muted-foreground">{g.email || "—"}</span>
            </div>
          ))}
          {guests.length === 0 && <p className="px-4 py-4 text-muted-foreground">No guests</p>}
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b px-4 py-3 font-medium">Recent Tasks</h2>
        <div className="divide-y">
          {tasks.slice(0, 10).map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-2">
              <span>{t.title}</span>
              <span className="text-sm text-muted-foreground capitalize">{t.status}</span>
            </div>
          ))}
          {tasks.length === 0 && <p className="px-4 py-4 text-muted-foreground">No tasks</p>}
        </div>
      </div>
    </div>
  );
}
