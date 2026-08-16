//! Culinary heat-transfer physics — the canonical Rust implementation.
//!
//! This is the Rust half of a two-runtime pair. The TypeScript half is
//! `src/lib/cooking/thermo.ts`, and nothing in either build stops them from
//! drifting apart. The only defence is that both must reproduce the same golden
//! vectors: `crates/thermo-core/tests/thermo_golden_vectors.json`, asserted by
//! `tests/golden.rs` here and by
//! `src/__tests__/cookingThermoCrossRuntimeParity.test.ts` there.
//!
//! ## Rules this crate lives by
//!
//! 1. **No dependencies.** It links into both a SpacetimeDB module and a
//!    browser bundle; anything pulled in here is paid for twice.
//! 2. **No macros.** Attribute macros are what make the two edge crates
//!    incompatible; the shared core must be inert.
//! 3. **Every constant derives from its stated basis.** No transcribed decimal
//!    that cannot be regenerated from the named source — see the note on
//!    [`food_effusivity_lean_meat`] for why that rule is written down.
//!
//! ## Formulations
//!
//! - **Antoine saturation** — water boiling point vs absolute station pressure.
//! - **ISA-1976 barometer** — standard-atmosphere pressure vs elevation.
//! - **Transient conduction** — plane-wall one-term solution,
//!   θ* = A₁·exp(−λ₁²·Fo) with λ₁·tan λ₁ = Bi.
//! - **z-value / van 't Hoff Q10** — time scaling with temperature.
//! - **Stefan–Boltzmann** — net radiant exchange and its linearised h.
//! - **Contact effusivity** — pan/food interface temperature.
//! - **Oven convection step** — the render-loop simulation, defined ONCE.

// Plain `std`. wasm32-unknown-unknown is a std target, so `f64::powf` and
// friends resolve to the same libm the host build uses — no shim, and still no
// entry in [dependencies].

// `!(x > 0.0)` reads oddly and clippy suggests `x <= 0.0`, but the two are NOT
// equivalent: for NaN the first is true and the second is false. Every guard in
// this file is written to REFUSE NaN, and taking clippy's advice would let a
// NaN conductivity or thickness through to produce a NaN answer that looks like
// a number all the way to the UI. The lint is disabled deliberately, once, here
// — not silenced case by case where the reason would be easy to lose.
#![allow(clippy::neg_cmp_op_on_partial_ord)]

// ============================================================================
// Constants
// ============================================================================

/// Stefan–Boltzmann constant, W·m⁻²·K⁻⁴ (CODATA 2018, exact by SI definition).
pub const STEFAN_BOLTZMANN: f64 = 5.670374419e-8;

/// kPa → mmHg. 1 kPa = 7.500617 mmHg.
pub const KPA_TO_MMHG: f64 = 7.500617;

/// Antoine coefficients for water, P in mmHg and T in °C.
///
/// BASIS: Stull (1947), as tabulated in Dean, *Lange's Handbook of Chemistry*.
/// Validity 1–100 °C.
pub const ANTOINE_A: f64 = 8.07131;
pub const ANTOINE_B: f64 = 1730.63;
pub const ANTOINE_C: f64 = 233.426;

/// Lower/upper bounds of Antoine validity for water, °C.
///
/// These match `ANTOINE_MIN_C`/`ANTOINE_MAX_C` in the TypeScript half. An
/// earlier Rust draft used 0–105 °C, which is a wider envelope than the
/// coefficients support and would have let the two runtimes disagree about
/// which inputs are legal — a parity failure that no numeric comparison of
/// legal inputs could ever surface.
pub const ANTOINE_MIN_C: f64 = 1.0;
pub const ANTOINE_MAX_C: f64 = 100.0;

// ── ISA 1976 defining constants ─────────────────────────────────────────────
//
// Every one of these is a DEFINED value of the standard atmosphere, not a
// measurement, so the derived exponent below is exact arithmetic on exact
// inputs and is computed rather than transcribed.

