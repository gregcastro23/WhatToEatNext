/* @ts-self-types="./thermo_wasm.d.ts" */

/**
 * Stateful oven-convection simulation with a JS-readable particle buffer.
 */
export class ThermoEngine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ThermoEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_thermoengine_free(ptr, 0);
    }
    /**
     * Length of the particle buffer, in f32 elements.
     * @returns {number}
     */
    get buffer_len() {
        const ret = wasm.thermoengine_buffer_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Pointer to the particle buffer in WASM linear memory.
     *
     * Valid until the next `new`/`resize`. See the memory contract above.
     * @returns {number}
     */
    get buffer_ptr() {
        const ret = wasm.thermoengine_buffer_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Create an engine with `count` deterministically-seeded particles.
     *
     * Deterministic on purpose: the seed is a closed-form function of the
     * index, with no RNG anywhere. That is what lets the TypeScript fallback
     * and this module be compared step for step — a random seed would make
     * any such comparison meaningless.
     * @param {number} count
     */
    constructor(count) {
        const ret = wasm.thermoengine_new(count);
        this.__wbg_ptr = ret;
        ThermoEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Number of particles currently simulated.
     * @returns {number}
     */
    get particle_count() {
        const ret = wasm.thermoengine_particle_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Re-seed with a different particle count. Invalidates any existing view.
     * @param {number} count
     */
    resize(count) {
        wasm.thermoengine_resize(this.__wbg_ptr, count);
    }
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
     * @param {number} dt_s
     * @param {number} regime
     * @param {number} medium_temp_c
     * @param {number} h_w_m2_k
     * @param {number} radiant_source_k
     * @returns {boolean}
     */
    step(dt_s, regime, medium_temp_c, h_w_m2_k, radiant_source_k) {
        const ret = wasm.thermoengine_step(this.__wbg_ptr, dt_s, regime, medium_temp_c, h_w_m2_k, radiant_source_k);
        return ret !== 0;
    }
}
if (Symbol.dispose) ThermoEngine.prototype[Symbol.dispose] = ThermoEngine.prototype.free;

/**
 * Altitude time multiplier. `pasteurisation = false` selects the softening
 * (van 't Hoff) regime; the two differ by more than 6× at Denver.
 * @param {number} elevation_m
 * @param {boolean} pasteurisation
 * @returns {number}
 */
export function altitude_time_multiplier(elevation_m, pasteurisation) {
    const ret = wasm.altitude_time_multiplier(elevation_m, pasteurisation);
    return ret;
}

/**
 * Biot number for a slab.
 * @param {number} h_w_m2_k
 * @param {number} half_thickness_m
 * @param {number} k_w_m_k
 * @returns {number}
 */
export function biot_number(h_w_m2_k, half_thickness_m, k_w_m_k) {
    const ret = wasm.biot_number(h_w_m2_k, half_thickness_m, k_w_m_k);
    return ret;
}

/**
 * Water boiling point at elevation under ISA-1976, °C.
 * @param {number} elevation_m
 * @returns {number}
 */
export function boiling_point_at_elevation(elevation_m) {
    const ret = wasm.boiling_point_at_elevation(elevation_m);
    return ret;
}

/**
 * Water boiling point at a given absolute station pressure, °C.
 * @param {number} pressure_kpa
 * @returns {number}
 */
export function boiling_point_c(pressure_kpa) {
    const ret = wasm.boiling_point_c(pressure_kpa);
    return ret;
}

/**
 * Header length of the boundary-network buffer.
 * @returns {number}
 */
export function boundary_header_fields() {
    const ret = wasm.boundary_header_fields();
    return ret >>> 0;
}

/**
 * Per-link stride of the boundary-network buffer.
 * @returns {number}
 */
export function boundary_link_fields() {
    const ret = wasm.boundary_link_fields();
    return ret >>> 0;
}

/**
 * Link IDs for a chain with the given legs, comma-separated in buffer order.
 *
 * Kept as a separate call because the IDs are a pure function of which legs
 * are present — they do not depend on any of the numeric inputs — so a UI can
 * fetch them once and reuse them across every re-solve while dragging a slider.
 * Returns an empty string for an unsolvable combination.
 * @param {boolean} has_vessel
 * @param {boolean} has_food
 * @param {number} vessel_layer_count
 * @returns {string}
 */
export function boundary_network_link_ids(has_vessel, has_food, vessel_layer_count) {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.boundary_network_link_ids(retptr, has_vessel, has_food, vessel_layer_count);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export(deferred1_0, deferred1_1, 1);
    }
}

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
 * @returns {number}
 */
export function boundary_schema_version() {
    const ret = wasm.boundary_schema_version();
    return ret >>> 0;
}

/**
 * Pan/food contact interface temperature, °C.
 * @param {number} pan_c
 * @param {number} food_c
 * @param {number} pan_effusivity
 * @param {number} food_effusivity
 * @returns {number}
 */
export function contact_temperature_c(pan_c, food_c, pan_effusivity, food_effusivity) {
    const ret = wasm.contact_temperature_c(pan_c, food_c, pan_effusivity, food_effusivity);
    return ret;
}

/**
 * Floats per particle, exported so the JS side never hard-codes the stride.
 * @returns {number}
 */
export function floats_per_particle() {
    const ret = wasm.floats_per_particle();
    return ret >>> 0;
}

/**
 * Energy to freeze the freezable water in 1 kg of food, J·kg⁻¹.
 *
 * ⚠️ This is NOT `water_fraction × 333 550`. The core discounts bound water,
 * which does not freeze at ordinary freezer temperatures; omitting that
 * overstates the freezing load by about 25 %.
 * @param {number} water_mass_fraction
 * @returns {number}
 */
export function food_fusion_enthalpy(water_mass_fraction) {
    const ret = wasm.food_fusion_enthalpy(water_mass_fraction);
    return ret;
}

/**
 * Energy to evaporate ALL water out of 1 kg of food, J·kg⁻¹. A ceiling.
 * @param {number} water_mass_fraction
 * @param {number} celsius
 * @returns {number}
 */
export function food_vaporisation_enthalpy(water_mass_fraction, celsius) {
    const ret = wasm.food_vaporisation_enthalpy(water_mass_fraction, celsius);
    return ret;
}

/**
 * Latent load re-expressed as the temperature rise the same energy would buy.
 * @param {number} latent_j_kg
 * @param {number} specific_heat_j_kg_k
 * @returns {number}
 */
export function latent_as_temperature_rise(latent_j_kg, specific_heat_j_kg_k) {
    const ret = wasm.latent_as_temperature_rise(latent_j_kg, specific_heat_j_kg_k);
    return ret;
}

/**
 * Latent heat of vaporisation of water at `celsius`, J·kg⁻¹.
 *
 * BASIS: the Fleagle & Andreas linear fit (*Atmospheric Dynamics*), valid
 * 0–100 °C. Outside that band the core returns `OutsideCorrelationRange` and
 * this returns NaN — it does NOT extrapolate the line, which would keep
 * producing plausible-looking numbers well past where the fit means anything.
 * @param {number} celsius
 * @returns {number}
 */
export function latent_heat_vaporisation(celsius) {
    const ret = wasm.latent_heat_vaporisation(celsius);
    return ret;
}

/**
 * Field count of the `lid_heat_balance` buffer.
 * @returns {number}
 */
export function lid_balance_fields() {
    const ret = wasm.lid_balance_fields();
    return ret >>> 0;
}

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
 * @param {number} lid_area_m2
 * @param {number} lid_perimeter_m
 * @param {number} lid_thickness_m
 * @param {number} lid_k_w_m_k
 * @param {number} headspace_c
 * @param {number} ambient_c
 * @param {number} latent_heat_j_kg
 * @param {number} emissivity
 * @returns {Float64Array}
 */
export function lid_heat_balance(lid_area_m2, lid_perimeter_m, lid_thickness_m, lid_k_w_m_k, headspace_c, ambient_c, latent_heat_j_kg, emissivity) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.lid_heat_balance(retptr, lid_area_m2, lid_perimeter_m, lid_thickness_m, lid_k_w_m_k, headspace_c, ambient_c, latent_heat_j_kg, emissivity);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v1 = getArrayF64FromWasm0(r0, r1).slice();
        wasm.__wbindgen_export(r0, r1 * 8, 8);
        return v1;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Deepest wall stack the core accepts.
 * @returns {number}
 */
export function max_wall_layers() {
    const ret = wasm.max_wall_layers();
    return ret >>> 0;
}

/**
 * ISA station pressure at elevation, kPa.
 * @param {number} elevation_m
 * @returns {number}
 */
export function pressure_from_elevation(elevation_m) {
    const ret = wasm.pressure_from_elevation(elevation_m);
    return ret;
}

/**
 * Net radiant flux, kW·m⁻².
 * @param {number} source_k
 * @param {number} surface_k
 * @param {number} emissivity
 * @param {number} view_factor
 * @returns {number}
 */
export function radiant_flux_kw_m2(source_k, surface_k, emissivity, view_factor) {
    const ret = wasm.radiant_flux_kw_m2(source_k, surface_k, emissivity, view_factor);
    return ret;
}

/**
 * Time to reduce a liquid by `target_fraction`, seconds. NaN when refused.
 *
 * Refuses a held pot rather than reporting an infinite time — see the core.
 * @param {number} initial_volume_l
 * @param {number} power_into_contents_w
 * @param {number} latent_heat_j_kg
 * @param {number} escape_fraction
 * @param {number} liquid_c
 * @param {number} target_fraction
 * @returns {number}
 */
export function reduction_time_seconds(initial_volume_l, power_into_contents_w, latent_heat_j_kg, escape_fraction, liquid_c, target_fraction) {
    const ret = wasm.reduction_time_seconds(initial_volume_l, power_into_contents_w, latent_heat_j_kg, escape_fraction, liquid_c, target_fraction);
    return ret;
}

/**
 * Latent heat of vaporisation from the SATURATED-WATER TABLE, J·kg⁻¹.
 *
 * ⚠️ NOT THE SAME NUMBER AS [`latent_heat_vaporisation`], and the difference
 * is deliberate. That one is the Fleagle & Andreas fit, valid for evaporation
 * at arbitrary sub-boiling surface temperatures; this one is Incropera &
 * DeWitt Table A.6, the saturation value. They differ by 0.6848 % at 100 °C,
 * and `src/lib/cooking/latentHeat.ts` explains at length why they are kept
 * apart rather than reconciled — two independent sources agreeing to within a
 * percent is corroboration, and collapsing them would destroy it.
 *
 * A BOILING pot is at saturation, so reduction work wants THIS one. Feeding
 * the fit instead is a 0.68 % error in every reduction time — which is exactly
 * how `scripts/verify-thermo-wasm-parity.mjs` caught it being used here.
 * @param {number} celsius
 * @returns {number}
 */
export function saturated_water_hfg_j_kg(celsius) {
    const ret = wasm.saturated_water_hfg_j_kg(celsius);
    return ret;
}

/**
 * Net water loss from a boiling pot, kg·s⁻¹. NaN when refused.
 *
 * `escape_fraction` is the caller's, from `VAPOUR_ESCAPE_FRACTION` in
 * src/data/cooking/vessels.ts — a graded ORDERING of seal states, not a fitted
 * coefficient, which is why no version of it is hardcoded on either side of
 * this boundary.
 * @param {number} power_into_contents_w
 * @param {number} latent_heat_j_kg
 * @param {number} escape_fraction
 * @returns {number}
 */
export function simmer_net_loss_kg_s(power_into_contents_w, latent_heat_j_kg, escape_fraction) {
    const ret = wasm.simmer_net_loss_kg_s(power_into_contents_w, latent_heat_j_kg, escape_fraction);
    return ret;
}

/**
 * Stride of the trajectory buffer.
 * @returns {number}
 */
export function simmer_step_fields() {
    const ret = wasm.simmer_step_fields();
    return ret >>> 0;
}

/**
 * One sample of a reduction trajectory.
 *
 * `[elapsed_s, remaining_volume_l, concentration_ratio, net_loss_kg_s]`.
 * A REFUSAL is a length-1 array whose single element is NaN — the same
 * discriminator the boundary buffer uses, so a caller that checks length never
 * reads past the end of a buffer that was never populated.
 * @param {number} initial_volume_l
 * @param {number} power_into_contents_w
 * @param {number} latent_heat_j_kg
 * @param {number} escape_fraction
 * @param {number} liquid_c
 * @param {number} elapsed_s
 * @returns {Float64Array}
 */
export function simmer_trajectory_step(initial_volume_l, power_into_contents_w, latent_heat_j_kg, escape_fraction, liquid_c, elapsed_s) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.simmer_trajectory_step(retptr, initial_volume_l, power_into_contents_w, latent_heat_j_kg, escape_fraction, liquid_c, elapsed_s);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v1 = getArrayF64FromWasm0(r0, r1).slice();
        wasm.__wbindgen_export(r0, r1 * 8, 8);
        return v1;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Minutes for the centre of a slab to reach `target_c`.
 * @param {number} thickness_mm
 * @param {number} medium_c
 * @param {number} initial_c
 * @param {number} target_c
 * @param {number} h_w_m2_k
 * @param {number} k_w_m_k
 * @param {number} alpha_m2_s
 * @param {boolean} one_sided
 * @returns {number}
 */
export function slab_core_time_minutes(thickness_mm, medium_c, initial_c, target_c, h_w_m2_k, k_w_m_k, alpha_m2_s, one_sided) {
    const ret = wasm.slab_core_time_minutes(thickness_mm, medium_c, initial_c, target_c, h_w_m2_k, k_w_m_k, alpha_m2_s, one_sided);
    return ret;
}

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
 *
 * `vessel_layers` is flat `[thickness_m, k_w_m_k]` pairs, OUTSIDE FACE FIRST —
 * a slice rather than more scalars because a wall is 1..=5 plies, and ten more
 * positional f64s would be a transposition waiting to happen. Its length must
 * be even and at most `2 * max_wall_layers()`; anything else is a refusal,
 * never a truncation, since a silently shortened stack solves a different pan
 * than the caller asked about.
 * @param {number} source_c
 * @param {number} sink_c
 * @param {boolean} has_vessel
 * @param {number} vessel_source_h_w_m2_k
 * @param {number} vessel_area_m2
 * @param {number} vessel_medium_h_w_m2_k
 * @param {Float64Array} vessel_layers
 * @param {boolean} has_food
 * @param {number} food_medium_h_w_m2_k
 * @param {number} food_geometry
 * @param {number} food_half_dimension_m
 * @param {number} food_k_w_m_k
 * @param {number} food_area_m2
 * @returns {Float64Array}
 */
export function solve_boundary_network(source_c, sink_c, has_vessel, vessel_source_h_w_m2_k, vessel_area_m2, vessel_medium_h_w_m2_k, vessel_layers, has_food, food_medium_h_w_m2_k, food_geometry, food_half_dimension_m, food_k_w_m_k, food_area_m2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArrayF64ToWasm0(vessel_layers, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.solve_boundary_network(retptr, source_c, sink_c, has_vessel, vessel_source_h_w_m2_k, vessel_area_m2, vessel_medium_h_w_m2_k, ptr0, len0, has_food, food_medium_h_w_m2_k, food_geometry, food_half_dimension_m, food_k_w_m_k, food_area_m2);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v2 = getArrayF64FromWasm0(r0, r1).slice();
        wasm.__wbindgen_export(r0, r1 * 8, 8);
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Latent heat of fusion of PURE water, J·kg⁻¹. Infallible.
 *
 * BASIS: 1998 ASHRAE Refrigeration Handbook Ch. 8, `Lo = 143.4 Btu/lb`,
 * converted in the core from its own stated basis rather than transcribed.
 * @returns {number}
 */
export function water_fusion_j_kg() {
    const ret = wasm.water_fusion_j_kg();
    return ret;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_bb96b2010945f0bc: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
    };
    return {
        __proto__: null,
        "./thermo_wasm_bg.js": import0,
    };
}

const ThermoEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_thermoengine_free(ptr, 1));

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('thermo_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
