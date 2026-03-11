"use client";

import { useState, useRef } from "react";
import { GuestAPI } from "@/lib/apiClient";
import { Upload, X, ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";

const GUEST_FIELDS = [
  { key: "first_name", label: "First Name", required: true },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "visit_date", label: "First Visit Date" },
  { key: "how_heard", label: "How They Heard" },
  { key: "notes", label: "Notes" },
  { key: "skip", label: "— Skip Column —" },
];

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [] as string[], rows: [] as Record<string, string>[] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? "";
    });
    return obj;
  });
  return { headers, rows };
}

function guessMapping(header: string): string {
  const h = header.toLowerCase();
  if (h.includes("first") || h === "fname") return "first_name";
  if (h.includes("last") || h === "lname") return "last_name";
  if (h.includes("email") || h.includes("mail")) return "email";
  if (h.includes("phone") || h.includes("mobile") || h.includes("cell")) return "phone";
  if (h.includes("visit") || h.includes("date")) return "visit_date";
  if (h.includes("heard") || h.includes("source") || h.includes("how")) return "how_heard";
  if (h.includes("note")) return "notes";
  return "skip";
}

type CsvImportModalProps = {
  churchId: string | null;
  onClose: () => void;
  onImported: (count: number) => void;
};

export default function CsvImportModal({ churchId, onClose, onImported }: CsvImportModalProps) {
  const [step, setStep] = useState<"upload" | "map" | "done">("upload");
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ successCount: number; failCount: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCsv(text);
      if (headers.length === 0) {
        setError("Could not parse CSV. Make sure the file has headers.");
        return;
      }
      setCsvData({ headers, rows });
      const autoMap: Record<string, string> = {};
      headers.forEach((h) => (autoMap[h] = guessMapping(h)));
      setMapping(autoMap);
      setStep("map");
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!csvData || !churchId) return;
    setImporting(true);
    const records = csvData.rows
      .map((row) => {
        const guest: Record<string, string> = { church_id: churchId, status: "new_visitor", journey_stage: "stage_1_welcome", visit_count: "1" };
        Object.entries(mapping).forEach(([csvCol, guestField]) => {
          if (guestField && guestField !== "skip" && row[csvCol]) guest[guestField] = row[csvCol];
        });
        return guest;
      })
      .filter((g) => g.first_name || g.email);

    let successCount = 0;
    let failCount = 0;
    for (const guest of records) {
      try {
        await GuestAPI.create(guest);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setResults({ successCount, failCount, total: records.length });
    setImporting(false);
    setStep("done");
    if (successCount > 0) onImported(successCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0A0A0A]">Import Guests from CSV</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#9CA3AF]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            {["Upload", "Map Columns", "Import"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    (step === "upload" && i === 0) || (step === "map" && i === 1) || (step === "done" && i === 2)
                      ? "bg-[#C9A84C] text-white"
                      : (step === "map" && i === 0) || (step === "done" && i <= 1)
                        ? "bg-[#C9A84C]/20 text-[#A07830]"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {((step === "map" && i === 0) || (step === "done" && i <= 1)) ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-xs text-[#9CA3AF]">{label}</span>
                {i < 2 && <div className="w-8 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm mb-4">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-[#C9A84C]/50 hover:bg-[#FDFAF5] transition-all"
            >
              <Upload size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-[#0A0A0A] mb-1">Drop your CSV here or click to browse</p>
              <p className="text-xs text-[#9CA3AF]">Must include headers. Columns like &quot;First Name&quot;, &quot;Email&quot;, &quot;Phone&quot;, &quot;Visit Date&quot; are auto-detected.</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          )}

          {step === "map" && csvData && (
            <div>
              <p className="text-sm text-[#6B7280] mb-4">Match your CSV columns to guest fields. We&apos;ve made a best guess — adjust as needed.</p>
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto pr-1">
                {csvData.headers.map((col) => (
                  <div key={col} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0 px-3 py-2 bg-gray-50 rounded-lg text-sm text-[#0A0A0A] font-medium truncate">{col}</div>
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                    <select
                      value={mapping[col] ?? "skip"}
                      onChange={(e) => setMapping((prev) => ({ ...prev, [col]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C]"
                    >
                      {GUEST_FIELDS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-[#FDFAF5] rounded-xl border border-[#E8D5A3]/40 text-xs text-[#6B7280] mb-4">
                <strong>{csvData.rows.length}</strong> rows found. Rows missing both First Name and Email will be skipped.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("upload")} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#6B7280] hover:bg-gray-50">
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Importing...
                    </>
                  ) : (
                    `Import ${csvData.rows.length} Guests`
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "done" && results && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-[#C9A84C]/20 flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-[#A07830]" />
              </div>
              <p className="font-bold text-[#0A0A0A] text-lg mb-1">Import Complete</p>
              <p className="text-sm text-[#9CA3AF] mb-4">
                <strong className="text-[#A07830]">{results.successCount}</strong> guests imported successfully.
                {results.failCount > 0 && <span className="text-red-500"> {results.failCount} failed.</span>}
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
