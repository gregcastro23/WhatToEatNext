import {
  compute_pot_simmer_step,
  VAPOUR_ESCAPE_FRACTIONS,
  LATENT_HEAT_SATURATION_100C_J_KG,
} from "@/lib/cooking/thermoSimmerMath";

describe("thermoSimmerMath and LivePot simulation step", () => {
  it("halves 1.0 L in approx 1081.5 seconds (18.0 min) at 1000W with no lid", () => {
    // 0.5 L lost = 0.5 * 0.95835 kg = 0.479175 kg
    // netLossKgS = 1000 / 2257000 = 0.000443066 kg/s
    // dt = 0.479175 / 0.000443066 = 1081.50 s = 18.025 min
    const step = compute_pot_simmer_step({
      initialVolL: 1.0,
      currentVolL: 1.0,
      burnerPowerW: 1000,
      lidSeal: 0, // no lid
      targetReductionPct: 0.5,
      dtS: 1081.5,
    });

    expect(step.currentVolL).toBeCloseTo(0.5, 2);
    expect(step.concentrationRatio).toBeCloseTo(2.0, 2);
    expect(step.alarmTriggered).toBe(true);
    expect(step.isBoiling).toBe(true);
  });

  it("exhibits strict lid seal monotonicity: none > cracked > loose > tight", () => {
    const dt = 100;
    const volLostNone = 1.0 - compute_pot_simmer_step({
      initialVolL: 1.0, currentVolL: 1.0, burnerPowerW: 1000, lidSeal: 0, targetReductionPct: 0.5, dtS: dt,
    }).currentVolL;

    const volLostCracked = 1.0 - compute_pot_simmer_step({
      initialVolL: 1.0, currentVolL: 1.0, burnerPowerW: 1000, lidSeal: 1, targetReductionPct: 0.5, dtS: dt,
    }).currentVolL;

    const volLostLoose = 1.0 - compute_pot_simmer_step({
      initialVolL: 1.0, currentVolL: 1.0, burnerPowerW: 1000, lidSeal: 2, targetReductionPct: 0.5, dtS: dt,
    }).currentVolL;

    const volLostTight = 1.0 - compute_pot_simmer_step({
      initialVolL: 1.0, currentVolL: 1.0, burnerPowerW: 1000, lidSeal: 3, targetReductionPct: 0.5, dtS: dt,
    }).currentVolL;

    expect(volLostNone).toBeGreaterThan(volLostCracked);
    expect(volLostCracked).toBeGreaterThan(volLostLoose);
    expect(volLostLoose).toBeGreaterThan(volLostTight);
  });

  it("handles boil-dry clamping safely without negative volume", () => {
    const step = compute_pot_simmer_step({
      initialVolL: 1.0,
      currentVolL: 0.1,
      burnerPowerW: 5000,
      lidSeal: 0,
      targetReductionPct: 0.5,
      dtS: 1000,
    });

    expect(step.currentVolL).toBe(0);
    expect(step.isBoiling).toBe(false);
    expect(step.alarmTriggered).toBe(true);
  });
});
