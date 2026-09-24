/**
 * The omnibar's sections, merge rule and Smart Enter over real responses
 * (static catalog through the API's own core and serializer).
 */
import type { SearchIndex } from "@/lib/search/searchIndex";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { matchNav } from "../navMatches";
import { buildOmnibarModel, LIMITS, smartEnterTarget, type OmnibarModel } from "../omnibarModel";
import type { LinkRow, SearchStatus } from "../omnibarTypes";
import { loadRecent, pushRecent } from "../recentPicks";
import { loadIndex, wire } from "./helpers/wireSearch";

let index: SearchIndex;

beforeAll(async () => {
  index = await loadIndex();
}, 120_000);

function model(query: string, status: SearchStatus = "ready", response: OmnibarResponse | null = wire(index, query)): OmnibarModel {
  return buildOmnibarModel({ query, response, status, recent: [] });
}

function sectionIds(m: OmnibarModel): string[] {
  return m.sections.map((s) => s.id);
}

function enterHref(query: string): string {
  const m = model(query);
  return smartEnterTarget(query, m.exactNav, wire(index, query)).href;
}

describe("buildOmnibarModel", () => {
  it("empty query: recent picks, then quick actions", () => {
    const recent: LinkRow[] = [
      { type: "link", id: "recent:x", kind: "ingredient", label: "Spinach", hint: "VEGETABLE", href: "/ingredients/spinach", icon: "diamond", external: false },
    ];
    const m = buildOmnibarModel({ query: "  ", response: null, status: "idle", recent });
    expect(sectionIds(m)).toEqual(["recent", "actions"]);
    expect(m.sections[1]?.rows.map((r) => r.href)).toContain("/pantry");
  });

  it("spinich: the correction, the spinach hero, then the recipes that use it", () => {
    const m = model("spinich");
    expect(m.correction).toEqual({ from: "spinich", to: "spinach", basis: "edit-distance" });
    expect(sectionIds(m).slice(0, 2)).toEqual(["hero", "with"]);
    const [hero] = m.sections[0]?.rows ?? [];
    expect(hero).toMatchObject({ type: "hero", label: "Spinach", href: "/ingredients/spinach" });
    const withRows = m.sections[1]?.rows ?? [];
    expect(withRows.length).toBeGreaterThan(0);
    expect(withRows.length).toBeLessThanOrEqual(LIMITS.containing);
    expect(withRows.every((r) => r.href.startsWith("/recipes/"))).toBe(true);
    expect(m.sections[1]?.title).toMatch(/^RECIPES WITH SPINACH · \d+$/);
    expect(sectionIds(m).at(-1)).toBe("all");
  });

  it("a recipe listed under the hero is not listed again under RECIPES", () => {
    const m = model("spinach");
    const ids = (id: string): string[] => (m.sections.find((s) => s.id === id)?.rows ?? []).map((r) => r.href);
    const shown = new Set(ids("with"));
    expect(ids("recipes").filter((href) => shown.has(href))).toEqual([]);
  });

  it("pantry: the Pantry page leads and suppresses the server's fuzzy hero and correction (merge rule)", () => {
    const response = wire(index, "pantry");
    const m = model("pantry", "ready", response);
    expect(m.exactNav?.href).toBe("/pantry");
    expect(sectionIds(m)[0]).toBe("pages");
    expect(sectionIds(m)).not.toContain("hero");
    expect(m.correction).toBeNull();
    // The control: without the page match, the server alone would lead with a food hero or correction.
    expect(response.hero !== null || response.corrected !== null).toBe(true);
  });

  it("thai: the top hit's kind leads, and cuisines come before recipes", () => {
    const ids = sectionIds(model("thai"));
    expect(ids.indexOf("cuisine")).toBeLessThan(ids.indexOf("recipes"));
    expect(ids.indexOf("cuisine")).toBe(0);
  });

  it("xqzv: D5 next steps instead of a dead end, and no 'see all' into nothing", () => {
    const m = model("xqzv");
    expect(sectionIds(m)).toEqual(["none"]);
    expect(m.sections[0]?.rows.map((r) => r.href)).toEqual(["/recipe-generator", "/recipes", "/ingredients"]);
  });

  it("loading and error keep local pages and 'see all' while the server is away", () => {
    for (const status of ["loading", "error"] as const) {
      const m = model("pan", status, null);
      expect(sectionIds(m)).toEqual(["pages", "all"]);
      expect(m.sections[1]?.rows[0]?.href).toBe("/search?q=pan");
    }
  });
});

