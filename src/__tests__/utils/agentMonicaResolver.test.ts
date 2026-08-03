/**
 * §18e — the agent-name parser that feeds the three monica write sites and the
 * backfill. The shapes and counts asserted here were measured against all 4800
 * production agent rows on 2026-07-21; see agentMonicaResolver.ts for the table.
 */
import {
  agentMonicaFromName,
  agentMonicaWithMethod,
  parseAgentPlacement,
  SIGN_MIDPOINT_DEGREE,
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
    // "Mars Gemini" used to live in this list. It is NOT junk: the name states a
    // planet and a sign, both validated against the live tables, so only the
    // degree is missing and §18k k29 supplies it. Everything below is missing
    // the planet, the sign, or both — nothing in the name constrains them.
    for (const name of [
      "Edgar Allan Poe",
      "Wolfgang Amadeus Mozart",
      "Alchemical Chef",
      "Pa Prod Smoke 1779396999",
      "Confucius (Kong Qiu)",
      "Alexander the Great",
      "",
    ]) {
      expect(parseAgentPlacement(name)).toBeNull();
    }
  });

  // §18k k29. A one-body agent with no chart and no degree resolves at the mean
  // of the 30 degrees of its sign — the existing single-body construction at one
  // more degree value, NOT a fourth construction.
  describe("sign-level agents (no degree in the name) — §18k k29", () => {
    it("places them at the derived sign midpoint", () => {
      // DERIVED as the mean of the integers 0..29, the range agent names
      // actually carry (MEASURED n=3240, min 0 max 29). Exact, and it
      // round-trips — 14.5 is representable as a double (k10).
      expect(SIGN_MIDPOINT_DEGREE).toBe(14.5);
      expect(Number(String(SIGN_MIDPOINT_DEGREE))).toBe(SIGN_MIDPOINT_DEGREE);

      expect(parseAgentPlacement("Mars Gemini")).toEqual({
        kind: "single",
        planet: "Mars",
        sign: "Gemini",
        degree: 14.5,
      });
      expect(parseAgentPlacement("Moon Cancer")).toEqual({
        kind: "single",
        planet: "Moon",
        sign: "Cancer",
        degree: 14.5,
      });
    });

    it("produces a real single-body monica for the two stuck production rows", () => {
      // The exact values that will be written to production. Pinned so a change
      // to the vessel, the dignity manifest or the sectarian ESMS fails here
      // rather than silently re-valuing stored rows.
      //
      // ⚠️ Re-measure these UNDER JEST, never from a `bun run` probe. These are
      // exact `toBe` pins and monica runs through Math.log/exp, which ECMAScript
      // leaves implementation-defined: jest is Node/V8, `bun run` is JSC, and the
      // two disagree by an ULP. MEASURED here — nocturnal is ...181878 under jest
      // and ...181879 under bun, which is enough to fail toBe.
      expect(agentMonicaWithMethod("Mars Gemini")).toEqual({
        method: "single-body",
        monica: {
          diurnal: 0.2338892828502221,
          nocturnal: -0.20936954259002769,
          combined: 0.012259870130097203,
        },
      });
      expect(agentMonicaWithMethod("Moon Cancer")).toEqual({
        method: "single-body",
        monica: {
          diurnal: 0.09186116374961706,
          nocturnal: -0.06886676129181878,
          combined: 0.011497201228899141,
        },
      });
    });

    it("⚠️ rejects 15 as the midpoint — it computes a degenerate zero", () => {
      // This is the whole reason the constant is 14.5 and not the intuitive
      // "midpoint of a 30° sign". `groundingVessel` FLOORS its argument, so 15.0
      // and 15.5 both select pillar (15-1)%14 = 0, Solution {0,2,2,0} — one of
      // only five degrees in thirty that yield exactly 0.
      //
      // If this test ever goes green with a nonzero value, the pillar mapping
      // moved and the choice of 14.5 needs re-deriving, not re-typing.
      expect(agentMonicaWithMethod("Moon Cancer 15")?.monica.combined).toBe(0);

      // CONTROL: the zero is a property of degree 15, not of this agent. The
      // shipped midpoint on the same row is a real number.
      expect(agentMonicaWithMethod("Moon Cancer")?.monica.combined).toBe(
        0.011497201228899141,
      );

      // CONTROL: exactly five of the thirty degrees do this, so a mapping that
      // started zeroing everything (or nothing) fails here.
      const zeroDegrees = Array.from({ length: 30 }, (_, d) => d).filter(
        (d) => agentMonicaWithMethod(`Moon Cancer ${d}`)?.monica.combined === 0,
      );
      expect(zeroDegrees).toEqual([1, 7, 15, 21, 29]);
    });

    it("never overrides a degree the name actually states", () => {
      // The midpoint branch is last, so every degree-bearing form still wins.
      expect(parseAgentPlacement("Mars Gemini 21")).toMatchObject({ degree: 21 });
      expect(parseAgentPlacement("Mars in Gemini 3 Degree")).toMatchObject({
        degree: 3,
      });
      expect(parseAgentPlacement("Moon Phase Full Moon 121")).toMatchObject({
        kind: "phase",
      });
    });
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
