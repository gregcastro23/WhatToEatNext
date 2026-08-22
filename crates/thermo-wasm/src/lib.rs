//! Browser WebAssembly engine for the cooking-method physics canvas.
//!
//! A thin `#[wasm_bindgen]` skin over [`thermo_core`]. It owns no physics of its
//! own: every number it returns comes from the shared core, which is the same
//! code the SpacetimeDB module links and the same code the golden vectors pin
//! against the TypeScript implementation.
//!
//! ## Why this is a separate crate from `spacetime-module`
//!
//! Both compile to `cdylib` on wasm32 and their ABIs are mutually exclusive.
//! `wasm-bindgen` rewrites the module to add its own imports, exports and a
//! JSON schema section; `spacetime publish` expects the module's exports to BE
//! the reducer surface. One crate carrying both attribute macros produces a
//! binary neither tool accepts.
//!
//! ## Memory contract
//!
//! The particle state lives in one flat `Vec<f32>` inside WASM linear memory.
//! JavaScript reads it as a `Float32Array` view — no per-frame copying, no
//! serialisation, no allocation in the render loop. The view MUST be
//! reconstructed after any call that can grow linear memory (i.e. after
//! [`ThermoEngine::new`] or [`ThermoEngine::resize`]), because growing the
//! WASM heap detaches every existing view. `buffer_ptr` is stable between those
//! calls and only between those calls.
//!
//! Layout, `FLOATS_PER_PARTICLE` (9) floats per particle:
//! `[x, y, z, vx, vy, vz, temp_c, radiant_intensity, phase_frac]`

use thermo_core as core_physics;
use thermo_core::{
    seeded_particles, AltitudeRegime, ConvectionParticle, FoodGeometry, FoodLeg, HeatRegime,
    SlabCookInput, VesselLeg, FLOATS_PER_PARTICLE,
};
use wasm_bindgen::prelude::*;

/// Upper bound on particle count.
///
/// The canvas renders 60. This cap exists so a bad argument from JS cannot ask
/// the module to allocate an arbitrary amount of linear memory — the browser
/// would either thrash or abort, and neither failure would point back here.
const MAX_PARTICLES: usize = 4096;

/// Stateful oven-convection simulation with a JS-readable particle buffer.
#[wasm_bindgen]
pub struct ThermoEngine {
    particles: Vec<ConvectionParticle>,
    buffer: Vec<f32>,
}

#[wasm_bindgen]
impl ThermoEngine {
    /// Create an engine with `count` deterministically-seeded particles.
    ///
    /// Deterministic on purpose: the seed is a closed-form function of the
    /// index, with no RNG anywhere. That is what lets the TypeScript fallback
    /// and this module be compared step for step — a random seed would make
    /// any such comparison meaningless.
    #[wasm_bindgen(constructor)]
    pub fn new(count: usize) -> ThermoEngine {
        let n = count.clamp(1, MAX_PARTICLES);
        let particles = seeded_particles(n);
        let mut engine = ThermoEngine {
            particles,
            buffer: vec![0.0; n * FLOATS_PER_PARTICLE],
        };
        engine.sync_buffer();
        engine
    }

    /// Advance the simulation by `dt_s` seconds and refresh the shared buffer.
    ///
    /// `dt_s` is clamped to 50 ms. A backgrounded tab hands back a delta of
    /// whole seconds when it wakes, and integrating that in one step throws
    /// every particle out of the render box at once — the visible symptom is a
    /// canvas that appears to reset itself whenever the user returns to it.
    ///
    /// `regime` is the [`HeatRegime`] discriminant. An unrecognised value is
    /// REFUSED rather than defaulted: a caller and a module that disagree about
    /// the regime table would otherwise render a boil as an oven and report
    /// nothing, which is the exact class of silent substitution this engine's
    /// engine-kind label already had to be fixed for once.
    pub fn step(
        &mut self,
        dt_s: f32,
        regime: u8,
        medium_temp_c: f32,
        h_w_m2_k: f32,
        radiant_source_k: f32,
    ) -> bool {
        let Some(regime) = HeatRegime::from_u8(regime) else {
            return false;
        };
        let dt = dt_s.clamp(0.0, 0.05);
        core_physics::step_medium_simulation(
            &mut self.particles,
            dt,
            regime,
            medium_temp_c,
            h_w_m2_k,
            radiant_source_k,
        );
        self.sync_buffer();
        true
    }

