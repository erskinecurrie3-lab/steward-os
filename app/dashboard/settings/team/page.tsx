"use client";

import { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { UserPlus, Mail, Users, X, Loader2 } from "lucide-react";
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

type Invite = {
  id: string;
  email: string;
  role: string;
  campusId: string | null;
  expiresAt: string;
  createdAt: string;
};
type UserRow = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  campus: { name: string } | null;
};
type Campus = { id: string; name: string };

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "pastor", label: "Pastor" },
  { value: "staff", label: "Staff" },
  { value: "volunteer", label: "Volunteer" },
];

export default function TeamPage() {
  const { organization, membership } = useOrganization();
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"pastor" | "staff" | "volunteer">("staff");
  const [campusId, setCampusId] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdminOrPastor =
    orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";

  const fetchData = async () => {
    if (!organization || !isAdminOrPastor) return;
    const [invData, campData] = await Promise.all([
      fetch("/api/invites").then((r) => r.json()),
      fetch("/api/campuses").then((r) => r.json()),
    ]);
    if (invData.invites) setInvites(invData.invites);
    if (invData.users) setUsers(invData.users);
    if (Array.isArray(campData)) setCampuses(campData);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchData is stable, org/role capture intent
  }, [organization, isAdminOrPastor]);

  const handleSendInvite = async () => {
    setError("");
    if (!email?.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          inviteRole,
          campusId: campusId && campusId !== "all" ? campusId : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to send invite");
        return;
      }
      setEmail("");
      setInviteRole("staff");
      setCampusId("all");
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/invites/${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } finally {
      setRevokingId(null);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setUpdatingRoleId(userId);
    try {
      const res = await fetch(`/api/team/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) await fetchData();
    } finally {
      setUpdatingRoleId(null);
    }
  };

  if (!organization || !isAdminOrPastor) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-muted-foreground">You need admin access to manage the team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="mt-1 text-muted-foreground">
          Invite members and manage roles for your church.
        </p>
      </div>

      {/* Invite form */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-medium">
          <UserPlus className="size-4" />
          Send invite
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@church.org"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={inviteRole}
              onValueChange={(v) => setInviteRole(v as "pastor" | "staff" | "volunteer")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pastor">Pastor</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Campus</label>
            <Select value={campusId} onValueChange={(v) => setCampusId(v ?? "all")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All campuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campuses</SelectItem>
                {campuses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSendInvite} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="size-4 mr-2" />
                  Send invite
                </>
              )}
            </Button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </section>

      {/* Pending invites */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-medium">
          <Mail className="size-4" />
          Pending invites
        </h2>
        {invites.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No pending invites.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Expires</th>
                  <th className="pb-3 font-medium w-24"></th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="py-3">{inv.email}</td>
                    <td className="py-3 capitalize">{inv.role}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvite(inv.id)}
                        disabled={revokingId === inv.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {revokingId === inv.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <X className="size-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Active members */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-medium">
          <Users className="size-4" />
          Team members
        </h2>
        {users.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No team members yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Campus</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium w-32"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{u.fullName || "—"}</td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3 text-muted-foreground">
                      {u.campus?.name ?? "All"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Select
                          value={u.role}
                          onValueChange={(v) => v && handleUpdateRole(u.id, v)}
                          disabled={updatingRoleId === u.id}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-28 h-8",
                              updatingRoleId === u.id && "opacity-60"
                            )}
                          >
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
                        {updatingRoleId === u.id && (
                          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="py-3"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
