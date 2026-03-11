"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Clock, AlertTriangle, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const TASK_TYPE_LABELS: Record<string, string> = {
  follow_up_call: "📞 Follow-up Call",
  send_email: "✉️ Send Email",
  send_sms: "💬 Send SMS",
  personal_visit: "🏠 Personal Visit",
  prayer: "🙏 Prayer",
  general: "✅ General Task",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  assigned: "bg-[#E8D5A3]/30 text-[#A07830]",
  accepted: "bg-[#C9A84C]/20 text-[#A07830]",
  declined: "bg-red-50 text-red-600",
  completed: "bg-[#C9A84C]/20 text-[#A07830]",
  auto_handled: "bg-[#C9A84C]/20 text-[#A07830]",
};

type Task = {
  id: string;
  title: string;
  taskType?: string;
  status: string;
  guestName?: string;
  guestId?: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  aiHandledAt?: string;
  aiMessageSent?: string;
  assignedVolunteer?: string;
};

export default function TasksPanel({
  volunteerName,
  volunteerEmail,
  showAll = false,
}: {
  volunteerName?: string;
  volunteerEmail?: string;
  showAll?: boolean;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadTasks uses volunteerName, intentional refresh
  }, [volunteerName]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      let all: Task[] = Array.isArray(data) ? data : data.tasks ?? [];
      if (!showAll && (volunteerName || volunteerEmail)) {
        all = all.filter(
          (t) =>
            t.assignedVolunteer === volunteerName ||
            t.assignedVolunteer === volunteerEmail ||
            t.status === "pending"
        );
      }
      setTasks(all);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    setUpdatingId(taskId);
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status }),
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingTasks = tasks.filter((t) =>
    ["pending", "assigned", "accepted"].includes(t.status)
  );
  const autoHandled = tasks.filter((t) => t.status === "auto_handled");
  const completed = tasks.filter((t) => t.status === "completed");

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-[#C9A84C]" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
          <Clock size={15} className="text-[#A07830]" /> Active Tasks
          {pendingTasks.length > 0 && (
            <span className="text-xs bg-[#C9A84C]/20 text-[#A07830] px-2 py-0.5 rounded-full font-bold">
              {pendingTasks.length}
            </span>
          )}
        </h3>
        {pendingTasks.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <CheckCircle size={28} className="text-[#C9A84C] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">No active tasks. Great work!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const isOverdue =
                task.dueDate && new Date(task.dueDate) < new Date();
              const isExpanded = expandedId === task.id;
              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                    isOverdue ? "border-amber-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-[#0A0A0A]">
                          {task.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            STATUS_STYLES[task.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.status.replace(/_/g, " ")}
                        </span>
                        {isOverdue && (
                          <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                        <span>
                          {TASK_TYPE_LABELS[task.taskType ?? ""] ?? task.taskType}
                        </span>
                        {task.guestName && <span>· {task.guestName}</span>}
                        {task.dueDate && (
                          <span>
                            · Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {task.status !== "completed" && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateStatus(task.id, "completed")}
                            disabled={updatingId === task.id}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-[#C9A84C]/20 text-[#A07830] font-semibold hover:bg-[#C9A84C]/30 transition-all disabled:opacity-50"
                          >
                            {updatingId === task.id ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              "Done ✓"
                            )}
                          </button>
                          {task.status !== "declined" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(task.id, "declined")}
                              disabled={updatingId === task.id}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
                            >
                              Decline
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : task.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  {isExpanded && task.description && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {task.description}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-[#9CA3AF] mt-2 italic">
                          {task.notes}
                        </p>
                      )}
                      {task.guestId && (
                        <Link
                          href={`/dashboard/guests/${task.guestId}`}
                          className="inline-block mt-2 text-xs font-semibold text-[#C9A84C] hover:text-[#A07830]"
                        >
                          View Guest Profile →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {autoHandled.length > 0 && (
        <div>
          <h3 className="font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
            <Zap size={15} className="text-[#A07830]" /> Handled by AI
            <span className="text-xs bg-[#C9A84C]/20 text-[#A07830] px-2 py-0.5 rounded-full font-bold">
              {autoHandled.length}
            </span>
          </h3>
          <div className="space-y-2">
            {autoHandled.map((task) => (
              <div
                key={task.id}
                className="bg-[#C9A84C]/10 border border-[#E8D5A3]/50 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                    <Zap size={14} className="text-[#A07830]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A0A0A]">
                      {task.title}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      AI handled on{" "}
                      {task.aiHandledAt
                        ? new Date(task.aiHandledAt).toLocaleDateString()
                        : "N/A"}
                      {task.guestName && ` · ${task.guestName}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
            <CheckCircle size={15} className="text-[#C9A84C]" /> Completed
          </h3>
          <div className="space-y-2">
            {completed.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#C9A84C]/10 border border-[#E8D5A3]/50"
              >
                <CheckCircle size={16} className="text-[#C9A84C] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0A0A0A] line-through opacity-60">
                    {task.title}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {task.guestName && `${task.guestName} · `}
                    {TASK_TYPE_LABELS[task.taskType ?? ""]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