/// Standard sea-level pressure, kPa.
pub const ISA_P0_KPA: f64 = 101.325;
/// Standard sea-level temperature, K.
pub const ISA_T0_K: f64 = 288.15;
/// Troposphere lapse rate, K·m⁻¹.
pub const ISA_LAPSE_K_PER_M: f64 = 0.0065;
/// Standard gravity, m·s⁻².
pub const ISA_G_M_S2: f64 = 9.80665;
/// Molar mass of dry air, kg·mol⁻¹.
pub const ISA_MOLAR_MASS_AIR: f64 = 0.0289644;
/// Universal gas constant **as defined by the US Standard Atmosphere 1976**,
/// J·mol⁻¹·K⁻¹.
///
/// ⚠️ NOT the CODATA value 8.31446. ISA-1976 fixes R* = 8.31432 by definition,
/// and the whole standard — including the published exponent 5.25588 — is built
/// on it. Substituting CODATA gives 5.25578, which is a different atmosphere.
pub const ISA_R_STAR: f64 = 8.31432;

/// ISA troposphere exponent, g₀·M/(R*·L) ≈ 5.2558761.
///
/// Derived, never transcribed. The published rounding is 5.25588.
pub const ISA_EXPONENT: f64 = (ISA_G_M_S2 * ISA_MOLAR_MASS_AIR) / (ISA_R_STAR * ISA_LAPSE_K_PER_M);

/// L/T₀, per metre ≈ 2.2557696e-5. Derived, never transcribed.
pub const ISA_LAPSE_RATIO: f64 = ISA_LAPSE_K_PER_M / ISA_T0_K;

/// Upper bound of the ISA troposphere model, metres.
pub const ISA_TROPOSPHERE_CEILING_M: f64 = 11_000.0;

/// Generic culinary z-value, °C — the temperature change that moves a
/// time-to-effect by one decade.
///
/// BASIS: z ≈ 5.6 °C (10 °F) for *Salmonella* in meat, USDA-FSIS lethality
/// modelling. A microbial-lethality constant; not a doneness constant.
pub const Z_VALUE_CULINARY_C: f64 = 5.6;

/// Van 't Hoff Q10 for ordinary culinary chemistry — rate roughly doubles per
/// 10 °C, equivalent to z ≈ 33.2 °C.
pub const Q10_CULINARY: f64 = 2.0;

// ── Food thermophysical properties ──────────────────────────────────────────
//
// BASIS: Singh & Heldman, *Introduction to Food Engineering*, food-property
// tables. Representative mid-range figures for lean muscle (~75 % water).

/// Thermal conductivity of lean muscle, W·m⁻¹·K⁻¹.
pub const LEAN_MEAT_K_W_M_K: f64 = 0.45;
/// Thermal diffusivity of lean muscle, m²·s⁻¹.
pub const LEAN_MEAT_ALPHA_M2_S: f64 = 1.3e-7;
/// Density of lean muscle, kg·m⁻³.
pub const LEAN_MEAT_RHO_KG_M3: f64 = 1050.0;
/// Specific heat capacity of lean muscle, J·kg⁻¹·K⁻¹.
pub const LEAN_MEAT_C_J_KG_K: f64 = 3500.0;

/// Thermal effusivity of lean muscle, √(k·ρ·c), J·m⁻²·K⁻¹·s⁻¹ᐟ².
///
/// ⚠️ DERIVED, NOT TRANSCRIBED — and that is the entire point of this comment.
/// `[MEASURED 2026-08-16]` The previous Rust constant was the literal `1286.0`
/// carrying the comment `// sqrt(0.45 * 1050 * 3500)`. That expression actually
/// evaluates to 1285.98211496116846, so the literal disagreed with the basis
/// printed beside it by 0.018 — small in absolute terms, but it meant the two
/// runtimes could never be compared for exact equality, because the TypeScript
/// half computes the square root. A constant that cannot be regenerated from
/// its own stated basis is not a constant, it is a guess with a citation.
pub fn food_effusivity_lean_meat() -> f64 {
    (LEAN_MEAT_K_W_M_K * LEAN_MEAT_RHO_KG_M3 * LEAN_MEAT_C_J_KG_K).sqrt()
}

// ============================================================================
// Unit helpers
// ============================================================================

#[inline]
pub fn c_to_f(celsius: f64) -> f64 {
    celsius * (9.0 / 5.0) + 32.0
}

#[inline]
pub fn f_to_c(fahrenheit: f64) -> f64 {
    (fahrenheit - 32.0) * (5.0 / 9.0)
}

