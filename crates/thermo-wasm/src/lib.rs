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
//! Layout, `FLOATS_PER_PARTICLE` (8) floats per particle:
//! `[x, y, z, vx, vy, vz, temp_c, radiant_intensity]`

use thermo_core as core_physics;
use thermo_core::{
    seeded_particles, AltitudeRegime, ConvectionParticle, SlabCookInput, FLOATS_PER_PARTICLE,
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
    pub fn step(&mut self, dt_s: f32, oven_temp_c: f32, h_w_m2_k: f32, radiant_source_k: f32) {
        let dt = dt_s.clamp(0.0, 0.05);
        core_physics::step_oven_simulation(
            &mut self.particles,
            dt,
            oven_temp_c,
            h_w_m2_k,
            radiant_source_k,
        );
        self.sync_buffer();
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

#[cfg(test)]
mod tests {
    use super::*;

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
        wild.step(4.0, 175.0, 25.0, 505.0);
        let mut capped = ThermoEngine::new(16);
        capped.step(0.05, 175.0, 25.0, 505.0);
        for (a, b) in wild.buffer.iter().zip(capped.buffer.iter()) {
            assert_eq!(a, b, "dt was not clamped to 50 ms");
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
