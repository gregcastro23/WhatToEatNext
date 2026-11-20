/**
 * Unit tests for sauceScaling yield parsing, formatted unit agreement, and ingredient scaling.
 */
import {
  calculateScaleFactor,
  formatScaledYield,
  parseYieldToServings,
  scaleIngredientString,
  scaleSauceIngredients,
} from "../sauceScaling";

describe("sauceScaling", () => {
  it("parses cup, fractional, and serving yields accurately", () => {
    expect(parseYieldToServings("2 cups")).toBe(2);
    expect(parseYieldToServings("Makes about 1/2 cup")).toBe(0.5);
    expect(parseYieldToServings("Makes about 3 cups")).toBe(3);
    expect(parseYieldToServings("Serves 4")).toBe(4);
    expect(parseYieldToServings("Makes about 6 cups (enough for 8-10 servings)")).toBe(6);
    expect(parseYieldToServings("")).toBe(1);
  });

  it("scales and pluralizes yield descriptions cleanly across bounds", () => {
    expect(formatScaledYield("2 cups", 1)).toBe("2 cups");
    expect(formatScaledYield("2 cups", 0.5)).toBe("1 cup");
    expect(formatScaledYield("2 cups", 1.5)).toBe("3 cups");
    expect(formatScaledYield("2 cups", 4)).toBe("8 cups");
    expect(formatScaledYield("Makes about 1 cup", 2)).toBe("Makes about 2 cups");
    expect(formatScaledYield("Makes about 1/2 cup", 2)).toBe("Makes about 1 cup");
    expect(formatScaledYield("Makes about 6 cups (enough for 8-10 servings)", 0.5)).toBe(
      "Makes about 3 cups (enough for 4-5 servings)",
    );
    expect(formatScaledYield("Serves 4", 0.5)).toBe("Serves 2");
    expect(formatScaledYield(undefined, 1)).toBe("Serves 4");
    expect(formatScaledYield(undefined, 0.5)).toBe("Serves 2");
  });

  it("scales ingredient quantities and metric parentheticals cleanly", () => {
    expect(scaleIngredientString("5 tbsp (70g) unsalted butter", 0.5)).toBe(
      "2 1/2 tbsp (35g) unsalted butter",
    );
    expect(scaleIngredientString("1/4 cup grated Parmigiano-Reggiano", 1.5)).toBe(
      "3/8 cup grated Parmigiano-Reggiano",
    );
    expect(scaleSauceIngredients(["2 cups whole milk", "1 pinch nutmeg"], 4)).toEqual([
      "8 cups whole milk",
      "4 pinch nutmeg",
    ]);
    expect(calculateScaleFactor("2 cups", 4)).toBe(2);
  });
});
