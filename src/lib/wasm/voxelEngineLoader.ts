/**
 * Runtime-agnostic factory for the 3D voxel conduction engine.
 *
 * Resolves to the Rust engine compiled into `/wasm/thermo_wasm.js` when the
 * browser can load it, and to the TypeScript twin (`@/lib/cooking/voxelConduction`)
 * on ANY failure. It never throws for a load problem, and `runtime` always
 * names what actually ran — never a hopeful constant.
 *
 * ⚠️ DELIBERATELY NOT PART OF `thermoEngine.ts`. That module is on the eager
 * path of /kitchen-lab/physics, which is size-budgeted; the Butcher Shop is the
 * only caller of this engine, so it gets its own tiny loader. The probe below
 * duplicates `loadModule()` in thermoEngine.ts on purpose (same URL, same HEAD
 * probe, same `webpackIgnore` import) rather than exporting that private helper
 * and growing the physics page. The two share the browser's ES-module map, so
 * the module is fetched and instantiated once no matter which loader asks
 * first (wasm-bindgen's init is idempotent).
 *
 * In Jest / jsdom / Node it resolves to TypeScript without touching the
 * network: there is no `window` under Node, and jsdom's stub `fetch` rejects,
 * which the catch turns into the fallback.
 *
 * @file src/lib/wasm/voxelEngineLoader.ts
 */

import {
  createTsVoxelEngine,
  type VoxelEngineLike,
  type VoxelGridSpec,
  type VoxelRuntime,
} from "@/lib/cooking/voxelConduction";

/** Same artifact, same absolute URL as thermoEngine.ts (see the note there on why it is not an `@/` specifier). */
const WASM_MODULE_URL = "/wasm/thermo_wasm.js";

/** Structural shape of the wasm-bindgen `VoxelEngine` class (see crates/thermo-wasm/src/lib.rs). */
interface WasmVoxelEngine {
  set_faces(faces: Float64Array): void;
  stable_dt(): number;
  step(dtS: number, n: number): void;
  temps(): Float64Array;
  peaks(): Float64Array;
  reset_peaks(): void;
  min_temp_where(material: number): number;
  max_temp_where(material: number): number;
  energy_j(): number;
  temp_at(index: number): number;
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly cell_count: number;
  free(): void;
}

/**
 * Declared structurally, and `VoxelEngine` OPTIONAL: a browser may hold a
 * cached bundle that predates it, so it is feature-detected before use.
 */
interface VoxelWasmModule {
  default: (input?: unknown) => Promise<unknown>;
  VoxelEngine?: new (
    ...args: [number, number, number, number, number, number, Uint8Array, Float64Array, Float64Array, number]
  ) => WasmVoxelEngine;
}

export interface CreatedVoxelEngine {
  readonly engine: VoxelEngineLike;
  readonly runtime: VoxelRuntime;
}

/** Thin adapter: the WASM class behind the shared {@link VoxelEngineLike} surface. */
class WasmVoxelEngineAdapter implements VoxelEngineLike {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly cellCount: number;

  constructor(private readonly inner: WasmVoxelEngine) {
    [this.nx, this.ny, this.nz, this.cellCount] = [inner.nx, inner.ny, inner.nz, inner.cell_count];
  }

  setFaces(faces: ArrayLike<number>): void {
    this.inner.set_faces(Float64Array.from(faces));
  }
  stableDt(): number {
    return this.inner.stable_dt();
  }
  step(dtS: number, n: number): void {
    this.inner.step(dtS, n);
  }
  temps(): Float64Array {
    return this.inner.temps();
  }
  peaks(): Float64Array {
    return this.inner.peaks();
  }
  resetPeaks(): void {
    this.inner.reset_peaks();
  }
  minTempWhere(material: number): number {
    return this.inner.min_temp_where(material);
  }
  maxTempWhere(material: number): number {
    return this.inner.max_temp_where(material);
  }
  energyJ(): number {
    return this.inner.energy_j();
  }
  tempAt(index: number): number {
    return this.inner.temp_at(index);
  }
  free(): void {
    this.inner.free();
  }
}

let modulePromise: Promise<VoxelWasmModule | null> | null = null;

/** Load once per page; resolve null on any failure. Mirrors thermoEngine.ts `loadModule()`. */
function loadModule(): Promise<VoxelWasmModule | null> {
  if (typeof window === "undefined" || typeof WebAssembly === "undefined") return Promise.resolve(null);
  modulePromise ??= (async (): Promise<VoxelWasmModule | null> => {
    try {
      // Probe before importing: a 404 is quiet and conclusive, while a failed
      // dynamic import surfaces as an error toast in Next's dev overlay.
      const probe = await fetch(WASM_MODULE_URL, { method: "HEAD" });
      if (!probe.ok) return null;
      const mod = (await import(/* webpackIgnore: true */ WASM_MODULE_URL)) as VoxelWasmModule;
      if (typeof mod.default !== "function" || typeof mod.VoxelEngine !== "function") return null;
      await mod.default();
      return mod;
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

function typescriptEngine(spec: VoxelGridSpec): CreatedVoxelEngine {
  return { engine: createTsVoxelEngine(spec), runtime: "typescript" };
}

/**
 * Build the best available engine for `spec`.
 *
 * Never throws for a LOAD failure. An invalid `spec` is still an error: the
 * TypeScript constructor raises the same refusal the Rust one would, because
 * substituting a different grid would be inventing physics.
 */
export async function createVoxelEngine(spec: VoxelGridSpec): Promise<CreatedVoxelEngine> {
  const mod = await loadModule();
  const Ctor = mod?.VoxelEngine;
  if (!Ctor) return typescriptEngine(spec);
  try {
    const inner = new Ctor(
      spec.nx, spec.ny, spec.nz, spec.dxM, spec.dyM, spec.dzM,
      Uint8Array.from(spec.material), Float64Array.from(spec.k), Float64Array.from(spec.rhoC), spec.initialC,
    );
    return { engine: new WasmVoxelEngineAdapter(inner), runtime: "rust-wasm" };
  } catch {
    return typescriptEngine(spec);
  }
}
