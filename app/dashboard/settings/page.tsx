"use client";

import { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { CheckCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationPreferences from "@/components/settings/NotificationPreferences";
import VolunteerAvailability from "@/components/settings/VolunteerAvailability";
import QRCodeSection from "@/components/settings/QRCodeSection";
import FollowUpSequences from "@/components/settings/FollowUpSequences";
import ChurchCustomization, { type ChurchProfileForm } from "@/components/settings/ChurchCustomization";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
];

const DENOMINATIONS = [
  "Non-Denominational",
  "Baptist",
  "Methodist",
  "Pentecostal",
  "Presbyterian",
  "Lutheran",
  "Anglican / Episcopal",
  "Catholic",
  "Assemblies of God",
  "Church of Christ",
  "Seventh-day Adventist",
  "Other",
];

type ChurchProfile = {
  id?: string;
  name?: string;
  denomination?: string | null;
  timezone?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  websiteUrl?: string | null;
  address?: string | null;
  plan?: string;
  churchSettings?: ChurchProfileForm | null;
};

export default function SettingsPage() {
  const { membership } = useOrganization();
  const { user } = useUser();
  const [profile, setProfile] = useState<ChurchProfile | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<ChurchProfile> & ChurchProfileForm>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdmin = orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";

  useEffect(() => {
    fetch("/api/church")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
        const cs = (data.churchSettings as ChurchProfileForm) ?? {};
        setProfileForm({
          name: data.name ?? "",
          denomination: data.denomination ?? "",
          timezone: data.timezone ?? "America/New_York",
          logoUrl: data.logoUrl ?? "",
          primaryColor: data.primaryColor ?? "#C9A84C",
          websiteUrl: data.websiteUrl ?? "",
          address: data.address ?? "",
          event_types: cs.event_types ?? [],
          ministries: cs.ministries ?? [],
          communication_channels: cs.communication_channels ?? [],
        });
      })
      .catch(() => setError("Failed to load church profile"))
      .finally(() => setLoading(false));
  }, []);

  const saveCustomization = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/church", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSettings: {
            event_types: profileForm.event_types ?? [],
            ministries: profileForm.ministries ?? [],
            communication_channels: profileForm.communication_channels ?? [],
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/church", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name?.trim() || undefined,
          denomination: profileForm.denomination?.trim() || null,
          timezone: profileForm.timezone,
          logoUrl: profileForm.logoUrl?.trim() || null,
          primaryColor: profileForm.primaryColor,
          websiteUrl: profileForm.websiteUrl?.trim() || null,
          address: profileForm.address?.trim() || null,
          churchSettings: {
            event_types: profileForm.event_types ?? [],
            ministries: profileForm.ministries ?? [],
            communication_channels: profileForm.communication_channels ?? [],
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setProfile(json);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const hasActiveSubscription = profile?.plan && profile.plan !== "starter";
  const planLabel = profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "Starter";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full space-y-6">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">Settings</h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF]">Manage your church profile and account</p>
      </div>

      {/* Subscription status */}
      <div className={`rounded-2xl p-4 sm:p-5 ${!hasActiveSubscription ? "bg-[#FDFAF5] border border-[#E8D5A3]/40" : "bg-[#0A0A0A] text-white"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${hasActiveSubscription ? "text-[#C9A84C]" : "text-[#A07830]"}`}>
              {hasActiveSubscription ? `${planLabel} Plan` : "Free Trial / Starter"}
            </p>
            <p className={`font-bold text-base sm:text-lg ${hasActiveSubscription ? "text-white" : "text-[#0A0A0A]"}`}>
              {hasActiveSubscription ? "Active subscription" : "Starter plan — upgrade for more"}
            </p>
          </div>
          <a href="/dashboard/settings/billing">
            <button className={`flex-shrink-0 px-3 py-2 sm:px-4 rounded-xl font-semibold text-sm transition-all ${hasActiveSubscription ? "bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8D5A3]" : "bg-[#0A0A0A] text-white hover:bg-[#1A1A1A]"}`}>
              {hasActiveSubscription ? "Manage" : "Upgrade"}
            </button>
          </a>
        </div>
      </div>

      {/* Church Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-bold text-[#0A0A0A] mb-4">Church Profile</h2>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-[#9CA3AF] mb-1 block">Church Name</label>
            <Input
              value={profileForm.name ?? ""}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              className="border-gray-200 focus:border-[#C9A84C]"
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block">Denomination</label>
            <Select
              value={profileForm.denomination ?? ""}
              onValueChange={(v) => setProfileForm((f) => ({ ...f, denomination: v }))}
              disabled={!isAdmin}
            >
              <SelectTrigger className="border-gray-200 focus:border-[#C9A84C] text-[#6B7280]">
                <SelectValue placeholder="Select denomination" />
              </SelectTrigger>
              <SelectContent>
                {DENOMINATIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block">Timezone</label>
            <Select
              value={profileForm.timezone ?? "America/New_York"}
              onValueChange={(v) => setProfileForm((f) => ({ ...f, timezone: v ?? "America/New_York" }))}
              disabled={!isAdmin}
            >
              <SelectTrigger className="border-gray-200 focus:border-[#C9A84C] text-[#6B7280]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-[#9CA3AF] mb-1 block">Address</label>
            <Input
              value={profileForm.address ?? ""}
              onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="123 Main St, City, State"
              className="border-gray-200 focus:border-[#C9A84C]"
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block">Website</label>
            <Input
              value={profileForm.websiteUrl ?? ""}
              onChange={(e) => setProfileForm((f) => ({ ...f, websiteUrl: e.target.value }))}
              placeholder="https://"
              className="border-gray-200 focus:border-[#C9A84C]"
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block">Logo URL</label>
            <Input
              value={profileForm.logoUrl ?? ""}
              onChange={(e) => setProfileForm((f) => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://..."
              className="border-gray-200 focus:border-[#C9A84C]"
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block">Primary Color</label>
            <div className="flex gap-2 mt-0.5">
              <input
                type="color"
                value={profileForm.primaryColor ?? "#C9A84C"}
                onChange={(e) => setProfileForm((f) => ({ ...f, primaryColor: e.target.value }))}
                className="h-9 w-14 cursor-pointer rounded border"
                disabled={!isAdmin}
              />
              <Input
                value={profileForm.primaryColor ?? "#C9A84C"}
                onChange={(e) => setProfileForm((f) => ({ ...f, primaryColor: e.target.value }))}
                className="flex-1 border-gray-200 focus:border-[#C9A84C]"
                disabled={!isAdmin}
              />
            </div>
          </div>
          {isAdmin && (
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="bg-[#0A0A0A] hover:bg-[#1A1A1A]">
                {saving ? "Saving..." : saved ? <><CheckCircle size={15} className="mr-2" /> Saved!</> : "Save Profile"}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Church Customization */}
      {isAdmin && (
        <div className="mb-5">
          <ChurchCustomization profileForm={profileForm} setProfileForm={setProfileForm} onSave={saveCustomization} saving={saving} />
        </div>
      )}

      {/* QR Code */}
      <div className="mb-6">
        <QRCodeSection churchName={profileForm.name} />
      </div>

      {/* Notification Preferences */}
      <div className="mb-6">
        <NotificationPreferences />
      </div>

      {/* Volunteer Availability */}
      <div className="mt-6">
        <VolunteerAvailability />
      </div>

      {/* Follow-up Sequences */}
      <div className="mt-6">
        <FollowUpSequences />
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
        <h2 className="font-bold text-[#0A0A0A] mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-[#6B7280]">Email</span>
            <span className="text-sm font-medium text-[#0A0A0A]">{user?.primaryEmailAddress?.emailAddress ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-[#6B7280]">Name</span>
            <span className="text-sm font-medium text-[#0A0A0A]">{user?.fullName ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#6B7280]">Role</span>
            <span className="text-xs px-2 py-1 rounded-full bg-[#C9A84C]/10 text-[#A07830] font-semibold capitalize">
              {metadataRole || orgRole?.replace("org:", "") || "member"}
            </span>
          </div>
        </div>
        <SignOutButton>
          <button className="mt-4 px-4 py-2 rounded-lg text-sm text-[#9CA3AF] hover:text-[#0A0A0A] hover:bg-gray-100 transition-all">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
