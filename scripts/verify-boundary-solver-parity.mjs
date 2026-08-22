/**
 * Verify the TypeScript BOUNDARY-SOLVER DECODE against the TypeScript solver.
 *
 * ## What this covers that nothing else does
 *
 * `verify-thermo-wasm-parity.mjs` proves the compiled module agrees with the
 * golden vectors. `cookingBoundaryNetwork.test.ts` proves the TypeScript solver
 * agrees with them too. Neither touches the DECODE in
 * `src/lib/wasm/thermoEngine.ts` — the code that turns a flat f64 buffer back
 * into a `BoundaryNetworkResult`.
 *
 * That decode is where a whole class of silent wrongness lives: correct physics
 * read at the wrong offset is still a full panel of plausible numbers. It also
 * cannot be covered by jest, because the loader fetches `public/wasm` over HTTP
 * and jest has no browser to fetch with. So it is checked here, against the
 * OTHER engine rather than against a fixture — the strongest available control,
 * since the two were written from different sources.
 *
 * Usage: bun scripts/verify-boundary-solver-parity.mjs
 */
import { readFileSync, existsSync } from "fs";

const GENERATED = "public/wasm";
if (!existsSync(`${GENERATED}/thermo_wasm.js`)) {
  console.error(`error: ${GENERATED} not built. Run: bun run build:wasm`);
  process.exit(1);
}

const mod = await import(`../${GENERATED}/thermo_wasm.js`);
mod.initSync({ module: readFileSync(`${GENERATED}/thermo_wasm_bg.wasm`) });

const { solveBoundaryNetwork } = await import("../src/lib/cooking/boundaryNetwork.ts");

// The REAL decode, imported rather than re-implemented. A mirrored copy here
// would only prove the copy agrees with itself — the failure mode that already
// bit the link-id mirror inside the Rust crate.
const { decodeBoundaryBuffer } = await import("../src/lib/wasm/thermoEngine.ts");

const GEOM = { slab: 0, cylinder: 1, sphere: 2 };

function solveViaWasm(input) {
  const v = input.vessel;
  const f = input.food;
  const buf = mod.solve_boundary_network(
    input.sourceC, input.sinkC,
    !!v, v?.sourceToVesselHWm2K ?? 0, v?.areaM2 ?? 0, v?.kWmK ?? 0, v?.thicknessM ?? 0, v?.vesselToMediumHWm2K ?? 0,
    !!f, f?.mediumToFoodHWm2K ?? 0, f ? GEOM[f.geometry] : 0, f?.halfDimensionM ?? 0, f?.kWmK ?? 0, f?.areaM2 ?? 0,
  );
  const ids = mod.boundary_network_link_ids(!!v, !!f).split(",").filter(Boolean);
  return decodeBoundaryBuffer(
    buf,
    ids,
    mod.boundary_header_fields(),
    mod.boundary_link_fields(),
    input.sourceC,
  );
}

const POTATO = {
  mediumToFoodHWm2K: 15.0,
  geometry: "sphere",
  halfDimensionM: 0.025,
  kWmK: 0.55,
  areaM2: 4 * Math.PI * 0.025 * 0.025,
};
const POT = {
  sourceToVesselHWm2K: 60.0, areaM2: 0.05, kWmK: 15.0,
  thicknessM: 0.003, vesselToMediumHWm2K: 5000.0,
};

const CASES = [
  ["oven-rack", { sourceC: 200, sinkC: 20, food: POTATO }],
  ["boiling-pot", { sourceC: 250, sinkC: 20, vessel: POT, food: { ...POTATO, mediumToFoodHWm2K: 1500 } }],
  ["empty-pot", { sourceC: 250, sinkC: 100, vessel: POT }],
];

const MAX_REL = 1e-12;
const failures = [];
let checks = 0;

function cmp(what, a, b) {
  checks += 1;
  if (a === b) return;
  const rel = Math.abs(a - b) / Math.max(Math.abs(b), 1e-30);
  if (!(rel <= MAX_REL)) failures.push(`${what}: wasm ${a} vs ts ${b} (${rel.toExponential(2)} relative)`);
}

for (const [name, input] of CASES) {
  const w = solveViaWasm(input);
  const t = solveBoundaryNetwork(input);

  if (!w) { failures.push(`${name}: wasm refused a case the TypeScript solver answered`); continue; }

  cmp(`${name}.totalR`, w.totalResistanceKperW, t.totalResistanceKperW);
  cmp(`${name}.ua`, w.uaWperK, t.uaWperK);
  cmp(`${name}.heatFlowW`, w.heatFlowW, t.heatFlowW);
  if (t.foodBiot !== null) cmp(`${name}.foodBiot`, w.foodBiot, t.foodBiot);

  checks += 1;
  if (w.controlling?.id !== t.controlling.id) {
    failures.push(`${name}.controlling: wasm ${w.controlling?.id} vs ts ${t.controlling.id}`);
  }

  checks += 1;
  if (w.links.length !== t.links.length) {
    failures.push(`${name}: ${w.links.length} links vs ${t.links.length}`);
    continue;
  }

  t.links.forEach((tl, i) => {
    const wl = w.links[i];
    checks += 1;
    if (wl.id !== tl.id) failures.push(`${name}.links[${i}].id: ${wl.id} vs ${tl.id}`);
    checks += 1;
    if (wl.label !== tl.label) failures.push(`${name}.links[${i}].label: "${wl.label}" vs "${tl.label}"`);
    cmp(`${name}.${tl.id}.r`, wl.resistanceKperW, tl.resistanceKperW);
    cmp(`${name}.${tl.id}.area`, wl.areaM2, tl.areaM2);
    cmp(`${name}.${tl.id}.share`, wl.share, tl.share);
    cmp(`${name}.${tl.id}.dropK`, wl.dropK, tl.dropK);
    // null vs a number here means a conduction leg was read as convective.
    checks += 1;
    if ((wl.hWm2K === null) !== (tl.hWm2K === null)) {
      failures.push(`${name}.${tl.id}.hWm2K nullness: wasm ${wl.hWm2K} vs ts ${tl.hWm2K}`);
    }
  });
}

// The refusal must agree too: an unknown geometry is refused by the module.
checks += 1;
{
  const bad = mod.solve_boundary_network(200, 20, false, 0, 0, 0, 0, 0, true, 500, 9, 0.025, 0.55, 0.008);
  if (bad.length !== 1 || !Number.isNaN(bad[0])) {
    failures.push("unknown geometry: expected a length-1 NaN refusal");
  }
}

console.log(`  compared ${checks} values across ${CASES.length} chains (wasm decode vs TypeScript solver)`);
if (failures.length) {
  console.error(`\n  BOUNDARY SOLVER PARITY FAILED (${failures.length}):`);
  for (const f of failures) console.error(`    ✗ ${f}`);
  process.exit(1);
}
console.log("  ✓ the decoded WASM result is identical to the TypeScript solver's");
