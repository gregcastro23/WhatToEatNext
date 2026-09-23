import { getIngredientRecipeIndex } from "@/data/ingredientRecipeIndex";
import {
  buildRecipeIdentityIndex,
  indexRecipeIdAliases,
  normalizeRecipeName,
  type RecipeIdentityRecord,
} from "../recipeIdentity";

const DAN_DAN_STATIC: RecipeIdentityRecord = {
  id: "chinese-dinner-all-authentic-sichuan-dan-dan-noodles",
  name: "Authentic Sichuan Dan Dan Noodles",
  cuisine: "chinese",
};
const DAN_DAN_LIVE: RecipeIdentityRecord = {
  id: "0ba1b88e-32aa-44f1-9819-0a13df60f735",
  name: "Authentic Sichuan Dan Dan Noodles",
  cuisine: "Chinese",
};

describe("buildRecipeIdentityIndex", () => {
  it("bridges a static catalog id to its live twin", () => {
    const index = buildRecipeIdentityIndex([DAN_DAN_STATIC], [DAN_DAN_LIVE]);
    expect(index.resolve(DAN_DAN_STATIC.id)).toEqual({
      kind: "twin",
      staticId: DAN_DAN_STATIC.id,
      liveId: DAN_DAN_LIVE.id,
    });
    expect(index.stats).toMatchObject({ twins: 1, staticOnly: 0, ambiguous: 0 });
  });

  it("bridges the ingredient-index id form to the same twin", () => {
    const index = buildRecipeIdentityIndex([DAN_DAN_STATIC], [DAN_DAN_LIVE]);
    expect(index.resolve("chinese-authentic-sichuan-dan-dan-noodles")).toEqual({
      kind: "twin",
      staticId: DAN_DAN_STATIC.id,
      liveId: DAN_DAN_LIVE.id,
    });
  });

  it("keeps accent-distinct live recipes apart by matching exact names first", () => {
    const accented: RecipeIdentityRecord = { id: "live-accented", name: "Bún Bò Huế", cuisine: "Vietnamese" };
    const plain: RecipeIdentityRecord = { id: "live-plain", name: "Bun Bo Hue", cuisine: "Vietnamese" };
    const index = buildRecipeIdentityIndex(
      [
        { id: "vietnamese-lunch-all-bn-b-hu", name: "Bún Bò Huế", cuisine: "vietnamese" },
        { id: "vietnamese-dinner-all-bun-bo-hue", name: "Bun Bo Hue", cuisine: "vietnamese" },
      ],
      [accented, plain],
    );
    expect(index.resolve("vietnamese-lunch-all-bn-b-hu")).toMatchObject({ liveId: "live-accented" });
    expect(index.resolve("vietnamese-dinner-all-bun-bo-hue")).toMatchObject({ liveId: "live-plain" });
    expect(index.stats.ambiguous).toBe(0);
  });

  it("falls back to diacritic-folded names when no exact name matches", () => {
    const index = buildRecipeIdentityIndex(
      [{ id: "vietnamese-breakfast-winter-cho", name: "Cháo", cuisine: "vietnamese" }],
      [{ id: "live-chao", name: "Chao", cuisine: "Vietnamese" }],
    );
    expect(index.resolve("vietnamese-breakfast-winter-cho")).toMatchObject({ kind: "twin", liveId: "live-chao" });
  });

  it("splits a shared name by cuisine", () => {
    const index = buildRecipeIdentityIndex(
      [{ id: "middleeastern-dinner-winter-moussaka", name: "Moussaka", cuisine: "middle eastern" }],
      [
        { id: "live-greek", name: "Moussaka", cuisine: "Greek" },
        { id: "live-me", name: "Moussaka", cuisine: "Middle Eastern" },
      ],
    );
    expect(index.resolve("middleeastern-dinner-winter-moussaka")).toMatchObject({ liveId: "live-me" });
  });

  it("treats an internal archive code as no cuisine when tie-breaking", () => {
    const index = buildRecipeIdentityIndex(
      [{ id: "hsca-lunch-all-cruciferous-salad", name: "CRUCIFEROUS SALAD", cuisine: "hsca" }],
      [
        { id: "live-greek", name: "Cruciferous Salad", cuisine: "Greek" },
        { id: "live-archive", name: "CRUCIFEROUS SALAD" },
      ],
    );
    expect(index.resolve("hsca-lunch-all-cruciferous-salad")).toMatchObject({ liveId: "live-archive" });
  });

  it("leaves an unsplittable name static-only and counts it ambiguous", () => {
    const index = buildRecipeIdentityIndex(
      [{ id: "thai-dessert-all-bua-loi", name: "Bua Loi", cuisine: "thai" }],
      [
        { id: "live-1", name: "Bua Loi", cuisine: "Thai" },
        { id: "live-2", name: "Bua Loi", cuisine: "Thai" },
      ],
    );
    expect(index.resolve("thai-dessert-all-bua-loi")).toEqual({ kind: "static-only", staticId: "thai-dessert-all-bua-loi" });
    expect(index.stats).toMatchObject({ ambiguous: 1, staticOnly: 1, twins: 0 });
    expect(index.staticOnlyIds).toEqual(["thai-dessert-all-bua-loi"]);
  });

  it("resolves a static recipe with no live twin to itself", () => {
    const index = buildRecipeIdentityIndex(
      [{ id: "korean-dessert-winter-hotteok", name: "Hotteok", cuisine: "korean" }],
      [DAN_DAN_LIVE],
    );
    expect(index.resolve("korean-dessert-winter-hotteok")).toEqual({
      kind: "static-only",
      staticId: "korean-dessert-winter-hotteok",
    });
    expect(index.resolve("korean-hotteok")).toEqual({ kind: "static-only", staticId: "korean-dessert-winter-hotteok" });
  });

  it("keeps the first of two static recipes sharing an id", () => {
    const index = buildRecipeIdentityIndex(
      [DAN_DAN_STATIC, { id: DAN_DAN_STATIC.id, name: "Something Else", cuisine: "chinese" }],
      [DAN_DAN_LIVE],
    );
    expect(index.resolve(DAN_DAN_STATIC.id)).toMatchObject({ liveId: DAN_DAN_LIVE.id });
    expect(index.stats.staticRecipes).toBe(1);
  });

  it("drops an index alias two static recipes send to different pages", () => {
    const index = buildRecipeIdentityIndex(
      [
        { id: "korean-dinner-all-japchae", name: "Japchae", cuisine: "korean" },
        { id: "korean-dessert-all-japchae", name: "Japchae", cuisine: "korean" },
      ],
      [],
    );
    expect(index.resolve("korean-japchae")).toBeNull();
    expect(index.stats.aliasCollisions).toBe(1);
    expect(index.resolve("korean-dinner-all-japchae")).toMatchObject({ kind: "static-only" });
  });

  it("keeps a shared index alias when both static recipes land on the same twin", () => {
    const index = buildRecipeIdentityIndex(
      [
        { id: "korean-dinner-all-japchae", name: "Japchae", cuisine: "korean" },
        { id: "korean-lunch-all-japchae", name: "Japchae", cuisine: "korean" },
      ],
      [{ id: "live-japchae", name: "Japchae", cuisine: "Korean" }],
    );
    expect(index.resolve("korean-japchae")).toMatchObject({ kind: "twin", liveId: "live-japchae" });
    expect(index.stats.aliasCollisions).toBe(0);
  });

  it("never lets an index alias shadow a real static id", () => {
    const index = buildRecipeIdentityIndex(
      [
        { id: "thai-khao-soi", name: "Something", cuisine: "thai" },
        { id: "thai-dinner-winter-khao-soi", name: "Khao Soi", cuisine: "thai" },
      ],
      [],
    );
    expect(index.resolve("thai-khao-soi")).toEqual({ kind: "static-only", staticId: "thai-khao-soi" });
  });

  it("returns null for an unknown id", () => {
    const index = buildRecipeIdentityIndex([DAN_DAN_STATIC], [DAN_DAN_LIVE]);
    expect(index.resolve("not-a-recipe")).toBeNull();
  });
});

describe("indexRecipeIdAliases", () => {
  it("returns both spellings when the builder would have slugged raw escapes", () => {
    expect(indexRecipeIdAliases("vietnamese", "Bánh Xèo")).toEqual([
      "vietnamese-b-nh-x-o",
      "vietnamese-b-u00e1nh-x-u00e8o",
    ]);
  });

  it("reproduces the id of every recipe row in the committed ingredient index", () => {
    const rows = Object.values(getIngredientRecipeIndex()).flat();
    const unique = new Map(rows.map((row) => [row.recipeId, row]));
    const misses = [...unique.values()].filter(
      (row) => !indexRecipeIdAliases(row.cuisine, row.recipeName).includes(row.recipeId),
    );
    expect(unique.size).toBeGreaterThan(1000);
    expect(misses.map((row) => row.recipeId)).toEqual([]);
  });
});

describe("normalizeRecipeName", () => {
  it("folds diacritics and punctuation", () => {
    expect(normalizeRecipeName("Bánh Mì Ốp La")).toBe("banh mi op la");
    expect(normalizeRecipeName("White Bean with Garlic, Rosemary, and Tomatoes")).toBe(
      "white bean with garlic rosemary and tomatoes",
    );
  });
});
