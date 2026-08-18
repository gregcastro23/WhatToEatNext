/**
 * Boundary network — property tables, correlations, evaporation, and the chain.
 *
 * The fixture for this layer is generated from Rust and so cannot vouch for any
 * of the transcribed tables or published correlations. Everything below that
 * could be wrong *in both runtimes at once* is therefore checked against
 * something from outside this repository: the printed Prandtl columns the
 * tables themselves carry, water's known properties at its boiling point,
 * Zuber's critical heat flux, and — in one case — this repo's own independently
 * fitted latent-heat correlation, which was built from a different source.
 *
 * @file src/__tests__/cookingBoundaryNetwork.test.ts
 */
import {
  AIR_MAX_C,
  AIR_MIN_C,
  BOILING_SURFACE_CSF,
  WATER_MAX_C,
  WATER_MIN_C,
  absoluteHumidityKgM3,
  airProperties,
  coveredWaterLoss,
  lidHeatBalance,
  criticalHeatFluxWm2,
  diffusionWaterInAir,
  evaporativeFlux,
  evaporativePinnedSurfaceC,
  humidAirVapourDensity,
  naturalConvectionH,
  nucleateBoilingFlux,
  plateCharacteristicLength,
  saturatedWaterProperties,
  saturationPressureKpa,
  solveBoundaryNetwork,
  vapourDensityKgM3,
} from "@/lib/cooking/boundaryNetwork";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";
import {
  biotNumber,
  boilingPointC,
  boilingPointCAtElevation,
  characteristicLengthRatio,
} from "@/lib/cooking/thermo";

/** Distance between two doubles in units in the last place. */
function ulpGap(a: number, b: number): number {
  const ba = new BigInt64Array(new Float64Array([a]).buffer)[0];
  const bb = new BigInt64Array(new Float64Array([b]).buffer)[0];
  return Number(ba > bb ? ba - bb : bb - ba);
}

