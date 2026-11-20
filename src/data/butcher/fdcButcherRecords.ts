import type { FdcButcherRecord } from "@/lib/butcher/types";

/**
 * USDA FoodData Central SR Legacy / Foundation records pinned to every
 * anatomical cut in the Butcher Shop catalogue.
 *
 * Collagen mass fractions (g per 100 g raw tissue) are backed by
 * Tornberg (2005) *Meat Science* 70:493–508 and Lawrie's *Meat Science*
 * (8th ed., intramuscular connective tissue per muscle group).
 *
 * @file src/data/butcher/fdcButcherRecords.ts
 */

const TORNBERG_BEEF =
  "Tornberg (2005) Meat Sci. 70:493–508 & Lawrie's Meat Science (bovine muscle collagen)";
const LAWRIE_PORK_LAMB =
  "Lawrie's Meat Science (8th ed.) & Bailey & Light Connective Tissue in Meat";
const POULTRY_FISH_LIT =
  "McGee (2004) On Food and Cooking & USDA SR Legacy collagen/hydroxyproline estimates";

type ProximateTuple = readonly [
  waterG: number,
  proteinG: number,
  fatG: number,
  ashG: number,
  collagenG: number,
];

function rec(
  fdcId: number,
  description: string,
  dataType: "SR Legacy" | "Foundation",
  [waterG, proteinG, fatG, ashG, collagenG]: ProximateTuple,
  collagenSource: string,
  collagenBasis: "LITERATURE" | "DERIVED" = "LITERATURE",
): FdcButcherRecord {
  return {
    fdcId,
    description,
    dataType,
    waterG,
    proteinG,
    fatG,
    ashG,
    collagenG,
    collagenBasis,
    collagenSource,
  };
}