describe("smartEnterTarget (Smart Enter)", () => {
  it.each([
    ["spinach", "/ingredients/spinach"],
    ["aubergine", "/ingredients/eggplant"],
    ["thai", "/cuisines/thai"],
    ["pantry", "/pantry"],
    ["recipes", "/recipes"],
    ["spinich", "/search?q=spinich"],
    // An exact sauce, but every sauce shares the /sauces page until Phase 4's ?focus=.
    ["carbonara", "/search?q=carbonara"],
    ["xqzv", "/search?q=xqzv"],
  ])("%s → %s", (query, href) => {
    expect(enterHref(query)).toBe(href);
  });

  it("carbonara's top hit really is an exact sauce (the control for the row above)", () => {
    expect(wire(index, "carbonara").top).toMatchObject({ kind: "sauce", exact: true, href: "/sauces" });
  });

  it("without this query's response yet, ↵ means the results page", () => {
    expect(smartEnterTarget("spinach", null, null)).toEqual({ href: "/search?q=spinach", label: "ALL RESULTS" });
  });
});

describe("matchNav", () => {
  it.each([
    ["pan", "/pantry", null],
    ["recipe b", "/recipe-builder", null],
    ["recipe", "/recipes", "/recipes"],
    ["Pantry", "/pantry", "/pantry"],
  ])("%s → first %s, exact %s", (query, first, exact) => {
    const { rows, exact: exactRow } = matchNav(query, LIMITS.pages);
    expect(rows[0]?.href).toBe(first);
    expect(exactRow?.href ?? null).toBe(exact);
  });

  it("food words that are not page names match no page", () => {
    expect(matchNav("spinach", LIMITS.pages).rows).toEqual([]);
  });
});

describe("recent picks", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips a pick, newest first, without duplicates", () => {
    const row: LinkRow = { type: "link", id: "ingredient:spinach", kind: "ingredient", label: "Spinach", hint: "INGREDIENT", href: "/ingredients/spinach", icon: "diamond", external: false };
    pushRecent(row);
    pushRecent({ ...row, id: "cuisine:thai", kind: "cuisine", label: "Thai", href: "/cuisines/thai" });
    pushRecent(row);
    expect(loadRecent().map((r) => r.href)).toEqual(["/ingredients/spinach", "/cuisines/thai"]);
  });

  it("drops stored entries that are not internal paths (storage is user-writable)", () => {
    window.localStorage.setItem(
      "alchm:omnibar:recent",
      JSON.stringify([
        { id: "a", kind: "page", label: "Evil", hint: "", href: "//evil.example" },
        { id: "b", kind: "page", label: "Also evil", hint: "", href: "javascript:alert(1)" },
        { id: "c", kind: "page", label: "Pantry", hint: "PANTRY", href: "/pantry" },
      ]),
    );
    expect(loadRecent().map((r) => r.href)).toEqual(["/pantry"]);
  });

  it("carries over the ⌘K palette's recents", () => {
    window.localStorage.setItem("alchm:palette:recent", JSON.stringify([{ id: "route:x", icon: "mortar", label: "Pantry", hint: "PANTRY · ENTER", href: "/pantry" }]));
    expect(loadRecent()).toMatchObject([{ kind: "page", label: "Pantry", href: "/pantry" }]);
  });
});
