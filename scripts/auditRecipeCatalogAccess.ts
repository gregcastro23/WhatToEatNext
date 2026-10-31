/**
 * Recipe Catalog Access Audit
 *
 * Proves that every recipe the site holds reaches the frontend: the API sends
 * the whole catalog with nothing capping it, the list is exactly the
 * sitemap's, the page can display every recipe, no internal archive code
 * leaks, and every cuisine link returns its recipes.
 *
 * It runs the same code the API route runs (`loadCatalogPage`) and judges the
 * response after a JSON round trip, which is what a browser receives.
 *
 * Read-only: it issues SELECTs only, and clears the Redis credentials before
 * anything loads so the catalog loader cannot fill a shared cache.
 *
 * Usage:
 *   DATABASE_URL=postgresql://… bun scripts/auditRecipeCatalogAccess.ts
 *   bun scripts/auditRecipeCatalogAccess.ts --allow-static   # audit the bundled fallback
 *
 * Exits 1 when any check fails.
 *
 * @file scripts/auditRecipeCatalogAccess.ts
 */

// A module, not a global script: without a top-level export, this file's
// `main` would collide with every other script's.
export {};

// Before any app module loads: the loader writes the catalog to Redis after a
// database read, and this audit must never write.
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

async function main(): Promise<boolean> {
  const allowStatic = process.argv.includes("--allow-static");
  const [{ CUISINES_METADATA }, { cuisineToSlug }, { loadCatalogPage }, { auditCatalog }] =
    await Promise.all([
      import("../src/data/cuisines/index"),
      import("../src/utils/cuisineSlug"),
      import("../src/lib/recipes/catalogService"),
      import("../src/lib/recipes/catalogAudit"),
    ]);
  const { getServerRecipes } = await import("../src/actions/recipes");
  const { LocalRecipeService } = await import("../src/services/LocalRecipeService");
  const { listCanonicalRecipeIds } = await import("../src/lib/recipes/recipeRefResolver");

  const everything = { limit: null, offset: 0 };
  // One cold load first, alone: concurrent cold loads race on the pool and on
  // the loader's shared degraded flag. The degraded loader returns the static
  // array itself, so identity is the race-free test for "fell back".
  const staticRecipes = await getServerRecipes();
  const live = await LocalRecipeService.getAllRecipes();
  const degraded = live === staticRecipes;
  const canonicalIds = await listCanonicalRecipeIds();
  const page = await loadCatalogPage({}, everything);
  const all = await loadCatalogPage({ cuisine: "all" }, everything);

  const cuisines: Array<{ name: string; served: number }> = [];
  for (const key of Object.keys(CUISINES_METADATA)) {
    const name = CUISINES_METADATA[key]?.name ?? key;
    const slice = await loadCatalogPage({ cuisine: cuisineToSlug(name) }, everything);
    cuisines.push({ name, served: slice.total });
  }

  const report = auditCatalog({
    // The wire: what the browser parses.
    wire: JSON.parse(JSON.stringify(page)),
    canonicalIds,
    allCuisinesTotal: all.total,
    cuisines,
    degraded,
    allowStatic,
  });

  console.log("Recipe catalog access audit");
  console.log(`  live catalog:        ${live.length} recipes${degraded ? " (degraded: the bundled static list)" : ""}`);
  console.log(`  static catalog:      ${staticRecipes.length} recipes`);
  console.log(`  sitemap recipes:     ${canonicalIds.length}`);
  console.log(`  served by the API:   ${report.served}`);
  console.log(`  without a cuisine:   ${report.noCuisine} (reachable through "All")`);
  const unlinked = Object.entries(report.unlinkedCuisines);
  if (unlinked.length > 0)
    console.log(`  cuisines no card links to: ${unlinked.map(([c, n]) => `${c} (${n})`).join(", ")}`);
  console.log("");
  for (const c of report.checks) console.log(`  ${c.ok ? "PASS" : "FAIL"}  ${c.name}\n        ${c.detail}`);
  console.log(`\n${report.ok ? "Every recipe is accessible." : "Some recipes are not accessible."}`);
  return report.ok;
}

main()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err: unknown) => {
    console.error("[auditRecipeCatalogAccess]", err);
    process.exit(1);
  });
