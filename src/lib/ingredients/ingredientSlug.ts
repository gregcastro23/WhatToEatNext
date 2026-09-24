/**
 * Readable dossier slugs: /ingredients/black-pepper (omnibar plan Phase 2.5,
 * issue #870). Pure and dependency-free, so the header UI can build hrefs too.
 *
 * A slug comes from the catalog KEY, not the display name. The key is the
 * card's stable identity; names get edited ("Chickpeas" vs "Chickpeas
 * (Garbanzo Beans)"), and a URL should not move when one does.
 */

/**
 * Keys that lost a letter to an encoding accident. [MEASURED 2026-09-23]
 * gruy_re_cheese is the only one of 1,005 catalog keys whose slug would carry
 * the damage; its name spells the word ("Gruyère Cheese").
 */
const SLUG_OVERRIDES: Readonly<Record<string, string>> = {
  gruy_re_cheese: "gruyere-cheese",
};

/**
 * Text → slug form: accents folded, lowercase, every run of other characters
 * one hyphen. A key ("black_pepper"), a slug ("black-pepper") and a name
 * ("Black Pepper") of the same card share one form, which is what lets the
 * exact resolver accept all three.
 */
export function slugForm(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ingredientSlug(key: string): string {
  return SLUG_OVERRIDES[key] ?? slugForm(key);
}

export function ingredientHref(slug: string): string {
  return `/ingredients/${slug}`;
}
