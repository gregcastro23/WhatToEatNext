"use client";

/**
 * /t/[token] — public invite landing (works logged out; outside the (alchm)
 * group so it stays a lean, uncluttered card). Flow: preview card -> Join ->
 * if unauthenticated, signIn with callbackUrl back here with ?join=1 ->
 * auto-redeem on return -> push /tables/[id]. A QR scan lands with ?src=qr
 * and records joined_via='qr'.
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  GlassPanel,
  GradientButton,
  GradientText,
  LabelXS,
} from "@/components/tables/ui";
import type { TableInvitePreview } from "@/types/table";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function InviteLanding() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [preview, setPreview] = useState<TableInvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const autoRedeemed = useRef(false);

  const via: "link" | "qr" = searchParams?.get("src") === "qr" ? "qr" : "link";
  const shouldAutoJoin = searchParams?.get("join") === "1";

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/table-invites/${encodeURIComponent(token)}`);
        if (cancelled) return;
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as { preview?: TableInvitePreview };
        setPreview(data.preview ?? null);
        if (!data.preview) setNotFound(true);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const redeem = useCallback(async () => {
    if (!token || redeeming) return;
    setRedeeming(true);
    setRedeemError(null);
    try {
      const res = await fetch(`/api/table-invites/${encodeURIComponent(token)}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ via }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        tableId?: string;
        message?: string;
      };
      if (!res.ok || !data.success || !data.tableId) {
        setRedeemError(data.message || "This invite can no longer be used.");
        return;
      }
      router.push(`/tables/${data.tableId}`);
    } catch {
      setRedeemError("Something went wrong — try again.");
    } finally {
      setRedeeming(false);
    }
  }, [token, via, redeeming, router]);

  // Post-sign-in return leg: ?join=1 + an authenticated session = redeem once.
  useEffect(() => {
    if (
      shouldAutoJoin &&
      authStatus === "authenticated" &&
      preview?.valid &&
      !autoRedeemed.current
    ) {
      autoRedeemed.current = true;
      void redeem();
    }
  }, [shouldAutoJoin, authStatus, preview, redeem]);

  const handleJoin = () => {
    if (authStatus === "authenticated") {
      void redeem();
      return;
    }
    const callbackUrl = `/t/${token}?join=1${via === "qr" ? "&src=qr" : ""}`;
    void signIn(undefined, { callbackUrl });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-alchm-bg p-4 text-white">
      <div className="w-full max-w-md">
        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
        ) : notFound || !preview ? (
          <GlassPanel className="p-8 text-center">
            <LabelXS className="text-alchm-fg-mute">Table Invitation</LabelXS>
            <p className="mt-3 text-alchm-fg-dim">
              This invitation could not be found. Ask your host for a fresh link.
            </p>
          </GlassPanel>
        ) : (
          <GlassPanel className="p-8 text-center">
            <LabelXS className="text-alchm-copper-bright">You&apos;re Invited</LabelXS>
            <GradientText as="h1" className="mt-3 block text-3xl font-extrabold">
              {preview.tableTitle}
            </GradientText>
            <p className="mt-3 text-alchm-fg-dim">
              {preview.hostName} is setting the table
              {preview.venueName ? ` at ${preview.venueName}` : ""}.
            </p>
            <p className="mt-1 text-sm text-alchm-fg-dim">{formatWhen(preview.scheduledAt)}</p>
            {preview.joinedCount > 0 && (
              <p className="mt-4 text-xs text-alchm-fg-mute">
                {preview.joinedCount} {preview.joinedCount === 1 ? "guest has" : "guests have"}{" "}
                already joined
              </p>
            )}

            {redeemError && <p className="mt-4 text-sm text-rose-400">{redeemError}</p>}

            {preview.valid ? (
              <GradientButton
                onClick={handleJoin}
                disabled={redeeming || authStatus === "loading"}
                className="mt-6 w-full"
              >
                {redeeming
                  ? "Taking your seat…"
                  : authStatus === "authenticated"
                    ? "Join the Table"
                    : "Sign in & Join"}
              </GradientButton>
            ) : (
              <p className="mt-6 text-sm text-alchm-fg-mute">
                This invitation has expired or reached its guest limit.
              </p>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
}

export default function InviteLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-alchm-bg p-4">
          <div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      }
    >
      <InviteLanding />
    </Suspense>
  );
}
