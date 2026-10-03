/**
 * The count-portion table is USDA's, verbatim, and is exactly what the
 * generator produces from the recorded FDC portions.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { MEASURED_COUNT_PORTIONS } from "../../../src/data/cooking/measuredCountPortions";
import { renderCountPortions } from "../countPortionsSource";
import { parseCountLabel } from "../fdcCountLabels";

const ROOT = join(__dirname, "..", "..", "..");
const portionsJson: unknown = JSON.parse(readFileSync(join(ROOT, "scripts", "data", "usda-portions.json"), "utf8"));
const recorded = z
  .object({
    results: z.array(
      z.object({
        ingredient: z.string(),
        fdcId: z.number(),
        fdcDescription: z.string(),
        portions: z.array(z.object({ amount: z.number(), unit: z.string(), modifier: z.string().nullable(), gramWeight: z.number() })),
      }),
    ),
  })
  .parse(portionsJson);

describe("measuredCountPortions.ts", () => {
  it("is exactly the generator's output (regenerate with `bun run generate:count-portions`)", () => {
    const committed = readFileSync(join(ROOT, "src", "data", "cooking", "measuredCountPortions.ts"), "utf8");
    expect(renderCountPortions(portionsJson).source).toBe(committed);
  });

  it("carries every weight verbatim from the FDC record it names", () => {
    expect(MEASURED_COUNT_PORTIONS.length).toBeGreaterThan(0);
    for (const row of MEASURED_COUNT_PORTIONS) {
      const record = recorded.results.find((r) => r.ingredient === row.ingredient);
      expect(record?.fdcId).toBe(row.fdcId);
      expect(record?.fdcDescription).toBe(row.fdcDescription);
      for (const count of row.counts) {
        const source = record?.portions.find((p) => (p.modifier ?? p.unit) === count.label && p.amount === count.amount);
        expect(source?.gramWeight).toBe(count.gramWeight);
      }
    }
  });
});

describe("parseCountLabel", () => {
  it.each([
    ["large", "Egg", { count: "large" }],
    ["extra large", "Egg", { count: "extra large" }],
    ['Potato small (1-3/4" to 2-1/2" dia)', "Potato", { count: "small" }],
    ['medium whole (2-3/5" dia)', "Tomato", { count: "medium" }],
    ["sprigs", "Cilantro", { count: "sprig" }],
    ['fruit (2" dia)', "Lime", { count: "whole" }],
    ['beet (2" dia)', "Beet", { count: "whole" }],
    ["pepper", "jalapenos", { count: "whole" }],
  ])("reads %j of %s as a count", (label, ingredient, want) => {
    expect(parseCountLabel(label, ingredient)).toEqual(want);
  });

  it("keeps USDA's size on a part rather than dropping it", () => {
    expect(parseCountLabel('stalk, medium (7-1/2" - 8" long)', "celery")).toEqual({ count: "stalk", qualifier: "medium" });
    expect(parseCountLabel('ear, medium (6-3/4" to 7-1/2" long) yields', "corn")).toEqual({ count: "ear", qualifier: "medium" });
  });

  it.each([
    ["cup (4.86 large eggs)", "Egg"], // a volume that mentions a size
    ["Italian tomato", "Tomato"], // another item
    ["cherry", "Tomato"],
    ['strip large (3" long)', "Carrot"],
    ["lemon yields", "Lemon Juice"], // the juice of a lemon, not one lemon juice
    ["eggplant, peeled (yield from 1-1/4 lb)", "eggplant"],
    ["NLEA serving", "Lime"],
  ])("refuses %j of %s", (label, ingredient) => {
    expect(parseCountLabel(label, ingredient)).toBeNull();
  });
});
