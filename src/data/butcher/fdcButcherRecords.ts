import type { FdcButcherRecord, FdcMatch } from "@/lib/butcher/types";
import { USDA_BUTCHER_RECORDS } from "./usdaButcherRecords";

/**
 * The composition basis of every anatomical cut in the Butcher Shop, keyed by
 * cut id.
 *
 * Water, protein, fat and ash are USDA FoodData Central SR Legacy values,
 * verbatim. They come from `usdaButcherRecords.ts`, which
 * `scripts/fetch-usda-butcher.mjs` generates, and the script fails if an id
 * names a different food. The values here are never typed by hand.
 *
 * Several cuts share one USDA record, so the table is keyed by cut rather
 * than by fdcId. Each cut has its own collagen value.
 *
 * ── Which record ─────────────────────────────────────────────────────────────
 * Every cut uses the same rule:
 * - raw;
 * - separable lean and fat (the cut as cooked), unless USDA published lean only;
 * - choice grade where published, else all grades;
 * - the closest trim published (0" before 1/8" before 1/4");
 * - bone-in or boneless as the cut is sold.
 *
 * Where USDA never analysed a cut, `match: "PROXY"` names the nearest real
 * record and says why. The proximates are then that food's measured values,
 * not the cut's.
 *
 * ── Collagen ─────────────────────────────────────────────────────────────────
 * Collagen (g per 100 g raw tissue) is not an FDC field. It is set per cut
 * from Tornberg (2005) *Meat Science* 70:493–508 and Lawrie's *Meat Science*
 * (8th ed., intramuscular connective tissue per muscle group).
 *
 * Audit 2026-11-21: only 3 of the previous table's 51 ids named the cut they
 * claimed, and those 3 carried drifted values. The rest pointed at other
 * foods (ground beef, turkey skin, crayfish) or cooked records. Its collagen
 * values are kept.
 *
 * @file src/data/butcher/fdcButcherRecords.ts
 */

const TORNBERG_BEEF =
  "Tornberg (2005) Meat Sci. 70:493–508 & Lawrie's Meat Science (bovine muscle collagen)";
const LAWRIE_PORK_LAMB =
  "Lawrie's Meat Science (8th ed.) & Bailey & Light Connective Tissue in Meat";
const POULTRY_FISH_LIT =
  "McGee (2004) On Food and Cooking & USDA SR Legacy collagen/hydroxyproline estimates";

const SALMON_FILLET_PROXY =
  "SR Legacy analysed only the whole farmed Atlantic salmon fillet. No collar, loin, belly or tail record exists, so every salmon cut uses the fillet average.";

function cut(
  fdcId: number,
  match: FdcMatch,
  matchNote: string | null,
  collagenG: number,
  collagenSource: string,
  collagenBasis: "LITERATURE" | "DERIVED" = "LITERATURE",
): FdcButcherRecord {
  const usda = USDA_BUTCHER_RECORDS[fdcId];
  if (!usda) {
    throw new Error(`FDC ${fdcId} is not in usdaButcherRecords.ts; add it to scripts/fetch-usda-butcher.mjs`);
  }
  if (match === "PROXY" && !matchNote) {
    throw new Error(`FDC ${fdcId} is a PROXY without a note saying what it stands in for`);
  }
  return { ...usda, match, matchNote, collagenG, collagenBasis, collagenSource };
}

