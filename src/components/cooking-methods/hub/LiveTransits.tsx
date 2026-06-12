"use client";

/**
 * LiveTransits — right-rail panel on the Transmutation Hub.
 * Polls /api/alchm-quantities/aspects every 5 minutes (repo convention:
 * hardened polling, no SSE) and renders the current major aspects with a
 * culinary cross-reference: methods whose planetary rulers participate
 * in the transit.
 */
import { Radio } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { PLANET_GLYPHS } from "@/components/cooking-methods/primitives";
import { ALCHEMICAL_METHOD_PROFILES } from "@/data/cooking/profiles";

interface AspectEntry {
  planet1: string;
  planet2: string;
  type: string;
  orbDegrees: number;
  applying: boolean;
  influence?: "harmonious" | "challenging" | "neutral";
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌",
  opposition: "☍",
  trine: "△",
  square: "□",
  sextile: "✶",
};

const BORDER_TONES = [
  "border-ma-cyan",
  "border-ma-ember",
  "border-ma-emerald",
];

/** planet name (capitalized) → method ids whose profile lists it as ruler */
function buildRulerIndex(): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const [id, profile] of Object.entries(ALCHEMICAL_METHOD_PROFILES)) {
    for (const ruler of profile.planetaryRulers) {
      (index[ruler.planet] ??= []).push(id);
    }
  }
  return index;
}

export default function LiveTransits() {
  const [aspects, setAspects] = useState<AspectEntry[] | null>(null);
  const rulerIndex = useMemo(buildRulerIndex, []);

  useEffect(() => {
    let mounted = true;
    const fetchAspects = async () => {
      try {
        const res = await fetch("/api/alchm-quantities/aspects");
        if (!res.ok) return;
        const data = (await res.json()) as { aspects?: AspectEntry[] };
        if (mounted && Array.isArray(data.aspects)) {
          setAspects(data.aspects.slice(0, 5));
        }
      } catch {
        /* keep last good values */
      }
    };
    void fetchAspects();
    const iv = setInterval(() => void fetchAspects(), 300_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="ma-panel rounded-lg p-5">
      <h3 className="ma-rule ma-label mb-4 flex items-center gap-2 pb-3 text-ma-cyan-bright">
        <Radio className="h-4 w-4" aria-hidden />
        LIVE_TRANSITS
      </h3>

      {aspects === null ? (
        <p className="font-mono text-xs text-ma-outline">
          AWAITING_SIGNAL…
        </p>
      ) : aspects.length === 0 ? (
        <p className="font-mono text-xs text-ma-outline">
          NO_MAJOR_ASPECTS_IN_ORB
        </p>
      ) : (
        <ul className="space-y-4">
          {aspects.map((a, i) => {
            const matchedMethod = (
              rulerIndex[a.planet1] ?? rulerIndex[a.planet2] ?? []
            )[0];
            return (
              <li
                key={`${a.planet1}-${a.type}-${a.planet2}`}
                className={`border-l-2 pl-3 ${BORDER_TONES[i % BORDER_TONES.length]}`}
              >
                <div className="ma-label mb-1 text-ma-outline">
                  <span aria-hidden>{PLANET_GLYPHS[a.planet1] ?? ""} </span>
                  {a.planet1.toUpperCase()}{" "}
                  <span aria-hidden>
                    {ASPECT_SYMBOLS[a.type] ?? "·"}
                  </span>{" "}
                  {a.planet2.toUpperCase()}
                  <span aria-hidden> {PLANET_GLYPHS[a.planet2] ?? ""}</span>
                </div>
                <div className="font-mono text-xs text-ma-fg-dim">
                  {a.type.toUpperCase()} · {a.orbDegrees.toFixed(1)}° orb ·{" "}
                  {a.applying ? "applying" : "separating"}
                </div>
                {matchedMethod ? (
                  <Link
                    href={`/cooking-methods/${matchedMethod}`}
                    className="ma-label mt-1 block text-ma-emerald-soft transition-colors hover:text-ma-ice"
                  >
                    OPTIMAL_FOR: {matchedMethod.replace(/_/g, " ").toUpperCase()}
                  </Link>
                ) : (
                  <span className="ma-label mt-1 block text-ma-outline">
                    AMBIENT_INFLUENCE
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 border-t border-ma-line/30 pt-4">
        <span className="ma-label mb-2 block text-ma-outline">
          SYSTEM_STATUS
        </span>
        <div className="h-1 w-full overflow-hidden rounded bg-ma-surface-low">
          <div
            className="h-full bg-ma-cyan shadow-[0_0_6px_rgba(0,242,255,0.6)]"
            style={{ width: aspects === null ? "15%" : "85%" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between">
          <span className="ma-data text-[11px] text-ma-fg-dim">
            {aspects === null ? "SYNCING" : "NOMINAL"}
          </span>
          <span className="ma-data text-[11px] text-ma-cyan-bright">
            {aspects === null ? "…" : "85%"}
          </span>
        </div>
      </div>
    </div>
  );
}
