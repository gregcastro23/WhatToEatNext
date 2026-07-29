/**
 * A bare numeric Ascendant is REFUSED by every reader, because a scalar cannot
 * state its unit.
 *
 * ── What this exists to prevent ─────────────────────────────────────────────
 *
 * Two readers used to take `natal_chart.ascendant` as an absolute ecliptic
 * longitude:
 *
 *   `flattenNatalChart`  (src/lib/mcp/synastryTools.ts) — sign = SIGNS[n / 30]
 *   `deriveSacredStats`  (src/lib/agents/persona/derive-sacred-stats.ts) — n / 360
 *
 * `[MEASURED 2026-07-29]` all 71 production charts carrying a numeric ascendant
 * stored a DEGREE WITHIN A SIGN, not a longitude. The proof was one chart's own
 * stored aspect: `Greg Castro` holds `Sun sextile Ascendant, orb 0.65, exact`,
 * with Sun at Cancer 1.63° (91.63° absolute) and `ascendant: 0.98`.
 *
 *   read as a longitude   →  separation 90.65°  (a SQUARE)  orb error 30.65°
 *   read as Taurus 0.98°  →  separation 60.65°              orb error  0.65°  ✓
 *   read as Virgo  0.98°  →  separation 59.35°              orb error  0.65°  ✓
 *
 * Only the degree-within-sign reading reproduces the stored orb. So the readers
 * were assigning the wrong SIGN — and the sign is the dominant lever on monica
 * (±37-43%), while sub-degree precision is noise (0.98° vs 1.0° differ by 1.5e-7).
 *
 * The fabricated values are purged and the writer emits `{ sign, degree }`. These
 * tests pin the refusal, so a future reader cannot quietly start interpreting a
 * scalar again.
 */
import { deriveSacredStats } from "@/lib/agents/persona/derive-sacred-stats";
import type { CraftedAgent } from "@/lib/agent-types";

const agentWith = (ascendant: unknown): CraftedAgent =>
  ({
    consciousness: {
      monicaConstant: null,
      natalChart: {
        planets: {
          Sun: { sign: "Cancer", degree: 1.63 },
          Moon: { sign: "Leo", degree: 10 },
          Mercury: { sign: "Cancer", degree: 5 },
          Venus: { sign: "Gemini", degree: 20 },
          Mars: { sign: "Aries", degree: 3 },
        },
        ascendant,
      },
    },
  }) as never as CraftedAgent;

describe("a bare numeric Ascendant is not interpreted (§18k)", () => {
  it("deriveSacredStats reads the { sign, degree } form", () => {
    // Taurus 0.98 = 30.98 absolute, so the ascendant term contributes
    // (30.98/360)*10 = 0.8606 to adaptability. ⚠️ `clamp` applies Math.round
    // (sacred-7-stats.ts:645), so the stats do NOT compose additively — an
    // earlier version of this test asserted `absent + delta` and failed 55.86 vs
    // 56. Pin the measured integers instead of assuming the arithmetic survives.
    const withObject = deriveSacredStats(agentWith({ sign: "Taurus", degree: 0.98 }));
    const absent = deriveSacredStats(agentWith(undefined));
    expect(withObject.adaptability).toBe(56);
    expect(absent.adaptability).toBe(55);
    expect(withObject.adaptability).toBeGreaterThan(absent.adaptability);

    // A different sign at the same within-sign degree must land elsewhere —
    // which is the whole point: the SIGN is what the old scalar read got wrong.
    const virgo = deriveSacredStats(agentWith({ sign: "Virgo", degree: 0.98 }));
    expect(virgo.adaptability).not.toBe(withObject.adaptability);
  });

  it("deriveSacredStats REFUSES a bare number — it is indistinguishable from absent", () => {
    // The old code returned `ascendant` directly here, so 0.98 was read as
    // 0.98° absolute (0.98/360*10 = 0.027 of adaptability) when the true value
    // was 30.98 or 150.98. Refusing means the stat matches the absent case
    // rather than being confidently wrong.
    const bare = deriveSacredStats(agentWith(0.98));
    const absent = deriveSacredStats(agentWith(undefined));
    expect(bare.adaptability).toBe(absent.adaptability);
    expect(bare.vitality).toBe(absent.vitality);
  });

  it("CONTROL: the two stats that consume the ascendant do respond to it", () => {
    // Without this, the equality above could hold because nothing reads the
    // ascendant at all, making the refusal untested.
    const a = deriveSacredStats(agentWith({ sign: "Aries", degree: 0 }));
    const b = deriveSacredStats(agentWith({ sign: "Pisces", degree: 29 }));
    expect(a.adaptability).not.toBe(b.adaptability);
    expect(a.vitality).not.toBe(b.vitality);
    // And the stats that do NOT consume it must be unchanged, or the test above
    // would pass for the wrong reason.
    expect(a.resonance).toBe(b.resonance);
    expect(a.intuition).toBe(b.intuition);
  });

  it("an unrecognised sign falls back rather than throwing", () => {
    const bogus = deriveSacredStats(agentWith({ sign: "Ophiuchus", degree: 12 }));
    const absent = deriveSacredStats(agentWith(undefined));
    expect(bogus.adaptability).toBe(absent.adaptability);
    expect(Number.isFinite(bogus.vitality)).toBe(true);
  });
});