export const FDC_BUTCHER_RECORDS: Readonly<Record<string, FdcButcherRecord>> = {
  // Beef — Chuck
  "chuck-eye": cut(170834, "EXACT", null, 1.65, TORNBERG_BEEF),
  "flat-iron": cut(168707, "EXACT", "The flat iron is the boneless shoulder top blade steak.", 1.85, TORNBERG_BEEF),
  "denver-steak": cut(171214, "EXACT", null, 1.55, TORNBERG_BEEF),
  "chuck-roast": cut(168668, "EXACT", null, 2.45, TORNBERG_BEEF),

  // Beef — Rib
  ribeye: cut(173403, "EXACT", null, 0.85, TORNBERG_BEEF),
  "spinalis-cap": cut(174699, "EXACT", "The ribeye cap steak is the spinalis dorsi. USDA published it as separable lean only.", 0.92, TORNBERG_BEEF),
  "prime-rib": cut(172152, "EXACT", "The bone-in rib roast. A 3-rib standing roast is a section of it.", 0.92, TORNBERG_BEEF),
  "short-ribs": cut(169439, "EXACT", "SR Legacy's bone-in short ribs come from the rib. Chuck short ribs are published only boneless (FDC 170827).", 2.65, TORNBERG_BEEF),

  // Beef — Short Loin
  "ny-strip": cut(171751, "EXACT", "The New York strip is the boneless top loin steak.", 0.72, TORNBERG_BEEF),
  "tenderloin-filet": cut(173989, "EXACT", null, 0.42, TORNBERG_BEEF),
  porterhouse: cut(168715, "EXACT", null, 0.62, TORNBERG_BEEF),
  "t-bone": cut(168717, "EXACT", null, 0.64, TORNBERG_BEEF),

  // Beef — Sirloin
  "top-sirloin": cut(168728, "EXACT", null, 0.88, TORNBERG_BEEF),
  "tri-tip": cut(168736, "EXACT", null, 1.05, TORNBERG_BEEF),
  picanha: cut(174707, "EXACT", "Picanha is the top sirloin cap. It is often sold with a thicker fat cap than this record's 1/8\" trim.", 0.95, TORNBERG_BEEF),

  // Beef — Round
  "eye-of-round": cut(171746, "EXACT", null, 1.15, TORNBERG_BEEF),
  "top-round": cut(173980, "EXACT", "London broil is a top round steak.", 1.28, TORNBERG_BEEF),
  "bottom-round": cut(172128, "EXACT", "USDA published the bottom round roast only as separable lean. This is the same muscle sold as steak, lean and fat.", 1.75, TORNBERG_BEEF),

  // Beef — Brisket & Shank
  "brisket-flat": cut(168743, "EXACT", null, 2.55, TORNBERG_BEEF),
  "brisket-point": cut(169489, "EXACT", "Published only for all grades combined.", 2.80, TORNBERG_BEEF),
  "osso-buco-shank": cut(169441, "EXACT", "Published only as separable lean.", 3.45, TORNBERG_BEEF),

  // Beef — Plate & Flank
  "outside-skirt": cut(172162, "EXACT", null, 1.68, TORNBERG_BEEF),
  "inside-skirt": cut(172159, "EXACT", null, 1.52, TORNBERG_BEEF),
  hanger: cut(172162, "PROXY", "No hanger steak record exists. The hanger is the crus of the diaphragm. The outside skirt is the costal diaphragm, the nearest muscle USDA analysed.", 1.38, TORNBERG_BEEF),
  "flank-steak": cut(169433, "EXACT", null, 1.48, TORNBERG_BEEF),

  // Pork
  "boston-butt": cut(167849, "EXACT", "Published as blade steaks cut from the Boston butt.", 2.45, LAWRIE_PORK_LAMB),
  "picnic-roast": cut(168255, "EXACT", null, 2.65, LAWRIE_PORK_LAMB),
  "pork-loin-chop": cut(168238, "EXACT", null, 0.68, LAWRIE_PORK_LAMB, "DERIVED"),
  "pork-tenderloin": cut(168312, "EXACT", null, 0.40, LAWRIE_PORK_LAMB),
  "baby-back-ribs": cut(168299, "EXACT", null, 2.25, LAWRIE_PORK_LAMB),
  "spare-ribs": cut(167853, "EXACT", "St. Louis ribs are spareribs trimmed square. The record is the untrimmed sparerib.", 2.50, LAWRIE_PORK_LAMB),
  "pork-belly": cut(167812, "EXACT", null, 2.75, LAWRIE_PORK_LAMB),
  "fresh-ham": cut(168222, "EXACT", null, 1.65, LAWRIE_PORK_LAMB),
  "pork-hock": cut(168226, "PROXY", "No fresh pork hock record exists. The nearest raw record is the fresh ham shank half (lean and fat, no skin), the part of the leg the hind hock is cut from.", 3.60, LAWRIE_PORK_LAMB),

  // Lamb (SR Legacy names domestic lamb without the word "domestic")
  "lamb-shoulder-roast": cut(172553, "EXACT", null, 2.35, LAWRIE_PORK_LAMB),
  "rack-of-lamb": cut(174377, "EXACT", null, 0.88, LAWRIE_PORK_LAMB),
  "lamb-loin-chop": cut(172551, "EXACT", null, 0.72, LAWRIE_PORK_LAMB),
  "leg-of-lamb": cut(174372, "EXACT", null, 1.32, LAWRIE_PORK_LAMB),
  "lamb-shank": cut(172547, "EXACT", null, 3.25, LAWRIE_PORK_LAMB),
  "lamb-breast": cut(172631, "PROXY", "No domestic lamb breast record exists. The nearest raw lean-and-fat record is New Zealand lamb flap, the boneless breast.", 2.40, LAWRIE_PORK_LAMB),

  // Poultry (Chicken)
  "breast-supreme": cut(171077, "EXACT", "Pectoralis major without skin. Skin-on breast is FDC 171474.", 0.45, POULTRY_FISH_LIT, "DERIVED"),
  "chicken-tenderloin": cut(171077, "PROXY", "No tenderloin record exists. The tenderloin (pectoralis minor) uses the skinless breast meat (pectoralis major).", 0.35, POULTRY_FISH_LIT),
  "chicken-thigh": cut(172385, "EXACT", null, 1.45, POULTRY_FISH_LIT),
  "chicken-drumstick": cut(172373, "EXACT", null, 2.15, POULTRY_FISH_LIT),
  "chicken-wing": cut(172390, "EXACT", null, 2.35, POULTRY_FISH_LIT),
  "chicken-oyster": cut(171073, "PROXY", "No oyster record exists. The oyster sits in the hollow of the ilium, which USDA counts as part of the back. This is the back's meat-only record.", 1.25, POULTRY_FISH_LIT),
  "carcass-back": cut(171469, "EXACT", "Edible tissue only. Bone and cartilage are not in the record.", 3.10, POULTRY_FISH_LIT),

  // Finfish (Atlantic Salmon)
  "collar-kama": cut(175167, "PROXY", SALMON_FILLET_PROXY, 1.15, POULTRY_FISH_LIT),
  "loin-top": cut(175167, "PROXY", SALMON_FILLET_PROXY, 0.45, POULTRY_FISH_LIT),
  "center-fillet": cut(175167, "PROXY", SALMON_FILLET_PROXY, 0.50, POULTRY_FISH_LIT),
  "belly-toro": cut(175167, "PROXY", SALMON_FILLET_PROXY, 0.62, POULTRY_FISH_LIT),
  "tail-piece": cut(175167, "PROXY", SALMON_FILLET_PROXY, 0.72, POULTRY_FISH_LIT),
};