describe("property tables reproduce their own printed redundancy", () => {
  it("closes air's Prandtl column from the four stored ones", () => {
    // Incropera Table A.4 prints ν, α and Pr as well, and all three are
    // derivable from ρ, cp, μ and k. Storing them would add three chances to
    // mistype; using them HERE turns that redundancy into a transcription test.
    const printed: Array<[number, number]> = [
      [250, 0.72],
      [300, 0.707],
      [350, 0.7],
      [400, 0.69],
      [450, 0.686],
      [500, 0.684],
      [550, 0.683],
      [600, 0.685],
      [650, 0.69],
      [700, 0.695],
      [750, 0.702],
      [800, 0.709],
    ];
    let worst = 0;
    for (const [kelvin, pr] of printed) {
      const rel = Math.abs(airProperties(kelvin - 273.15).prandtl - pr) / pr;
      worst = Math.max(worst, rel);
    }
    // `[MEASURED 2026-08-18]` worst residual 0.0665 % at 500 K.
    expect(worst).toBeLessThan(0.001);
  });

  it("closes saturated water's Prandtl column, which is how a bad row was caught", () => {
    // The 373.15 K viscosity was first transcribed as 279e-6 and closed to
    // Pr = 1.730 against a printed 1.76 — 1.7 %, an outlier against every other
    // row's ≤0.4 %. The stored value is the independently known 0.2818 mPa·s.
    const printed: Array<[number, number]> = [
      [280, 10.26],
      [290, 7.56],
      [300, 5.83],
      [310, 4.62],
      [320, 3.77],
      [330, 3.15],
      [340, 2.66],
      [350, 2.29],
      [360, 2.02],
      [370, 1.8],
      [373.15, 1.76],
    ];
    let worst = 0;
    for (const [kelvin, pr] of printed) {
      const rel = Math.abs(saturatedWaterProperties(kelvin - 273.15).prandtl - pr) / pr;
      worst = Math.max(worst, rel);
    }
    // `[MEASURED 2026-08-18]` worst 0.706 % at the boiling point.
    expect(worst).toBeLessThan(0.01);
  });

  it("REFUSES outside the tabulated range rather than extrapolating", () => {
    expect(() => airProperties(AIR_MIN_C - 1)).toThrow(RangeError);
    expect(() => airProperties(AIR_MAX_C + 1)).toThrow(RangeError);
    expect(() => saturatedWaterProperties(WATER_MIN_C - 1)).toThrow(RangeError);
    // Above the boiling point there is no saturated LIQUID to have properties.
    expect(() => saturatedWaterProperties(WATER_MAX_C + 1)).toThrow(RangeError);
    expect(airProperties(AIR_MIN_C).kelvin).toBeCloseTo(250, 9);
    expect(saturatedWaterProperties(WATER_MAX_C).kelvin).toBeCloseTo(373.15, 9);
  });

  it("matches water's independently known properties at its boiling point", () => {
    const w = saturatedWaterProperties(100);
    expect(w.rhoKgM3).toBeCloseTo(957.85, 2);
    expect(w.cpJkgK).toBeCloseTo(4217, 0);
    expect(w.kWmK).toBeCloseTo(0.68, 4);
    expect(w.sigmaNm).toBeCloseTo(0.0589, 5);
    expect(w.hfgJkg).toBeCloseTo(2257e3, -1);
    // Ideal-gas vapour density against the steam table's 0.5956 — 1.21 % low,
    // which is real non-ideality, not a transcription error.
    expect(Math.abs(w.rhoVapourKgM3 - 0.5956) / 0.5956).toBeLessThan(0.015);
  });

  it("agrees with this repo's OTHER latent-heat implementation, built from a different fit", () => {
    // The table's h_fg came from Incropera; latentHeat.ts's came from the
    // Fleagle & Andreas linear-in-K fit. Two independent sources landing within
    // a percent is worth more than either matching itself.
    const table = saturatedWaterProperties(100).hfgJkg;
    const fitted = latentHeatVaporisation(100);
    expect(Math.abs(table - fitted) / table).toBeLessThan(0.01);
  });
});

describe("Antoine, in both directions", () => {
  it("round-trips EXACTLY through thermo.ts's inverse", () => {
    // Both directions share one coefficient triple, so this catches a divergence
    // the moment one copy is edited without the other.
    for (const t of [1, 20, 50, 80, 100]) {
      expect(boilingPointC(saturationPressureKpa(t))).toBeCloseTo(t, 10);
    }
  });

  it("lands on published vapour pressures", () => {
    // 2.339 kPa at 20 °C and 101.325 at 100 °C are the standard figures.
    expect(Math.abs(saturationPressureKpa(20) - 2.339) / 2.339).toBeLessThan(0.005);
    expect(Math.abs(saturationPressureKpa(100) - 101.325) / 101.325).toBeLessThan(0.0005);
  });

  it("REFUSES relative humidity above 100 °C, because the variable stops meaning anything", () => {
    // Not an envelope: above the boiling point p_sat exceeds atmospheric, so
    // any RH implies more vapour than 1 atm of air can hold.
    expect(() => absoluteHumidityKgM3(200, 10)).toThrow(/not a usable variable/);
    expect(() => absoluteHumidityKgM3(20, 101)).toThrow(RangeError);
    expect(absoluteHumidityKgM3(20, 50)).toBeGreaterThan(0);
  });

  it("thins kitchen air's vapour by expansion alone when an oven heats it", () => {
    // `[MEASURED 2026-08-18]` 8.609 g·m⁻³ at 20 °C becomes 5.334 at 200 °C — a
    // 38 % fall with no water removed. Skipping it overstates the air's ability
    // to hold evaporation back.
    const kitchen = absoluteHumidityKgM3(20, 50);
    const oven = humidAirVapourDensity(20, 50, 200);
    expect(kitchen * 1000).toBeCloseTo(8.609, 2);
    expect(oven / kitchen).toBeCloseTo(293.15 / 473.15, 9);
    expect(1 - oven / kitchen).toBeGreaterThan(0.35);
  });
});

