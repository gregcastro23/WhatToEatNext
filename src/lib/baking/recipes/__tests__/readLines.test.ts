/** @jest-environment node */
import { bakingIngredient, hasBakingIngredient } from "@/data/baking";
import { FDC_BAKING_RECORDS } from "@/data/baking/fdcRecords";
import { INGREDIENT_RULES } from "@/lib/baking/recipes/ingredientRules";
import { matchedLineGrams, SPOON_BOUND_G_PER_ML, unmatchedLineGrams } from "@/lib/baking/recipes/lineGrams";
import { matchIngredient } from "@/lib/baking/recipes/matchIngredient";
import { readLines, setAsideReason } from "@/lib/baking/recipes/readLines";
import type { SourceLine } from "@/lib/baking/recipes/sourceTypes";
import { CUP_ML, readUnit, statedPackageGrams } from "@/lib/baking/recipes/units";

function line(amount: number, unit: string, name: string, notes: string | null = null): SourceLine {
  return { name, amount, unit, notes, optional: false };
}

function vectorOf(name: string): string | null {
  const { outcome } = matchIngredient(name);
  return outcome.kind === "matched" ? outcome.vectorId : null;
}

function grams(l: SourceLine, vectorId: string): number {
  const g = matchedLineGrams(l, vectorId);
  if (!g.ok) throw new Error(g.reason);
  return g.grams;
}

describe("matching a recipe's ingredient name to a vector", () => {
  it("every rule names a vector that exists", () => {
    for (const rule of INGREDIENT_RULES) if (rule.outcome.kind === "matched") expect({ rule: String(rule.pattern), exists: hasBakingIngredient(rule.outcome.vectorId) }).toEqual({ rule: String(rule.pattern), exists: true });
  });

  it("the specific flour wins over the general one", () => {
    expect(vectorOf("whole wheat pastry flour")).toBe("whole-wheat-pastry-flour");
    expect(vectorOf("whole wheat bread flour")).toBe("whole-wheat-flour");
    expect(vectorOf("unbleached white high-gluten flour")).toBe("bread-flour");
    expect(vectorOf("cake flour")).toBe("cake-flour");
    expect(vectorOf("unbleached all-purpose flour")).toBe("all-purpose-flour");
  });

  it("reads an unspecified flour as all-purpose, and says so", () => {
    const { outcome } = matchIngredient("flour");
    expect(outcome).toEqual({ kind: "matched", vectorId: "all-purpose-flour", note: expect.stringMatching(/unspecified/) });
  });

  it("never reads a finished product or prepared dough as its flour", () => {
    expect(matchIngredient("graham cracker crumbs").outcome).toMatchObject({ kind: "unmatched", structural: false });
    expect(matchIngredient("phyllo dough, thawed").outcome).toMatchObject({ kind: "unmatched", structural: true });
    expect(matchIngredient("2 unbaked 9-inch pie doughs").outcome).toMatchObject({ kind: "unmatched", structural: true });
    expect(matchIngredient("white sandwich bread").outcome).toMatchObject({ kind: "unmatched" });
    // "flour tortillas" names flour, so the product rules must come before the flour rules.
    expect(matchIngredient("flour tortillas").outcome).toMatchObject({ kind: "unmatched", reason: expect.stringMatching(/finished/) });
    expect(matchIngredient("gluten-free flour blend").outcome).toMatchObject({ kind: "unmatched", structural: true });
  });

  it("keeps lookalike names apart", () => {
    expect(vectorOf("buttermilk")).toBe("buttermilk");
    expect(vectorOf("peanut butter")).toBe("peanut-butter");
    expect(vectorOf("unsalted butter, softened")).toBe("butter");
    expect(vectorOf("eggplants")).toBeNull();
    expect(vectorOf("2 eggs")).toBe("whole-egg");
    expect(vectorOf("almond milk")).toBe("almond-milk");
    expect(vectorOf("blanched almonds")).toBe("almonds");
    expect(vectorOf("maple crystals")).toBe("maple-sugar");
    expect(vectorOf("packed dark brown sugar")).toBe("brown-sugar");
    expect(vectorOf("confectioners' sugar")).toBe("powdered-sugar");
  });

  it("reads the first of the recipe's alternatives and keeps the rest", () => {
    const m = matchIngredient("almond milk or soymilk");
    expect(m.outcome).toMatchObject({ vectorId: "almond-milk" });
    expect(m.setAside).toEqual(["soymilk"]);
  });
});

describe("units", () => {
  it("tells a tablespoon (T) from a teaspoon (t)", () => {
    expect(readUnit("T")).toMatchObject({ kind: "volume", measure: "tbsp" });
    expect(readUnit("t")).toMatchObject({ kind: "volume", measure: "tsp" });
  });

  it("weighs ounces and pounds by definition, exactly", () => {
    expect(readUnit("oz")).toEqual({ kind: "weight", gramsPerUnit: 28.349523125, label: "oz" });
    expect(readUnit("lbs")).toEqual({ kind: "weight", gramsPerUnit: 453.59237, label: "lb" });
    expect(statedPackageGrams("can (14oz)")).toBe(14 * 28.349523125);
  });

  it("calls a pinch a trace and an unknown unit unknown", () => {
    expect(readUnit("pinch").kind).toBe("trace");
    expect(readUnit("bunch")).toEqual({ kind: "unknown", unit: "bunch" });
  });
});

