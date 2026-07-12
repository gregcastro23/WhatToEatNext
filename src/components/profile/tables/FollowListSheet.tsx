"use client";

/**
 * FollowListSheet — §3.5 paginated followers/following overlay with inline
 * follow buttons. Fed by GET /api/users/[userId]/followers|following
 * (keyset cursor pagination; entries never carry an email).
 */

import { X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type JSX } from "react";
import { AvatarCircle, GlassPanel, LabelXS, type Element } from "@/components/tables/ui";
import type { FollowListEntry } from "@/types/social";
import { FollowButton } from "./FollowButton";

type ListKind = "followers" | "following";

export interface FollowListSheetProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  /** Whether the current viewer is signed in (enables inline follow buttons). */
  viewerSignedIn: boolean;
  /** The viewer's own user id (no self-follow buttons). */
  viewerId: string | null;
  initialKind?: ListKind;
}

const ELEMENTS: readonly Element[] = ["Fire", "Water", "Earth", "Air"];

function asElement(value: string | null): Element | undefined {
  if (!value) return undefined;
  return ELEMENTS.find((el) => el.toLowerCase() === value.toLowerCase());
}

export function FollowListSheet({
  userId,
  open,
  onClose,
  viewerSignedIn,
  viewerId,
  initialKind = "followers",
}: FollowListSheetProps): JSX.Element | null {
  const [kind, setKind] = useState<ListKind>(initialKind);
  const [entries, setEntries] = useState<FollowListEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (cursor: string | null, replace: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "30" });
        if (cursor) params.set("cursor", cursor);
        const res = await fetch(`/api/users/${encodeURIComponent(userId)}/${kind}?${params}`);
        const json = (await res.json().catch(() => null)) as {
          success?: boolean;
          followers?: FollowListEntry[];
          following?: FollowListEntry[];
          nextCursor?: string | null;
        } | null;
        if (!json?.success) return;
        const page = (kind === "followers" ? json.followers : json.following) ?? [];
        setEntries((prev) => (replace ? page : [...prev, ...page]));
        setNextCursor(json.nextCursor ?? null);
      } catch {
        /* list stays as-is */
      } finally {
        setLoading(false);
      }
    },
    [userId, kind],
  );

  useEffect(() => {
    if (!open) return;
    setEntries([]);
    setNextCursor(null);
    void load(null, true);
  }, [open, load]);

  useEffect(() => {
    if (open) setKind(initialKind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={kind === "followers" ? "Followers" : "Following"}
      onClick={onClose}
    >
      <GlassPanel
        className="w-full max-w-md max-h-[80vh] overflow-y-auto p-6 bg-alchm-bg-elev"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div role="tablist" aria-label="Follow list scope" className="flex gap-4">
            {(["followers", "following"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={kind === tab}
                onClick={() => setKind(tab)}
                className={`pb-1 border-b-2 transition-colors ${
                  kind === tab
                    ? "border-alchm-copper text-alchm-copper-bright"
                    : "border-transparent text-alchm-fg-dim hover:text-white"
                }`}
              >
                <LabelXS>{tab.toUpperCase()}</LabelXS>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-alchm-fg-dim hover:text-white transition-colors"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {entries.length === 0 && !loading ? (
          <p className="text-sm text-alchm-fg-dim italic py-6 text-center">
            {kind === "followers" ? "No followers yet." : "Not following anyone yet."}
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.userId} className="flex items-center gap-3">
                <Link
                  href={`/profile/${entry.userId}`}
                  className="flex items-center gap-3 min-w-0 flex-1 group"
                  onClick={onClose}
                >
                  <AvatarCircle
                    name={entry.name}
                    src={entry.avatarUrl ?? undefined}
                    element={asElement(entry.dominantElement) ?? "Air"}
                    size={36}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white truncate group-hover:text-purple-200">
                      {entry.name}
                    </span>
                    <LabelXS className="text-alchm-fg-dim">
                      {entry.isAgent ? "AGENT" : entry.dominantElement?.toUpperCase() || "ALCHEMIST"}
                    </LabelXS>
                  </span>
                </Link>
                {viewerSignedIn && viewerId !== entry.userId && (
                  <FollowButton
                    targetUserId={entry.userId}
                    viewer={{ follows: entry.followedByViewer, followedBy: false }}
                    className="!px-4 !py-1.5 !text-xs"
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        {nextCursor && (
          <button
            type="button"
            disabled={loading}
            onClick={() => void load(nextCursor, false)}
            className="mt-5 w-full rounded-full border border-white/10 bg-white/[0.03] py-2 text-alchm-fg-dim hover:text-white hover:border-white/25 transition-colors disabled:opacity-50"
          >
            <LabelXS>{loading ? "Loading…" : "Load more"}</LabelXS>
          </button>
        )}
      </GlassPanel>
    </div>
  );
}

export default FollowListSheet;
