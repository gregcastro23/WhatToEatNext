/**
 * Cross-runtime parity for the culinary physics engine — the TypeScript half.
 *
 * The formula set is implemented ONCE PER RUNTIME:
 *
 *   - Rust, in `crates/thermo-core`, linked by BOTH the SpacetimeDB module
 *     (`spacetime-module`) and the browser WASM engine (`crates/thermo-wasm`).
 *   - TypeScript, in `src/lib/cooking/thermo.ts` and
 *     `src/lib/environment/isa.ts`, which the server renders from and which the
 *     browser falls back to whenever the WASM module is unavailable.
 *
 * Nothing in either build stops those from drifting apart. The only defence is
 * that both reproduce the SAME golden vectors, so both suites read
 * `crates/thermo-core/tests/thermo_golden_vectors.json`. The Rust half is
 * `crates/thermo-core/tests/golden.rs`.
 *
 * Assertions are `toBe` on numbers, deliberately — the same choice, for the
 * same reason, as `kalchmCrossRuntimeParity.test.ts`: `toBeCloseTo(…, 15)` once
 * passed in this repository against three separately WRONG constants. A
 * tolerance here would wave through exactly the drift this file exists to
 * catch.
 *
 * ── What this caught when it was first written ──────────────────────────────
 *
 * `[MEASURED 2026-08-16]` Three genuine disagreements, none of which any amount
 * of reading the two files had found:
 *
 *   1. `isa.ts` carried the literal `ISA_EXPONENT = 5.25588` above a comment
 *      deriving it as `9.80665 × 0.0289644 / (8.31447 × 0.0065)`. That
 *      expression is 5.2557813. The literal came from ISA-1976's *defined*
 *      R* = 8.31432 (→ 5.2558761); the comment cited CODATA's 8.31447. The
 *      number was right and its stated basis was wrong. Rust computed from the
 *      specific-gas form, so the two runtimes disagreed by 2.5e-7 relative —
 *      1.8e-5 kPa at 3000 m. Physically nothing; fatal to exact comparison.
 *   2. Rust's food effusivity was the literal `1286.0` beside a comment reading
 *      `sqrt(0.45 * 1050 * 3500)`, which is 1285.98211496116846. TypeScript
 *      computed the square root, so the two were 0.018 apart.
 *   3. The convection buoyancy constant differed 6× (0.0005·ΔT vs 0.003·ΔT)
 *      between the Rust simulation and the canvas's own loop — and the canvas
 *      falls back to that loop whenever WASM fails to load.
 *
 * @file src/__tests__/cookingThermoCrossRuntimeParity.test.ts
 */
import { readFileSync } from "fs";
import { join } from "path";

import { deriveCookware, FOOD_EFFUSIVITY, contactTemperatureC } from "@/data/cooking/cookwareMaterials";
import {
  STEFAN_BOLTZMANN,
  Z_VALUE_CULINARY_C,
  Q10_CULINARY,
  zValueFromQ10,
  boilingPointC,
  boilingPointCAtElevation,
  altitudeTimeMultiplier,
  slabEigenvalue,
  slabCoefficient,
  slabCoreTime,
  besselJ0,
  besselJ1,
  geometryEigenvalue,
  geometryCoefficient,
  characteristicLengthRatio,
  surfaceAreaToVolume,
  type FoodGeometry,
  radiantFluxKwM2,
  radiativeH,
  wetBulbC,
  cToF,
} from "@/lib/cooking/thermo";
import { pressureFromElevation, SEA_LEVEL_PRESSURE_KPA } from "@/lib/environment/isa";
import {
  BUOYANCY_PER_K,
  SWIRL_AMPLITUDE,
  CONVECTION_DRAG,
  FLOATS_PER_PARTICLE,
  HeatRegime,
  heatRegimeFor,
  regimeParams,
  seedParticles,
  stepMediumSimulation,
  stepOvenSimulation,
} from "@/lib/wasm/thermoEngine";
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";

