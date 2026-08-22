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
import { resolve, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

// Anchor relative paths to the REPO ROOT, not the caller's cwd. These scripts
// are invoked from the build script (which cds to root) and from CI (which may
// not), and a path that silently means two different directories is how a
// verifier ends up proving something about a build nobody ships.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
// Which build to check. Defaults to the committed public/wasm, but CI points
// this at a snapshot taken BEFORE the rebuild, so the verification runs against
// the exact bytes in git rather than against freshly-produced ones. Verifying a
// rebuild proves the source is good and says nothing about what ships.
const GENERATED = resolve(REPO_ROOT, process.env.THERMO_WASM_DIR || "public/wasm");

if (!existsSync(`${GENERATED}/thermo_wasm.js`)) {
  console.error(`error: ${GENERATED} not built. Run: bun run build:wasm`);
  process.exit(1);
}

const golden = JSON.parse(readFileSync(FIXTURE, "utf8"));
const mod = await import(pathToFileURL(resolve(GENERATED, "thermo_wasm.js")).href);
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

// Latent heat. These vectors already existed in the fixture and were already
// asserted from host Rust and from TypeScript — but until these exports landed
// there was no way to check them in the wasm32 build, which is the only one the
// browser ever runs. A host-Rust pass does not prove the compiled artifact.
for (const r of golden.latentHeat.vaporisation) {
  check(
    `latentHeatVaporisation(${r.celsius} C)`,
    mod.latent_heat_vaporisation(r.celsius),
    r.jPerKg,
  );
}

check("waterFusionJkg", mod.water_fusion_j_kg(), golden.latentHeat.waterFusionJkg);

for (const r of golden.latentHeat.foods) {
  check(`foodFusionEnthalpy(${r.name})`, mod.food_fusion_enthalpy(r.water), r.fusionJkg);
  check(
    `foodVaporisationEnthalpy(${r.name})`,
    mod.food_vaporisation_enthalpy(r.water, r.celsius),
    r.vaporisationJkg,
  );
}

// Refusals must survive the boundary as NaN. A build that silently extrapolated
// the Fleagle fit past 100 C would agree with every vector above and still be
// wrong everywhere it matters, so the refusal is asserted explicitly.
for (const outside of [-5, 105]) {
  const got = mod.latent_heat_vaporisation(outside);
  checks += 1;
  if (!Number.isNaN(got)) {
    failures.push(
      `latentHeatVaporisation(${outside} C): expected NaN refusal, received ${got}`,
    );
  }
}

// An unknown food-geometry discriminant must refuse rather than default to a
// slab. Length is the discriminator; a length-1 buffer is the refusal.
{
  const refused = mod.solve_boundary_network(
    200, 20, false, 0, 0, 0, new Float64Array(0), true, 500, 9, 0.025, 0.55, 0.008,
  );
  checks += 1;
  if (refused.length !== 1 || !Number.isNaN(refused[0])) {
    failures.push(
      `solveBoundaryNetwork(bad geometry): expected a length-1 NaN refusal, received length ${refused.length}`,
    );
  }
}

// Buffer strides. If the module and the loader disagree about these, every
// field is read from the wrong index and the numbers are wrong without erroring.
for (const [name, got, expected] of [
  ["lid_balance_fields", mod.lid_balance_fields(), 5],
  ["boundary_link_fields", mod.boundary_link_fields(), 5],
  ["boundary_header_fields", mod.boundary_header_fields(), 7],
]) {
  checks += 1;
  if (got !== expected) {
    failures.push(`${name}: expected ${expected}, received ${got}`);
  }
}

// Boundary network, through the FLAT buffer the browser decodes.
//
// The fixture pins these three chains from host Rust; this drives the same
// inputs through the compiled module and decodes the buffer exactly the way
// src/lib/wasm/thermoEngine.ts does. That makes it a test of the DECODE as much
// as of the physics — a correct solve read at the wrong offsets is still wrong,
// and every field here would still be a plausible number.
{
  const HEADER = mod.boundary_header_fields();
  const STRIDE = mod.boundary_link_fields();
  const SPHERE = 2;
  const potato = { h: 15.0, geom: SPHERE, half: 0.025, k: 0.55, area: 4 * Math.PI * 0.025 * 0.025 };
  const pot = { srcH: 60.0, area: 0.05, k: 15.0, thick: 0.003, medH: 5000.0 };

  // v2 wire format: the wall crosses as a flat [thicknessM, kWmK] ply slice
  // rather than two scalars. The golden fixtures are all SINGLE-ply, which is
  // the point — they go on asserting the pre-composite numbers unchanged.
  const wall = new Float64Array([pot.thick, pot.k]);
  const none = new Float64Array(0);

  const cases = {
    "oven-rack": [200, 20, false, 0, 0, 0, none, true, potato.h, potato.geom, potato.half, potato.k, potato.area],
    "boiling-pot": [250, 20, true, pot.srcH, pot.area, pot.medH, wall, true, 1500.0, potato.geom, potato.half, potato.k, potato.area],
    "empty-pot": [250, 100, true, pot.srcH, pot.area, pot.medH, wall, false, 0, 0, 0, 0, 0],
  };

  for (const row of golden.boundaryNetwork.network) {
    const args = cases[row.case];
    if (!args) {
      failures.push(`network(${row.case}): no input mapping in the verifier`);
      continue;
    }
    const buf = mod.solve_boundary_network(...args);
    if (buf.length <= 1) {
      failures.push(`network(${row.case}): module refused a case the fixture solved`);
      continue;
    }

    check(`network(${row.case}).totalR`, buf[0], row.totalR);
    check(`network(${row.case}).ua`, buf[1], row.ua);
    check(`network(${row.case}).heatFlowW`, buf[2], row.heatFlowW);

    const linkCount = buf[5];
    const ids = mod.boundary_network_link_ids(args[2], args[8]).split(",").filter(Boolean);

    checks += 1;
    if (linkCount !== row.links.length || ids.length !== row.links.length) {
      failures.push(
        `network(${row.case}): expected ${row.links.length} links, buffer says ${linkCount} and ids say ${ids.length}`,
      );
      continue;
    }

    // The controlling link is an INDEX in the buffer and an ID in the fixture.
    // Resolving one through the other is the only thing that proves the index
    // means what the decoder assumes it means.
    checks += 1;
    if (ids[buf[3]] !== row.controlling) {
      failures.push(
        `network(${row.case}).controlling: buffer index ${buf[3]} resolves to ${ids[buf[3]]}, fixture says ${row.controlling}`,
      );
    }

    if (row.foodBiot !== null) check(`network(${row.case}).foodBiot`, buf[4], row.foodBiot);

    row.links.forEach((link, i) => {
      const o = HEADER + i * STRIDE;
      checks += 1;
      if (ids[i] !== link.id) {
        failures.push(`network(${row.case}).links[${i}].id: ${ids[i]} vs ${link.id}`);
      }
      check(`network(${row.case}).${link.id}.r`, buf[o + 0], link.r);
      check(`network(${row.case}).${link.id}.share`, buf[o + 3], link.share);
      check(`network(${row.case}).${link.id}.dropK`, buf[o + 4], link.dropK);
    });
  }
}

// Lid heat balance, likewise decoded from its flat buffer.
for (const row of golden.boundaryNetwork.lid) {
  const buf = mod.lid_heat_balance(
    row.areaM2, row.perimeterM, row.thicknessM, row.kWmK,
    100, row.ambientC, 2257e3, 0.9,
  );
  if (buf.length !== 5) {
    failures.push(`lid(${row.case}): module refused a case the fixture solved`);
    continue;
  }
  check(`lid(${row.case}).lidC`, buf[0], row.lidC);
  check(`lid(${row.case}).convW`, buf[1], row.convW);
  check(`lid(${row.case}).radW`, buf[2], row.radW);
  check(`lid(${row.case}).totalW`, buf[3], row.totalW);
  check(`lid(${row.case}).condKgS`, buf[4], row.condKgS);
}

// The simulation, driven through the real engine and read out of linear memory
// — which also exercises the buffer layout the canvas depends on.
const floatsPerParticle = mod.floats_per_particle();
if (floatsPerParticle !== golden.simulation.floatsPerParticle) {
  failures.push(
    `buffer stride: module says ${floatsPerParticle}, fixture says ${golden.simulation.floatsPerParticle}`,
  );
}

// `HeatRegime::BuoyantAir`. The discriminant is the wire format and is pinned
// by the fixture's `regimes` block, so it is spelled out rather than imported.
const BUOYANT_AIR = 0;

const engine = new mod.ThermoEngine(8);
const trace = [...golden.simulation.trace].sort((a, b) => a.step - b.step);
let cursor = 0;
for (let step = 1; step <= 60; step += 1) {
  // `step` RETURNS FALSE for a regime the module does not recognise, and a
  // silently ignored frame reads downstream as "every velocity is zero" — which
  // is exactly how this check failed when the signature gained its regime
  // argument and this line had not caught up. Assert the return.
  if (!engine.step(1 / 60, BUOYANT_AIR, 175, 25, 505)) {
    failures.push(`simulation step ${step}: module refused regime ${BUOYANT_AIR}`);
    break;
  }
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

// Every OTHER regime, through the compiled module. The block above only ever
// drives BuoyantAir, so without this the WASM engine could disagree with the
// Rust about all nine remaining regimes and this verifier would still pass.
for (const c of golden.simulation.regimes) {
  const e = new mod.ThermoEngine(8);
  const rows = [...c.trace].sort((a, b) => a.step - b.step);
  let seen = 0;
  for (let step = 1; step <= 60; step += 1) {
    if (!e.step(1 / 60, c.regime, c.mediumC, c.hWm2K, c.radiantSourceK)) {
      failures.push(`${c.name} step ${step}: module refused regime ${c.regime}`);
      break;
    }
    const row = rows[seen];
    if (!row || row.step !== step) continue;
    const particles = new Float32Array(wasm.memory.buffer, e.buffer_ptr, e.buffer_len);
    const o = row.particle * floatsPerParticle;
    for (const [key, index] of [
      ["x", 0],
      ["y", 1],
      ["z", 2],
      ["vx", 3],
      ["vy", 4],
      ["vz", 5],
      ["tempC", 6],
      ["phaseFrac", 8],
    ]) {
      check(`${c.name} step ${step} ${key}`, particles[o + index], row[key]);
    }
    seen += 1;
  }
  if (seen !== rows.length) {
    failures.push(`${c.name}: reached ${seen} of ${rows.length} rows`);
  }
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
