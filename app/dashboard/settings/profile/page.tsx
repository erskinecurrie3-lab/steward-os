"use client";

import { useUser } from "@clerk/nextjs";

export default function ProfileSettingsPage() {
  const { user } = useUser();

  return (
    <div className="rounded-lg border p-6 max-w-xl">
      <h2 className="font-medium">Profile</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Name, password, avatar, and timezone — personal settings only. Managed through your Clerk account. Coming soon.
      </p>
      {user && (
        <p className="mt-4 text-sm">
          Signed in as <strong>{user.primaryEmailAddress?.emailAddress ?? user.firstName}</strong>
        </p>
      )}
    </div>
  );
}