interface Golden {
  constants: Record<string, number>;
  boilingPoint: { pressureKpa: number; celsius: number }[];
  elevation: {
    elevationM: number;
    pressureKpa: number;
    boilingC: number;
    softeningMultiplier: number;
    pasteurisationMultiplier: number;
  }[];
  slabEigen: { biot: number; lambda1: number; coefficientA1: number }[];
  bessel: { x: number; j0: number; j1: number }[];
  geometryEigen: {
    geometry: FoodGeometry;
    biot: number;
    lambda1: number;
    coefficientA1: number;
    lengthRatio: number;
  }[];
  slabCookTime: {
    name: string;
    thicknessMm: number;
    mediumC: number;
    initialC: number;
    targetC: number;
    hWm2K: number;
    oneSided: boolean;
    minutes: number;
    biot: number;
    fourier: number;
    lambda1: number;
    coefficientA1: number;
    oneTermValid: boolean;
  }[];
  radiation: {
    sourceK: number;
    surfaceK: number;
    emissivity: number;
    viewFactor: number;
    fluxKwM2: number;
    radiativeH: number;
  }[];
  contact: {
    material: string;
    kWmK: number;
    rhoKgM3: number;
    cJkgK: number;
    effusivity: number;
    contactC: number;
  }[];
  wetBulb: { dryBulbC: number; relativeHumidityPct: number; wetBulbC: number | null }[];
  externalAnchors: Record<string, Record<string, number | string>>;
  simulation: {
    buoyancyPerK: number;
    swirlAmplitude: number;
    drag: number;
    floatsPerParticle: number;
    trace: {
      step: number;
      particle: number;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      tempC: number;
      radiantIntensity: number;
    }[];
  };
}

const GOLDEN = JSON.parse(
  readFileSync(join(process.cwd(), "crates/thermo-core/tests/thermo_golden_vectors.json"), "utf8"),
) as Golden;

/**
 * Maximum permitted disagreement, in units in the last place, for values
 * computed through `Math.tan` / `Math.pow`.
 *
 * ⚠️ THIS IS A MEASUREMENT, NOT A COMFORT MARGIN. Do not raise it to make a
 * failing test pass; re-measure and find out what moved.
 *
 * `[MEASURED 2026-08-16]` The physics is written once but reaches users as
 * three separately compiled executables, so all three were swept against the
 * fixture:
 *
 *   host Rust (aarch64)   0 ULP — it generated the fixture
 *   TypeScript on V8      2 ULP  (4.15e-16 relative)
 *   compiled wasm32       4 ULP  (8.9e-16 relative)
 *
 * Every disagreement sits in exactly one place: the bisection in
 * `slabEigenvalue`, which calls `Math.tan`, plus the quantities computed from
 * its result. V8, host libm and Rust's wasm libm round `tan` differently in the
 * last bit for some arguments — a property of the platforms, not of this code.
 *
 * Everything NOT downstream of a transcendental agrees to 0 ULP in all three
 * and is asserted with `toBe`: boiling point, ISA pressure, radiant flux,
 * linearised h, contact temperature, effusivity, wet bulb, and the entire
 * simulation trace. (The simulation survives exact comparison despite calling
 * `Math.sin` because its state is f32 — the narrowing discards the ~29 bits
 * where the libms can differ.)
 *
 * The bound is 2× the worst observed. For scale, a genuinely wrong constant —
 * the class of defect this file exists to catch — shows up at 1e-7 relative or
 * worse, eight orders of magnitude outside this window.
 *
 * The wasm32 executable is checked separately, by
 * `scripts/verify-thermo-wasm-parity.mjs`, which runs as the last step of
 * `bun run build:wasm`. It cannot run here: the generated bindings are a build
 * product and are gitignored.
 */
const MAX_ULP = 8;

const ULP_VIEW = new DataView(new ArrayBuffer(8));

/** Distance between two doubles counted in representable steps. */
function ulpDistance(a: number, b: number): number {
  if (Object.is(a, b)) return 0;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.POSITIVE_INFINITY;
  const ordinal = (x: number): bigint => {
    ULP_VIEW.setFloat64(0, x);
    const raw = ULP_VIEW.getBigUint64(0);
    const sign = 1n << 63n;
    return raw & sign ? sign - (raw & ~sign) : raw;
  };
  const oa = ordinal(a);
  const ob = ordinal(b);
  return Number(oa > ob ? oa - ob : ob - oa);
}

