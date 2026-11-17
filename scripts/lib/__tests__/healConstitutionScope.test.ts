import {
  natalPositionsJson,
  parseControlUser,
  scopeControlRows,
} from "../healConstitutionScope";

const UUID = "ce117d50-e3e3-4c53-8514-69bf8c21fca9";

describe("parseControlUser", () => {
  it("returns null when the flag is absent", () => {
    expect(parseControlUser(["--control", "--apply"])).toBeNull();
  });

  it("reads the space-separated and = forms, normalising case", () => {
    expect(parseControlUser(["--control", "--control-user", UUID])).toBe(UUID);
    expect(parseControlUser([`--control-user=${UUID.toUpperCase()}`])).toBe(UUID);
  });

  it("throws on a missing or malformed value instead of widening the gate", () => {
    expect(() => parseControlUser(["--control-user"])).toThrow(/requires a user UUID/);
    expect(() => parseControlUser(["--control-user", "--apply"])).toThrow();
    expect(() => parseControlUser(["--control-user=ce117d50"])).toThrow();
    expect(() => parseControlUser(["--control-user="])).toThrow();
  });
});

describe("scopeControlRows", () => {
  const rows = [{ user_id: UUID }, { user_id: "2ee5eb05-0000-4000-8000-000000000000" }];

  it("keeps every healthy row when unscoped", () => {
    expect(scopeControlRows(rows, null)).toEqual(rows);
  });

  it("narrows to the requested user", () => {
    expect(scopeControlRows(rows, UUID)).toEqual([{ user_id: UUID }]);
  });

  it("returns nothing for an unknown user so the gate refuses", () => {
    expect(scopeControlRows(rows, "00000000-0000-4000-8000-000000000000")).toEqual([]);
  });
});

describe("natalPositionsJson", () => {
  const HUMAN_CHART = {
    planets: [
      { name: "Sun", sign: "Aries", position: 15.5 },
      { name: "Moon", sign: "Taurus", position: 42.1 },
      { name: "Mercury", sign: "Gemini", position: 73.2 },
      { name: "Venus", sign: "Cancer", position: 100.4 },
      { name: "Mars", sign: "Leo", position: 130.9 },
      { name: "Jupiter", sign: "Virgo", position: 165.3 },
    ],
  };

  it("derives positions from a stored human chart", () => {
    const parsed: unknown = JSON.parse(natalPositionsJson(HUMAN_CHART) ?? "null");
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(6);
    expect(JSON.stringify(parsed)).toContain('"position":15.5');
  });

  it("returns null for absent, partial or unusable charts so COALESCE keeps the old set", () => {
    expect(natalPositionsJson(null)).toBeNull();
    expect(natalPositionsJson({})).toBeNull();
    expect(natalPositionsJson({ planets: HUMAN_CHART.planets.slice(0, 2) })).toBeNull();
    expect(natalPositionsJson({ planets: [{ name: "Sun", sign: "Nowhere" }] })).toBeNull();
  });
});
