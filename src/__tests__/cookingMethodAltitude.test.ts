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
import {
  ANTOINE_CLAMP_KPA,
  boilingPointC,
  boilingPointCAtElevation,
  saturationCeilingFromStationPressure,
} from "@/lib/cooking/thermo";
import { pressureFromElevation } from "@/lib/environment/isa";

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

describe("measured station pressure supersedes the ISA model", () => {
  /**
   * `[MEASURED]` The pressure at which Antoine reaches its 100.01 °C acceptance
   * ceiling. Bisected against the same coefficients the library uses, so this
   * pins the ACTUAL boundary rather than a remembered one.
   */
  const ANTOINE_THROW_KPA = 101.372841;

  it("the clamp target really is below the throw boundary", () => {
    // The control for the whole clamp: prove the unclamped call throws, so a
    // passing clamp test cannot be passing for the trivial reason that nothing
    // was ever out of range.
    expect(() => boilingPointC(ANTOINE_THROW_KPA + 0.001)).toThrow(RangeError);
    expect(() => boilingPointC(ANTOINE_CLAMP_KPA)).not.toThrow();
    expect(ANTOINE_CLAMP_KPA).toBeLessThan(ANTOINE_THROW_KPA);
  });

  it("survives every pressure a barometer can legitimately report", () => {
    // The crash path the clamp exists for: an ordinary high-pressure system.
    for (const kpa of [101.4, 102, 103, 105, 107.8, 110]) {
      expect(() => saturationCeilingFromStationPressure(kpa)).not.toThrow();
      const ceiling = saturationCeilingFromStationPressure(kpa);
      expect(ceiling.clamped).toBe(true);
      expect(ceiling.appliedKpa).toBe(ANTOINE_CLAMP_KPA);
      // Truth is preserved even though it was not used.
      expect(ceiling.measuredKpa).toBe(kpa);
    }
  });

  it("does not clamp, or claim to, below the ceiling", () => {
    for (const kpa of [60, 80, 95, 101.325]) {
      const ceiling = saturationCeilingFromStationPressure(kpa);
      expect(ceiling.clamped).toBe(false);
      expect(ceiling.appliedKpa).toBe(kpa);
      expect(ceiling.celsius).toBe(boilingPointC(kpa));
    }
  });

  it("still rejects a broken sensor rather than clamping it", () => {
    // Clamping is for weather. Zero, negative and NaN are not weather.
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => saturationCeilingFromStationPressure(bad)).toThrow(RangeError);
    }
  });

  it("a measured low beats ISA — the same elevation gets a lower ceiling", () => {
    // The reason to prefer a barometer at all. Denver under a deep low sits
    // below the ISA pressure for its elevation, and the food notices.
    const isaKpa = pressureFromElevation(DENVER_M);
    const stormyKpa = isaKpa - 2.5;

    const modelled = localizedMedium("boiling", DENVER_M)!;
    const measured = localizedMedium("boiling", DENVER_M, stormyKpa)!;

    expect(measured.celsius).toBeLessThan(modelled.celsius);
    expect(measured.coreTimeIncrease!).toBeGreaterThan(modelled.coreTimeIncrease!);
    expect(measured.pressureClamped).toBeUndefined();
  });

  it("omitting the reading is byte-identical to the elevation-only path", () => {
    // Guards the optional parameter: adding it must not have moved any existing
    // number. Compared across every method, not a sampled few.
    for (const id of ALL) {
      for (const m of [0, DENVER_M, BOGOTA_M, LA_PAZ_M]) {
        expect(localizedMedium(id, m, undefined)).toEqual(localizedMedium(id, m));
      }
    }
  });

  it("reports the clamp instead of swallowing it", () => {
    // A sea-level kitchen in a record high. The medium reads as sea level —
    // which is a FLOOR, not the truth — so the flag has to survive to the UI.
    const local = localizedMedium("boiling", 0, 107.8)!;
    expect(local.pressureClamped).toBe(true);
    // ...and the flag is set even though the medium itself did not move,
    // which is the case a naive `if (clamped)` would drop on the floor.
    expect(local.clamped).toBe(false);
  });

  it("the elevation path is unclamped at and above sea level", () => {
    for (const m of [0, DENVER_M, LA_PAZ_M, HIGHEST_SETTLEMENT_M]) {
      expect(pressureFromElevation(m)).toBeLessThanOrEqual(ANTOINE_CLAMP_KPA);
      for (const id of ALL) {
        expect(localizedMedium(id, m)!.pressureClamped).toBeUndefined();
      }
    }
  });
});