describe("natural convection", () => {
  const film = airProperties(60);

  it("puts a pot wall in the right band and names its correlation", () => {
    // 100 °C wall, 20 °C kitchen, 15 cm tall. Natural convection in air lives
    // at 2–25 W·m⁻²·K⁻¹; anything outside that is a units error, not a nuance.
    const v = naturalConvectionH(film, "vertical", 80, 0.15);
    expect(v.hWm2K).toBeGreaterThan(2);
    expect(v.hWm2K).toBeLessThan(25);
    expect(v.rayleigh).toBeGreaterThan(1e7);
    expect(v.correlation).toMatch(/Churchill/);
    expect(v.extrapolated).toBe(false);
  });

  it("uses A/P — which is D/4 for a circle, not D", () => {
    // Getting this wrong scales Ra by 64 and h by ~2.8×.
    expect(plateCharacteristicLength((Math.PI * 0.2 * 0.2) / 4, Math.PI * 0.2)).toBeCloseTo(0.05, 9);
    expect(() => plateCharacteristicLength(0, 1)).toThrow(RangeError);
  });

  it("makes a surface lose exactly twice as fast facing up as facing down", () => {
    // McAdams' two constants are 0.54 and 0.27 over the same Ra^¼, so the ratio
    // is exact. It is also why a rack above a roast browns and one below does not.
    const lc = plateCharacteristicLength((Math.PI * 0.2 * 0.2) / 4, Math.PI * 0.2);
    const up = naturalConvectionH(film, "horizontal-up", 80, lc);
    const down = naturalConvectionH(film, "horizontal-down", 80, lc);
    expect(up.hWm2K / down.hWm2K).toBeCloseTo(2, 9);
    expect(up.correlation).toMatch(/facing up/);
  });

  it("FLAGS an out-of-envelope Rayleigh instead of silently extrapolating", () => {
    // A barely-warm surface is a real situation and refusing would break it, so
    // the honest middle is a flag a caller can surface.
    const cool = naturalConvectionH(film, "horizontal-up", 0.001, 0.002);
    expect(cool.rayleigh).toBeLessThan(1e4);
    expect(cool.extrapolated).toBe(true);
    expect(() => naturalConvectionH(film, "vertical", 80, 0)).toThrow(RangeError);
  });
});

