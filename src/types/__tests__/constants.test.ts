import {
  isAlchemicalProperty,
  isCookingMethod,
  isCuisineType,
  isDietaryRestriction,
  isElementType,
  isLunarPhase,
  isMealType,
  isPlanet,
  isSeason,
  isSpiceLevel,
  isZodiacSignType,
} from "../constants";

describe("constants type guards", () => {
  it("accepts canonical members and rejects invalid or mismatched values", () => {
    expect(isElementType("Fire")).toBe(true);
    expect(isElementType("fire")).toBe(false);

    expect(isAlchemicalProperty("Spirit")).toBe(true);
    expect(isAlchemicalProperty("Fire")).toBe(false);

    expect(isZodiacSignType("aries")).toBe(true);
    expect(isZodiacSignType("Aries")).toBe(false);

    expect(isPlanet("Sun")).toBe(true);
    expect(isPlanet("sun")).toBe(false);

    expect(isCookingMethod("baking")).toBe(true);
    expect(isCookingMethod("microwave")).toBe(false);

    expect(isCuisineType("Italian")).toBe(true);
    expect(isCuisineType("Martian")).toBe(false);

    expect(isDietaryRestriction("Vegan")).toBe(true);
    expect(isDietaryRestriction("vegan")).toBe(false);

    expect(isLunarPhase("full moon")).toBe(true);
    expect(isLunarPhase("half moon")).toBe(false);

    expect(isSeason("spring")).toBe(true);
    expect(isSeason("monsoon")).toBe(false);

    expect(isMealType("dinner")).toBe(true);
    expect(isMealType("brunch")).toBe(false);

    expect(isSpiceLevel("medium")).toBe(true);
    expect(isSpiceLevel("extreme")).toBe(false);
  });
});
