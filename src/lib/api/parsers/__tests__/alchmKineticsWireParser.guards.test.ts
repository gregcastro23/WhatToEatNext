import { parseAlchmKineticsResponse } from "../alchmKineticsWireParser";

const stat = { mean: 1.5, variance: 0.25, stdDev: 0.5 };
const vec = { Spirit: 0.1, Essence: 0.2, Matter: 0.3, Substance: 0.4 };

describe("alchmKineticsWireParser", () => {
  it("returns null on JSON null or missing required kinetics/circuit fields", () => {
    expect(parseAlchmKineticsResponse(JSON.parse("null"))).toBeNull();
    expect(parseAlchmKineticsResponse({ kinetics: {}, circuit: {} })).toBeNull();
    expect(
      parseAlchmKineticsResponse({
        kinetics: { velocity: vec, acceleration: vec, momentum: vec },
        circuit: {
          charge: Number.NaN,
          potentialDifference: 1,
          currentFlow: 1,
          power: 1,
          inertia: 1,
          forceMagnitude: 1,
          forceClassification: "stable",
          thermalDirection: "warming",
        },
      }),
    ).toBeNull();
  });

  it("parses valid kinetics, circuit, and optional historicalContext", () => {
    const payload = {
      kinetics: { velocity: vec, acceleration: vec, momentum: vec },
      circuit: {
        charge: 10,
        potentialDifference: 2,
        currentFlow: 5,
        power: 10,
        inertia: 1.2,
        forceMagnitude: 3.4,
        forceClassification: "expansive",
        thermalDirection: "warming",
      },
      historicalContext: {
        timeframeDays: 30,
        dataPoints: 720,
        metrics: {
          Spirit: stat,
          Essence: stat,
          Matter: stat,
          Substance: stat,
          heat: stat,
          entropy: stat,
          reactivity: stat,
          kalchm: stat,
          monica: stat,
          charge: stat,
          power: stat,
          currentFlow: stat,
        },
      },
    };
    expect(parseAlchmKineticsResponse(payload)).toEqual(payload);
  });
});