#[inline]
pub fn c_to_k(celsius: f64) -> f64 {
    celsius + 273.15
}

/// Every way an input can fall outside a relation's stated validity.
///
/// The TypeScript half throws `RangeError` for exactly these cases. Returning a
/// typed error rather than a sentinel keeps the two halves refusing the same
/// inputs — a silent fallback on one side only is drift that no golden vector
/// of *legal* inputs can catch.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ThermoError {
    NonFinite,
    NonPositivePressure,
    OutsideAntoineRange,
    AboveTroposphere,
    NonPositiveConductivity,
    NonPositiveThickness,
    NonPositiveDiffusivity,
    NonPositiveZValue,
    TargetUnreachable,
    NegativeBiot,
}

// ============================================================================
// Boiling point vs pressure
// ============================================================================

/// Saturation temperature of water at a given absolute pressure, °C.
///
/// This is what caps every wet-heat method: boiling, steaming, simmering,
/// poaching, stewing and braising all run against the vapour-pressure curve.
///
/// `pressure_kpa` is STATION pressure, not sea-level-adjusted.
pub fn boiling_point_c(pressure_kpa: f64) -> Result<f64, ThermoError> {
    if !pressure_kpa.is_finite() {
        return Err(ThermoError::NonFinite);
    }
    if pressure_kpa <= 0.0 {
        return Err(ThermoError::NonPositivePressure);
    }
    let mm_hg = pressure_kpa * KPA_TO_MMHG;
    let denominator = ANTOINE_A - (mm_hg).log10();
    if denominator <= 0.0 {
        return Err(ThermoError::OutsideAntoineRange);
    }
    let celsius = ANTOINE_B / denominator - ANTOINE_C;
    if !(ANTOINE_MIN_C..=ANTOINE_MAX_C + 0.01).contains(&celsius) {
        return Err(ThermoError::OutsideAntoineRange);
    }
    Ok(celsius)
}

/// Station pressure in kPa at elevation `elevation_m` under ISA-1976.
pub fn pressure_from_elevation(elevation_m: f64) -> Result<f64, ThermoError> {
    if !elevation_m.is_finite() {
        return Err(ThermoError::NonFinite);
    }
    if elevation_m > ISA_TROPOSPHERE_CEILING_M {
        return Err(ThermoError::AboveTroposphere);
    }
    Ok(ISA_P0_KPA * (1.0 - ISA_LAPSE_RATIO * elevation_m).powf(ISA_EXPONENT))
}

/// Boiling point of water at a given elevation, °C.
///
/// Composes the ISA barometric formula with the Antoine curve rather than the
/// folk rule of "1 °F per 500 ft", a linearisation that drifts badly above
/// ~1500 m.
pub fn boiling_point_at_elevation(elevation_m: f64) -> Result<f64, ThermoError> {
    boiling_point_c(pressure_from_elevation(elevation_m)?)
}

/// The temperature a freely-evaporating wet food surface cannot exceed, °C.
///
/// While liquid water is leaving the surface, every extra joule goes into
/// latent heat rather than into raising temperature, so the surface pins near
/// saturation no matter how hot the oven is set. Browning therefore cannot
/// begin anywhere on that surface until it dries out locally.
pub fn evaporative_ceiling_c(pressure_kpa: f64) -> Result<f64, ThermoError> {
    boiling_point_c(pressure_kpa)
}

// ============================================================================
// Rate vs temperature
// ============================================================================

/// z-value equivalent of a Q10, in °C.
pub fn z_value_from_q10(q10: f64) -> f64 {
    10.0 / (q10).log10()
}

/// Multiplier on time-to-effect for a temperature change of `delta_c`:
/// `factor = 10^(−Δ/z)`. Negative delta (cooler) returns > 1.
pub fn time_scale_factor(delta_c: f64, z_value_c: f64) -> Result<f64, ThermoError> {
    if !(z_value_c > 0.0) {
        return Err(ThermoError::NonPositiveZValue);
    }
    Ok(10.0_f64.powf(-delta_c / z_value_c))
}

