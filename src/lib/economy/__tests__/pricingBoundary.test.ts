import { asPlanetaryPositions as asLivePricingPositions } from "@/lib/economy/livePricing";
import { asPlanetaryPositions as asCelestialPositions } from "@/lib/economy/celestial";

describe("asPlanetaryPositions — runtime boundary defensiveness (ADR-012)", () => {
  const adapters = [
    { name: "livePricing (debit side)", fn: asLivePricingPositions },
    { name: "celestial (reward side)", fn: asCelestialPositions },
  ];

  for (const { name, fn } of adapters) {
    describe(name, () => {
      it("preserves a healthy standard position payload", () => {
        const raw = {
          Sun: {
            sign: "Cancer",
            degree: 27,
            minute: 30,
            isRetrograde: false,
            exactLongitude: 117.8,
          },
        };
        const result = fn(raw);

        expect(result.Sun).toEqual({
          sign: "cancer",
          degree: 27,
          minute: 30,
          isRetrograde: false,
          exactLongitude: 117.8,
        });
      });

      it("handles string degree and minute (defends against '15' + 1 === '151')", () => {
        const raw = {
          Mars: {
            sign: "GEMINI",
            degree: "15",
            minute: "45",
            isRetrograde: true,
          },
        };
        const result = fn(raw);

        expect(typeof result.Mars.degree).toBe("number");
        expect(result.Mars.degree).toBe(15);
        expect(result.Mars.degree + 1).toBe(16);
        expect(result.Mars.minute).toBe(45);
        expect(result.Mars.sign).toBe("gemini");
        expect(result.Mars.isRetrograde).toBe(true);
      });

      it("drops null exactLongitude so downstream can reconstruct from sign + degree", () => {
        const raw = {
          Moon: {
            sign: "libra",
            degree: 16,
            exactLongitude: null,
            isRetrograde: false,
          },
        };
        const result = fn(raw);

        expect("exactLongitude" in result.Moon).toBe(false);
        expect(result.Moon.exactLongitude).toBeUndefined();
      });

      it("coerces numeric sign to string without throwing .toLowerCase is not a function", () => {
        const raw = {
          Jupiter: {
            sign: 12,
            degree: 4,
            isRetrograde: false,
          },
        };

        expect(() => fn(raw)).not.toThrow();
        const result = fn(raw);
        expect(result.Jupiter.sign).toBe("12");
      });

      it("filters out non-priced bodies (Ascendant, MC, Nodes) and invalid items", () => {
        const raw = {
          Sun: { sign: "leo", degree: 10 },
          Ascendant: { sign: "virgo", degree: 0 },
          MC: { sign: "gemini", degree: 4 },
          "North Node": { sign: "pisces", degree: 1 },
          Venus: null,
          Mercury: "not-an-object",
        };
        const result = fn(raw as Record<string, unknown>);

        expect(Object.keys(result)).toEqual(["Sun"]);
        expect(result.Sun.sign).toBe("leo");
        expect(result.Sun.degree).toBe(10);
      });
    });
  }
});