/** Assert agreement to within {@link MAX_ULP}, reporting the actual distance. */
function expectNearlyExact(actual: number, expected: number, what: string): void {
  const distance = ulpDistance(actual, expected);
  if (distance > MAX_ULP) {
    throw new Error(
      `${what}: ${actual} vs Rust ${expected} — ${distance} ULP apart ` +
        `(relative ${(Math.abs(actual - expected) / Math.abs(expected)).toExponential(3)}), ` +
        `budget is ${MAX_ULP}. A gap this size is drift, not libm rounding.`,
    );
  }
}

describe("cross-runtime constants", () => {
  it("reproduces every shared constant exactly", () => {
    const c = GOLDEN.constants;
    expect(STEFAN_BOLTZMANN).toBe(c.STEFAN_BOLTZMANN);
    expect(SEA_LEVEL_PRESSURE_KPA).toBe(c.ISA_P0_KPA);
    expect(Z_VALUE_CULINARY_C).toBe(c.Z_VALUE_CULINARY_C);
    expect(Q10_CULINARY).toBe(c.Q10_CULINARY);
    expect(zValueFromQ10(Q10_CULINARY)).toBe(c.Z_FROM_Q10);
  });

  it("derives the same food effusivity rather than transcribing it", () => {
    // The defect: a Rust literal 1286.0 against a computed 1285.98211496116846.
    expect(FOOD_EFFUSIVITY).toBe(GOLDEN.constants.FOOD_EFFUSIVITY_LEAN_MEAT);
  });
});

describe("boiling point vs pressure", () => {
  it.each(GOLDEN.boilingPoint)("matches Rust at $pressureKpa kPa", ({ pressureKpa, celsius }) => {
    expect(boilingPointC(pressureKpa)).toBe(celsius);
  });

  it("refuses the same inputs the Rust refuses", () => {
    // Divergent validity envelopes are drift that no vector of LEGAL inputs can
    // find. Rust briefly allowed 0–105 °C where this allows 1–100.
    expect(() => boilingPointC(0)).toThrow(RangeError);
    expect(() => boilingPointC(-1)).toThrow(RangeError);
    expect(() => boilingPointC(Number.NaN)).toThrow(RangeError);
    expect(() => boilingPointC(200)).toThrow(/Antoine/i);
  });
});

describe("elevation", () => {
  it.each(GOLDEN.elevation)(
    "matches Rust at $elevationM m",
    ({ elevationM, pressureKpa, boilingC, softeningMultiplier, pasteurisationMultiplier }) => {
      expect(pressureFromElevation(elevationM)).toBe(pressureKpa);
      expect(boilingPointCAtElevation(elevationM)).toBe(boilingC);
      // 10^(−Δ/z) goes through Math.pow — the one place in this group where V8
      // and libm can part company in the last bit.
      expectNearlyExact(
        altitudeTimeMultiplier(elevationM, "softening"),
        softeningMultiplier,
        `softening multiplier @${elevationM} m`,
      );
      expectNearlyExact(
        altitudeTimeMultiplier(elevationM, "pasteurisation"),
        pasteurisationMultiplier,
        `pasteurisation multiplier @${elevationM} m`,
      );
    },
  );

  it("keeps the two altitude regimes far apart", () => {
    // The distinction that stops pressure cooking — the appliance bought to
    // defeat altitude — from being handed a slowdown.
    const denver = GOLDEN.elevation.find((e) => e.elevationM === 1609);
    expect(denver).toBeDefined();
    expect(denver!.pasteurisationMultiplier / denver!.softeningMultiplier).toBeGreaterThan(6);
  });
});