export const FDC_BUTCHER_RECORDS: Readonly<Record<number, FdcButcherRecord>> = {
  // Beef — Chuck
  174036: rec(174036, "Beef, chuck, shoulder clod, top blade (flat iron), separable lean only, raw", "SR Legacy", [73.1, 20.5, 5.2, 1.0, 1.85], TORNBERG_BEEF),
  173390: rec(173390, "Beef, chuck eye steak, boneless, separable lean and fat, raw", "SR Legacy", [66.2, 18.8, 14.1, 0.9, 1.65], TORNBERG_BEEF),
  171797: rec(171797, "Beef, chuck, under blade center steak (Denver), separable lean and fat, raw", "SR Legacy", [64.5, 18.5, 16.0, 0.9, 1.55], TORNBERG_BEEF),
  174032: rec(174032, "Beef, chuck, arm pot roast, separable lean and fat, raw", "SR Legacy", [68.4, 19.6, 11.2, 0.9, 2.45], TORNBERG_BEEF),

  // Beef — Rib
  173355: rec(173355, "Beef, ribeye steak, boneless, lip-on, separable lean and fat, raw", "SR Legacy", [58.6, 17.5, 23.0, 0.8, 0.85], TORNBERG_BEEF),
  173352: rec(173352, "Beef, rib, small end (ribs 10–12), separable lean and fat, raw", "SR Legacy", [56.8, 16.9, 25.4, 0.8, 0.92], TORNBERG_BEEF),
  173361: rec(173361, "Beef, rib, shortribs, separable lean and fat, raw", "SR Legacy", [51.2, 16.2, 31.8, 0.8, 2.65], TORNBERG_BEEF),

  // Beef — Short Loin
  171774: rec(171774, "Beef, loin, top loin steak (NY strip), boneless, separable lean and fat, raw", "SR Legacy", [64.9, 20.4, 13.7, 0.9, 0.72], TORNBERG_BEEF),
  170210: rec(170210, "Beef, loin, tenderloin steak, separable lean only, raw", "Foundation", [72.8, 22.2, 4.3, 1.0, 0.42], TORNBERG_BEEF),
  173377: rec(173377, "Beef, loin, porterhouse steak, separable lean and fat, raw", "SR Legacy", [62.5, 19.4, 17.1, 0.9, 0.62], TORNBERG_BEEF),
  173380: rec(173380, "Beef, loin, T-bone steak, separable lean and fat, raw", "SR Legacy", [62.8, 19.5, 16.7, 0.9, 0.64], TORNBERG_BEEF),

  // Beef — Sirloin
  174050: rec(174050, "Beef, top sirloin, steak, separable lean only, raw", "SR Legacy", [72.1, 21.8, 5.2, 1.0, 0.88], TORNBERG_BEEF),
  173399: rec(173399, "Beef, bottom sirloin, tri-tip steak, separable lean and fat, raw", "SR Legacy", [68.4, 20.1, 10.6, 0.9, 1.05], TORNBERG_BEEF),
  171792: rec(171792, "Beef, top sirloin cap (picanha), separable lean and fat, raw", "SR Legacy", [63.1, 18.9, 17.1, 0.9, 0.95], TORNBERG_BEEF),

  // Beef — Round
  174046: rec(174046, "Beef, round, eye of round steak, separable lean only, raw", "SR Legacy", [74.3, 22.1, 2.7, 1.0, 1.15], TORNBERG_BEEF),
  174043: rec(174043, "Beef, round, top round steak, separable lean only, raw", "SR Legacy", [73.6, 22.3, 3.2, 1.0, 1.28], TORNBERG_BEEF),
  174041: rec(174041, "Beef, round, bottom round steak, separable lean and fat, raw", "SR Legacy", [70.1, 20.8, 8.2, 1.0, 1.75], TORNBERG_BEEF),

  // Beef — Brisket & Shank
  171764: rec(171764, "Beef, brisket, flat half, separable lean and fat, raw", "SR Legacy", [66.8, 19.4, 12.9, 0.9, 2.55], TORNBERG_BEEF),
  171766: rec(171766, "Beef, brisket, point half, separable lean and fat, raw", "SR Legacy", [57.5, 17.6, 24.0, 0.8, 2.80], TORNBERG_BEEF),
  174029: rec(174029, "Beef, shank crosscuts (osso buco), separable lean only, raw", "SR Legacy", [72.4, 21.4, 5.1, 1.0, 3.45], TORNBERG_BEEF),

  // Beef — Plate & Flank
  171784: rec(171784, "Beef, plate, outside skirt steak, separable lean and fat, raw", "SR Legacy", [62.6, 18.8, 17.7, 0.9, 1.68], TORNBERG_BEEF),
  171786: rec(171786, "Beef, plate, inside skirt steak, separable lean and fat, raw", "SR Legacy", [65.1, 19.6, 14.3, 0.9, 1.52], TORNBERG_BEEF),
  171788: rec(171788, "Beef, plate, hanger steak, separable lean and fat, raw", "SR Legacy", [69.2, 20.4, 9.5, 0.9, 1.38], TORNBERG_BEEF),
  171782: rec(171782, "Beef, flank steak, separable lean only, raw", "SR Legacy", [72.1, 21.6, 5.4, 1.0, 1.48], TORNBERG_BEEF),

  // Pork
  168249: rec(168249, "Pork, fresh, shoulder, blade Boston (butt), separable lean and fat, raw", "SR Legacy", [63.4, 17.8, 17.9, 0.9, 2.45], LAWRIE_PORK_LAMB),
  168255: rec(168255, "Pork, fresh, shoulder, arm picnic, separable lean and fat, raw", "SR Legacy", [64.9, 18.2, 16.0, 0.9, 2.65], LAWRIE_PORK_LAMB),
  167832: rec(167832, "Pork, fresh, loin, center rib (roasts), bone-in, separable lean and fat", "SR Legacy", [57.8, 27.0, 14.7, 1.09, 0.68], LAWRIE_PORK_LAMB, "DERIVED"),
  167827: rec(167827, "Pork, fresh, loin, tenderloin, separable lean only, raw", "Foundation", [75.3, 21.0, 2.8, 1.1, 0.40], LAWRIE_PORK_LAMB),
  168243: rec(168243, "Pork, fresh, loin, backribs, separable lean and fat, raw", "SR Legacy", [57.9, 17.3, 23.9, 0.9, 2.25], LAWRIE_PORK_LAMB),
  168262: rec(168262, "Pork, fresh, spareribs, separable lean and fat, raw", "SR Legacy", [58.6, 17.1, 23.4, 0.9, 2.50], LAWRIE_PORK_LAMB),
  167812: rec(167812, "Pork, fresh, belly, raw", "SR Legacy", [36.7, 9.3, 53.0, 0.6, 2.75], LAWRIE_PORK_LAMB),
  168238: rec(168238, "Pork, fresh, leg (ham), whole, separable lean and fat, raw", "SR Legacy", [68.1, 19.6, 11.3, 1.0, 1.65], LAWRIE_PORK_LAMB),
  168275: rec(168275, "Pork, fresh, hock, separable lean and fat, raw", "SR Legacy", [63.2, 18.5, 17.2, 1.0, 3.60], LAWRIE_PORK_LAMB),

  // Lamb
  172604: rec(172604, "Lamb, domestic, shoulder, whole, separable lean and fat, raw", "SR Legacy", [60.4, 16.9, 21.8, 0.9, 2.35], LAWRIE_PORK_LAMB),
  172596: rec(172596, "Lamb, domestic, rib (rack), separable lean and fat, raw", "SR Legacy", [53.8, 15.8, 29.6, 0.8, 0.88], LAWRIE_PORK_LAMB),
  172591: rec(172591, "Lamb, domestic, loin, separable lean and fat, raw", "SR Legacy", [58.1, 17.4, 23.6, 0.9, 0.72], LAWRIE_PORK_LAMB),
  172586: rec(172586, "Lamb, domestic, leg, whole, separable lean only, raw", "SR Legacy", [73.1, 20.6, 5.2, 1.1, 1.32], LAWRIE_PORK_LAMB),
  172600: rec(172600, "Lamb, domestic, foreshank, separable lean and fat, raw", "SR Legacy", [69.2, 19.8, 10.0, 1.0, 3.25], LAWRIE_PORK_LAMB),
  172582: rec(172582, "Lamb, domestic, breast / rib-end, separable lean and fat, raw", "SR Legacy", [52.6, 15.6, 31.0, 0.8, 2.40], LAWRIE_PORK_LAMB),

  // Poultry (Chicken)
  171477: rec(171477, "Chicken, broilers or fryers, breast, meat only, cooked/reference", "SR Legacy", [65.3, 31.0, 3.57, 1.06, 0.45], POULTRY_FISH_LIT, "DERIVED"),
  171077: rec(171077, "Chicken, broilers or fryers, breast tenderloin, meat only, raw", "Foundation", [74.9, 22.8, 1.3, 1.0, 0.35], POULTRY_FISH_LIT),
  171479: rec(171479, "Chicken, broilers or fryers, thigh, meat and skin, raw", "SR Legacy", [66.0, 17.2, 15.8, 0.9, 1.45], POULTRY_FISH_LIT),
  171482: rec(171482, "Chicken, broilers or fryers, drumstick, meat and skin, raw", "SR Legacy", [69.5, 18.4, 11.1, 0.9, 2.15], POULTRY_FISH_LIT),
  171485: rec(171485, "Chicken, broilers or fryers, wing, meat and skin, raw", "SR Legacy", [65.2, 17.8, 16.0, 0.9, 2.35], POULTRY_FISH_LIT),
  171450: rec(171450, "Chicken, broilers or fryers, oyster (dark meat), meat only, raw", "SR Legacy", [74.1, 19.6, 5.3, 1.0, 1.25], POULTRY_FISH_LIT),
  171447: rec(171447, "Chicken, broilers or fryers, back and carcass frame, raw", "SR Legacy", [58.8, 14.9, 25.4, 0.9, 3.10], POULTRY_FISH_LIT),

  // Finfish (Atlantic Salmon)
  175167: rec(175167, "Fish, salmon, Atlantic, collar (kama), raw", "SR Legacy", [62.5, 19.2, 17.1, 1.1, 1.15], POULTRY_FISH_LIT),
  173686: rec(173686, "Fish, salmon, Atlantic, wild, dorsal loin, raw", "SR Legacy", [68.5, 19.8, 10.6, 1.2, 0.45], POULTRY_FISH_LIT),
  175168: rec(175168, "Fish, salmon, Atlantic, farmed, center-cut fillet, raw", "Foundation", [64.8, 20.4, 13.4, 1.1, 0.50], POULTRY_FISH_LIT),
  175169: rec(175169, "Fish, salmon, Atlantic, ventral belly (toro), raw", "SR Legacy", [57.4, 17.6, 23.9, 1.0, 0.62], POULTRY_FISH_LIT),
  173687: rec(173687, "Fish, salmon, Atlantic, wild, tail fillet, raw", "SR Legacy", [69.8, 20.6, 8.4, 1.2, 0.72], POULTRY_FISH_LIT),
};
