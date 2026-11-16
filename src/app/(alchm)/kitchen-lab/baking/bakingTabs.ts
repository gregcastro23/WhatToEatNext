/**
 * The tabs of /kitchen-lab/baking, the `?tab=` contract, and which
 * computational system each tab renders.
 *
 * Four tabs are REAL physics; `elements` is the ALCHM projection of the same
 * formula. They are tabs rather than one mixed dashboard because the nav model
 * forbids a mixed surface (src/config/navigation.ts): a reader must always
 * know which system a number belongs to, and the banner switches with the tab.
 *
 * @file src/app/(alchm)/kitchen-lab/baking/bakingTabs.ts
 */
import type { ComputationalSystem } from "@/config/navigation";

export type BakingTab = "formula" | "swap" | "oven" | "elements" | "sources";

export const BAKING_TABS: ReadonlyArray<[BakingTab, string, string, ComputationalSystem]> = [
  ["formula", "Formula", "Grams, baker's percentages, true hydration and the limiting-ingredient scaler", "real"],
  ["swap", "Swap & patch", "Substitute an ingredient, see what broke, and apply the counter-balance patch", "real"],
  ["oven", "Oven simulator", "Core and crust through the five thermal zones, minute by minute", "real"],
  ["elements", "Elements", "The same formula read as Fire, Water, Earth and Air", "alchm"],
  ["sources", "Sources", "Every value's basis: FDC records, citations, and declared model choices", "real"],
];

export const DEFAULT_BAKING_TAB: BakingTab = "formula";

export function isBakingTab(value: string | null): value is BakingTab {
  return BAKING_TABS.some(([id]) => id === value);
}

/** The tab a `?tab=` value names; anything unknown or absent is the formula. */
export function bakingTabFromParam(value: string | null): BakingTab {
  return isBakingTab(value) ? value : DEFAULT_BAKING_TAB;
}

export function systemForTab(tab: BakingTab): ComputationalSystem {
  return BAKING_TABS.find(([id]) => id === tab)?.[3] ?? "real";
}

/** The URL for a tab: the default tab drops the parameter, others set it; other parameters survive. */
export function urlForBakingTab(href: string, tab: BakingTab): string {
  const url = new URL(href);
  if (tab === DEFAULT_BAKING_TAB) url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  return url.toString();
}

/**
 * The `?good=` contract: the good on the bench, by catalogue id — a curated
 * formula's id ("brioche-loaf") or a served recipe's static id
 * ("american-dessert-all-authentic-chocolate-chip-cookies"), so a shared link
 * opens the same good. The default good drops the parameter; the canonical
 * stays /kitchen-lab/baking (layout.tsx).
 */
export const DEFAULT_GOOD_ID = "sourdough-country-loaf";

/** The good a `?good=` value names; absent or blank is the default. Whether the id exists is the catalogue's question. */
export function goodFromParam(value: string | null): string {
  const id = value?.trim() ?? "";
  return id === "" ? DEFAULT_GOOD_ID : id;
}

/** A same-page link to a tab of a good, in the same contract (defaults drop their parameter). */
export function bakingHref(tab: BakingTab, goodId: string): string {
  const query = new URLSearchParams();
  if (goodId !== DEFAULT_GOOD_ID) query.set("good", goodId);
  if (tab !== DEFAULT_BAKING_TAB) query.set("tab", tab);
  const qs = query.toString();
  return qs === "" ? "/kitchen-lab/baking" : `/kitchen-lab/baking?${qs}`;
}

/** The URL for a good: the default good drops the parameter, others set it; `?tab=` and every other parameter survive. */
export function urlForBakingGood(href: string, goodId: string): string {
  const url = new URL(href);
  if (goodId === DEFAULT_GOOD_ID) url.searchParams.delete("good");
  else url.searchParams.set("good", goodId);
  return url.toString();
}
