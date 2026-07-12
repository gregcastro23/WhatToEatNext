"use client";

/**
 * Host-only invite surface: bearer-token link (copy + QR, one token two
 * renderings) plus quick-add from the host's existing companions (linked
 * commensals -> `joined_via: invite`/`search`; manual companions -> attached
 * joined immediately). All four invite modes from the plan (link, QR,
 * search/companions, manual) funnel through this one panel.
 */

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { GlassPanel, GradientButton, LabelXS } from "@/components/tables/ui";
import type { TableInvite } from "@/types/table";
import type { JSX } from "react";

export interface InvitePanelProps {
  tableId: string;
  invites: TableInvite[];
  onChanged?: () => void;
  className?: string;
}

interface Companion {
  type: "manual" | "linked";
  id: string;
  name: string;
}

async function fetchCompanions(): Promise<Companion[]> {
  try {
    const res = await fetch("/api/commensals", { credentials: "include" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      manualCompanions?: Array<{ id: string; name: string }>;
      linkedCommensals?: Array<{ userId: string; name: string }>;
    };
    const manual = (data.manualCompanions ?? []).map((c) => ({
      type: "manual" as const,
      id: c.id,
      name: c.name,
    }));
    const linked = (data.linkedCommensals ?? []).map((c) => ({
      type: "linked" as const,
      id: c.userId,
      name: c.name,
    }));
    return [...linked, ...manual];
  } catch {
    return [];
  }
}

export function InvitePanel({
  tableId,
  invites,
  onChanged,
  className = "",
}: InvitePanelProps): JSX.Element {
  const [issuing, setIssuing] = useState(false);
  const [showQr, setShowQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchCompanions().then(setCompanions);
  }, []);

  const activeInvites = invites.filter(
    (i) => !i.revokedAt && new Date(i.expiresAt).getTime() > Date.now() && i.useCount < i.maxUses,
  );

  const issueInvite = useCallback(async () => {
    setIssuing(true);
    setError(null);
    try {
      const res = await fetch(`/api/tables/${tableId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setError(data.message || "Could not create an invite link.");
        return;
      }
      onChanged?.();
    } catch {
      setError("Could not create an invite link.");
    } finally {
      setIssuing(false);
    }
  }, [tableId, onChanged]);

  const revokeInvite = useCallback(
    async (inviteId: string) => {
      try {
        await fetch(`/api/tables/${tableId}/invites/${inviteId}`, {
          method: "DELETE",
          credentials: "include",
        });
        onChanged?.();
      } catch {
        setError("Could not revoke this invite.");
      }
    },
    [tableId, onChanged],
  );

  const copyLink = async (url: string, inviteId: string) => {
    const absolute = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(inviteId);
      window.setTimeout(() => setCopied((c) => (c === inviteId ? null : c)), 2000);
    } catch {
      /* clipboard unavailable — the link is still visible to copy manually */
    }
  };

  const addCompanion = async (companion: Companion) => {
    setAddingId(companion.id);
    setError(null);
    try {
      const body =
        companion.type === "manual"
          ? { manualCompanionChartId: companion.id }
          : { userId: companion.id };
      const res = await fetch(`/api/tables/${tableId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setError(data.message || "Could not add this companion.");
        return;
      }
      onChanged?.();
    } catch {
      setError("Could not add this companion.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <GlassPanel className={`p-5 ${className}`}>
      <LabelXS className="text-alchm-fg-dim">Invite Guests</LabelXS>

      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

      <div className="mt-3 space-y-3">
        {activeInvites.map((invite) => {
          const absoluteUrl =
            typeof window !== "undefined" ? `${window.location.origin}${invite.url}` : invite.url;
          return (
            <div key={invite.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <code className="truncate text-xs text-alchm-fg-dim">{invite.url}</code>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copyLink(invite.url, invite.id)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-mono uppercase text-alchm-fg-dim hover:text-alchm-fg"
                  >
                    {copied === invite.id ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQr((id) => (id === invite.id ? null : invite.id))}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-mono uppercase text-alchm-fg-dim hover:text-alchm-fg"
                  >
                    QR
                  </button>
                  <button
                    type="button"
                    onClick={() => void revokeInvite(invite.id)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-mono uppercase text-alchm-fg-mute hover:text-rose-400"
                  >
                    Revoke
                  </button>
                </div>
              </div>
              {showQr === invite.id && (
                <div className="mt-3 flex justify-center rounded-lg bg-white p-3">
                  <QRCodeSVG value={`${absoluteUrl}?src=qr`} size={160} />
                </div>
              )}
              <p className="mt-2 text-[10px] text-alchm-fg-mute">
                {invite.useCount}/{invite.maxUses} used · expires{" "}
                {new Date(invite.expiresAt).toLocaleDateString()}
              </p>
            </div>
          );
        })}

        <GradientButton onClick={() => void issueInvite()} disabled={issuing} className="w-full">
          {issuing ? "Creating…" : "Create Invite Link"}
        </GradientButton>
      </div>

      {companions.length > 0 && (
        <div className="mt-6">
          <LabelXS className="text-alchm-fg-dim">Your Companions</LabelXS>
          <ul className="mt-2 space-y-1.5">
            {companions.map((c) => (
              <li key={`${c.type}-${c.id}`} className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-alchm-fg">{c.name}</span>
                <button
                  type="button"
                  onClick={() => void addCompanion(c)}
                  disabled={addingId === c.id}
                  className="shrink-0 text-[10px] font-mono uppercase tracking-wide text-alchm-copper-bright hover:text-alchm-copper disabled:opacity-40"
                >
                  {addingId === c.id ? "Adding…" : "Add"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassPanel>
  );
}

export default InvitePanel;
