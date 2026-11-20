"use client";

/**
 * Right-hand recommendations column for the Sauce Pairing Studio: status
 * counter, search filter landmark, origin tabs, and result cards.
 *
 * @file src/components/recommendations/sauces/SauceResultsColumn.tsx
 */
import React, { useEffect, useId, useRef } from "react";
import type { CuisineSauceResult } from "@/utils/cuisine/cuisineSauceProfiler";
import SauceResultCard from "./SauceResultCard";

export type OriginFilter = "all" | "native" | "mother" | "traditional" | "global";

const ORIGIN_TABS: ReadonlyArray<{ key: OriginFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "native", label: "Native" },
  { key: "mother", label: "Mother" },
  { key: "traditional", label: "Traditional" },
  { key: "global", label: "Global" },
];

export interface SauceResultsColumnProps {
  results: readonly CuisineSauceResult[];
  activeCuisine: string;
  ingredientSlugs: Record<string, string>;
  pantryNames: readonly string[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  originFilter: OriginFilter;
  originCounts: Record<OriginFilter, number>;
  onOriginFilterChange: (filter: OriginFilter) => void;
  strictCuisine: boolean;
  onDisableStrictCuisine: () => void;
  onResetFilters: () => void;
  onInspectLineage?: (sauceId: string) => void;
}

function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el instanceof HTMLElement && el.isContentEditable;
}

function useSlashSearchShortcut(inputRef: React.RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent): void => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableElement(document.activeElement)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onGlobalKey);
    return (): void => window.removeEventListener("keydown", onGlobalKey);
  }, [inputRef]);
}

function SearchInputAdornment({
  hasQuery,
  onClear,
}: {
  hasQuery: boolean;
  onClear: () => void;
}): React.ReactElement {
  return hasQuery ? (
    <button
      type="button"
      aria-label="Clear search"
      onClick={onClear}
      className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[28px] min-h-[28px] rounded-md text-white/60 hover:text-white flex items-center justify-center text-xs focus-visible:outline-2 focus-visible:outline-violet-400"
    >
      ✕
    </button>
  ) : (
    <kbd
      aria-hidden="true"
      className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-white/40 border border-white/15 rounded bg-white/[0.03] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
    >
      /
    </kbd>
  );
}

function SearchBarRow({
  searchQuery,
  onSearchQueryChange,
  originFilter,
  originCounts,
  onOriginFilterChange,
}: {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  originFilter: OriginFilter;
  originCounts: Record<OriginFilter, number>;
  onOriginFilterChange: (filter: OriginFilter) => void;
}): React.ReactElement {
  const searchInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  useSlashSearchShortcut(inputRef);

  return (
    <div role="search" className="space-y-2.5">
      <div className="relative">
        <label htmlFor={searchInputId} className="sr-only">
          Search sauces by name, base, or ingredient
        </label>
        <input
          ref={inputRef}
          id={searchInputId}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              if (searchQuery) onSearchQueryChange("");
              else e.currentTarget.blur();
            }
          }}
          placeholder="Filter sauces by name, base, or ingredient..."
          className="w-full min-h-[44px] bg-[#15121f] text-white border border-white/15 rounded-xl pl-3.5 pr-9 py-2 text-base sm:text-sm placeholder-white/45 [&::-webkit-search-cancel-button]:hidden focus:border-violet-400 focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2"
        />
        <SearchInputAdornment
          hasQuery={Boolean(searchQuery)}
          onClear={() => {
            onSearchQueryChange("");
            inputRef.current?.focus();
          }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter sauce origin">
        {ORIGIN_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={originFilter === tab.key}
            onClick={() => onOriginFilterChange(tab.key)}
            className={`px-3 py-2 min-h-[40px] rounded-xl text-[11px] font-mono uppercase tracking-wider border transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2 ${originFilter === tab.key
              ? "bg-violet-600/30 border-violet-400/70 text-white"
              : "bg-white/[0.03] border-white/10 text-white/65 hover:text-white"
              }`}
          >
            {tab.label}
            <span className="ml-1 text-[10px] opacity-70 tabular-nums">{originCounts[tab.key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyResultsBox({
  showGlobalUnlock,
  onDisableStrictCuisine,
  onResetFilters,
}: {
  showGlobalUnlock: boolean;
  onDisableStrictCuisine: () => void;
  onResetFilters: () => void;
}): React.ReactElement {
  return (
    <div className="rounded-2xl border-2 border-dashed border-white/10 bg-[#0e0c16]/50 p-10 text-center space-y-3">
      <h4 className="text-base font-serif font-semibold text-white">No Matching Formulations</h4>
      <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
        No sauces matched your current search or tradition filters. Clear filters or switch to Global bridges.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={onResetFilters}
          className="py-2 px-4 min-h-[40px] rounded-xl border border-violet-400/40 bg-violet-600/20 text-violet-200 hover:bg-violet-600/30 text-xs font-mono uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2"
        >
          Reset Filters
        </button>
        {showGlobalUnlock && (
          <button
            type="button"
            onClick={onDisableStrictCuisine}
            className="py-2 px-4 min-h-[40px] rounded-xl border border-sky-400/40 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25 text-xs font-mono uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-2"
          >
            Show Global Bridges
          </button>
        )}
      </div>
    </div>
  );
}

export default function SauceResultsColumn({
  results,
  activeCuisine,
  ingredientSlugs,
  pantryNames,
  searchQuery,
  onSearchQueryChange,
  originFilter,
  originCounts,
  onOriginFilterChange,
  strictCuisine,
  onDisableStrictCuisine,
  onResetFilters,
  onInspectLineage,
}: SauceResultsColumnProps): React.ReactElement {
  return (
    <div className="lg:col-span-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300 block mb-0.5">Alchemical Matrix</span>
          <h2 className="text-2xl font-serif font-medium text-white tracking-wide">Harmonized Sauce Pairings</h2>
        </div>
        <span
          role="status"
          aria-live="polite"
          className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/80 tabular-nums self-start sm:self-auto"
        >
          {results.length} formulated
        </span>
      </div>

      <SearchBarRow
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        originFilter={originFilter}
        originCounts={originCounts}
        onOriginFilterChange={onOriginFilterChange}
      />

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {results.map((r, i) => (
            <SauceResultCard
              key={r.sauce.id}
              result={r}
              rank={i + 1}
              activeCuisine={activeCuisine}
              ingredientSlugs={ingredientSlugs}
              pantryNames={pantryNames}
              {...(onInspectLineage ? { onInspectLineage } : {})}
            />
          ))}
        </div>
      ) : (
        <EmptyResultsBox
          showGlobalUnlock={strictCuisine && originFilter === "global"}
          onDisableStrictCuisine={onDisableStrictCuisine}
          onResetFilters={onResetFilters}
        />
      )}
    </div>
  );
}
