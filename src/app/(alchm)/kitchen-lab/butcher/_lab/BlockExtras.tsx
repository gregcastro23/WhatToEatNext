"use client";

import { getCutById } from "@/data/butcher/cutsCatalogue";
import { MASTERY_SPECIES, masteryRank } from "@/lib/butcher/science/butcherProgress";
import { sliceAngleCue } from "@/lib/butcher/stage/sliceAngleCue";
import type { ButcherOrderTicket, ButcherProgressStats, FabricationPick } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * Butcher's Block add-ons: the knife-angle colour cue chip, the Species
 * Mastery badges, and the multi-pull fabrication step tracker.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/BlockExtras.tsx
 */

export function SliceCueChip({ angleDeg }: { readonly angleDeg: number }): JSX.Element {
  const cue = sliceAngleCue(angleDeg);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{ borderColor: cue.colorHex, color: cue.colorHex }}
      data-band={cue.band}
      title="Knife plane vs grain: emerald within ±15° of 90°, amber bias, crimson below 30°"
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cue.colorHex }} aria-hidden="true" />
      {cue.label}
    </span>
  );
}

const SPECIES_LABEL: Readonly<Record<(typeof MASTERY_SPECIES)[number], string>> = {
  beef: "Beef", pork: "Pork", lamb: "Lamb", poultry: "Poultry", finfish: "Finfish",
};

export function MasteryBadges({ progress }: { readonly progress: ButcherProgressStats }): JSX.Element {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Species mastery">
      {MASTERY_SPECIES.map((sp) => {
        const stats = progress.speciesMastery[sp];
        const rank = masteryRank(stats);
        return (
          <li
            key={sp}
            className={`rounded-md border px-2 py-1 text-[11px] ${rank === "Unranked" ? "border-white/10 text-white/45" : "border-amber-400/40 text-amber-100"}`}
            title={`${stats.passed} passed · ${stats.masterPassed} master · best ${stats.bestScore}%`}
          >
            {SPECIES_LABEL[sp]}: <strong>{rank}</strong>
          </li>
        );
      })}
    </ul>
  );
}

export function FabricationStepsCard({
  ticket,
  picks,
  currentCutName,
  onPull,
  onUndo,
}: {
  readonly ticket: ButcherOrderTicket;
  readonly picks: readonly FabricationPick[];
  readonly currentCutName: string;
  readonly onPull: () => void;
  readonly onUndo: () => void;
}): JSX.Element {
  const steps = ticket.fabricationSteps ?? [];
  const nextIndex = picks.length;
  const done = nextIndex >= steps.length;
  return (
    <div className="rounded-lg border border-white/15 bg-black/25 p-3">
      <span className="bt-label block">Fabrication pulls</span>
      <ol className="mt-2 space-y-1 text-xs">
        {steps.map((step, i) => {
          const pick = picks[i];
          return (
            <li key={step.label} className={i === nextIndex ? "text-amber-100" : "text-white/70"}>
              {i < nextIndex ? "✓" : i === nextIndex ? "→" : "·"} {step.label} — {step.targetMassG} g @ {step.targetAngleDeg}°
              {pick ? ` · pulled ${getCutById(pick.selectedCutId)?.name ?? pick.selectedCutId}, ${pick.portionMassG} g, ${pick.sliceAngleDeg}°` : ""}
            </li>
          );
        })}
      </ol>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="bt-btn" onClick={onPull} disabled={done}>
          {done ? "All pulls recorded" : `Pull ${currentCutName} for step ${nextIndex + 1}`}
        </button>
        <button type="button" className="bt-btn" onClick={onUndo} disabled={nextIndex === 0}>
          Undo last pull
        </button>
      </div>
    </div>
  );
}
