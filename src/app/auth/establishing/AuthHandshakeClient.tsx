"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { AuthHandshake } from "@/components/auth/AuthFollowups";

/**
 * Reads `?next=` and writes the `last_user` hint to localStorage as soon as
 * the session is available. Then renders the handshake checklist.
 */
export function AuthHandshakeClient() {
  const params = useSearchParams();
  const next = params?.get("next") ?? undefined;
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user || typeof window === "undefined") return;
    try {
      const hint = {
        name: session.user.name ?? "Practitioner",
        email: session.user.email ?? "",
        initial: session.user.name?.[0]?.toUpperCase() ?? "P",
      };
      window.localStorage.setItem("alchm:last_user", JSON.stringify(hint));
    } catch {
      /* localStorage may be unavailable in private mode — ignore */
    }
  }, [session]);

  return <AuthHandshake redirectTo={next} />;
}
