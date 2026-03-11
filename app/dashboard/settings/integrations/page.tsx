"use client";

import { useOrganization, useUser } from "@clerk/nextjs";

export default function IntegrationsSettingsPage() {
  const { membership } = useOrganization();
  const { user } = useUser();

  const orgRole = (membership?.role as string)?.toLowerCase() ?? "";
  const metadataRole = ((user?.publicMetadata?.role as string) ?? "").toLowerCase();
  const isAdmin = orgRole === "org:admin" || metadataRole === "admin" || metadataRole === "pastor";

  if (!isAdmin) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground">Only admins can manage integrations.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 max-w-xl">
      <h2 className="font-medium">Integrations</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Connect Planning Center, Pushpay, Subsplash, Twilio, and Mailchimp. Coming soon.
      </p>
    </div>
  );
}
