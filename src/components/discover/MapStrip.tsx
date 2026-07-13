"use client";

import Link from "next/link";
import { GlassPanel, LabelXS, ELEMENT_COLORS } from "@/components/tables/ui";
import { toElement, type DiscoverTableCard } from "./types";
import type { JSX } from "react";

/**
 * MapStrip (tables-design-spec.md §3.6) — a STATIC styled fallback (no map lib
 * exists in the repo). A dark "void map" backdrop with a dotted grid and up to
 * 6 glowing element dots positioned by normalizing real venue distances into
 * the strip bounds. "VIEW MAP" links to the best-match explorer for now.
 */
export function MapStrip({ tables }: { tables: DiscoverTableCard[] }): JSX.Element {
  const geoTables = tables.filter((t) => t.distanceKm != null).slice(0, 6);
  const maxKm = Math.max(1, ...geoTables.map((t) => t.distanceKm ?? 0));

  return (
    <GlassPanel rounded="2xl" className="relative h-48 overflow-hidden">
      {/* Void-map backdrop + dotted grid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 80% at 50% 120%, rgba(181,126,224,0.12), transparent 70%), #0b0912",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />

      {/* Element dots — nearer tables sit closer to the center baseline. */}
      {geoTables.map((t, i) => {
        const colors = ELEMENT_COLORS[toElement(t.dominantElement)];
        const frac = (t.distanceKm ?? 0) / maxKm; // 0 = center, 1 = edge
        const left = 12 + (i / Math.max(1, geoTables.length - 1 || 1)) * 76;
        const top = 30 + frac * 45;
        return (
          <span
            key={t.id}
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              background: colors.hex,
              boxShadow: `0 0 10px ${colors.hex}`,
            }}
            aria-hidden
          />
        );
      })}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        <div>
          <LabelXS className="text-alchm-fg-warm">Explore the Realm</LabelXS>
          <p className="mt-1 text-sm text-alchm-fg-dim">
            {geoTables.length > 0
              ? `${geoTables.length} open ${geoTables.length === 1 ? "table" : "tables"} nearby`
              : "Turn on Near me to map tables around you"}
          </p>
        </div>
        <Link
          href="/restaurants"
          className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-3 py-1.5 no-underline backdrop-blur-md hover:bg-white/10"
        >
          <LabelXS className="text-alchm-fg-dim">View map</LabelXS>
        </Link>
      </div>
    </GlassPanel>
  );
}

export default MapStrip;
