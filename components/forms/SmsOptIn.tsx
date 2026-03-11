"use client";

import Link from "next/link";

/** Opt-in disclosure text for forms that collect phone numbers. Place under every phone field. */
export function SmsOptInDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[10px] sm:text-xs text-[#9CA3AF] leading-relaxed ${className}`}>
      By providing your phone number, you agree to receive text messages from your church through StewardOS. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for help.{" "}
      <Link href="/privacy" className="text-[#C9A84C] hover:text-[#A07830] underline">Privacy Policy</Link>
      {" · "}
      <Link href="/sms-terms" className="text-[#C9A84C] hover:text-[#A07830] underline">SMS Terms</Link>
    </p>
  );
}

type SmsOptInCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

/** Checkbox for explicit SMS opt-in. Best practice for compliance. */
export function SmsOptInCheckbox({ checked, onChange, className = "" }: SmsOptInCheckboxProps) {
  return (
    <label className={`flex items-start gap-2.5 cursor-pointer group ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
      />
      <span className="text-xs text-[#6B7280] leading-relaxed group-hover:text-[#374151]">
        I agree to receive SMS messages from my church through StewardOS. Message frequency varies. Reply STOP to unsubscribe.
      </span>
    </label>
  );
}
