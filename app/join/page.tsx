"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { setActive } = useClerk();
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const token = searchParams.get("token");

  const handleAccept = async () => {
    if (!token || !isSignedIn) return;
    setStatus("accepting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to accept invite");
        setStatus("error");
        return;
      }
      setStatus("success");
      if (json.orgId && setActive) {
        await setActive({ organization: json.orgId });
      }
      router.push("/dashboard");
    } catch {
      setErrorMsg("Something went wrong");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && token && status === "idle") {
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when auth/token ready
  }, [isLoaded, isSignedIn, token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Invalid invite link</h1>
          <p className="mt-2 text-muted-foreground">This invite link is missing a token.</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Go home
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="text-xl font-semibold">Sign in to accept your invite</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Create an account or sign in to join your church on StewardOS.
        </p>
        <div className="flex gap-4">
          <SignIn
            forceRedirectUrl={`/join?token=${token}`}
            signUpUrl={`/signup?redirect_url=${encodeURIComponent(`/join?token=${token}`)}`}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href={`/signup?redirect_url=${encodeURIComponent(`/join?token=${token}`)}`} className="underline">
            Sign up
          </a>
        </p>
      </div>
    );
  }

  if (status === "accepting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Accepting invite...</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-semibold text-destructive">Could not accept invite</h1>
        <p className="mt-2 text-muted-foreground">{errorMsg}</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
