"use client";

/**
 * ReactionTelemetry — live P=IV readout island for a method profile page.
 *
 * Subscribes to the app-wide AlchemicalContext (which polls planetary
 * positions itself) and re-runs the pure per-method snapshot pipeline
 * whenever the sky moves. Pure compute — no fetches, no intervals here.
 * Degrades to em-dash placeholders if the engine throws or kinetics are null.
 */
import { useMemo } from "react";
import {
  MaChip,
  MaDataReadout,
} from "@/components/cooking-methods/primitives";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import type { CookingMethodData } from "@/types/cookingMethod";
import {
  computeMethodSnapshot,
  type MethodAlchemicalSnapshot,
} from "@/utils/methodAlchemicalSnapshot";

function fmt(value: number | null | undefined, digits = 3): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "—";
}

const FORCE_TONES: Record<string, "ember" | "emerald" | "cyan"> = {
  accelerating: "ember",
  balanced: "emerald",
  decelerating: "cyan",
};

const THERMAL_TONES: Record<string, "ember" | "cyan" | "outline"> = {
  heating: "ember",
  cooling: "cyan",
  stable: "outline",
};

export default function ReactionTelemetry({
  methodId,
  method,
}: {
  methodId: string;
  method: CookingMethodData;
}) {
  const { planetaryPositions } = useAlchemical();

  const snapshot: MethodAlchemicalSnapshot | null = useMemo(() => {
    try {
      return computeMethodSnapshot(methodId, method, { planetaryPositions });
    } catch {
      return null;
    }
  }, [methodId, method, planetaryPositions]);

  const kinetics = snapshot?.kinetics ?? null;

  return (
    <div className="ma-rule border-b-0 border-t pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="ma-label flex items-center gap-2 text-ma-outline">
          <span
            className="ma-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--ma-accent)] shadow-[0_0_6px_rgba(var(--ma-accent-rgb),0.8)]"
            aria-hidden
          />
          LIVE_TELEMETRY
        </span>
        <div className="flex flex-wrap gap-2">
          {kinetics ? (
            <>
              <MaChip tone={FORCE_TONES[kinetics.forceClassification] ?? "outline"}>
                {kinetics.forceClassification}
              </MaChip>
              <MaChip tone={THERMAL_TONES[kinetics.thermalDirection] ?? "outline"}>
                {kinetics.thermalDirection}
              </MaChip>
            </>
          ) : (
            <MaChip tone="outline">SIGNAL_PENDING</MaChip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MaDataReadout
          label="CHARGE Q"
          value={fmt(kinetics?.charge)}
          valueClassName="text-[var(--ma-accent-soft)]"
        />
        <MaDataReadout
          label="POTENTIAL V"
          value={fmt(kinetics?.potentialDifference)}
          valueClassName="text-[var(--ma-accent-soft)]"
        />
        <MaDataReadout
          label="CURRENT I"
          value={fmt(kinetics?.currentFlow)}
          valueClassName="text-[var(--ma-accent-soft)]"
        />
        <MaDataReadout
          label="POWER P"
          value={fmt(kinetics?.power)}
          valueClassName="text-[var(--ma-accent-soft)]"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-ma-line/30 pt-4">
        <MaDataReadout
          label="MONICA_CONSTANT"
          value={fmt(snapshot?.monica)}
          valueClassName="text-ma-fg"
        />
        <MaDataReadout
          label="HARMONY_INDEX"
          value={
            snapshot && Number.isFinite(snapshot.harmony.harmonyIndex)
              ? `${Math.round(snapshot.harmony.harmonyIndex)}%`
              : "—"
          }
          valueClassName="text-ma-fg"
        />
      </div>
    </div>
  );
}
