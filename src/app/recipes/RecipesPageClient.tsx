"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense, useCallback, useDeferredValue, useMemo } from "react";
import { CatalogBody, CatalogFilters, CatalogHeader } from "@/components/recipes/RecipesCatalogViews";
import { useRecipeCatalog } from "@/hooks/useRecipeCatalog";
import { cuisineFacets, searchRecipes } from "@/lib/recipes/catalogFacets";
import { cuisineTermKey, filterRecipes } from "@/lib/recipes/catalogQuery";
import { cuisineHeading } from "@/lib/recipes/catalogValidity";

function RecipesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cuisine = searchParams?.get("cuisine") || null;
  const { recipes, total, dropped, error, isLoading, isScoring, reload } = useRecipeCatalog();
  const [query, setQuery] = useState("");
  // Typing stays responsive while the grid (up to the whole catalog) catches up.
  const deferredQuery = useDeferredValue(query);

  const selectCuisine = useCallback(
    (slug: string | null) => {
      router.replace(slug ? `/recipes?cuisine=${encodeURIComponent(slug)}` : "/recipes", { scroll: false });
    },
    [router],
  );

  const searched = useMemo(() => searchRecipes(recipes, deferredQuery), [recipes, deferredQuery]);
  const visible = useMemo(() => filterRecipes(searched, { cuisine }), [searched, cuisine]);
  const facets = useMemo(() => cuisineFacets(recipes, searched), [recipes, searched]);

  const searchText = deferredQuery.trim();
  const isReady = !isLoading && !error;

  return (
    <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <CatalogHeader
          title={cuisineHeading(cuisine)}
          counts={
            isReady
              ? {
                  shown: visible.length,
                  held: recipes.length,
                  isNarrowed: cuisine !== null || searchText !== "",
                  isScoring,
                }
              : null
          }
          droppedNotice={isReady && dropped > 0 ? { dropped, total } : null}
        />
        {isReady && recipes.length > 0 && (
          <CatalogFilters
            query={query}
            onQueryChange={setQuery}
            facets={facets}
            matchingCount={searched.length}
            selectedKey={cuisineTermKey(cuisine)}
            onSelectCuisine={selectCuisine}
          />
        )}
        <CatalogBody
          isLoading={isLoading}
          error={error}
          onRetry={() => void reload()}
          held={recipes.length}
          visible={visible}
          cuisine={cuisine}
          displayCuisine={cuisineHeading(cuisine)}
          searchText={searchText}
          isCatchingUp={query !== deferredQuery}
          onClearSearch={() => setQuery("")}
        />
      </div>
    </main>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-12 w-64 glass-card-premium rounded-2xl border border-white/8 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card-premium rounded-2xl border border-white/8 h-48" />
            ))}
          </div>
        </div>
      </main>
    }>
      <RecipesPageContent />
    </Suspense>
  );
}
