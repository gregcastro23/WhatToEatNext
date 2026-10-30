import type { LiveIngredient } from "../hscaDbSync";
import { choosePlan, legacyLiveIngredients, liveLine, planRepair, type DishLine } from "../hscaParseRepair";

const line = (amount: number, unit: string, name: string, notes = ""): LiveIngredient => ({ name, unit, notes, amount, optional: false });
const dish = (amount: number, unit: string, name: string, notes = ""): DishLine => ({ amount, unit, name, notes });

describe("legacyLiveIngredients", () => {
  it("is what the first parser stored: the raw name, in the shape of a live line", () => {
    expect(legacyLiveIngredients(["¾ cup flour", "Salt to taste"])).toEqual([
      line(1, "piece", "¾ cup flour"),
      line(1, "piece", "salt to taste"),
    ]);
  });
});

describe("liveLine", () => {
  it("adds optional: false and nothing else", () => {
    expect(liveLine(dish(2, "cloves", "garlic", "minced"))).toEqual(line(2, "cloves", "garlic", "minced"));
  });
});

describe("planRepair", () => {
  const legacy = [line(1, "piece", "¾ cup flour"), line(1, "cup", "water")];
  const corrected = [dish(0.75, "cup", "flour"), dish(1, "cup", "water")];

  it("a line that is the old parser's output becomes the corrected line", () => {
    const plan = planRepair(legacy, legacy, corrected);
    expect(plan).toEqual({
      kind: "repair",
      repairs: [{ index: 0, from: legacy[0], to: line(0.75, "cup", "flour") }],
      before: legacy,
      ingredients: [line(0.75, "cup", "flour"), line(1, "cup", "water")],
    });
  });

  it("a row that already holds the corrected lines is clean", () => {
    expect(planRepair([line(0.75, "cup", "flour"), line(1, "cup", "water")], legacy, corrected)).toEqual({ kind: "clean" });
  });

  it("a line someone edited by hand is neither, and the whole row is left alone", () => {
    const edited = [line(1, "piece", "¾ cup flour, sifted"), line(1, "cup", "water")];
    const plan = planRepair(edited, legacy, corrected);
    expect(plan.kind).toBe("skip");
    expect(plan.kind === "skip" && plan.reason).toContain("line 0 is neither");
  });

  it("one edited line stops a row that also has a repairable line", () => {
    const stored = [line(1, "piece", "¾ cup flour"), line(2, "cups", "water")];
    expect(planRepair(stored, legacy, corrected).kind).toBe("skip");
  });

  it("a different number of lines is not this record", () => {
    const plan = planRepair([legacy[0]], legacy, corrected);
    expect(plan).toEqual({ kind: "skip", reason: "line counts differ: stored 1, source 2, hsca.ts 2" });
  });

  it("a stored line with a key the importer never wrote is refused rather than rewritten", () => {
    const plan = planRepair([{ ...legacy[0], asin: "B000" }, legacy[1]], legacy, corrected);
    expect(plan.kind).toBe("skip");
  });

  it("anything that is not a list of lines is refused", () => {
    expect(planRepair(null, legacy, corrected).kind).toBe("skip");
    expect(planRepair("flour", legacy, corrected).kind).toBe("skip");
  });
});

describe("choosePlan", () => {
  const legacy = [line(1, "piece", "salt to taste")];
  const corrected = [dish(1, "piece", "salt", "to taste")];

  it("with no record and no dish of that name there is nothing to compare with", () => {
    expect(choosePlan(legacy, [])).toEqual({ kind: "skip", reason: "no source record and hsca.ts dish of this name" });
  });

  it("two records that share a name repair the row when they agree", () => {
    const pairs = [{ legacy, corrected }, { legacy, corrected }];
    expect(choosePlan(legacy, pairs).kind).toBe("repair");
  });

  it("a record the row does not fit is ignored while another one fits", () => {
    const other = { legacy: [line(1, "piece", "sugar to taste")], corrected: [dish(1, "piece", "sugar", "to taste")] };
    expect(choosePlan(legacy, [other, { legacy, corrected }]).kind).toBe("repair");
  });

  it("records that fit and disagree leave the row alone", () => {
    const rival = { legacy, corrected: [dish(1, "piece", "table salt", "to taste")] };
    expect(choosePlan(legacy, [{ legacy, corrected }, rival])).toEqual({ kind: "skip", reason: "several records fit the row and disagree" });
  });
});