describe("nucleate boiling", () => {
  const water = saturatedWaterProperties(100);

  it("reproduces Zuber's critical heat flux for water at 1 atm", () => {
    // ~1.1–1.25 MW·m⁻² is the published band, the spread being the finite-plate
    // correction. This is an EXTERNAL anchor: nothing else here would catch a
    // wrong σ or ρ_v.
    const chf = criticalHeatFluxWm2(water);
    expect(chf / 1e6).toBeGreaterThan(1.0);
    expect(chf / 1e6).toBeLessThan(1.4);
  });

  it("goes as the excess temperature CUBED, exactly", () => {
    // The character of the whole correlation, and of a pot going from nothing
    // to a rolling boil over a few degrees of dial.
    const ratio = nucleateBoilingFlux(water, 9).fluxWm2 / nucleateBoilingFlux(water, 3).fluxWm2;
    expect(ratio).toBeCloseTo(27, 6);
  });

  it("lands a 10 K excess in the published nucleate-boiling band", () => {
    const b = nucleateBoilingFlux(water, 10);
    // 10⁵ W·m⁻² is the textbook order for water at ΔTe = 10 K.
    expect(b.fluxWm2).toBeGreaterThan(5e4);
    expect(b.fluxWm2).toBeLessThan(5e5);
    // h in the nucleate range, thousands not tens.
    expect(b.hWm2K).toBeGreaterThan(3000);
    expect(b.hWm2K).toBeLessThan(35000);
  });

  it("REFUSES past burnout, where the correlation points the wrong way", () => {
    // Above the critical flux the vapour film goes continuous and flux FALLS.
    // A monotone cube there would be inventing energy.
    expect(() => nucleateBoilingFlux(water, 30)).toThrow(/critical flux/);
    expect(nucleateBoilingFlux(water, 20).burnoutFraction).toBeLessThan(1);
    expect(nucleateBoilingFlux(water, 20).burnoutFraction).toBeGreaterThan(0.5);
    // And refuses at or below saturation, where there is no boiling at all.
    expect(() => nucleateBoilingFlux(water, 0)).toThrow(RangeError);
    expect(() => nucleateBoilingFlux(water, -5)).toThrow(RangeError);
  });

  it("makes surface finish worth 11.79×, which changes what is even possible", () => {
    // C_sf is cubed, so a scored pan and a mirror-polished one are in different
    // regimes at the same dial: at 10 K excess the scored one is already past
    // burnout while the polished one is at 11 % of it.
    const ratio =
      nucleateBoilingFlux(water, 5, "stainless-scored").fluxWm2 /
      nucleateBoilingFlux(water, 5, "stainless-polished").fluxWm2;
    const cubed = Math.pow(
      BOILING_SURFACE_CSF["stainless-polished"] / BOILING_SURFACE_CSF["stainless-scored"],
      3,
    );
    expect(ratio).toBeCloseTo(cubed, 9);
    expect(ratio).toBeCloseTo(11.79, 2);
    expect(() => nucleateBoilingFlux(water, 10, "stainless-scored")).toThrow(/critical flux/);
    expect(nucleateBoilingFlux(water, 10, "stainless-polished").burnoutFraction).toBeLessThan(0.2);
  });
});

describe("evaporative flux", () => {
  const water = saturatedWaterProperties(100);
  const kitchen = absoluteHumidityKgM3(20, 50);
  const film = airProperties(60);
  const lc = plateCharacteristicLength((Math.PI * 0.2 * 0.2) / 4, Math.PI * 0.2);
  const h = naturalConvectionH(film, "horizontal-up", 80, lc).hWm2K;

  it("costs an open 20 cm pan about 360 W and half a kilo an hour", () => {
    // The number that explains why a 1.5 kW burner struggles to hold a rolling
    // boil in a wide pan, and why the same pan lidded holds it easily.
    const e = evaporativeFlux(h, 100, 20, kitchen, water.hfgJkg);
    const area = (Math.PI * 0.2 * 0.2) / 4;
    expect(e.latentFluxWm2 * area).toBeGreaterThan(250);
    expect(e.latentFluxWm2 * area).toBeLessThan(500);
    const gramsPerHour = e.massFluxKgM2s * area * 3600 * 1000;
    expect(gramsPerHour).toBeGreaterThan(400);
    expect(gramsPerHour).toBeLessThan(800);
  });

  it("puts the Lewis number near unity, which is why the analogy works at all", () => {
    const e = evaporativeFlux(h, 100, 20, kitchen, water.hfgJkg);
    expect(e.lewis).toBeGreaterThan(0.8);
    expect(e.lewis).toBeLessThan(1.0);
    expect(e.surfaceVapourKgM3).toBeGreaterThan(e.bulkVapourKgM3);
  });

  it("REVERSES on a cold surface rather than clamping at zero", () => {
    // A negative flux is condensation on a cold plate — a real mechanism, and
    // clamping would erase it.
    const cold = evaporativeFlux(10, 5, 25, absoluteHumidityKgM3(25, 80), 2489e3);
    expect(cold.massFluxKgM2s).toBeLessThan(0);
    expect(cold.latentFluxWm2).toBeLessThan(0);
    expect(() => evaporativeFlux(-1, 50, 20, kitchen, 2.3e6)).toThrow(RangeError);
  });

  it("scales diffusion with temperature and stays inside the correlation's noise", () => {
    expect(diffusionWaterInAir(25 - 273.15 + 273.15)).toBeCloseTo(0.26e-4, 6);
    expect(diffusionWaterInAir(200)).toBeGreaterThan(diffusionWaterInAir(25));
    // T^1.5 against Fuller's T^1.75 — 10.9 % at 200 °C, 7.4 % after Le^-2/3.
    const kinetic = diffusionWaterInAir(200);
    const fuller = 0.26e-4 * Math.pow(473.15 / 298, 1.75);
    expect(Math.abs(kinetic - fuller) / fuller).toBeLessThan(0.12);
  });
});