/// Which rate law governs an altitude correction.
///
/// ⚠️ THE REGIME IS THE WHOLE ANSWER, which is why it is a required argument
/// rather than a default. At Denver (1609 m, ceiling 94.7 °C):
///
///   `Softening`      (ordinary chemistry, z ≈ 33.2 °C)  →  ×1.4
///   `Pasteurisation` (microbial lethality, z = 5.6 °C)   →  ×9.0
///
/// Both are correct for their own question, and a single blended number would
/// be wrong for both.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AltitudeRegime {
    Softening,
    Pasteurisation,
}

/// How much longer a boil-limited method takes at elevation, as a multiplier.
///
/// Applies ONLY to methods whose rate is set by the water ceiling. A 425 °F
/// oven does not care about altitude this way — its air temperature is
/// unchanged; what shifts is evaporative surface behaviour.
pub fn altitude_time_multiplier(
    elevation_m: f64,
    regime: AltitudeRegime,
) -> Result<f64, ThermoError> {
    let z = match regime {
        AltitudeRegime::Pasteurisation => Z_VALUE_CULINARY_C,
        AltitudeRegime::Softening => z_value_from_q10(Q10_CULINARY),
    };
    let sea_level = boiling_point_at_elevation(0.0)?;
    let at_altitude = boiling_point_at_elevation(elevation_m)?;
    time_scale_factor(at_altitude - sea_level, z)
}

// ============================================================================
// Transient conduction — the one-term slab solution
// ============================================================================

/// Biot number: internal conduction resistance vs surface convection resistance.
///
/// Bi ≪ 0.1 → the food is thermally "thin"; the surroundings set the pace.
/// Bi ≫ 1 → conduction inside the food dominates, and past a point a hotter
/// oven only burns the outside faster.
pub fn biot_number(
    h_w_m2_k: f64,
    half_thickness_m: f64,
    k_w_m_k: f64,
) -> Result<f64, ThermoError> {
    if !(k_w_m_k > 0.0) {
        return Err(ThermoError::NonPositiveConductivity);
    }
    Ok((h_w_m2_k * half_thickness_m) / k_w_m_k)
}

