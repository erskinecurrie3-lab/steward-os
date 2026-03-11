"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

type Template = { label: string; prompt: string; channel?: string };

type Props = {
  context?: string;
  defaultTemplate?: Template;
  onInsert: (text: string) => void;
};

export default function AIContentAssistant({
  context = "",
  defaultTemplate = {
    label: "Generate Content",
    prompt: "Write compelling content for this field",
    channel: "general",
  },
  onInsert,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = context
        ? `${defaultTemplate.prompt}. Context: ${context}`
        : defaultTemplate.prompt;
      const res = await fetch("/api/resources/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      const text = data.content?.trim() || "";
      if (text) onInsert(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 text-xs text-[#A07830] hover:text-[#C9A84C] font-medium disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} />
        )}
        {loading ? "Generating..." : `AI: ${defaultTemplate.label}`}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