    /// Re-seed with a different particle count. Invalidates any existing view.
    pub fn resize(&mut self, count: usize) {
        let n = count.clamp(1, MAX_PARTICLES);
        self.particles = seeded_particles(n);
        self.buffer = vec![0.0; n * FLOATS_PER_PARTICLE];
        self.sync_buffer();
    }

    /// Pointer to the particle buffer in WASM linear memory.
    ///
    /// Valid until the next `new`/`resize`. See the memory contract above.
    #[wasm_bindgen(getter)]
    pub fn buffer_ptr(&self) -> *const f32 {
        self.buffer.as_ptr()
    }

    /// Length of the particle buffer, in f32 elements.
    #[wasm_bindgen(getter)]
    pub fn buffer_len(&self) -> usize {
        self.buffer.len()
    }

    /// Number of particles currently simulated.
    #[wasm_bindgen(getter)]
    pub fn particle_count(&self) -> usize {
        self.particles.len()
    }

    fn sync_buffer(&mut self) {
        for (i, p) in self.particles.iter().enumerate() {
            let o = i * FLOATS_PER_PARTICLE;
            self.buffer[o] = p.x;
            self.buffer[o + 1] = p.y;
            self.buffer[o + 2] = p.z;
            self.buffer[o + 3] = p.vx;
            self.buffer[o + 4] = p.vy;
            self.buffer[o + 5] = p.vz;
            self.buffer[o + 6] = p.temp_c;
            self.buffer[o + 7] = p.radiant_intensity;
            self.buffer[o + 8] = p.phase_frac;
        }
    }
}

/// Floats per particle, exported so the JS side never hard-codes the stride.
#[wasm_bindgen]
pub fn floats_per_particle() -> usize {
    FLOATS_PER_PARTICLE
}

// ============================================================================
// Scalar physics, exposed for the panels
// ============================================================================
//
// These return `f64::NAN` where the core returns `Err`, because the
// wasm-bindgen boundary has no cheap sum type and a thrown JsError on every
// out-of-range probe would be worse. The TypeScript loader treats NaN as
// "the engine declined" and falls back to its own implementation, which raises
// the same RangeError the core reports — so the refusal survives the boundary
// even though the error kind does not.

/// Water boiling point at a given absolute station pressure, °C.
#[wasm_bindgen]
pub fn boiling_point_c(pressure_kpa: f64) -> f64 {
    core_physics::boiling_point_c(pressure_kpa).unwrap_or(f64::NAN)
}

/// Water boiling point at elevation under ISA-1976, °C.
#[wasm_bindgen]
pub fn boiling_point_at_elevation(elevation_m: f64) -> f64 {
    core_physics::boiling_point_at_elevation(elevation_m).unwrap_or(f64::NAN)
}

/// ISA station pressure at elevation, kPa.
#[wasm_bindgen]
pub fn pressure_from_elevation(elevation_m: f64) -> f64 {
    core_physics::pressure_from_elevation(elevation_m).unwrap_or(f64::NAN)
}

/// Altitude time multiplier. `pasteurisation = false` selects the softening
/// (van 't Hoff) regime; the two differ by more than 6× at Denver.
#[wasm_bindgen]
pub fn altitude_time_multiplier(elevation_m: f64, pasteurisation: bool) -> f64 {
    let regime = if pasteurisation {
        AltitudeRegime::Pasteurisation
    } else {
        AltitudeRegime::Softening
    };
    core_physics::altitude_time_multiplier(elevation_m, regime).unwrap_or(f64::NAN)
}

/// Minutes for the centre of a slab to reach `target_c`.
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn slab_core_time_minutes(
    thickness_mm: f64,
    medium_c: f64,
    initial_c: f64,
    target_c: f64,
    h_w_m2_k: f64,
    k_w_m_k: f64,
    alpha_m2_s: f64,
    one_sided: bool,
) -> f64 {
    let input = SlabCookInput {
        thickness_mm,
        medium_c,
        initial_c,
        target_c,
        h_w_m2_k,
        k_w_m_k,
        alpha_m2_s,
        one_sided,
    };
    core_physics::slab_core_time(input)
        .map(|r| r.minutes)
        .unwrap_or(f64::NAN)
}

