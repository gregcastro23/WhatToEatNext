/** Row builders shared by the model and the hero's sections. */
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { KIND_ICON, type LinkRow, type RowKind } from "./omnibarTypes";

type RecipeWire = OmnibarResponse["recipes"][number];

export function link(kind: RowKind, id: string, label: string, hint: string, href: string): LinkRow {
  return { type: "link", id, kind, label, hint, href, icon: KIND_ICON[kind], external: false };
}

export function recipeRow(section: string, recipe: RecipeWire, alternative = false): LinkRow {
  const hint = `${(recipe.cuisine ?? "recipe").toUpperCase()}${alternative ? " · AS AN ALTERNATIVE" : ""}`;
  return link("recipe", `${section}:${recipe.id}`, recipe.name, hint, recipe.href);
}
