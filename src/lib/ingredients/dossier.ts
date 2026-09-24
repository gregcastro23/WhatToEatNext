/**
 * Server side of the slug dossier, /ingredients/[slug] (omnibar Phase 2.5b,
 * #870): what a URL resolves to, the page's data, and its JSON-LD.
 *
 * URLs are identities, so resolution is exact: the canonical slug renders,
 * any other spelling of one card (key, name, alias) 308s to its slug, and
 * everything else is a 404. There is no free-text matching here; that belongs
 * to search. "Used in" comes from the live reverse index, the same list and
 * count the search hero shows.
 */
import { getSearchIndex } from "@/lib/search/loader";
import { containingRows, DEFAULT_CONTAINING } from "@/lib/search/omnibar";
import { toDossierCard, type DossierCard } from "./dossierView";
import { catalogRecord, resolveCatalogIngredient, type CatalogIngredient } from "./ingredientCatalog";
import { ingredientHref } from "./ingredientSlug";

export type DossierTarget =
  | { kind: "dossier"; entry: CatalogIngredient }
  | { kind: "redirect"; slug: string }
  | { kind: "missing" };

export interface DossierRecipe {
  id: string;
  name: string;
  href: string;
  cuisine: string | null;
  totalMinutes: number | null;
  /** Used only as one side of an "X or Y" line. */
  alternative: boolean;
}

export interface IngredientDossier {
  slug: string;
  key: string;
  card: DossierCard;
  recipes: readonly DossierRecipe[];
  /** Every live recipe that uses the ingredient, not just the listed ones. */
  recipeCount: number;
}

function decoded(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

export function resolveDossierTarget(param: string): DossierTarget {
  const resolved = resolveCatalogIngredient(decoded(param));
  if (!resolved) return { kind: "missing" };
  return resolved.isCanonical ? { kind: "dossier", entry: resolved.entry } : { kind: "redirect", slug: resolved.entry.slug };
}

export async function getIngredientDossier(entry: CatalogIngredient): Promise<IngredientDossier> {
  const index = await getSearchIndex();
  const recipes = containingRows(index, entry.key, DEFAULT_CONTAINING).map(
    ({ id, name, href, cuisine, totalMinutes, alternative }): DossierRecipe => ({
      id,
      name,
      href,
      cuisine,
      totalMinutes,
      alternative,
    }),
  );
  return {
    slug: entry.slug,
    key: entry.key,
    card: toDossierCard(catalogRecord(entry), entry.name),
    recipes,
    recipeCount: index.recipeUses.get(entry.key)?.length ?? 0,
  };
}

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const SITE_URL = configuredSiteUrl !== undefined && configuredSiteUrl !== "" ? configuredSiteUrl : "https://alchm.kitchen";

/** One-line summary for meta description and JSON-LD: the card's own words when it has them. */
export function dossierSummary({ card, recipeCount }: IngredientDossier): string {
  if (card.description !== null) return card.description;
  const used = recipeCount === 1 ? "1 recipe" : `${recipeCount} recipes`;
  return `${card.name}: ${card.category}, used in ${used} on Alchm Kitchen.`;
}

/** WebPage + BreadcrumbList. Serialized with "<" escaped so card text can't close the script tag. */
export function dossierJsonLd(dossier: IngredientDossier): string {
  const url = `${SITE_URL}${ingredientHref(dossier.slug)}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: dossier.card.name,
        description: dossierSummary(dossier),
        ...(dossier.card.imageUrl === null ? {} : { primaryImageOfPage: new URL(dossier.card.imageUrl, SITE_URL).href }),
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Ingredients", item: `${SITE_URL}/ingredients` },
          { "@type": "ListItem", position: 3, name: dossier.card.name, item: url },
        ],
      },
    ],
  };
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
