/* tslint:disable */
/* eslint-disable */

/**
 * Stateful oven-convection simulation with a JS-readable particle buffer.
 */
export class ThermoEngine {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Create an engine with `count` deterministically-seeded particles.
     *
     * Deterministic on purpose: the seed is a closed-form function of the
     * index, with no RNG anywhere. That is what lets the TypeScript fallback
     * and this module be compared step for step — a random seed would make
     * any such comparison meaningless.
     */
    constructor(count: number);
    /**
     * Re-seed with a different particle count. Invalidates any existing view.
     */
    resize(count: number): void;
    /**
     * Advance the simulation by `dt_s` seconds and refresh the shared buffer.
     *
     * `dt_s` is clamped to 50 ms. A backgrounded tab hands back a delta of
     * whole seconds when it wakes, and integrating that in one step throws
     * every particle out of the render box at once — the visible symptom is a
     * canvas that appears to reset itself whenever the user returns to it.
     *
     * `regime` is the [`HeatRegime`] discriminant. An unrecognised value is
     * REFUSED rather than defaulted: a caller and a module that disagree about
     * the regime table would otherwise render a boil as an oven and report
     * nothing, which is the exact class of silent substitution this engine's
     * engine-kind label already had to be fixed for once.
     */
    step(dt_s: number, regime: number, medium_temp_c: number, h_w_m2_k: number, radiant_source_k: number): boolean;
    /**
     * Length of the particle buffer, in f32 elements.
     */
    readonly buffer_len: number;
    /**
     * Pointer to the particle buffer in WASM linear memory.
     *
     * Valid until the next `new`/`resize`. See the memory contract above.
     */
    readonly buffer_ptr: number;
    /**
     * Number of particles currently simulated.
     */
    readonly particle_count: number;
}

/**
 * Altitude time multiplier. `pasteurisation = false` selects the softening
 * (van 't Hoff) regime; the two differ by more than 6× at Denver.
 */
export function altitude_time_multiplier(elevation_m: number, pasteurisation: boolean): number;

/**
 * Biot number for a slab.
 */
export function biot_number(h_w_m2_k: number, half_thickness_m: number, k_w_m_k: number): number;

/**
 * Water boiling point at elevation under ISA-1976, °C.
 */
export function boiling_point_at_elevation(elevation_m: number): number;

/**
 * Water boiling point at a given absolute station pressure, °C.
 */
export function boiling_point_c(pressure_kpa: number): number;

/**
 * Header length of the boundary-network buffer.
 */
export function boundary_header_fields(): number;

/**
 * Per-link stride of the boundary-network buffer.
 */
export function boundary_link_fields(): number;

/**
 * Link IDs for a chain with the given legs, comma-separated in buffer order.
 *
 * Kept as a separate call because the IDs are a pure function of which legs
 * are present — they do not depend on any of the numeric inputs — so a UI can
 * fetch them once and reuse them across every re-solve while dragging a slider.
 * Returns an empty string for an unsolvable combination.
 */
export function boundary_network_link_ids(has_vessel: boolean, has_food: boolean): string;

/**
 * Layout version of the boundary-network wire format.
 *
 * ⚠️ BUMP THIS ON ANY CHANGE TO THE BUFFER'S MEANING — a reordered header
 * slot, a repurposed link field, a changed unit — not merely when the field
 * COUNT changes.
 *
 * The count is already guarded: the loader reads `boundary_link_fields` and
 * `boundary_header_fields` and refuses a module that disagrees. That check is
 * blind to the case where the layout changes but the arithmetic does not, e.g.
 * swapping `share` and `dropK` inside the same five slots. Both engines would
 * still return five floats per link and every value would parse; the panel
 * would show a plausible, wrong picture, which is the failure this whole
 * pipeline exists to prevent.
 *
 * This became reachable when public/wasm/ started being committed (2026-08-22).
 * The .wasm is served from a stable, unhashed URL, so a returning browser can
 * hold a CACHED older module while running freshly deployed app JS. Revalidation
 * makes that window small — `next.config.js` sets max-age=0, must-revalidate —
 * but small is not zero, and an offline or proxied client can widen it.
 */
export function boundary_schema_version(): number;

/**
 * Pan/food contact interface temperature, °C.
 */
export function contact_temperature_c(pan_c: number, food_c: number, pan_effusivity: number, food_effusivity: number): number;

/**
 * Floats per particle, exported so the JS side never hard-codes the stride.
 */
export function floats_per_particle(): number;

/**
 * Energy to freeze the freezable water in 1 kg of food, J·kg⁻¹.
 *
 * ⚠️ This is NOT `water_fraction × 333 550`. The core discounts bound water,
 * which does not freeze at ordinary freezer temperatures; omitting that
 * overstates the freezing load by about 25 %.
 */
export function food_fusion_enthalpy(water_mass_fraction: number): number;

/**
 * Energy to evaporate ALL water out of 1 kg of food, J·kg⁻¹. A ceiling.
 */
export function food_vaporisation_enthalpy(water_mass_fraction: number, celsius: number): number;

/**
 * Latent load re-expressed as the temperature rise the same energy would buy.
 */
export function latent_as_temperature_rise(latent_j_kg: number, specific_heat_j_kg_k: number): number;

