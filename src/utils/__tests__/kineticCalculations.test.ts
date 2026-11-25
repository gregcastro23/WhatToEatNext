import { calculateKineticProperties } from "../kineticCalculations";

describe("calculateKineticProperties", () => {
  const alchemical = { Spirit: 3, Essence: 4, Matter: 5, Substance: 2 };
  const elemental = { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 };

  it("accepts ThermodynamicMetrics without optional kalchm and monica", () => {
    const result = calculateKineticProperties(alchemical, elemental, {
      heat: 0.2,
      entropy: 0.1,
      reactivity: 0.5,
      gregsEnergy: 0.15,
    });

    expect(result.charge).toBe(7);
    expect(result.currentFlow).toBeCloseTo(0.35, 6);
    expect(result.potentialDifference).toBeCloseTo(0.15 / 7, 6);
    expect(result.power).toBeCloseTo(result.currentFlow * result.potentialDifference, 6);
  });

  it("matches output whether optional kalchm and monica are omitted or provided", () => {
    const base = {
      heat: 0.2,
      entropy: 0.1,
      reactivity: 0.5,
      gregsEnergy: 0.15,
    };

    const withoutOptional = calculateKineticProperties(alchemical, elemental, base);
    const withOptional = calculateKineticProperties(alchemical, elemental, {
      ...base,
      kalchm: 1.2,
      monica: 0.9,
    });

    expect(withoutOptional).toEqual(withOptional);
  });
});
