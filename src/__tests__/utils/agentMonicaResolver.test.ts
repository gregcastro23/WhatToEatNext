/**
 * §18e — the agent-name parser that feeds the three monica write sites and the
 * backfill. The shapes and counts asserted here were measured against all 4800
 * production agent rows on 2026-07-21; see agentMonicaResolver.ts for the table.
 */
import {
  agentMonicaFromName,
  parseAgentPlacement,
} from "@/utils/agentMonicaResolver";

describe("parseAgentPlacement", () => {
  it("parses the dominant `<Planet> in <Sign> <N> Degree` family", () => {
    expect(parseAgentPlacement("Jupiter in Aquarius 0 Degree")).toEqual({
      kind: "single",
      planet: "Jupiter",
      sign: "Aquarius",
      degree: 0,
      canonicalName: "Jupiter Aquarius 0",
    });
  });

  it("parses the already-canonical `<Planet> <Sign> <N>` family", () => {
    const p = parseAgentPlacement("Mercury Aquarius 16");
    expect(p).toMatchObject({
      kind: "single",
      planet: "Mercury",
      sign: "Aquarius",
      degree: 16,
    });
    expect(p?.canonicalName).toBeUndefined();
  });

  it("reads `<Planet> Agent <N>` as an absolute ecliptic degree, 0-based", () => {
    // 0 -> Aries 0; 100 -> Cancer 10 (floor(100/30) = 3 -> Cancer, 100 % 30 = 10)
    expect(parseAgentPlacement("Moon Agent 0")).toMatchObject({
      sign: "Aries",
      degree: 0,
      canonicalName: "Moon Aries 0",
    });
    expect(parseAgentPlacement("Moon Agent 100")).toMatchObject({
      sign: "Cancer",
      degree: 10,
    });
    expect(parseAgentPlacement("Moon Agent 359")).toMatchObject({
      sign: "Pisces",
      degree: 29,
    });
  });

  it("does NOT read `Agent` as a zodiac sign", () => {
    // The trap: "Moon Agent 5" has the same <word> <word> <number> shape as
    // "Mercury Aquarius 16". A shape-only parser yields sign="Agent".
    const p = parseAgentPlacement("Moon Agent 5");
    expect(p?.sign).toBe("Aries");
    expect(SIGNS_SEEN(p?.sign)).toBe(true);
  });

  it("classifies phase agents as `phase`, not single-body", () => {
    expect(parseAgentPlacement("First Quarter Moon in Cancer 0 Degree")).toEqual({
      kind: "phase",
      planet: "Moon",
      sign: "Cancer",
      degree: 0,
      phase: "First Quarter",
    });
    expect(parseAgentPlacement("Moon Phase First Quarter 0")).toMatchObject({
      kind: "phase",
      phase: "First Quarter",
      sign: "Aries",
      degree: 0,
      canonicalName: "First Quarter Moon in Aries 0 Degree",
    });
  });

  it("returns null for people, test rows and junk — never guesses", () => {
    for (const name of [
      "Edgar Allan Poe",
      "Wolfgang Amadeus Mozart",
      "Alchemical Chef",
      "Pa Prod Smoke 1779396999",
      "Confucius (Kong Qiu)",
      "Alexander the Great",
      "Mars Gemini", // no degree
      "",
    ]) {
      expect(parseAgentPlacement(name)).toBeNull();
    }
  });

  it("tolerates casing and extra whitespace", () => {
    expect(parseAgentPlacement("  venus   TAURUS  12  ")).toMatchObject({
      planet: "Venus",
      sign: "Taurus",
      degree: 12,
    });
  });
});

describe("agentMonicaFromName", () => {
  it("returns a finite three-part monica for a single-body agent", () => {
    const m = agentMonicaFromName("Jupiter in Aquarius 0 Degree");
    expect(m).not.toBeNull();
    expect(Number.isFinite(m!.diurnal)).toBe(true);
    expect(Number.isFinite(m!.nocturnal)).toBe(true);
    expect(m!.combined).toBeCloseTo((m!.diurnal + m!.nocturnal) / 2, 12);
  });

  it("agrees across the equivalent spellings of one placement", () => {
    const a = agentMonicaFromName("Moon Aries 0");
    const b = agentMonicaFromName("Moon in Aries 0 Degree");
    const c = agentMonicaFromName("Moon Agent 0");
    expect(a).toEqual(b);
    expect(a).toEqual(c);
  });

  it("returns null for phase agents — two-body monica is a follow-up", () => {
    expect(agentMonicaFromName("First Quarter Moon in Cancer 0 Degree")).toBeNull();
  });

  it("returns null, not zero, for a non-placement name", () => {
    expect(agentMonicaFromName("Edgar Allan Poe")).toBeNull();
  });
});

/** Guard for the test above: the parsed sign must be a real zodiac sign. */
function SIGNS_SEEN(sign: string | undefined): boolean {
  return [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ].includes(sign ?? "");
}
