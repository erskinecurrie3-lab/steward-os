"use client";

import { useState } from "react";
import { Wand2, ChevronUp, ChevronDown, Loader2, Copy } from "lucide-react";

const TEMPLATES = [
  { id: "follow_up_email", label: "Follow-up Email", prompt: "Write a warm pastoral follow-up email for a church guest. Tone: genuine, caring, not salesy." },
  { id: "welcome_sms", label: "Welcome SMS", prompt: "Write a brief welcome SMS for a church guest. Under 160 characters, warm and casual." },
  { id: "event_description", label: "Event Description", prompt: "Write a compelling event description for a church gathering." },
  { id: "blog_post", label: "Blog Post Draft", prompt: "Write a brief church blog post draft. Warm, engaging, and shareable." },
  { id: "volunteer_task", label: "Volunteer Task", prompt: "Write a clear volunteer task description for a church care follow-up." },
];

export default function CareNotesAIAssistant() {
  const [expanded, setExpanded] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult("");
    try {
      const fullPrompt = context.trim()
        ? `${selectedTemplate.prompt} Context: ${context.trim()}`
        : selectedTemplate.prompt;
      const res = await fetch("/api/resources/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setResult(data.content?.trim() || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wand2 size={18} className="text-[#C9A84C]" />
          <span className="font-semibold text-sm text-[#0A0A0A]">AI Content Assistant</span>
        </div>
        {expanded ? <ChevronUp size={18} className="text-[#9CA3AF]" /> : <ChevronDown size={18} className="text-[#9CA3AF]" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Content type</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTemplate.id === t.id
                      ? "bg-[#0A0A0A] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">
              Add specific details or context...
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Guest visited twice, interested in small groups..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm hover:bg-[#E8D5A3] transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Wand2 size={16} />
            )}
            {loading ? "Generating..." : "Generate Content"}
          </button>

          {error && <p className="text-xs text-red-600">{error}</p>}

          {result && (
            <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{result}</p>
              <button
                type="button"
                onClick={handleCopy}
                className={`mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  copied ? "text-green-600" : "text-[#C9A84C] hover:text-[#A07830]"
                }`}
              >
                <Copy size={12} />
                {copied ? "Copied to clipboard" : "Copy content"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
