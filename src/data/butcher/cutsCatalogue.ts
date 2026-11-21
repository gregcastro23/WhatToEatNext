import type { AnatomicalCut, FdcButcherRecord, SpeciesId, SpeciesSpec } from "@/lib/butcher/types";
import { BEEF_CUTS, BEEF_PRIMALS } from "./beefCuts";
import { FDC_BUTCHER_RECORDS } from "./fdcButcherRecords";
import { FINFISH_CUTS, FINFISH_PRIMALS } from "./finfishCuts";
import { LAMB_CUTS, LAMB_PRIMALS } from "./lambCuts";
import { PORK_CUTS, PORK_PRIMALS } from "./porkCuts";
import { POULTRY_CUTS, POULTRY_PRIMALS } from "./poultryCuts";

/**
 * Canonical 5-species / 28-primal / 52-cut Butcher Shop catalogue pinned to
 * USDA FoodData Central records.
 *
 * @file src/data/butcher/cutsCatalogue.ts
 */

export const SPECIES_LIST: readonly SpeciesSpec[] = [
  {
    id: "beef",
    name: "Beef",
    latinName: "Bos taurus",
    summary: "9 anatomical primals and 25 retail cuts spanning delicate lumbar tenderloin to collagen-dense forequarter chuck, brisket, and shank.",
    svgViewBox: "0 0 640 320",
    svgOutlinePath: "M96,120 Q120,76 220,78 L428,84 Q530,88 576,126 L568,236 L490,236 L480,192 L222,196 L198,292 L138,292 L114,200 Z",
    defaultCutId: "ribeye",
    primals: BEEF_PRIMALS,
  },
  {
    id: "pork",
    name: "Pork",
    latinName: "Sus scrofa domesticus",
    summary: "6 primals from intramuscularly marbled Boston butt and fat-layered pork belly to ultra-lean lumbar tenderloin.",
    svgViewBox: "0 0 640 320",
    svgOutlinePath: "M108,118 Q154,78 260,82 L438,88 Q526,98 534,158 L508,276 L444,276 L422,226 L236,248 L134,244 L112,172 Z",
    defaultCutId: "pork-loin-chop",
    primals: PORK_PRIMALS,
  },
  {
    id: "lamb",
    name: "Lamb",
    latinName: "Ovis aries",
    summary: "5 primals contrasting quick-sear rib rack and loin chops against marrow-rich foreshank and marbled shoulder.",
    svgViewBox: "0 0 640 320",
    svgOutlinePath: "M122,116 Q168,82 260,86 L432,92 Q522,100 524,158 L504,230 L420,210 L220,204 L208,276 L152,276 L130,196 Z",
    defaultCutId: "rack-of-lamb",
    primals: LAMB_PRIMALS,
  },
  {
    id: "poultry",
    name: "Poultry (Chicken)",
    latinName: "Gallus gallus domesticus",
    summary: "4 primals separating delicate white-muscle pectoralis (65 °C ceiling) from myoglobin- and collagen-rich dark thigh and drumstick.",
    svgViewBox: "0 0 640 320",
    svgOutlinePath: "M124,142 Q178,92 318,96 Q418,100 448,144 L484,186 L470,268 L414,262 L392,224 L196,216 L124,206 Z",
    defaultCutId: "breast-supreme",
    primals: POULTRY_PRIMALS,
  },
  {
    id: "finfish",
    name: "Finfish (Salmon)",
    latinName: "Salmo salar",
    summary: "4 fillet zones from high-omega ventral belly (toro) to thick dorsal loin and lean caudal tail.",
    svgViewBox: "0 0 640 320",
    svgOutlinePath: "M114,156 Q164,86 340,86 Q458,88 544,124 L584,96 L568,156 L584,216 L544,188 Q456,222 332,222 Q162,222 114,156 Z",
    defaultCutId: "center-fillet",
    primals: FINFISH_PRIMALS,
  },
];

export const BUTCHER_CUTS: readonly AnatomicalCut[] = [
  ...BEEF_CUTS,
  ...PORK_CUTS,
  ...LAMB_CUTS,
  ...POULTRY_CUTS,
  ...FINFISH_CUTS,
];

const SPECIES_BY_ID = new Map<SpeciesId, SpeciesSpec>(
  SPECIES_LIST.map((s) => [s.id, s]),
);

const CUT_BY_ID = new Map<string, AnatomicalCut>(
  BUTCHER_CUTS.map((c) => [c.id, c]),
);

export function isSpeciesId(value: string | null): value is SpeciesId {
  return (
    value === "beef" ||
    value === "pork" ||
    value === "lamb" ||
    value === "poultry" ||
    value === "finfish"
  );
}

export function getSpeciesSpec(speciesId: SpeciesId): SpeciesSpec {
  const spec = SPECIES_BY_ID.get(speciesId);
  if (spec) return spec;
  const [fallback] = SPECIES_LIST;
  if (!fallback) {
    throw new Error("Species catalogue is empty");
  }
  return fallback;
}

export function getCutById(cutId: string): AnatomicalCut | null {
  return CUT_BY_ID.get(cutId) ?? null;
}

export function getCutsForSpecies(speciesId: SpeciesId): readonly AnatomicalCut[] {
  return BUTCHER_CUTS.filter((cut) => cut.speciesId === speciesId);
}

export function getCutsForPrimal(
  speciesId: SpeciesId,
  primalId: string,
): readonly AnatomicalCut[] {
  return BUTCHER_CUTS.filter(
    (cut) => cut.speciesId === speciesId && cut.primalId === primalId,
  );
}

export function getFdcRecordForCut(cut: AnatomicalCut): FdcButcherRecord | null {
  return FDC_BUTCHER_RECORDS[cut.id] ?? null;
}
