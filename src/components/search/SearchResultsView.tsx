/**
 * The full results page body (server-rendered, noindex). The same sections as
 * the header dropdown, uncapped: the ingredient hero, every recipe that uses
 * it, then each kind's hits with the top hit's kind first. The form is a
 * plain GET, so refining works without JavaScript.
 */
import Link from "next/link";
import { OmnibarHeroRow } from "@/components/nav/omnibar/OmnibarHeroRow";
import { KIND_HINT, KIND_TITLE, orderedKinds, type ServerKind } from "@/components/nav/omnibar/omnibarModel";
import { OMNIBAR_RESULTS_CSS } from "@/components/nav/omnibar/omnibarStyles";
import { titleCase } from "@/lib/ingredients/dossierView";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import type { JSX } from "react";

const PAGE_CSS = `
.srch { max-width: 880px; margin: 0 auto; padding: 28px 16px 72px; color: var(--fg); }
.srch-form { display: flex; gap: 8px; margin: 10px 0 18px; }
.srch-form input {
  flex: 1; min-width: 0; min-height: 44px; padding: 0 14px; font-size: 16px; font-family: var(--f-body);
  color: var(--fg); background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 10px;
}
.srch-form button {
  min-height: 44px; padding: 0 18px; border-radius: 10px; cursor: pointer; font-family: var(--f-mono);
  font-size: 11px; letter-spacing: 0.14em; color: var(--fg); background: var(--accent-soft); border: 1px solid var(--line-hi);
}
.srch-note { color: var(--fg-dim); font-size: 14px; margin: 8px 0 20px; }
.srch-note strong { color: var(--fg); }
.srch-hero { display: block; padding: 14px; margin-bottom: 20px; border: 1px solid var(--line); border-radius: 12px; color: inherit; text-decoration: none; background: var(--surface); }
.srch-hero:hover { border-color: var(--line-hi); }
.srch-sec { margin: 22px 0; }
.srch-sec h2 { font-family: var(--f-mono); font-size: 10px; letter-spacing: 0.16em; color: var(--fg-mute); font-weight: 400; margin: 0 0 8px; }
.srch-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.srch-list a {
  display: flex; justify-content: space-between; gap: 12px; align-items: baseline; min-height: 44px; padding: 10px 12px;
  border-radius: 8px; color: var(--fg-dim); text-decoration: none;
}
.srch-list a:hover, .srch-list a:focus-visible { background: color-mix(in oklch, var(--accent), transparent 88%); color: var(--fg); }
.srch-hint { font-family: var(--f-mono); font-size: 9px; letter-spacing: 0.12em; color: var(--fg-mute); white-space: nowrap; }
`;

interface Row {
  key: string;
  label: string;
  hint: string;
  href: string;
}

