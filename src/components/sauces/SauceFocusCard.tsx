/**
 * One sauce, shown above the recommender when /sauces is opened with
 * `?focus=<key>` (omnibar Phase 4, #870). Server-rendered from the sauce data;
 * key ingredients link to their dossiers where the name is a card.
 */
import Link from "next/link";
import type { Sauce } from "@/data/sauces";
import { resolveCatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import type { JSX } from "react";

function Label({ children }: { children: string }): JSX.Element {
  return <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 mb-2">{children}</h3>;
}

function KeyIngredient({ name }: { name: string }): JSX.Element {
  const slug = resolveCatalogIngredient(name)?.entry.slug;
  const chip = "rounded-full border border-white/15 px-3 py-1 text-sm";
  return slug === undefined ? (
    <span className={`${chip} text-white/70`}>{name}</span>
  ) : (
    <Link href={ingredientHref(slug)} prefetch={false} className={`${chip} text-violet-200 hover:border-violet-300/60`}>
      {name}
    </Link>
  );
}

function List({ title, items, ordered = false }: { title: string; items: readonly string[] | undefined; ordered?: boolean }): JSX.Element | null {
  if (!items || items.length === 0) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <div>
      <Label>{title}</Label>
      <Tag className={`${ordered ? "list-decimal" : "list-disc"} space-y-1 pl-5 text-sm text-white/75`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Tag>
    </div>
  );
}

function facts(sauce: Sauce): string[] {
  const season = sauce.seasonality === "all" ? "year-round" : sauce.seasonality;
  return [sauce.cuisine, `${sauce.base} base`, season, sauce.prepTime && `prep ${sauce.prepTime}`, sauce.cookTime && `cook ${sauce.cookTime}`, sauce.yield]
    .filter((fact): fact is string => typeof fact === "string" && fact !== "");
}

export function SauceFocusCard({ sauce }: { sauce: Sauce }): JSX.Element {
  return (
    <section
      id="sauce-focus"
      aria-labelledby="sauce-focus-name"
      className="rounded-2xl border border-violet-400/40 bg-[#0e0c16]/95 p-6 md:p-8 space-y-6 shadow-[0_0_35px_rgba(139,92,246,0.15)] backdrop-blur-xl relative"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-violet-300">Focused Sauce Dossier</p>
            <span className="text-white/30 font-mono">·</span>
            <span className="text-[10px] font-mono text-amber-300 uppercase">{sauce.cuisine}</span>
          </div>
          <h2 id="sauce-focus-name" className="mt-1 text-3xl sm:text-4xl font-serif font-medium text-white tracking-wide">
            {sauce.name}
          </h2>
          <p className="mt-1 text-xs font-mono text-white/50">{facts(sauce).join(" · ")}</p>
        </div>

        <Link
          href="/sauces"
          prefetch={false}
          className="text-xs font-mono text-white/40 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors"
          title="Return to full sauce matrix"
        >
          Clear Focus ✕
        </Link>
      </div>

      <p className="max-w-3xl text-sm text-white/80 leading-relaxed font-body">{sauce.description}</p>
      <div>
        <Label>Key ingredients</Label>
        <div className="flex flex-wrap gap-2">
          {sauce.keyIngredients.map((name) => (
            <KeyIngredient key={name} name={name} />
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <List title="Ingredients" items={sauce.ingredients} />
        <List title="Method" items={sauce.preparationSteps} ordered />
        <List title="Uses" items={sauce.culinaryUses} />
        <List title="Variations" items={sauce.variants} />
      </div>
      {sauce.technicalTips ? <p className="text-sm text-white/60">Tip: {sauce.technicalTips}</p> : null}
    </section>
  );
}