/// First eigenvalue λ₁ of the plane-wall transient solution, solving
/// `λ·tan λ = Bi` on (0, π/2).
///
/// Bisection, 200 iterations. Monotone on the interval, so convergence is
/// guaranteed; the iteration count matches the TypeScript half exactly because
/// a different count is a different last-bit answer.
pub fn slab_eigenvalue(biot: f64) -> Result<f64, ThermoError> {
    if !(biot >= 0.0) {
        return Err(ThermoError::NegativeBiot);
    }
    if biot == 0.0 {
        return Ok(0.0);
    }
    let mut lo = 0.0_f64;
    let mut hi = std::f64::consts::FRAC_PI_2 - 1e-12;
    for _ in 0..200 {
        let mid = (lo + hi) / 2.0;
        if mid * (mid).tan() < biot {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    Ok((lo + hi) / 2.0)
}

/// Leading coefficient A₁ of the plane-wall one-term solution.
pub fn slab_coefficient(lambda1: f64) -> f64 {
    if lambda1 == 0.0 {
        return 1.0;
    }
    (4.0 * (lambda1).sin()) / (2.0 * lambda1 + (2.0 * lambda1).sin())
}

/// Inputs to [`slab_core_time`].
#[derive(Debug, Clone, Copy)]
pub struct SlabCookInput {
    /// Full thickness of the piece, millimetres.
    pub thickness_mm: f64,
    /// Medium temperature (oven air, bath water, oil), °C.
    pub medium_c: f64,
    /// Starting core temperature, °C.
    pub initial_c: f64,
    /// Target core temperature, °C.
    pub target_c: f64,
    /// Surface heat transfer coefficient, W·m⁻²·K⁻¹.
    pub h_w_m2_k: f64,
    /// Thermal conductivity of the food, W·m⁻¹·K⁻¹.
    pub k_w_m_k: f64,
    /// Thermal diffusivity of the food, m²·s⁻¹.
    pub alpha_m2_s: f64,
    /// Heated from one face only (a pan, a plancha) rather than all round.
    pub one_sided: bool,
}

impl SlabCookInput {
    /// A 25 mm slab of lean muscle with the library's default food properties.
    pub fn lean_meat(
        thickness_mm: f64,
        medium_c: f64,
        initial_c: f64,
        target_c: f64,
        h_w_m2_k: f64,
    ) -> Self {
        Self {
            thickness_mm,
            medium_c,
            initial_c,
            target_c,
            h_w_m2_k,
            k_w_m_k: LEAN_MEAT_K_W_M_K,
            alpha_m2_s: LEAN_MEAT_ALPHA_M2_S,
            one_sided: false,
        }
    }
}

/// Result of [`slab_core_time`].
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SlabCookResult {
    /// Time for the core to reach the target, minutes.
    pub minutes: f64,
    pub biot: f64,
    /// Fourier number at the answer. The one-term series is valid for Fo > 0.2.
    pub fourier: f64,
    /// False when Fo ≤ 0.2 — the truncation understates the early transient.
    pub one_term_valid: bool,
    pub lambda1: f64,
    pub coefficient_a1: f64,
}

/// Time for the CENTRE of a slab to reach a target temperature.
///
/// Textbook one-term approximation to the plane-wall transient conduction
/// solution with convective boundaries (Incropera & DeWitt, *Fundamentals of
/// Heat and Mass Transfer*, §5.5):
///
/// > θ* = A₁·exp(−λ₁²·Fo),  λ₁·tan λ₁ = Bi,  Fo = α·t/L²
///
/// LIMITS. A real steak is not an infinite slab, a roast is closer to a
/// cylinder, and neither is isotropic. This answers "how does time scale with
/// thickness, medium temperature and transfer coefficient", not "exactly when
/// is dinner ready". Never present it without its assumptions.
pub fn slab_core_time(input: SlabCookInput) -> Result<SlabCookResult, ThermoError> {
    if !(input.thickness_mm > 0.0) {
        return Err(ThermoError::NonPositiveThickness);
    }
    if !(input.alpha_m2_s > 0.0) {
        return Err(ThermoError::NonPositiveDiffusivity);
    }

    // Symmetric heating makes the mid-plane adiabatic, so the conduction path
    // is half the thickness. Heated from one face, the path is the full
    // thickness.
    let half_thickness_m = (input.thickness_mm / 1000.0) * if input.one_sided { 1.0 } else { 0.5 };

    let theta_target = (input.target_c - input.medium_c) / (input.initial_c - input.medium_c);
    if !(theta_target > 0.0) {
        return Err(ThermoError::TargetUnreachable);
    }

    let biot = biot_number(input.h_w_m2_k, half_thickness_m, input.k_w_m_k)?;
    let lambda1 = slab_eigenvalue(biot)?;
    let coefficient_a1 = slab_coefficient(lambda1);

    let fourier = -(theta_target / coefficient_a1).ln() / (lambda1 * lambda1);
    let seconds = (fourier * half_thickness_m * half_thickness_m) / input.alpha_m2_s;

    Ok(SlabCookResult {
        minutes: seconds / 60.0,
        biot,
        fourier,
        one_term_valid: fourier > 0.2,
        lambda1,
        coefficient_a1,
    })
}

// ============================================================================
// Radiation
// ============================================================================

/// Net radiant flux onto a food surface, kW·m⁻².
///
/// This is the quantity that separates grilling and broiling from every other
/// dry-heat method. A charcoal bed at ~1200 K delivers on the order of
/// 100 kW·m⁻²; a 450 °F oven wall delivers about 3. The 30× gap — not the air
/// temperature — is why one chars in ninety seconds and the other browns in
/// twenty minutes.
///
/// NOTE the multiplication order `ε·F·(σ·Δ)` is deliberate and matches the
/// TypeScript half. Floating-point multiplication is not associative, so
/// `σ·Δ·ε·F` can differ in the last bit — which is exactly the kind of
/// difference an exact-equality parity test is built to catch.
pub fn radiant_flux_kw_m2(
    source_k: f64,
    surface_k: f64,
    emissivity: f64,
    view_factor: f64,
) -> f64 {
    let net = STEFAN_BOLTZMANN * (source_k.powi(4) - surface_k.powi(4));
    (emissivity * view_factor * net) / 1000.0
}

/// Effective radiative heat transfer coefficient, W·m⁻²·K⁻¹.
///
/// Linearises radiation about the current temperatures so it can be added to a
/// convective h and fed to the slab solution:
/// `h_rad = ε·σ·(T_s² + T_∞²)·(T_s + T_∞)`.
pub fn radiative_h(source_k: f64, surface_k: f64, emissivity: f64) -> f64 {
    emissivity
        * STEFAN_BOLTZMANN
        * (source_k * source_k + surface_k * surface_k)
        * (source_k + surface_k)
}

// ============================================================================
// Contact mechanics
// ============================================================================

/// Thermal effusivity √(k·ρ·c) — how hard a material fights to hold its own
/// surface temperature when something colder touches it.
pub fn effusivity(k_w_m_k: f64, rho_kg_m3: f64, c_j_kg_k: f64) -> f64 {
    (k_w_m_k * rho_kg_m3 * c_j_kg_k).sqrt()
}

/// Instantaneous contact interface temperature between two semi-infinite
/// bodies, °C: `T = (e₁T₁ + e₂T₂)/(e₁ + e₂)`.
///
/// This is why a stainless pan and a copper pan at the same dial setting are
/// not the same sear: the interface the food actually meets differs by more
/// than 20 °C.
pub fn contact_temperature_c(
    pan_c: f64,
    food_c: f64,
    pan_effusivity: f64,
    food_effusivity: f64,
) -> f64 {
    let denom = pan_effusivity + food_effusivity;
    if denom <= 0.0 {
        return pan_c;
    }
    (pan_effusivity * pan_c + food_effusivity * food_c) / denom
}

// ============================================================================
// Wet bulb
// ============================================================================

/// Validity envelope actually used for the Stull wet-bulb fit, °C.
///
/// Narrower than the paper's stated −20…50 °C. `[MEASURED 2026-08-16]` sweeping
/// the fit over 5–99 % RH, the returned wet bulb EXCEEDS the dry bulb — which
/// is thermodynamically impossible, since the wet bulb is an evaporative
/// minimum — below about −12 °C.
pub const STULL_MIN_C: f64 = -10.0;
pub const STULL_MAX_C: f64 = 50.0;

/// Wet-bulb temperature from dry-bulb and relative humidity, °C.
///
/// BASIS: Stull (2011), *J. Appl. Meteorol. Climatol.* 50(11). Empirical fit,
/// stated accuracy ±1 °C over −20…50 °C and 5–99 % RH at sea level. Returns
/// `None` outside the envelope rather than extrapolating.
///
/// ⚠️ DO NOT REACH FOR THIS AT OVEN TEMPERATURES. At a 175 °C dry bulb and
/// 100 % RH the fit returns 176.1 °C — above the dry bulb, which is impossible.
/// For the oven case the correct statement is [`evaporative_ceiling_c`].
pub fn wet_bulb_c(dry_bulb_c: f64, relative_humidity_pct: f64) -> Option<f64> {
    if !(STULL_MIN_C..=STULL_MAX_C).contains(&dry_bulb_c) {
        return None;
    }
    let rh = relative_humidity_pct.clamp(5.0, 99.0);
    let t = dry_bulb_c;
    let fitted = t * (0.151977 * (rh + 8.313659).sqrt()).atan() + (t + rh).atan()
        - (rh - 1.676331).atan()
        + 0.00391838 * rh.powf(1.5) * (0.023101 * rh).atan()
        - 4.686035;
    // Enforce the physical constraint the regression does not know about.
    Some(if fitted < t { fitted } else { t })
}

// ============================================================================
// Oven convection simulation — the render loop
// ============================================================================

/// Buoyant acceleration per kelvin of superheat above room temperature.
///
/// `[MEASURED 2026-08-16]` This value is now defined ONCE. Before this crate,
/// `spacetime-module/src/thermo.rs` used `(T−20)·0.005` scaled again by 0.1
/// (an effective 0.0005·ΔT) while the TypeScript canvas loop used 0.003·ΔT —
/// a 6× disagreement at a 175 °C oven (0.0775 vs 0.465). Since the browser
/// falls back to the TypeScript loop whenever the WASM module fails to load,
/// that difference was not academic: the "graceful degradation" path would have
/// silently rendered a visibly different simulation from the one it degraded
/// from, with no error anywhere to say so.
pub const BUOYANCY_PER_K: f32 = 0.003;

/// Swirl acceleration amplitude for the convection roll.
pub const SWIRL_AMPLITUDE: f32 = 0.4;

/// Per-step velocity retention (viscous drag against the oven air).
pub const CONVECTION_DRAG: f32 = 0.98;

/// Number of floats each particle occupies in the shared linear-memory buffer:
/// `[x, y, z, vx, vy, vz, temp_c, radiant_intensity]`.
pub const FLOATS_PER_PARTICLE: usize = 8;

/// A single convection tracer in the oven chamber.
#[derive(Debug, Clone, Copy, Default)]
pub struct ConvectionParticle {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub vx: f32,
    pub vy: f32,
    pub vz: f32,
    pub temp_c: f32,
    pub radiant_intensity: f32,
}

/// Advance the oven convection simulation by `dt_s` seconds.
///
/// Pure: it reads and writes only `particles`. This is what both the WASM
/// engine and (transliterated) the TypeScript fallback execute, so the two
/// render the same thing.
///
/// The model is a visualisation, not a CFD solve — a buoyancy-driven swirl with
/// drag, plus a Newton-cooling temperature approach whose rate is set by the
/// method's real `h`. It is honest about what it shows: hotter ovens circulate
/// faster, high-`h` media equilibrate a tracer faster.
pub fn step_oven_simulation(
    particles: &mut [ConvectionParticle],
    dt_s: f32,
    oven_temp_c: f32,
    h_w_m2_k: f32,
    radiant_source_k: f32,
) {
    let buoyancy = (oven_temp_c - 20.0).max(0.0) * BUOYANCY_PER_K;

    for (i, p) in particles.iter_mut().enumerate() {
        let phase = p.x * 2.0 + p.z * 3.0 + (i as f32) * 0.1;
        let swirl_x = sin_f32(phase) * SWIRL_AMPLITUDE;
        let swirl_z = cos_f32(phase) * SWIRL_AMPLITUDE;

        p.vx = (p.vx + swirl_x * dt_s) * CONVECTION_DRAG;
        p.vy = (p.vy + buoyancy * dt_s) * CONVECTION_DRAG;
        p.vz = (p.vz + swirl_z * dt_s) * CONVECTION_DRAG;

        p.x += p.vx * dt_s;
        p.y += p.vy * dt_s;
        p.z += p.vz * dt_s;

        // Wrap into the 1×1×1 render box.
        if p.y > 1.0 {
            p.y = 0.0;
        }
        if p.x < -1.0 {
            p.x = 1.0;
        }
        if p.x > 1.0 {
            p.x = -1.0;
        }
        if p.z < -1.0 {
            p.z = 1.0;
        }
        if p.z > 1.0 {
            p.z = -1.0;
        }

        // Newton cooling toward the medium, paced by the method's own h.
        p.temp_c += (oven_temp_c - p.temp_c) * (h_w_m2_k * 0.001) * dt_s;

        // Radiative glow, Stefan–Boltzmann's fourth power in normalised units.
        let r = radiant_source_k / 1000.0;
        let quartic = r * r * r * r * 0.25;
        p.radiant_intensity = if quartic < 1.0 { quartic } else { 1.0 };
    }
}

/// The deterministic particle seed, defined ONCE.
///
/// Closed form in the index with no RNG anywhere, which is what makes the
/// simulation comparable across runtimes at all: a random seed would leave the
/// WASM engine and the TypeScript fallback with nothing to compare. The
/// TypeScript transliteration is `seedParticles` in
/// `src/lib/wasm/thermoEngine.ts`, and the golden trace pins them together.
pub fn seeded_particles(n: usize) -> Vec<ConvectionParticle> {
    (0..n)
        .map(|i| {
            let f = i as f32;
            ConvectionParticle {
                x: ((f * 0.37) % 2.0) - 1.0,
                y: (f * 0.191) % 1.0,
                z: ((f * 0.53) % 2.0) - 1.0,
                vx: 0.0,
                vy: 0.0,
                vz: 0.0,
                temp_c: 20.0 + (f * 0.7) % 50.0,
                radiant_intensity: 0.0,
            }
        })
        .collect()
}

#[inline]
fn sin_f32(x: f32) -> f32 {
    (x as f64).sin() as f32
}

#[inline]
fn cos_f32(x: f32) -> f32 {
    (x as f64).cos() as f32
}

#[cfg(test)]
mod tests;
