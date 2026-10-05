import { parseIngredientString } from "../hscaDish";
import { legacyParseIngredientString } from "../hscaLegacyParse";

/** [source line, amount, unit, name, notes] */
type Case = [string, number, string, string, string];

const parsed = (line: string): [number, string, string, string] => {
  const p = parseIngredientString(line);
  return [p.amount, p.unit, p.rawName, p.notes] as [number, string, string, string];
};

describe("parseIngredientString: what the first parser got wrong", () => {
  describe("Unicode fractions are numbers", () => {
    it.each<Case>([
      ["¾ cup whole wheat pastry flour", 0.75, "cup", "whole wheat pastry flour", ""],
      ["1 ½ cups apple juice", 1.5, "cups", "apple juice", ""],
      ["½ teaspoon vanilla extract", 0.5, "teaspoon", "vanilla extract", ""],
      ["¼ cup + 2 tablespoons blanched almonds, ground to fine meal (measure then grind)", 0.375, "cup", "blanched almonds", "1/4 cup + 2 tablespoons; ground to fine meal (measure then grind)"],
    ])("%s", (line, amount, unit, name, notes) => {
      expect(parsed(line)).toEqual([amount, unit, name, notes]);
    });
  });

  describe("a range keeps its lower bound as the amount and says both bounds in the notes", () => {
    it.each<Case>([
      ["8-10 sheets rice paper", 8, "piece", "sheets rice paper", "8-10"],
      ["2-3 tablespoons soy milk", 2, "tablespoons", "soy milk", "2-3"],
      ["2 to 3 tablespoons shoyu", 2, "tablespoons", "shoyu", "2-3"],
      ["5 - 6 cups whole wheat pastry flour", 5, "cups", "whole wheat pastry flour", "5-6"],
      ["1/4-1/2 cup ice cold filtered water", 0.25, "cup", "ice cold filtered water", "1/4-1/2"],
      ["1 1/2-2 tablespoons boiling water", 1.5, "tablespoons", "boiling water", "1 1/2-2"],
      ["1-1 1/2 tablespoons rice syrup", 1, "tablespoons", "rice syrup", "1-1 1/2"],
      ["2 1/2 - 3 cups whole wheat pastry flour", 2.5, "cups", "whole wheat pastry flour", "2 1/2-3"],
      ["1-2 jalapeño peppers, minced", 1, "piece", "jalapeño peppers", "1-2; minced"],
    ])("%s", (line, amount, unit, name, notes) => {
      expect(parsed(line)).toEqual([amount, unit, name, notes]);
    });

    it("1-1/2 is a mixed number, not a range", () => {
      expect(parsed("1-1/2 cups water")).toEqual([1.5, "cups", "water", ""]);
    });
  });

  describe("a size is a note, the count is the count", () => {
    it.each<Case>([
      ["14-ounce can crushed tomatoes", 1, "can", "crushed tomatoes", "14-ounce"],
      ["8-ounce package tempeh, grated to texture of ground beef", 1, "package", "tempeh", "8-ounce; grated to texture of ground beef"],
      ["1 28-ounce can peeled tomatoes, chopped (pulsed in food processor)", 1, "can", "peeled tomatoes", "28-ounce; chopped (pulsed in food processor)"],
      ["1 (14 oz.) can coconut milk", 1, "can", "coconut milk", "14 oz."],
      ["2 (8-ounce) packages tempeh", 2, "packages", "tempeh", "8-ounce"],
      ["2-8 ounce packages tempeh", 2, "packages", "tempeh", "8-ounce"],
      ["12-8 inch skewers", 12, "piece", "skewers", "8-inch"],
      ["Six 8-inch skewers", 6, "piece", "skewers", "8-inch"],
      ["1-inch piece of ginger root, scrubbed, unpeeled", 1, "piece", "ginger root", "1-inch; scrubbed, unpeeled"],
      ["Four 3-ounce, skinless Arctic char filets (12 ounces), butterflied", 4, "piece", "skinless arctic char filets", "3-ounce; 12 ounces; butterflied"],
    ])("%s", (line, amount, unit, name, notes) => {
      expect(parsed(line)).toEqual([amount, unit, name, notes]);
    });
  });

  describe("what is not part of the ingredient moves to the notes", () => {
    it.each<Case>([
      ["Salt to taste", 1, "piece", "salt", "to taste"],
      ["Sea salt and freshly ground black pepper to taste", 1, "piece", "sea salt and freshly ground black pepper", "to taste"],
      ["1/4 teaspoon sea salt or to taste", 0.25, "teaspoon", "sea salt", "to taste"],
      ["2 tablespoons tamari or more to taste", 2, "tablespoons", "tamari", "to taste; or more"],
      ["Canola oil for frying (1/4 cup)", 1, "piece", "canola oil", "1/4 cup; for frying"],
      ["Mint leaves for garnish", 1, "piece", "mint leaves", "for garnish"],
      ["1/4 cup of extra virgin olive oil", 0.25, "cup", "extra virgin olive oil", ""],
      ["Handful of fresh thyme sprigs", 1, "handful", "fresh thyme sprigs", ""],
      ["2 pinches of sea salt", 2, "pinches", "sea salt", ""],
      ["Scant 1/4 teaspoon black pepper", 0.25, "teaspoon", "black pepper", "scant"],
      ["Garnish: 1 scallion, cut into thin diagonal", 1, "piece", "scallion", "garnish; cut into thin diagonal"],
      ["1/3 cup (4 oz.) of crushed pineapple (drained and squeezed to extract all liquid)", 0.3333333333333333, "cup", "crushed pineapple", "4 oz.; drained and squeezed to extract all liquid"],
      ["1/4 cup (2 ounces), Worcestershire sauce", 0.25, "cup", "worcestershire sauce", "2 ounces"],
      ["¼ cup whey or sauerkraut juice (optional, as starter)", 0.25, "cup", "whey or sauerkraut juice", "optional, as starter"],
      ["8 oz. tempeh, sliced on diagonal into 6-8 pieces", 8, "oz", "tempeh", "sliced on diagonal into 6-8 pieces"],
    ])("%s", (line, amount, unit, name, notes) => {
      expect(parsed(line)).toEqual([amount, unit, name, notes]);
    });
  });

  describe("a comma after an adjective does not end the ingredient", () => {
    it.each<Case>([
      ["1 cup toasted, chopped walnuts", 1, "cup", "toasted chopped walnuts", ""],
      ["1/2 pound skinless, boneless chicken breast (1 small)", 0.5, "pound", "skinless boneless chicken breast", "1 small"],
      ["4 boneless, skinless, chicken breast halves, pounded to 1/2 inch thickness", 4, "piece", "boneless skinless chicken breast halves", "pounded to 1/2 inch thickness"],
      ["8 tablespoons cold, sweet butter", 8, "tablespoons", "cold sweet butter", ""],
    ])("%s", (line, amount, unit, name, notes) => {
      expect(parsed(line)).toEqual([amount, unit, name, notes]);
    });
  });

  describe("a second quantity of the same kind is added", () => {
    it("1 gallon + 2 quarts is one and a half gallons", () => {
      expect(parsed("1 gallon + 2 quarts water")).toEqual([1.5, "gallon", "water", "1 gallon + 2 quarts"]);
    });

    it("1/2 cup + 2 tablespoons is 0.625 cup", () => {
      expect(parsed("1/2 cup + 2 tablespoons corn flour")).toEqual([0.625, "cup", "corn flour", "1/2 cup + 2 tablespoons"]);
    });

    it("1 tablespoon plus 1 teaspoon is 4/3 tablespoon", () => {
      const [amount, unit, name, notes] = parsed("1 tablespoon plus 1 teaspoon olive oil, divided");
      expect(amount).toBeCloseTo(4 / 3, 10);
      expect([unit, name, notes]).toEqual(["tablespoon", "olive oil", "1 tablespoon plus 1 teaspoon; divided"]);
    });

    it("1 tablespoon and 2 teaspoons, and a missing number, read the same way", () => {
      expect(parsed("1 tablespoon and 2 teaspoons extra virgin olive oil")[0]).toBeCloseTo(5 / 3, 10);
      expect(parsed("1 tablespoon + teaspoon sea salt")[0]).toBeCloseTo(4 / 3, 10);
    });
  });

  describe("garlic cloves are cloves of garlic (#937)", () => {
    it.each<Case>([
      ["4 garlic cloves, sliced", 4, "cloves", "garlic", "sliced"],
      ["1 garlic clove", 1, "clove", "garlic", ""],
      ["2 cloves of garlic, peeled", 2, "cloves", "garlic", "peeled"],
    ])("%s", (line, amount, unit, name, notes) => {
      expect(parsed(line)).toEqual([amount, unit, name, notes]);
    });
  });

  it("a unit is a whole word: Granny Smith and Canola are not units (#937)", () => {
    expect(parsed("4 Granny Smith apples, washed")).toEqual([4, "piece", "granny smith apples", "washed"]);
    expect(parsed("Canola oil for ramekins")).toEqual([1, "piece", "canola oil", "for ramekins"]);
  });

  it("leaves alone what it cannot read without a decision: pinch, whole cloves", () => {
    // A pinch needs a gram weight in unitConversion.ts before it can be a unit: a caloric
    // ingredient in a unit with no weight makes the recipe's nutrition disappear.
    expect(parsed("Pinch of sea salt")).toEqual([1, "piece", "pinch of sea salt", ""]);
    // "2 cloves" beside cinnamon sticks and cardamom pods is the spice, not garlic.
    expect(parsed("2 cloves")).toEqual([2, "cloves", "", ""]);
  });
});

