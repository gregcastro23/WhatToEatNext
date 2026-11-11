import { parseAlignedRecipes, parseCurrentMoment } from "../momentParsers";

const moment = {
  success: true,
  timestamp: "2026-11-11T00:00:00.000Z",
  quantities: { Spirit: 4, Essence: 5, Matter: 6, Substance: 7, ANumber: 1, DayEssence: 2, NightEssence: 3 },
  dominantElement: "Fire",
  isDiurnal: true,
  heat: 0.4,
  entropy: 0.5,
  reactivity: 0.6,
  energy: 0.7,
  kalchm: 1.1,
  monica: 0.9,
  circuit: {
    charge: 1,
    potentialDifference: 2,
    currentFlow: 3,
    power: 4,
    inertia: 5,
    forceMagnitude: 0.3,
    forceClassification: "accelerating",
    thermalDirection: "heating",
    primaryElement: "Fire",
    elementalBalance: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    esmsBalance: { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 },
  },
};

describe("parseCurrentMoment", (): void => {
  it("accepts the validated /api/alchm-quantities payload", (): void => {
    const out = parseCurrentMoment(moment);
    expect(out?.quantities.Spirit).toBe(4);
    expect(out?.circuit.forceClassification).toBe("accelerating");
  });

  it("is a no-op (null) for a falsy success, as the old guard was", (): void => {
    expect(parseCurrentMoment({ success: false, error: "x" })).toBeNull();
  });

  it("throws on a success body missing the circuit, instead of storing it", (): void => {
    const { circuit: _circuit, ...partial } = moment;
    expect(() => parseCurrentMoment(partial)).toThrow();
    expect(() => parseCurrentMoment(null)).toThrow(TypeError);
  });
});

describe("parseAlignedRecipes", (): void => {
  it("maps the route's null cuisine to absent and keeps numeric element weights", (): void => {
    const out = parseAlignedRecipes({
      success: true,
      recipes: [
        { id: "r1", name: "Stew", cuisine: null, matchScore: 91.2, elementalProperties: { Fire: 0.4, Water: 0.6 }, thermodynamicProperties: { heat: 1 } },
        { id: "r2", name: "Pie", cuisine: "French", matchScore: 70 },
      ],
    });
    expect(out).toEqual([
      { id: "r1", name: "Stew", matchScore: 91.2, elementalProperties: { Fire: 0.4, Water: 0.6 } },
      { id: "r2", name: "Pie", matchScore: 70, cuisine: "French" },
    ]);
  });

  it("returns null unless success is truthy and recipes is an array", (): void => {
    expect(parseAlignedRecipes({ success: false, error: "x" })).toBeNull();
    expect(parseAlignedRecipes({ success: true })).toBeNull();
    expect(parseAlignedRecipes({ success: true, recipes: "nope" })).toBeNull();
    expect(() => parseAlignedRecipes(null)).toThrow(TypeError);
  });

  it("drops rows the UI cannot key or title", (): void => {
    const out = parseAlignedRecipes({ success: true, recipes: [{ name: "No id", matchScore: 1 }, { id: "r3", matchScore: 2 }, { id: "r4", name: "Ok", matchScore: 3 }] });
    expect(out).toEqual([{ id: "r4", name: "Ok", matchScore: 3 }]);
  });
});
