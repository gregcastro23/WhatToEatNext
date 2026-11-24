import { CITED_TIPS, HOUSE_TIPS, METHOD_TIP_PICKS } from "@/data/kitchenTips";

/**
 * Which kitchen tips the homepage strip shows on a given day.
 *
 * The pool interleaves its sources round-robin (each method, then the cited
 * food-safety tips, then the house tips), so neighbouring tips rarely come from
 * the same place. Each local calendar day takes the next TIPS_PER_DAY tips from
 * the pool, so everyone in a timezone sees the same tips on the same day and the
 * whole pool comes round before any tip repeats.
 */

export type TipBasis = "method" | "cited" | "house";

export interface TipLink {
  href: string;
  label: string;
  external: boolean;
}

export interface KitchenTip {
  id: string;
  text: string;
  basis: TipBasis;
  link: TipLink;
}

/** How many tips rotate through the strip on one day. */
export const TIPS_PER_DAY = 5;
/** How long each tip stays up while the strip rotates. */
export const TIP_ROTATE_MS = 8_000;
const MS_PER_DAY = 86_400_000;

/** The data quotes method tips verbatim, without a closing period. */
function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function methodGroups(): KitchenTip[][] {
  return Object.entries(METHOD_TIP_PICKS).map(([method, tips]) =>
    tips.map(
      (text, i): KitchenTip => ({
        id: `${method}-${i}`,
        text: sentence(text),
        basis: "method",
        link: { href: `/cooking-methods/${method}`, label: capitalize(method), external: false },
      }),
    ),
  );
}

function citedGroup(): KitchenTip[] {
  return CITED_TIPS.map(
    (tip, i): KitchenTip => ({
      id: `cited-${i}`,
      text: sentence(tip.text),
      basis: "cited",
      link: { href: tip.url, label: tip.source, external: true },
    }),
  );
}

function houseGroup(): KitchenTip[] {
  return HOUSE_TIPS.map(
    (tip, i): KitchenTip => ({
      id: `house-${i}`,
      text: sentence(tip.text),
      basis: "house",
      link: { href: tip.href, label: tip.linkLabel, external: false },
    }),
  );
}

/** Round-robin across groups: the first of each, then the second of each, and so on. */
export function interleave<T>(groups: ReadonlyArray<readonly T[]>): T[] {
  const out: T[] = [];
  const longest = Math.max(0, ...groups.map((group) => group.length));
  for (let i = 0; i < longest; i++) {
    for (const group of groups) {
      const item = group[i];
      if (item !== undefined) out.push(item);
    }
  }
  return out;
}

export const KITCHEN_TIPS: readonly KitchenTip[] = interleave([
  ...methodGroups(),
  citedGroup(),
  houseGroup(),
]);

/** The LOCAL calendar date as a day count, so the tips turn over at the visitor's midnight. */
export function localDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

/** One day's tips: TIPS_PER_DAY in a row, starting where the previous day's ended. */
export function tipsForDay(day: number, pool: readonly KitchenTip[] = KITCHEN_TIPS): KitchenTip[] {
  const count = Math.min(TIPS_PER_DAY, pool.length);
  if (count === 0) return [];
  const start = (((day * count) % pool.length) + pool.length) % pool.length;
  const tips: KitchenTip[] = [];
  for (let i = 0; i < count; i++) {
    const tip = pool[(start + i) % pool.length];
    if (tip) tips.push(tip);
  }
  return tips;
}
