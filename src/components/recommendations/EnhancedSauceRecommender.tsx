"use client";

/**
 * Enhanced Sauce Recommender — Alchemical Pairing Studio
 *
 * Reactive multi-dimensional culinary harmony engine combining 4-element
 * vector matching, 15-cuisine mother/traditional sauce catalogs, regional &
 * pairing aliases, pantry matching, and live cosmic transit alignment.
 *
 * @file src/components/recommendations/EnhancedSauceRecommender.tsx
 */
import React from "react";
import { PRESETS, type SaucePreset } from "./sauces/constants";
import SauceFilterConsole from "./sauces/SauceFilterConsole";
import SauceResultsColumn from "./sauces/SauceResultsColumn";
import { useSauceStudio } from "./sauces/useSauceStudio";

export interface EnhancedSauceRecommenderProps {
  initialCuisine?: string;
  onInspectLineage?: (sauceId: string) => void;
  className?: string;
}

function PresetsBar({ onApply }: { onApply: (preset: SaucePreset) => void }): React.ReactElement {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300">✦ Quick Alchemical Presets</span>
        <span className="text-[10px] text-white/50 hidden sm:inline">Click to load & alchemize instantly</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.title}
            type="button"
            onClick={() => onApply(p)}
            className="text-left p-2.5 min-h-[48px] rounded-xl border border-white/10 bg-white/[0.03] hover:border-violet-500/50 hover:bg-violet-950/20 transition-all group focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2"
          >
            <div className="text-xs font-serif font-medium text-white group-hover:text-violet-200">{p.title}</div>
            <div className="text-[10px] font-mono text-white/55 truncate mt-0.5">{p.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EnhancedSauceRecommender({
  initialCuisine,
  onInspectLineage,
  className = "",
}: EnhancedSauceRecommenderProps): React.ReactElement {
  const studio = useSauceStudio(initialCuisine);

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {studio.catalogueStatus === "failed" && (
        <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-200">
          <span>Full tradition sauce archive failed to load; showing core catalog & 15 tradition profiles.</span>
          <button
            type="button"
            onClick={studio.retryCatalogue}
            className="px-3 py-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 font-mono uppercase tracking-wider text-[10px] shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            Retry Load
          </button>
        </div>
      )}

      <PresetsBar onApply={studio.applyPreset} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <SauceFilterConsole
            availableCuisines={studio.availableCuisines}
            cuisineKey={studio.cuisineKey}
            onCuisineChange={studio.setCuisineKey}
            {...(studio.region ? { region: studio.region } : {})}
            onRegionChange={studio.setRegion}
            fingerprint={studio.fingerprint}
            ingredientSlugs={studio.ingredientSlugs}
            {...(studio.protein ? { protein: studio.protein } : {})}
            onProteinChange={studio.setProtein}
            {...(studio.vegetable ? { vegetable: studio.vegetable } : {})}
            onVegetableChange={studio.setVegetable}
            {...(studio.cookingMethod ? { cookingMethod: studio.cookingMethod } : {})}
            onCookingMethodChange={studio.setCookingMethod}
            season={studio.season}
            onSeasonChange={studio.setSeason}
            role={studio.role}
            onRoleChange={studio.setRole}
            flavorTargets={studio.flavorTargets}
            onToggleFlavor={studio.toggleFlavor}
            dietary={studio.dietary}
            onToggleDietary={studio.toggleDietary}
            cosmicSync={studio.cosmicSync}
            onToggleCosmicSync={studio.toggleCosmicSync}
            strictCuisine={studio.strictCuisine}
            onToggleStrictCuisine={studio.toggleStrictCuisine}
            applyUserBias={studio.applyUserBias}
            onToggleUserBias={studio.toggleUserBias}
            hasUserBias={studio.hasUserBias}
            biasSource={studio.biasSource}
            pantryFirst={studio.pantryFirst}
            onTogglePantryFirst={studio.togglePantryFirst}
            pantryCount={studio.pantryNames.length}
            {...(studio.currentZodiac ? { currentZodiac: studio.currentZodiac } : {})}
            planetaryHour={studio.planetaryHour}
            detectedSeason={studio.detectedSeason}
            isDaytime={studio.isDaytime}
            hasActiveFilters={studio.hasActiveFilters}
            onResetFilters={studio.resetFilters}
          />
        </div>

        <SauceResultsColumn
          results={studio.visibleResults}
          activeCuisine={studio.cuisineKey}
          ingredientSlugs={studio.ingredientSlugs}
          pantryNames={studio.pantryNames}
          searchQuery={studio.searchQuery}
          onSearchQueryChange={studio.setSearchQuery}
          originFilter={studio.originFilter}
          originCounts={studio.originCounts}
          onOriginFilterChange={studio.setOriginFilter}
          strictCuisine={studio.strictCuisine}
          onDisableStrictCuisine={() => {
            if (studio.strictCuisine) studio.toggleStrictCuisine();
          }}
          onResetFilters={studio.resetFilters}
          {...(onInspectLineage ? { onInspectLineage } : {})}
        />
      </div>
    </div>
  );
}
