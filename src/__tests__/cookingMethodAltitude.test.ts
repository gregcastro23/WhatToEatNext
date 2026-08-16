/**
 * Elevation-awareness of the cooking-method medium temperature.
 *
 * ── The defect these tests exist for ────────────────────────────────────────
 *
 * `[MEASURED 2026-08-16]` `mediumC` was a fixed constant while `altitudeEffect`
 * computed the real local boiling point, so a single card could print
 *
 *     Boiling · medium 212 °F     …     water boils at 196 °F here · ×1.5 longer
 *
 * and the headline "min to core" was computed at the sea-level medium wherever
 * the user was. Understatement measured against the corrected model: boiling
 * and steaming 8 % at Denver, 14 % at Bogotá, 20 % at La Paz.
 *
 * ── Why the obvious fix is wrong ────────────────────────────────────────────
 *
 * "Clamp everything marked `penalised`" breaks the two-phase methods.
 * `tilt_skillet` is genuinely altitude-penalised and carries `mediumC: 218` —
 * a dry steel sear floor, hotter than water's ceiling at every elevation on
 * Earth. Blanket-clamping it drops its displayed medium from 424 °F to 196 °F
 * at Bogotá and inflates its core time by 133 %: a wrong number replacing a
 * right one, in the name of a correction.
 *
 * The split is therefore between what the medium IS (`mediumKind`, which decides
 * whether the DISPLAYED number moves) and where the penalty LANDS
 * (`altitudeCriticalC`, which may be a phase the card never shows).
 *
 * @file src/__tests__/cookingMethodAltitude.test.ts
 */
import {
  METHOD_PHYSICS,
  mediumTracksWaterCeiling,
  altitudeCriticalTemperatureC,
} from "@/data/cooking/methodPhysics";
import { localizedMedium, altitudeCriticalGap, altitudeEffect } from "@/lib/cooking/methodMetrics";
import { boilingPointCAtElevation } from "@/lib/cooking/thermo";

const DENVER_M = 1609;
const BOGOTA_M = 2640;
const LA_PAZ_M = 3640;
/** La Rinconada, Peru — the highest permanent human settlement. */
const HIGHEST_SETTLEMENT_M = 5100;

const ALL = Object.keys(METHOD_PHYSICS);

describe("medium kind governs whether elevation moves the displayed medium", () => {
  it("every method declares one", () => {
    for (const id of ALL) {
      expect(METHOD_PHYSICS[id].mediumKind).toBeTruthy();
    }
  });

  it("only water-bound media are ever clamped, at any elevation", () => {
    for (const id of ALL) {
      const physics = METHOD_PHYSICS[id];
      const clampedAnywhere = [0, DENVER_M, BOGOTA_M, LA_PAZ_M, HIGHEST_SETTLEMENT_M].some(
        (m) => localizedMedium(id, m)!.clamped,
      );
      if (clampedAnywhere) {
        expect(mediumTracksWaterCeiling(physics)).toBe(true);
      }
    }
  });

  it("a dry sear floor is never clamped — tilt_skillet holds 218 °C everywhere", () => {
    // The specific regression. A blanket clamp inflated this by 133 % at Bogotá.
    for (const m of [0, DENVER_M, BOGOTA_M, LA_PAZ_M, HIGHEST_SETTLEMENT_M]) {
      const local = localizedMedium("tilt_skillet", m)!;
      expect(local.clamped).toBe(false);
      expect(local.celsius).toBe(METHOD_PHYSICS.tilt_skillet.mediumC);
    }
  });

  it("oil, radiant and dry-air media are untouched at the highest inhabited elevation", () => {
    for (const id of ["frying", "stir_frying", "grilling", "broiling", "roasting", "dehydrating"]) {
      expect(localizedMedium(id, HIGHEST_SETTLEMENT_M)!.clamped).toBe(false);
    }
  });

  it("pressure cooking is not penalised — it is the appliance bought to defeat this", () => {
    const local = localizedMedium("pressure_cooking", HIGHEST_SETTLEMENT_M)!;
    expect(local.clamped).toBe(false);
    expect(METHOD_PHYSICS.pressure_cooking.altitudeResponse).toBe("compensated");
  });
});

describe("the clamp is self-thresholding", () => {
  it("saturated-water media track the ceiling from the first metre", () => {
    for (const id of ["boiling", "steaming"]) {
      expect(localizedMedium(id, DENVER_M)!.clamped).toBe(true);
      expect(localizedMedium(id, DENVER_M)!.celsius).toBeCloseTo(
        boilingPointCAtElevation(DENVER_M),
        10,
      );
    }
  });

  it("sub-boiling liquids stay put until the ceiling actually reaches them", () => {
    // Braising 95 °C, simmering 91 °C, stewing 88 °C — the thresholds fall out
    // of min(nominal, ceiling); there is no per-method table to keep in step.
    expect(localizedMedium("braising", 0)!.clamped).toBe(false);
    expect(localizedMedium("braising", DENVER_M)!.clamped).toBe(true);

    expect(localizedMedium("simmering", DENVER_M)!.clamped).toBe(false);
    expect(localizedMedium("simmering", LA_PAZ_M)!.clamped).toBe(true);

    expect(localizedMedium("stewing", BOGOTA_M)!.clamped).toBe(false);
    expect(localizedMedium("stewing", LA_PAZ_M)!.clamped).toBe(true);
  });

  it("reports nothing clamped at sea level", () => {
    // Antoine puts saturation at 99.99683 °C, not exactly 100. A strict
    // `ceiling < nominal` test therefore fires for a boiling pot at the coast
    // and claims elevation corrected 3 mK.
    for (const id of ALL) {
      const local = localizedMedium(id, 0)!;
      expect(local.clamped).toBe(false);
      expect(local.shiftC).toBe(0);
    }
  });

  it("never raises a medium above its nominal value", () => {
    for (const id of ALL) {
      for (const m of [0, DENVER_M, BOGOTA_M, LA_PAZ_M, HIGHEST_SETTLEMENT_M]) {
        expect(localizedMedium(id, m)!.celsius).toBeLessThanOrEqual(METHOD_PHYSICS[id].mediumC);
        expect(localizedMedium(id, m)!.shiftC).toBeLessThanOrEqual(0);
      }
    }
  });
});

