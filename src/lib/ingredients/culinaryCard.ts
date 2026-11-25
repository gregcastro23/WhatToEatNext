/**
 * The full culinary card for one ingredient: its own catalog facts (filler
 * hidden), the cited food guides for it, the recipes that use it, and an honest
 * list of what is still undocumented.
 */
import { guidesForCatalogKey } from "@/lib/cooking/foodGuides/registry";
import type { FoodGuide } from "@/lib/cooking/foodGuides/schema";
import { containingRows } from "@/lib/search/omnibarParts";
import { cuisineLabel, displayName } from "@/lib/search/recipeFamilies";
import type { SearchIndex } from "@/lib/search/searchIndex";
import type { CardSection, CulinaryCard } from "@/lib/validation/culinaryCardSchemas";
import { publicCuisine } from "@/utils/internalCuisineCodes";
import { buildTemplateIndex, meaningfulOrigins, meaningfulSeasons, type TemplateIndex } from "./cardFiller";
import { cardSections } from "./cardSections";
import { toDossierCard } from "./dossierView";
import { catalogRecord, getIngredientCatalog, type CatalogIngredient } from "./ingredientCatalog";
import { ingredientHref } from "./ingredientSlug";

const RECIPE_LIMIT = 8;

let templates: TemplateIndex | null = null;

export function catalogTemplates(): TemplateIndex {
  templates ??= buildTemplateIndex(getIngredientCatalog().entries.map(catalogRecord));
  return templates;
}

/** A topic counts as covered by a card section or by a guide's list. */
const TOPICS: ReadonlyArray<{ topic: string; section: string; guide: (guide: FoodGuide) => number }> = [
  { topic: "buying", section: "", guide: (guide) => guide.selection.length },
  { topic: "storage", section: "storage", guide: (guide) => guide.storage.length },
  { topic: "preparation", section: "preparation", guide: (guide) => guide.preparation.length },
  { topic: "cooking", section: "cooking", guide: (guide) => guide.methods.length },
  { topic: "substitutes", section: "substitutions", guide: (guide) => guide.substitutions.length },
];

export function missingTopics(sections: readonly CardSection[], guides: readonly FoodGuide[]): string[] {
  const present = new Set(sections.map((section) => section.id));
  return TOPICS.filter(({ section, guide }) => !present.has(section) && !guides.some((candidate) => guide(candidate) > 0)).map(({ topic }) => topic);
}

export function buildCulinaryCard(entry: CatalogIngredient, index: SearchIndex): CulinaryCard {
  const record = catalogRecord(entry);
  const base = toDossierCard(record, entry.name);
  const sections = cardSections(record, catalogTemplates());
  const guides = guidesForCatalogKey(entry.key);
  return {
    slug: entry.slug,
    name: base.name,
    category: base.category,
    description: base.description,
    imageUrl: entry.imageUrl,
    href: ingredientHref(entry.slug),
    origin: meaningfulOrigins(base.origin),
    seasons: meaningfulSeasons(base.seasons),
    qualities: [...base.qualities],
    sections,
    missing: missingTopics(sections, guides),
    guides,
    recipes: containingRows(index, entry.key, RECIPE_LIMIT).rows.map((row) => ({
      name: displayName(row.name),
      href: row.href,
      cuisine: cuisineLabel(publicCuisine(row.cuisine) ?? "") || null,
    })),
    recipeCount: index.recipeUses.get(entry.key)?.length ?? 0,
  };
}
