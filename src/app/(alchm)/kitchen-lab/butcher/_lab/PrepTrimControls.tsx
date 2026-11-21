"use client";

import { boneAnatomyForCut, type BonePlacement } from "@/lib/butcher/science/boneAnatomy";
import { PREP_IDS, PREP_PROFILES, prepAvailableForCut, type PrepId } from "@/lib/butcher/science/prepModifiers";
import type { AnatomicalCut } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * Compact Prep & Trim controls for the 1D trajectory: pre-cook prep, fat-cap
 * thickness, and the bone-in toggle, with each prep constant's basis one tap
 * away.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/PrepTrimControls.tsx
 */

const PLACEMENT_NOTE: Readonly<Record<BonePlacement, string>> = {
  face: "bone plate shields face B",
  core: "marrow bone at the centre",
  through: "bone runs through the thickness — modelled in 3D below",
};

function PrepButtons({
  cut,
  prep,
  onPrepChange,
}: {
  readonly cut: AnatomicalCut;
  readonly prep: PrepId;
  readonly onPrepChange: (prep: PrepId) => void;
}): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pre-cook prep">
      {PREP_IDS.map((id) => {
        const available = prepAvailableForCut(id, cut);
        return (
          <button
            key={id}
            type="button"
            className="bt-btn"
            aria-pressed={prep === id && available}
            disabled={!available}
            title={available ? PREP_PROFILES[id].summary : `No ${cut.speciesId} data for ${PREP_PROFILES[id].label}`}
            onClick={() => onPrepChange(id)}
          >
            {PREP_PROFILES[id].label}
          </button>
        );
      })}
    </div>
  );
}

function PrepBasis({ label, basis }: { readonly label: string; readonly basis: readonly string[] }): JSX.Element | null {
  if (basis.length === 0) return null;
  return (
    <details className="text-[11px] text-white/55">
      <summary className="cursor-pointer text-white/70">Basis for {label}</summary>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {basis.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </details>
  );
}

export function PrepTrimControls({
  cut,
  prep,
  fatCapMm,
  boneIn,
  onPrepChange,
  onFatCapChange,
  onBoneInChange,
}: {
  readonly cut: AnatomicalCut;
  readonly prep: PrepId;
  readonly fatCapMm: number;
  readonly boneIn: boolean;
  readonly onPrepChange: (prep: PrepId) => void;
  readonly onFatCapChange: (mm: number) => void;
  readonly onBoneInChange: (boneIn: boolean) => void;
}): JSX.Element {
  const anatomy = boneAnatomyForCut(cut);
  const profile = PREP_PROFILES[prepAvailableForCut(prep, cut) ? prep : "none"];
  return (
    <div className="space-y-2.5 rounded-lg border border-white/10 bg-black/20 p-3" aria-label="Prep and trim">
      <span className="bt-label block">Prep &amp; Trim</span>
      <PrepButtons cut={cut} prep={prep} onPrepChange={onPrepChange} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="bt-fat-cap" className="bt-label block">Fat cap on face A: {fatCapMm} mm</label>
          <input id="bt-fat-cap" type="range" min={0} max={15} step={1} value={fatCapMm} onChange={(e) => onFatCapChange(Number(e.target.value))} className="bt-range mt-1.5" />
        </div>
        {anatomy ? (
          <label className="flex items-center gap-2 text-xs text-white/80">
            <input type="checkbox" checked={boneIn} onChange={(e) => onBoneInChange(e.target.checked)} />
            Bone-in ({anatomy.boneName}: {PLACEMENT_NOTE[anatomy.placement]})
          </label>
        ) : (
          <p className="text-xs text-white/45">Boneless cut — no bone to model.</p>
        )}
      </div>
      <PrepBasis label={profile.label} basis={profile.basis} />
      {anatomy && boneIn ? (
        <p className="text-[11px] text-white/45">Bone sizes are anatomical model estimates; bone and fat properties are IT&apos;IS tissue averages.</p>
      ) : null}
    </div>
  );
}
