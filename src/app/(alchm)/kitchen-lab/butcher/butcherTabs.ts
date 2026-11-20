import type { ComputationalSystem } from "@/config/navigation";
import { getCutById, getSpeciesSpec, isSpeciesId } from "@/data/butcher/cutsCatalogue";
import type { ButcherTab, SpeciesId } from "@/lib/butcher/types";

/**
 * The tabs of `/kitchen-lab/butcher`, the `?species=`, `?cut=`, and `?tab=`
 * URL contract, and which computational system each tab renders.
 *
 * Mirrors `src/app/(alchm)/kitchen-lab/baking/bakingTabs.ts`: four tabs are
 * REAL SI/USDA meat science (`real`); `elements` is the ALCHM projection of
 * the same cut (`alchm`).
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/butcherTabs.ts
 */

export const BUTCHER_TABS: ReadonlyArray<
  readonly [ButcherTab, string, string, ComputationalSystem]
> = [
  [
    "breakdown",
    "Breakdown",
    "3D anatomical primals, marbling, collagen load & USDA proximate telemetry",
    "real",
  ],
  [
    "game",
    "Butcher's Block",
    "Fulfill chef orders: pick the cut, slice across the grain & dial target heat",
    "real",
  ],
  [
    "thermal",
    "Thermal & Grain",
    "Myosin, actin, collagen-to-gelatin kinetics & Warner-Bratzler shear force",
    "real",
  ],
  [
    "elements",
    "Elements",
    "One-way alchm projection: Fire · Water · Earth · Air, ESMS & planets",
    "alchm",
  ],
  [
    "sources",
    "Sources & Recipes",
    "USDA FoodData Central records, kinetic citations & matching site recipes",
    "real",
  ],
];

export const DEFAULT_BUTCHER_TAB: ButcherTab = "breakdown";
export const DEFAULT_SPECIES_ID: SpeciesId = "beef";
export const DEFAULT_CUT_ID = "ribeye";

export function isButcherTab(value: string | null): value is ButcherTab {
  return BUTCHER_TABS.some(([id]) => id === value);
}

export function butcherTabFromParam(value: string | null): ButcherTab {
  return isButcherTab(value) ? value : DEFAULT_BUTCHER_TAB;
}

export function systemForTab(tab: ButcherTab): ComputationalSystem {
  return BUTCHER_TABS.find(([id]) => id === tab)?.[3] ?? "real";
}

export function resolveSpeciesAndCutFromParams(
  speciesParam: string | null,
  cutParam: string | null,
): { readonly speciesId: SpeciesId; readonly cutId: string } {
  const trimmedCut = cutParam?.trim() ?? "";
  const matchedCut = trimmedCut !== "" ? getCutById(trimmedCut) : null;
  if (matchedCut) {
    return { speciesId: matchedCut.speciesId, cutId: matchedCut.id };
  }
  const trimmedSpecies = speciesParam?.trim() ?? "";
  const speciesId: SpeciesId = isSpeciesId(trimmedSpecies)
    ? trimmedSpecies
    : DEFAULT_SPECIES_ID;
  const spec = getSpeciesSpec(speciesId);
  return { speciesId, cutId: spec.defaultCutId };
}

export function butcherHref(
  tab: ButcherTab,
  speciesId: SpeciesId,
  cutId: string,
): string {
  const query = new URLSearchParams();
  if (speciesId !== DEFAULT_SPECIES_ID) query.set("species", speciesId);
  if (cutId !== DEFAULT_CUT_ID) query.set("cut", cutId);
  if (tab !== DEFAULT_BUTCHER_TAB) query.set("tab", tab);
  const qs = query.toString();
  return qs === "" ? "/kitchen-lab/butcher" : `/kitchen-lab/butcher?${qs}`;
}

export function urlForButcherTab(href: string, tab: ButcherTab): string {
  const url = new URL(href);
  if (tab === DEFAULT_BUTCHER_TAB) url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  return url.toString();
}

export function urlForButcherCut(
  href: string,
  speciesId: SpeciesId,
  cutId: string,
): string {
  const url = new URL(href);
  if (speciesId === DEFAULT_SPECIES_ID && cutId === DEFAULT_CUT_ID) {
    url.searchParams.delete("species");
    url.searchParams.delete("cut");
  } else {
    url.searchParams.set("species", speciesId);
    url.searchParams.set("cut", cutId);
  }
  return url.toString();
}