/**
 * Latent heat of vaporisation of water at `celsius`, J·kg⁻¹.
 *
 * BASIS: the Fleagle & Andreas linear fit (*Atmospheric Dynamics*), valid
 * 0–100 °C. Outside that band the core returns `OutsideCorrelationRange` and
 * this returns NaN — it does NOT extrapolate the line, which would keep
 * producing plausible-looking numbers well past where the fit means anything.
 */
export function latent_heat_vaporisation(celsius: number): number;

/**
 * Field count of the `lid_heat_balance` buffer.
 */
export function lid_balance_fields(): number;

/**
 * How hot a lid runs and how much steam it can condense back.
 *
 * Returns `[lid_c, convective_loss_w, radiative_loss_w, total_loss_w,
 * condensation_capacity_kg_s]`.
 *
 * A REFUSAL is a length-1 array whose single element is NaN. Length is the
 * discriminator, not the value: a caller that only checks `Number.isNaN` on
 * element 0 still behaves correctly, but one that checks length gets the
 * refusal without reading any element.
 *
 * Flattened to `Box<[f64]>` (a `Float64Array` in JS) rather than returned as
 * a struct because `thermo-core` is deliberately dependency-free — it is also
 * linked into the SpacetimeDB module — so pulling in `serde` to serialise a
 * 5-field record would be paid for twice and would violate the crate's rule.
 */
export function lid_heat_balance(lid_area_m2: number, lid_perimeter_m: number, lid_thickness_m: number, lid_k_w_m_k: number, headspace_c: number, ambient_c: number, latent_heat_j_kg: number, emissivity: number): Float64Array;

/**
 * ISA station pressure at elevation, kPa.
 */
export function pressure_from_elevation(elevation_m: number): number;

/**
 * Net radiant flux, kW·m⁻².
 */
export function radiant_flux_kw_m2(source_k: number, surface_k: number, emissivity: number, view_factor: number): number;

/**
 * Minutes for the centre of a slab to reach `target_c`.
 */
export function slab_core_time_minutes(thickness_mm: number, medium_c: number, initial_c: number, target_c: number, h_w_m2_k: number, k_w_m_k: number, alpha_m2_s: number, one_sided: boolean): number;

/**
 * Solve the series resistance chain and report which link controls.
 *
 * ## Buffer layout
 *
 * Header (`BOUNDARY_HEADER_FIELDS` = 7):
 * `[0]` total_resistance_k_per_w, `[1]` ua_w_per_k, `[2]` heat_flow_w,
 * `[3]` controlling link index, `[4]` food_biot (NaN when absent),
 * `[5]` link_count, `[6]` node_count.
 *
 * Then `link_count × BOUNDARY_LINK_FIELDS` floats:
 * `[resistance_k_per_w, area_m2, h_w_m2_k (NaN when absent), share, drop_k]`.
 *
 * Then `node_count` node temperatures in °C.
 *
 * Link IDs are `&'static str` and cannot live in an f64 buffer; fetch them
 * from [`boundary_network_link_ids`] with the same leg flags.
 *
 * A REFUSAL is a length-1 array whose single element is NaN.
 */
export function solve_boundary_network(source_c: number, sink_c: number, has_vessel: boolean, vessel_source_h_w_m2_k: number, vessel_area_m2: number, vessel_k_w_m_k: number, vessel_thickness_m: number, vessel_medium_h_w_m2_k: number, has_food: boolean, food_medium_h_w_m2_k: number, food_geometry: number, food_half_dimension_m: number, food_k_w_m_k: number, food_area_m2: number): Float64Array;

/**
 * Latent heat of fusion of PURE water, J·kg⁻¹. Infallible.
 *
 * BASIS: 1998 ASHRAE Refrigeration Handbook Ch. 8, `Lo = 143.4 Btu/lb`,
 * converted in the core from its own stated basis rather than transcribed.
 */
export function water_fusion_j_kg(): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_thermoengine_free: (a: number, b: number) => void;
    readonly altitude_time_multiplier: (a: number, b: number) => number;
    readonly boiling_point_at_elevation: (a: number) => number;
    readonly boiling_point_c: (a: number) => number;
    readonly boundary_network_link_ids: (a: number, b: number, c: number) => void;
    readonly food_fusion_enthalpy: (a: number) => number;
    readonly food_vaporisation_enthalpy: (a: number, b: number) => number;
    readonly latent_heat_vaporisation: (a: number) => number;
    readonly lid_heat_balance: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
    readonly pressure_from_elevation: (a: number) => number;
    readonly slab_core_time_minutes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
    readonly solve_boundary_network: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => void;
    readonly thermoengine_buffer_len: (a: number) => number;
    readonly thermoengine_buffer_ptr: (a: number) => number;
    readonly thermoengine_new: (a: number) => number;
    readonly thermoengine_particle_count: (a: number) => number;
    readonly thermoengine_resize: (a: number, b: number) => void;
    readonly thermoengine_step: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly contact_temperature_c: (a: number, b: number, c: number, d: number) => number;
    readonly biot_number: (a: number, b: number, c: number) => number;
    readonly latent_as_temperature_rise: (a: number, b: number) => number;
    readonly radiant_flux_kw_m2: (a: number, b: number, c: number, d: number) => number;
    readonly boundary_header_fields: () => number;
    readonly boundary_link_fields: () => number;
    readonly boundary_schema_version: () => number;
    readonly floats_per_particle: () => number;
    readonly lid_balance_fields: () => number;
    readonly water_fusion_j_kg: () => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
