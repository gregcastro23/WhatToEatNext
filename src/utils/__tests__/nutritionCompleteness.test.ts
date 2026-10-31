import { accountsForRecipe, MAX_UNRESOLVED_MASS_SHARE, type WeighedLine } from "../nutritionCompleteness";

const counted = (grams: number): WeighedLine => ({ kind: "counted", grams });
const unresolved = (grams: number | null): WeighedLine => ({ kind: "unresolved", grams });

describe("accountsForRecipe", () => {
  it("accepts a recipe whose every line is weighed and resolved", () => {
    expect(accountsForRecipe([counted(500), counted(30), { kind: "zero", grams: 700 }])).toBe(true);
  });

  it("refuses a resolved line with no gram weight rather than guessing one", () => {
    expect(accountsForRecipe([counted(500), { kind: "unweighable" }])).toBe(false);
  });

  it("refuses an unresolved line of unknown mass", () => {
    expect(accountsForRecipe([counted(500), unresolved(null)])).toBe(false);
  });

  it("lets a 0 kcal line of unknown mass through (a pinch of salt)", () => {
    expect(accountsForRecipe([counted(500), { kind: "zero", grams: null }])).toBe(true);
  });

  it("allows unresolved mass up to the limit, and not past it", () => {
    expect(MAX_UNRESOLVED_MASS_SHARE).toBe(0.1);
    expect(accountsForRecipe([counted(900), unresolved(100)])).toBe(true);
    expect(accountsForRecipe([counted(899), unresolved(101)])).toBe(false);
  });

  it("holds a line's cut spread against the unresolved share", () => {
    // "1 cup walnuts, toasted" names no cut: 80 g (ground) counted, up to 40 g
    // more (pieces or chips). 40 g of 400 g known is the limit; of 399 g, past it.
    const walnuts: WeighedLine = { kind: "counted", grams: 80, spread: 40 };
    expect(accountsForRecipe([counted(280), walnuts])).toBe(true);
    expect(accountsForRecipe([counted(279), walnuts])).toBe(false);
  });

  it("counts water and salt toward the recipe's mass", () => {
    // 60 g unresolved of 600 g known: exactly the limit, because the 400 g of water counts.
    expect(accountsForRecipe([counted(140), { kind: "zero", grams: 400 }, unresolved(60)])).toBe(true);
  });

  it("refuses a recipe with no known mass", () => {
    expect(accountsForRecipe([])).toBe(false);
    expect(accountsForRecipe([{ kind: "zero", grams: null }])).toBe(false);
  });
});
