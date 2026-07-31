import fixture from "../../../docs/physics/esms_conformance.json";
import {
  calculatePositionalAscendantVessel,
  getGravitationalInertia,
  getTidalPull,
  PLANETARY_SECTARIAN_ESMS,
  ZODIAC_ELEMENTS,
  type AlchemicalElement,
  type ZodiacSignType,
} from "@/utils/planetaryAlchemyMapping";

describe("ESMS 2.0 Unified Physics Model Conformance Suite", () => {
  it("has 20 golden test charts in fixture", () => {
    expect(fixture.charts.length).toBe(20);
  });

  fixture.charts.forEach((chart) => {
    it(`evaluates ${chart.id} (${chart.name}) without NaN/null`, () => {
      const positions = chart.planetary_positions as Record<string, { sign: string; degree: number; distance?: number }>;
      const isDiurnal = chart.is_diurnal ?? true;
      const sectKey = isDiurnal ? "diurnal" : "nocturnal";

      let spirit = 0;
      let essence = 0;
      let matter = 0;
      let substance = 0;
      let totalInertia = 0;

      const validBodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
      
      const elementsRaw: Record<AlchemicalElement, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

      for (const [body, pos] of Object.entries(positions)) {
        if (!validBodies.includes(body)) continue;
        const signClean = pos.sign.charAt(0).toUpperCase() + pos.sign.slice(1).toLowerCase();
        const elem = ZODIAC_ELEMENTS[signClean as ZodiacSignType] ?? "Earth";

        const inertia = getGravitationalInertia(body, pos.distance);
        totalInertia += inertia;
        elementsRaw[elem as AlchemicalElement] += inertia;

        const sectEsms = PLANETARY_SECTARIAN_ESMS[body as keyof typeof PLANETARY_SECTARIAN_ESMS]?.[sectKey] ?? {
          Spirit: 0, Essence: 0, Matter: 0, Substance: 0
        };

        spirit += sectEsms.Spirit * inertia;
        essence += sectEsms.Essence * inertia;
        matter += sectEsms.Matter * inertia;
        substance += sectEsms.Substance * inertia;
      }

      // Ascendant Vessel
      const ascPos = positions.Ascendant ?? { sign: "aries", degree: 0 };
      const ascVessel = calculatePositionalAscendantVessel(ascPos.sign, ascPos.degree);
      const ascInertia = getGravitationalInertia("Ascendant");
      totalInertia += ascInertia;

      spirit += ascVessel.Spirit * ascInertia;
      essence += ascVessel.Essence * ascInertia;
      matter += ascVessel.Matter * ascInertia;
      substance += ascVessel.Substance * ascInertia;

      expect(Number.isFinite(spirit)).toBe(true);
      expect(Number.isFinite(essence)).toBe(true);
      expect(Number.isFinite(matter)).toBe(true);
      expect(Number.isFinite(substance)).toBe(true);
      expect(Number.isFinite(totalInertia)).toBe(true);

      const earthVal = elementsRaw.Earth / (Object.values(elementsRaw).reduce((a, b) => a + b, 0) || 1);
      const reactivity = (matter + earthVal) ** 2;
      expect(Number.isFinite(reactivity)).toBe(true);

      const lnArg = (spirit + essence + 0.05) / (matter + substance + 0.05);
      const monica = 1.618 * Math.log(Math.max(lnArg, 1e-6));
      expect(Number.isFinite(monica)).toBe(true);
    });
  });
});
