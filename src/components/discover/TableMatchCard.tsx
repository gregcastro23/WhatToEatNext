"use client";

import Link from "next/link";
import {
  AvatarCircle,
  CompositeRadialBadge,
  ELEMENT_COLORS,
  GlassPanel,
  LabelXS,
} from "@/components/tables/ui";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { toElement, type DiscoverTableCard } from "./types";
import type { JSX } from "react";

/** "Sat, Aug 1 · 6:00 PM" */
function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * TableMatchCard (tables-design-spec.md §3.6): compatibility ring, seats-left
 * pill, photo / element-gradient header, host footer → /tables/[id] (whose
 * Ask-to-join CTA the PR 6 detail-access amendment enables for public tables).
 */
export function TableMatchCard({ table }: { table: DiscoverTableCard }): JSX.Element {
  const element = toElement(table.dominantElement);
  const colors = ELEMENT_COLORS[element];
  const lowSeats = table.seatsLeft != null && table.seatsLeft <= 2;

  return (
    <GlassPanel interactive rounded="2xl" className="flex flex-col overflow-hidden">
      {/* Header: photo or element-gradient placeholder */}
      <div className="relative h-32 w-full overflow-hidden">
        {table.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={table.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(120% 120% at 20% 0%, ${colors.hex}33, transparent 60%), linear-gradient(160deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))`,
            }}
            aria-hidden
          />
        )}

        {/* Compatibility ring — only when scored (viewer signed in + charts). */}
        {table.compatibility != null && (
          <div className="absolute left-3 top-3">
            <CompositeRadialBadge variant="compatibility" value={table.compatibility / 100} size={44} />
          </div>
        )}

        {/* Seats-left pill (hidden when seatCap unset). */}
        {table.seatsLeft != null && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-md border border-white/10">
            {lowSeats && (
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_5px_#fb923c]" aria-hidden />
            )}
            <LabelXS className="text-alchm-fg-dim">
              {table.seatsLeft} {table.seatsLeft === 1 ? "seat" : "seats"} left
            </LabelXS>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          {table.distanceKm != null && (
            <span className="inline-flex items-center gap-1 text-alchm-fg-mute">
              <Glyph name="crosshair" size={11} stroke={1.4} />
              <LabelXS>{table.distanceKm} km</LabelXS>
            </span>
          )}
          <LabelXS className="text-alchm-fg-mute">{formatWhen(table.scheduledAt)}</LabelXS>
        </div>

        <h3 className="text-[20px] leading-tight text-alchm-fg" style={{ fontFamily: "var(--f-display)" }}>
          {table.title}
        </h3>

        {table.venue.type !== "home" && table.venue.name && (
          <LabelXS className="text-alchm-fg-mute">{table.venue.name}</LabelXS>
        )}

        {/* Footer */}
        <Link
          href={`/tables/${table.id}`}
          className="mt-auto flex items-center gap-3 border-t border-white/10 pt-3 no-underline"
        >
          <AvatarCircle
            name={table.host.name}
            src={table.host.avatarUrl ?? undefined}
            element={toElement(table.host.dominantElement)}
            size={32}
          />
          <span className="min-w-0 flex-1">
            <LabelXS className="block text-alchm-fg-mute">Hosted by</LabelXS>
            <span className="block truncate text-sm text-alchm-fg">{table.host.name}</span>
          </span>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-alchm-fg-dim"
            aria-hidden
          >
            <Glyph name="arrow" size={14} stroke={1.6} />
          </span>
        </Link>
      </div>
    </GlassPanel>
  );
}

export default TableMatchCard;
