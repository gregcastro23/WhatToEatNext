"use client";

/**
 * State and reactive scoring hook for the Sauce Pairing Studio.
 *
 * @file src/components/recommendations/sauces/useSauceStudio.ts
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useCurrentSeason } from "@/hooks/useCurrentSeason";
import { usePantry } from "@/hooks/usePantry";
import { useSauceCatalogue, type SauceCatalogueStatus } from "@/hooks/useSauceCatalogue";
import { useUserElementalBias } from "@/hooks/useUserElementalBias";
import { foldKey } from "@/lib/sauces/pairingAliases";
import { computePantryMatch } from "@/lib/sauces/pantryMatch";
import {
  getCuisineFingerprint,
  listCuisines,
  recommendForCuisineContext,
  type CuisineFingerprint,
  type CuisineSauceContext,
  type CuisineSauceResult,
  type FlavorAxis,
  type SauceRole,
} from "@/utils/cuisine/cuisineSauceProfiler";
import type { SaucePreset, SeasonValue } from "./constants";
import type { OriginFilter } from "./SauceResultsColumn";

function resolveCuisineFromList(
  wanted: string | undefined,
  available: ReadonlyArray<{ key: string; name: string }>,
): string {
  const defaultKey = available[0]?.key ?? "Italian";
  const trimmed = wanted?.trim();
  if (!trimmed) return defaultKey;
  const target = foldKey(trimmed);
  const match = available.find((c) => foldKey(c.key) === target || foldKey(c.name) === target);
  return match ? match.key : defaultKey;
}

function syncCuisineQueryParam(nextCuisine: string): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("cuisine") === nextCuisine) return;
    url.searchParams.set("cuisine", nextCuisine);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // Ignore restricted/synthetic URL environments
  }
}

function initialSeasonFrom(detected: string): SeasonValue {
  const lc = detected.toLowerCase();
  if (lc === "spring" || lc === "summer" || lc === "autumn" || lc === "winter") return lc;
  if (lc === "fall") return "autumn";
  return "all";
}

function matchesSearchQuery(result: CuisineSauceResult, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const { sauce } = result;
  const hay = [
    sauce.name,
    sauce.ownerCuisine ?? "",
    sauce.base ?? "",
    sauce.description ?? "",
    ...(sauce.keyIngredients ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((tok) => hay.includes(tok));
}

function matchesOriginFilter(result: CuisineSauceResult, originFilter: OriginFilter): boolean {
  const { origin } = result.sauce;
  if (originFilter === "native") return origin === "mother" || origin === "traditional";
  if (originFilter === "mother") return origin === "mother";
  if (originFilter === "traditional") return origin === "traditional";
  if (originFilter === "global") return origin === "global";
  return true;
}

function computeOriginCounts(
  scored: readonly CuisineSauceResult[],
  searchQuery: string,
): Record<OriginFilter, number> {
  const counts: Record<OriginFilter, number> = {
    all: 0,
    native: 0,
    mother: 0,
    traditional: 0,
    global: 0,
  };
  for (const r of scored) {
    if (!matchesSearchQuery(r, searchQuery)) continue;
    counts.all += 1;
    const { origin } = r.sauce;
    if (origin === "mother") {
      counts.native += 1;
      counts.mother += 1;
    } else if (origin === "traditional") {
      counts.native += 1;
      counts.traditional += 1;
    } else if (origin === "global") {
      counts.global += 1;
    }
  }
  return counts;
}

function filterVisibleResults(
  scored: readonly CuisineSauceResult[],
  originFilter: OriginFilter,
  searchQuery: string,
): CuisineSauceResult[] {
  return scored
    .filter((r) => matchesOriginFilter(r, originFilter) && matchesSearchQuery(r, searchQuery))
    .slice(0, 14);
}

export interface UseSauceStudioReturn {
  catalogueStatus: SauceCatalogueStatus;
  retryCatalogue: () => void;
  availableCuisines: Array<{ key: string; name: string; sauceCount: number }>;
  cuisineKey: string;
  setCuisineKey: (k: string) => void;
  region: string | undefined;
  setRegion: (r: string | undefined) => void;
  fingerprint: CuisineFingerprint | null;
  ingredientSlugs: Record<string, string>;
  protein: string | undefined;
  setProtein: (p: string | undefined) => void;
  vegetable: string | undefined;
  setVegetable: (v: string | undefined) => void;
  cookingMethod: string | undefined;
  setCookingMethod: (m: string | undefined) => void;
  dietary: string[];
  toggleDietary: (d: string) => void;
  flavorTargets: FlavorAxis[];
  toggleFlavor: (f: FlavorAxis) => void;
  role: SauceRole;
  setRole: (r: SauceRole) => void;
  season: SeasonValue;
  setSeason: (s: SeasonValue) => void;
  cosmicSync: boolean;
  toggleCosmicSync: () => void;
  strictCuisine: boolean;
  toggleStrictCuisine: () => void;
  applyUserBias: boolean;
  toggleUserBias: () => void;
  hasUserBias: boolean;
  biasSource: string | null;
  pantryFirst: boolean;
  togglePantryFirst: () => void;
  pantryNames: string[];
  currentZodiac: string;
  planetaryHour: string | null;
  detectedSeason: string;
  isDaytime: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  originFilter: OriginFilter;
  originCounts: Record<OriginFilter, number>;
  setOriginFilter: (f: OriginFilter) => void;
  visibleResults: CuisineSauceResult[];
  hasActiveFilters: boolean;
  applyPreset: (p: SaucePreset) => void;
  resetFilters: () => void;
}

export function useSauceStudio(initialCuisine?: string): UseSauceStudioReturn {
  const { cuisinesMap, ingredientSlugs, status: catalogueStatus, retry: retryCatalogue } = useSauceCatalogue();
  const { items: pantryItems } = usePantry();
  const pantryNames = useMemo(() => pantryItems.map((p) => p.name), [pantryItems]);
  const availableCuisines = useMemo(() => listCuisines(cuisinesMap), [cuisinesMap]);
  const detectedSeason = useCurrentSeason();
  const { isDaytime, planetaryHour, lunarPhase } = useAlchemical();
  const astroState = useAstrologicalState();
  const { bias: userBias, source: biasSource } = useUserElementalBias();

  const [cuisineKey, setCuisineKeyState] = useState<string>(() =>
    resolveCuisineFromList(initialCuisine, availableCuisines),
  );
  const appliedInitialRef = useRef<string | undefined>(initialCuisine);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [protein, setProtein] = useState<string | undefined>(undefined);
  const [vegetable, setVegetable] = useState<string | undefined>(undefined);
  const [cookingMethod, setCookingMethod] = useState<string | undefined>(undefined);
  const [dietary, setDietary] = useState<string[]>([]);
  const [flavorTargets, setFlavorTargets] = useState<FlavorAxis[]>([]);
  const [role, setRole] = useState<SauceRole>("complement");
  const [season, setSeason] = useState<SeasonValue>(() => initialSeasonFrom(detectedSeason));
  const [cosmicSync, setCosmicSync] = useState(true);
  const [strictCuisine, setStrictCuisine] = useState(false);
  const [applyUserBias, setApplyUserBias] = useState(true);
  const [pantryFirst, setPantryFirst] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilterState] = useState<OriginFilter>("all");

  useEffect(() => {
    if (appliedInitialRef.current === initialCuisine) return;
    appliedInitialRef.current = initialCuisine;
    setCuisineKeyState(resolveCuisineFromList(initialCuisine, availableCuisines));
    setRegion(undefined);
  }, [initialCuisine, availableCuisines]);

  const setCuisineKey = useCallback((next: string) => {
    setCuisineKeyState(next);
    setRegion(undefined);
    syncCuisineQueryParam(next);
  }, []);

  const setOriginFilter = useCallback(
    (next: OriginFilter) => {
      setOriginFilterState(next);
      if (next === "global" && strictCuisine) {
        setStrictCuisine(false);
      }
    },
    [strictCuisine],
  );

  const fingerprint = useMemo(() => getCuisineFingerprint(cuisineKey, cuisinesMap), [cuisineKey, cuisinesMap]);

  const ctx: CuisineSauceContext = useMemo(
    () => ({
      cuisine: cuisineKey,
      ...(region ? { region } : {}),
      ...(protein ? { protein } : {}),
      ...(vegetable ? { vegetable } : {}),
      ...(cookingMethod ? { cookingMethod } : {}),
      ...(dietary.length ? { dietary } : {}),
      ...(flavorTargets.length ? { flavorTargets } : {}),
      role,
      season,
      ...(cosmicSync
        ? {
            cosmic: {
              ...(astroState.currentZodiac ? { zodiac: astroState.currentZodiac } : {}),
              ...(planetaryHour ? { planetaryHour } : {}),
              isDaytime,
              ...(lunarPhase ? { lunarPhase } : {}),
            },
            cosmicWeight: 0.5,
          }
        : {}),
      ...(applyUserBias && userBias ? { userElementals: userBias } : {}),
    }),
    [cuisineKey, region, protein, vegetable, cookingMethod, dietary, flavorTargets, role, season, cosmicSync, astroState.currentZodiac, planetaryHour, isDaytime, lunarPhase, applyUserBias, userBias],
  );

  const scoredResults = useMemo(() => {
    const base = recommendForCuisineContext(ctx, { strictCuisine, maxResults: 32 }, cuisinesMap);
    if (!pantryFirst || pantryNames.length === 0) return base;
    return [...base].sort((a, b) => {
      const aRatio = computePantryMatch(a.sauce.keyIngredients ?? [], pantryNames).ratio;
      const bRatio = computePantryMatch(b.sauce.keyIngredients ?? [], pantryNames).ratio;
      return b.score + bRatio * 0.14 - (a.score + aRatio * 0.14);
    });
  }, [ctx, strictCuisine, cuisinesMap, pantryFirst, pantryNames]);

  const originCounts = useMemo(
    () => computeOriginCounts(scoredResults, searchQuery),
    [scoredResults, searchQuery],
  );

  const visibleResults = useMemo(
    () => filterVisibleResults(scoredResults, originFilter, searchQuery),
    [scoredResults, originFilter, searchQuery],
  );

  const toggleDietary = useCallback((key: string) => {
    setDietary((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
  }, []);

  const toggleFlavor = useCallback((key: FlavorAxis) => {
    setFlavorTargets((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  }, []);

  const applyPreset = useCallback((preset: SaucePreset) => {
    setCuisineKeyState(preset.cuisine);
    syncCuisineQueryParam(preset.cuisine);
    setRegion(undefined);
    setProtein(preset.protein);
    setVegetable(preset.vegetable);
    setCookingMethod(preset.cookingMethod);
    setRole(preset.role);
    setFlavorTargets(preset.flavors);
  }, []);

  const resetFilters = useCallback(() => {
    setRegion(undefined);
    setProtein(undefined);
    setVegetable(undefined);
    setCookingMethod(undefined);
    setDietary([]);
    setFlavorTargets([]);
    setRole("complement");
    setSeason("all");
    setStrictCuisine(false);
    setPantryFirst(false);
    setSearchQuery("");
    setOriginFilterState("all");
  }, []);

  const hasActiveFilters =
    [region, protein, vegetable, cookingMethod, searchQuery].some(Boolean) ||
    dietary.length > 0 ||
    flavorTargets.length > 0 ||
    role !== "complement" ||
    strictCuisine ||
    pantryFirst ||
    originFilter !== "all";

  return {
    catalogueStatus, retryCatalogue, availableCuisines, cuisineKey, setCuisineKey, region, setRegion,
    fingerprint, ingredientSlugs, protein, setProtein, vegetable, setVegetable, cookingMethod, setCookingMethod,
    dietary, toggleDietary, flavorTargets, toggleFlavor, role, setRole, season, setSeason,
    cosmicSync, toggleCosmicSync: () => setCosmicSync((v) => !v),
    strictCuisine, toggleStrictCuisine: () => setStrictCuisine((v) => !v),
    applyUserBias, toggleUserBias: () => setApplyUserBias((v) => !v),
    hasUserBias: Boolean(userBias), biasSource,
    pantryFirst, togglePantryFirst: () => setPantryFirst((v) => !v),
    pantryNames, currentZodiac: astroState.currentZodiac, planetaryHour, detectedSeason, isDaytime,
    searchQuery, setSearchQuery, originFilter, originCounts, setOriginFilter, visibleResults, hasActiveFilters,
    applyPreset, resetFilters,
  };
}
