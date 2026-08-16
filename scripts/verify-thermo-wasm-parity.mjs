/**
 * Verify the COMPILED WebAssembly module against the shared golden vectors.
 *
 * Run automatically by `scripts/build-thermo-wasm.sh` — the artifact is checked
 * before anyone gets to use it.
 *
 * ## Why this exists on top of the two test suites
 *
 * The physics is written once, in `crates/thermo-core`, but it reaches users as
 * THREE separately compiled executables:
 *
 *   1. host Rust        — `cargo test -p thermo-core` (tests/golden.rs)
 *   2. TypeScript / V8  — `cookingThermoCrossRuntimeParity.test.ts`
 *   3. wasm32 Rust      — this file
 *
 * The third is not covered by either suite. It is the same source, but it is
 * built for a different target, at `opt-level = "s"` with LTO, and its `sin`,
 * `tan`, `pow` and `log` come from Rust's wasm libm rather than the host's. A
 * green `cargo test` on aarch64 says nothing about what the browser will
 * compute, and the browser is the one users see.
 *
 * `[MEASURED 2026-08-16]` All three agree to within 4 ULP (8.9e-16 relative),
 * and every disagreement sits in the one place expected: the `Math.tan`
 * bisection in `slabEigenvalue` and the values derived from it. Boiling point,
 * ISA pressure, radiant flux, contact temperature and the full simulation trace
 * are bit-identical across all three.
 *
 * Usage: node scripts/verify-thermo-wasm-parity.mjs
 */
import { readFileSync, existsSync } from "fs";

/**
 * Budget in units in the last place.
 *
 * ⚠️ A MEASUREMENT, NOT A COMFORT MARGIN. 2× the worst observed across all
 * three runtimes. Do not raise it to make a failure go away — re-measure and
 * find out what moved. A genuinely wrong constant lands at 1e-7 relative or
 * worse, which is eight orders of magnitude outside this window.
 */
const MAX_ULP = 8;

const FIXTURE = "crates/thermo-core/tests/thermo_golden_vectors.json";
const GENERATED = "public/wasm";

if (!existsSync(`${GENERATED}/thermo_wasm.js`)) {
  console.error(`error: ${GENERATED} not built. Run: bun run build:wasm`);
  process.exit(1);
}

const golden = JSON.parse(readFileSync(FIXTURE, "utf8"));
const mod = await import(`../${GENERATED}/thermo_wasm.js`);
const wasm = mod.initSync({ module: readFileSync(`${GENERATED}/thermo_wasm_bg.wasm`) });

const view = new DataView(new ArrayBuffer(8));
function ordinal(x) {
  view.setFloat64(0, x);
  const raw = view.getBigUint64(0);
  const sign = 1n << 63n;
  return raw & sign ? sign - (raw & ~sign) : raw;
}
function ulpDistance(a, b) {
  if (Object.is(a, b)) return 0;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.POSITIVE_INFINITY;
  const d = ordinal(a) - ordinal(b);
  return Number(d < 0n ? -d : d);
}

const failures = [];
let worst = 0;
let worstWhat = "(exact everywhere)";
let checks = 0;

function check(what, got, expected) {
  checks += 1;
  if (typeof got !== "number" || !Number.isFinite(got)) {
    failures.push(`${what}: module returned ${got}, not a finite number`);
    return;
  }
  const distance = ulpDistance(got, expected);
  if (distance > worst) {
    worst = distance;
    worstWhat = `${what} (${got} vs ${expected})`;
  }
  if (distance > MAX_ULP) {
    const rel = Math.abs(got - expected) / Math.abs(expected);
    failures.push(`${what}: ${got} vs ${expected} — ${distance} ULP (${rel.toExponential(3)} relative)`);
  }
}

for (const r of golden.boilingPoint) {
  check(`boilingPointC(${r.pressureKpa})`, mod.boiling_point_c(r.pressureKpa), r.celsius);
}

for (const r of golden.elevation) {
  check(`pressureFromElevation(${r.elevationM})`, mod.pressure_from_elevation(r.elevationM), r.pressureKpa);
  check(`boilingPointAtElevation(${r.elevationM})`, mod.boiling_point_at_elevation(r.elevationM), r.boilingC);
  check(`altitude softening @${r.elevationM}`, mod.altitude_time_multiplier(r.elevationM, false), r.softeningMultiplier);
  check(
    `altitude pasteurisation @${r.elevationM}`,
    mod.altitude_time_multiplier(r.elevationM, true),
    r.pasteurisationMultiplier,
  );
}

for (const r of golden.slabCookTime) {
  check(
    `slabCoreTime(${r.name})`,
    mod.slab_core_time_minutes(r.thicknessMm, r.mediumC, r.initialC, r.targetC, r.hWm2K, 0.45, 1.3e-7, r.oneSided),
    r.minutes,
  );
}

for (const r of golden.radiation) {
  check(
    `radiantFlux(${r.sourceK} K)`,
    mod.radiant_flux_kw_m2(r.sourceK, r.surfaceK, r.emissivity, r.viewFactor),
    r.fluxKwM2,
  );
}

for (const r of golden.contact) {
  check(
    `contactTemperature(${r.material})`,
    mod.contact_temperature_c(230, 5, r.effusivity, golden.constants.FOOD_EFFUSIVITY_LEAN_MEAT),
    r.contactC,
  );
}

// The simulation, driven through the real engine and read out of linear memory
// — which also exercises the buffer layout the canvas depends on.
const floatsPerParticle = mod.floats_per_particle();
if (floatsPerParticle !== golden.simulation.floatsPerParticle) {
  failures.push(
    `buffer stride: module says ${floatsPerParticle}, fixture says ${golden.simulation.floatsPerParticle}`,
  );
}

const engine = new mod.ThermoEngine(8);
const trace = [...golden.simulation.trace].sort((a, b) => a.step - b.step);
let cursor = 0;
for (let step = 1; step <= 60; step += 1) {
  engine.step(1 / 60, 175, 25, 505);
  const row = trace[cursor];
  if (!row || row.step !== step) continue;
  // Rebuilt every read: growing linear memory detaches existing views.
  const particles = new Float32Array(wasm.memory.buffer, engine.buffer_ptr, engine.buffer_len);
  const o = row.particle * floatsPerParticle;
  for (const [key, index] of [
    ["x", 0],
    ["y", 1],
    ["z", 2],
    ["vx", 3],
    ["vy", 4],
    ["vz", 5],
    ["tempC", 6],
    ["radiantIntensity", 7],
  ]) {
    check(`simulation step ${step} ${key}`, particles[o + index], row[key]);
  }
  cursor += 1;
}
if (cursor !== trace.length) {
  failures.push(`simulation trace: reached ${cursor} of ${trace.length} rows`);
}

console.log(`  checked ${checks} values against ${FIXTURE}`);
console.log(`  worst divergence: ${worst} ULP — ${worstWhat}`);
console.log(`  budget: ${MAX_ULP} ULP`);

if (failures.length > 0) {
  console.error(`\n  WASM PARITY FAILED (${failures.length}):`);
  for (const f of failures) console.error(`    ✗ ${f}`);
  process.exit(1);
}
console.log("  ✓ compiled WebAssembly agrees with the shared golden vectors");
