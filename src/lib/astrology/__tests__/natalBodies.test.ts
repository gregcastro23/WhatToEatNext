/**
 * A natal chart is either whole or refused — never filled in.
 *
 * The bug these pin: `/api/user/charts`, `/api/user/commensals` and
 * `/api/onboarding` each carried a byte-identical block that PERSISTED a chart
 * built from three fabrications —
 *
 *   position:   rawPositions[p]?.exactLongitude ?? 0      -> 0° Aries
 *   Ascendant:  rawPositions.Ascendant?.sign || "aries"   -> a rising sign
 *   the rest:   rawPositions.Sun?.sign                    -> undefined, inside a
 *                                                            Record that forbids it
 *
 * A fabricated zero is worse than an absent value: it survives `Number.isFinite`,
 * satisfies NOT NULL, and STOPS a later `a ?? b ?? c` chain because 0 is not
 * nullish. Upstream that shape put `longitude: 0` on 710 of 710 stored bodies.
 */
import {
  NATAL_BODIES,
  natalBodiesFromRawPositions,
  unusableChartMessage,
} from "@/lib/astrology/natalBodies";

/** A complete, measured chart as the astrologize layer reports one. */
const MEASURED: Record<string, { sign: string; degree: number; exactLongitude: number }> = {
  Sun: { sign: "virgo", degree: 24.76, exactLongitude: 174.7641 },
  Moon: { sign: "taurus", degree: 3.2, exactLongitude: 33.2 },
  Mercury: { sign: "libra", degree: 2.5, exactLongitude: 182.5 },
  Venus: { sign: "cancer", degree: 20, exactLongitude: 110 },
  Mars: { sign: "aries", degree: 8, exactLongitude: 8 },
  Jupiter: { sign: "sagittarius", degree: 25, exactLongitude: 265 },
  Saturn: { sign: "capricorn", degree: 11, exactLongitude: 281 },
  Uranus: { sign: "aquarius", degree: 10, exactLongitude: 310 },
  Neptune: { sign: "pisces", degree: 10, exactLongitude: 340 },
  Pluto: { sign: "scorpio", degree: 10, exactLongitude: 220 },
  Ascendant: { sign: "leo", degree: 15.03, exactLongitude: 135.0341 },
};

const withBody = (body: string, patch: unknown) => ({ ...MEASURED, [body]: patch });

describe("natalBodiesFromRawPositions", () => {
  it("CONTROL: a complete measured chart passes through untouched", () => {
    const result = natalBodiesFromRawPositions(MEASURED);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.planets).toHaveLength(NATAL_BODIES.length);
    expect(result.derivedLongitudes).toEqual([]);
    // Non-vacuity: the REAL longitudes survive, to sub-arcminute precision.
    for (const body of NATAL_BODIES) {
      const planet = result.planets.find((p) => p.name === body);
      expect(planet?.position).toBe(MEASURED[body].exactLongitude);
      expect(planet?.sign).toBe(MEASURED[body].sign);
    }
    expect(result.positions.Ascendant).toBe("leo");
  });

  describe("a missing longitude is DERIVED from the sign, never zeroed", () => {
    it.each([undefined, 0, Number.NaN, Number.POSITIVE_INFINITY])(
      "exactLongitude %s becomes signIndex*30 + degree",
      (exactLongitude) => {
        const result = natalBodiesFromRawPositions(
          withBody("Pluto", { sign: "scorpio", degree: 10, exactLongitude }),
        );

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const pluto = result.planets.find((p) => p.name === "Pluto");
        // scorpio is index 7 -> 210 + 10. NOT 0, which would read as 0° Aries and
        // contradict the sign the same row states.
        expect(pluto?.position).toBe(220);
        expect(pluto?.sign).toBe("scorpio");
        expect(result.derivedLongitudes).toContain("Pluto");
      },
    );

    it("falls back to the sign's first degree when the degree is missing too", () => {
      const result = natalBodiesFromRawPositions(withBody("Pluto", { sign: "scorpio" }));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      // Sign resolution is the floor, and it is still IN scorpio.
      expect(result.planets.find((p) => p.name === "Pluto")?.position).toBe(210);
      expect(result.derivedLongitudes).toContain("Pluto");
    });

    it("reports every derived body, so a degraded chart is visible", () => {
      const raw = Object.fromEntries(
        Object.entries(MEASURED).map(([body, p]) => [body, { sign: p.sign, degree: p.degree }]),
      );
      const result = natalBodiesFromRawPositions(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.derivedLongitudes).toHaveLength(NATAL_BODIES.length);
    });
  });

  describe("a chart that cannot be stated is refused", () => {
    it("refuses a missing Ascendant instead of calling it aries", () => {
      const result = natalBodiesFromRawPositions(withBody("Ascendant", undefined));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.unusable).toEqual(["Ascendant"]);
      // The precise defect: it must not silently become the first sign.
      expect(unusableChartMessage(result.unusable)).toContain("Ascendant");
    });

    it.each(["Sun", "Moon", "Pluto"])("refuses a missing %s rather than storing undefined", (body) => {
      const result = natalBodiesFromRawPositions(withBody(body, undefined));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.unusable).toEqual([body]);
    });

    it.each([{ sign: "" }, { sign: "not-a-sign" }, { sign: null }, { sign: 7 }])(
      "refuses an unrecognised sign %p",
      (patch) => {
        expect(natalBodiesFromRawPositions(withBody("Venus", patch)).ok).toBe(false);
      },
    );

    it("lists EVERY unusable body, not just the first", () => {
      let raw: Record<string, unknown> = MEASURED;
      for (const body of ["Sun", "Mars", "Ascendant"]) raw = { ...raw, [body]: undefined };
      const result = natalBodiesFromRawPositions(raw);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.unusable).toEqual(["Sun", "Mars", "Ascendant"]);
    });

    it.each([null, undefined, {}])("refuses %p outright", (raw) => {
      const result = natalBodiesFromRawPositions(raw as never);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      // Every body, so the message names the real problem rather than one symptom.
      expect(result.unusable).toHaveLength(NATAL_BODIES.length);
    });
  });

  it("accepts a sign in any casing, since the ingest layer is inconsistent", () => {
    const result = natalBodiesFromRawPositions(
      withBody("Venus", { sign: "Cancer", degree: 20, exactLongitude: 110 }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.positions.Venus).toBe("cancer");
  });
});
