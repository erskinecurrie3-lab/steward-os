"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, QrCode } from "lucide-react";

export default function QRCodeSection({ churchName }: { churchName?: string }) {
  const [copied, setCopied] = useState(false);

  const portalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/guest-portal`
      : "https://example.com/guest-portal";

  const copyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (typeof document === "undefined") return;
    const svg = document.getElementById("guest-portal-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement("a");
      a.download = `${churchName || "guest"}-portal-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <QrCode size={18} className="text-[#C9A84C]" />
        <h2 className="font-bold text-[#0A0A0A]">Guest Portal QR Code</h2>
      </div>
      <p className="text-xs text-[#9CA3AF] mb-5">
        Print or display this QR code so first-time visitors can register from their phone.
      </p>

      <div className="flex flex-col gap-5">
        <div className="flex justify-center sm:justify-start">
          <div className="bg-white border-2 border-[#E8D5A3] rounded-2xl p-4 flex-shrink-0 inline-block">
            <QRCodeSVG
              id="guest-portal-qr"
              value={portalUrl}
              size={140}
              bgColor="#ffffff"
              fgColor="#0A0A0A"
              level="M"
              includeMargin={false}
            />
            {churchName && (
              <p className="text-center text-xs font-semibold text-[#A07830] mt-2">{churchName}</p>
            )}
          </div>
        </div>

        <div className="w-full">
          <p className="text-xs font-medium text-[#6B7280] mb-1">Portal URL</p>
          <p className="text-xs text-[#0A0A0A] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 font-mono break-all">
            {portalUrl}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#6B7280] hover:border-[#C9A84C] hover:text-[#A07830] transition-all"
            >
              <Copy size={14} />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#1A1A1A] transition-all"
            >
              <Download size={14} />
              Download QR
            </button>
          </div>

          <p className="text-xs text-[#9CA3AF] mt-4 leading-relaxed">
            💡 Print and place at your welcome desk, bulletin, or display screens so guests can
            scan and self-register.
          </p>
        </div>
      </div>
    </div>
  );
}
