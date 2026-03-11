"use client";

import { useState } from "react";
import {
  Zap,
  Plus,
  Wand2,
  Loader2,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Settings,
  X,
  Check,
} from "lucide-react";
import AIContentAssistant from "@/components/ai/AIContentAssistant";

const TRIGGERS = [
  { value: "new_visitor", label: "Guest added as new visitor" },
  { value: "at_risk", label: "Guest flagged as at-risk" },
  { value: "second_visit", label: "Guest visits 2nd time" },
  { value: "stage_change", label: "Guest advances a journey stage" },
  { value: "no_contact_7", label: "No contact in 7 days" },
  { value: "no_contact_14", label: "No contact in 14 days" },
  { value: "member_milestone", label: "Guest becomes a member" },
  { value: "custom_tag", label: "Guest receives a specific tag" },
  { value: "family_joined", label: "Guest brings family" },
  { value: "birthday", label: "Guest birthday" },
];

const ACTION_TYPES = [
  { value: "email", label: "📧 Send Email", color: "bg-blue-50 text-blue-700" },
  { value: "sms", label: "💬 Send SMS", color: "bg-green-50 text-green-700" },
  { value: "task", label: "✅ Assign Task to Volunteer", color: "bg-purple-50 text-purple-700" },
  { value: "stage", label: "🗺️ Advance Journey Stage", color: "bg-orange-50 text-orange-700" },
  { value: "flag", label: "🚩 Flag for Pastoral Review", color: "bg-red-50 text-red-700" },
  { value: "condition", label: "🔀 If/Then Branch", color: "bg-yellow-50 text-yellow-700" },
  { value: "wait", label: "⏱️ Wait", color: "bg-gray-50 text-gray-600" },
];

type Step = {
  id: string;
  type: string;
  delay: number;
  delayUnit: string;
  message: string;
  assignTo: string;
  condition?: string;
};

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  active: boolean;
  applied: number;
  steps: Step[];
};

const defaultWorkflows: Workflow[] = [
  {
    id: "wf1",
    name: "New Visitor Welcome Sequence",
    trigger: "new_visitor",
    active: true,
    applied: 12,
    steps: [
      { id: "s1", type: "email", delay: 0, delayUnit: "days", message: "Welcome to Grace Community! We're so glad you joined us this Sunday.", assignTo: "" },
      { id: "s2", type: "wait", delay: 3, delayUnit: "days", message: "", assignTo: "" },
      { id: "s3", type: "task", delay: 0, delayUnit: "days", message: "Make a personal welcome call to the guest.", assignTo: "Volunteer Team" },
      { id: "s4", type: "wait", delay: 4, delayUnit: "days", message: "", assignTo: "" },
      { id: "s5", type: "email", delay: 0, delayUnit: "days", message: "A personal note from our pastor — we'd love to have you back this Sunday.", assignTo: "" },
      { id: "s6", type: "wait", delay: 7, delayUnit: "days", message: "", assignTo: "" },
      { id: "s7", type: "task", delay: 0, delayUnit: "days", message: "Invite guest to a connection group or small group event.", assignTo: "Guest Coordinator" },
    ],
  },
  {
    id: "wf2",
    name: "At-Risk Re-engagement",
    trigger: "at_risk",
    active: true,
    applied: 3,
    steps: [
      { id: "s1", type: "task", delay: 0, delayUnit: "days", message: "Immediately notify assigned volunteer that guest is at-risk.", assignTo: "Volunteer Team" },
      { id: "s2", type: "wait", delay: 1, delayUnit: "days", message: "", assignTo: "" },
      { id: "s3", type: "task", delay: 0, delayUnit: "days", message: "Make a warm personal phone call to check in.", assignTo: "" },
      { id: "s4", type: "wait", delay: 4, delayUnit: "days", message: "", assignTo: "" },
      { id: "s5", type: "email", delay: 0, delayUnit: "days", message: "We've been thinking about you. No pressure — just want you to know the door is always open.", assignTo: "" },
      { id: "s6", type: "wait", delay: 5, delayUnit: "days", message: "", assignTo: "" },
      { id: "s7", type: "flag", delay: 0, delayUnit: "days", message: "Escalate to pastoral team if still no response.", assignTo: "" },
    ],
  },
];