describe("the evaporative pin", () => {
  it("holds a wet surface 145 K below a 200 °C oven", () => {
    // The result that explains why a roast can spend an hour in a hot oven
    // without browning: it is not hot enough to brown, because it is still wet.
    const vapour = humidAirVapourDensity(20, 50, 200);
    const pinned = evaporativePinnedSurfaceC(200, vapour, 15, 200, 0.9, 100);
    expect(pinned.celsius).toBeGreaterThan(40);
    expect(pinned.celsius).toBeLessThan(70);
    expect(pinned.depressionK).toBeGreaterThan(130);
    expect(pinned.saturated).toBe(false);
    // The balance the solver claims to have found must actually balance.
    const gain = pinned.convectiveGainWm2 + pinned.radiativeGainWm2;
    expect(Math.abs(gain - pinned.evaporativeLossWm2) / gain).toBeLessThan(1e-9);
  });

  it("gets COLDER under a convection fan, which is the opposite of the intuition", () => {
    // More h speeds convective gain and evaporative loss together, and the
    // latter wins because it climbs with the surface's own vapour pressure.
    const vapour = humidAirVapourDensity(20, 50, 200);
    const still = evaporativePinnedSurfaceC(200, vapour, 15, 200, 0.9, 100);
    const fan = evaporativePinnedSurfaceC(200, vapour, 40, 200, 0.9, 100);
    expect(fan.celsius).toBeLessThan(still.celsius);
    // …while removing far more water per unit area, which is the trade.
    expect(fan.massFluxKgM2s).toBeGreaterThan(still.massFluxKgM2s * 1.5);
  });

  it("SATURATES at the ceiling under a broiler instead of exceeding it", () => {
    // A 600 °C element delivers more than evaporation can shed, so the surface
    // reaches the local boiling point and stops. It must never go past it.
    const vapour = humidAirVapourDensity(20, 50, 200);
    const broiled = evaporativePinnedSurfaceC(200, vapour, 15, 600, 0.9, 100);
    expect(broiled.saturated).toBe(true);
    expect(broiled.celsius).toBeCloseTo(100, 9);
  });

  it("pins to the LOCAL ceiling at altitude, not to 100 °C", () => {
    // Red-proof note: the broiler case above cannot catch a lost ceiling,
    // because its ceiling and the Antoine limit are both 100 °C and the two
    // coincide. Denver's 94.7 °C separates them, and this is where a surface
    // quietly boiling 5 K too hot would show up. It is also the real effect —
    // crusts form at a lower surface temperature at altitude.
    const denver = boilingPointCAtElevation(1609);
    expect(denver).toBeLessThan(96);
    const vapour = humidAirVapourDensity(20, 50, 200);
    const pinned = evaporativePinnedSurfaceC(200, vapour, 15, 600, 0.9, denver);
    expect(pinned.saturated).toBe(true);
    expect(pinned.celsius).toBeCloseTo(denver, 9);
    expect(pinned.celsius).toBeLessThan(100);
  });

  it("sits still when there is no driving force at all", () => {
    // Saturated air at the surface's own temperature: nothing evaporates and
    // nothing moves. A solver that drifted here would be solving noise.
    const pinned = evaporativePinnedSurfaceC(99, absoluteHumidityKgM3(99, 100), 10, 99, 0.9, 100);
    expect(pinned.celsius).toBeCloseTo(99, 6);
    expect(Math.abs(pinned.massFluxKgM2s)).toBeLessThan(1e-9);
  });
});

