"use client";

/**
 * The cuisine section's search: recipes by dish name or ingredient, with every
 * version of each dish and the closest dishes from other cuisines.
 */
import Link from "next/link";
import { useState } from "react";
import { RecipeSearchResponseSchema, type RecipeSearchResponse } from "@/lib/validation/recipeSearchSchemas";
import styles from "./homeSearch.module.css";
import { RecipeGroupCard } from "./RecipeGroupCard";
import { SectionSearchForm } from "./SectionSearchForm";
import { createSearchResource, useSearchResource, type ResourceState } from "./useSearchResource";
import type { JSX } from "react";

const MIN_QUERY = 2;
const EXAMPLES = ["Moussaka", "Pad Thai", "eggplant tahini", "Baklava"] as const;

const resource = createSearchResource((value: unknown) => RecipeSearchResponseSchema.parse(value));

export function recipeSearchUrl(query: string): string | null {
  const q = query.trim().replace(/\s+/g, " ").toLowerCase();
  return q.length < MIN_QUERY ? null : `/api/search/recipes?q=${encodeURIComponent(q)}`;
}

function Results({ state, query }: { state: ResourceState<RecipeSearchResponse>; query: string }): JSX.Element | null {
  const { status, data } = state;
  if (status === "idle") return null;
  if (status === "error") return <p className={styles.status}>Recipe search is unavailable right now. Try again in a moment.</p>;
  if (data === null) return <p className={styles.status}>Searching recipes…</p>;
  if (status === "ready" && data.groups.length === 0) {
    return <p className={styles.status}>No recipes match “{query.trim()}”. Try one ingredient or a shorter dish name.</p>;
  }
  const hidden = data.totalGroups - data.groups.length;
  return (
    <div className={styles.results} aria-busy={status === "loading"}>
      {data.groups.map((group) => (
        <RecipeGroupCard key={group.key} group={group} />
      ))}
      <Link href={`/search?q=${encodeURIComponent(data.query)}`} className={styles.footerLink} prefetch={false}>
        {hidden > 0 ? `${hidden} more ${hidden === 1 ? "dish" : "dishes"} in full search →` : "Open full search →"}
      </Link>
    </div>
  );
}

export function CuisineRecipeSearch(): JSX.Element {
  const [query, setQuery] = useState("");
  const state = useSearchResource(resource, recipeSearchUrl(query));
  return (
    <div className={styles.root}>
      <SectionSearchForm
        id="home-recipe-search"
        label="Find a recipe by dish or ingredient"
        placeholder="e.g. Moussaka, or eggplant tahini"
        value={query}
        onChange={setQuery}
        onSubmit={setQuery}
        examples={EXAMPLES}
      />
      <div aria-live="polite">
        <Results state={state} query={query} />
      </div>
    </div>
  );
}
