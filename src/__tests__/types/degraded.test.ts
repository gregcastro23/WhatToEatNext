/**
 * Degraded-data signalling: the merge helper plus alchemize's monica-degenerate
 * detection and incoming-signal propagation.
 */
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import { mergeDegraded } from "@/types/degraded";

describe("mergeDegraded", () => {
  it("returns null when nothing is degraded", () => {
    expect(mergeDegraded()).toBeNull();
    expect(mergeDegraded(null, undefined)).toBeNull();
  });

  it("collects reasons from multiple sources", () => {
    expect(
      mergeDegraded({ reasons: ["stale-positions"] }, { reasons: ["monica-degenerate"] }),
    ).toEqual({ reasons: ["stale-positions", "monica-degenerate"] });
  });

  it("de-duplicates reasons while preserving first-seen order", () => {
    expect(
      mergeDegraded(
        { reasons: ["monica-degenerate"] },
        { reasons: ["stale-positions", "monica-degenerate"] },
      ),
    ).toEqual({ reasons: ["monica-degenerate", "stale-positions"] });
  });
});

const LIVE_POSITIONS: Record<string, PlanetaryPosition> = {
  Sun: { sign: "sagittarius", degree: 2, minute: 30, isRetrograde: false },
  Moon: { sign: "cancer", degree: 15, minute: 20, isRetrograde: false },
  Mercury: { sign: "sagittarius", degree: 18, minute: 45, isRetrograde: false },
  Venus: { sign: "capricorn", degree: 10, minute: 30, isRetrograde: false },
  Mars: { sign: "leo", degree: 25, minute: 15, isRetrograde: false },
  Jupiter: { sign: "gemini", degree: 16, minute: 40, isRetrograde: false },
  Saturn: { sign: "pisces", degree: 14, minute: 20, isRetrograde: false },
};

describe("alchemize degraded signalling", () => {
  it("leaves degraded unset for a healthy chart", () => {
    const result = alchemize(LIVE_POSITIONS);
    expect(result.degraded).toBeUndefined();
  });

  it("flags monica-degenerate when monica cannot be computed", () => {
    // Empty positions collapse ESMS to equal bases ⇒ kalchm === 1 ⇒ ln(K) === 0,
    // so monica never escapes its 1.0 default.
    const result = alchemize({});
    expect(result.monica).toBe(1);
    expect(result.degraded?.reasons).toContain("monica-degenerate");
  });

  it("propagates an incoming positions-degraded signal into the result", () => {
    const result = alchemize(LIVE_POSITIONS, null, new Date(), {
      incomingDegraded: { reasons: ["astronomy-engine-fallback"] },
    });
    expect(result.degraded?.reasons).toContain("astronomy-engine-fallback");
  });

  it("merges positions degradation with monica degradation", () => {
    const result = alchemize({}, null, new Date(), {
      incomingDegraded: { reasons: ["stale-positions"] },
    });
    expect(result.degraded?.reasons).toEqual(
      expect.arrayContaining(["stale-positions", "monica-degenerate"]),
    );
  });
});