describe("the series resistance network", () => {
  const potato = {
    geometry: "sphere" as const,
    halfDimensionM: 0.025,
    kWmK: 0.55,
    areaM2: 4 * Math.PI * 0.025 ** 2,
  };

  it("flips the controlling link between an oven and a pot, for the SAME food", () => {
    // The whole point of the layer. Nothing about the potato changes.
    const oven = solveBoundaryNetwork({
      sourceC: 200,
      sinkC: 20,
      food: { ...potato, mediumToFoodHWm2K: 15 },
    });
    const boiling = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 20,
      vessel: {
        sourceToVesselHWm2K: 60,
        areaM2: 0.05,
        kWmK: 15,
        thicknessM: 0.003,
        vesselToMediumHWm2K: 5000,
      },
      food: { ...potato, mediumToFoodHWm2K: 1500 },
    });
    expect(oven.controlling.id).toBe("medium-to-food");
    expect(boiling.controlling.id).toBe("food-interior");
    // …and the Biot number crosses the lumped/distributed boundary with it.
    expect(oven.foodBiot!).toBeLessThan(1);
    expect(boiling.foodBiot!).toBeGreaterThan(10);
  });

  it("leaves the vessel wall three orders of magnitude off the bottleneck", () => {
    const n = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 20,
      vessel: {
        sourceToVesselHWm2K: 60,
        areaM2: 0.05,
        kWmK: 52,
        thicknessM: 0.003,
        vesselToMediumHWm2K: 5000,
      },
      food: { ...potato, mediumToFoodHWm2K: 1500 },
    });
    const wall = n.links.find((l) => l.id === "vessel-wall")!;
    expect(wall.share).toBeLessThan(0.001);
    expect(n.controlling.id).not.toBe("vessel-wall");
  });

  it("reproduces the Biot number the ordinary way, to a MEASURED ULP budget", () => {
    // `Bi ≡ h·L_c/k` IS the ratio of the last two resistances, so the chain can
    // check itself. They agree algebraically and not to the bit: the food's
    // area cancels on paper but each path rounds differently. `[MEASURED
    // 2026-08-18]` over 2,100 arrangements the gap never exceeded 3 ULP.
    let worst = 0;
    for (const geometry of ["slab", "cylinder", "sphere"] as const) {
      for (const h of [5, 15, 50, 200, 1500, 5000, 20000]) {
        for (const halfDimensionM of [0.005, 0.0125, 0.025, 0.05, 0.1]) {
          for (const kWmK of [0.2, 0.35, 0.45, 0.55, 1.8]) {
            for (const areaM2 of [0.001, 0.0078, 0.05, 0.2]) {
              const n = solveBoundaryNetwork({
                sourceC: 200,
                sinkC: 20,
                food: { geometry, halfDimensionM, kWmK, areaM2, mediumToFoodHWm2K: h },
              });
              const direct = biotNumber(
                h,
                halfDimensionM * characteristicLengthRatio(geometry),
                kWmK,
              );
              worst = Math.max(worst, ulpGap(n.foodBiot!, direct));
            }
          }
        }
      }
    }
    expect(worst).toBeLessThanOrEqual(4);
  });

  it("conserves the temperature it started with", () => {
    // The drops across the chain must sum to the end-to-end difference and the
    // shares to 1. A link double-counted or dropped shows up here first.
    const n = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 20,
      vessel: {
        sourceToVesselHWm2K: 60,
        areaM2: 0.05,
        kWmK: 15,
        thicknessM: 0.003,
        vesselToMediumHWm2K: 5000,
      },
      food: { ...potato, mediumToFoodHWm2K: 1500 },
    });
    expect(n.links.reduce((s, l) => s + l.dropK, 0)).toBeCloseTo(230, 9);
    expect(n.links.reduce((s, l) => s + l.share, 0)).toBeCloseTo(1, 12);
    expect(n.nodes[0].celsius).toBe(250);
    expect(n.nodes[n.nodes.length - 1].celsius).toBeCloseTo(20, 9);
    expect(n.uaWperK).toBeCloseTo(1 / n.totalResistanceKperW, 12);
  });

  it("models a vesselless chain rather than inventing a pan for a roast", () => {
    // A roast on a rack has no vessel. Forcing one in would add two resistances
    // and a wall that are not there.
    const n = solveBoundaryNetwork({
      sourceC: 200,
      sinkC: 20,
      food: { ...potato, mediumToFoodHWm2K: 15 },
    });
    expect(n.links.map((l) => l.id)).toEqual(["medium-to-food", "food-interior"]);
    // …and an empty pot has no food.
    const pot = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 100,
      vessel: {
        sourceToVesselHWm2K: 60,
        areaM2: 0.05,
        kWmK: 15,
        thicknessM: 0.003,
        vesselToMediumHWm2K: 5000,
      },
    });
    expect(pot.foodBiot).toBeNull();
    expect(pot.controlling.id).toBe("source-to-vessel");
  });

  it("refuses a chain with nothing in it, and non-positive inputs", () => {
    expect(() => solveBoundaryNetwork({ sourceC: 200, sinkC: 20 })).toThrow(/neither/);
    expect(() =>
      solveBoundaryNetwork({
        sourceC: 200,
        sinkC: 20,
        food: { ...potato, kWmK: 0, mediumToFoodHWm2K: 15 },
      }),
    ).toThrow(RangeError);
  });

  it("keeps vapour density consistent with the pressure it came from", () => {
    // Derived, not tabulated — so it cannot fall out of step with p_sat.
    const p = saturationPressureKpa(100);
    expect(vapourDensityKgM3(p, 100)).toBeCloseTo(
      saturatedWaterProperties(100).rhoVapourKgM3,
      12,
    );
  });
});

