/**
 * The omnibar's sections, merge rule and Smart Enter over real responses
 * (static catalog through the API's own core and serializer).
 */
import type { SearchIndex } from "@/lib/search/searchIndex";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { matchNav } from "../navMatches";
import { buildOmnibarModel, LIMITS, smartEnterTarget, type OmnibarModel } from "../omnibarModel";
import { NO_HERO_STATE, type HeroState } from "../omnibarHero";
import type { LinkRow, OmnibarRow, SearchStatus } from "../omnibarTypes";
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
    expect(sectionIds(m).slice(0, 3)).toEqual(["hero", "hero-actions", "with"]);
    const [hero] = m.sections[0]?.rows ?? [];
    expect(hero).toMatchObject({ type: "hero", label: "Spinach", href: "/ingredients/spinach" });
    const withRows = m.sections[2]?.rows ?? [];
    expect(withRows.length).toBeGreaterThan(0);
    expect(withRows.length).toBeLessThanOrEqual(LIMITS.containing);
    expect(withRows.every((r) => r.href.startsWith("/recipes/"))).toBe(true);
    expect(m.sections[2]?.title).toMatch(/^RECIPES WITH SPINACH · \d+$/);
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

describe("hero actions (Phase 4)", () => {
  function heroModel(query: string, heroState: HeroState, response: OmnibarResponse = wire(index, query)): OmnibarModel {
    return buildOmnibarModel({ query, response, status: "ready", recent: [], heroState });
  }
  const chips = (m: OmnibarModel): OmnibarRow[] => m.sections.find((s) => s.id === "hero-actions")?.rows ?? [];

  it("spinach: Cook with this, Add to pantry, and Show pairings with the count", () => {
    const m = heroModel("spinach", { pantry: new Set(), pairingsFor: null });
    const response = wire(index, "spinach");
    expect(chips(m).map((r) => [r.label, r.href])).toEqual([
      ["Cook with this", "/recipe-builder?ingredients=spinach"],
      ["Add to pantry", "/pantry"],
      [`Show pairings · ${response.hero?.pairings.length}`, "/ingredients/spinach#pairings"],
    ]);
    expect(m.sections.find((s) => s.id === "hero-actions")).toMatchObject({ layout: "chips", label: "Actions for Spinach" });
    expect(sectionIds(m)).not.toContain("pairings");
  });

  it("a card already in the pantry says so, and the chip then opens the pantry", () => {
    const [, pantry] = chips(heroModel("spinach", { pantry: new Set(["spinach"]), pairingsFor: null }));
    expect(pantry).toMatchObject({ type: "action", action: "pantry", label: "In your pantry", pressed: true, href: "/pantry" });
  });

  it("open pairings sit under the actions: cards link to their dossier, other names search", () => {
    const m = heroModel("spinach", { pantry: new Set(), pairingsFor: "spinach" });
    expect(sectionIds(m).slice(0, 4)).toEqual(["hero", "hero-actions", "pairings", "with"]);
    const rows = m.sections.find((s) => s.id === "pairings")?.rows ?? [];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.href.startsWith("/ingredients/") || r.href.startsWith("/search?q="))).toBe(true);
    expect(rows.some((r) => r.href.startsWith("/ingredients/"))).toBe(true);
    expect(chips(m)[2]).toMatchObject({ label: "Hide pairings", pressed: true });
  });

  it("a card with no pairings offers no pairings chip", () => {
    const response = wire(index, "spinach");
    const bare: OmnibarResponse = { ...response, hero: response.hero ? { ...response.hero, pairings: [] } : null };
    expect(chips(heroModel("spinach", NO_HERO_STATE, bare)).map((r) => r.label)).toEqual(["Cook with this", "Add to pantry"]);
  });

  it("the merge rule hides the actions with the hero", () => {
    expect(sectionIds(heroModel("pantry", NO_HERO_STATE))).not.toContain("hero-actions");
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
    // An exact sauce opens focused on /sauces (Phase 4).
    ["carbonara", "/sauces?focus=carbonara"],
    ["xqzv", "/search?q=xqzv"],
  ])("%s → %s", (query, href) => {
    expect(enterHref(query)).toBe(href);
  });

  it("carbonara's top hit really is an exact sauce (the control for the row above)", () => {
    expect(wire(index, "carbonara").top).toMatchObject({ kind: "sauce", exact: true, href: "/sauces?focus=carbonara" });
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
