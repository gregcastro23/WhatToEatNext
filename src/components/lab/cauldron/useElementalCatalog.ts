"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { fetchJson } from "@/lib/api/json";
import type { IngredientElementalCatalog } from "@/utils/cauldronVesselCore";

/**
 * The cauldron's ingredient lookup, fetched once per page load.
 *
 * `null` while loading; `"unavailable"` if the request or the shape check
 * fails — the simulator then says so and offers a retry, rather than silently
 * treating every ingredient as the neutral 25/25/25/25 blend.
 *
 * @file src/components/lab/cauldron/useElementalCatalog.ts
 */

const ElementalSchema = z.object({
  Fire: z.number(),
  Water: z.number(),
  Earth: z.number(),
  Air: z.number(),
});

export const CatalogResponseSchema = z.object({
  catalog: z.record(z.string(), ElementalSchema),
});

export type CatalogState = IngredientElementalCatalog | null | "unavailable";

export interface ElementalCatalogHandle {
  catalog: CatalogState;
  retry: () => void;
}

export function useElementalCatalog(): ElementalCatalogHandle {
  const [catalog, setCatalog] = useState<CatalogState>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchJson("/api/cauldron/elemental-catalog", undefined, (v) => CatalogResponseSchema.parse(v))
      .then((body) => {
        if (!cancelled) setCatalog(body.catalog);
      })
      .catch(() => {
        if (!cancelled) setCatalog("unavailable");
      });
    return (): void => {
      cancelled = true;
    };
  }, [attempt]);
  const retry = useCallback((): void => {
    setCatalog(null);
    setAttempt((n) => n + 1);
  }, []);
  return { catalog, retry };
}