describe("transient slab conduction", () => {
  it.each(GOLDEN.slabEigen)("eigenvalue matches Rust at Bi = $biot", ({ biot, lambda1, coefficientA1 }) => {
    // λ·tan λ = Bi is solved by bisection over Math.tan, so this is the one
    // family in the whole fixture where V8 and libm genuinely differ.
    expectNearlyExact(slabEigenvalue(biot), lambda1, `λ₁(Bi=${biot})`);
    expectNearlyExact(slabCoefficient(lambda1), coefficientA1, `A₁(Bi=${biot})`);
  });

  it.each(GOLDEN.slabCookTime)("core time matches Rust for $name", (row) => {
    const result = slabCoreTime({
      thicknessMm: row.thicknessMm,
      mediumC: row.mediumC,
      initialC: row.initialC,
      targetC: row.targetC,
      hWm2K: row.hWm2K,
      oneSided: row.oneSided,
    });
    // Biot is pure arithmetic on the inputs — no transcendental, so exact.
    expect(result.biot).toBe(row.biot);
    // Everything else here descends from the eigenvalue.
    expectNearlyExact(result.lambda1, row.lambda1, `${row.name} λ₁`);
    expectNearlyExact(result.coefficientA1, row.coefficientA1, `${row.name} A₁`);
    expectNearlyExact(result.fourier, row.fourier, `${row.name} Fo`);
    expectNearlyExact(result.minutes, row.minutes, `${row.name} minutes`);
    expect(result.oneTermValid).toBe(row.oneTermValid);
  });

  it("refuses an unreachable target in both runtimes", () => {
    expect(() => slabCoreTime({ thicknessMm: 25, mediumC: 55, initialC: 5, targetC: 60, hWm2K: 95 })).toThrow(
      RangeError,
    );
  });
});

describe("geometry — cylinders and spheres", () => {
  it.each(GOLDEN.bessel)("Bessel series matches Rust EXACTLY at x = $x", ({ x, j0, j1 }) => {
    // `toBe`, not the ULP helper. The series is `+ − × ÷` only, so it owes
    // nothing to V8's or libm's transcendentals and must agree to the bit.
    // Rust's std has no Bessel function; that is precisely why this is a
    // hand-rolled shared series rather than a library call on either side.
    // If this ever needs a tolerance, the series has been changed into
    // something that calls a transcendental, and that is the bug.
    expect(besselJ0(x)).toBe(j0);
    expect(besselJ1(x)).toBe(j1);
  });

  it.each(GOLDEN.geometryEigen)(
    "$geometry eigenvalue matches Rust at Bi = $biot",
    ({ geometry, biot, lambda1, coefficientA1, lengthRatio }) => {
      // The cylinder branch is pure arithmetic and reproduces exactly; the slab
      // and sphere branches go through tan, so they get the same measured ULP
      // budget as the rest of that family.
      expectNearlyExact(geometryEigenvalue(geometry, biot), lambda1, `λ₁(${geometry}, Bi=${biot})`);
      expectNearlyExact(
        geometryCoefficient(geometry, lambda1),
        coefficientA1,
        `A₁(${geometry}, Bi=${biot})`,
      );
      expect(characteristicLengthRatio(geometry)).toBe(lengthRatio);
    },
  );

  it("routes the slab through one answer, whichever entry point is used", () => {
    // Two exported paths to the same number, and a caller cannot tell which one
    // a given panel reached for.
    for (const { biot } of GOLDEN.slabEigen) {
      expect(geometryEigenvalue("slab", biot)).toBe(slabEigenvalue(biot));
    }
  });

  it("orders the shapes by how fast they core, at equal Biot", () => {
    // The ordering IS the physics: more surface feeding the same volume means a
    // larger λ₁, and λ₁ enters the exponent squared. The fixture was generated
    // from this same code and so cannot catch the whole family being wrong;
    // this can.
    for (const biot of [0.1, 1, 10, 100]) {
      const slab = geometryEigenvalue("slab", biot);
      const cylinder = geometryEigenvalue("cylinder", biot);
      const sphere = geometryEigenvalue("sphere", biot);
      expect(slab).toBeLessThan(cylinder);
      expect(cylinder).toBeLessThan(sphere);
    }
  });

  it("derives surface-area-to-volume from the shape, not a table", () => {
    // A 20 mm cube of carrot and a 20 mm-diameter carrot are not the same
    // cooking problem, and this ratio is why.
    expect(surfaceAreaToVolume("slab", 0.01)).toBeCloseTo(100, 10);
    expect(surfaceAreaToVolume("cylinder", 0.01)).toBeCloseTo(200, 10);
    expect(surfaceAreaToVolume("sphere", 0.01)).toBeCloseTo(300, 10);
    expect(() => surfaceAreaToVolume("sphere", 0)).toThrow(RangeError);
  });

  it("reproduces Incropera Table 5.1, which the fixture cannot vouch for", () => {
    // EXTERNAL anchor. Tolerance is 5e-5 because the table is PRINTED to four
    // decimals — that is the source's precision, not a margin chosen to pass.
    const table: Array<[FoodGeometry, number, number, number]> = [
      ["slab", 0.1, 0.3111, 1.0161],
      ["cylinder", 0.1, 0.4417, 1.0246],
      ["sphere", 0.1, 0.5423, 1.0298],
      ["slab", 1, 0.8603, 1.1191],
      ["cylinder", 1, 1.2558, 1.2071],
      ["sphere", 1, 1.5708, 1.2732],
      ["slab", 10, 1.4289, 1.262],
      ["cylinder", 10, 2.1795, 1.5677],
      ["sphere", 10, 2.8363, 1.9249],
    ];
    for (const [geometry, biot, wantLambda, wantA1] of table) {
      const lambda = geometryEigenvalue(geometry, biot);
      expect(Math.abs(lambda - wantLambda)).toBeLessThan(5e-5);
      expect(Math.abs(geometryCoefficient(geometry, lambda) - wantA1)).toBeLessThan(5e-5);
    }
  });
});

