/** Row builders shared by the model and the hero's sections. */
import { titleCase } from "@/lib/ingredients/dossierView";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { KIND_ICON, type LinkRow, type OmnibarSection, type RowKind } from "./omnibarTypes";

type RecipeWire = OmnibarResponse["recipes"][number];
type Coverage = NonNullable<OmnibarResponse["coverage"]>;

export function link(kind: RowKind, id: string, label: string, hint: string, href: string): LinkRow {
  return { type: "link", id, kind, label, hint, href, icon: KIND_ICON[kind], external: false };
}

export function recipeRow(section: string, recipe: RecipeWire, alternative = false): LinkRow {
  const hint = `${(recipe.cuisine ?? "recipe").toUpperCase()}${alternative ? " · AS AN ALTERNATIVE" : ""}`;
  return link("recipe", `${section}:${recipe.id}`, recipe.name, hint, recipe.href);
}

/** "USES 2 OF 3 · MISSING FETA": how much of the query a recipe covers. */
export function coverageHint(row: Coverage["rows"][number], of: number): string {
  const uses = `USES ${row.uses} OF ${of}`;
  return row.missing.length === 0 ? uses : `${uses} · MISSING ${row.missing.join(", ").toUpperCase()}`;
}

/** "RECIPES WITH SPINACH + CHICKEN EGG + FETA · 8". */
export function coverageTitle(coverage: Coverage): string {
  return `RECIPES WITH ${coverage.of.map((e) => titleCase(e.name)).join(" + ").toUpperCase()} · ${coverage.total}`;
}

/** Several named ingredients: the recipes that use them together (Phase 5). */
export function coverageSection(coverage: Coverage | null, limit: number): OmnibarSection[] {
  if (!coverage || coverage.rows.length === 0) return [];
  const of = coverage.of.length;
  const rows = coverage.rows.slice(0, limit).map((r) => link("recipe", `cover:${r.id}`, r.name, coverageHint(r, of), r.href));
  return [{ id: "coverage", title: coverageTitle(coverage), rows }];
}