/// Biot number for a slab.
#[wasm_bindgen]
pub fn biot_number(h_w_m2_k: f64, half_thickness_m: f64, k_w_m_k: f64) -> f64 {
    core_physics::biot_number(h_w_m2_k, half_thickness_m, k_w_m_k).unwrap_or(f64::NAN)
}

/// Net radiant flux, kW·m⁻².
#[wasm_bindgen]
pub fn radiant_flux_kw_m2(
    source_k: f64,
    surface_k: f64,
    emissivity: f64,
    view_factor: f64,
) -> f64 {
    core_physics::radiant_flux_kw_m2(source_k, surface_k, emissivity, view_factor)
}

/// Pan/food contact interface temperature, °C.
#[wasm_bindgen]
pub fn contact_temperature_c(
    pan_c: f64,
    food_c: f64,
    pan_effusivity: f64,
    food_effusivity: f64,
) -> f64 {
    core_physics::contact_temperature_c(pan_c, food_c, pan_effusivity, food_effusivity)
}


// ============================================================================
// Latent heat — scalars
// ============================================================================
//
// The core already owned all of this; none of it was reachable from the
// browser, so the Kitchen Lab's latent-heat panel had no way to ask the same
// engine the oven canvas uses. These are thin `unwrap_or(NAN)` skins following
// the refusal convention documented above.

/// Latent heat of vaporisation of water at `celsius`, J·kg⁻¹.
///
/// BASIS: the Fleagle & Andreas linear fit (*Atmospheric Dynamics*), valid
/// 0–100 °C. Outside that band the core returns `OutsideCorrelationRange` and
/// this returns NaN — it does NOT extrapolate the line, which would keep
/// producing plausible-looking numbers well past where the fit means anything.
#[wasm_bindgen]
pub fn latent_heat_vaporisation(celsius: f64) -> f64 {
    core_physics::latent_heat_vaporisation(celsius).unwrap_or(f64::NAN)
}

/// Latent heat of fusion of PURE water, J·kg⁻¹. Infallible.
///
/// BASIS: 1998 ASHRAE Refrigeration Handbook Ch. 8, `Lo = 143.4 Btu/lb`,
/// converted in the core from its own stated basis rather than transcribed.
#[wasm_bindgen]
pub fn water_fusion_j_kg() -> f64 {
    core_physics::water_fusion_j_kg()
}

/// Energy to freeze the freezable water in 1 kg of food, J·kg⁻¹.
///
/// ⚠️ This is NOT `water_fraction × 333 550`. The core discounts bound water,
/// which does not freeze at ordinary freezer temperatures; omitting that
/// overstates the freezing load by about 25 %.
#[wasm_bindgen]
pub fn food_fusion_enthalpy(water_mass_fraction: f64) -> f64 {
    core_physics::food_fusion_enthalpy(water_mass_fraction).unwrap_or(f64::NAN)
}

/// Energy to evaporate ALL water out of 1 kg of food, J·kg⁻¹. A ceiling.
#[wasm_bindgen]
pub fn food_vaporisation_enthalpy(water_mass_fraction: f64, celsius: f64) -> f64 {
    core_physics::food_vaporisation_enthalpy(water_mass_fraction, celsius).unwrap_or(f64::NAN)
}

/// Latent load re-expressed as the temperature rise the same energy would buy.
#[wasm_bindgen]
pub fn latent_as_temperature_rise(latent_j_kg: f64, specific_heat_j_kg_k: f64) -> f64 {
    core_physics::latent_as_temperature_rise(latent_j_kg, specific_heat_j_kg_k)
        .unwrap_or(f64::NAN)
}

// ============================================================================
// Lid heat balance — flattened
// ============================================================================

/// Number of f64s in a `lid_heat_balance` result. Exported so JS never
/// hard-codes the stride, same discipline as `floats_per_particle`.
pub const LID_BALANCE_FIELDS: usize = 5;

/// Field count of the `lid_heat_balance` buffer.
#[wasm_bindgen]
pub fn lid_balance_fields() -> usize {
    LID_BALANCE_FIELDS
}

