/** @jest-environment node */
import { convertRecipe, formulaLines, statedBakeMinutes } from "@/lib/baking/recipes/convertRecipe";
import { shapeFor } from "@/lib/baking/recipes/geometry";
import { PROCESS_PROFILES } from "@/lib/baking/recipes/processProfiles";
import { readInstructions } from "@/lib/baking/recipes/readInstructions";
import { readLines } from "@/lib/baking/recipes/readLines";
import type { RecipeSource, SourceLine } from "@/lib/baking/recipes/sourceTypes";
import { unreadMassShare, verdictFor } from "@/lib/baking/recipes/verdict";

function line(amount: number, unit: string, name: string, notes: string | null = null): SourceLine {
  return { name, amount, unit, notes, optional: false };
}

const COOKIE_LINES = [
  line(2.25, "cups", "all-purpose flour"),
  line(1, "tsp", "baking soda"),
  line(1, "tsp", "kosher salt"),
  line(1, "cup", "unsalted butter"),
  line(0.75, "cup", "granulated sugar"),
  line(0.75, "cup", "packed brown sugar"),
  line(2, "large", "eggs"),
  line(1, "pinch", "flaky sea salt", "For finishing."),
];

function cookie(overrides: Partial<RecipeSource> = {}): RecipeSource {
  return {
    id: "test-cookie",
    name: "Test Chocolate Chip Cookies",
    cuisine: "american",
    category: "cookie",
    servings: 24,
    cookMinutes: 12,
    lines: COOKIE_LINES,
    steps: ["Preheat the oven to 375°F (190°C).", "Bake for 10-12 minutes until the edges are golden."],
    ...overrides,
  };
}

describe("reading the steps", () => {
  it("takes a stated Celsius figure over converting the Fahrenheit beside it", () => {
    expect(readInstructions(["Preheat the oven to 375°F (190°C)."]).ovenC?.value).toEqual({ celsius: 190, fromFahrenheit: false, unitAssumed: false });
    expect(readInstructions(["Preheat oven to 350°F."]).ovenC?.value).toEqual({ celsius: ((350 - 32) * 5) / 9, fromFahrenheit: true, unitAssumed: false });
    expect(readInstructions(["Preheat oven to 350°."]).ovenC?.value.unitAssumed).toBe(true);
  });

  it("never reads the inside of the bread as the oven, but reads it as the done point", () => {
    const r = readInstructions(["Pre-heat oven to 350°F.", "Bake until golden and fully cooked (inner temp about 190°F)."]);
    expect(Math.round(r.ovenC?.value.celsius ?? 0)).toBe(177);
    expect(r.laterOvenC).toBeNull();
    expect(r.doneC?.value).toBeCloseTo(((190 - 32) * 5) / 9, 9);
  });

  it("still reads the oven from a sentence that also names the inside's temperature", () => {
    const r = readInstructions(["Bake at 375°F until an internal thermometer reads 190°F."]);
    expect(r.ovenC?.value).toEqual({ celsius: ((375 - 32) * 5) / 9, fromFahrenheit: true, unitAssumed: false });
    expect(r.doneC?.value).toBeCloseTo(((190 - 32) * 5) / 9, 9);
  });

  it("reads a bake time, not a baking-soda time or a rest", () => {
    expect(readInstructions(["Stir the baking soda for 2 to 3 minutes.", "Bake for 25-30 minutes, then let cool 10 minutes."]).bakeMinutes?.value).toEqual([25, 30]);
    expect(readInstructions(["Let rise 45 minutes.", "Bake 1 hour."]).bakeMinutes?.value).toEqual([60, 60]);
    expect(readInstructions(["Bake 15 minutes.", "Rotate and bake 10 minutes more."]).bakeMinutes?.value).toEqual([25, 25]);
  });

  it("reads the pan, the plate and how many", () => {
    expect(readInstructions(["Grease a 9-inch round cake pan."]).pan?.value).toEqual({ kind: "round", diameterIn: 9 });
    expect(readInstructions(["Pour into a 9 x 13 inch baking pan."]).pan?.value).toEqual({ kind: "rect", widthIn: 9, lengthIn: 13 });
    expect(readInstructions(["Oil and flour two 8-inch cake pans."]).pans?.value).toBe(2);
    expect(readInstructions(["Oil and flour two 8-inch cake pans."]).pieces).toBeNull();
    expect(readInstructions(["Slide onto a hot pizza stone."]).plate?.value).toBe("stone");
  });
});

