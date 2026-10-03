/**
 * /search?q= (omnibar Phase 3): strictly noindex, server-rendered, and never a
 * dead end. The index is the static catalog through the real loader, mocked
 * only at getSearchIndex so the page runs the production search.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { getServerRecipes } from "@/actions/recipes";
import { buildIndexForRecipes } from "@/lib/search/loader";
import type { SearchIndex } from "@/lib/search/searchIndex";

jest.mock("@/lib/search/loader", () => {
  const actual: typeof import("@/lib/search/loader") = jest.requireActual("@/lib/search/loader");
  return { ...actual, getSearchIndex: jest.fn() };
});

import { getSearchIndex } from "@/lib/search/loader";
import { pageQuery } from "@/lib/search/searchPage";
import SearchPage, { generateMetadata } from "../page";

let index: SearchIndex;

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
}, 120_000);

beforeEach(() => {
  jest.mocked(getSearchIndex).mockResolvedValue(index);
});

async function html(q: string | string[] | undefined): Promise<string> {
  return renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q }) }));
}

describe("pageQuery", () => {
  it.each([
    [undefined, ""],
    ["  spinach   eggs ", "spinach eggs"],
    [["thai", "korean"], "thai"],
    ["x".repeat(150), "x".repeat(100)],
  ])("%p → %p", (raw, expected) => {
    expect(pageQuery(raw)).toBe(expected);
  });
});

describe("metadata", () => {
  it("is noindex for every query, with a /search canonical", async () => {
    for (const q of ["spinach", ""]) {
      const meta = await generateMetadata({ searchParams: Promise.resolve({ q }) });
      expect(meta.robots).toEqual({ index: false, follow: true, googleBot: { index: false, follow: true } });
      expect(meta.alternates).toEqual({ canonical: "/search" });
    }
  });
});

describe("SearchPage", () => {
  it("spinach: the hero links to the dossier, then every recipe that uses it, as links", async () => {
    const page = await html("spinach");
    expect(page).toContain('href="/ingredients/spinach"');
    const count = Number(/RECIPES WITH SPINACH · (\d+)/.exec(page)?.[1]);
    expect(count).toBeGreaterThanOrEqual(15);
    const recipeLinks = page.match(/href="\/recipes\/[^"]+"/g) ?? [];
    expect(recipeLinks.length).toBeGreaterThanOrEqual(count);
  });

  it("a recipe listed under the hero is not counted again under RECIPES", async () => {
    const page = await html("pinach");
    const match = /RECIPES · (?:(\d+) OF )?(\d+)</.exec(page);
    const shown = (page.split("RECIPES · ")[1] ?? "").match(/href="\/recipes\//g)?.length ?? 0;
    expect(shown).toBeGreaterThan(0);
    // Every remaining match is listed, so the heading is a plain count, never "1 OF 4".
    expect(match?.[1]).toBeUndefined();
    expect(Number(match?.[2])).toBe(shown);
  });

  it("the hero carries its actions and its pairings (Phase 4)", async () => {
    const page = await html("spinach");
    expect(page).toContain('href="/recipe-builder?ingredients=spinach"');
    expect(page).toContain("Add to pantry");
    expect(page).toContain("PAIRS WITH SPINACH");
  });

  it("pinach: says which ingredient it is showing, and why", async () => {
    expect(await html("pinach")).toContain("Showing results for <strong>spinach</strong> (no exact match for “pinach”)");
  });

  it("xqzv: offers next steps instead of an empty page (D5)", async () => {
    const page = await html("xqzv");
    expect(page).toContain("Nothing in the kitchen matches");
    expect(page).toContain('href="/recipe-generator"');
  });

  it("an unavailable index says so rather than claiming zero results", async () => {
    jest.mocked(getSearchIndex).mockRejectedValue(new Error("db down"));
    const page = await html("spinach");
    expect(page).toContain("Search is unavailable right now");
    expect(page).not.toContain("Nothing in the kitchen matches");
  });

  it("vegan breakfast: each chip with its basis written out (Phase 5)", async () => {
    const page = await html("vegan breakfast");
    expect(page).toContain('aria-label="How these results were read"');
    expect(page).toMatch(/>Vegan<\/span>No ingredient, by its line or its catalog card, is an animal product/);
    expect(page).toMatch(/>Breakfast<\/span>The meal the recipe catalog files it under\./);
  });

  it("spinach eggs feta: the recipes that use them together, with what each lacks", async () => {
    const page = await html("spinach eggs feta");
    expect(page).toMatch(/RECIPES WITH SPINACH \+ CHICKEN EGG \+ FETA · \d+/);
    expect(page).toContain("USES 3 OF 3");
    expect(page).toMatch(/USES 2 OF 3 · MISSING [A-Z ,]+</);
  });

  it("two ingredients no recipe uses together: says so, and still links both", async () => {
    const page = await html("vanilla fish sauce");
    expect(page).toContain("No recipe uses Vanilla, Fish Sauce together yet.");
    expect(page).toContain('href="/ingredients/vanilla"');
    expect(page).toContain('href="/ingredients/fish-sauce"');
    expect(page).not.toContain("Nothing in the kitchen matches");
  });

  it("no query renders the form alone", async () => {
    const page = await html(undefined);
    expect(page).toContain('action="/search"');
    expect(page).not.toContain("RECIPES WITH");
    expect(getSearchIndex).not.toHaveBeenCalled();
  });
});