describe("grams from the vector's own FDC portions", () => {
  it("weighs a cup of all-purpose flour as FDC 168894 does", () => {
    const g = matchedLineGrams(line(2, "cups", "all-purpose flour"), "all-purpose-flour");
    expect(g).toMatchObject({ ok: true, grams: 250, basis: { kind: "MEASURED", fdcId: 168894 } });
  });

  it("derives a tablespoon from the measured cup by the exact 1/16, and calls it DERIVED", () => {
    const g = matchedLineGrams(line(1, "tbsp", "bread flour"), "bread-flour");
    expect(g).toMatchObject({ ok: true, grams: 137 / 16, basis: { kind: "DERIVED", fdcId: 168896 } });
  });

  it("honours the line's own qualifier, and declares the convention when it names none", () => {
    expect(grams(line(1, "cup", "packed brown sugar"), "brown-sugar")).toBe(220);
    expect(grams(line(1, "cup", "loosely packed brown sugar"), "brown-sugar")).toBe(145);
    const plain = matchedLineGrams(line(1, "cup", "brown sugar"), "brown-sugar");
    expect(plain).toMatchObject({ ok: true, grams: 220, basis: { kind: "DECLARED" } });
  });

  it("reads an egg of no stated size as a US large egg, and says so", () => {
    expect(matchedLineGrams(line(2, "", "eggs"), "whole-egg")).toMatchObject({ ok: true, grams: 100, assumption: expect.stringMatching(/large/) });
    expect(matchedLineGrams(line(1, "medium", "egg"), "whole-egg")).toMatchObject({ ok: true, grams: 44, assumption: null });
    expect(grams(line(1, "piece", "stick butter"), "butter")).toBe(113);
  });

  it("borrows a stated record where FDC weighed another form, and never weighs one it cannot", () => {
    const pastry = matchedLineGrams(line(1, "cup", "whole wheat pastry flour"), "whole-wheat-pastry-flour");
    expect(pastry).toMatchObject({ ok: true, grams: 120, basis: { kind: "DECLARED", fdcId: 168893 } });
    expect(matchedLineGrams(line(1, "cup", "almond flour"), "almond-flour")).toMatchObject({ ok: true, grams: 80, basis: { kind: "DECLARED", fdcId: 170187 } });
    expect(matchedLineGrams(line(1, "cup", "cassava flour"), "cassava-flour")).toMatchObject({ ok: false, reason: expect.stringMatching(/30 g reference/) });
    expect(grams(line(1, "cup", "almond milk"), "almond-milk")).toBe(237);
  });

  it("weighs a weight unit by definition and notes an ounce of a liquid", () => {
    expect(matchedLineGrams(line(100, "g", "water"), "water")).toMatchObject({ ok: true, grams: 100, basis: { kind: "COMPUTED" }, assumption: null });
    expect(matchedLineGrams(line(8, "ounces", "milk"), "whole-milk")).toMatchObject({ ok: true, assumption: expect.stringMatching(/fluid ounces/) });
  });

  it("refuses a line with no amount", () => {
    expect(matchedLineGrams(line(0, "cup", "sugar"), "granulated-sugar")).toEqual({ ok: false, reason: "no amount stated" });
  });
});

describe("the mass of an unmatched line", () => {
  it("bounds a spoon of anything by the densest measured cup among the records", () => {
    const densest = Math.max(...FDC_BAKING_RECORDS.flatMap((r) => r.portions.filter((p) => p.modifier === "cup").map((p) => p.grams / CUP_ML)));
    expect(SPOON_BOUND_G_PER_ML).toBe(densest);
    expect(unmatchedLineGrams(line(1, "tsp", "ground cardamom"), "cardamom")).toMatchObject({ bound: true, grams: (CUP_ML / 48) * densest });
  });

  it("knows nothing about a cup of an unweighed ingredient", () => {
    expect(unmatchedLineGrams(line(1, "cup", "za'atar blend"), "za'atar blend")).toBeNull();
  });
});

describe("lines that are not part of the batter", () => {
  it("sets aside toppings, glazes, optional lines and pinches — with the reason", () => {
    expect(setAsideReason(line(1, "large", "egg", "for brushing"))).toMatch(/outside the batter/);
    expect(setAsideReason(line(700, "g", "sour cream", "The foundation of the frosting."))).toMatch(/frosting/);
    expect(setAsideReason({ ...line(1, "cup", "walnuts"), optional: true })).toMatch(/optional/);
    expect(setAsideReason(line(1, "pinch", "flaky salt"))).toMatch(/trace/);
    expect(setAsideReason(line(1, "piece", "sea salt"))).toMatch(/1 piece/);
  });

  it("keeps a line whose note only sends its extra elsewhere", () => {
    expect(setAsideReason(line(4, "cups", "all-purpose flour", "plus for dusting"))).toBeNull();
    expect(setAsideReason(line(3, "large", "eggs", "2 for the dough, 1 for the egg wash"))).toBeNull();
  });

  it("accounts for every line exactly once", () => {
    const lines = [line(2, "cups", "flour"), line(1, "pinch", "salt"), line(1, "cup", "za'atar blend"), line(1, "tsp", "vanilla extract")];
    const read = readLines(lines);
    expect(read.matched.length + read.unmatched.length + read.setAside.length).toBe(lines.length);
    expect(read.assumptions.some((a) => a.basis.kind === "DECLARED" && /unspecified/.test(a.basis.note ?? ""))).toBe(true);
    expect(bakingIngredient(read.matched[0]?.vectorId ?? "water").name).toBe("All-purpose flour");
  });
});

