/**
 * Credit for static recipes adapted from a published recipe. A cuisine file
 * dish names its source in `adaptedFrom`; the loader keeps it only when every
 * required field is present, so a partial credit is never published.
 */
import type { RecipeSource } from "@/types/recipe";

function text(record: object, key: string): string | undefined {
  const value: unknown = Reflect.get(record, key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function parseRecipeSource(value: unknown): RecipeSource | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const title = text(value, "title");
  const author = text(value, "author");
  const publisher = text(value, "publisher");
  const url = text(value, "url");
  const accessed = text(value, "accessed");
  if (!title || !author || !publisher || !url || !accessed) return undefined;
  if (!url.startsWith("https://") || !/^\d{4}-\d{2}-\d{2}$/.test(accessed)) return undefined;
  const notes = text(value, "notes");
  return { title, author, publisher, url, accessed, ...(notes ? { notes } : {}) };
}

/** schema.org `isBasedOn` for the page's Recipe JSON-LD. */
export function recipeSourceJsonLd(source: RecipeSource): Record<string, unknown> {
  return {
    "@type": "Recipe",
    name: source.title,
    url: source.url,
    author: { "@type": "Person", name: source.author },
    publisher: { "@type": "Organization", name: source.publisher },
  };
}