describe("radiation", () => {
  it.each(GOLDEN.radiation)(
    "matches Rust for $sourceK K → $surfaceK K",
    ({ sourceK, surfaceK, emissivity, viewFactor, fluxKwM2, radiativeH: hRad }) => {
      // Multiplication is not associative in floating point, so the ORDER in
      // both implementations has to agree, not just the algebra.
      expect(radiantFluxKwM2(sourceK, surfaceK, emissivity, viewFactor)).toBe(fluxKwM2);
      expect(radiativeH(sourceK, surfaceK, emissivity)).toBe(hRad);
    },
  );
});

describe("contact mechanics", () => {
  it.each(GOLDEN.contact)("matches Rust for $material", ({ material, kWmK, rhoKgM3, cJkgK, effusivity, contactC }) => {
    const derived = deriveCookware({
      id: material,
      label: material,
      kWmK,
      rhoKgM3,
      cJkgK,
      typicalThicknessMm: 4,
      acidSafe: true,
      source: "golden-vector fixture",
      note: "",
    });
    expect(derived.effusivity).toBe(effusivity);
    expect(contactTemperatureC(230, 5, effusivity)).toBe(contactC);
  });
});

describe("wet bulb", () => {
  it.each(GOLDEN.wetBulb)(
    "matches Rust at $dryBulbC °C / $relativeHumidityPct %",
    ({ dryBulbC, relativeHumidityPct, wetBulbC: expected }) => {
      expect(wetBulbC(dryBulbC, relativeHumidityPct)).toBe(expected);
    },
  );

  it("declines outside the envelope in both runtimes", () => {
    expect(wetBulbC(175, 100)).toBeNull();
    expect(wetBulbC(-40, 50)).toBeNull();
  });
});

