/**
 * Composite vessel walls — the ply model shared by both runtimes.
 *
 * ⚠️ ITS OWN MODULE ON PURPOSE, and the reason is bundle shape rather than
 * tidiness. `src/lib/wasm/thermoEngine.ts` needs `wallPlies` on the WASM path,
 * but it imports `boundaryNetwork.ts` LAZILY so that a page which only ever
 * runs the compiled engine never pulls the TypeScript kernel into its bundle.
 * A static value import of `wallPlies` from there would have quietly undone
 * that. The alternative — a second copy of the resolution rule inside
 * thermoEngine — is the drift this repo spends most of its comments avoiding.
 *
 * Mirrors `WallLayer`, `MAX_WALL_LAYERS` and `VESSEL_LAYER_IDS` in
 * `crates/thermo-core/src/lib.rs`. Nothing here depends on anything else.
 *
 * @file src/lib/cooking/wallPlies.ts
 */

/** One isotropic ply of a composite vessel wall. */
export interface WallLayer {
  /** Human name, e.g. "aluminium core". Labels only — see `VESSEL_LAYER_IDS`. */
  name: string;
  thicknessM: number;
  kWmK: number;
}

/**
 * Deepest wall stack accepted, mirroring `MAX_WALL_LAYERS` in thermo-core.
 *
 * Five covers the deepest construction sold: stainless / aluminium / copper /
 * aluminium / stainless.
 */
export const MAX_WALL_LAYERS = 5;

/**
 * Link ids for the plies of a COMPOSITE wall.
 *
 * ⚠️ Positional, not the ply's name. Ids cross the wasm boundary as a
 * comma-joined `&'static str` list, so they cannot carry a name that
 * originated in this repo's TypeScript data. Rust owns the ordering; the
 * `label` field carries the material name for humans.
 */
export const VESSEL_LAYER_IDS: readonly string[] = [
  "vessel-layer-0",
  "vessel-layer-1",
  "vessel-layer-2",
  "vessel-layer-3",
  "vessel-layer-4",
];

/**
 * The plies of a wall, whichever form the caller supplied.
 *
 * Refuses both-or-neither rather than picking one. Silently preferring
 * `layers` would let a stale `kWmK` sit in the same object describing a
 * different pan, and silently preferring the pair would ignore a composite the
 * caller went to the trouble of specifying — both produce a plausible number
 * for the wrong vessel, which is the failure this whole module is built to
 * avoid.
 */
export function wallPlies(v: {
  kWmK?: number;
  thicknessM?: number;
  layers?: readonly WallLayer[];
}): readonly WallLayer[] {
  const hasPair = v.kWmK !== undefined || v.thicknessM !== undefined;
  const hasLayers = v.layers !== undefined;
  if (hasPair && hasLayers) {
    throw new RangeError(
      "vessel: supply either kWmK/thicknessM or layers, not both",
    );
  }
  if (hasLayers) {
    const layers = v.layers ?? [];
    if (layers.length === 0 || layers.length > MAX_WALL_LAYERS) {
      throw new RangeError(
        `vessel.layers must hold 1..=${MAX_WALL_LAYERS} plies, received ${layers.length}`,
      );
    }
    return layers;
  }
  if (v.kWmK === undefined || v.thicknessM === undefined) {
    throw new RangeError("vessel: kWmK and thicknessM must be supplied together");
  }
  return [{ name: "wall", thicknessM: v.thicknessM, kWmK: v.kWmK }];
}