function Section({ title, rows }: { title: string; rows: readonly Row[] }): JSX.Element | null {
  if (rows.length === 0) return null;
  return (
    <section className="srch-sec">
      <h2>{title}</h2>
      <ul className="srch-list">
        {rows.map((row) => (
          <li key={row.key}>
            <Link href={row.href} prefetch={false}>
              <span>{row.label}</span>
              <span className="srch-hint">{row.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function recipeRows(recipes: OmnibarResponse["recipes"]): Row[] {
  return recipes.map((r) => ({ key: r.id, label: r.name, hint: (r.cuisine ?? "recipe").toUpperCase(), href: r.href }));
}

function counted(kind: ServerKind, shown: number, total: number): string {
  return total > shown ? `${KIND_TITLE[kind]} · ${shown} OF ${total}` : `${KIND_TITLE[kind]} · ${total}`;
}

function KindSection({ result, kind }: { result: OmnibarResponse; kind: ServerKind }): JSX.Element | null {
  if (kind === "recipe") {
    const used = new Set(result.recipesContaining.map((r) => r.id));
    const rows = recipeRows(result.recipes.filter((r) => !used.has(r.id)));
    // Recipes already listed under the hero count there, not here.
    const listedAbove = result.recipes.length - rows.length;
    return <Section title={counted(kind, rows.length, result.total.recipe - listedAbove)} rows={rows} />;
  }
  const list = { ingredient: result.ingredients, cuisine: result.cuisines, method: result.methods, sauce: result.sauces }[kind];
  const rows = list.map((e) => ({
    key: e.key,
    label: kind === "ingredient" ? titleCase(e.name) : e.name,
    hint: KIND_HINT[kind],
    href: e.href,
  }));
  return <Section title={counted(kind, rows.length, result.total[kind])} rows={rows} />;
}

function HeroBlock({ result }: { result: OmnibarResponse }): JSX.Element | null {
  const { hero } = result;
  if (!hero) return null;
  const name = titleCase(hero.name);
  const more = hero.recipeCount - result.recipesContaining.length;
  return (
    <>
      <Link href={hero.href} prefetch={false} className="srch-hero" aria-label={`${name}: open the ingredient`}>
        <OmnibarHeroRow hero={hero} label={name} />
      </Link>
      <Section
        title={`RECIPES WITH ${hero.name.toUpperCase()} · ${hero.recipeCount}`}
        rows={result.recipesContaining.map((r) => ({
          key: r.id,
          label: r.name,
          hint: `${(r.cuisine ?? "recipe").toUpperCase()}${r.alternative ? " · AS AN ALTERNATIVE" : ""}`,
          href: r.href,
        }))}
      />
      {more > 0 ? (
        <p className="srch-note">
          Showing {result.recipesContaining.length} of {hero.recipeCount}.
        </p>
      ) : null}
    </>
  );
}

/** D5: zero results still offer a next step. */
function NoMatches({ query }: { query: string }): JSX.Element {
  return (
    <>
      <p className="srch-note">
        Nothing in the kitchen matches <strong>“{query}”</strong>.
      </p>
      <Section
        title="TRY INSTEAD"
        rows={[
          { key: "generator", label: "Invent a recipe with the generator", hint: "RECIPE GENERATOR", href: "/recipe-generator" },
          { key: "recipes", label: "Browse all recipes", hint: "RECIPES", href: "/recipes" },
          { key: "ingredients", label: "Browse all ingredients", hint: "INGREDIENTS", href: "/ingredients" },
        ]}
      />
    </>
  );
}

function Results({ query, result }: { query: string; result: OmnibarResponse }): JSX.Element {
  if (result.top === null) return <NoMatches query={query} />;
  const { corrected } = result;
  return (
    <>
      {corrected ? (
        <p className="srch-note">
          Showing results for <strong>{corrected.to}</strong>
          {corrected.basis === "synonym" ? ` (“${corrected.from}” is another name for it)` : ` (no exact match for “${corrected.from}”)`}.
        </p>
      ) : null}
      {orderedKinds(result).map((kind) => (
        <div key={kind}>
          {kind === "ingredient" ? <HeroBlock result={result} /> : null}
          <KindSection result={result} kind={kind} />
        </div>
      ))}
    </>
  );
}

export function SearchResultsView({ query, result }: { query: string; result: OmnibarResponse | null }): JSX.Element {
  return (
    <main className="srch">
      <style>{`${PAGE_CSS}${OMNIBAR_RESULTS_CSS}`}</style>
      <div className="t-tag">SEARCH</div>
      <h1 className="srch-note" style={{ margin: "6px 0 0", fontSize: 13 }}>
        {query ? `Results for “${query}”` : "Search ingredients, recipes, cuisines, cooking methods and sauces"}
      </h1>
      <form action="/search" method="get" role="search" className="srch-form">
        <input type="search" name="q" defaultValue={query} aria-label="Search ingredients, recipes, cuisines" placeholder="Search ingredients, recipes, cuisines…" />
        <button type="submit">SEARCH</button>
      </form>
      {query && result === null ? <p className="srch-note">Search is unavailable right now. Please try again in a moment.</p> : null}
      {query && result ? <Results query={query} result={result} /> : null}
    </main>
  );
}
