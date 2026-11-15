/**
 * The two readings an agent's consciousness carries, and the owner's default pair.
 * CONTEXT.md: quantities (ESMS) and elements are orthogonal readings of the same
 * chart, "not two names for the same four things" (CONTEXT.md:13-15). So these
 * helpers only VALIDATE and DEFAULT each reading on its own; no case below maps a
 * quantity to an element or back.
 */
import {
  DEFAULT_DOMINANT_ALCHEMICAL_QUANTITY,
  DEFAULT_DOMINANT_ELEMENT,
  isAlchemicalQuantity,
  isClassicalElement,
  toAlchemicalQuantity,
  toClassicalElement,
} from "../consciousnessAxes";

const ELEMENTS = ["Fire", "Water", "Earth", "Air"];
const QUANTITIES = ["Spirit", "Essence", "Matter", "Substance"];
// The last four coerce to a name under loose equality (==), so a guard that used it would let them through.
const NEITHER: unknown[] = [
  undefined, null, 7, true, {}, [], "", "fire", "FIRE", "spirit", " Fire", "Fire ", "Aether", "Quintessence",
  ["Fire"], ["Spirit"], new String("Fire"), new String("Spirit"),
];

describe("the owner's default pair", () => {
  it("is element Fire and quantity Spirit", () => {
    expect(DEFAULT_DOMINANT_ELEMENT).toBe("Fire");
    expect(DEFAULT_DOMINANT_ALCHEMICAL_QUANTITY).toBe("Spirit");
  });
});

describe("isClassicalElement", () => {
  it.each(ELEMENTS)("%s is an element", (name) => {
    expect(isClassicalElement(name)).toBe(true);
  });
  it.each(QUANTITIES)("%s is a quantity, NOT an element", (name) => {
    expect(isClassicalElement(name)).toBe(false);
  });
  it.each(NEITHER.map((value) => [value]))("%j is not an element", (value) => {
    expect(isClassicalElement(value)).toBe(false);
  });
});

describe("isAlchemicalQuantity", () => {
  it.each(QUANTITIES)("%s is a quantity", (name) => {
    expect(isAlchemicalQuantity(name)).toBe(true);
  });
  it.each(ELEMENTS)("%s is an element, NOT a quantity", (name) => {
    expect(isAlchemicalQuantity(name)).toBe(false);
  });
  it.each(NEITHER.map((value) => [value]))("%j is not a quantity", (value) => {
    expect(isAlchemicalQuantity(value)).toBe(false);
  });
});

describe("toClassicalElement", () => {
  it.each(ELEMENTS)("keeps %s", (name) => {
    expect(toClassicalElement(name)).toBe(name);
  });
  it.each(QUANTITIES)("turns the quantity %s into Fire: Spirit never survives as an element, and nothing is mapped", (name) => {
    expect(toClassicalElement(name)).toBe("Fire");
  });
  it.each(NEITHER.map((value) => [value]))("turns %j into Fire", (value) => {
    expect(toClassicalElement(value)).toBe("Fire");
  });
});

describe("toAlchemicalQuantity", () => {
  it.each(QUANTITIES)("keeps %s", (name) => {
    expect(toAlchemicalQuantity(name)).toBe(name);
  });
  it.each(ELEMENTS)("turns the element %s into Spirit: nothing is mapped (Water is not Essence)", (name) => {
    expect(toAlchemicalQuantity(name)).toBe("Spirit");
  });
  it.each(NEITHER.map((value) => [value]))("turns %j into Spirit", (value) => {
    expect(toAlchemicalQuantity(value)).toBe("Spirit");
  });
});
