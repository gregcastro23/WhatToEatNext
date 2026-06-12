"use client";

/**
 * HubTelemetry — the three live data cards in the Transmutation Hub hero:
 *   a. OPTIMAL_VECTOR   — top-ranked method for the current sky + lunar phase
 *   b. AMBIENT_ENTROPY  — live entropy from /api/alchm-quantities + stability
 *   c. RECALIBRATE_SENSORS — refresh planetary positions + quantities
 *
 * Degrades gracefully: em-dash placeholders while loading or on error.
 */
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { accentClass } from "@/components/cooking-methods/primitives";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { allCookingMethods } from "@/data/cooking/methods";
import { getAlchemicalProfile } from "@/data/cooking/profiles";
import {
  rankMethodsForMoment,
  type RankedMethodSnapshot,
} from "@/utils/methodAlchemicalSnapshot";

type ForceClassification = "accelerating" | "balanced" | "decelerating";

const STABILITY_MAP: Record<ForceClassification, { label: string; tone: string }> = {
  accelerating: { label: "FLUCTUATING", tone: "text-ma-error" },
  balanced: { label: "NOMINAL", tone: "text-ma-emerald-soft" },
  decelerating: { label: "SETTLING", tone: "text-ma-cyan-bright" },
};

function toUnderscoreCaps(value: string): string {
  return value.trim().replace(/[\s-]+/g, "_").toUpperCase();
}

export default function HubTelemetry() {
  const {
    planetaryPositions,
    lunarPhase,
    refreshPlanetaryPositions,
    isLoading,
  } = useAlchemical();

  // ── a. OPTIMAL_VECTOR ──────────────────────────────────────────────────────
  const topRanked: RankedMethodSnapshot | null = useMemo(() => {
    try {
      const ranked = rankMethodsForMoment(allCookingMethods, {
        planetaryPositions,
      });
      return ranked[0] ?? null;
    } catch {
      return null;
    }
  }, [planetaryPositions]);

  const topProfile = topRanked ? getAlchemicalProfile(topRanked.id) : undefined;
  const vectorName = topRanked
    ? toUnderscoreCaps(topProfile?.displayName ?? topRanked.method.name)
    : null;
  const vectorClassification = topRanked
    ? (topProfile?.classification ??
      (topRanked.method.culinaryArchetype
        ? toUnderscoreCaps(topRanked.method.culinaryArchetype)
        : null))
    : null;

  // ── b. AMBIENT_ENTROPY ─────────────────────────────────────────────────────
  const [entropy, setEntropy] = useState<number | null>(null);
  const [forceClass, setForceClass] = useState<ForceClassification | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchQuantities = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/alchm-quantities", { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: unknown = await res.json();
      if (!mountedRef.current) return;
      const payload = json as {
        entropy?: unknown;
        circuit?: { forceClassification?: unknown };
      };
      setEntropy(
        typeof payload.entropy === "number" && Number.isFinite(payload.entropy)
          ? payload.entropy
          : null,
      );
      const fc = payload.circuit?.forceClassification;
      setForceClass(
        fc === "accelerating" || fc === "balanced" || fc === "decelerating"
          ? fc
          : null,
      );
    } catch {
      /* keep last good values; placeholders render until first success */
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchQuantities(controller.signal);
    const interval = setInterval(() => {
      void fetchQuantities(controller.signal);
    }, 60_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchQuantities]);

  // ── c. RECALIBRATE_SENSORS ─────────────────────────────────────────────────
  const [recalibrating, setRecalibrating] = useState(false);
  const handleRecalibrate = useCallback(async () => {
    if (recalibrating) return;
    setRecalibrating(true);
    try {
      await Promise.allSettled([
        refreshPlanetaryPositions(),
        fetchQuantities(),
      ]);
    } finally {
      if (mountedRef.current) setRecalibrating(false);
    }
  }, [recalibrating, refreshPlanetaryPositions, fetchQuantities]);

  const spinning = recalibrating || isLoading;
  const stability = forceClass ? STABILITY_MAP[forceClass] : null;
  const lunarLabel =
    typeof lunarPhase === "string" && lunarPhase.length > 0
      ? toUnderscoreCaps(lunarPhase)
      : "—";

  return (
    <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
      {/* a. OPTIMAL_VECTOR */}
      <div className="rounded border border-ma-line/40 bg-ma-surface/50 p-4">
        <div className="ma-label mb-2 text-ma-cyan-bright">OPTIMAL_VECTOR</div>
        {topRanked && vectorName ? (
          <div className={accentClass(topProfile?.accent)}>
            <Link
              href={`/cooking-methods/${topRanked.id}`}
              className="ma-data block text-lg text-[var(--ma-accent)] transition-colors hover:text-[var(--ma-accent-soft)]"
            >
              {vectorName}
            </Link>
            {vectorClassification ? (
              <div className="ma-label mt-2 text-ma-outline">
                {vectorClassification}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="ma-data text-lg text-ma-outline">—</div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-ma-line/40 pt-2">
          <span className="ma-label text-ma-outline">LUNAR_PHASE</span>
          <span className="ma-label text-ma-emerald-soft">{lunarLabel}</span>
        </div>
      </div>

      {/* b. AMBIENT_ENTROPY */}
      <div className="rounded border border-ma-line/40 bg-ma-surface/50 p-4">
        <div className="ma-label mb-2 text-ma-cyan-bright">AMBIENT_ENTROPY</div>
        <div className="ma-data text-lg text-ma-cyan-bright">
          {entropy !== null ? (
            <>
              {entropy.toFixed(3)}{" "}
              <span className="text-sm text-ma-fg-dim">J/K</span>
            </>
          ) : (
            <span className="text-ma-outline">—</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-ma-line/40 pt-2">
          <span className="ma-label text-ma-outline">STABILITY</span>
          {stability ? (
            <span className={`ma-label ${stability.tone}`}>{stability.label}</span>
          ) : (
            <span className="ma-label text-ma-outline">—</span>
          )}
        </div>
      </div>

      {/* c. RECALIBRATE_SENSORS */}
      <button
        type="button"
        onClick={() => void handleRecalibrate()}
        disabled={spinning}
        aria-label="Recalibrate sensors: refresh planetary positions and ambient readings"
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded border border-ma-cyan/30 bg-ma-surface/50 p-4 transition-colors hover:bg-ma-cyan/5 disabled:cursor-wait disabled:opacity-70"
      >
        <RefreshCw
          className={`h-8 w-8 text-ma-cyan ${spinning ? "animate-spin" : ""}`}
          aria-hidden
        />
        <span className="ma-label text-ma-cyan-bright">RECALIBRATE_SENSORS</span>
      </button>
    </div>
  );
}
