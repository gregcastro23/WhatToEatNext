"use client";

import Link from "next/link";
import { useMemo, useState, type JSX } from "react";
import { categoryCounts, filterCatalogue, isSimulable, type CatalogueEntry } from "@/lib/baking/recipes/catalogue";
import { GOOD_CATEGORIES } from "@/lib/baking/recipes/catalogueFile";
import { GOOD_CATEGORY_LABELS } from "@/lib/baking/recipes/convertRecipe";
import type { GoodCategory } from "@/lib/baking/recipes/sourceTypes";
import type { BakingCatalogue } from "./useBakingCatalogue";

const SHOWN = 40;

function Badge({ entry }: { entry: CatalogueEntry }): JSX.Element {
  if (entry.kind === "curated") return <span className="bl-chip" data-kind="MEASURED">curated</span>;
  return isSimulable(entry) ? <span className="bl-chip" data-kind="DERIVED">site recipe</span> : <span className="bl-chip" data-kind="ABSENT">not simulable</span>;
}

function Meta({ entry }: { entry: CatalogueEntry }): JSX.Element {
  return (
    <span className="text-[11px] text-white/45">
      {GOOD_CATEGORY_LABELS[entry.category]}
      {entry.cuisine === null ? "" : ` · ${entry.cuisine}`}
    </span>
  );
}

function statusText(catalogue: BakingCatalogue): string {
  const { load, entries } = catalogue;
  if (load.status === "loading") return "Loading the site's recipes…";
  if (load.status === "failed") return `The site's recipes could not be loaded (${load.reason}); the curated goods are still here.`;
  const recipes = entries.filter((e) => e.kind === "recipe");
  const simulable = recipes.filter(isSimulable).length;
  return `${entries.length - recipes.length} curated · ${recipes.length} baked goods from the site's ${load.file.servedRecipes} recipes, ${simulable} of them simulable`;
}

function Results({ results, selectedId, onSelect }: { results: readonly CatalogueEntry[]; selectedId: string; onSelect: (id: string) => void }): JSX.Element {
  if (results.length === 0) return <p className="mt-2 text-sm text-white/50">No bakeable good matches.</p>;
  return (
    <>
      <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1" aria-label="Matching bakeable goods">
        {results.slice(0, SHOWN).map((e) => (
          <li key={e.id}>
            <button type="button" className="bl-good" aria-pressed={e.id === selectedId} onClick={() => onSelect(e.id)}>
              <span className="flex flex-col items-start text-left">
                <span className="text-[13px]">{e.name}</span>
                <Meta entry={e} />
              </span>
              <Badge entry={e} />
            </button>
          </li>
        ))}
      </ul>
      {results.length > SHOWN ? <p className="mt-1 text-[11px] text-white/40">{results.length - SHOWN} more — narrow the search.</p> : null}
    </>
  );
}

function Current({ entry }: { entry: CatalogueEntry | null }): JSX.Element | null {
  if (entry === null) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="bl-label">On the bench</span>
      <span className="text-base">{entry.name}</span>
      <Badge entry={entry} />
      {entry.kind === "recipe" ? (
        <Link className="text-[12px] underline text-white/60" href={`/recipes/${entry.id}`}>
          the site&apos;s recipe →
        </Link>
      ) : null}
    </div>
  );
}

/** Search every bakeable good — curated formulas and the site's baked recipes — by name, category or ingredient. */
export function GoodSearch({ catalogue, selectedId, onSelect }: { catalogue: BakingCatalogue; selectedId: string; onSelect: (id: string) => void }): JSX.Element {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<GoodCategory | "all">("all");
  const [simulableOnly, setSimulableOnly] = useState(false);
  const results = useMemo(() => filterCatalogue(catalogue.entries, { text, category, simulableOnly }), [catalogue.entries, text, category, simulableOnly]);
  const counts = categoryCounts(catalogue.entries);
  return (
    <section className="px-5 pt-4" aria-label="Choose a bakeable good">
      <div className="bl-card">
        <Current entry={catalogue.entries.find((e) => e.id === selectedId) ?? null} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="search"
            className="bl-input min-w-[14rem] flex-1"
            aria-label="Search bakeable goods by name, category or ingredient"
            placeholder="Search: focaccia, cookie, buttermilk…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <select className="bl-input" aria-label="Category" value={category} onChange={(e) => setCategory(GOOD_CATEGORIES.find((c) => c === e.target.value) ?? "all")}>
            <option value="all">All categories ({catalogue.entries.length})</option>
            {GOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {GOOD_CATEGORY_LABELS[c]} ({counts[c]})
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-[12px] text-white/60">
            <input type="checkbox" checked={simulableOnly} onChange={(e) => setSimulableOnly(e.target.checked)} />
            Simulable only
          </label>
        </div>
        <p className="mt-2 text-[11px] text-white/45" role="status">
          {statusText(catalogue)}
        </p>
        <Results results={results} selectedId={selectedId} onSelect={onSelect} />
      </div>
    </section>
  );
}
