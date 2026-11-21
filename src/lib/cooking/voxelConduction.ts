/**
 * 3D transient conduction on a uniform cell-centred grid — the "voxel engine".
 *
 * The TypeScript twin of `crates/thermo-core/src/voxel.rs`. The two are kept
 * honest only by `crates/thermo-core/tests/voxel_golden_vectors.json`, which
 * `src/__tests__/voxelConductionCrossRuntimeParity.test.ts` asserts with `===`
 * on every value. See the Rust module header for the formulation; in short:
 *
 *  - cells `c = i + nx·(j + ny·k)`, x = width, y = thickness, z = length;
 *  - interior `G = A / (d·0.5/k_a + d·0.5/k_b)`; domain face
 *    `G = A / (1/h + d·0.5/k)`, `h === 0` adiabatic (`G = 0`);
 *  - forward Euler `T' = T + (dt/C)·Σ G(T_n − T)`, neighbours from the
 *    pre-step array, accumulated x−, x+, y−, y+, z−, z+;
 *  - `stableDt = min C/ΣG`, the caller applies a safety factor ≤ 0.9.
 *
 * ⚠️ BIT-EXACTNESS: every expression below is written in the same operation
 * order as the Rust, with only + − × ÷ and comparisons. Reordering a sum —
 * even one that is algebraically identical — breaks the golden vectors.
 *
 * @file src/lib/cooking/voxelConduction.ts
 */

/** BASIS: 2¹⁶ cells — the same memory bound as `VOXEL_MAX_CELLS` in voxel.rs. */
export const VOXEL_MAX_CELLS = 65_536;
export const VOXEL_FACE_COUNT = 6;
/** `[h W/m²K, medium °C] × 6`, face order x−, x+, y−, y+, z−, z+. */
export const VOXEL_FACE_FLOATS = 12;

export type VoxelRuntime = "rust-wasm" | "typescript";

export interface VoxelGridSpec {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly dxM: number;
  readonly dyM: number;
  readonly dzM: number;
  /** One material index per cell into `k` / `rhoC`. */
  readonly material: ArrayLike<number>;
  /** W/m·K per material. */
  readonly k: ArrayLike<number>;
  /** Volumetric heat capacity ρ·cp, J/m³·K per material. */
  readonly rhoC: ArrayLike<number>;
  readonly initialC: number;
}

/** The runtime-agnostic surface: implemented by {@link TsVoxelEngine} and by the WASM wrapper in voxelEngineLoader.ts. */
export interface VoxelEngineLike {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly cellCount: number;
  setFaces(faces: ArrayLike<number>): void;
  stableDt(): number;
  step(dtS: number, n: number): void;
  temps(): Float64Array;
  peaks(): Float64Array;
  resetPeaks(): void;
  minTempWhere(material: number): number;
  maxTempWhere(material: number): number;
  energyJ(): number;
  tempAt(index: number): number;
  free(): void;
}

/** Refusal messages, verbatim from `VoxelError::message` in voxel.rs. */
export const VOXEL_ERRORS = {
  emptyGrid: "voxel grid dimensions must be at least 1",
  tooManyCells: "voxel grid exceeds 65536 cells",
  spacing: "voxel spacing must be finite and positive",
  shape: "voxel material/property arrays have the wrong length",
  unknownMaterial: "voxel cell names an unknown material",
  property: "voxel k and rhoC must be finite and positive",
  temperature: "voxel temperature must be finite",
  faces: "voxel faces need 12 finite floats with h >= 0",
  timeStep: "voxel dt must be finite and positive",
} as const;

function finitePositive(x: number): boolean {
  return Number.isFinite(x) && x > 0;
}

function interiorG(area: number, d: number, kA: number, kB: number): number {
  return area / ((d * 0.5) / kA + (d * 0.5) / kB);
}

function boundaryG(area: number, d: number, h: number, k: number): number {
  return h === 0 ? 0 : area / (1 / h + (d * 0.5) / k);
}

function validateSpec(spec: VoxelGridSpec): number {
  const { nx, ny, nz, dxM, dyM, dzM, material, k, rhoC, initialC } = spec;
  if (![nx, ny, nz].every((n) => Number.isInteger(n) && n >= 1)) throw new RangeError(VOXEL_ERRORS.emptyGrid);
  const n = nx * ny * nz;
  if (n > VOXEL_MAX_CELLS) throw new RangeError(VOXEL_ERRORS.tooManyCells);
  if (![dxM, dyM, dzM].every(finitePositive)) throw new RangeError(VOXEL_ERRORS.spacing);
  if (material.length !== n || k.length === 0 || k.length !== rhoC.length || k.length > 256) {
    throw new RangeError(VOXEL_ERRORS.shape);
  }
  if (![...Array.from(k), ...Array.from(rhoC)].every(finitePositive)) throw new RangeError(VOXEL_ERRORS.property);
  if (Array.from(material).some((m) => !(m >= 0 && m < k.length))) throw new RangeError(VOXEL_ERRORS.unknownMaterial);
  if (!Number.isFinite(initialC)) throw new RangeError(VOXEL_ERRORS.temperature);
  return n;
}

