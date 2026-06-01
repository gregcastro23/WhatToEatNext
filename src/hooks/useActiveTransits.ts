"use client";

/**
 * Shared, page-cached view of the currently-active major aspects, used to turn a
 * click anywhere a transit is shown into the set of degree agents "involved".
 *
 * - Aspect surfaces (the Active Aspects list) already hold full aspect records and
 *   call `groupForAspect` directly; they don't need this hook.
 * - Position-only surfaces (planet tiles, the natal/transit wheel, the Sun/Moon
 *   bar) show a single transiting planet. `groupForPlanet` maps that planet to the
 *   transit it is most tightly involved in (smallest orb → exactly the two
 *   transiting planets), and degrades to a solo degree-agent council when the
 *   planet has no aspect in orb.
 *
 * Backed by `/api/alchm-quantities/aspects` (now carrying each planet's sign +
 * degree). A module-level cache + in-flight de-dupe means every surface on a page
 * shares one fetch.
 */

import { useEffect, useState } from "react";
import { groupForAspect, type TransitBody, type TransitGroup } from "@/lib/agents/transitAgents";

interface RawAspect {
  planet1: string;
  planet2: string;
  type: string;
  orbDegrees: number;
  sign1?: string;
  degree1?: number;
  sign2?: string;
  degree2?: number;
}

const TTL_MS = 120_000;
let cache: { at: number; aspects: RawAspect[] } | null = null;
let inflight: Promise<RawAspect[]> | null = null;

async function loadAspects(): Promise<RawAspect[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.aspects;
  if (inflight) return inflight;
  inflight = fetch("/api/alchm-quantities/aspects")
    .then((r) => (r.ok ? r.json() : { aspects: [] }))
    .then((j) => {
      const aspects: RawAspect[] = Array.isArray(j?.aspects) ? j.aspects : [];
      cache = { at: Date.now(), aspects };
      return aspects;
    })
    .catch(() => [] as RawAspect[])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useActiveTransits() {
  const [aspects, setAspects] = useState<RawAspect[]>(cache?.aspects ?? []);

  useEffect(() => {
    let alive = true;
    void loadAspects().then((a) => {
      if (alive) setAspects(a);
    });
    return () => {
      alive = false;
    };
  }, []);

  /** Group for an explicit aspect record (both transiting planets). */
  const groupForRecord = (a: RawAspect): TransitGroup | null =>
    groupForAspect(
      { planet: a.planet1, sign: a.sign1 ?? "", degree: a.degree1 ?? 0 },
      { planet: a.planet2, sign: a.sign2 ?? "", degree: a.degree2 ?? 0 },
      a.type,
    );

  /**
   * Group for a single transiting planet: its tightest active aspect (→ two
   * planets), falling back to a solo council from `body` when nothing is in orb.
   */
  const groupForPlanet = (planet: string, body?: TransitBody): TransitGroup | null => {
    const pl = planet.toLowerCase();
    const tightest = aspects
      .filter((a) => a.planet1.toLowerCase() === pl || a.planet2.toLowerCase() === pl)
      .sort((x, y) => x.orbDegrees - y.orbDegrees)[0];
    if (tightest) return groupForRecord(tightest);
    return body ? groupForAspect(body, body) : null;
  };

  return { aspects, groupForRecord, groupForPlanet };
}
