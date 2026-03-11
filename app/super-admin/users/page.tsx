"use client";

import { useState } from "react";

type User = { id: string; email: string; fullName: string | null; role: string; churchName: string };

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    fetch(`/api/super-admin/users?q=${encodeURIComponent(query.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">All Users</h1>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or name..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Church</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.fullName || "—"}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">{u.churchName}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <p className="p-6 text-center text-muted-foreground">
            Enter a search term to find users.
          </p>
        )}
      </div>
    </div>
  );
}
