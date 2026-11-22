import type { FabricationYieldRow } from "./fabricationYields";

/**
 * Published yields (basis `LITERATURE`). Cuts without one fall back to the
 * labelled `MODEL ESTIMATE` generator in `fabricationYields.ts`.
 *
 * SOURCE (all but salmon): USDA ARS National Nutrient Database for Standard
 * Reference, Release 28 (SR28), file FOOD_DES.txt, fields Ref_desc and Refuse
 * — the refuse removed from the AS-PURCHASED RETAIL CUT to reach the edible
 * portion the record describes. Every row below was re-read from FOOD_DES.txt
 * on 2026-11-20. ⚠️ These are retail-cut refuse figures, NOT wholesale →
 * retail fabrication tests (no published IMPS-subprimal cutting test was found
 * for these cuts). "Bone and connective tissue" is reported as bone; separate
 * connective tissue or skin is "other"; separable / seam fat is trim fat.
 *
 * @file src/data/butcher/literatureYields.ts
 */

function sr28(
  cutId: string,
  ndb: string,
  description: string,
  refDesc: string,
  parts: { readonly fat: number; readonly bone: number; readonly other: number },
): FabricationYieldRow {
  return {
    cutId,
    fromSubprimal: `${description} (as-purchased retail cut)`,
    usableYieldPct: 100 - parts.fat - parts.bone - parts.other,
    trimFatPct: parts.fat,
    boneWastePct: parts.bone,
    otherLossPct: parts.other,
    basis: "LITERATURE",
    source: `USDA SR28 NDB ${ndb}, Refuse ${parts.fat + parts.bone + parts.other}% ("${refDesc}")`,
  };
}

export const LITERATURE_YIELDS: Readonly<Record<string, FabricationYieldRow>> = {
  porterhouse: sr28("porterhouse", "13464", "Beef, short loin, porterhouse steak, lean only, 1/8\" trim", "Bone and connective tissue 23%, Separable fat 12%", { fat: 12, bone: 23, other: 0 }),
  "t-bone": sr28("t-bone", "13478", "Beef, short loin, T-bone steak, bone-in, lean only, 1/8\" trim", "Bone and connective tissue, 25%, separable fat, 14%", { fat: 14, bone: 25, other: 0 }),
  "ny-strip": sr28("ny-strip", "13909", "Beef, short loin, top loin steak, lean and fat, 1/8\" trim", "Bone and Connective tissue 10%", { fat: 0, bone: 10, other: 0 }),
  "tenderloin-filet": sr28("tenderloin-filet", "13917", "Beef, tenderloin steak, lean and fat, 1/8\" trim", "Bone and connective tissue 2%", { fat: 0, bone: 2, other: 0 }),
  ribeye: sr28("ribeye", "23150", "Beef, rib eye steak/roast, bone-in, lip-on, lean only, 1/8\" trim", "Bone and connective tissue 14%, Separable fat 21%", { fat: 21, bone: 14, other: 0 }),
  "prime-rib": sr28("prime-rib", "13824", "Beef, rib, whole (ribs 6-12), lean and fat, 1/8\" trim", "Bone", { fat: 0, bone: 16, other: 0 }),
  "brisket-flat": sr28("brisket-flat", "13595", "Beef, brisket, flat half, boneless, lean only, 0\" trim", "Connective tissue 1%, seam fat 9%", { fat: 9, bone: 0, other: 1 }),
  "brisket-point": sr28("brisket-point", "13807", "Beef, brisket, point half, lean and fat, 1/8\" trim", "Connective tissue", { fat: 0, bone: 0, other: 1 }),
  "osso-buco-shank": sr28("osso-buco-shank", "13227", "Beef, shank crosscuts, lean only, 1/4\" trim, choice", "Bone 34%, separable fat 6%", { fat: 6, bone: 34, other: 0 }),
  "pork-loin-chop": sr28("pork-loin-chop", "10040", "Pork, loin, center loin (chops), bone-in, lean only", "Bone, 14%, Connective tissue, 11%, Separable fat, 6%", { fat: 6, bone: 14, other: 11 }),
  "pork-belly": sr28("pork-belly", "10005", "Pork, fresh, belly, raw", "Skin", { fat: 0, bone: 0, other: 7 }),
  "baby-back-ribs": sr28("baby-back-ribs", "10192", "Pork, fresh, backribs, lean and fat", "Bone 30%, Connective tissue 7%", { fat: 0, bone: 30, other: 7 }),
  "spare-ribs": sr28("spare-ribs", "10088", "Pork, fresh, spareribs, lean and fat", "Bone", { fat: 0, bone: 30, other: 0 }),
  "rack-of-lamb": sr28("rack-of-lamb", "17397", "Lamb (NZ), rack, fully frenched, lean only", "Bone and connective tissue 27% Separable fat 3%", { fat: 3, bone: 27, other: 0 }),
  "leg-of-lamb": sr28("leg-of-lamb", "17013", "Lamb, leg, whole (shank and sirloin), lean only, 1/4\" trim, choice", "Bone 21%, separable fat 15%", { fat: 15, bone: 21, other: 0 }),
  "chicken-wing": sr28("chicken-wing", "05100", "Chicken, broilers or fryers, wing, meat and skin, raw", "Bone and connective tissue 38%", { fat: 0, bone: 38, other: 0 }),
  "center-fillet": {
    cutId: "center-fillet",
    fromSubprimal: "Farmed Atlantic salmon, dressed (head-on gutted)",
    usableYieldPct: 67.5,
    trimFatPct: 0,
    boneWastePct: 23,
    otherLossPct: 9.5,
    basis: "LITERATURE",
    source: "Perennia (Nova Scotia), Species Spotlight: Farmed Atlantic Salmon, process yield: dressed → trimmed fillet 67.5%, dressed → untrimmed fillet 77% (head/frame/fins 23% and fillet trim 9.5% COMPUTED from those two)",
  },
};
