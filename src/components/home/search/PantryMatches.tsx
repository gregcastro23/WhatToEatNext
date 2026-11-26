"use client";

/** Recipes already on the site that use the typed ingredients. Free. */
import Link from "next/link";
import { PantryResponseSchema, type PantryQuery, type PantryResponse } from "@/lib/validation/pantrySearchSchemas";
import styles from "./homeSearch.module.css";
import { createSearchResource, useSearchResource } from "./useSearchResource";
import type { JSX } from "react";

const resource = createSearchResource((value: unknown) => PantryResponseSchema.parse(value));

export function pantryUrl(query: PantryQuery | null): string | null {
  if (query === null || query.ingredients.length === 0) return null;
  const params = new URLSearchParams(query.ingredients.map((name): [string, string] => ["i", name.toLowerCase()]));
  if (query.diet !== null) params.set("diet", query.diet);
  return `/api/search/pantry?${params.toString()}`;
}

function Unmatched({ data }: { data: PantryResponse }): JSX.Element | null {
  const vague = data.ingredients.filter((item) => item.options.length > 0);
  const unknown = data.ingredients.filter((item) => item.name === null && item.options.length === 0).map((item) => item.term);
  return (
    <>
      {vague.map((item) => (
        <p key={item.term} className={styles.status}>
          “{item.term}” could be {item.options.join(", ")}. Add the one you have.
        </p>
      ))}
      {unknown.length > 0 && <p className={styles.status}>Not in the ingredient catalog, so recipes were not searched for: {unknown.join(", ")}.</p>}
    </>
  );
}

function Rows({ data }: { data: PantryResponse }): JSX.Element {
  return (
    <ul className={styles.rows}>
      {data.recipes.map((recipe) => (
        <li key={recipe.id} className={styles.row}>
          <div className={styles.rowMain}>
            <Link href={recipe.href} className={styles.rowName} prefetch={false}>
              {recipe.name}
            </Link>
            {recipe.cuisine !== null && <span className={styles.tag}>{recipe.cuisine}</span>}
          </div>
          <span className={styles.meta}>
            Uses {recipe.uses.join(", ")}
            {recipe.missing.length > 0 ? ` · not ${recipe.missing.join(", ")}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

export interface PantryMatchesProps {
  query: PantryQuery | null;
  /** Bumped on each search, so a failed one can be retried. */
  attempt?: number;
  /** What these matches were not screened for. */
  caveat?: string | null;
}

export function PantryMatches({ query, attempt = 0, caveat = null }: PantryMatchesProps): JSX.Element | null {
  const { status, data } = useSearchResource(resource, pantryUrl(query), attempt);
  if (status === "idle") return null;
  if (status === "error") return <p className={styles.status}>Recipe matching is unavailable right now.</p>;
  if (data === null) return <p className={styles.status}>Finding recipes…</p>;
  return (
    <section className={styles.card} aria-busy={status === "loading"}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>Recipes on the site</h3>
        <span className={styles.meta}>
          {data.total} {data.total === 1 ? "match" : "matches"}
        </span>
      </header>
      {caveat !== null && <p className={styles.note}>{caveat}</p>}
      <Unmatched data={data} />
      {data.recipes.length > 0 ? <Rows data={data} /> : <p className={styles.status}>No recipe uses those yet. Create one with AI below.</p>}
    </section>
  );
}
