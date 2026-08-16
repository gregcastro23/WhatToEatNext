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
import { seedParticles, simulationInputs, stepOvenSimulation } from "@/lib/wasm/thermoEngine";
import { buildMethodMetrics } from "@/lib/cooking/methodMetrics";

const METRICS = buildMethodMetrics("roasting")!;

describe("the particle engine has no humidity channel", () => {
  it("stepOvenSimulation takes exactly its five thermodynamic arguments", () => {
    // buffer, dtS, ovenTempC, hWm2K, radiantSourceK — and nothing else.
    expect(stepOvenSimulation.length).toBe(5);
  });

  it("simulationInputs yields only physics-derived quantities", () => {
    // The full set of values that reach the simulation. Every one is derived
    // from the static method profile; none can carry a live room reading.
    expect(Object.keys(simulationInputs(METRICS)).sort()).toEqual([
      "hWm2K",
      "ovenTempC",
      "radiantSourceK",
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