/// How hot a lid runs and how much steam it can condense back.
///
/// Returns `[lid_c, convective_loss_w, radiative_loss_w, total_loss_w,
/// condensation_capacity_kg_s]`.
///
/// A REFUSAL is a length-1 array whose single element is NaN. Length is the
/// discriminator, not the value: a caller that only checks `Number.isNaN` on
/// element 0 still behaves correctly, but one that checks length gets the
/// refusal without reading any element.
///
/// Flattened to `Box<[f64]>` (a `Float64Array` in JS) rather than returned as
/// a struct because `thermo-core` is deliberately dependency-free — it is also
/// linked into the SpacetimeDB module — so pulling in `serde` to serialise a
/// 5-field record would be paid for twice and would violate the crate's rule.
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn lid_heat_balance(
    lid_area_m2: f64,
    lid_perimeter_m: f64,
    lid_thickness_m: f64,
    lid_k_w_m_k: f64,
    headspace_c: f64,
    ambient_c: f64,
    latent_heat_j_kg: f64,
    emissivity: f64,
) -> Box<[f64]> {
    match core_physics::lid_heat_balance(
        lid_area_m2,
        lid_perimeter_m,
        lid_thickness_m,
        lid_k_w_m_k,
        headspace_c,
        ambient_c,
        latent_heat_j_kg,
        emissivity,
    ) {
        Ok(r) => Box::new([
            r.lid_c,
            r.convective_loss_w,
            r.radiative_loss_w,
            r.total_loss_w,
            r.condensation_capacity_kg_s,
        ]),
        Err(_) => Box::new([f64::NAN]),
    }
}

// ============================================================================
// Boundary network — flattened
// ============================================================================

/// f64s per link in a `solve_boundary_network` result.
pub const BOUNDARY_LINK_FIELDS: usize = 5;

/// Fixed header length preceding the per-link block.
pub const BOUNDARY_HEADER_FIELDS: usize = 7;

/// Per-link stride of the boundary-network buffer.
#[wasm_bindgen]
pub fn boundary_link_fields() -> usize {
    BOUNDARY_LINK_FIELDS
}

/// Header length of the boundary-network buffer.
#[wasm_bindgen]
pub fn boundary_header_fields() -> usize {
    BOUNDARY_HEADER_FIELDS
}

/// Map a JS geometry discriminant onto `FoodGeometry`.
///
/// Refuses anything outside 0..=2 rather than defaulting to Slab. A silent
/// default here would answer a question the caller did not ask, and the wrong
/// geometry changes the Biot denominator — the answer would be wrong in a way
/// that still looks like a number.
fn geometry_from_u8(d: u8) -> Option<FoodGeometry> {
    match d {
        0 => Some(FoodGeometry::Slab),
        1 => Some(FoodGeometry::Cylinder),
        2 => Some(FoodGeometry::Sphere),
        _ => None,
    }
}

