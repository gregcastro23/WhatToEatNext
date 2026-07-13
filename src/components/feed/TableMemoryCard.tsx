"use client";

/**
 * Table Memory feed artifact — how a closed table appears in the commons
 * (docs/plans/pr2-table-entity-plan.md §5, design-spec §3.1's
 * TableArtifactCard). Renders the frozen `table_memory` metadata payload:
 * title, venue, real-identity guest roster, composite badge, photos.
 * Unlike cooked-it cards, a table memory is inherently a named social
 * artifact (shareName is always true in the payload).
 */

import Link from "next/link";
import { FeedEngagementBar } from "@/components/feed/FeedEngagementBar";
import {
  AvatarRow,
  CompositeRadialBadge,
  ElementChip,
  GlassPanel,
  LabelXS,
  type AvatarPerson,
} from "@/components/tables/ui";
import type { Element } from "@/components/tables/ui/elements";
import type { TableMemoryPayload } from "@/types/table";
import type { JSX } from "react";

export interface TableMemoryCardProps {
  meta: TableMemoryPayload;
  createdAtLabel: string;
  actorName: string;
  /** Feed event id — enables reactions/comments (PR 5). Omit for non-DB rows. */
  eventId?: string;
  /** Per-kind reaction counts (lowercase keys) from the feed payload. */
  reactionCounts?: Record<string, number>;
  /** The viewer's current reaction kinds (lowercase), from the bootstrap call. */
  viewerKinds?: string[];
  commentCount?: number;
}

const ELEMENT_CYCLE: Element[] = ["Fire", "Water", "Earth", "Air"];

function isElement(value: unknown): value is Element {
  return (
    typeof value === "string" && (ELEMENT_CYCLE as string[]).includes(value)
  );
}

export function TableMemoryCard({
  meta,
  createdAtLabel,
  actorName,
  eventId,
  reactionCounts,
  viewerKinds,
  commentCount,
}: TableMemoryCardProps): JSX.Element {
  const guests: AvatarPerson[] = (meta.guests ?? []).map((guest, index) => ({
    name: guest.name,
    element: ELEMENT_CYCLE[index % ELEMENT_CYCLE.length],
  }));
  const dominant = isElement(meta.composite?.dominantElement)
    ? meta.composite?.dominantElement
    : undefined;
  const photo = meta.photoUrls?.[0];

  return (
    <GlassPanel
      rounded="32"
      className="overflow-hidden scroll-mt-24"
      id={eventId ? `event-${eventId}` : undefined}
    >
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <LabelXS className="text-alchm-violet-bright">Table Memory</LabelXS>
          <p className="mt-1 text-sm text-alchm-fg">
            <span className="font-bold">{actorName}</span> gathered{" "}
            {meta.guestCount === 1 ? "a table" : `${meta.guestCount} at the table`}
            {meta.venue?.name ? ` at ${meta.venue.name}` : ""}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-mono text-alchm-fg-mute">
          {createdAtLabel}
        </span>
      </div>

      {photo && (
        <div className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={meta.title}
            loading="lazy"
            className="max-h-72 w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-alchm-bg/90 via-alchm-bg/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
            {dominant && (
              <ElementChip element={dominant}>{`${dominant.toUpperCase()} DOMINANT`}</ElementChip>
            )}
            {meta.composite?.elementalBalance && (
              <CompositeRadialBadge values={meta.composite.elementalBalance} size={44} />
            )}
          </div>
        </div>
      )}

      <div className="p-5 pt-4">
        <Link
          href={`/tables/${meta.tableId}`}
          className="text-gradient-alchm text-2xl font-extrabold underline-offset-4 hover:underline"
        >
          {meta.title}
        </Link>

        {guests.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <LabelXS className="text-alchm-fg-dim">Who broke bread</LabelXS>
            <AvatarRow people={guests} max={4} />
          </div>
        )}

        {meta.menu?.length > 0 && (
          <p className="mt-3 truncate text-xs text-alchm-fg-mute">
            {meta.menu.map((item) => item.name).join(" · ")}
          </p>
        )}

        {!photo && dominant && (
          <div className="mt-4">
            <ElementChip element={dominant}>{`${dominant.toUpperCase()} DOMINANT`}</ElementChip>
          </div>
        )}

        {/* Engagement footer (PR 5) — reactions + comments, design-spec §3.1. */}
        {eventId && (
          <div className="mt-4 border-t border-white/8 pt-3">
            <FeedEngagementBar
              eventId={eventId}
              initialCounts={reactionCounts}
              viewerKinds={viewerKinds}
              commentCount={commentCount}
            />
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

export default TableMemoryCard;