type FaceArrays = readonly [Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array];

/** The TypeScript engine. Mirrors `VoxelGrid` in voxel.rs line for line. */
/** Kernel read: indices are always in range, so `?? 0` never fires — it types the index, the bits are unchanged. */
function at(a: ArrayLike<number>, i: number): number {
  return a[i] ?? 0;
}

export class TsVoxelEngine implements VoxelEngineLike {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly cellCount: number;
  private readonly dx: number;
  private readonly dy: number;
  private readonly dz: number;
  private readonly material: Uint8Array;
  private readonly kCell: Float64Array;
  private readonly cap: Float64Array;
  private readonly g: FaceArrays;
  private readonly medium = new Float64Array(VOXEL_FACE_COUNT);
  private readonly factor: Float64Array;
  private factorDt = Number.NaN;
  private cur: Float64Array;
  private nxt: Float64Array;
  private readonly peak: Float64Array;

  constructor(spec: VoxelGridSpec) {
    const n = validateSpec(spec);
    const { nx, ny, nz, dxM, dyM, dzM, k, rhoC, initialC } = spec;
    [this.nx, this.ny, this.nz, this.cellCount] = [nx, ny, nz, n];
    [this.dx, this.dy, this.dz] = [dxM, dyM, dzM];
    this.material = Uint8Array.from(spec.material);
    this.kCell = new Float64Array(n);
    this.cap = new Float64Array(n);
    for (let c = 0; c < n; c += 1) {
      const m = this.material[c] ?? 0;
      this.kCell[c] = k[m] ?? Number.NaN;
      this.cap[c] = (rhoC[m] ?? Number.NaN) * dxM * dyM * dzM;
    }
    const z = (): Float64Array => new Float64Array(n);
    this.g = [z(), z(), z(), z(), z(), z()];
    this.factor = z();
    this.cur = z().fill(initialC);
    this.nxt = z();
    this.peak = Float64Array.from(this.cur);
    this.buildInterior();
  }

  private buildInterior(): void {
    const { nx, ny, nz, dx, dy, dz, kCell: kc, g } = this;
    const [ax, ay, az, sz] = [dy * dz, dx * dz, dx * dy, nx * ny];
    for (let k = 0; k < nz; k += 1) {
      for (let j = 0; j < ny; j += 1) {
        for (let i = 0; i < nx; i += 1) {
          const c = i + nx * (j + ny * k);
          if (i + 1 < nx) g[0][c + 1] = g[1][c] = interiorG(ax, dx, at(kc, c), at(kc, c + 1));
          if (j + 1 < ny) g[2][c + nx] = g[3][c] = interiorG(ay, dy, at(kc, c), at(kc, c + nx));
          if (k + 1 < nz) g[4][c + sz] = g[5][c] = interiorG(az, dz, at(kc, c), at(kc, c + sz));
        }
      }
    }
  }

  setFaces(faces: ArrayLike<number>): void {
    if (faces.length !== VOXEL_FACE_FLOATS) throw new RangeError(VOXEL_ERRORS.faces);
    const f = Array.from(faces);
    for (let face = 0; face < VOXEL_FACE_COUNT; face += 1) {
      const h = f[2 * face] ?? Number.NaN;
      if (!Number.isFinite(h) || h < 0) throw new RangeError(VOXEL_ERRORS.faces);
      if (!Number.isFinite(f[2 * face + 1])) throw new RangeError(VOXEL_ERRORS.temperature);
    }
    const hAt = (face: number): number => f[2 * face] ?? 0; // validated above; `?? 0` only types the index
    const [h0, h1, h2, h3, h4, h5] = [hAt(0), hAt(1), hAt(2), hAt(3), hAt(4), hAt(5)];
    const { nx, ny, nz, dx, dy, dz, kCell, g } = this;
    const [ax, ay, az] = [dy * dz, dx * dz, dx * dy];
    for (let k = 0; k < nz; k += 1) {
      for (let j = 0; j < ny; j += 1) {
        for (let i = 0; i < nx; i += 1) {
          const c = i + nx * (j + ny * k);
          const kc = at(kCell, c);
          if (i === 0) g[0][c] = boundaryG(ax, dx, h0, kc);
          if (i + 1 === nx) g[1][c] = boundaryG(ax, dx, h1, kc);
          if (j === 0) g[2][c] = boundaryG(ay, dy, h2, kc);
          if (j + 1 === ny) g[3][c] = boundaryG(ay, dy, h3, kc);
          if (k === 0) g[4][c] = boundaryG(az, dz, h4, kc);
          if (k + 1 === nz) g[5][c] = boundaryG(az, dz, h5, kc);
        }
      }
    }
    for (let face = 0; face < VOXEL_FACE_COUNT; face += 1) this.medium[face] = at(f, 2 * face + 1);
  }