describe("external anchors", () => {
  // The part of this suite that is NOT circular: bands from published sources
  // outside this repository, asserted against freshly COMPUTED values rather
  // than read back from the fixture they judge. Regenerating the fixture
  // cannot launder a wrong constant past these.

  it("reproduces Denver's published boiling point", () => {
    const a = GOLDEN.externalAnchors.denverBoilingF;
    const computed = cToF(boilingPointCAtElevation(a.elevationM as number));
    expect(Math.abs(computed - (a.published as number))).toBeLessThanOrEqual(a.toleranceF as number);
  });

  it("reproduces sea-level boiling to the Celsius definition", () => {
    const a = GOLDEN.externalAnchors.seaLevelBoilingC;
    expect(Math.abs(boilingPointC(SEA_LEVEL_PRESSURE_KPA) - (a.published as number))).toBeLessThanOrEqual(
      a.toleranceC as number,
    );
  });

  it("lands inside Baldwin's published sous-vide window", () => {
    const a = GOLDEN.externalAnchors.baldwinSousVideMin;
    const { minutes } = slabCoreTime({
      thicknessMm: 25,
      mediumC: 55,
      initialC: 5,
      targetC: 54.5,
      hWm2K: 95,
    });
    expect(minutes).toBeGreaterThanOrEqual(a.low as number);
    expect(minutes).toBeLessThanOrEqual(a.high as number);
  });

  it("keeps the ISA exponent on its published value", () => {
    // The check that catches a CODATA gas constant substituted for the
    // ISA-defined one — the exact mistake this file's header documents.
    const a = GOLDEN.externalAnchors.isaExponent;
    const implied =
      Math.log(pressureFromElevation(5000) / SEA_LEVEL_PRESSURE_KPA) / Math.log(1 - (0.0065 / 288.15) * 5000);
    expect(Math.abs(implied - (a.published as number))).toBeLessThanOrEqual(a.tolerance as number);
  });

  it("keeps Stefan–Boltzmann exactly at the CODATA definition", () => {
    const a = GOLDEN.externalAnchors.stefanBoltzmann;
    expect(Math.abs(STEFAN_BOLTZMANN - (a.published as number))).toBeLessThanOrEqual(a.tolerance as number);
  });
});

describe("convection simulation", () => {
  it("shares the Rust simulation constants", () => {
    const s = GOLDEN.simulation;
    expect(BUOYANCY_PER_K).toBe(s.buoyancyPerK);
    expect(SWIRL_AMPLITUDE).toBe(s.swirlAmplitude);
    expect(CONVECTION_DRAG).toBe(s.drag);
    expect(FLOATS_PER_PARTICLE).toBe(s.floatsPerParticle);
  });

  it("replays the Rust golden trace", () => {
    // The fallback the browser silently switches to must BE the simulation it
    // replaced, not merely resemble it.
    const buffer = seedParticles(8);
    const expected = [...GOLDEN.simulation.trace].sort((a, b) => a.step - b.step);
    let cursor = 0;

    for (let step = 1; step <= 60; step += 1) {
      stepOvenSimulation(buffer, 1 / 60, 175, 25, 505);
      const row = expected[cursor];
      if (!row || row.step !== step) continue;
      const o = row.particle * FLOATS_PER_PARTICLE;
      expect(buffer[o]).toBe(row.x);
      expect(buffer[o + 1]).toBe(row.y);
      expect(buffer[o + 2]).toBe(row.z);
      expect(buffer[o + 3]).toBe(row.vx);
      expect(buffer[o + 4]).toBe(row.vy);
      expect(buffer[o + 5]).toBe(row.vz);
      expect(buffer[o + 6]).toBe(row.tempC);
      expect(buffer[o + 7]).toBe(row.radiantIntensity);
      cursor += 1;
    }

    expect(cursor).toBe(expected.length);
  });

  it("replays the Rust golden trace for every regime", () => {
    // The trace above pins ONE motion model. This pins the other nine.
    //
    // Without it the TypeScript fallback could carry a regime table that has
    // drifted from the Rust — a boil rendered with an oven's buoyancy, say —
    // and every existing assertion would still pass, because they all drive the
    // BuoyantAir path. That is the same shape as the defect this whole file was
    // written for: two runtimes wearing one name.
    const cases = GOLDEN.simulation.regimes as Array<{
      regime: number;
      name: string;
      method: string;
      mediumC: number;
      hWm2K: number;
      radiantSourceK: number;
      params: Record<string, number>;
      trace: Array<Record<string, number>>;
    }>;
    expect(cases).toHaveLength(Object.keys(HeatRegime).length);

    for (const c of cases) {
      // Parameters first: a retuned regime and a re-driven regime both move the
      // trajectory, and asserting both says which one happened.
      const p = regimeParams(c.regime as HeatRegime);
      expect(`${c.name} buoyancyPerK ${p.buoyancyPerK}`).toBe(
        `${c.name} buoyancyPerK ${c.params.buoyancyPerK}`,
      );
      expect(p.swirl).toBe(c.params.swirl);
      expect(p.drag).toBe(c.params.drag);
      expect(p.nucleationPerS).toBe(c.params.nucleationPerS);
      expect(p.nucleationDir).toBe(c.params.nucleationDir);
      expect(p.coolingSign).toBe(c.params.coolingSign);

      const buffer = seedParticles(8);
      const expected = [...c.trace].sort((a, b) => a.step - b.step);
      let cursor = 0;

      for (let step = 1; step <= 60; step += 1) {
        stepMediumSimulation(
          buffer,
          1 / 60,
          c.regime as HeatRegime,
          c.mediumC,
          c.hWm2K,
          c.radiantSourceK,
        );
        const row = expected[cursor];
        if (!row || row.step !== step) continue;
        const o = row.particle * FLOATS_PER_PARTICLE;
        expect(`${c.name} step ${step} x ${buffer[o]}`).toBe(`${c.name} step ${step} x ${row.x}`);
        expect(buffer[o + 1]).toBe(row.y);
        expect(buffer[o + 2]).toBe(row.z);
        expect(buffer[o + 3]).toBe(row.vx);
        expect(buffer[o + 4]).toBe(row.vy);
        expect(buffer[o + 5]).toBe(row.vz);
        expect(buffer[o + 6]).toBe(row.tempC);
        expect(buffer[o + 8]).toBe(row.phaseFrac);
        cursor += 1;
      }

      expect(`${c.name} rows reached`).toBe(`${c.name} rows reached`);
      expect(cursor).toBe(expected.length);
    }
  });
});

