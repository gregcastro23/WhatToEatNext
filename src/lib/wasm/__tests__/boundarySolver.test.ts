/**
 * @jest-environment jsdom
 *
 * Unit tests for the boundary-solver bridge.
 *
 * ## What this covers, and what it deliberately does not
 *
 * `scripts/verify-boundary-solver-parity.mjs` A/Bs the decode against the
 * TypeScript solver using the REAL compiled module. It is the stronger check
 * and it is the one that catches a physics or offset regression. Since
 * 2026-08-22 `public/wasm` is committed, so it DOES run in CI — but it still
 * cannot exercise the paths where the module is absent or unusable.
 *
 * This file covers exactly what that script cannot:
 *   - the TypeScript fallback arm, which is what a fresh checkout actually runs
 *   - `solve()` returning a refusal, which none of the demo chains ever trigger
 *   - the decode's own guards, driven by hand-built buffers
 *
 * No WASM is loaded here. In this environment `loadModule` cannot fetch
 * `public/wasm`, so `createBoundarySolver` takes the fallback — which is the
 * point, not a limitation.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BOUNDARY_SCHEMA_VERSION,
  GEOMETRY_DISCRIMINANT,
  createBoundarySolver,
  decodeBoundaryBuffer,
} from "@/lib/wasm/thermoEngine";

/** The oven-rack chain from the golden fixture. Solvable, no vessel. */
const OVEN_RACK = {
  sourceC: 200,
  sinkC: 20,
  food: {
    mediumToFoodHWm2K: 15,
    geometry: "sphere" as const,
    halfDimensionM: 0.025,
    kWmK: 0.55,
    areaM2: 4 * Math.PI * 0.025 * 0.025,
  },
};

describe("createBoundarySolver — the fallback arm", () => {
  it("reports the TypeScript engine when the module cannot be loaded", async () => {
    // This is the arm a fresh checkout runs, and the one the live page never
    // showed because public/wasm is built on this machine. The badge in the UI
    // reads this field, so an engine label can only be honest if this is.
    const solver = await createBoundarySolver();
    expect(solver.engine).toBe("typescript");
  });

  it("still solves correctly on the fallback", async () => {
    const solver = await createBoundarySolver();
    const r = solver.solve(OVEN_RACK);

    expect(r).not.toBeNull();
    // Golden-fixture values for "oven-rack". Pinned loosely enough not to churn
    // on a last-bit difference, tightly enough that a wrong chain fails.
    expect(r!.totalResistanceKperW).toBeCloseTo(10.4174, 3);
    expect(r!.uaWperK).toBeCloseTo(0.09599, 5);
    expect(r!.heatFlowW).toBeCloseTo(17.2788, 3);
    expect(r!.foodBiot).toBeCloseTo(0.22727, 5);
    expect(r!.controlling.id).toBe("medium-to-food");
    expect(r!.links.map((l) => l.id)).toEqual(["medium-to-food", "food-interior"]);
  });

  it("never rejects, so a caller cannot be wedged on a loading state", async () => {
    // The factory performs a dynamic import, which is a real rejection path.
    // A rejection here is both an unhandled promise rejection AND a component
    // stuck on "Loading…" for the life of the page.
    await expect(createBoundarySolver()).resolves.toBeDefined();
  });
});

describe("solve() refusals", () => {
  it("returns null rather than a number for an impossible coefficient", async () => {
    // None of the three demo chains can produce this, which is why it had never
    // been observed. The kernel throws `RangeError: vessel.sourceToVesselHWm2K
    // must be a positive finite number, received -5`; the bridge normalises
    // that to null so both engines decline the same way.
    const solver = await createBoundarySolver();
    const refused = solver.solve({
      sourceC: 118,
      sinkC: 20,
      vessel: {
        sourceToVesselHWm2K: -5,
        areaM2: 0.03,
        kWmK: 16,
        thicknessM: 0.003,
        vesselToMediumHWm2K: 3000,
      },
    });

    expect(refused).toBeNull();
  });

  it("refuses without throwing, so a render cannot be taken down by one", async () => {
    const solver = await createBoundarySolver();
    expect(() =>
      solver.solve({ sourceC: 118, sinkC: 20, food: { ...OVEN_RACK.food, kWmK: -1 } }),
    ).not.toThrow();
  });
});

