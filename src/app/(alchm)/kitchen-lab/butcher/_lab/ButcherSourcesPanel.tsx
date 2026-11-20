"use client";

import Link from "next/link";
import { useEffect, useState, type JSX } from "react";
import { z } from "zod";
import { BUTCHER_CUTS, SPECIES_LIST, getFdcRecordForCut } from "@/data/butcher/cutsCatalogue";
import { dscReferenceSummary } from "@/lib/butcher/science/thermalProfiles";
import type { SpeciesId } from "@/lib/butcher/types";
import type { ButcherLabState } from "./useButcherLab";

type ResolvedFdcRecord = NonNullable<ReturnType<typeof getFdcRecordForCut>>;

/**
 * Tab 5 — `Sources & Recipes`: USDA FDC citation table + live clickable site
 * recipe cards matching the active cut.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButcherSourcesPanel.tsx
 */

const RecipeSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cuisine: z.string().optional(),
  description: z.string().optional(),
});

const RecipesResponseSchema = z.object({
  success: z.boolean(),
  recipes: z.array(RecipeSummarySchema),
});

type RecipeMatchSummary = z.infer<typeof RecipeSummarySchema>;

function useMatchingRecipes(query: string): {
  readonly recipes: readonly RecipeMatchSummary[];
  readonly loading: boolean;
} {
  const [recipes, setRecipes] = useState<readonly RecipeMatchSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/recipes?q=${encodeURIComponent(query)}&limit=6`)
      .then(async (res) => {
        if (!res.ok) return [];
        const raw: unknown = await res.json();
        const parsed = RecipesResponseSchema.safeParse(raw);
        return parsed.success ? parsed.data.recipes : [];
      })
      .then((list) => {
        if (!cancelled) {
          setRecipes(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecipes([]);
          setLoading(false);
        }
      });
    return (): void => {
      cancelled = true;
    };
  }, [query]);

  return { recipes, loading };
}

function FdcCitationTable({
  fdc,
  speciesId,
}: {
  readonly fdc: ResolvedFdcRecord;
  readonly speciesId: SpeciesId;
}): JSX.Element {
  return (
    <table className="bt-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Measured Value</th>
          <th>Basis &amp; Provenance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>FDC Record</td>
          <td className="bt-num">
            <a href={`https://fdc.nal.usda.gov/food-details/${fdc.fdcId}/nutrients`} target="_blank" rel="noreferrer" className="underline">
              FDC {fdc.fdcId}
            </a>
          </td>
          <td className="text-xs text-white/70">{fdc.description} ({fdc.dataType})</td>
        </tr>
        <tr>
          <td>Proximate Composition (per 100 g)</td>
          <td className="bt-num">W {fdc.waterG} · P {fdc.proteinG} · F {fdc.fatG} · A {fdc.ashG} g</td>
          <td className="text-xs text-white/70">
            Measured mass sum: {(fdc.waterG + fdc.proteinG + fdc.fatG + fdc.ashG).toFixed(1)} g / 100 g
          </td>
        </tr>
        <tr>
          <td>Connective Tissue (Collagen)</td>
          <td className="bt-num">{fdc.collagenG.toFixed(2)} g / 100 g</td>
          <td className="text-xs text-white/70">{fdc.collagenBasis} · {fdc.collagenSource}</td>
        </tr>
        <tr>
          <td>Thermal &amp; Shear References</td>
          <td className="bt-num">{dscReferenceSummary(speciesId)}</td>
          <td className="text-xs text-white/70">Tornberg (2005) Meat Science 70:493–508; McGee (2004) On Food &amp; Cooking</td>
        </tr>
      </tbody>
    </table>
  );
}

function RecipeMatchesCard({
  cutName,
  recipeSearchQuery,
  loading,
  recipes,
}: {
  readonly cutName: string;
  readonly recipeSearchQuery: string;
  readonly loading: boolean;
  readonly recipes: readonly RecipeMatchSummary[];
}): JSX.Element {
  return (
    <div className="bt-card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg">Site Recipes Using {cutName}</h3>
        <Link href={`/recipes?q=${encodeURIComponent(recipeSearchQuery)}`} className="text-xs text-amber-200 underline">
          Browse all “{recipeSearchQuery}” recipes →
        </Link>
      </div>
      {loading ? (
        <p className="text-xs text-white/50">Searching site recipe catalogue…</p>
      ) : recipes.length === 0 ? (
        <p className="text-xs text-white/60">
          No live recipes matched “{recipeSearchQuery}” in this environment — try browsing{" "}
          <Link href="/recipes" className="underline">the full recipe index</Link>.
        </p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {recipes.map((r) => (
            <Link key={r.id} href={`/recipes/${encodeURIComponent(r.id)}`} className="flex flex-col rounded-lg border border-white/10 bg-black/25 p-3 no-underline transition hover:border-amber-400/40">
              <span className="text-sm font-medium text-white">{r.name}</span>
              {r.cuisine ? <span className="mt-0.5 text-[11px] uppercase tracking-wider text-amber-200/75">{r.cuisine}</span> : null}
              {r.description ? <span className="mt-1 line-clamp-2 text-xs text-white/60">{r.description}</span> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ButcherSourcesPanel({ lab }: { readonly lab: ButcherLabState }): JSX.Element {
  const { cut } = lab;
  const fdc = getFdcRecordForCut(cut);
  const { recipes, loading } = useMatchingRecipes(cut.recipeSearchQuery);
  const totalPrimals = SPECIES_LIST.reduce((sum, sp) => sum + sp.primals.length, 0);

  return (
    <div className="space-y-4">
      <div className="bt-card space-y-3">
        <h2 className="text-xl">USDA FoodData Central Citation — {cut.name}</h2>
        <p className="text-xs text-white/60">
          Catalogue census: {SPECIES_LIST.length} species · {totalPrimals} anatomical primals · {BUTCHER_CUTS.length} USDA-pinned retail cuts.
        </p>
        {fdc ? <FdcCitationTable fdc={fdc} speciesId={cut.speciesId} /> : null}
      </div>
      <RecipeMatchesCard cutName={cut.name} recipeSearchQuery={cut.recipeSearchQuery} loading={loading} recipes={recipes} />
    </div>
  );
}
