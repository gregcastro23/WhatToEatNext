/**
 * The bakeable-goods catalogue as the lab sees it: the curated formulas at
 * once, and the site's baked recipes once their generated file has loaded.
 *
 * The file (public/data/baking-recipe-catalogue.json, written by
 * scripts/generate-baking-catalogue.ts) is fetched rather than bundled, so
 * the page's first load does not carry 370 kB of recipes; it is validated on
 * arrival (parseCatalogueFile), and a failure is shown, never papered over
 * with a partial list.
 *
 * @file src/app/(alchm)/kitchen-lab/baking/_lab/useBakingCatalogue.ts
 */
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/json";
import { curatedEntries, recipeEntries, type CatalogueEntry } from "@/lib/baking/recipes/catalogue";
import { parseCatalogueFile, type CatalogueFile } from "@/lib/baking/recipes/catalogueFile";

export const RECIPE_CATALOGUE_URL = "/data/baking-recipe-catalogue.json";

export type CatalogueLoad = { status: "loading" } | { status: "ready"; file: CatalogueFile } | { status: "failed"; reason: string };

export interface BakingCatalogue {
  entries: readonly CatalogueEntry[];
  load: CatalogueLoad;
}

const CURATED = curatedEntries();

export function useBakingCatalogue(): BakingCatalogue {
  const [load, setLoad] = useState<CatalogueLoad>({ status: "loading" });
  useEffect(() => {
    let live = true;
    fetchJson(RECIPE_CATALOGUE_URL, undefined, parseCatalogueFile)
      .then((file) => {
        if (live) setLoad({ status: "ready", file });
      })
      .catch((error: unknown) => {
        if (live) setLoad({ status: "failed", reason: error instanceof Error ? error.message : String(error) });
      });
    return (): void => {
      live = false;
    };
  }, []);
  const entries = useMemo(() => (load.status === "ready" ? [...CURATED, ...recipeEntries(load.file.sources)] : CURATED), [load]);
  return { entries, load };
}
