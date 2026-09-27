import { absorbedFatGrams, findFryingMedium, MAX_FAT_UPTAKE_G_PER_100G, type FryingLine } from "../fryingFat";

const fat = (text: string, grams: number | null): FryingLine => ({ text, fat: true, grams });
const food = (text: string, grams: number): FryingLine => ({ text, fat: false, grams });

describe("MAX_FAT_UPTAKE_G_PER_100G", () => {
  it("is the most Bognár (2002) measured any food absorbing, per method", () => {
    // Deep fry: Table 38, cereal-flour dishes. Fry in pan: Table 32, potato products.
    expect(MAX_FAT_UPTAKE_G_PER_100G).toEqual({ deep: 7, pan: 10 });
  });
});

describe("absorbedFatGrams", () => {
  it("counts what the food absorbs, not the bath", () => {
    // 928 g of chin-chin dough deep-fried in 872 g of oil takes up 65 g.
    expect(absorbedFatGrams(872, 928, "deep")).toBeCloseTo(64.96, 10);
  });

  it("never counts more than was listed", () => {
    expect(absorbedFatGrams(27, 1000, "pan")).toBe(27);
  });

  it("needs no listed mass: uptake does not depend on the size of the bath", () => {
    expect(absorbedFatGrams(null, 500, "pan")).toBe(50);
  });
});

describe("findFryingMedium", () => {
  it("takes a fat line that names itself as frying fat", () => {
    const lines = [food("flour", 500), fat("olive oil for the dough", 27), fat("vegetable oil for frying", 436)];
    expect(findFryingMedium(lines, ["Fry the steaks until golden."])).toEqual({ index: 2, method: "pan" });
  });

  it("reads deep-frying from the instructions and takes the largest fat line", () => {
    const lines = [food("flour", 500), fat("butter", 60), fat("vegetable oil", 872)];
    expect(findFryingMedium(lines, ["Heat the oil in a deep pot to 350°F."])).toEqual({ index: 2, method: "deep" });
    expect(findFryingMedium(lines, ["Deep-fry in batches."])?.method).toBe("deep");
  });

  it("reads shallow frying only when the fat is drained off", () => {
    const lines = [food("potatoes", 800), fat("canola oil", 164)];
    const shallow = ["Heat 1 inch of oil in a skillet.", "Fry the latkes in batches; drain on paper towels."];
    expect(findFryingMedium(lines, shallow)).toEqual({ index: 1, method: "pan" });
    expect(findFryingMedium(lines, ["Fry the latkes in batches."])).toBeNull();
  });

  it("does not read an oven, a sauté or a batter as frying", () => {
    const lines = [food("beans", 800), fat("extra virgin olive oil", 108)];
    expect(findFryingMedium(lines, ["Drizzle with olive oil and bake at 190°C for an hour."])).toBeNull();
    expect(findFryingMedium(lines, ["Fry the onion in the oil until golden, then add the beans."])).toBeNull();
    expect(findFryingMedium([food("flour", 300), fat("melted coconut oil", 327)], ["Bake at 350°F."])).toBeNull();
  });

  it("never takes a line the catalog does not file as fat", () => {
    const lines = [food("breadcrumbs for frying", 100), food("pork", 600)];
    expect(findFryingMedium(lines, ["Deep-fry the cutlets."])).toBeNull();
  });
});
