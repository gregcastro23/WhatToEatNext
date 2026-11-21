"use client";

import { SKELETON_LANDMARKS } from "@/lib/butcher/stage/skeletonLandmarks";
import type { SpeciesId } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * "Why the cut sits there" notes for the Show Bone Landmarks toggle, loaded on
 * demand so the landmark tables stay out of the route's first-load JS.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/BoneLandmarkNotes.tsx
 */
export function BoneLandmarkNotes({ speciesId }: { readonly speciesId: SpeciesId }): JSX.Element {
  return (
    <ul className="grid gap-1.5 text-[11px] text-white/70 sm:grid-cols-2" aria-label="Bone landmarks and the cuts they explain">
      {SKELETON_LANDMARKS[speciesId].map((lm) => (
        <li key={lm.id} className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5">
          <strong className="text-white/90">{lm.label}</strong> — {lm.note}
        </li>
      ))}
    </ul>
  );
}
