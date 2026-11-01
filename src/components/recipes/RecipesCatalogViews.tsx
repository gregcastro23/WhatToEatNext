import Link from "next/link";
import React from "react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { CuisineFacet } from "@/lib/recipes/catalogFacets";
import type { Recipe } from "@/types/recipe";
import type { JSX, ReactNode } from "react";

/**
 * The pieces of the recipes page: its header, the search and cuisine pills,
 * and the body (loading, failure, nothing to show, or the grid). Each state is
 * its own message, so an empty catalog, a broken request and a search that
 * found nothing never look alike.
 */

const PILL_BASE =
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";
const PILL_ON = "border-purple-400 bg-purple-600 text-white";
const PILL_OFF = "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10";
const PILL_EMPTY = "cursor-not-allowed border-white/5 bg-white/5 text-gray-600";

const PRIMARY_BUTTON =
  "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors";
const SECONDARY_LINK =
  "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors";

interface CatalogHeaderProps {
  title: string;
  /** Null until the catalog has loaded without error: then there are no counts to show. */
  counts: { shown: number; held: number; isNarrowed: boolean; isScoring: boolean } | null;
  droppedNotice: { dropped: number; total: number } | null;
}

export function CatalogHeader({ title, counts, droppedNotice }: CatalogHeaderProps): JSX.Element {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{title} Recipes</h1>
      {counts && (
        <p className="text-lg text-gray-400" aria-live="polite">
          {counts.isNarrowed ? `${counts.shown} of ${counts.held} recipes` : `${counts.held} recipes`}
          {counts.isScoring ? " - consulting the heavens..." : " sorted by current planetary alignment"}
        </p>
      )}
      {droppedNotice && (
        <p role="status" className="mt-2 text-sm text-amber-300">
          {droppedNotice.dropped} of {droppedNotice.total} recipes couldn&apos;t be displayed because their data is
          incomplete.
        </p>
      )}
    </div>
  );
}

interface CuisinePillProps {
  facet: CuisineFacet;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

function CuisinePill({ facet, isSelected, onSelect }: CuisinePillProps): JSX.Element {
  const isEmpty = facet.matching === 0 && !isSelected;
  const tone = isSelected ? PILL_ON : isEmpty ? PILL_EMPTY : PILL_OFF;
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      disabled={isEmpty}
      onClick={() => onSelect(facet.slug)}
      className={`${PILL_BASE} ${tone}`}
    >
      {facet.name} <span className="text-xs opacity-70">{facet.matching}</span>
    </button>
  );
}

interface CatalogFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  facets: CuisineFacet[];
  /** Recipes matching the search, across every cuisine. */
  matchingCount: number;
  /** Key of the selected cuisine, or null for All. */
  selectedKey: string | null;
  onSelectCuisine: (slug: string | null) => void;
}

export function CatalogFilters({
  query,
  onQueryChange,
  facets,
  matchingCount,
  selectedKey,
  onSelectCuisine,
}: CatalogFiltersProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-xl">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes
        </label>
        <input
          id="recipe-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onQueryChange("");
          }}
          placeholder="Search recipes, ingredients or cuisines"
          autoComplete="off"
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div role="group" aria-label="Filter by cuisine" className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          aria-pressed={selectedKey === null}
          onClick={() => onSelectCuisine(null)}
          className={`${PILL_BASE} ${selectedKey === null ? PILL_ON : PILL_OFF}`}
        >
          All <span className="text-xs opacity-70">{matchingCount}</span>
        </button>
        {facets.map((facet) => (
          <CuisinePill key={facet.key} facet={facet} isSelected={facet.key === selectedKey} onSelect={onSelectCuisine} />
        ))}
      </div>
    </div>
  );
}

function LoadingGrid(): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card-premium rounded-2xl border border-white/8 animate-pulse h-48" />
      ))}
    </div>
  );
}

function LoadFailure({ error, onRetry }: { error: string; onRetry: () => void }): JSX.Element {
  return (
    <div role="alert" className="text-center py-20">
      <p className="text-6xl mb-6">⚠️</p>
      <h2 className="text-2xl font-bold text-white mb-3">Recipes Unavailable</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        {error} This is a connection problem, not an empty catalog.
      </p>
      <button type="button" onClick={onRetry} className={PRIMARY_BUTTON}>
        ↻ Try Again
      </button>
    </div>
  );
}

function NothingToShow({ message, children }: { message: string; children?: ReactNode }): JSX.Element {
  return (
    <div className="text-center py-20">
      <p className="text-6xl mb-6">🍽️</p>
      <h2 className="text-2xl font-bold text-white mb-3">No Recipes Found</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {children}
        <Link href="/cuisines" className={SECONDARY_LINK}>
          Explore Cuisines
        </Link>
      </div>
    </div>
  );
}

interface NoMatchesProps {
  cuisine: string | null;
  displayCuisine: string;
  searchText: string;
  onClearSearch: () => void;
}

/** The catalog is not empty, but the cuisine and search leave nothing. */
function NoMatches({ cuisine, displayCuisine, searchText, onClearSearch }: NoMatchesProps): JSX.Element {
  const scope = cuisine ? `${displayCuisine} ` : "";
  const message = searchText
    ? `No ${scope}recipes match “${searchText}”.`
    : `We have no ${displayCuisine} recipes yet. Try another cuisine, or browse everything.`;
  return (
    <NothingToShow message={message}>
      {searchText && (
        <button type="button" onClick={onClearSearch} className={PRIMARY_BUTTON}>
          Clear Search
        </button>
      )}
      {cuisine && (
        <Link href="/recipes" className={PRIMARY_BUTTON}>
          View All Recipes
        </Link>
      )}
    </NothingToShow>
  );
}

interface CatalogBodyProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Every recipe the page holds. */
  held: number;
  visible: Recipe[];
  cuisine: string | null;
  displayCuisine: string;
  searchText: string;
  isCatchingUp: boolean;
  onClearSearch: () => void;
}

export function CatalogBody({
  isLoading,
  error,
  onRetry,
  held,
  visible,
  cuisine,
  displayCuisine,
  searchText,
  isCatchingUp,
  onClearSearch,
}: CatalogBodyProps): JSX.Element {
  if (isLoading) return <LoadingGrid />;
  if (error) return <LoadFailure error={error} onRetry={onRetry} />;
  if (held === 0) return <NothingToShow message="We couldn't find any recipes. Check back later." />;
  if (visible.length === 0) {
    return (
      <NoMatches
        cuisine={cuisine}
        displayCuisine={displayCuisine}
        searchText={searchText}
        onClearSearch={onClearSearch}
      />
    );
  }
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isCatchingUp ? "opacity-70" : ""}`}
    >
      {visible.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