describe("review findings (2026-11-16)", () => {
  it("sets aside an after-bake sauce or soak named by its note, but not an ingredient its note merely names", () => {
    expect(setAsideReason(line(1, "cup", "heavy cream", "For the sauce."))).toMatch(/outside the batter/);
    expect(setAsideReason(line(0.5, "cup", "sugar", "Dissolved into the syrup."))).toMatch(/another component/);
    expect(setAsideReason(line(0.5, "cup", "maple syrup", "Grade A maple syrup preferred."))).toBeNull();
    expect(setAsideReason(line(1, "cup", "icing sugar"))).toBeNull();
    expect(vectorOf("icing sugar")).toBe("powdered-sugar");
  });

  it("keeps fresh yeast apart from dry yeast", () => {
    expect(matchIngredient("fresh yeast").outcome).toMatchObject({ kind: "unmatched", reason: expect.stringMatching(/70 % water/) });
    expect(vectorOf("active dry yeast")).toBe("instant-yeast");
  });

  it("keeps white, brown and sweet rice flours apart", () => {
    expect(vectorOf("brown rice flour")).toBe("brown-rice-flour");
    expect(vectorOf("white sweet rice flour")).toBe("sweet-rice-flour");
    expect(vectorOf("white rice flour")).toBe("rice-flour");
    expect(vectorOf("rice flour")).toBe("rice-flour");
  });

  it("never reads an unknown flour as wheat, and says when pastry flour is read as cake flour", () => {
    for (const name of ["hazelnut flour", "self-rising flour", "chestnut flour", "einkorn flour"]) expect({ name, outcome: matchIngredient(name).outcome }).toMatchObject({ name, outcome: { kind: "unmatched", structural: true } });
    expect(matchIngredient("pastry flour").outcome).toEqual({ kind: "matched", vectorId: "cake-flour", note: expect.stringMatching(/pastry flour/) });
    expect(vectorOf("unbleached white all-purpose flour")).toBe("all-purpose-flour");
    expect(vectorOf("graham flour")).toBe("whole-wheat-flour");
  });

  it("reads oat flour as oats, says so, and does not weigh its cup as the flakes'", () => {
    expect(matchIngredient("oat flour").outcome).toMatchObject({ vectorId: "rolled-oats", note: expect.stringMatching(/oat flour/) });
    expect(matchedLineGrams(line(0.75, "cup", "oat flour"), "rolled-oats")).toMatchObject({ ok: false, reason: expect.stringMatching(/flakes/) });
    expect(grams(line(0.75, "cup", "rolled oats"), "rolled-oats")).toBeCloseTo(0.75 * 81, 9);
    expect(grams(line(60, "g", "oat flour"), "rolled-oats")).toBe(60);
  });

  it("keeps lookalikes off the base ingredient", () => {
    expect(vectorOf("pomegranate molasses")).toBeNull();
    expect(vectorOf("peanut butter chips")).toBeNull();
    expect(vectorOf("butter-flavored shortening")).toBe("vegetable-shortening");
    expect(vectorOf("cream of tartar")).toBe("cream-of-tartar");
    expect(vectorOf("cream cheese")).toBeNull();
  });

  it("weighs a pint as two cups and refuses a unit it cannot read", () => {
    expect(grams(line(1, "pint", "whole milk"), "whole-milk")).toBe(488);
    expect(matchedLineGrams(line(1, "dozen", "eggs"), "whole-egg")).toMatchObject({ ok: false });
  });

  it("weighs heavy cream's fluid cup, not its whipped one", () => {
    expect(matchedLineGrams(line(1, "cup", "heavy cream"), "heavy-cream")).toMatchObject({ ok: true, grams: 238, basis: { kind: "MEASURED", fdcId: 170859 } });
  });

  it("declares a portion FDC weighed only in one qualified form, and reports every declared portion", () => {
    expect(matchedLineGrams(line(1, "cup", "cake flour"), "cake-flour")).toMatchObject({ ok: true, grams: 137, basis: { kind: "DECLARED", note: expect.stringMatching(/only as/) } });
    const read = readLines([line(1, "cup", "brown sugar")]);
    expect(read.assumptions).toEqual([expect.objectContaining({ basis: expect.objectContaining({ kind: "DECLARED", note: expect.stringMatching(/packed/) }) })]);
  });
});
