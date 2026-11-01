/**
 * @jest-environment node
 *
 * A live recipe carries the ESMS totals stored in its read_model.
 *
 * [MEASURED 2026-10-31] mapRowToRecipe never surfaced
 * `read_model.alchemical_quantities`, so a recipe that exists only in the
 * database had no Spirit, Essence, Matter or Substance, and /api/adept-table
 * could not rank it. The real LocalRecipeService runs here; only its database,
 * Redis and Next edges are replaced.
 */
const mockRows: Array<Record<string, unknown>> = [];

jest.mock("@/lib/database", () => ({
  executeQuery: async () => ({ rows: mockRows }),
}));
jest.mock("@/lib/redis", () => ({
  redisGet: async () => null,
  redisSet: async () => undefined,
  redisDel: async () => undefined,
}));
jest.mock("@/lib/assets", () => ({ getValidatedAssetUrl: async (url: string) => url }));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/utils/logger", () => {
  const quiet = { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
  return { logger: quiet, createLogger: () => quiet };
});
jest.mock("next/server", () => ({ after: (work: () => void) => work() }));
jest.mock("@/actions/recipes", () => ({ getServerRecipes: async () => [] }));

import { LocalRecipeService } from "../LocalRecipeService";

const STORED = { spirit: 4.5, essence: 2, matter: 7.25, substance: 1, totalASharp: 14.75, matchRate: 0.9 };

function row(id: string, readModel: Record<string, unknown> | null): Record<string, unknown> {
  return {
    id,
    name: `Recipe ${id}`,
    cuisine: "Italian",
    category: "main",
    instructions: ["Cook"],
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    servings: 2,
    dietary_tags: [],
    allergens: [],
    read_model:
      readModel === null
        ? null
        : { id, name: `Recipe ${id}`, ingredients: [{ name: "tomato", amount: 1, unit: "piece" }], ...readModel },
  };
}

async function load(rows: Array<Record<string, unknown>>) {
  mockRows.length = 0;
  mockRows.push(...rows);
  LocalRecipeService.clearCache();
  return LocalRecipeService.getAllRecipes();
}

describe("a live recipe's alchemical quantities", () => {
  it("are the four totals stored in read_model.alchemical_quantities", async () => {
    const [recipe] = await load([row("a", { alchemical_quantities: STORED })]);
    expect(recipe).toMatchObject({ spirit: 4.5, essence: 2, matter: 7.25, substance: 1 });
  });

  it("do not carry the bookkeeping fields onto the recipe", async () => {
    const [recipe] = await load([row("a", { alchemical_quantities: STORED })]);
    expect(recipe).not.toHaveProperty("totalASharp");
    expect(recipe).not.toHaveProperty("matchRate");
  });

  it.each([
    ["no stored quantities", { }],
    ["null", { alchemical_quantities: null }],
    ["a malformed value", { alchemical_quantities: { spirit: "4.5", essence: 2, matter: 7, substance: 1 } }],
    ["a missing axis", { alchemical_quantities: { spirit: 4.5, essence: 2, matter: 7 } }],
    ["a negative axis", { alchemical_quantities: { spirit: -1, essence: 2, matter: 7, substance: 1 } }],
    ["all zero (no ingredient matched)", { alchemical_quantities: { spirit: 0, essence: 0, matter: 0, substance: 0, matchRate: 0 } }],
  ])("are left off the recipe, not defaulted, for %s", async (_label, readModel) => {
    const [recipe] = await load([row("a", readModel)]);
    for (const axis of ["spirit", "essence", "matter", "substance"]) expect(recipe).not.toHaveProperty(axis);
  });

  it("are left off a row that has no read_model at all", async () => {
    const [recipe] = await load([row("a", null)]);
    for (const axis of ["spirit", "essence", "matter", "substance"]) expect(recipe).not.toHaveProperty(axis);
  });

  it("does not disturb the rest of the recipe", async () => {
    const [withEsms] = await load([row("a", { alchemical_quantities: STORED })]);
    const [without] = await load([row("a", {})]);
    const { spirit: _s, essence: _e, matter: _m, substance: _u, ...rest } = withEsms ?? {};
    expect(rest).toEqual(without);
  });
});
