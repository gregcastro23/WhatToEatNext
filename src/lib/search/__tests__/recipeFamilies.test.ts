/**
 * Dish families are read from names alone, so each rule is pinned, including
 * the words that must NOT merge two dishes.
 */
import { cuisineLabel, displayName, familyKeys, familyName } from "../recipeFamilies";

describe("familyName", () => {
  it("ignores accents, filler words, parentheticals and plurals", () => {
    expect(familyName("Authentic Phở Bò (Vietnamese Beef Noodle Soup)").key).toBe("pho bo");
    expect(familyName("TRADITIONAL CAESAR SALAD").key).toBe(familyName("Caesar Salad").key);
    expect(familyName("Chocolate Chip Cookies").key).toBe(familyName("Chocolate Chip Cookie").key);
    expect(familyName("Brownies").key).toBe(familyName("Brownie").key);
    expect(familyName("Apple Pies").key).toBe("apple pie");
  });

  it("turns diet words into version labels", () => {
    expect(familyName("VEGAN BAKLAVA")).toEqual({ key: "baklava", labels: ["Vegan"] });
    expect(familyName("Gluten-Free Flour Blend").labels).toEqual(["Gluten-free"]);
    expect(familyName("Authentic Har Gow (Shrimp Dumplings)").labels).toEqual(["Shrimp Dumplings"]);
  });

  it("keeps words that name a different dish", () => {
    expect(familyName("Egg Fried Rice").key).not.toBe(familyName("Fried Rice").key);
    expect(familyName("Hummus").key).toBe("hummus");
    expect(familyName("Couscous").key).toBe("couscous");
  });
});

describe("familyKeys", () => {
  it("drops a cuisine word only when the shorter dish exists", () => {
    expect(familyKeys(["Authentic Greek Baklava", "Baklava"])).toEqual(["baklava", "baklava"]);
    expect(familyKeys(["Greek Salad", "French Toast"])).toEqual(["greek salad", "french toast"]);
  });
});

describe("displayName", () => {
  it("title-cases an all-capitals archive name only", () => {
    expect(displayName("PAD THAI")).toBe("Pad Thai");
    expect(displayName("Pho bo")).toBe("Pho bo");
  });
});

describe("cuisineLabel", () => {
  it("shows one casing", () => {
    expect(cuisineLabel("middle eastern")).toBe("Middle Eastern");
    expect(cuisineLabel("Greek")).toBe("Greek");
  });
});
