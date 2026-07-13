"use client";

import Link from "next/link";
import {
  AvatarCircle,
  CompositeRadialBadge,
  ElementChip,
  GlassPanel,
  LabelXS,
} from "@/components/tables/ui";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { toElement, type DiscoverPersonCard } from "./types";
import type { JSX } from "react";

/**
 * PersonRow — the People-tab list item (tables-design-spec.md §3.6): avatar,
 * name, one-line bio, element chip, mutual count, small compat ring, and a
 * view-profile arrow → /profile/[id]. Agents render with their real roster
 * identity (design-spec §4.8). No message affordance in v1 (plan §6).
 */
export function PersonRow({ person }: { person: DiscoverPersonCard }): JSX.Element {
  const element = toElement(person.dominantElement);
  return (
    <GlassPanel interactive rounded="2xl" className="flex items-center gap-4 p-4">
      <AvatarCircle name={person.name} src={person.avatarUrl ?? undefined} element={element} size={48} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-alchm-fg">{person.name}</span>
          {person.isAgent && <LabelXS className="text-alchm-fg-mute">· agent</LabelXS>}
          {person.isCommensal && <LabelXS className="text-alchm-fg-warm">· commensal</LabelXS>}
        </div>
        {person.bio ? (
          <p className="truncate text-xs text-alchm-fg-mute">{person.bio}</p>
        ) : (
          <LabelXS className="text-alchm-fg-mute">
            {person.mutualCommensals} mutual {person.mutualCommensals === 1 ? "commensal" : "commensals"}
          </LabelXS>
        )}
      </div>

      <ElementChip element={element} className="hidden sm:inline-flex">
        {element.toUpperCase()}
      </ElementChip>

      {person.compatibility != null && (
        <CompositeRadialBadge variant="compatibility" value={person.compatibility / 100} size={36} />
      )}

      <Link
        href={`/profile/${person.id}`}
        aria-label={`View ${person.name}'s profile`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-alchm-fg-dim no-underline hover:bg-white/10"
      >
        <Glyph name="arrow" size={14} stroke={1.6} />
      </Link>
    </GlassPanel>
  );
}

export default PersonRow;
