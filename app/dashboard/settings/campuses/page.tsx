"use client";

import { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { MapPin, Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Campus = {
  id: string;
  name: string;
  address: string | null;
  pastorName: string | null;
  isMain: boolean;
};

export default function CampusesSettingsPage() {
  const { membership, organization } = useOrganization();
  const { user } = useUser();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [isMain, setIsMain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPastorName, setEditPastorName] = useState("");
  const [editIsMain, setEditIsMain] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdmin =
    orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";

  const fetchCampuses = async () => {
    if (!organization || !isAdmin) return;
    const res = await fetch("/api/campuses");
    const data = await res.json();
    if (Array.isArray(data)) setCampuses(data);
  };

  useEffect(() => {
    fetchCampuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchCampuses is stable, org/isAdmin capture intent
  }, [organization, isAdmin]);

  const resetForm = () => {
    setName("");
    setAddress("");
    setPastorName("");
    setIsMain(false);
    setError("");
  };

  const handleAdd = async () => {
    setError("");
    if (!name?.trim()) {
      setError("Campus name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/campuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim() || null,
          pastorName: pastorName.trim() || null,
          isMain,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to add campus");
        return;
      }
      resetForm();
      await fetchCampuses();
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: Campus) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditAddress(c.address || "");
    setEditPastorName(c.pastorName || "");
    setEditIsMain(c.isMain);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUpdatingId(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editName?.trim()) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/campuses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          address: editAddress.trim() || null,
          pastorName: editPastorName.trim() || null,
          isMain: editIsMain,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchCampuses();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campus? Staff and guests assigned to it will be moved to org-wide.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/campuses/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingId === id) setEditingId(null);
        await fetchCampuses();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to delete");
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="text-muted-foreground">Only admins can manage campuses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold">Campuses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, and remove campuses. Assign staff and guests to specific campuses.
        </p>
      </div>

      {/* Add campus form */}
      <section className="rounded-xl border bg-card p-6">
        <h3 className="flex items-center gap-2 font-medium">
          <Plus className="size-4" />
          Add campus
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="North Campus"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pastor name</label>
            <Input
              value={pastorName}
              onChange={(e) => setPastorName(e.target.value)}
              placeholder="Pastor John"
            />
          </div>
          <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isMain}
                onChange={(e) => setIsMain(e.target.checked)}
                className="rounded border-input"
              />
              Main campus
            </label>
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-2" />
                  Add campus
                </>
              )}
            </Button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </section>

      {/* Campus list */}
      <section className="rounded-xl border bg-card p-6">
        <h3 className="flex items-center gap-2 font-medium">
          <MapPin className="size-4" />
          Campuses
        </h3>
        {campuses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No campuses yet. Add one above.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Address</th>
                  <th className="pb-3 font-medium">Pastor</th>
                  <th className="pb-3 font-medium w-32"></th>
                </tr>
              </thead>
              <tbody>
                {campuses.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    {editingId === c.id ? (
                      <>
                        <td className="py-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Name"
                            className="h-8 max-w-[200px]"
                          />
                        </td>
                        <td className="py-3">
                          <Input
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="Address"
                            className="h-8 max-w-[200px]"
                          />
                        </td>
                        <td className="py-3">
                          <Input
                            value={editPastorName}
                            onChange={(e) => setEditPastorName(e.target.value)}
                            placeholder="Pastor"
                            className="h-8 max-w-[160px]"
                          />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs">
                              <input
                                type="checkbox"
                                checked={editIsMain}
                                onChange={(e) => setEditIsMain(e.target.checked)}
                                className="rounded border-input"
                              />
                              Main
                            </label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdate(c.id)}
                              disabled={!editName.trim() || updatingId === c.id}
                            >
                              {updatingId === c.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4 text-[#A07830]" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              disabled={updatingId === c.id}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3">
                          <span className="font-medium">{c.name}</span>
                          {c.isMain && (
                            <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                              Main
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">{c.address || "—"}</td>
                        <td className="py-3 text-muted-foreground">{c.pastorName || "—"}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(c)}
                              disabled={deletingId === c.id}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(c.id)}
                              disabled={deletingId === c.id || campuses.length <= 1}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {deletingId === c.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
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
