/**
 * The convection particle engine takes no humidity, and this is the test that
 * keeps it that way.
 *
 * ── Why a test rather than a comment ────────────────────────────────────────
 *
 * Live environmental telemetry (`useEnvironmentalObservation`) delivers ambient
 * temperature and relative humidity to the cooking-method cards. Both are real
 * measurements and both are genuinely interesting, which makes them exactly the
 * kind of value that gets multiplied into a velocity because it was in scope.
 *
 * The engine solves buoyancy, drag and Newton cooling. None of those terms
 * takes a humidity argument — not in `thermo-core`'s `step_oven_simulation`,
 * not in the f32-disciplined TypeScript transliteration, not in the compiled
 * Wasm. A canvas that visibly reacted to a humid kitchen would therefore be
 * showing a behaviour with no equation behind it: responsive-looking, and
 * meaning nothing.
 *
 * Humidity's real effects — the evaporative ceiling and browning onset — are
 * routed to PANEL TEXT, where they are claims in words that a cook can check,
 * rather than motion that merely implies a claim.
 *
 * ── What this test actually pins ────────────────────────────────────────────
 *
 * The *arity and shape* of the simulation entry points. If someone adds a
 * humidity parameter, this fails and they have to come here and read the note
 * above. That is the point: humidity may enter the engine, but only by first
 * appearing in the thermo-core equations with a stated basis and a golden
 * vector — never by being available.
 *
 * @file src/__tests__/particleEngineHumidityGuardrail.test.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  seedParticles,
  simulationInputs,
  stepMediumSimulation,
  stepOvenSimulation,
} from "@/lib/wasm/thermoEngine";
import { buildMethodMetrics } from "@/lib/cooking/methodMetrics";

const METRICS = buildMethodMetrics("roasting")!;

describe("the particle engine has no humidity channel", () => {
  it("stepOvenSimulation takes exactly its five thermodynamic arguments", () => {
    // buffer, dtS, ovenTempC, hWm2K, radiantSourceK — and nothing else.
    expect(stepOvenSimulation.length).toBe(5);
  });

  it("stepMediumSimulation takes exactly its six thermodynamic arguments", () => {
    // buffer, dtS, regime, mediumTempC, hWm2K, radiantSourceK — and nothing
    // else. This is the entry point the canvas actually calls now;
    // `stepOvenSimulation` is a wrapper on the BuoyantAir case, so pinning only
    // the wrapper would leave the live path unguarded — which is precisely the
    // gap this file exists to prevent.
    expect(stepMediumSimulation.length).toBe(6);
  });

  it("simulationInputs yields only physics-derived quantities", () => {
    // The full set of values that reach the simulation. Every one is derived
    // from the static method profile; none can carry a live room reading.
    //
    // `regime` joined this list on 2026-08-17 and qualifies on the same terms as
    // the other three: `heatRegimeFor` reads `mediumKind`, `rateLimiter` and the
    // transfer-mode fractions off the STATIC method profile. It cannot vary with
    // the room — the same method resolves to the same regime on every machine,
    // in every kitchen, which is what the determinism test below then proves
    // about the motion.
    expect(Object.keys(simulationInputs(METRICS)).sort()).toEqual([
      "hWm2K",
      "ovenTempC",
      "radiantSourceK",
      "regime",
    ]);
  });

  it("the same inputs give the same motion, every time", () => {
    // The mechanism behind the guardrail: the step is a pure function of the
    // three inputs above and the buffer. If an ambient reading were reaching it
    // through any back channel — a module-level cache, a global, a Date — two
    // identical calls could diverge. They must not.
    const a = seedParticles(64);
    const b = seedParticles(64);
    expect(Array.from(a)).toEqual(Array.from(b));

    const { ovenTempC, hWm2K, radiantSourceK } = simulationInputs(METRICS);
    for (let i = 0; i < 200; i++) {
      stepOvenSimulation(a, 0.016, ovenTempC, hWm2K, radiantSourceK);
      stepOvenSimulation(b, 0.016, ovenTempC, hWm2K, radiantSourceK);
    }
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("only the oven temperature moves the particles — not the room", () => {
    // A control for the test above: prove the buffer DOES respond to a real
    // thermodynamic input, so "identical output" is a property of determinism
    // rather than of a simulation that never moves at all.
    const cool = seedParticles(64);
    const hot = seedParticles(64);
    const { hWm2K, radiantSourceK } = simulationInputs(METRICS);
    for (let i = 0; i < 200; i++) {
      stepOvenSimulation(cool, 0.016, 30, hWm2K, radiantSourceK);
      stepOvenSimulation(hot, 0.016, 230, hWm2K, radiantSourceK);
    }
    expect(Array.from(cool)).not.toEqual(Array.from(hot));
  });
});

/**
 * A second, separate fabrication risk on the same data path.
 *
 * The guardrail above stops humidity reaching the SIMULATION. This one stops an
 * unmeasured room condition being INVENTED in the first place.
 *
 * `[MEASURED 2026-08-16]` A producer revision shipped
 * `DEFAULT_AMBIENT_TEMP_C = 21.0` / `DEFAULT_RELATIVE_HUMIDITY_PCT = 50.0` as
 * fallbacks "when room sensors are absent". Nothing in this app supplies a room
 * sensor, so the fallback WAS the value — every user published two literals,
 * and the Humidity panel rendered them beneath "● In your kitchen now".
 *
 * The root cause was schema shape, not carelessness: `ambient_temp_c` was a
 * required `f32`, so absence was not representable and something had to be put
 * there. Both fields are now `Option<f32>`.
 */