/// Solve the series resistance chain and report which link controls.
///
/// ## Buffer layout
///
/// Header (`BOUNDARY_HEADER_FIELDS` = 7):
/// `[0]` total_resistance_k_per_w, `[1]` ua_w_per_k, `[2]` heat_flow_w,
/// `[3]` controlling link index, `[4]` food_biot (NaN when absent),
/// `[5]` link_count, `[6]` node_count.
///
/// Then `link_count × BOUNDARY_LINK_FIELDS` floats:
/// `[resistance_k_per_w, area_m2, h_w_m2_k (NaN when absent), share, drop_k]`.
///
/// Then `node_count` node temperatures in °C.
///
/// Link IDs are `&'static str` and cannot live in an f64 buffer; fetch them
/// from [`boundary_network_link_ids`] with the same leg flags.
///
/// A REFUSAL is a length-1 array whose single element is NaN.
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn solve_boundary_network(
    source_c: f64,
    sink_c: f64,
    has_vessel: bool,
    vessel_source_h_w_m2_k: f64,
    vessel_area_m2: f64,
    vessel_k_w_m_k: f64,
    vessel_thickness_m: f64,
    vessel_medium_h_w_m2_k: f64,
    has_food: bool,
    food_medium_h_w_m2_k: f64,
    food_geometry: u8,
    food_half_dimension_m: f64,
    food_k_w_m_k: f64,
    food_area_m2: f64,
) -> Box<[f64]> {
    let refusal: Box<[f64]> = Box::new([f64::NAN]);

    let vessel = if has_vessel {
        Some(VesselLeg {
            source_to_vessel_h_w_m2_k: vessel_source_h_w_m2_k,
            area_m2: vessel_area_m2,
            k_w_m_k: vessel_k_w_m_k,
            thickness_m: vessel_thickness_m,
            vessel_to_medium_h_w_m2_k: vessel_medium_h_w_m2_k,
        })
    } else {
        None
    };

    let food = if has_food {
        let geometry = match geometry_from_u8(food_geometry) {
            Some(g) => g,
            None => return refusal,
        };
        Some(FoodLeg {
            medium_to_food_h_w_m2_k: food_medium_h_w_m2_k,
            geometry,
            half_dimension_m: food_half_dimension_m,
            k_w_m_k: food_k_w_m_k,
            area_m2: food_area_m2,
        })
    } else {
        None
    };

    let solved = match core_physics::solve_boundary_network(source_c, sink_c, vessel, food) {
        Ok(r) => r,
        Err(_) => return refusal,
    };

    let mut out =
        Vec::with_capacity(BOUNDARY_HEADER_FIELDS + solved.links.len() * BOUNDARY_LINK_FIELDS
            + solved.node_celsius.len());

    out.push(solved.total_resistance_k_per_w);
    out.push(solved.ua_w_per_k);
    out.push(solved.heat_flow_w);
    out.push(solved.controlling as f64);
    out.push(solved.food_biot.unwrap_or(f64::NAN));
    out.push(solved.links.len() as f64);
    out.push(solved.node_celsius.len() as f64);

    for link in &solved.links {
        out.push(link.resistance_k_per_w);
        out.push(link.area_m2);
        out.push(link.h_w_m2_k.unwrap_or(f64::NAN));
        out.push(link.share);
        out.push(link.drop_k);
    }
    out.extend_from_slice(&solved.node_celsius);

    out.into_boxed_slice()
}