describe("method to regime mapping", () => {
  it("gives every method in the corpus a regime, with no silent default", () => {
    // ⚠️ The guard against the old behaviour returning by omission. A method
    // added without a matching `MediumKind` branch would previously have fallen
    // through to the dry-oven scene and looked plausible; here it fails.
    const ids = Object.keys(METHOD_PHYSICS);
    expect(ids.length).toBeGreaterThan(0);
    const valid = new Set<number>(Object.values(HeatRegime));
    for (const id of ids) {
      const regime = heatRegimeFor(METHOD_PHYSICS[id]);
      expect(`${id} -> ${regime}`).toBe(`${id} -> ${regime}`);
      expect(valid.has(regime)).toBe(true);
    }
  });

  it("separates the methods a single oven scene used to collapse together", () => {
    // Each pair rendered identically before regimes existed. The point is not
    // that the numbers differ — they always did — but that the MOTION does.
    const pairs: Array<[string, string]> = [
      ["boiling", "roasting"],
      ["steaming", "boiling"],
      ["cryo_cooking", "roasting"],
      ["sous_vide", "boiling"],
      ["grilling", "frying"],
      ["pickling", "roasting"],
    ];
    for (const [a, b] of pairs) {
      const ra = heatRegimeFor(METHOD_PHYSICS[a]);
      const rb = heatRegimeFor(METHOD_PHYSICS[b]);
      expect(`${a}/${b}: ${ra} vs ${rb}`).not.toBe(`${a}/${b}: ${ra} vs ${ra}`);
    }
  });

  it("takes the temperature story away from a method that has no heat flow", () => {
    // `pickling` carries no h, so `simulationInputs` hands the loop the roasting
    // default of 25. In Diffusion that number must drive nothing at all.
    const buffer = seedParticles(12);
    const before = Array.from(buffer);
    for (let i = 0; i < 300; i += 1) {
      stepMediumSimulation(buffer, 1 / 60, HeatRegime.Diffusion, 190, 3000, 505);
    }
    for (let i = 0; i < 12; i += 1) {
      const o = i * FLOATS_PER_PARTICLE;
      expect(buffer[o + 6]).toBe(before[o + 6]);
    }
  });
});