describe("decodeBoundaryBuffer", () => {
  const HEADER = 7;
  const STRIDE = 5;

  /** Build a well-formed two-link buffer. */
  function buffer({
    linkCount = 2,
    nodeCount = 3,
    controlling = 0,
    foodBiot = 0.227,
    h = [15, NaN] as number[],
  } = {}): Float64Array {
    const out = [10.4174, 0.09599, 17.2788, controlling, foodBiot, linkCount, nodeCount];
    for (let i = 0; i < linkCount; i += 1) {
      out.push(8.488 - i, 0.00785, h[i] ?? NaN, 0.8148 - i * 0.5, 146.67 - i * 100);
    }
    for (let i = 0; i < nodeCount; i += 1) out.push(200 - i * 50);
    return new Float64Array(out);
  }

  const IDS = ["medium-to-food", "food-interior"];

  it("decodes a well-formed buffer", () => {
    const r = decodeBoundaryBuffer(buffer(), IDS, HEADER, STRIDE, 200);
    expect(r).not.toBeNull();
    expect(r!.links).toHaveLength(2);
    expect(r!.controlling.id).toBe("medium-to-food");
    expect(r!.nodes[0]).toEqual({ id: "source", celsius: 200 });
    expect(r!.nodes[1].id).toBe("medium-to-food");
  });

  it("attaches the human label the TypeScript solver uses", () => {
    // The buffer carries no strings; if these drift, the two engines return
    // shapes that differ only in prose and nothing catches it at compile time.
    const r = decodeBoundaryBuffer(buffer(), IDS, HEADER, STRIDE, 200);
    expect(r!.links[0].label).toBe("medium → food surface");
    expect(r!.links[1].label).toBe("food surface → core");
  });

  it("turns a NaN coefficient into null, not into a number", () => {
    // NaN is how the core says "pure conduction leg, no coefficient". Leaking
    // it would render as "NaN" in the DOM, and `NaN > 0` is false, so a guard
    // written the obvious way silently takes the wrong branch.
    const r = decodeBoundaryBuffer(buffer(), IDS, HEADER, STRIDE, 200);
    expect(r!.links[0].hWm2K).toBe(15);
    expect(r!.links[1].hWm2K).toBeNull();
  });

  it("treats a length-1 buffer as a refusal", () => {
    expect(
      decodeBoundaryBuffer(new Float64Array([NaN]), [], HEADER, STRIDE, 200),
    ).toBeNull();
  });

  it("refuses a buffer whose length disagrees with its own header", () => {
    // A stale cached bundle with a different layout. Without this guard the
    // decode reads past the end, every missing field comes back undefined ->
    // NaN, and the panel renders a full set of plausible blanks instead of
    // falling back to an engine that works.
    const truncated = buffer().slice(0, HEADER + STRIDE);
    expect(decodeBoundaryBuffer(truncated, IDS, HEADER, STRIDE, 200)).toBeNull();
  });

  it("refuses when the id list disagrees with the link count", () => {
    expect(
      decodeBoundaryBuffer(buffer(), ["medium-to-food"], HEADER, STRIDE, 200),
    ).toBeNull();
  });

  it("refuses a controlling index that is not a link", () => {
    // Out of range means the header and the body disagree; picking links[0]
    // instead would silently name the wrong bottleneck, which is the single
    // number this whole panel exists to report.
    expect(
      decodeBoundaryBuffer(buffer({ controlling: 9 }), IDS, HEADER, STRIDE, 200),
    ).toBeNull();
  });

  it("carries an absent Biot through as null", () => {
    const r = decodeBoundaryBuffer(
      buffer({ foodBiot: NaN }),
      IDS,
      HEADER,
      STRIDE,
      200,
    );
    expect(r!.foodBiot).toBeNull();
  });
});