/// Link IDs for a chain with the given legs, comma-separated in buffer order.
///
/// Kept as a separate call because the IDs are a pure function of which legs
/// are present — they do not depend on any of the numeric inputs — so a UI can
/// fetch them once and reuse them across every re-solve while dragging a slider.
/// Returns an empty string for an unsolvable combination.
#[wasm_bindgen]
pub fn boundary_network_link_ids(has_vessel: bool, has_food: bool) -> String {
    // Mirrors the push order inside `core_physics::solve_boundary_network`.
    let mut ids: Vec<&'static str> = Vec::new();
    if has_vessel {
        ids.extend_from_slice(&[
            "source-to-vessel",
            "vessel-wall",
            "vessel-to-medium",
        ]);
    }
    if has_food {
        ids.extend_from_slice(&["medium-to-food", "food-interior"]);
    }
    ids.join(",")
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `boundary_network_link_ids` hand-mirrors the push order inside the
    /// core's solver. A mirror drifts: this caught `food-internal` vs the
    /// core's actual `food-interior` on the first run. Assert against the real
    /// solve for every leg combination rather than against a second copy of
    /// the same guess.
    #[test]
    fn link_ids_match_the_real_solver() {
        let vessel = VesselLeg {
            source_to_vessel_h_w_m2_k: 60.0,
            area_m2: 0.045,
            k_w_m_k: 45.0,
            thickness_m: 0.003,
            vessel_to_medium_h_w_m2_k: 1000.0,
        };
        let food = FoodLeg {
            medium_to_food_h_w_m2_k: 500.0,
            geometry: FoodGeometry::Sphere,
            half_dimension_m: 0.025,
            k_w_m_k: 0.55,
            area_m2: 4.0 * std::f64::consts::PI * 0.025 * 0.025,
        };

        for (has_vessel, has_food) in [(true, true), (true, false), (false, true)] {
            let solved = thermo_core::solve_boundary_network(
                200.0,
                20.0,
                if has_vessel { Some(vessel) } else { None },
                if has_food { Some(food) } else { None },
            )
            .expect("fixture should solve");

            let actual: Vec<&str> = solved.links.iter().map(|l| l.id).collect();
            let mirrored = boundary_network_link_ids(has_vessel, has_food);
            assert_eq!(
                actual.join(","),
                mirrored,
                "link id mirror drifted for vessel={has_vessel} food={has_food}"
            );
        }
    }

    /// A refusal must be distinguishable by LENGTH, not only by NaN, so a
    /// caller that checks length never reads a garbage element.
    #[test]
    fn refusals_are_length_one() {
        // Unknown geometry discriminant must refuse rather than default.
        let bad = solve_boundary_network(
            200.0, 20.0, false, 0.0, 0.0, 0.0, 0.0, 0.0, true, 500.0, 9, 0.025, 0.55, 0.008,
        );
        assert_eq!(bad.len(), 1);
        assert!(bad[0].is_nan());

        // headspace <= ambient is an documented lid refusal.
        let lid = lid_heat_balance(0.05, 0.8, 0.0015, 15.0, 20.0, 20.0, 2.26e6, 0.3);
        assert_eq!(lid.len(), 1);
        assert!(lid[0].is_nan());
    }

    /// Out-of-band latent heat must be NaN, never an extrapolated line.
    #[test]
    fn latent_heat_refuses_outside_the_fit() {
        assert!(latent_heat_vaporisation(-5.0).is_nan());
        assert!(latent_heat_vaporisation(105.0).is_nan());
        assert!(latent_heat_vaporisation(100.0).is_finite());
        assert!(latent_heat_vaporisation(0.0).is_finite());
    }

    #[test]
    fn engine_buffer_is_stride_consistent() {
        let engine = ThermoEngine::new(60);
        assert_eq!(engine.particle_count(), 60);
        assert_eq!(engine.buffer_len(), 60 * FLOATS_PER_PARTICLE);
    }

    #[test]
    fn engine_clamps_absurd_particle_counts() {
        assert_eq!(ThermoEngine::new(0).particle_count(), 1);
        assert_eq!(ThermoEngine::new(usize::MAX).particle_count(), MAX_PARTICLES);
    }

    #[test]
    fn step_clamps_a_backgrounded_tab_delta() {
        // A tab that slept for 4 s must not integrate 4 s in one step.
        let mut wild = ThermoEngine::new(16);
        assert!(wild.step(4.0, HeatRegime::BuoyantAir as u8, 175.0, 25.0, 505.0));
        let mut capped = ThermoEngine::new(16);
        assert!(capped.step(0.05, HeatRegime::BuoyantAir as u8, 175.0, 25.0, 505.0));
        for (a, b) in wild.buffer.iter().zip(capped.buffer.iter()) {
            assert_eq!(a, b, "dt was not clamped to 50 ms");
        }
    }

    #[test]
    fn step_refuses_an_unknown_regime_rather_than_defaulting() {
        // ⚠️ A stale bundle paired with a newer page is the realistic case, and
        // silently falling back to BuoyantAir would render every method as an
        // oven again with nothing anywhere reporting it. The refusal must be
        // observable, and the buffer must be untouched.
        let mut engine = ThermoEngine::new(8);
        let before = engine.buffer.clone();
        assert!(!engine.step(1.0 / 60.0, 200, 175.0, 25.0, 505.0));
        assert_eq!(engine.buffer, before, "a refused step must not advance state");
    }

    #[test]
    fn every_regime_is_accepted_across_the_boundary() {
        // The discriminants are the wire format. If the enum is reordered
        // without the TypeScript following, this is where it shows.
        let mut engine = ThermoEngine::new(8);
        for r in 0u8..=9 {
            assert!(engine.step(1.0 / 60.0, r, 120.0, 500.0, 505.0), "regime {r}");
        }
    }

    #[test]
    fn scalar_exports_decline_rather_than_invent() {
        assert!(boiling_point_c(-1.0).is_nan());
        assert!(pressure_from_elevation(12_000.0).is_nan());
        // 60 °C core in a 55 °C bath is unreachable, not slow.
        assert!(slab_core_time_minutes(25.0, 55.0, 5.0, 60.0, 95.0, 0.45, 1.3e-7, false).is_nan());
    }

    #[test]
    fn seeded_particles_match_the_cores_own_seed() {
        // Both runtimes seed identically or nothing downstream can be compared.
        let mine = seeded_particles(32);
        for (i, p) in mine.iter().enumerate() {
            let f = i as f32;
            assert_eq!(p.x, ((f * 0.37) % 2.0) - 1.0);
            assert_eq!(p.temp_c, 20.0 + (f * 0.7) % 50.0);
        }
    }
}