  stableDt(): number {
    const [g0, g1, g2, g3, g4, g5] = this.g;
    let best = Number.POSITIVE_INFINITY;
    for (let c = 0; c < this.cellCount; c += 1) {
      const s = at(g0, c) + at(g1, c) + at(g2, c) + at(g3, c) + at(g4, c) + at(g5, c);
      if (s > 0) {
        const r = at(this.cap, c) / s;
        if (r < best) best = r;
      }
    }
    return best;
  }

  step(dtS: number, n: number): void {
    if (!finitePositive(dtS)) throw new RangeError(VOXEL_ERRORS.timeStep);
    if (dtS !== this.factorDt) {
      for (let c = 0; c < this.cellCount; c += 1) this.factor[c] = dtS / at(this.cap, c);
      this.factorDt = dtS;
    }
    for (let s = 0; s < n; s += 1) this.stepOnce();
  }

  private stepOnce(): void {
    const { nx, ny, nz, cur, nxt, peak, factor } = this;
    const [g0, g1, g2, g3, g4, g5] = this.g;
    const { medium } = this;
    const [m0, m1, m2, m3, m4, m5] = [at(medium, 0), at(medium, 1), at(medium, 2), at(medium, 3), at(medium, 4), at(medium, 5)];
    const sz = nx * ny;
    for (let k = 0; k < nz; k += 1) {
      for (let j = 0; j < ny; j += 1) {
        for (let i = 0; i < nx; i += 1) {
          const c = i + nx * (j + ny * k);
          const t = at(cur, c);
          let s = 0;
          s += at(g0, c) * ((i > 0 ? at(cur, c - 1) : m0) - t);
          s += at(g1, c) * ((i + 1 < nx ? at(cur, c + 1) : m1) - t);
          s += at(g2, c) * ((j > 0 ? at(cur, c - nx) : m2) - t);
          s += at(g3, c) * ((j + 1 < ny ? at(cur, c + nx) : m3) - t);
          s += at(g4, c) * ((k > 0 ? at(cur, c - sz) : m4) - t);
          s += at(g5, c) * ((k + 1 < nz ? at(cur, c + sz) : m5) - t);
          const v = t + at(factor, c) * s;
          nxt[c] = v;
          if (v > at(peak, c)) peak[c] = v;
        }
      }
    }
    this.cur = nxt;
    this.nxt = cur;
  }

  temps(): Float64Array {
    return Float64Array.from(this.cur);
  }

  peaks(): Float64Array {
    return Float64Array.from(this.peak);
  }

  resetPeaks(): void {
    this.peak.set(this.cur);
  }

  private extremeWhere(material: number, wantMin: boolean): number {
    let found = false;
    let best = 0;
    for (let c = 0; c < this.cellCount; c += 1) {
      if (this.material[c] !== material) continue;
      const t = at(this.cur, c);
      if (!found || (wantMin && t < best) || (!wantMin && t > best)) {
        best = t;
        found = true;
      }
    }
    return found ? best : Number.NaN;
  }

  minTempWhere(material: number): number {
    return this.extremeWhere(material, true);
  }

  maxTempWhere(material: number): number {
    return this.extremeWhere(material, false);
  }

  energyJ(): number {
    let e = 0;
    for (let c = 0; c < this.cellCount; c += 1) e += at(this.cap, c) * at(this.cur, c);
    return e;
  }

  tempAt(index: number): number {
    return Number.isInteger(index) && index >= 0 && index < this.cellCount ? at(this.cur, index) : Number.NaN;
  }

  free(): void {
    // Garbage-collected; present so callers can treat both runtimes alike.
  }
}

export function createTsVoxelEngine(spec: VoxelGridSpec): VoxelEngineLike {
  return new TsVoxelEngine(spec);
}
