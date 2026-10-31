/**
 * The checks behind `scripts/auditRecipeCatalogAccess.ts`: does every recipe
 * the site holds reach the frontend? Pure, so the checks can be proved against
 * catalogs that are deliberately broken, not only run against a healthy one.
 */
import { isInternalCuisineCode } from "@/utils/internalCuisineCodes";
import { cuisineKey } from "./catalogQuery";
import { whyNotDisplayable } from "./catalogValidity";

export interface AuditCuisine {
  name: string;
  /** Recipes `?cuisine=<slug>` selects. */
  served: number;
}

export interface AuditInput {
  /** The unfiltered, unlimited response, after a JSON round trip: the wire. */
  wire: unknown;
  /** `listCanonicalRecipeIds()`: the sitemap's definition of every recipe. */
  canonicalIds: readonly string[];
  /** `total` from `?cuisine=all`. */
  allCuisinesTotal: number;
  cuisines: readonly AuditCuisine[];
  /** True when the live catalog fell back to the static one. */
  degraded: boolean;
  /** Skip the live-database check (an audit of the static fallback). */
  allowStatic: boolean;
}

export interface AuditCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface AuditReport {
  ok: boolean;
  checks: AuditCheck[];
  served: number;
  /** Served recipes the page cannot display, by reason. */
  undisplayable: Record<string, string[]>;
  noCuisine: number;
  /** Cuisine values present in the data that no site cuisine link reaches. */
  unlinkedCuisines: Record<string, number>;
}

interface WirePage {
  total: number;
  recipes: unknown[];
}

function isWirePage(value: unknown): value is WirePage {
  return (
    typeof value === "object" &&
    value !== null &&
    "total" in value &&
    typeof value.total === "number" &&
    "recipes" in value &&
    Array.isArray(value.recipes)
  );
}

function stringField(record: unknown, field: string): string | undefined {
  if (typeof record !== "object" || record === null || !(field in record)) return undefined;
  const value: unknown = Object.getOwnPropertyDescriptor(record, field)?.value;
  return typeof value === "string" ? value : undefined;
}

const SAMPLE = 5;

function check(name: string, ok: boolean, detail: string): AuditCheck {
  return { name, ok, detail };
}

function undisplayableBy(recipes: readonly unknown[]): Record<string, string[]> {
  const byReason: Record<string, string[]> = {};
  for (const recipe of recipes) {
    const reason = whyNotDisplayable(recipe);
    if (reason) (byReason[reason] ??= []).push(stringField(recipe, "id") ?? "(no id)");
  }
  return byReason;
}

export function auditCatalog(input: AuditInput): AuditReport {
  const checks: AuditCheck[] = [];
  if (!isWirePage(input.wire)) {
    return {
      ok: false,
      checks: [check("The API answers with a recipe list", false, "the response has no total and recipes")],
      served: 0,
      undisplayable: {},
      noCuisine: 0,
      unlinkedCuisines: {},
    };
  }
  const { total, recipes } = input.wire;
  const ids = recipes.map((r) => stringField(r, "id") ?? "(no id)");
  const unique = new Set(ids);

  checks.push(
    input.allowStatic
      ? check("The live database supplies the catalog", true, "skipped (--allow-static)")
      : check(
          "The live database supplies the catalog",
          !input.degraded,
          input.degraded
            ? "the catalog fell back to the bundled static recipes: DATABASE_URL is unset or the database is unreachable"
            : "loaded from the database",
        ),
  );
  checks.push(
    check(
      "Nothing caps the response",
      recipes.length === total,
      `${recipes.length} recipes sent for a total of ${total}`,
    ),
  );
  checks.push(
    check(
      "Every recipe has its own id",
      unique.size === ids.length,
      `${ids.length - unique.size} repeated ids among ${ids.length}`,
    ),
  );

  const canonical = new Set(input.canonicalIds);
  const missing = [...canonical].filter((id) => !unique.has(id));
  const extra = [...unique].filter((id) => !canonical.has(id));
  checks.push(
    check(
      "The list is exactly the sitemap's recipes",
      missing.length === 0 && extra.length === 0,
      `${missing.length} in the sitemap but not served${missing.length ? ` (e.g. ${missing.slice(0, SAMPLE).join(", ")})` : ""}; ${extra.length} served but not in the sitemap${extra.length ? ` (e.g. ${extra.slice(0, SAMPLE).join(", ")})` : ""}`,
    ),
  );

  const undisplayable = undisplayableBy(recipes);
  const hidden = Object.values(undisplayable).reduce((sum, list) => sum + list.length, 0);
  checks.push(
    check(
      "The page can display every recipe",
      hidden === 0,
      hidden === 0
        ? `all ${recipes.length} pass the page's validation`
        : Object.entries(undisplayable)
            .map(([reason, list]) => `${list.length} fail on ${reason} (e.g. ${list.slice(0, SAMPLE).join(", ")})`)
            .join("; "),
    ),
  );

  const leaked = recipes.filter((r) => isInternalCuisineCode(stringField(r, "cuisine")));
  checks.push(
    check(
      "No internal archive code is served as a cuisine",
      leaked.length === 0,
      `${leaked.length} recipes carry one`,
    ),
  );

  checks.push(
    check(
      "cuisine=all returns the whole catalog",
      input.allCuisinesTotal === total,
      `cuisine=all totals ${input.allCuisinesTotal}, the unfiltered list ${total}`,
    ),
  );

  const known = new Set(input.cuisines.map((c) => cuisineKey(c.name)));
  const present: Record<string, number> = {};
  let noCuisine = 0;
  for (const recipe of recipes) {
    const cuisine = stringField(recipe, "cuisine");
    if (!cuisine) noCuisine += 1;
    else present[cuisine] = (present[cuisine] ?? 0) + 1;
  }
  const unreachable = input.cuisines.filter((c) => {
    const exact = Object.entries(present)
      .filter(([cuisine]) => cuisineKey(cuisine) === cuisineKey(c.name))
      .reduce((sum, [, n]) => sum + n, 0);
    return exact > 0 && c.served < exact;
  });
  checks.push(
    check(
      "Every cuisine link returns its recipes",
      unreachable.length === 0,
      unreachable.length === 0
        ? input.cuisines.map((c) => `${c.name} ${c.served}`).join(", ")
        : `${unreachable.map((c) => c.name).join(", ")} return fewer recipes than the data holds`,
    ),
  );

  return {
    ok: checks.every((c) => c.ok),
    checks,
    served: recipes.length,
    undisplayable,
    noCuisine,
    unlinkedCuisines: Object.fromEntries(
      Object.entries(present).filter(([cuisine]) => !known.has(cuisineKey(cuisine))),
    ),
  };
}
