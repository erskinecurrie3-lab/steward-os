"use client";

import { useState, useEffect } from "react";
import { useChurchContext } from "@/lib/useChurchContext";
import { Copy, Loader2 } from "lucide-react";
import IntegrationManager from "@/components/integrations/IntegrationManager";
import WorkflowBuilder from "@/components/integrations/WorkflowBuilder";

type SyncJob = {
  id: string;
  provider: string;
  syncType: string;
  status: string;
  startedAt: string;
  durationMs: number | null;
  recordsSynced: number;
  recordsFailed: number;
  errorMessage: string | null;
};

type WebhookLog = {
  id: string;
  provider: string;
  eventType: string;
  status: string;
  error: string | null;
  createdAt: string;
};

export default function IntegrationsPage() {
  const { churchDbId, loading: churchLoading } = useChurchContext();
  const [activeTab, setActiveTab] = useState<
    "connections" | "workflows" | "logs" | "webhooks"
  >("connections");
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const webhookUrl =
    typeof window !== "undefined" && churchDbId
      ? `${window.location.origin}/api/webhooks/integration?church_id=${churchDbId}&provider={{provider}}`
      : "";

  useEffect(() => {
    if (churchLoading) return;
    const load = async () => {
      setLoadingJobs(true);
      try {
        const [jobsRes, logsRes] = await Promise.all([
          fetch("/api/integrations/sync-jobs", { credentials: "include" }),
          fetch("/api/integrations/webhook-logs", { credentials: "include" }),
        ]);
        const jobs = await jobsRes.json();
        const logs = await logsRes.json();
        setSyncJobs(Array.isArray(jobs) ? jobs : []);
        setWebhookLogs(Array.isArray(logs) ? logs : []);
      } catch {
        setSyncJobs([]);
        setWebhookLogs([]);
      } finally {
        setLoadingJobs(false);
      }
    };
    load();
  }, [churchLoading]);

  if (churchLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Integrations</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Connect StewardOS to your favorite church software
        </p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
        {(["connections", "workflows", "logs", "webhooks"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-[#0A0A0A] text-white"
                  : "text-[#6B7280] hover:bg-gray-50"
              }`}
            >
              {tab === "connections"
                ? "Connections"
                : tab === "workflows"
                  ? "Automations"
                  : tab === "logs"
                    ? "Sync Logs"
                    : "Webhooks"}
            </button>
          )
        )}
      </div>

      {activeTab === "connections" && (
        <IntegrationManager churchId={churchDbId} />
      )}

      {activeTab === "workflows" && (
        <WorkflowBuilder churchId={churchDbId} />
      )}

      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Sync History</h2>
            <button
              onClick={() => {
                setLoadingJobs(true);
                Promise.all([
                  fetch("/api/integrations/sync-jobs", { credentials: "include" }),
                  fetch("/api/integrations/webhook-logs", { credentials: "include" }),
                ])
                  .then(([a, b]) => Promise.all([a.json(), b.json()]))
                  .then(([jobs, logs]) => {
                    setSyncJobs(Array.isArray(jobs) ? jobs : []);
                    setWebhookLogs(Array.isArray(logs) ? logs : []);
                  })
                  .finally(() => setLoadingJobs(false));
              }}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
          {loadingJobs ? (
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
            </div>
          ) : syncJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-[#9CA3AF]">
              No sync history yet. Connect an integration to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {syncJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0A0A0A]">
                        {job.provider.toUpperCase()} - {job.syncType}
                      </h3>
                      <div className="flex gap-4 mt-2 text-sm text-[#6B7280]">
                        <span>Status: {job.status}</span>
                        <span>
                          Started:{" "}
                          {new Date(job.startedAt).toLocaleString()}
                        </span>
                        {job.durationMs != null && (
                          <span>Duration: {job.durationMs}ms</span>
                        )}
                        <span className="text-green-600">
                          {job.recordsSynced} synced
                        </span>
                        {job.recordsFailed > 0 && (
                          <span className="text-red-600">
                            {job.recordsFailed} failed
                          </span>
                        )}
                      </div>
                    </div>
                    {job.status === "failed" && job.errorMessage && (
                      <div className="text-right text-xs text-red-600 max-w-xs truncate">
                        {job.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-[#0A0A0A] mb-2 text-base">
              Webhook Configuration
            </h3>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                Webhook URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-mono text-[#6B7280]"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    alert("Copied to clipboard");
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Register this URL in your integration provider&apos;s webhook
                settings. Replace <code className="bg-blue-100 px-1 rounded">{`{{provider}}`}</code> with the provider name (e.g. planningcenter, pushpay).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Webhook Events</h2>
            {webhookLogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-[#9CA3AF]">
                No webhook events yet.
              </div>
            ) : (
              <div className="space-y-2">
                {webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[#0A0A0A]">
                          {log.provider} - {log.eventType}
                        </h3>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === "received"
                            ? "bg-green-100 text-green-700"
                            : log.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    {log.error && (
                      <p className="text-xs text-red-600 mt-2">{log.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