/**
 * The wire-format version is stated in two languages and must agree.
 *
 * Nothing else enforces it, and the runtime consequence of a mismatch is
 * SILENT: `createBoundarySolverInner` sees the disagreement and returns the
 * TypeScript solver. The panel keeps working, the numbers stay right, and the
 * compiled engine simply stops being used — with the badge honestly reporting
 * "TypeScript fallback" that nobody is reading. That is precisely how the WASM
 * module went unused in production for months before 2026-08-22, so it is worth
 * a test rather than a comment.
 *
 * Parsed out of the Rust source rather than read from the module: this suite
 * runs in jsdom, which cannot load the wasm at all.
 */
describe("boundary schema version", () => {
  const RUST = join(
    __dirname, "..", "..", "..", "..",
    "crates", "thermo-wasm", "src", "lib.rs",
  );

  /** The integer literal returned by `boundary_schema_version()`. */
  function rustSchemaVersion(): number {
    const src = readFileSync(RUST, "utf8");
    const fn = src.indexOf("pub fn boundary_schema_version()");
    if (fn === -1) {
      throw new Error("thermo-wasm: boundary_schema_version() is gone");
    }
    const close = src.indexOf("}", fn);
    const body = src.slice(fn, close);
    const literal = body.match(/\n\s*(\d+)\s*\n/);
    if (!literal) {
      throw new Error(
        "thermo-wasm: could not read the version literal — parser is broken",
      );
    }
    return Number(literal[1]);
  }

  it("reads a real literal out of the Rust source", () => {
    // Instrument check. Without it, a parser that always returned NaN would
    // make the assertion below fail for the wrong reason, and one that always
    // returned the TS constant would make it pass for the wrong reason.
    expect(Number.isInteger(rustSchemaVersion())).toBe(true);
    expect(rustSchemaVersion()).toBeGreaterThan(0);
  });

  it("matches the constant the decoder checks against", () => {
    expect(rustSchemaVersion()).toBe(BOUNDARY_SCHEMA_VERSION);
  });
});

/**
 * The geometry lookup, pinned where coverage can actually reach it.
 *
 * The refusal that uses it (`if (geometry === undefined) return null`) lives in
 * the WASM arm, which jsdom cannot load — mutation-testing confirmed that guard
 * survives deletion with every test still green. The dictionary is the half a
 * unit test can hold, so it is held here.
 */
describe("GEOMETRY_DISCRIMINANT", () => {
  it("maps the three real geometries", () => {
    expect(GEOMETRY_DISCRIMINANT.slab).toBe(0);
    expect(GEOMETRY_DISCRIMINANT.cylinder).toBe(1);
    expect(GEOMETRY_DISCRIMINANT.sphere).toBe(2);
  });

  it("returns undefined for an unmapped geometry", () => {
    expect(GEOMETRY_DISCRIMINANT.torus).toBeUndefined();
    expect(GEOMETRY_DISCRIMINANT[""]).toBeUndefined();
  });

  it.each(["constructor", "toString", "valueOf", "hasOwnProperty", "__proto__"])(
    "does not leak Object.prototype through %s",
    (key) => {
      // As a plain object literal every one of these returned something
      // non-undefined, so `geometry === undefined` passed them through and a
      // FUNCTION reached solve_boundary_network, where wasm-bindgen coerces it
      // to NaN. Null-prototype makes the refusal do its job in JS.
      expect(GEOMETRY_DISCRIMINANT[key]).toBeUndefined();
    },
  );

  it("has no prototype at all", () => {
    expect(Object.getPrototypeOf(GEOMETRY_DISCRIMINANT)).toBeNull();
  });
});
