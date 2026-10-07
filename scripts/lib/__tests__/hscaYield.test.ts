import { servingsFromYield } from "../hscaYield";

describe("servingsFromYield: a yield is servings only when it says so", () => {
  it.each<[string, number]>([
    ["6 servings", 6],
    ["4 Servings", 4],
    ["6-8 servings", 6],
    ["3 to 4 servings", 3],
    ["4 portions", 4],
    ["Serves 8", 8],
    ["Serves 6 to 8", 6],
    ["Eight servings", 8],
    ["approximately 10 servings", 10],
    ["approximately 8-10 portions", 8],
    ["1 terrine (3 x 11 inches) 8-10 servings", 8],
    ["1 loaf pan (9 x 5 inches) (10-12 servings)", 10],
    ["One 10-inch tart (8-10 servings)", 8],
    ["2 cups (8 servings)", 8],
    ["10 cups (20 half-cup servings)", 20],
    ["2 Cups (sixteen 1-ounce servings)", 16],
    ["1 1/2 cups (twelve 2-tablespoon servings)", 12],
    ["3/4 cup (six 2-tablespoon servings)", 6],
    ["4 1/2 cups, nine 1/2 cup servings", 9],
    ["Six 1/2-cup servings", 6],
    ["6 half-cup servings", 6],
    ["16 4-ounce servings", 16],
    ["16 (1 ounce) portions", 16],
    ["12 (1/4 cup servings)", 12],
    ["12-16 one-tablespoon servings", 12],
    ["24 bite-size serving", 24],
    ["30 side dish servings", 30],
    ["1/2 chicken (2 servings)", 2],
    ["1/2 Chicken, 2 servings", 2],
    ["approximately 24 pancakes for 6 servings", 6],
    ["4 Servings (2 - 2 1/2 tablespoons per serving)", 4],
    ["3 servings (approximately 8 per person)", 3],
  ])("%s -> %i", (text, servings) => {
    expect(servingsFromYield(text)).toBe(servings);
  });

  it.each([
    "3 cups",
    "1 quart",
    "2 loaves",
    "Two 8-inch cakes",
    "9-inch tart",
    "16 mini muffins",
    "24 small cookies",
    "Yield: approximately 12 scones",
    "approximately 1 1/4 cups",
    "6 ounce servings",
    "___ cups, ___ 1-cup servings",
    "",
  ])("%j states no servings", (text) => {
    expect(servingsFromYield(text)).toBeUndefined();
  });

  it("a missing yield states none", () => {
    expect(servingsFromYield(undefined)).toBeUndefined();
    expect(servingsFromYield(null)).toBeUndefined();
  });
});