describe("parseIngredientString: lines the first parser read correctly read the same", () => {
  it.each([
    "1 cup lime juice (approximately 6 limes)",
    "2 cups mint leaves (approximately 1/2 ounce)",
    "3 cups water",
    "1 pint blueberries, washed and stemmed",
    "4 cups pomegranate juice",
    "1 onion, finely chopped",
    "2 large eggs",
    "1/2 cup chopped walnuts, toasted",
    "6 ounces tofu, drained",
    "1 tablespoon extra virgin olive oil",
    "3 sprigs fresh thyme",
    "1 1/2 cups unbleached all-purpose flour",
    "one lemon, juiced",
    "Sea salt",
  ])("%s", (line) => {
    expect(parseIngredientString(line)).toEqual(legacyParseIngredientString(line));
  });
});

describe("legacyParseIngredientString is the frozen witness", () => {
  it("still reads the lines the way the importer did on 2026-10-04", () => {
    const old = (line: string) => {
      const p = legacyParseIngredientString(line);
      return [p.amount, p.unit, p.rawName, p.notes];
    };
    expect(old("¾ cup flour")).toEqual([1, "piece", "¾ cup flour", ""]);
    expect(old("8-10 sheets rice paper")).toEqual([8, "piece", "-10 sheets rice paper", ""]);
    expect(old("Salt to taste")).toEqual([1, "piece", "salt to taste", ""]);
    expect(old("4 Granny Smith apples")).toEqual([4, "piece", "granny smith apples", ""]);
  });
});
