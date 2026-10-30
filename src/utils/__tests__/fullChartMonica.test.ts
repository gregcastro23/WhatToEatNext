import {
  natalPositionsFromChart,
  parseNatalPositions,
  statesALongitude,
} from "@/utils/fullChartMonica";

const CHART_LONGITUDES: Record<string, { sign: string; position: number }> = {
  Sun: { sign: "leo", position: 135 },
  Moon: { sign: "taurus", position: 33 },
  Mercury: { sign: "virgo", position: 152.5 },
  Venus: { sign: "cancer", position: 110 },
  Mars: { sign: "aries", position: 8 },
  Jupiter: { sign: "sagittarius", position: 265 },
  Saturn: { sign: "capricorn", position: 281 },
  Uranus: { sign: "aquarius", position: 310 },
  Neptune: { sign: "pisces", position: 340 },
  Pluto: { sign: "scorpio", position: 220 },
  Ascendant: { sign: "gemini", position: 75 },
};

describe("natalPositionsFromChart / parseNatalPositions — the contract itself", () => {
  const chartPlanets = Object.fromEntries(
    Object.entries(CHART_LONGITUDES).map(([name, p]) => [
      name,
      {
        sign: p.sign,
        degree: p.position % 30,
        retrograde: false,
        longitude: p.position,
      },
    ]),
  );

  it("the OLD payload — the chart object itself — parses to null", () => {
    expect(parseNatalPositions(chartPlanets)).toBeNull();
  });

  it("the encoded array parses back to every body", () => {
    const rows = natalPositionsFromChart(chartPlanets);
    const positions = parseNatalPositions(JSON.parse(JSON.stringify(rows)));

    expect(positions).not.toBeNull();
    for (const [planet, p] of Object.entries(CHART_LONGITUDES)) {
      expect(positions![planet].exactLongitude).toBe(p.position);
      expect(positions![planet].sign).toBe(p.sign);
    }
  });

  it("`position` is what the parser believes — sign and degree do not override it", () => {
    const [followed] = Object.values(
      parseNatalPositions([
        { planet: "Sun", sign: "aries", degree: 1, position: 200.25 },
        ...natalPositionsFromChart(chartPlanets).slice(1),
      ])!,
    );
    expect(followed.exactLongitude).toBe(200.25);
    expect(followed.degree).toBeCloseTo(20.25, 10);
  });

  it.each<[string, number]>([
    ["NaN", Number.NaN],
    ["a placeholder 0", 0],
    ["Infinity", Number.POSITIVE_INFINITY],
  ])("drops a body whose longitude is %s rather than placing it at 0° of its sign", (_label, longitude) => {
    const rows = natalPositionsFromChart({
      ...chartPlanets,
      Chiron: { sign: "libra", longitude },
    });

    expect(rows.some((r) => r.planet === "Chiron")).toBe(false);
    expect(rows).toHaveLength(Object.keys(CHART_LONGITUDES).length);
  });

  it("statesALongitude is the one rule both writers apply", () => {
    expect(statesALongitude(135.0341)).toBe(true);
    expect(statesALongitude(-12.5)).toBe(true);
    expect(statesALongitude(0)).toBe(false);
    expect(statesALongitude(Number.NaN)).toBe(false);
    expect(statesALongitude(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("an empty chart encodes to [] — the literal readers already treat as absent", () => {
    expect(natalPositionsFromChart({})).toEqual([]);
    expect(parseNatalPositions([])).toBeNull();
  });
});