describe("below sea level — the crash this feature would otherwise have armed", () => {
  /**
   * `[MEASURED 2026-08-16]` ISA pressure crosses Antoine's validity ceiling at
   * −3.982 m, NOT at 0 m. Every inhabited depression on Earth is past it:
   *
   *   Netherlands (Zuidplaspolder)  −6.76 m  101.406 kPa
   *   Death Valley (Badwater)         −86 m  102.362 kPa
   *   Turfan Depression, China       −154 m  103.189 kPa  (~600 000 residents)
   *   Jericho                        −258 m  104.463 kPa
   *   Dead Sea shore (Ein Bokek)     −430 m  106.598 kPa
   *
   * The raw kernel throws for all of them. That was harmless while the UI only
   * offered five presets at 0 m and above — and would have stopped being
   * harmless the moment live telemetry started supplying real elevations, which
   * is precisely what `upsert_environmental_observation` does (it accepts down
   * to −500 m). A dormant defect that the next commit arms is not a dormant
   * defect.
   */
  const BELOW_SEA_LEVEL_M = [-6.76, -86, -154, -258, -430, -500];

  it("the raw kernel really does throw — the control for everything below", () => {
    // If this ever stops throwing, the tests beneath it are vacuous.
    for (const m of BELOW_SEA_LEVEL_M) {
      expect(() => boilingPointCAtElevation(m)).toThrow(RangeError);
    }
    expect(() => boilingPointCAtElevation(-3.9)).not.toThrow();
  });

  it("every public entry point survives every inhabited depression", () => {
    for (const m of BELOW_SEA_LEVEL_M) {
      for (const id of ALL) {
        expect(() => localizedMedium(id, m)).not.toThrow();
        expect(() => altitudeEffect(id, m)).not.toThrow();
        expect(() => altitudeCriticalGap(id, m)).not.toThrow();
      }
    }
  });

  it("saturates rather than inventing a super-100 °C medium", () => {
    for (const m of BELOW_SEA_LEVEL_M) {
      const local = localizedMedium("boiling", m)!;
      expect(local.pressureClamped).toBe(true);
      expect(local.celsius).toBe(METHOD_PHYSICS.boiling.mediumC);
      expect(local.clamped).toBe(false);
    }
  });

  it("reports no altitude penalty below sea level, which is the physical truth", () => {
    // Water boils HOTTER down here, so a boil is if anything faster. The
    // multiplier must not exceed 1 — an altitude penalty at −430 m would be
    // the sign error this whole module exists to prevent.
    for (const m of BELOW_SEA_LEVEL_M) {
      const effect = altitudeEffect("boiling", m)!;
      expect(effect.softeningMultiplier).toBeLessThanOrEqual(1);
      expect(effect.pasteurisationMultiplier).toBeLessThanOrEqual(1);
      expect(effect.shiftC).toBe(0);
    }
  });

  it("a dry sear floor ignores the barometer as thoroughly as it ignores altitude", () => {
    for (const kpa of [80, 101.325, 107.8]) {
      const local = localizedMedium("tilt_skillet", BOGOTA_M, kpa)!;
      expect(local.celsius).toBe(METHOD_PHYSICS.tilt_skillet.mediumC);
      expect(local.clamped).toBe(false);
    }
  });
});