describe("unmeasured room conditions are absent, not invented", () => {
  const producerSource = readFileSync(
    join(process.cwd(), "src/hooks/useEnvironmentalProducer.ts"),
    "utf8",
  );

  it("the producer declares no default room temperature or humidity", () => {
    // Pinned against the source because the defect is the EXISTENCE of a
    // constant, which no runtime assertion can observe once it is gone.
    //
    // Matches a `const` DECLARATION, not the identifier: the doc comment in the
    // producer names both constants while explaining why they were removed, and
    // a bare-identifier regex fails on that prose. (It did, on first run.)
    expect(producerSource).not.toMatch(/^\s*const\s+DEFAULT_AMBIENT_TEMP_C/m);
    expect(producerSource).not.toMatch(/^\s*const\s+DEFAULT_RELATIVE_HUMIDITY_PCT/m);
  });

  it("...and the control: that regex would have caught the real declaration", () => {
    // Without this, a regex that matches nothing at all would pass the test
    // above for the wrong reason.
    const withDefect = 'const DEFAULT_AMBIENT_TEMP_C = 21.0;\nconst DEFAULT_RELATIVE_HUMIDITY_PCT = 50.0;';
    expect(withDefect).toMatch(/^\s*const\s+DEFAULT_AMBIENT_TEMP_C/m);
    expect(withDefect).toMatch(/^\s*const\s+DEFAULT_RELATIVE_HUMIDITY_PCT/m);
  });

  it("falls back to null, never to a plausible constant", () => {
    // The specific regression: `?? 21.0` / `?? 50.0`. A numeric literal on the
    // right of `??` for either field is the defect, whatever it is named.
    expect(producerSource).toMatch(/ambientTempCOverride\s*\?\?\s*null/);
    expect(producerSource).toMatch(/relativeHumidityPctOverride\s*\?\?\s*null/);
    expect(producerSource).not.toMatch(/(ambientTempC|relativeHumidityPct)Override\s*\?\?\s*[\d.]/);
  });

  it("the reader normalises the NaN sentinel instead of nullish-coalescing it", () => {
    // The root cause is that absence must be REPRESENTABLE or it gets faked.
    // `Option<f32>` is the right shape, but that migration is blocked upstream
    // (SpacetimeDB treats F32 -> Option<F32> as breaking, and the only override
    // drops the whole database), so absence is carried as NaN instead.
    //
    // `?? null` does NOT catch NaN. If this reverts to `??`, the panel receives
    // NaN and renders the string "NaN°F" — so the specific mechanism is pinned,
    // not merely the outcome.
    const hook = readFileSync(
      join(process.cwd(), "src/hooks/useEnvironmentalObservation.ts"),
      "utf8",
    );
    expect(hook).toMatch(/ambientTempC:\s*finiteOrNull\(/);
    expect(hook).toMatch(/relativeHumidityPct:\s*finiteOrNull\(/);
    expect(hook).toMatch(/Number\.isFinite/);
  });

  it("NaN really does defeat the coalescing operator — the control", () => {
    // Without this the test above could pass while `??` was in fact adequate.
    expect(Number.NaN ?? null).toBeNaN();
    expect(Number.NaN ?? 0).toBeNaN();
    expect(Number.NaN.toFixed(0)).toBe("NaN");
  });
});
