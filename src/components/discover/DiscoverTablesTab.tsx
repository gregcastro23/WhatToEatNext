"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GradientButton, LabelXS } from "@/components/tables/ui";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { useElementalState } from "@/hooks/useElementalState";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Chip } from "./Chip";
import { useDiscoverTables } from "./hooks";
import { KindredRail } from "./KindredRail";
import { MapStrip } from "./MapStrip";
import { TableMatchCard } from "./TableMatchCard";
import type { JSX } from "react";

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

function dominantOf(el: { Fire?: number; Water?: number; Earth?: number; Air?: number }): string {
  let best = "Fire";
  let bestVal = -Infinity;
  for (const e of ELEMENTS) {
    const raw = el[e];
    const v = typeof raw === "number" ? raw : 0;
    if (v > bestVal) {
      bestVal = v;
      best = e;
    }
  }
  return best;
}

/**
 * Discover → Tables (tables-design-spec.md §3.6). Search pill + filter chips,
 * a compatibility "Tables near your energy" rail, a map strip when Near-me is
 * on, the main upcoming grid with keyset "Load more", and the Kindred rail.
 */
export function DiscoverTablesTab({ onSwitchToPeople }: { onSwitchToPeople: () => void }): JSX.Element {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [nearMe, setNearMe] = useState(false);
  const [myElement, setMyElement] = useState(false);
  const [openSeats, setOpenSeats] = useState(false);

  const sky = useElementalState();
  const element = useMemo(() => (myElement ? dominantOf(sky) : undefined), [myElement, sky]);
  const { location, status, requestBrowserLocation } = useUserLocation();

  const geoActive = nearMe && !!location;
  const denied = nearMe && status === "denied";

  const onToggleNearMe = () => {
    if (!nearMe && !location) requestBrowserLocation();
    setNearMe((v) => !v);
  };

  // Compatibility rail — "Tables near your energy".
  const rail = useDiscoverTables({ sort: "match", limit: 6 });

  // Main grid.
  const main = useDiscoverTables({
    q: q.trim() || undefined,
    element,
    openSeats,
    lat: geoActive && location ? location.lat : undefined,
    lng: geoActive && location ? location.lng : undefined,
    sort: geoActive ? "distance" : "soonest",
  });

  return (
    <div className="space-y-8">
      {/* Search pill */}
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 focus-within:border-alchm-violet">
        <Glyph name="atom" size={15} stroke={1.4} style={{ color: "var(--fg-mute)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search realms, energies, or ingredients…"
          className="w-full bg-transparent text-sm text-alchm-fg placeholder:text-alchm-fg-mute focus:outline-none"
          aria-label="Search tables"
        />
      </div>

      {/* Filter chips */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={geoActive} onClick={onToggleNearMe} icon="crosshair">
          {denied ? "Near me · off" : "Near me"}
        </Chip>
        <Chip active={myElement} onClick={() => setMyElement((v) => !v)} icon="triangle-up">
          My element
        </Chip>
        <Chip active={openSeats} onClick={() => setOpenSeats((v) => !v)} icon="ring">
          Open tables
        </Chip>
        <Chip onClick={onSwitchToPeople} icon="wave">
          People
        </Chip>
      </div>

      {/* "Tables near your energy" rail */}
      {(rail.loading || rail.tables.length > 0) && (
        <section aria-label="Tables near your energy" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-alchm-violet animate-pulse shadow-[0_0_8px_rgba(181,126,224,0.8)]" aria-hidden />
            <LabelXS className="text-alchm-fg-warm">Tables near your energy</LabelXS>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {rail.loading && rail.tables.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 w-72 shrink-0 animate-pulse rounded-2xl bg-white/[0.03]" />
                ))
              : rail.tables.map((t) => (
                  <div key={t.id} className="w-72 shrink-0 snap-start">
                    <TableMatchCard table={t} />
                  </div>
                ))}
          </div>
        </section>
      )}

      {/* Map strip when Near-me is on */}
      {geoActive && <MapStrip tables={main.tables} />}

      {/* Main grid */}
      <section aria-label="Tables" className="space-y-4">
        <LabelXS className="text-alchm-fg-dim">
          {geoActive ? "Near you" : "Upcoming tables"}
        </LabelXS>

        {main.tables.length === 0 && !main.loading ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-alchm-fg-dim">
              {geoActive ? "No tables near you yet — set the first one." : "No tables match yet — host the first one."}
            </p>
            <div className="mt-4">
              <GradientButton onClick={() => router.push("/tables?new=1")}>Host a Table</GradientButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {main.tables.map((t) => (
              <TableMatchCard key={t.id} table={t} />
            ))}
          </div>
        )}

        {main.hasMore && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={main.loadMore}
              disabled={main.loading}
              className="rounded-full border border-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-alchm-fg-dim hover:bg-white/5 disabled:opacity-40"
            >
              {main.loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </section>

      {/* Kindred alchemists */}
      <KindredRail />
    </div>
  );
}

export default DiscoverTablesTab;
