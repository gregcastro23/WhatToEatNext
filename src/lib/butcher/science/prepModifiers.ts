import type { AnatomicalCut, CutProximate, SpeciesId } from "@/lib/butcher/types";

/**
 * Pre-cook prep modifiers for the coupled trajectory (None · Dry Brine 24 h ·
 * Wet Brine · Dry-Aged 28 d). A profile changes at most four physical inputs:
 *  - `waterMassChangeG`      g of water gained (+) or lost (−) per 100 g raw
 *  - `surfaceWaterFactor`    × the method's initial surface film; `null` =
 *                            COMPUTED as the bulk-water ratio after the change
 *  - `cookLossReductionFrac` relative reduction of the modelled moisture loss
 *  - `toughnessReductionFrac` relative reduction of the tenderness deficit
 *                            (100 − score), read as a shear-force reduction
 * Every number names its basis in `basis`; MODEL ASSUMPTION marks a value no
 * peer-reviewed measurement was found for (literature search 2026-11-20).
 *
 * @file src/lib/butcher/science/prepModifiers.ts
 */

export type PrepId = "none" | "dry-brine-24h" | "wet-brine" | "dry-aged-28d";

export interface PrepProfile {
  readonly id: PrepId;
  readonly label: string;
  readonly waterMassChangeG: number;
  readonly surfaceWaterFactor: number | null;
  readonly cookLossReductionFrac: number;
  readonly toughnessReductionFrac: number;
  /** Species the profile is offered for; elsewhere it falls back to `none`. */
  readonly species: readonly SpeciesId[];
  readonly summary: string;
  readonly basis: readonly string[];
}

const ALL_SPECIES: PrepProfile["species"] = ["beef", "pork", "lamb", "poultry", "finfish"];

export const PREP_PROFILES: Readonly<Record<PrepId, PrepProfile>> = {
  none: {
    id: "none", label: "None", waterMassChangeG: 0, surfaceWaterFactor: 1,
    cookLossReductionFrac: 0, toughnessReductionFrac: 0, species: ALL_SPECIES,
    summary: "Straight from the package, surface blotted.", basis: [],
  },
  "dry-brine-24h": {
    id: "dry-brine-24h", label: "Dry Brine 24 h", waterMassChangeG: 0, surfaceWaterFactor: 0.5,
    cookLossReductionFrac: 0.12, toughnessReductionFrac: 0, species: ALL_SPECIES,
    summary: "~1% salt, uncovered 24 h: the brine is reabsorbed and the surface dries, so browning starts sooner; salt-swollen myofibrils hold more water.",
    basis: [
      "Surface film ×0.5 — MODEL ASSUMPTION: no peer-reviewed surface-moisture measurement for 1% / 24 h pre-salting was found.",
      "Cook loss −12% (relative) — MODEL ASSUMPTION: mechanism is salt-induced myofibrillar swelling (Offer & Trinick 1983, Meat Sci 8:245); no 1% / 24 h cook-loss measurement was found.",
    ],
  },
  "wet-brine": {
    id: "wet-brine", label: "Wet Brine", waterMassChangeG: 6, surfaceWaterFactor: 2.5,
    cookLossReductionFrac: 0, toughnessReductionFrac: 0, species: ALL_SPECIES,
    summary: "Brine uptake adds water that cushions overcooking on lean cuts, but a wet surface delays browning unless patted dry.",
    basis: [
      "Uptake +6 g/100 g — MODEL ASSUMPTION: no peer-reviewed immersion-brine uptake was found; a non-peer-reviewed Cook's Illustrated test reports ~6% for chicken.",
      "Surface film ×2.5 — MODEL ASSUMPTION: an unpatted brine film.",
      "No cook-loss reduction is claimed: the one study found (injection, Kim et al. 2020, Food Sci Anim Resour 40:1055) showed none. The juiciness gain shown is only the extra water retained relative to the unbrined raw weight.",
    ],
  },
  "dry-aged-28d": {
    id: "dry-aged-28d", label: "Dry-Aged 28 d", waterMassChangeG: -11.2, surfaceWaterFactor: null,
    cookLossReductionFrac: 0, toughnessReductionFrac: 0.227, species: ["beef", "pork", "lamb"],
    summary: "28 days at ~2 °C: evaporative shrink concentrates the lean (faster browning, shorter stall) and calpain proteolysis lowers shear force.",
    basis: [
      "Water −11.2 g/100 g — LITERATURE: 28 d strip-loin cooler shrink, Dashdorj et al. 2016 J Anim Sci Technol 58:20, Table 1 (range 6.1–12.7 across cuts). Applied as a uniform water loss: an UPPER BOUND, since part of the shrink sits in the 16% crust that is trimmed off.",
      "Surface film — COMPUTED: scaled by the lean's water fraction after shrink ÷ before.",
      "Shear −22.7% — COMPUTED from Lee et al. 2019 Food Sci Anim Resour 39:934, Table 3 (mean of three suppliers' day-0 vs day-28 WBSF). WEAK basis: the suppliers disagree (−50%, +19%, −4%).",
    ],
  },
};

export const PREP_IDS: readonly PrepId[] = ["none", "dry-brine-24h", "wet-brine", "dry-aged-28d"];

export function isPrepId(value: string): value is PrepId {
  return PREP_IDS.some((id) => id === value);
}

export function prepAvailableForCut(prep: PrepId, cut: AnatomicalCut): boolean {
  return PREP_PROFILES[prep].species.includes(cut.speciesId);
}

/** The profile actually applied: an unavailable prep for this species falls back to `none`. */
export function effectivePrep(prep: PrepId | undefined, cut: AnatomicalCut): PrepProfile {
  const id = prep ?? "none";
  return prepAvailableForCut(id, cut) ? PREP_PROFILES[id] : PREP_PROFILES.none;
}

function proximateTotal(p: CutProximate): number {
  return p.waterG + p.proteinG + p.fatG + p.ashG;
}

/**
 * Adds (+) or removes (−) `waterG` grams of water per 100 g of raw tissue and
 * renormalises so the proximate total is unchanged: water → (w + Δ)·s, every
 * other component → x·s, with s = total / (total + Δ).
 */
export function shiftWaterMass(proximate: CutProximate, waterG: number): CutProximate {
  if (waterG === 0) return proximate;
  const total = proximateTotal(proximate);
  const delta = Math.max(waterG, 1 - proximate.waterG);
  const s = total / (total + delta);
  return {
    waterG: (proximate.waterG + delta) * s,
    proteinG: proximate.proteinG * s,
    fatG: proximate.fatG * s,
    ashG: proximate.ashG * s,
    collagenG: proximate.collagenG * s,
  };
}

/** Surface-film multiplier, COMPUTED from the bulk-water ratio when the profile says `null`. */
export function surfaceWaterFactorFor(prep: PrepProfile, before: CutProximate, after: CutProximate): number {
  if (prep.surfaceWaterFactor !== null) return prep.surfaceWaterFactor;
  const fracBefore = before.waterG / Math.max(1e-9, proximateTotal(before));
  const fracAfter = after.waterG / Math.max(1e-9, proximateTotal(after));
  return fracAfter / Math.max(1e-9, fracBefore);
}

/** Tenderness after the prep: the deficit (100 − score) shrinks by `toughnessReductionFrac`. */
export function applyToughnessReduction(tendernessScore: number, prep: PrepProfile): number {
  const f = Math.min(0.9, Math.max(0, prep.toughnessReductionFrac));
  return Number((100 - (100 - tendernessScore) * (1 - f)).toFixed(1));
}