describe("the product's shape", () => {
  const reading = readInstructions(["Pour into a 9 x 13 inch pan."]);

  it("computes a slab's depth from batter volume and the stated pan", () => {
    const rule = PROCESS_PROFILES.cake?.shape;
    if (rule === undefined) throw new Error("no cake profile");
    const out = shapeFor({ rule, batterMl: 1500, reading, servings: 12, piecesByName: false, fixedShape: null });
    const area = 9 * 0.0254 * 13 * 0.0254;
    expect(out).toMatchObject({ ok: true, value: { geometry: { shape: "slab", dimensionM: (1500e-6) / area, contactFraction: 1 } } });
  });

  it("splits the batter across the pans the recipe names", () => {
    const rule = PROCESS_PROFILES.cake?.shape;
    if (rule === undefined) throw new Error("no cake profile");
    const two = readInstructions(["Oil and flour two 8-inch cake pans."]);
    const out = shapeFor({ rule, batterMl: 1000, reading: two, servings: 8, piecesByName: false, fixedShape: null });
    const oneArea = Math.PI * ((8 * 0.0254) / 2) ** 2;
    expect(out).toMatchObject({ ok: true, value: { geometry: { dimensionM: 1000e-6 / (2 * oneArea), spanM: Math.sqrt(oneArea) } } });
  });

  it("sizes pieces from the stated yield", () => {
    const rule = PROCESS_PROFILES.bread?.shape;
    if (rule === undefined) throw new Error("no bread profile");
    const out = shapeFor({ rule, batterMl: 2400, reading: readInstructions([]), servings: 24, piecesByName: true, fixedShape: null });
    expect(out).toMatchObject({ ok: true, value: { geometry: { shape: "sphere", dimensionM: Math.cbrt((3 * 100e-6) / (4 * Math.PI)) } } });
  });

  it("refuses a shape outside the simulator's envelope with the reason", () => {
    const rule = PROCESS_PROFILES.flatbread?.shape;
    if (rule === undefined) throw new Error("no flatbread profile");
    expect(shapeFor({ rule, batterMl: 50, reading: readInstructions([]), servings: null, piecesByName: false, fixedShape: null })).toMatchObject({ ok: false, reason: expect.stringMatching(/2–500 mm/) });
  });
});

describe("the verdict", () => {
  const clean = readLines(COOKIE_LINES);

  it("lets a fully read cookie through", () => {
    expect(verdictFor("cookie", clean, unreadMassShare(clean), null)).toEqual({ simulable: true });
  });

  it("refuses pastry, pie, a crust alone and a recipe served with something else", () => {
    expect(verdictFor("pie-tart", clean, 0, null, "Apple Pie")).toMatchObject({ simulable: false, reasons: [expect.stringMatching(/^a pie or tart/)] });
    expect(verdictFor("pie-tart", clean, 0, null, "OLIVE OIL CRUST")).toMatchObject({ simulable: false, reasons: [expect.stringMatching(/^a crust/)] });
    expect(verdictFor("pastry", clean, 0, null, "Baklava")).toMatchObject({ simulable: false });
    expect(verdictFor("enriched-bread", clean, 0, null, "Granita con Brioche")).toMatchObject({ simulable: false, reasons: [expect.stringMatching(/served with granita/)] });
  });

  it("refuses an unread line of unknown mass, and more than 10 % unread by mass", () => {
    const unknown = readLines([...COOKIE_LINES, line(1, "cup", "za'atar blend")]);
    expect(unreadMassShare(unknown)).toBeNull();
    expect(verdictFor("cookie", unknown, null, null)).toMatchObject({ simulable: false, reasons: [expect.stringMatching(/unknown/)] });
    const heavy = readLines([...COOKIE_LINES, line(150, "g", "fresh strawberries")]);
    const share = unreadMassShare(heavy) ?? 0;
    expect(share).toBeCloseTo(150 / (150 + readLines(COOKIE_LINES).matched.reduce((s, m) => s + m.grams, 0)), 12);
    expect(verdictFor("cookie", heavy, share, null)).toMatchObject({ simulable: false, reasons: [expect.stringMatching(/over the 10 %/)] });
  });

  it("accepts exactly 10 % unread: the gate is the repo's ≤ 10 %", () => {
    expect(verdictFor("cookie", clean, 0.1, null)).toEqual({ simulable: true });
  });

  it("refuses a recipe whose structure is unreadable or absent", () => {
    const blend = readLines([line(2, "cups", "gluten-free flour blend"), line(1, "cup", "sugar")]);
    const v = verdictFor("cake", blend, unreadMassShare(blend), null);
    expect(v).toMatchObject({ simulable: false });
    expect(v.simulable ? [] : v.reasons).toEqual(expect.arrayContaining([expect.stringMatching(/its structure/), "no flour or starch that sets a crumb was matched"]));
  });
});

