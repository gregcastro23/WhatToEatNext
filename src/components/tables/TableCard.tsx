"use client";

/**
 * Summary card for a table in a list (`/tables`). Composed from the shared
 * Tables UI kit (src/components/tables/ui) — no bespoke primitives here.
 */

import Link from "next/link";
import {
  AvatarRow,
  ElementChip,
  GlassPanel,
  LabelXS,
  type AvatarPerson,
} from "@/components/tables/ui";
import type { TableRecord } from "@/types/table";
import type { JSX } from "react";

export interface TableCardProps {
  table: TableRecord;
  /** Real-identity avatars for the joined roster (never invented). */
  members?: AvatarPerson[];
  className?: string;
}

const STATUS_LABEL: Record<TableRecord["status"], string> = {
  planned: "Upcoming",
  live: "Live Now",
  memory: "Memory",
  cancelled: "Cancelled",
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TableCard({ table, members = [], className = "" }: TableCardProps): JSX.Element {
  const dominant = table.compositeSnapshot?.compositeChart.dominantElement;
  const venueLabel =
    table.venue.type === "restaurant"
      ? table.venue.name || "A restaurant"
      : table.venue.type === "home"
        ? table.venue.name || "Home"
        : table.venue.name || "Elsewhere";

  return (
    <Link href={`/tables/${table.id}`} className={`block ${className}`}>
      <GlassPanel interactive className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <LabelXS
              className={
                table.status === "live"
                  ? "text-alchm-violet-bright"
                  : table.status === "cancelled"
                    ? "text-alchm-fg-mute"
                    : "text-alchm-copper-bright"
              }
            >
              {STATUS_LABEL[table.status]}
            </LabelXS>
            <h3 className="mt-1 truncate text-lg font-semibold text-alchm-fg">{table.title}</h3>
            <p className="mt-0.5 truncate text-sm text-alchm-fg-dim">
              {formatWhen(table.scheduledAt)} · {venueLabel}
            </p>
          </div>
          {dominant && <ElementChip element={dominant} className="shrink-0" />}
        </div>

        {members.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <LabelXS className="text-alchm-fg-dim">Guests</LabelXS>
            <AvatarRow people={members} />
          </div>
        )}
      </GlassPanel>
    </Link>
  );
}

export default TableCard;
