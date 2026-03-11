"use client";

import { Mail, MessageSquare, Clock, Settings, Trash2, Play, Pause } from "lucide-react";

type Sequence = {
  id?: string;
  name: string;
  channel: string;
  delay_days: number;
  message_template?: string | null;
  is_active: boolean;
};

export default function SequenceCard({
  seq,
  isLast,
  onEdit,
  onDelete,
  onToggle,
}: {
  seq: Sequence;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const lines = seq.message_template?.split("\n") || [];
  const subject = lines[0]?.startsWith("Subject:")
    ? lines[0].replace("Subject:", "").trim()
    : seq.name;
  const preview = lines.find((l, i) => i > 1 && l.trim()) || "";

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0 w-12">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${seq.is_active ? "bg-[#C9A84C]/10 border-[#C9A84C] text-[#A07830]" : "bg-gray-100 border-gray-200 text-gray-400"}`}
        >
          D{seq.delay_days}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-2 min-h-[20px]" />}
      </div>

      <div
        className={`flex-1 mb-4 rounded-2xl border p-4 transition-all ${seq.is_active ? "border-[#C9A84C]/20 bg-white shadow-sm" : "border-gray-100 bg-gray-50 opacity-60"}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${seq.channel === "email" ? "bg-[#C9A84C]/20 text-[#A07830]" : "bg-[#C9A84C]/20 text-[#A07830]"}`}
              >
                {seq.channel === "email" ? (
                  <Mail size={10} />
                ) : (
                  <MessageSquare size={10} />
                )}
                {(seq.channel || "email").toUpperCase()}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${seq.is_active ? "bg-[#C9A84C]/20 text-[#A07830]" : "bg-gray-100 text-gray-500"}`}
              >
                {seq.is_active ? "● Active" : "◌ Paused"}
              </span>
            </div>
            <p className="font-semibold text-sm text-[#0A0A0A] truncate">{seq.name}</p>
            {subject && subject !== seq.name && (
              <p className="text-xs text-[#6B7280] mt-0.5">Subject: {subject}</p>
            )}
            {preview && (
              <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2 leading-relaxed">{preview}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              title="Edit"
            >
              <Settings size={13} />
            </button>
            <button
              type="button"
              onClick={onToggle}
              className={`p-1.5 rounded-lg transition-colors ${seq.is_active ? "hover:bg-[#C9A84C]/20 text-[#A07830]" : "hover:bg-[#C9A84C]/10 text-[#A07830]"}`}
              title={seq.is_active ? "Pause" : "Activate"}
            >
              {seq.is_active ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-1">
          <Clock size={11} />
          <span>
            Sends <strong className="text-[#6B7280]">Day {seq.delay_days}</strong> after guest is
            added
          </span>
        </div>
      </div>
    </div>
  );
}
