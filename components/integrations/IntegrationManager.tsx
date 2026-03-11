"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, Trash2, Loader2 } from "lucide-react";

const PROVIDERS: Record<
  string,
  { label: string; color: string; description: string; supportsSync?: boolean }
> = {
  planningcenter: {
    label: "Planning Center",
    color: "bg-orange-100 text-orange-700",
    description: "People, Events, Groups",
    supportsSync: true,
  },
  pushpay: {
    label: "Pushpay",
    color: "bg-blue-100 text-blue-700",
    description: "Giving & mobile",
  },
  subsplash: {
    label: "Subsplash",
    color: "bg-indigo-100 text-indigo-700",
    description: "Apps & giving",
  },
  breeze: {
    label: "Breeze",
    color: "bg-cyan-100 text-cyan-700",
    description: "ChMS",
  },
  rockrms: {
    label: "Rock RMS",
    color: "bg-amber-100 text-amber-700",
    description: "ChMS",
  },
  tithely: {
    label: "Tithely",
    color: "bg-green-100 text-green-700",
    description: "Giving",
  },
  mailchimp: {
    label: "Mailchimp",
    color: "bg-yellow-100 text-yellow-700",
    description: "Email marketing",
  },
  twilio: {
    label: "Twilio",
    color: "bg-red-100 text-red-700",
    description: "SMS",
  },
  zapier: {
    label: "Zapier",
    color: "bg-violet-100 text-violet-700",
    description: "Automations",
  },
};

type Config = {
  id: string;
  provider: string;
  status: string;
  syncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  lastError: string | null;
  createdAt: string;
};

type Props = { churchId: string | null };

export default function IntegrationManager({ churchId }: Props) {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncType, setSyncType] = useState<"people" | "events" | "groups" | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const loadConfigs = () => {
    if (!churchId) return;
    fetch("/api/integrations/configs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setConfigs(Array.isArray(data) ? data : []))
      .catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!churchId) return;
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadConfigs uses churchId, intentional single run per churchId
  }, [churchId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("planning_center") === "connected" && churchId) {
      loadConfigs();
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadConfigs uses churchId, intentional single run per churchId
  }, [churchId]);

  const handleConnect = async (provider: string) => {
    if (provider === "planningcenter") {
      window.location.href = "/api/integrations/planning-center/authorize";
      return;
    }
    setConnecting(provider);
    try {
      const res = await fetch("/api/integrations/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setConfigs((prev) => {
          const exists = prev.find((c) => c.provider === provider);
          if (exists) return prev.map((c) => (c.provider === provider ? data : c));
          return [...prev, data];
        });
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Disconnect this integration?")) return;
    const res = await fetch(`/api/integrations/configs/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setConfigs((prev) => prev.filter((c) => c.id !== id));
    setMenuOpen(null);
  };

  const handleSync = async (provider: string, type: "people" | "events" | "groups") => {
    if (provider !== "planningcenter") return;
    setSyncing(provider);
    setSyncType(type);
    const endpoint =
      type === "people"
        ? "/api/integrations/planning-center/sync"
        : type === "events"
          ? "/api/integrations/planning-center/sync-events"
          : "/api/integrations/planning-center/sync-groups";
    const label = type === "people" ? "people" : type === "events" ? "events" : "groups";
    try {
      const res = await fetch(endpoint, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setConfigs((prev) =>
          prev.map((c) => {
            if (c.provider === provider && data.synced !== undefined) {
              return {
                ...c,
                lastSyncAt: new Date().toISOString(),
                lastSyncStatus: `Synced ${data.synced} ${label}`,
                lastError: data.error ?? null,
              };
            }
            return c;
          })
        );
      }
    } finally {
      setSyncing(null);
      setSyncType(null);
    }
  };

  const connectedProviders = new Set(configs.map((c) => c.provider));
  const availableProviders = Object.entries(PROVIDERS).filter(
    ([p]) => !connectedProviders.has(p)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.map((c) => {
          const info = PROVIDERS[c.provider] ?? {
            label: c.provider,
            color: "bg-gray-100 text-gray-700",
            description: "",
          };
          return (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.color}`}
                  >
                    {info.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === "connected"
                        ? "bg-green-50 text-green-700"
                        : c.status === "error"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-1">{info.description}</p>
                {c.lastSyncAt && (
                  <p className="text-xs text-[#6B7280] mt-1">
                    Last sync: {new Date(c.lastSyncAt).toLocaleString()}
                    {c.lastSyncStatus && ` (${c.lastSyncStatus})`}
                  </p>
                )}
                {c.lastError && (
                  <p className="text-xs text-red-600 mt-1 truncate">{c.lastError}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {PROVIDERS[c.provider]?.supportsSync && c.status === "connected" && (
                  <div className="flex gap-1">
                    {(["people", "events", "groups"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleSync(c.provider, t)}
                        disabled={syncing === c.provider}
                        className="px-2 py-1 rounded-lg bg-[#C9A84C]/20 text-[#A07830] text-xs font-semibold hover:bg-[#C9A84C]/30 disabled:opacity-60 capitalize"
                      >
                        {syncing === c.provider && syncType === t ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          `Sync ${t}`
                        )}
                      </button>
                    ))}
                  </div>
                )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <MoreVertical size={18} />
                </button>
                {menuOpen === c.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                    <button
                      onClick={() => handleDisconnect(c.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {availableProviders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Add connection</h3>
          <div className="flex flex-wrap gap-2">
            {availableProviders.map(([provider, info]) => (
              <button
                key={provider}
                onClick={() => handleConnect(provider)}
                disabled={connecting === provider}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-60"
              >
                {connecting === provider ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                {info.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {configs.length === 0 && availableProviders.length === 0 && (
        <p className="text-sm text-[#9CA3AF]">All integrations connected.</p>
      )}

      {configs.length === 0 && availableProviders.length > 0 && (
        <p className="text-sm text-[#9CA3AF]">
          Connect Planning Center, Pushpay, Subsplash, Twilio, or Mailchimp to sync data.
        </p>
      )}
    </div>
  );
}