describe("the lid, and the derivation that turned out to be the wrong quantity", () => {
  const hfg = saturatedWaterProperties(100).hfgJkg;
  /** 26 cm Dutch oven lid. */
  const dutch = { lidAreaM2: 0.0531, lidPerimeterM: 0.8168, headspaceC: 100, ambientC: 20 };
  const heavy = lidHeatBalance({ ...dutch, lidThicknessM: 0.006, lidKWmK: 40, latentHeatJkg: hfg });

  it("runs a metal lid within a degree of the steam, whatever it is made of", () => {
    // Condensing steam is such a good heat-transfer mode that the plate cannot
    // hold a temperature gradient. That is WHY material drops out below.
    expect(heavy.lidC).toBeGreaterThan(99);
    expect(heavy.lidC).toBeLessThan(100);
  });

  it("gives every metal lid the SAME steady heat loss, gauge and material regardless", () => {
    // `[MEASURED 2026-08-18]` 1.2 mm stainless / 1.5 mm stainless / 6 mm
    // enamelled cast iron → 66.21 / 66.19 / 66.12 W. Material is a TRANSIENT
    // property (thermal mass, which vessels.ts already carries), not a steady one.
    const thin = lidHeatBalance({ ...dutch, lidThicknessM: 0.0012, lidKWmK: 15, latentHeatJkg: hfg });
    expect(Math.abs(thin.totalLossW - heavy.totalLossW) / heavy.totalLossW).toBeLessThan(0.01);
  });

  it("but NOT a glass one — the discriminating case a metals-only test would miss", () => {
    // At k ≈ 1.1 the conduction term finally rivals the outside air film. A model
    // that ignored lid conduction entirely would pass the metal test above and
    // fail here, which is the point of keeping this case.
    const glass = lidHeatBalance({ ...dutch, lidThicknessM: 0.008, lidKWmK: 1.1, latentHeatJkg: hfg });
    expect(glass.lidC).toBeLessThan(95);
    expect(glass.totalLossW).toBeLessThan(heavy.totalLossW * 0.95);
  });

  it("scales with the room, which is the other thing that actually sets it", () => {
    const cold = lidHeatBalance({ ...dutch, ambientC: 5, lidThicknessM: 0.006, lidKWmK: 40, latentHeatJkg: hfg });
    expect(cold.totalLossW).toBeGreaterThan(heavy.totalLossW * 1.1);
  });

  it("REFUSES a headspace that is not above ambient", () => {
    // No temperature difference means no condensation to balance, and the
    // bisection would be solving an empty problem.
    expect(() =>
      lidHeatBalance({ ...dutch, headspaceC: 20, lidThicknessM: 0.006, lidKWmK: 40, latentHeatJkg: hfg }),
    ).toThrow(RangeError);
  });

  it("condenses only about a ninth of what a free surface evaporates", () => {
    // ⚠️ THE FINDING. `vessels.ts` declares a tight lid returns 92 % of the
    // free-surface rate. The lid's heat loss says 11–12 %, and says nearly the
    // same for every lid, because it is set by area and room temperature rather
    // than by seal quality. Both cannot be describing the same thing — and the
    // resolution is that the free-surface rate does not apply under a lid at
    // all, so there is nothing for a fraction to multiply.
    const lc = plateCharacteristicLength(dutch.lidAreaM2, dutch.lidPerimeterM);
    const h = naturalConvectionH(airProperties(60), "horizontal-up", 80, lc).hWm2K;
    const free =
      evaporativeFlux(h, 100, 20, absoluteHumidityKgM3(20, 50), hfg).massFluxKgM2s *
      dutch.lidAreaM2;
    const ratio = heavy.condensationCapacityKgS / free;
    expect(ratio).toBeGreaterThan(0.08);
    expect(ratio).toBeLessThan(0.15);
    // And it is nearly seal-blind: a thin loose stockpot lid lands in the same band.
    const stockpot = lidHeatBalance({
      lidAreaM2: 0.0452,
      lidPerimeterM: 0.754,
      lidThicknessM: 0.0012,
      lidKWmK: 15,
      headspaceC: 100,
      ambientC: 20,
      latentHeatJkg: hfg,
    });
    const lcS = plateCharacteristicLength(0.0452, 0.754);
    const hS = naturalConvectionH(airProperties(60), "horizontal-up", 80, lcS).hWm2K;
    const freeS =
      evaporativeFlux(hS, 100, 20, absoluteHumidityKgM3(20, 50), hfg).massFluxKgM2s * 0.0452;
    expect(Math.abs(stockpot.condensationCapacityKgS / freeS - ratio)).toBeLessThan(0.02);
  });

  it("puts the SAME lid in two regimes on burner power alone", () => {
    // Which is the reason a per-seal constant is the wrong shape, not merely
    // the wrong number.
    const quiet = coveredWaterLoss(50, heavy.condensationCapacityKgS, hfg);
    const hard = coveredWaterLoss(800, heavy.condensationCapacityKgS, hfg);
    expect(quiet.holding).toBe(true);
    expect(quiet.netLossKgS).toBe(0);
    expect(quiet.returnFraction).toBe(1);
    expect(hard.holding).toBe(false);
    expect(hard.netLossKgS * 3.6e6).toBeGreaterThan(1000);
    expect(hard.returnFraction).toBeLessThan(0.1);
  });

  it("conserves mass and refuses nonsense power", () => {
    const l = coveredWaterLoss(400, heavy.condensationCapacityKgS, hfg);
    expect(l.condensateReturnedKgS + l.netLossKgS).toBeCloseTo(l.steamGeneratedKgS, 15);
    expect(l.netLossKgS).toBeGreaterThanOrEqual(0);
    expect(() => coveredWaterLoss(-1, heavy.condensationCapacityKgS, hfg)).toThrow(RangeError);
    expect(() => coveredWaterLoss(400, heavy.condensationCapacityKgS, 0)).toThrow(RangeError);
  });
});
