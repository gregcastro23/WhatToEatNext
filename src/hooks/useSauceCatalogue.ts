"use client";

/**
 * Shared client hook for loading `/data/sauce-catalogue.json`.
 *
 * Frame 1 renders immediately with all 15 public traditions from
 * `CUISINES_METADATA` so the cuisine selector is never blank, then hydrates
 * native sauces, regional dialects, pairing maps, and ingredient slugs once.
 *
 * @file src/hooks/useSauceCatalogue.ts
 */
import { useCallback, useEffect, useState } from "react";
import { CUISINES_METADATA } from "@/data/cuisines/index";
import { fetchJson } from "@/lib/api/json";
import {
  parseSauceCatalogueFile,
  SAUCE_CATALOGUE_URL,
  type CatalogueCuisineEntry,
  type SauceCatalogueFile,
} from "@/lib/sauces/catalogueFile";

export type SauceCatalogueStatus = "loading" | "ready" | "failed";

export interface UseSauceCatalogueResult {
  cuisinesMap: Record<string, CatalogueCuisineEntry>;
  ingredientSlugs: Record<string, string>;
  status: SauceCatalogueStatus;
  error: string | null;
  retry: () => void;
}

const EMPTY_PAIRINGS = {
  forProtein: {},
  forVegetable: {},
  forCookingMethod: {},
  byAstrological: {},
  byDietary: {},
  byRegion: {},
};

function buildMetadataFallback(): Record<string, CatalogueCuisineEntry> {
  const out: Record<string, CatalogueCuisineEntry> = {};
  for (const [key, meta] of Object.entries(CUISINES_METADATA)) {
    const displayName = meta.name ?? key;
    const ep = meta.elementalProperties;
    out[displayName] = {
      id: key.toLowerCase(),
      name: displayName,
      description: meta.description ?? "",
      elementalProperties: ep
        ? { Fire: ep.Fire, Water: ep.Water, Earth: ep.Earth, Air: ep.Air }
        : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      motherSauces: {},
      traditionalSauces: {},
      sauceRecommender: EMPTY_PAIRINGS,
      regionalCuisines: [],
      astrologicalInfluences: [],
    };
  }
  return out;
}

const METADATA_FALLBACK = buildMetadataFallback();
let cachedCatalogue: SauceCatalogueFile | null = null;
let inflightCatalogue: Promise<SauceCatalogueFile> | null = null;

function loadCatalogueOnce(): Promise<SauceCatalogueFile> {
  if (cachedCatalogue) return Promise.resolve(cachedCatalogue);
  inflightCatalogue ??= fetchJson(SAUCE_CATALOGUE_URL, undefined, parseSauceCatalogueFile)
    .then((file) => {
      cachedCatalogue = file;
      inflightCatalogue = null;
      return file;
    })
    .catch((err: unknown) => {
      inflightCatalogue = null;
      throw err;
    });
  return inflightCatalogue;
}

/** Test-only reset for shared module cache across Jest cases. */
export function _resetSauceCatalogueCacheForTests(): void {
  cachedCatalogue = null;
  inflightCatalogue = null;
}

export function useSauceCatalogue(): UseSauceCatalogueResult {
  const [file, setFile] = useState<SauceCatalogueFile | null>(() => cachedCatalogue);
  const [status, setStatus] = useState<SauceCatalogueStatus>(() =>
    cachedCatalogue ? "ready" : "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadCatalogueOnce()
      .then((loaded) => {
        if (!active) return;
        setFile(loaded);
        setStatus("ready");
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setStatus("failed");
        setError(err instanceof Error ? err.message : String(err));
      });
    return (): void => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    cachedCatalogue = null;
    inflightCatalogue = null;
    setStatus("loading");
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return {
    cuisinesMap: file ? file.cuisines : METADATA_FALLBACK,
    ingredientSlugs: file ? file.ingredientSlugs : {},
    status,
    error,
    retry,
  };
}
