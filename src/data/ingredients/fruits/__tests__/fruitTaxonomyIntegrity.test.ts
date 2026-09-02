import { berries } from "../berries";
import { citrus } from "../citrus";
import { exotic } from "../exotic";
import { fruits } from "../index";
import { melons } from "../melons";
import { pome } from "../pome";
import { _stoneFruit } from "../stoneFruit";
import { tropical } from "../tropical";

/**
 * Guards the fruit taxonomy against silent shadowing.
 *
 * `index.ts` merges the botanical modules with an object spread, which is
 * last-wins and silent: two modules defining the same key produced one record
 * with the other discarded whole, and nothing reported it. That cost the
 * catalog real data - `apple` was served from a 66-leaf record while a
 * 128-leaf one sat discarded in `pome.ts` - and it changed a dietary
 * classification, because `coconut_milk` resolved differently depending on
 * which duplicate won.
 *
 * The related failure is suffix evasion: an author hits a collision, renames
 * the key (`quince` -> `quince_exotic`), and both records live on under one
 * display name. A distinct-KEY count cannot see that; only a distinct-NAME
 * count can. Both are asserted below.
 */

const MODULES: Record<string, Record<string, unknown>> = {
  citrus,
  berries,
  tropical,
  stoneFruit: _stoneFruit,
  pome,
  melons,
  exotic,
};

/**
 * Leaf-value count per key, measured before consolidation on the record the
 * catalog actually served. Consolidation unions records, so every count may
 * rise and none may fall - a drop means a merge dropped data on the floor.
 */
const LEAF_BASELINE: Record<string, number> = {
  acai_berry: 59,
  apple: 66,
  apricot: 61,
  asian_pear: 99,
  avocado: 71,
  banana: 69,
  bergamot: 57,
  blackberry: 60,
  blood_orange: 60,
  blueberry: 67,
  boysenberry: 72,
  breadfruit: 72,
  cactus_pear: 71,
  cantaloupe: 107,
  casaba: 95,
  cherry: 61,
  clementine: 76,
  cloudberry: 73,
  coconut: 70,
  cranberry: 59,
  crenshaw: 91,
  currant_black: 59,
  currant_red: 59,
  custard_apple: 71,
  damson: 61,
  date: 72,
  dragon_fruit: 69,
  durian: 70,
  elderberry: 60,
  feijoa: 70,
  fig: 72,
  finger_lime: 58,
  galia: 91,
  goji_berry: 59,
  gooseberry: 59,
  grape: 72,
  grapefruit: 78,
  greengage: 61,
  guava: 69,
  honeydew: 111,
  jackfruit: 70,
  kiwano: 72,
  kiwi: 71,
  kumquat: 58,
  lemon: 68,
  lime: 76,
  longan: 69,
  loquat: 100,
  lychee: 70,
  mandarin: 68,
  mango: 83,
  medlar: 97,
  mulberry: 59,
  nectarine: 61,
  orange: 69,
  papaya: 70,
  passion_fruit: 70,
  peach: 67,
  pear: 122,
  persian_melon: 91,
  persimmon: 70,
  pineapple: 70,
  plantain: 73,
  plum: 67,
  pomegranate: 72,
  pomelo: 84,
  quince: 111,
  rambutan: 69,
  raspberry: 65,
  sapote: 71,
  starfruit: 69,
  strawberry: 68,
  tamarind: 73,
  tangerine: 59,
  watermelon: 115,
  winter_melon: 95,
  yuzu: 58,
};

const leafCount = (value: unknown): number => {
  if (value === null || value === undefined) return 1;
  if (Array.isArray(value)) return 1;
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).reduce(
      (total: number, child) => total + leafCount(child),
      0,
    );
  }
  return 1;
};

describe("fruit taxonomy integrity", () => {
  it("keeps the botanical modules pairwise disjoint", () => {
    const owner = new Map<string, string>();
    const collisions: string[] = [];

    for (const [moduleName, moduleData] of Object.entries(MODULES)) {
      for (const key of Object.keys(moduleData)) {
        const existing = owner.get(key);
        if (existing) {
          collisions.push(`${key}: ${existing} vs ${moduleName}`);
        } else {
          owner.set(key, moduleName);
        }
      }
    }

    expect(collisions).toEqual([]);
    // Every key reaches the merged catalog exactly once, so the module key
    // total and the merged total must agree. They diverge the moment a key is
    // defined twice - which is precisely what the spread would hide.
    expect(owner.size).toBe(Object.keys(fruits).length);
    expect(owner.size).toBe(77);
  });

  it("gives every record a distinct display name", () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];

    for (const [key, record] of Object.entries(fruits)) {
      const display = String(
        (record as { name?: unknown }).name ?? key,
      )
        .toLowerCase()
        .trim();
      const existing = seen.get(display);
      if (existing) {
        duplicates.push(`"${display}" claimed by both ${existing} and ${key}`);
      } else {
        seen.set(display, key);
      }
    }

    expect(duplicates).toEqual([]);
  });

  it("gives every record the taxonomy fields the module's own lookups read", () => {
    // getFruitsBySubCategory reads `subCategory` and getSeasonalFruits reads
    // `season`. Records missing either are unreachable through them, which is
    // how seven of the most common fruits went missing from both.
    const missing: string[] = [];

    for (const [key, record] of Object.entries(fruits)) {
      const data = record as { subCategory?: unknown; season?: unknown };
      if (typeof data.subCategory !== "string" || !data.subCategory) {
        missing.push(`${key}: subCategory`);
      }
      if (!Array.isArray(data.season) || data.season.length === 0) {
        missing.push(`${key}: season`);
      }
    }

    expect(missing).toEqual([]);
  });

  it("spells the taxonomy key as subCategory, never subcategory", () => {
    // 45 consumer sites read `subCategory`; 13 read `subcategory`. A record
    // carrying only the lowercase spelling is invisible to the majority.
    const lowercased = Object.entries(fruits)
      .filter(([, record]) =>
        Object.prototype.hasOwnProperty.call(record, "subcategory"),
      )
      .map(([key]) => key);

    expect(lowercased).toEqual([]);
  });

  it("does not let any record lose data it had before consolidation", () => {
    const regressions: string[] = [];

    for (const [key, floor] of Object.entries(LEAF_BASELINE)) {
      const record = (fruits as Record<string, unknown>)[key];
      if (record === undefined) {
        regressions.push(`${key}: disappeared from the catalog`);
        continue;
      }
      const current = leafCount(record);
      if (current < floor) {
        regressions.push(`${key}: ${floor} -> ${current} leaf values`);
      }
    }

    expect(regressions).toEqual([]);
  });
});
