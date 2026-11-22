import {
  containmentDetailMatcher,
  containmentMatcher,
  type SlugFilter,
} from "@/data/ingredientContainment";

const ALIASES: ReadonlyMap<string, string> = new Map([
  ["garlic", "garlic"],
  ["cloves", "cloves"],
  ["lemon", "lemon"],
  ["juice", "juice"],
  ["orange", "orange"],
  ["peanut", "peanuts"],
  ["peanuts", "peanuts"],
  ["almond", "almonds"],
  ["almond butter", "almond_butter"],
  ["butter", "butter"],
  ["salt", "salt"],
  ["beef", "beef"],
  ["ground beef", "ground_beef"],
  ["pandan", "pandan"],
  ["pandan leaves", "pandan_leaves"],
  ["chives", "chives"],
  ["corn", "corn"],
  ["flour", "flour"],
  ["shrimp", "shrimp"],
  ["ginger", "ginger"],
  ["coconut", "coconut"],
  ["cashew", "cashews"],
  ["umeboshi", "umeboshi"],
  ["vinegar", "vinegar"],
  ["anise", "anise"],
  ["rice", "rice"],
  ["dashi", "dashi"],
  ["ice", "ice"],
  ["water", "water"],
  ["anchovy", "anchovies"],
  ["oil", "oil"],
  ["tomato sauce", "tomato_sauce"],
  ["potato starch", "potato_starch"],
]);
const contained = containmentMatcher(ALIASES);
const detailed = containmentDetailMatcher(ALIASES);
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

  it("derived heads attribute uncarded products to their base with derived=true (Rulings 1, 2, 4)", () => {
    expect(contained("unsweetened peanut butter", any)).toBe("peanuts");
    expect(detailed("unsweetened peanut butter", any)).toEqual({ slug: "peanuts", derived: true });
    expect(detailed("corn flour", any)).toEqual({ slug: "corn", derived: true });
    expect(detailed("almond meal", any)).toEqual({ slug: "almonds", derived: true });
    expect(detailed("shrimp stock", any)).toEqual({ slug: "shrimp", derived: true });
    expect(detailed("peanut sauce", any)).toEqual({ slug: "peanuts", derived: true });
    expect(detailed("ginger paste", any)).toEqual({ slug: "ginger", derived: true });
    expect(detailed("coconut water", any)).toEqual({ slug: "coconut", derived: true });
    expect(detailed("orange blossom water", any)).toEqual({ slug: "orange", derived: true });
    expect(detailed("cashew cream", any)).toEqual({ slug: "cashews", derived: true });
    expect(detailed("lemon oil", any)).toEqual({ slug: "lemon", derived: true });
    expect(detailed("umeboshi vinegar", any)).toEqual({ slug: "umeboshi", derived: true });
    expect(detailed("anise extract", any)).toEqual({ slug: "anise", derived: true });
    expect(detailed("rice syrup", any)).toEqual({ slug: "rice", derived: true });
    expect(detailed("dashi broth", any)).toEqual({ slug: "dashi", derived: true });
  });

  it("dedicated cards, non-derived modifiers, and clause boundaries keep derived=false", () => {
    expect(detailed("creamy almond butter", any)).toEqual({ slug: "almond_butter", derived: false });
    expect(detailed("melted butter", any)).toEqual({ slug: "butter", derived: false });
    expect(detailed("salted butter", any)).toEqual({ slug: "butter", derived: false });
    expect(detailed("ice water", any)).toEqual({ slug: "water", derived: false });
    expect(detailed("anchovies in oil", any)).toEqual({ slug: "anchovies", derived: false });
    expect(detailed("oil and butter", any)).toEqual({ slug: "butter", derived: false });
    expect(detailed("tomato sauce/vinegar", any)).toEqual({ slug: "tomato_sauce", derived: false });
    expect(detailed("potato starch flour", any)).toEqual({ slug: "potato_starch", derived: false });
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
