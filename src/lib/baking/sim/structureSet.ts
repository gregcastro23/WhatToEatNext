/**
 * When the foam becomes a sponge: starch gelatinization and protein
 * coagulation, and how dissolved sucrose delays the first.
 *
 * Each structure-forming component sets over its own temperature window. The
 * node's set fraction is their mass-weighted progress, evaluated at the
 * HOTTEST temperature the node has reached — both transitions are
 * irreversible, so a crumb that cools a degree does not unset.
 *
 * The sucrose delay is measured, not assumed: Allan, Chamberlain & Mauer
 * (2020) raised wheat starch's DSC onset by +3.54, +11.50, +19.20 and +28.86 K
 * in 0.5, 1.0, 1.5 and 2.0 M sucrose. This is the mechanism behind a sunken
 * high-sugar cake: the batter keeps rising long after a leaner one would have
 * set, and falls when the gas runs out first. Between the measured points the
 * shift is interpolated linearly; past 2.0 M it is held at the last point and
 * reported as an extrapolation rather than extended.
 *
 * Only sucrose shifts the window here. Allan et al. measured other sugars too,
 * but those values were not carried into this model — a stated gap.
 *
 * @file src/lib/baking/sim/structureSet.ts
 */
import { MOLAR_MASS } from "../chemistry";
import { SIM } from "./constants";
import { ramp } from "./gasCells";
import type { SetComponent, TransitionWindow } from "./simTypes";

/** [sucrose molarity, onset shift K], Allan et al. 2020, wheat starch, starch:solution 1:2. */
export const ALLAN_SUCROSE_SHIFT: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.5, 3.54],
  [1.0, 11.5],
  [1.5, 19.2],
  [2.0, 28.86],
];

/** Molarity of sucrose dissolved in `waterG` of water, mol per litre of solution. */
export function sucroseMolarity(sucroseG: number, waterG: number): number {
  if (!(waterG > 0)) return 0;
  const litres = (waterG + sucroseG * SIM.sucroseSpecificVolumeMlG.value) / 1000;
  return sucroseG / MOLAR_MASS.sucrose / litres;
}

export interface GelShift {
  shiftK: number;
  /** True when the molarity was past the last measured point and the shift was held there. */
  extrapolated: boolean;
}

export function sucroseGelShift(molarity: number): GelShift {
  const last = ALLAN_SUCROSE_SHIFT[ALLAN_SUCROSE_SHIFT.length - 1] ?? [0, 0];
  if (molarity >= last[0]) return { shiftK: last[1], extrapolated: molarity > last[0] };
  for (let i = 1; i < ALLAN_SUCROSE_SHIFT.length; i += 1) {
    const lo = ALLAN_SUCROSE_SHIFT[i - 1] ?? [0, 0];
    const hi = ALLAN_SUCROSE_SHIFT[i] ?? [0, 0];
    if (molarity <= hi[0]) {
      const t = (molarity - lo[0]) / (hi[0] - lo[0]);
      return { shiftK: lo[1] + t * (hi[1] - lo[1]), extrapolated: false };
    }
  }
  return { shiftK: 0, extrapolated: false };
}

/** A starch's gelatinization window from its measured onset, shifted by sucrose. */
export function gelatinizationWindow(onsetC: number, shiftK: number): TransitionWindow {
  const start = onsetC + shiftK;
  return { onsetC: start, endC: start + SIM.gelWindowK.value };
}

/** Mass-weighted set fraction at the hottest temperature reached, 0–1. */
export function setFraction(maxC: number, components: readonly SetComponent[]): number {
  let mass = 0;
  let progress = 0;
  for (const c of components) {
    mass += c.massFraction;
    progress += c.massFraction * ramp(maxC, c.window.onsetC, c.window.endC);
  }
  return mass > 0 ? progress / mass : 0;
}

/** True once every component of `kind` has completed its window. Vacuously false with none. */
export function kindComplete(maxC: number, components: readonly SetComponent[], kind: SetComponent["kind"]): boolean {
  const ofKind = components.filter((c) => c.kind === kind);
  return ofKind.length > 0 && ofKind.every((c) => maxC >= c.window.endC);
}
