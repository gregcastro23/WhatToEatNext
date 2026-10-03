import { containmentMatcher, type SlugFilter } from "@/data/ingredientContainment";

const ALIASES: ReadonlyMap<string, string> = new Map([
  ["garlic", "garlic"],
  ["cloves", "cloves"],
  ["lemon", "lemon"],
  ["juice", "juice"],
  ["orange", "orange"],
  ["peanut", "peanuts"],
  ["butter", "butter"],
  ["salt", "salt"],
  ["beef", "beef"],
  ["ground beef", "ground_beef"],
  ["pandan", "pandan"],
  ["pandan leaves", "pandan_leaves"],
  ["chives", "chives"],
]);
const contained = containmentMatcher(ALIASES);
const any: SlugFilter = () => true;

describe("containmentMatcher", () => {
  it("a name inside a longer name drops out", () => {
    expect(contained("fresh pandan leaves", any)).toBe("pandan_leaves");
  });

  it("portion words yield to any other name, and resolve alone", () => {
    expect(contained("garlic cloves", any)).toBe("garlic");
    expect(contained("4 cloves garlic", any)).toBe("garlic");
    expect(contained("juice of 1 lemon", any)).toBe("lemon");
    expect(contained("ground cloves", any)).toBe("cloves");
  });

  it("a product head and the name before it drop out", () => {
    expect(contained("unsweetened peanut butter", any)).toBeNull();
    expect(contained("melted butter", any)).toBe("butter");
  });

  it("on equal length the rightmost name, the head, wins", () => {
    expect(contained("garlic chives", any)).toBe("chives");
  });

  describe("slugs the caller cannot use", () => {
    const noGroundBeef: SlugFilter = (slug) => slug !== "ground_beef";

    it("drop out before the rules run, so the name inside them can win", () => {
      expect(contained("lean ground beef", any)).toBe("ground_beef");
      expect(contained("lean ground beef", noGroundBeef)).toBe("beef");
    });

    it("leave nothing when nothing else is named", () => {
      expect(contained("pandan leaves", (slug) => slug === "garlic")).toBeNull();
    });
  });

  describe("plurals in the input meet singular aliases", () => {
    it.each([
      ["juice of 2 lemons", "lemon"],
      ["navel oranges", "orange"],
    ])("%s → %s", (input, slug) => {
      expect(contained(input, any)).toBe(slug);
    });

    it("folds plural endings only: 'salted' is not 'salt'", () => {
      expect(contained("salted butter", any)).toBe("butter");
    });
  });
});