describe("converting a recipe", () => {
  it("builds the formula one line per vector, in order, with the grams the lines weigh", () => {
    const read = readLines([...COOKIE_LINES, line(0.25, "cup", "granulated sugar")]);
    const lines = formulaLines(read);
    expect(lines.map((l) => l.ingredientId)).toEqual(["all-purpose-flour", "baking-soda", "salt", "butter", "granulated-sugar", "brown-sugar", "whole-egg"]);
    expect(lines.find((l) => l.ingredientId === "granulated-sugar")?.grams).toBe(188);
  });

  it("bakes at the recipe's own oven and time, and labels every supplied value DECLARED with its reason", () => {
    const { preset, report } = convertRecipe(cookie());
    expect(preset?.oven).toMatchObject({ ovenC: 190, bakeMinutes: 12, plate: { materialId: "aluminium" } });
    expect(report.stated.map((s) => s.field)).toEqual(expect.arrayContaining(["oven temperature", "bake time"]));
    expect(report.statedBakeMinutes).toEqual([10, 12]);
    for (const a of report.assumptions) expect({ field: a.field, kind: a.basis.kind, hasReason: (a.basis.note ?? "").length > 10 }).toMatchObject({ field: a.field, hasReason: true });
    expect(report.assumptions.map((a) => a.field)).toEqual(expect.arrayContaining(["batter density", "done at core", "piece thickness", "pan"]));
    expect(preset?.doneCoreC).toBe(85);
  });

  it("falls back to the profile, declared, when the recipe states no oven or time", () => {
    const { preset, report } = convertRecipe(cookie({ steps: ["Mix and scoop."], cookMinutes: null }));
    expect(preset?.oven.ovenC).toBe(180);
    expect(report.assumptions.find((a) => a.field === "oven temperature")?.basis.kind).toBe("DECLARED");
    expect(report.statedBakeMinutes).toBeNull();
  });

  it("prefers the steps' done temperature over a cook-time field", () => {
    const src = cookie({ category: "enriched-bread", name: "Test Challah", steps: ["Pre-heat oven to 350°F.", "Bake until done (internal temp 190°F)."], cookMinutes: 15 });
    expect(statedBakeMinutes(src, readInstructions(src.steps))).toBeNull();
    expect(convertRecipe(src).preset?.doneCoreC).toBe(88);
  });

  it("gives a refused recipe its report and no lab inputs", () => {
    const { preset, report } = convertRecipe(cookie({ category: "pie-tart", name: "Test Apple Pie" }));
    expect(preset).toBeNull();
    expect(report.verdict.simulable).toBe(false);
    expect(report.matched.length).toBeGreaterThan(0);
  });
});

describe("review findings (2026-11-16)", () => {
  it("reads both stages of a two-stage bake in one sentence, and declares baking at the first temperature", () => {
    const steps = ["Preheat the oven to 450°F.", "Bake at 450°F for 15 minutes, then reduce to 375°F and bake 30 minutes more."];
    const r = readInstructions(steps);
    expect(r.bakeMinutes?.value).toEqual([45, 45]);
    expect(r.ovenC?.value.celsius).toBeCloseTo(((450 - 32) * 5) / 9, 9);
    expect(r.laterOvenC).toBeCloseTo(((375 - 32) * 5) / 9, 9);
    const { report } = convertRecipe(cookie({ steps }));
    expect(report.assumptions.some((a) => a.field === "oven temperature" && /first stated temperature/.test(a.basis.note ?? ""))).toBe(true);
  });

  it("never sums an alternative bake time, a rest, or a cut count", () => {
    expect(readInstructions(["Bake 25-30 minutes, or bake 35 minutes for a darker crust."]).bakeMinutes?.value).toEqual([25, 30]);
    expect(readInstructions(["Bake 35 to 40 minutes, until a toothpick comes out clean.", "Meanwhile, bake the pecans 8 minutes."]).bakeMinutes?.value).toEqual([35, 40]);
    expect(readInstructions(["Bake until golden.", "Once baked, let rest 15 minutes."]).bakeMinutes).toBeNull();
    const r = readInstructions(["Pour into a 9-inch round pan.", "Cut into 12 pieces."]);
    expect(r.pans).toBeNull();
    const rule = PROCESS_PROFILES.cake?.shape;
    if (rule === undefined) throw new Error("no cake profile");
    const out = shapeFor({ rule, batterMl: 1000, reading: r, servings: 12, piecesByName: false, fixedShape: null });
    expect(out).toMatchObject({ ok: true, value: { geometry: { dimensionM: 1000e-6 / (Math.PI * ((9 * 0.0254) / 2) ** 2) } } });
  });

  it("reads rounds rolled thin as layers, one pan each", () => {
    const r = readInstructions(["Divide the dough into 10 equal balls.", "Roll each into a thin circle and bake one at a time for 4 to 5 minutes."]);
    expect(r.layers?.value).toBe(10);
    expect(r.pans).toBeNull();
  });

  it("bakes long enough to reach a stated done temperature, ignoring the cook-time field", () => {
    const src = cookie({ category: "enriched-bread", name: "Test Challah", steps: ["Pre-heat oven to 350°F.", "Bake until done (internal temp 190°F)."], cookMinutes: 15 });
    expect(convertRecipe(src).preset?.oven.bakeMinutes).toBe(PROCESS_PROFILES["enriched-bread"]?.bakeMinutes.value);
  });

  it("does not count oats, whose starch sets nothing here, as a crumb", () => {
    const oats = readLines([line(2, "cups", "rolled oats"), line(0.5, "cup", "honey")]);
    const v = verdictFor("cookie", oats, unreadMassShare(oats), null);
    expect(v.simulable ? [] : v.reasons).toContain("no flour or starch that sets a crumb was matched");
  });
});
