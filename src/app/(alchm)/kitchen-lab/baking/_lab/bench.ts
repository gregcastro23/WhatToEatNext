/**
 * What is on the Baking Lab's bench, decided from the URL's `?good=` and the
 * catalogue — pure, so the page's every state can be tested without a render.
 *
 * - bake:    a good the lab simulates (a curated formula or a simulable recipe);
 * - refused: a site recipe the lab will not simulate: its reasons, no numbers;
 * - loading: the recipe file is still arriving;
 * - unknown: no such good (or the file failed): the default is baked instead,
 *            and every tab says so.
 *
 * @file src/app/(alchm)/kitchen-lab/baking/_lab/bench.ts
 */
import type { BakingPreset } from "@/lib/baking/formulaTypes";
import { CURATED_PRESETS, presetOf, type CatalogueEntry } from "@/lib/baking/recipes/catalogue";
import { DEFAULT_GOOD_ID, type BakingTab } from "../bakingTabs";

export type Bench =
  | { kind: "bake"; entry: CatalogueEntry }
  | { kind: "refused"; entry: Extract<CatalogueEntry, { kind: "recipe" }> }
  | { kind: "loading"; id: string }
  | { kind: "unknown"; id: string; why: string };

export type LoadStatus = "loading" | "ready" | "failed";

/** The default good, which the lab opens on and falls back to. */
export function defaultPreset(): BakingPreset {
  const found = CURATED_PRESETS.find((p) => p.id === DEFAULT_GOOD_ID);
  if (found === undefined) throw new RangeError(`the default good "${DEFAULT_GOOD_ID}" is not curated`);
  return found;
}

export function benchFor(goodId: string, entries: readonly CatalogueEntry[], status: LoadStatus): Bench {
  const entry = entries.find((e) => e.id === goodId);
  if (entry === undefined) {
    if (status === "loading") return { kind: "loading", id: goodId };
    const why = status === "failed" ? `The site's recipes did not load, so “${goodId}” cannot be found` : `No bakeable good is named “${goodId}”`;
    return { kind: "unknown", id: goodId, why };
  }
  if (entry.kind === "recipe" && entry.converted.preset === null) return { kind: "refused", entry };
  return { kind: "bake", entry };
}

/** The lab inputs the bench needs loaded, or null when it shows no bake (refused, loading). */
export function presetToLoad(bench: Bench): BakingPreset | null {
  if (bench.kind === "bake") return presetOf(bench.entry);
  return bench.kind === "unknown" ? defaultPreset() : null;
}

/** The id of the good whose name the bench shows: a refused recipe's own, else what the lab holds. */
export function benchGoodId(bench: Bench, onLab: string): string {
  return bench.kind === "refused" ? bench.entry.id : onLab;
}

/** The real-physics telemetry HUD: never beside the alchm tab, a refusal, or a good still loading. */
export function showsHud(tab: BakingTab, bench: Bench): boolean {
  return tab !== "elements" && bench.kind !== "refused" && bench.kind !== "loading";
}

/** The notice every tab shows when the URL's good could not be put on the bench. */
export function benchNotice(bench: Bench): string | null {
  return bench.kind === "unknown" ? `${bench.why}: the lab opened the ${defaultPreset().name.toLowerCase()} instead.` : null;
}
