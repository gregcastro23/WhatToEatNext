"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AvatarCircle,
  ElementChip,
  ELEMENT_COLORS,
  GlassPanel,
  LabelXS,
} from "@/components/tables/ui";
import { toElement, type DiscoverPersonCard } from "./types";
import type { JSX } from "react";

/**
 * PersonCard for the "Kindred alchemists" rail (tables-design-spec.md §3.6):
 * compat % top-right, gradient-ring sigil/photo avatar, name, element chip,
 * mutual-commensal count, FOLLOW pill (hidden when follows unavailable), and
 * a "Break bread" CTA that opens Plan-a-Table with this person preselected.
 *
 * No message/DM affordance in v1 (PR 3 chat is not merged — plan §6).
 */
export function PersonCard({ person }: { person: DiscoverPersonCard }): JSX.Element {
  const element = toElement(person.dominantElement);
  const colors = ELEMENT_COLORS[element];
  const [following, setFollowing] = useState(person.followState === "following");
  const [busy, setBusy] = useState(false);

  const toggleFollow = async () => {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next); // optimistic
    try {
      const res = await fetch("/api/follows", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId: person.id }),
      });
      if (!res.ok) setFollowing(!next); // revert
    } catch {
      setFollowing(!next);
    } finally {
      setBusy(false);
    }
  };

  const breakBreadHref = `/tables?new=1&invite=${encodeURIComponent(person.id)}&inviteName=${encodeURIComponent(person.name)}`;

  return (
    <GlassPanel rounded="2xl" className="flex w-60 shrink-0 flex-col items-center gap-3 p-5 text-center">
      <div className="flex w-full items-start justify-between">
        {person.isCommensal ? (
          <LabelXS className="text-alchm-fg-warm">Commensal</LabelXS>
        ) : (
          <span />
        )}
        {person.compatibility != null && (
          <span className="font-mono text-sm font-bold" style={{ color: "var(--accent)" }}>
            {person.compatibility}%
          </span>
        )}
      </div>

      {/* Gradient-ring avatar (sigil fallback — never an invented face). */}
      <span
        className="rounded-full p-[2px]"
        style={{ background: `linear-gradient(135deg, ${colors.hex}, #b57ee0)` }}
      >
        <span className="block rounded-full bg-alchm-bg p-[2px]">
          <AvatarCircle name={person.name} src={person.avatarUrl ?? undefined} element={element} size={72} />
        </span>
      </span>

      <div>
        <p className="truncate text-base text-alchm-fg">{person.name}</p>
        {person.isAgent && <LabelXS className="text-alchm-fg-mute">Historical agent</LabelXS>}
      </div>

      <ElementChip element={element}>{element.toUpperCase()}</ElementChip>

      <LabelXS className="text-alchm-fg-mute">
        {person.mutualCommensals} mutual {person.mutualCommensals === 1 ? "commensal" : "commensals"}
      </LabelXS>

      <div className="mt-1 flex w-full flex-col gap-2">
        {person.followState != null && (
          <button
            type="button"
            onClick={() => void toggleFollow()}
            disabled={busy}
            aria-pressed={following}
            className={`w-full rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-40 ${
              following
                ? "border-alchm-violet/50 bg-alchm-violet/15 text-alchm-violet"
                : "border-alchm-violet/40 text-alchm-violet hover:bg-alchm-violet/10"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        )}
        <Link
          href={breakBreadHref}
          className="w-full rounded-full border border-white/10 px-4 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-alchm-fg-dim no-underline hover:bg-white/5"
        >
          Break bread
        </Link>
      </div>
    </GlassPanel>
  );
}

export default PersonCard;