describe("core time follows the localized medium", () => {
  it("boiling and steaming take measurably longer at altitude", () => {
    for (const id of ["boiling", "steaming"]) {
      const denver = localizedMedium(id, DENVER_M)!;
      const laPaz = localizedMedium(id, LA_PAZ_M)!;
      expect(denver.coreTimeIncrease).toBeGreaterThan(0.05);
      expect(laPaz.coreTimeIncrease!).toBeGreaterThan(denver.coreTimeIncrease!);
      // Sanity: this is a real but moderate effect, not a doubling.
      expect(laPaz.coreTimeIncrease!).toBeLessThan(0.5);
    }
  });

  it("core time is unchanged wherever the medium is unchanged", () => {
    for (const id of ALL) {
      const local = localizedMedium(id, LA_PAZ_M)!;
      if (local.clamped) continue;
      expect(local.coreMinutes).toBe(local.seaLevelCoreMinutes);
      if (local.coreMinutes !== null) expect(local.coreTimeIncrease).toBe(0);
    }
  });

  it("keeps a null core time null rather than inventing one", () => {
    // Mass-transfer and microbial methods have no core-temperature answer, at
    // any elevation.
    for (const id of ["fermentation", "curing", "pickling", "marinating", "spherification"]) {
      const local = localizedMedium(id, LA_PAZ_M)!;
      expect(local.coreMinutes).toBeNull();
      expect(local.coreTimeIncrease).toBeNull();
    }
  });
});

describe("methods on another substance's vapour-pressure curve", () => {
  it("decline to compute rather than applying water's Antoine relation", () => {
    for (const id of ["distilling", "cryo_cooking"]) {
      const local = localizedMedium(id, LA_PAZ_M)!;
      expect(local.uncomputableReason).toBeTruthy();
      expect(local.uncomputableReason).toMatch(/vapour-pressure curve/i);
      // Declining means the number does not move — not that it moves by zero
      // for a physical reason.
      expect(local.clamped).toBe(false);
    }
  });

  it("a stated refusal is long enough to actually explain itself", () => {
    expect(localizedMedium("distilling", LA_PAZ_M)!.uncomputableReason!.length).toBeGreaterThan(120);
  });
});

describe("two-phase methods: the penalty can land where the card does not look", () => {
  it("tilt_skillet is penalised at its braise liquid, not its sear floor", () => {
    const physics = METHOD_PHYSICS.tilt_skillet;
    expect(physics.altitudeResponse).toBe("penalised");

    const gap = altitudeCriticalGap("tilt_skillet", BOGOTA_M)!;
    expect(gap.differsFromMedium).toBe(true);
    expect(gap.criticalC).toBeLessThan(physics.mediumC);
    expect(gap.squeezed).toBe(true);

    // ...while the displayed medium is untouched. Both are true at once, and
    // that is precisely what a single `mediumC` could not express.
    expect(localizedMedium("tilt_skillet", BOGOTA_M)!.clamped).toBe(false);
  });

  it("gelification is penalised at agar's hydration temperature, not its set", () => {
    const physics = METHOD_PHYSICS.gelification;
    const critical = altitudeCriticalTemperatureC(physics);
    expect(critical).toBeGreaterThan(physics.mediumC);
    // The note claims the ceiling closes on hydration above ~2500 m; check the
    // claim rather than trusting the prose.
    expect(boilingPointCAtElevation(2500)).toBeGreaterThan(critical - 2);
    expect(boilingPointCAtElevation(3500)).toBeLessThan(critical);
  });

  it("every override names a temperature different from the displayed medium", () => {
    for (const id of ALL) {
      const physics = METHOD_PHYSICS[id];
      if (physics.altitudeCriticalC === undefined) continue;
      expect(physics.altitudeCriticalC).not.toBe(physics.mediumC);
    }
  });

  it("a method with no override falls back to its own medium", () => {
    for (const id of ALL) {
      const physics = METHOD_PHYSICS[id];
      if (physics.altitudeCriticalC !== undefined) continue;
      expect(altitudeCriticalTemperatureC(physics)).toBe(physics.mediumC);
    }
  });
});

describe("altitudeEffect carries the localized medium", () => {
  it("agrees with localizedMedium for every method", () => {
    for (const id of ALL) {
      for (const m of [0, DENVER_M, BOGOTA_M]) {
        expect(altitudeEffect(id, m)!.localizedMedium).toEqual(localizedMedium(id, m));
      }
    }
  });

  it("no longer contradicts its own boiling point readout", () => {
    // The original defect, stated directly: a water-bound method may not show a
    // medium hotter than the water it is sitting in.
    for (const id of ALL) {
      if (!mediumTracksWaterCeiling(METHOD_PHYSICS[id])) continue;
      const effect = altitudeEffect(id, BOGOTA_M)!;
      expect(effect.localizedMedium.celsius).toBeLessThanOrEqual(effect.boilingC + 1e-9);
    }
  });
});
