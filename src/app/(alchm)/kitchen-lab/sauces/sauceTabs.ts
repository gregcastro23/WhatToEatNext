/**
 * Tabs and URL contract (`?tab=`, `?sauce=`, `?cuisine=`) for `/kitchen-lab/sauces`.
 *
 * Mirrors `bakingTabs.ts` and `butcherTabs.ts`: Real Physics tabs (`emulsion`,
 * `reduction`, `sources`) and Alchm Model tabs (`pairing`, `lineage`) stay strictly
 * separated under their `<SystemBadge />`.
 *
 * @file src/app/(alchm)/kitchen-lab/sauces/sauceTabs.ts
 */
import type { ComputationalSystem } from "@/config/navigation";
import { DEFAULT_SAUCE_PRESET_ID } from "@/lib/sauces/physics/presets";

export type SauceLabTab = "emulsion" | "reduction" | "pairing" | "lineage" | "sources";

export const SAUCE_TABS: ReadonlyArray<readonly [SauceLabTab, string, string, ComputationalSystem]> = [
  ["emulsion", "Emulsion & Body", "Fat phase φ, Krieger–Dougherty viscosity, starch gelatinisation & thermal stability", "real"],
  ["reduction", "Reduction & Pan", "Evaporation mass balance, Fleagle & Andreas h_fg, salinity multiplier & boiling elevation", "real"],
  ["pairing", "Pairing Studio", "15 culinary traditions, 83 native sauces, 4-element vector resonance & cosmic transits", "alchm"],
  ["lineage", "Phylogeny Forest", "Cross-cuisine evolutionary lineage of mother sauces, divergence & fusion bridges", "alchm"],
  ["sources", "Sources", "Every physical correlation's citation, confidence tier, and declared model boundaries", "real"],
];

export const DEFAULT_SAUCE_TAB: SauceLabTab = "emulsion";

export function isSauceLabTab(value: string | null): value is SauceLabTab {
  return SAUCE_TABS.some(([id]) => id === value);
}

export function sauceTabFromParam(value: string | null): SauceLabTab {
  return isSauceLabTab(value) ? value : DEFAULT_SAUCE_TAB;
}

export function systemForTab(tab: SauceLabTab): ComputationalSystem {
  return SAUCE_TABS.find(([id]) => id === tab)?.[3] ?? "real";
}

export function urlForSauceTab(href: string, tab: SauceLabTab): string {
  const url = new URL(href);
  if (tab === DEFAULT_SAUCE_TAB) url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  return url.toString();
}

export function urlForSaucePreset(href: string, presetId: string): string {
  const url = new URL(href);
  if (presetId === DEFAULT_SAUCE_PRESET_ID) url.searchParams.delete("sauce");
  else url.searchParams.set("sauce", presetId);
  return url.toString();
}

export function sauceLabHref(tab: SauceLabTab, presetId = DEFAULT_SAUCE_PRESET_ID): string {
  const query = new URLSearchParams();
  if (presetId !== DEFAULT_SAUCE_PRESET_ID) query.set("sauce", presetId);
  if (tab !== DEFAULT_SAUCE_TAB) query.set("tab", tab);
  const qs = query.toString();
  return qs === "" ? "/kitchen-lab/sauces" : `/kitchen-lab/sauces?${qs}`;
}
