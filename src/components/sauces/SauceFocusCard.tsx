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
    <section id="sauce-focus" aria-labelledby="sauce-focus-name" className="rounded-2xl border border-violet-400/30 bg-white/[0.04] p-6 md:p-8 space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">Sauce</p>
        <h2 id="sauce-focus-name" className="mt-1 text-3xl font-bold text-white">{sauce.name}</h2>
        <p className="mt-1 text-sm text-white/50">{facts(sauce).join(" · ")}</p>
        <p className="mt-4 max-w-3xl text-white/80">{sauce.description}</p>
      </div>
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