function StepCard({
  step,
  index,
  onUpdate,
  onDelete,
}: {
  step: Step;
  index: number;
  onUpdate: (id: string, changes: Partial<Step>) => void;
  onDelete: (id: string) => void;
}) {
  const actionType = ACTION_TYPES.find((a) => a.value === step.type);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      {index > 0 && (
        <div className="absolute -top-4 left-7 w-px h-4 bg-gray-200" />
      )}
      <div
        className={`rounded-xl border bg-white transition-all ${
          expanded ? "border-[#C9A84C]/40 shadow-md shadow-[#C9A84C]/5" : "border-gray-100 hover:border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 p-3">
          <div className="text-gray-300 cursor-grab">
            <GripVertical size={16} />
          </div>
          <div
            className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg ${
              actionType?.color ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {actionType?.label ?? step.type}
          </div>
          {step.type === "wait" && (
            <span className="text-sm text-gray-500">
              Wait <strong>{step.delay} {step.delayUnit}</strong>
            </span>
          )}
          {step.type !== "wait" && step.message && (
            <span className="text-sm text-gray-500 truncate flex-1">{step.message}</span>
          )}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={() => onDelete(step.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Action Type</label>
                <select
                  value={step.type}
                  onChange={(e) => onUpdate(step.id, { type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                >
                  {ACTION_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              {step.type === "wait" ? (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Wait Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={step.delay}
                      onChange={(e) =>
                        onUpdate(step.id, { delay: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    />
                    <select
                      value={step.delayUnit}
                      onChange={(e) => onUpdate(step.id, { delayUnit: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Delay After Previous</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={step.delay}
                      onChange={(e) =>
                        onUpdate(step.id, { delay: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    />
                    <select
                      value={step.delayUnit}
                      onChange={(e) => onUpdate(step.id, { delayUnit: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            {step.type === "condition" && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                <label className="text-xs text-yellow-700 font-semibold mb-1 block">
                  If/Then Condition
                </label>
                <input
                  value={step.condition ?? ""}
                  onChange={(e) => onUpdate(step.id, { condition: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-200 text-sm focus:outline-none focus:border-yellow-400 bg-white"
                  placeholder="e.g. IF guest is at_risk THEN assign volunteer"
                />
                <p className="text-xs text-yellow-600 mt-1">
                  Use plain language — e.g. &quot;IF stage is Welcome THEN send email&quot;
                </p>
              </div>
            )}
            {step.type !== "wait" && step.type !== "condition" && (
              <>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {step.type === "task" ? "Task Description" : "Message Content"}
                  </label>
                  <textarea
                    value={step.message}
                    onChange={(e) => onUpdate(step.id, { message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
                    placeholder={
                      step.type === "task"
                        ? "Describe the task for the volunteer..."
                        : "Write your message here..."
                    }
                  />
                  <div className="mt-2">
                    <AIContentAssistant
                      context={`Workflow step: ${step.type}`}
                      defaultTemplate={
                        step.type === "email"
                          ? {
                              label: "Follow-up Email",
                              prompt: "Write a warm follow-up email for a church guest",
                              channel: "email",
                            }
                          : {
                              label: "Welcome SMS",
                              prompt: "Write a brief welcome SMS for a church guest",
                              channel: "sms",
                            }
                      }
                      onInsert={(text) => onUpdate(step.id, { message: text })}
                    />
                  </div>
                </div>
                {step.type === "task" && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Assign To</label>
                    <input
                      value={step.assignTo}
                      onChange={(e) => onUpdate(step.id, { assignTo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                      placeholder="e.g. Guest Coordinator, Volunteer Team..."
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowEditor({
  workflow,
  onSave,
  onClose,
}: {
  workflow: Workflow | null;
  onSave: (wf: Workflow) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(workflow?.name ?? "");
  const [trigger, setTrigger] = useState(workflow?.trigger ?? "new_visitor");
  const [steps, setSteps] = useState<Step[]>(workflow?.steps ?? []);

  const addStep = (type: string) => {
    const newStep: Step = {
      id: `s${Date.now()}`,
      type,
      delay: 0,
      delayUnit: "days",
      message: "",
      assignTo: "",
    };
    setSteps((prev) => [...prev, newStep]);
  };

  const updateStep = (id: string, changes: Partial<Step>) =>
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
  const deleteStep = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 pb-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0A0A0A]">
            {workflow ? "Edit Workflow" : "New Workflow"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">
              Workflow Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New Visitor Welcome Sequence"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">
              Trigger
            </label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] text-[#374151]"
            >
              {TRIGGERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 block">
              Workflow Steps
            </label>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i}
                  onUpdate={updateStep}
                  onDelete={deleteStep}
                />
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-400 mb-2 font-medium">Add a step:</p>
              <div className="flex flex-wrap gap-2">
                {ACTION_TYPES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => addStep(a.value)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105 ${a.color}`}
                  >
                    + {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                id: workflow?.id ?? `wf${Date.now()}`,
                name,
                trigger,
                steps,
                active: workflow?.active ?? true,
                applied: workflow?.applied ?? 0,
              })
            }
            className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all flex items-center gap-2"
          >
            <Check size={15} /> Save Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [composerGuest, setComposerGuest] = useState({
    first_name: "",
    spiritual_background: "returning",
    family_status: "married_with_kids",
    journey_stage: "stage_1_welcome",
  });
  const [composerChannel, setComposerChannel] = useState("email");
  const [composerContext, setComposerContext] = useState("");
  const [composerResult, setComposerResult] = useState("");
  const [composerLoading, setComposerLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleWorkflow = (id: string) =>
    setWorkflows((wf) =>
      wf.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );

  const openNew = () => {
    setEditingWorkflow(null);
    setEditorOpen(true);
  };
  const openEdit = (wf: Workflow) => {
    setEditingWorkflow(wf);
    setEditorOpen(true);
  };

  const saveWorkflow = (wf: Workflow) => {
    setWorkflows((prev) => {
      const exists = prev.find((w) => w.id === wf.id);
      return exists ? prev.map((w) => (w.id === wf.id ? wf : w)) : [...prev, wf];
    });
    setEditorOpen(false);
  };

  const deleteWorkflow = (id: string) =>
    setWorkflows((prev) => prev.filter((w) => w.id !== id));

  const generateMessage = async () => {
    setComposerLoading(true);
    setComposerResult("");
    try {
      const res = await fetch("/api/ai/compose-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...composerGuest,
          channel: composerChannel,
          context: composerContext,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setComposerResult(data.result ?? "");
    } catch {
      setComposerResult("Failed to generate message.");
    }
    setComposerLoading(false);
  };

  const copyMessage = () => {
    navigator.clipboard?.writeText(composerResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerLabel = (val: string) => TRIGGERS.find((t) => t.value === val)?.label ?? val;

  return (
    <div className="max-w-4xl w-full">
      {editorOpen && (
        <WorkflowEditor
          workflow={editingWorkflow}
          onSave={saveWorkflow}
          onClose={() => setEditorOpen(false)}
        />
      )}

      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Workflows</h1>
          <p className="text-sm text-[#9CA3AF]">Automated care sequences that run on your behalf</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all flex-shrink-0"
        >
          <Plus size={16} /> <span className="hidden sm:inline">New Workflow</span>
        </button>
      </div>

      <div className="bg-[#FDFAF5] border border-[#E8D5A3]/40 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Zap size={20} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#6B7280] leading-relaxed">
            <strong className="text-[#0A0A0A]">How Workflows Work:</strong> Automated care
            sequences triggered by guest events. Once active, they run automatically — notifying
            volunteers, scheduling follow-ups, and advancing journey stages without any manual
            intervention.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {[
          { label: "Active Workflows", value: workflows.filter((w) => w.active).length },
          { label: "Total Guests Enrolled", value: workflows.reduce((a, w) => a + w.applied, 0) },
          { label: "Steps Configured", value: workflows.reduce((a, w) => a + w.steps.length, 0) },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center"
          >
            <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{s.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              wf.active ? "border-[#C9A84C]/20" : "border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-[#0A0A0A]">{wf.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      wf.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {wf.active ? "● Active" : "◌ Paused"}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF]">Trigger: {triggerLabel(wf.trigger)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {wf.steps.map((step) => {
                    const at = ACTION_TYPES.find((a) => a.value === step.type);
                    if (!at) return null;
                    return (
                      <span
                        key={step.id}
                        className={`text-xs px-2 py-1 rounded-lg font-medium ${at.color}`}
                      >
                        {at.label.split(" ").slice(0, 2).join(" ")}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-[#9CA3AF]">{wf.applied} guests</span>
                <button
                  onClick={() => openEdit(wf)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#0A0A0A] transition-all"
                >
                  <Settings size={15} />
                </button>
                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className={`p-2 rounded-lg transition-all ${
                    wf.active
                      ? "bg-orange-50 text-orange-500 hover:bg-orange-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {wf.active ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <button
                  onClick={() => deleteWorkflow(wf.id)}
                  className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-400 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 grid grid-cols-1 gap-2">
              {wf.steps.map((step, i) => {
                const at = ACTION_TYPES.find((a) => a.value === step.type);
                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          at?.color ?? "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < wf.steps.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 mt-1 h-4" />
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] pt-1 leading-relaxed">
                      {step.type === "wait"
                        ? `⏱ Wait ${step.delay} ${step.delayUnit}`
                        : step.message || at?.label}
                      {step.assignTo && (
                        <span className="ml-2 text-[#9CA3AF]">→ {step.assignTo}</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#0A0A0A] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Wand2 size={18} className="text-[#C9A84C]" />
          <h2 className="font-bold text-white">AI-Powered Message Composer</h2>
        </div>
        <p className="text-white/50 text-sm mb-5">
          Generate a personalized follow-up message for any guest in seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Guest first name</label>
            <input
              value={composerGuest.first_name}
              onChange={(e) =>
                setComposerGuest({ ...composerGuest, first_name: e.target.value })
              }
              placeholder="e.g. Sarah"
              className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Channel</label>
            <select
              value={composerChannel}
              onChange={(e) => setComposerChannel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="email">Email</option>
              <option value="sms">Text (SMS)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Spiritual background</label>
            <select
              value={composerGuest.spiritual_background}
              onChange={(e) =>
                setComposerGuest({ ...composerGuest, spiritual_background: e.target.value })
              }
              className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="new_to_faith">New to faith</option>
              <option value="returning">Returning</option>
              <option value="regular_churchgoer">Regular churchgoer</option>
              <option value="exploring">Exploring</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Journey stage</label>
            <select
              value={composerGuest.journey_stage}
              onChange={(e) =>
                setComposerGuest({ ...composerGuest, journey_stage: e.target.value })
              }
              className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="stage_1_welcome">Stage 1: Welcome</option>
              <option value="stage_2_connect">Stage 2: Connect</option>
              <option value="stage_3_grow">Stage 3: Grow</option>
              <option value="stage_4_serve">Stage 4: Serve</option>
              <option value="stage_5_belong">Stage 5: Belong</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-white/40 mb-1 block">
              Additional context (optional)
            </label>
            <input
              value={composerContext}
              onChange={(e) => setComposerContext(e.target.value)}
              placeholder="e.g. They mentioned interest in small groups..."
              className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>

        <button
          onClick={generateMessage}
          disabled={composerLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-bold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60 mb-4"
        >
          {composerLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Wand2 size={15} />
          )}
          {composerLoading ? "Writing..." : "Generate Message"}
        </button>

        {composerResult && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">
              {composerResult}
            </p>
            <button
              onClick={copyMessage}
              className={`mt-3 text-xs font-semibold transition-colors ${
                copied ? "text-green-400" : "text-[#C9A84C] hover:text-[#E8D5A3]"
              }`}
            >
              {copied ? "✓ Copied to clipboard" : "Copy message →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
