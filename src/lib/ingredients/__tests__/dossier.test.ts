/**
 * The slug dossier's server side (omnibar Phase 2.5b): URL → target, the page
 * data from the (static-catalog) reverse index, and the JSON-LD.
 */
import { getServerRecipes } from "@/actions/recipes";
import { buildIndexForRecipes } from "@/lib/search/loader";

jest.mock("@/lib/search/loader", () => {
  const actual: typeof import("@/lib/search/loader") = jest.requireActual("@/lib/search/loader");
  return { ...actual, getSearchIndex: jest.fn() };
});

import { getSearchIndex } from "@/lib/search/loader";
import { dossierJsonLd, dossierSummary, getIngredientDossier, resolveDossierTarget } from "../dossier";
import { getIngredientCatalog } from "../ingredientCatalog";

function entry(slug: string): NonNullable<ReturnType<ReturnType<typeof getIngredientCatalog>["bySlug"]["get"]>> {
  const found = getIngredientCatalog().bySlug.get(slug);
  if (!found) throw new Error(`no card ${slug}`);
  return found;
}

beforeAll(async () => {
  const index = buildIndexForRecipes(await getServerRecipes());
  jest.mocked(getSearchIndex).mockResolvedValue(index);
}, 120_000);

describe("resolveDossierTarget", () => {
  it("renders the canonical slug", () => {
    expect(resolveDossierTarget("black-pepper")).toMatchObject({ kind: "dossier", entry: { key: "black_pepper" } });
  });

  it.each([
    ["Black%20Pepper", "black-pepper"],
    ["Black Pepper", "black-pepper"],
    ["black_pepper", "black-pepper"],
    ["Apple%20Cider%20Vinegar", "apple-cider-vinegar"],
    ["bay-leaves", "bay-leaf"],
    ["soymilk", "soy-milk"],
  ])("%s 308s to /ingredients/%s", (param, slug) => {
    expect(resolveDossierTarget(param)).toEqual({ kind: "redirect", slug });
  });

  it.each(["fresh-basil-leaves", "xqzv", "%E0%A4%A", ""])("%s is a 404: URLs are identities, never guesses", (param) => {
    expect(resolveDossierTarget(param)).toEqual({ kind: "missing" });
  });
});

describe("getIngredientDossier", () => {
  it("lists the same recipes, and count, the search hero does", async () => {
    const dossier = await getIngredientDossier(entry("spinach"));
    expect(dossier.recipeCount).toBeGreaterThanOrEqual(15);
    expect(dossier.recipes).toHaveLength(12);
    expect(dossier.recipes[0]?.name.toLowerCase()).toContain("spinach");
    expect(dossier.recipes.every(({ href }) => href.startsWith("/recipes/"))).toBe(true);
  });

  it("links pairings that are cards and keeps the rest as text (Phase 4)", async () => {
    const dossier = await getIngredientDossier(entry("spinach"));
    expect(dossier.pairings.length).toBeGreaterThan(0);
    expect(dossier.pairings.some((p) => p.slug !== null)).toBe(true);
    expect(dossier.pairings.every((p) => p.slug === null || getIngredientCatalog().bySlug.has(p.slug))).toBe(true);
    expect(dossier.pairings.map((p) => p.slug)).not.toContain("spinach");
  });

  it("gives a unified-only card its dossier: eggs", async () => {
    const dossier = await getIngredientDossier(entry("chicken-egg"));
    expect(dossier.card).toMatchObject({ name: "Chicken Egg", category: "protein" });
    expect(dossier.recipeCount).toBeGreaterThanOrEqual(100);
  });
});

describe("dossierJsonLd", () => {
  it("is a WebPage with a breadcrumb, absolute URLs throughout", async () => {
    const dossier = await getIngredientDossier(entry("spinach"));
    const graph: { "@graph": Array<Record<string, unknown>> } = JSON.parse(dossierJsonLd(dossier));
    const [page, crumbs] = graph["@graph"];
    expect(page).toMatchObject({ "@type": "WebPage", url: "https://alchm.kitchen/ingredients/spinach" });
    expect(String(page?.primaryImageOfPage)).toMatch(/^https:\/\//);
    expect(crumbs).toMatchObject({ "@type": "BreadcrumbList" });
  });

  it("escapes '<' so card text cannot close the script tag", async () => {
    const dossier = await getIngredientDossier(entry("spinach"));
    const hostile = { ...dossier, card: { ...dossier.card, description: "</script><script>alert(1)</script>" } };
    const json = dossierJsonLd(hostile);
    expect(json).not.toContain("<");
    expect(dossierSummary(hostile)).toBe("</script><script>alert(1)</script>");
  });
});
