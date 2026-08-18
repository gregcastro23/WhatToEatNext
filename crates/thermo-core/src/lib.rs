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
    /// Outside a correlation's published fit range, or a fraction outside [0, 1].
    ///
    /// Extrapolating a polynomial fit is not a smaller error than refusing — it
    /// is a different curve, and it returns a number that looks like an answer.
    OutsideCorrelationRange,
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

// ============================================================================
// Geometry — the one-term solution for cylinders and spheres
// ============================================================================

/// The three shapes the one-term transient solution is defined for.
///
/// A steak is a slab, a roast or a carrot is a cylinder, a meatball or a
/// potato is a sphere. The distinction is not cosmetic: at the same Biot
/// number a sphere cores in roughly a third the Fourier time of a slab,
/// because it is fed from three directions instead of one.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FoodGeometry {
    Slab,
    Cylinder,
    Sphere,
}

/// Number of terms in the Bessel series below.
///
/// FIXED, not convergence-tested. A loop that exits when a term stops mattering
/// is free to exit after a different number of iterations in a different
/// runtime, and that is a last-bit difference the parity test exists to catch.
///
/// `[MEASURED 2026-08-17]` At the worst-case argument this file can produce —
/// x = j₀,₁ = 2.4048, the ceiling of the cylinder eigenvalue search — J₀
/// reaches its final bits at 19 terms and J₁ at 11. 30 therefore carries an
/// 11-term margin over the binding case. Reproduce by sweeping the term count
/// against a 60-term reference; `bessel_series_matches_the_fixture_bit_exactly`
/// fails below 19, which is what pins this number as a measurement rather than
/// a guess.
const BESSEL_TERMS: u32 = 30;

/// Bessel function of the first kind, order 0, by the ascending power series
///
/// > J₀(x) = Σ (−1)ᵐ (x/2)²ᵐ / (m!)²
///
/// BASIS: Abramowitz & Stegun, *Handbook of Mathematical Functions*, 9.1.10.
///
/// VALIDITY. The series is exact for all x but loses precision to cancellation
/// once x grows past roughly 10. That is not a limit here: the only argument
/// this file ever passes is a cylinder's first eigenvalue, which lies in
/// (0, j₀,₁ ≈ 2.4048]. Do not reach for this as a general-purpose J₀.
///
/// ⚠️ `std` has no Bessel function and the `libm` crate's would reintroduce the
/// glibc-vs-macOS drift already logged against this workspace. This series uses
/// `+ − × ÷` only — no transcendental — which is what makes bit-exact agreement
/// with the TypeScript half achievable. The operation order below is load
/// bearing and must not be "simplified".
pub fn bessel_j0(x: f64) -> f64 {
    let half = x / 2.0;
    let half_sq = half * half;
    let mut term = 1.0_f64;
    let mut sum = 1.0_f64;
    for m in 1..=BESSEL_TERMS {
        let m = f64::from(m);
        term = (-term * half_sq) / (m * m);
        sum += term;
    }
    sum
}

/// Bessel function of the first kind, order 1, by the ascending power series
///
/// > J₁(x) = Σ (−1)ᵐ (x/2)²ᵐ⁺¹ / (m!·(m+1)!)
///
/// BASIS: Abramowitz & Stegun 9.1.10. Same validity envelope and the same
/// reasoning about determinism as [`bessel_j0`].
pub fn bessel_j1(x: f64) -> f64 {
    let half = x / 2.0;
    let half_sq = half * half;
    let mut term = half;
    let mut sum = half;
    for m in 1..=BESSEL_TERMS {
        let m = f64::from(m);
        term = (-term * half_sq) / (m * (m + 1.0));
        sum += term;
    }
    sum
}

/// The first zero of J₀. Bounds the cylinder's λ₁, and therefore bounds every
/// argument [`bessel_j0`] is ever asked for.
pub const BESSEL_J0_FIRST_ZERO: f64 = 2.404825557695773;

impl FoodGeometry {
    /// Upper bound of the first eigenvalue as Bi → ∞.
    fn eigenvalue_ceiling(self) -> f64 {
        match self {
            // λ·tan λ → ∞ at π/2.
            FoodGeometry::Slab => std::f64::consts::FRAC_PI_2,
            FoodGeometry::Cylinder => BESSEL_J0_FIRST_ZERO,
            // 1 − λ·cot λ → ∞ at π.
            FoodGeometry::Sphere => std::f64::consts::PI,
        }
    }

    /// The transcendental whose root is λ₁, written as `f(λ) − Bi`.
    ///
    /// Each is monotone increasing on (0, ceiling), which is what lets a plain
    /// bisection find the root without a derivative and without the
    /// possibility of landing on a higher branch.
    ///
    ///   slab      λ·tan λ        = Bi
    ///   cylinder  λ·J₁(λ)/J₀(λ)  = Bi
    ///   sphere    1 − λ·cot λ    = Bi
    ///
    /// ⚠️ THE SPHERE IS WRITTEN MULTIPLIED THROUGH BY sin λ, DELIBERATELY.
    ///
    /// `[MEASURED 2026-08-17]` Written the direct way — `1 − λ/tan λ − Bi` —
    /// this crate and the TypeScript half disagreed by **32 ULP** on λ₁ at
    /// Bi = 0.001, four times the measured budget for the whole rest of the
    /// fixture. The cause is conditioning, not a wrong formula: the residual's
    /// slope at the root collapses to 3.65e-2 at Bi = 0.001 against 1.57 at
    /// Bi = 1, so a last-bit disagreement in `tan` is amplified by roughly
    /// forty. Multiplying through by sin λ removes the division and trades
    /// `tan` for `sin` and `cos`, which agree between the two libms where `tan`
    /// does not: the same 27 vectors then reproduce at **0 ULP** on this host,
    /// for all three geometries.
    ///
    /// The root is unchanged — sin λ > 0 on (0, π), so multiplying by it moves
    /// no sign and therefore moves no bisection step. Do not "simplify" this
    /// back to the cot form; it is the shape of the expression that is load
    /// bearing.
    fn eigenvalue_residual(self, lambda: f64, biot: f64) -> f64 {
        match self {
            FoodGeometry::Slab => lambda * lambda.tan() - biot,
            FoodGeometry::Cylinder => (lambda * bessel_j1(lambda)) / bessel_j0(lambda) - biot,
            FoodGeometry::Sphere => (1.0 - biot) * lambda.sin() - lambda * lambda.cos(),
        }
    }

    /// Characteristic length Lc = V/A, in units of the shape's own
    /// half-dimension.
    ///
    /// This is the volumetric statement of why shape changes cooking time. For
    /// a slab of half-thickness L the conduction path is L itself; a cylinder
    /// of radius R behaves as R/2 and a sphere as R/3, because each has more
    /// surface feeding the same volume. It is also exactly the ratio that makes
    /// a diced vegetable cook faster than a whole one at identical thickness.
    pub fn characteristic_length_ratio(self) -> f64 {
        match self {
            FoodGeometry::Slab => 1.0,
            FoodGeometry::Cylinder => 1.0 / 2.0,
            FoodGeometry::Sphere => 1.0 / 3.0,
        }
    }
}

/// First eigenvalue λ₁ of the one-term transient solution for a given shape.
///
/// Bisection, 200 iterations, matching [`slab_eigenvalue`] exactly — the
/// iteration count is part of the answer, not an implementation detail, because
/// a different count is a different last bit.
///
/// BASIS: Incropera & DeWitt, *Fundamentals of Heat and Mass Transfer*,
/// Table 5.1 and §5.5.
pub fn geometry_eigenvalue(geometry: FoodGeometry, biot: f64) -> Result<f64, ThermoError> {
    if !(biot >= 0.0) {
        return Err(ThermoError::NegativeBiot);
    }
    if biot == 0.0 {
        return Ok(0.0);
    }
    let mut lo = 0.0_f64;
    let mut hi = geometry.eigenvalue_ceiling() - 1e-12;
    for _ in 0..200 {
        let mid = (lo + hi) / 2.0;
        if geometry.eigenvalue_residual(mid, biot) < 0.0 {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    Ok((lo + hi) / 2.0)
}

/// Leading coefficient A₁ of the one-term solution for a given shape.
///
/// BASIS: Incropera & DeWitt, Table 5.1.
///
///   slab      4 sin λ / (2λ + sin 2λ)
///   cylinder  (2/λ)·J₁(λ) / (J₀²(λ) + J₁²(λ))
///   sphere    4(sin λ − λ cos λ) / (2λ − sin 2λ)
pub fn geometry_coefficient(geometry: FoodGeometry, lambda1: f64) -> f64 {
    if lambda1 == 0.0 {
        return 1.0;
    }
    match geometry {
        FoodGeometry::Slab => slab_coefficient(lambda1),
        FoodGeometry::Cylinder => {
            let j0 = bessel_j0(lambda1);
            let j1 = bessel_j1(lambda1);
            ((2.0 / lambda1) * j1) / (j0 * j0 + j1 * j1)
        }
        FoodGeometry::Sphere => {
            (4.0 * (lambda1.sin() - lambda1 * lambda1.cos()))
                / (2.0 * lambda1 - (2.0 * lambda1).sin())
        }
    }
}

/// Surface-area-to-volume ratio, m⁻¹, for a piece of the given shape.
///
/// `half_dimension_m` is the half-thickness for a slab, the radius otherwise.
pub fn surface_area_to_volume(
    geometry: FoodGeometry,
    half_dimension_m: f64,
) -> Result<f64, ThermoError> {
    if !(half_dimension_m > 0.0) {
        return Err(ThermoError::NonPositiveThickness);
    }
    Ok(1.0 / (half_dimension_m * geometry.characteristic_length_ratio()))
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
/// `[x, y, z, vx, vy, vz, temp_c, radiant_intensity, phase_frac]`.
pub const FLOATS_PER_PARTICLE: usize = 9;

/// Room temperature, °C — the reference the buoyant ΔT is taken against.
///
/// Was an unnamed `20.0` inside the step. Naming it is what makes the sign of
/// ΔT legible: a medium BELOW this figure gives a negative buoyancy and the
/// tracer sinks, which is the entire behaviour of [`HeatRegime::Cryogenic`].
pub const RENDER_AMBIENT_C: f32 = 20.0;

/// Extra velocity a phase-change tracer carries along its transition direction.
///
/// A SCENE constant: it sets how fast a detaching bubble outruns the bulk flow
/// it was born in. Ordered against [`SWIRL_AMPLITUDE`] so nucleation reads as
/// the faster motion, which is what a rolling boil looks like.
pub const VAPOUR_TRANSIT: f32 = 0.55;

// ============================================================================
// Heat-flow regimes
// ============================================================================

/// How a medium actually moves heat, as a motion model the render loop can run.
///
/// ## Why this enum exists
///
/// `[MEASURED 2026-08-17]` Before it, `step_oven_simulation` was the ONLY
/// simulation, and the canvas drew one scene — a dry oven chamber with a top
/// radiant rod — for every method in the corpus. The three scalars that varied
/// (medium temperature, `h`, radiant source) could not change what the picture
/// asserted, so:
///
///   * `boiling`, `steaming` and `pressure_cooking` were drawn as dry ovens
///     with a glowing element and no water anywhere;
///   * `cryo_cooking` at −196 °C was drawn as a hot amber chamber, because
///     buoyancy was `max(0, T − 20)` and a cryogen simply clamped to zero
///     instead of sinking;
///   * `grilling` (radiation 0.70) and `roasting` (radiation 0.40) were drawn
///     with identical radiant rays.
///
/// The physics to tell these apart was already in the repository —
/// `MethodPhysicsProfile::medium_kind` and `modes` — and none of it reached the
/// simulation. This enum is the channel.
///
/// The discriminants are stable: they cross an FFI boundary as `u8` and are
/// pinned by the golden vectors.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum HeatRegime {
    /// Hot air rising off the food and the chamber walls. Dry-air media.
    BuoyantAir = 0,
    /// Hot fat: buoyant like air, but ~40× more viscous, and carrying the
    /// steam boiling OUT of the food's surface.
    Oil = 1,
    /// Saturated water below its own vapour ceiling — a rolling boil, with
    /// vapour nucleating on the heated floor and rising through the column.
    RollingBoil = 2,
    /// Steam condensing ONTO the food. The mass flux is inward and downward,
    /// the opposite direction from every other hot regime.
    CondensingSteam = 3,
    /// Water held below boiling. Gentle convection, no nucleation.
    StillLiquid = 4,
    /// Radiation-dominated. The medium barely matters; photons travel in
    /// straight lines from a glowing source and the food shadows itself.
    Radiant = 5,
    /// A hot solid interface. Almost no medium motion — the action is a
    /// conduction front propagating into the food from the contact face.
    SolidContact = 6,
    /// A cryogen. Heat flows OUT of the food, and the cold dense vapour SINKS.
    Cryogenic = 7,
    /// No heat flow worth animating: the method is limited by mass transfer or
    /// microbial growth. Solute migrates across a boundary instead.
    Diffusion = 8,
    /// Evaporation, transport, and condensation on a cool surface.
    Distillation = 9,
}

impl HeatRegime {
    /// Round-trip from the wire representation. Unknown values are refused
    /// rather than defaulted: a silent fall back to `BuoyantAir` is exactly the
    /// failure this enum was added to remove.
    pub fn from_u8(v: u8) -> Option<HeatRegime> {
        match v {
            0 => Some(HeatRegime::BuoyantAir),
            1 => Some(HeatRegime::Oil),
            2 => Some(HeatRegime::RollingBoil),
            3 => Some(HeatRegime::CondensingSteam),
            4 => Some(HeatRegime::StillLiquid),
            5 => Some(HeatRegime::Radiant),
            6 => Some(HeatRegime::SolidContact),
            7 => Some(HeatRegime::Cryogenic),
            8 => Some(HeatRegime::Diffusion),
            9 => Some(HeatRegime::Distillation),
            _ => None,
        }
    }
}

// ── Volumetric thermal expansion, K⁻¹ ───────────────────────────────────────
//
// β is what actually sets buoyant acceleration in a Boussinesq fluid:
// a = g·β·ΔT. It is the reason a pot of water and an oven full of air circulate
// at such different rates at the same superheat, and it is the only physical
// input separating the convective regimes below.
//
// BASIS: Incropera & DeWitt, *Fundamentals of Heat and Mass Transfer*,
// thermophysical property tables — Table A.4 (air) and Table A.6 (saturated
// water), each read at the film temperature the regime actually runs at.

/// Air at 450 K (a 175 °C oven), K⁻¹. An ideal gas, so β ≡ 1/T exactly.
///
/// DERIVED, not transcribed — see [`food_effusivity_lean_meat`] for why that
/// distinction is written down in this crate.
pub const BETA_AIR_OVEN: f32 = 1.0 / 450.0;

/// Saturated water at 360 K (a simmer), K⁻¹. Incropera Table A.6: 697.9×10⁻⁶.
pub const BETA_WATER_HOT: f32 = 697.9e-6;

/// Triglyceride frying oil near 450 K, K⁻¹.
///
/// BASIS: measured volumetric expansion of vegetable oils, ~7×10⁻⁴ K⁻¹ over
/// culinary frying temperatures. Nearly equal to hot water's β, which is the
/// point worth seeing: oil does not out-circulate water — it out-*wets* it.
pub const BETA_OIL: f32 = 7.0e-4;

/// Saturated liquid nitrogen at 77 K, K⁻¹.
///
/// BASIS: NIST Chemistry WebBook, nitrogen saturated-liquid line. Cryogens
/// expand roughly an order of magnitude harder than room-temperature liquids,
/// which is why a cryogen's vapour stratifies as aggressively as it does.
pub const BETA_LN2: f32 = 5.7e-3;

/// Standard gravity in the units the ISA block already fixes, m·s⁻².
const G_M_S2_F32: f32 = ISA_G_M_S2 as f32;

/// Render-box units per metre of physical displacement.
///
/// ⚠️ DEFINED so that [`BUOYANCY_PER_K`] keeps the exact value it shipped with.
/// It is a SCENE constant, not a measurement: the simulation draws into a
/// 1×1×1 box that corresponds to no particular oven. Deriving it backwards from
/// the one buoyancy constant that already existed is what lets every other
/// regime be computed from its own β while the pre-existing golden trace stays
/// byte-for-byte unchanged — the evidence that adding regimes did not perturb
/// the model that was already shipping.
pub const SCENE_SCALE: f32 = BUOYANCY_PER_K / (G_M_S2_F32 * BETA_AIR_OVEN);

/// Buoyant acceleration per kelvin for a fluid of expansion coefficient β,
/// in render-box units.
#[inline]
pub fn buoyancy_for_beta(beta_per_k: f32) -> f32 {
    G_M_S2_F32 * beta_per_k * SCENE_SCALE
}

/// The motion parameters one regime runs with.
///
/// ## What is physical here and what is not
///
/// `buoyancy_per_k` and `cooling_sign` are physics: the first is g·β·[`SCENE_SCALE`]
/// for the regime's own fluid, the second is the direction heat actually flows.
/// `swirl`, `drag` and `nucleation_per_s` are SCENE parameters — this is a
/// visualisation, not a CFD solve, and the crate says so. They are ordered by
/// the fluid's kinematic viscosity and by whether the regime has a phase change
/// at all, so the ranking between regimes is meaningful even though no single
/// value is a measurement.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct RegimeParams {
    /// Buoyant acceleration per kelvin of superheat, render units·s⁻².
    pub buoyancy_per_k: f32,
    /// Amplitude of the standing convection roll.
    pub swirl: f32,
    /// Per-step velocity retention. Lower is more viscous.
    pub drag: f32,
    /// Phase-change tracers born per second, per particle. Zero where the
    /// regime has no phase change to show.
    pub nucleation_per_s: f32,
    /// Which way the phase-change tracers travel: `+1` rise (vapour leaving),
    /// `-1` fall (condensate landing), `0` none.
    pub nucleation_dir: f32,
    /// Sign of the heat flow relative to the food. `+1` the medium heats the
    /// food, `-1` the food is being cooled, `0` no heat flow worth animating.
    pub cooling_sign: f32,
}

/// Motion parameters for a regime.
///
/// `const` so the WASM engine, the SpacetimeDB module and the TypeScript
/// transliteration cannot disagree about a regime by accident.
pub fn regime_params(regime: HeatRegime) -> RegimeParams {
    match regime {
        // The shipped model, unchanged. Every constant here is the one the
        // pre-existing golden trace was generated from.
        HeatRegime::BuoyantAir => RegimeParams {
            buoyancy_per_k: BUOYANCY_PER_K,
            swirl: SWIRL_AMPLITUDE,
            drag: CONVECTION_DRAG,
            nucleation_per_s: 0.0,
            nucleation_dir: 0.0,
            cooling_sign: 1.0,
        },
        // Oil: β close to water's, but ν ≈ 40× air at frying temperature, so
        // the roll is slower to build and slower to die. The nucleation here is
        // NOT the oil boiling — it is the food's own moisture leaving, which is
        // why `frying` carries phaseChange 0.35 with moistureFlux out-of-food.
        HeatRegime::Oil => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_OIL),
            swirl: 0.22,
            drag: 0.94,
            nucleation_per_s: 1.6,
            nucleation_dir: 1.0,
            cooling_sign: 1.0,
        },
        // A rolling boil is the most vigorous regime in the kitchen: vapour
        // nucleates on the heated floor and drags the column with it.
        HeatRegime::RollingBoil => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_WATER_HOT),
            swirl: 0.30,
            drag: 0.965,
            nucleation_per_s: 3.2,
            nucleation_dir: 1.0,
            cooling_sign: 1.0,
        },
        // Condensation runs the other way: vapour arrives, gives up its latent
        // heat at the food surface, and runs back down as liquid. Steaming's
        // h ≈ 9000 is three times boiling's precisely because this transition
        // is happening ON the food.
        HeatRegime::CondensingSteam => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_WATER_HOT) * 0.5,
            swirl: 0.16,
            drag: 0.97,
            nucleation_per_s: 2.4,
            nucleation_dir: -1.0,
            cooling_sign: 1.0,
        },
        // Below the ceiling there is nothing to nucleate. Sous-vide, poaching
        // and infusing are quiet on purpose — the stillness IS the method.
        HeatRegime::StillLiquid => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_WATER_HOT),
            swirl: 0.09,
            drag: 0.95,
            nucleation_per_s: 0.0,
            nucleation_dir: 0.0,
            cooling_sign: 1.0,
        },
        // Radiation does not need a fluid. The little motion left is the plume
        // the hot food itself drives.
        HeatRegime::Radiant => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_AIR_OVEN) * 0.6,
            swirl: 0.12,
            drag: 0.96,
            nucleation_per_s: 0.0,
            nucleation_dir: 0.0,
            cooling_sign: 1.0,
        },
        // A plancha has no convection story worth telling. What moves is the
        // conduction front, and that is drawn from the transient solution
        // rather than from tracers.
        HeatRegime::SolidContact => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_AIR_OVEN) * 0.25,
            swirl: 0.06,
            drag: 0.93,
            nucleation_per_s: 0.5,
            nucleation_dir: 1.0,
            cooling_sign: 1.0,
        },
        // ⚠️ The regime the old model could not express at all. ΔT is negative,
        // so the vapour is DENSER than the room and sinks; `max(0, ΔT)` pinned
        // this to a dead calm and the canvas painted it hot anyway.
        HeatRegime::Cryogenic => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_LN2),
            swirl: 0.14,
            drag: 0.985,
            nucleation_per_s: 2.0,
            nucleation_dir: 1.0,
            cooling_sign: -1.0,
        },
        // No heat flow. These methods are limited by how fast a solute crosses
        // a boundary, so that is what moves — slowly, without buoyancy, and
        // with no temperature story at all.
        HeatRegime::Diffusion => RegimeParams {
            buoyancy_per_k: 0.0,
            swirl: 0.05,
            drag: 0.992,
            nucleation_per_s: 0.0,
            nucleation_dir: 0.0,
            cooling_sign: 0.0,
        },
        // Evaporate, rise, condense on something cold, run off.
        HeatRegime::Distillation => RegimeParams {
            buoyancy_per_k: buoyancy_for_beta(BETA_WATER_HOT) * 0.8,
            swirl: 0.10,
            drag: 0.972,
            nucleation_per_s: 2.8,
            nucleation_dir: 1.0,
            cooling_sign: 1.0,
        },
    }
}

/// A single convection tracer in the cooking medium.
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
    /// Position in this tracer's phase-change cycle, 0..1.
    ///
    /// Zero for every regime without a phase change, which is how the renderer
    /// tells a plain convection tracer from a bubble or a condensing droplet
    /// without re-deriving the distinction on its own — the drift this crate
    /// exists to prevent.
    pub phase_frac: f32,
}

/// Advance the oven convection simulation by `dt_s` seconds.
///
/// Retained as the [`HeatRegime::BuoyantAir`] case of
/// [`step_medium_simulation`], which is what it always was. Keeping this entry
/// point is not politeness to callers: the pre-existing golden trace was
/// generated through it, and the fact that the trace still reproduces
/// byte-for-byte after the regime work is the evidence that adding nine new
/// regimes did not perturb the one that was already shipping.
pub fn step_oven_simulation(
    particles: &mut [ConvectionParticle],
    dt_s: f32,
    oven_temp_c: f32,
    h_w_m2_k: f32,
    radiant_source_k: f32,
) {
    step_medium_simulation(
        particles,
        dt_s,
        HeatRegime::BuoyantAir,
        oven_temp_c,
        h_w_m2_k,
        radiant_source_k,
    );
}

/// Advance the medium simulation by `dt_s` seconds, in the motion regime the
/// method actually cooks in.
///
/// Pure: it reads and writes only `particles`. This is what both the WASM
/// engine and (transliterated) the TypeScript fallback execute, so the two
/// render the same thing.
///
/// The model is a visualisation, not a CFD solve — a buoyancy-driven swirl with
/// drag, a phase-change tracer cycle, and a Newton-cooling temperature approach
/// whose rate is set by the method's real `h`. It is honest about what it shows:
/// hotter media circulate faster, high-`h` media equilibrate a tracer faster,
/// and a medium COLDER than the room drives its tracers downward.
pub fn step_medium_simulation(
    particles: &mut [ConvectionParticle],
    dt_s: f32,
    regime: HeatRegime,
    medium_temp_c: f32,
    h_w_m2_k: f32,
    radiant_source_k: f32,
) {
    let params = regime_params(regime);

    // ⚠️ SIGNED, where the original was `(T − 20).max(0.0)`.
    //
    // `[MEASURED 2026-08-17]` That clamp is why `cryo_cooking` had no motion to
    // show: at −196 °C the superheat is −216 K, the clamp pinned it to zero, and
    // liquid nitrogen rendered as perfectly still air. Cold media are DENSER
    // than the room and sink, and the sign of ΔT already says so — the clamp was
    // throwing that away. No hot method reaches this branch: every regime with a
    // non-zero buoyancy other than `Cryogenic` runs above room temperature, so
    // dropping the clamp changes nothing that was previously drawn.
    let buoyancy = (medium_temp_c - RENDER_AMBIENT_C) * params.buoyancy_per_k;

    for (i, p) in particles.iter_mut().enumerate() {
        let phase = p.x * 2.0 + p.z * 3.0 + (i as f32) * 0.1;
        let swirl_x = sin_f32(phase) * params.swirl;
        let swirl_z = cos_f32(phase) * params.swirl;

        // Phase-change tracers carry an extra velocity along the transition
        // direction, ramped by how far through the cycle they are: a bubble
        // accelerates as it grows and detaches, a droplet as it runs off.
        let transit = params.nucleation_dir * p.phase_frac * VAPOUR_TRANSIT;

        p.vx = (p.vx + swirl_x * dt_s) * params.drag;
        p.vy = (p.vy + (buoyancy + transit) * dt_s) * params.drag;
        p.vz = (p.vz + swirl_z * dt_s) * params.drag;

        p.x += p.vx * dt_s;
        p.y += p.vy * dt_s;
        p.z += p.vz * dt_s;

        // Wrap into the 1×1×1 render box. The y < 0 case is reachable only in
        // the regimes that travel downward — condensing steam, and any medium
        // below room temperature.
        if p.y > 1.0 {
            p.y = 0.0;
        }
        if p.y < 0.0 {
            p.y = 1.0;
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
        //
        // Gated rather than scaled: a mass-transfer method has NO heat flow, and
        // letting a borrowed h drive a temperature here is how the old canvas
        // came to show a fermentation crock equilibrating like a roast.
        if params.cooling_sign != 0.0 {
            p.temp_c += (medium_temp_c - p.temp_c) * (h_w_m2_k * 0.001) * dt_s;
        }

        // Advance the phase-change cycle. Deterministic and RNG-free, like the
        // seed — a random nucleation would leave the two runtimes with nothing
        // to compare.
        if params.nucleation_per_s > 0.0 {
            p.phase_frac += params.nucleation_per_s * dt_s;
            if p.phase_frac >= 1.0 {
                p.phase_frac -= 1.0;
            }
        } else {
            p.phase_frac = 0.0;
        }

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
                // Staggered so nucleation does not pulse in unison — a boil
                // where every bubble detaches on the same frame reads as a
                // strobe rather than as a boil. Closed form in the index, like
                // every other field here.
                phase_frac: (f * 0.113) % 1.0,
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

// ============================================================================
// Choi & Okos — thermophysical properties from composition
// ============================================================================
//
// The Rust half of `src/lib/cooking/choiOkos.ts`. See that file for the full
// rationale; the short version is that the published coefficients are IMPERIAL
// and are stored that way, byte-for-byte as ASHRAE prints them, with the result
// converted using factors derived from the exact SI definitions of the BTU, the
// pound and the foot.
//
// BASIS: Choi & Okos (1986), as tabulated in the 1998 ASHRAE Refrigeration
// Handbook Ch. 8 "Thermal Properties of Foods", Tables 1 and 2, with the
// mixture rules from Equations 6, 7, 35 and 36 of that chapter.

/// International Table BTU, joules. Exact by definition.
pub const BTU_IT_J: f64 = 1055.05585262;
/// Pound, kilograms. Exact by definition.
pub const POUND_KG: f64 = 0.45359237;
/// Foot, metres. Exact by definition.
pub const FOOT_M: f64 = 0.3048;
/// A Fahrenheit degree is 5/9 of a kelvin.
const F_DEGREE_IN_K: f64 = 5.0 / 9.0;

/// Btu/(h·ft·°F) → W/(m·K).
pub const K_IMPERIAL_TO_SI: f64 = BTU_IT_J / (3600.0 * FOOT_M * F_DEGREE_IN_K);
/// lb/ft³ → kg/m³.
pub const RHO_IMPERIAL_TO_SI: f64 = POUND_KG / (FOOT_M * FOOT_M * FOOT_M);
/// Btu/(lb·°F) → J/(kg·K). Works out to exactly 4186.8.
pub const CP_IMPERIAL_TO_SI: f64 = BTU_IT_J / (POUND_KG * F_DEGREE_IN_K);

/// Lower bound of the Choi & Okos fits, °C (ASHRAE states −40 °F).
pub const CHOI_OKOS_MIN_C: f64 = -40.0;
/// Upper bound of the Choi & Okos fits, °C (ASHRAE states 300 °F → 148.888… °C).
pub const CHOI_OKOS_MAX_C: f64 = (300.0 - 32.0) * (5.0 / 9.0);

const WATER_FREEZE_F: f64 = 32.0;

/// The components Choi & Okos fit separately.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FoodComponent {
    Water,
    Protein,
    Fat,
    Carbohydrate,
    Fibre,
    Ash,
    Ice,
}

/// The six components a food's composition is built from, in a fixed order.
///
/// Ice is deliberately NOT here: a frozen food needs the ice fraction resolved
/// first, which is a different calculation (ASHRAE Eq 4/5) and not this one.
pub const COMPOSITION_COMPONENTS: [FoodComponent; 6] = [
    FoodComponent::Water,
    FoodComponent::Protein,
    FoodComponent::Fat,
    FoodComponent::Carbohydrate,
    FoodComponent::Fibre,
    FoodComponent::Ash,
];

#[inline]
fn eval_poly(c: [f64; 3], t_f: f64) -> f64 {
    c[0] + c[1] * t_f + c[2] * t_f * t_f
}

#[inline]
fn c_to_f_local(celsius: f64) -> f64 {
    celsius * (9.0 / 5.0) + 32.0
}

impl FoodComponent {
    /// Thermal conductivity coefficients, Btu/(h·ft·°F). ASHRAE Tables 1 and 2.
    fn k_btu(self) -> [f64; 3] {
        match self {
            FoodComponent::Protein => [9.0535e-2, 4.1486e-4, -4.8467e-7],
            FoodComponent::Fat => [1.3273e-1, -8.8405e-4, -3.1652e-8],
            FoodComponent::Carbohydrate => [1.0133e-1, 4.9478e-4, -7.7238e-7],
            FoodComponent::Fibre => [9.2499e-2, 4.3731e-4, -5.65e-7],
            FoodComponent::Ash => [1.7553e-1, 4.8292e-4, -5.1839e-7],
            FoodComponent::Water => [3.1064e-1, 6.4226e-4, -1.1955e-6],
            FoodComponent::Ice => [1.3652, -3.1648e-3, 1.8108e-5],
        }
    }

    /// Density coefficients, lb/ft³. Component fits are LINEAR; water is quadratic.
    fn rho_lb(self) -> [f64; 3] {
        match self {
            FoodComponent::Protein => [8.3599e1, -1.7979e-2, 0.0],
            FoodComponent::Fat => [5.8246e1, -1.4482e-2, 0.0],
            FoodComponent::Carbohydrate => [1.0017e2, -1.0767e-2, 0.0],
            FoodComponent::Fibre => [8.228e1, -1.269e-2, 0.0],
            FoodComponent::Ash => [1.5162e2, -9.7329e-3, 0.0],
            FoodComponent::Water => [6.2174e1, 4.7425e-3, -7.2397e-5],
            FoodComponent::Ice => [5.7385e1, -4.5333e-3, 0.0],
        }
    }

    /// Specific heat coefficients, Btu/(lb·°F). Water's ABOVE-freezing fit.
    fn cp_btu(self) -> [f64; 3] {
        match self {
            FoodComponent::Protein => [4.7442e-1, 1.6661e-4, -9.6784e-8],
            FoodComponent::Fat => [4.673e-1, 2.1815e-4, -3.5391e-7],
            FoodComponent::Carbohydrate => [3.6114e-1, 2.8843e-4, -4.3788e-7],
            FoodComponent::Fibre => [4.3276e-1, 2.6485e-4, -3.4285e-7],
            FoodComponent::Ash => [2.5266e-1, 2.681e-4, -2.7141e-7],
            FoodComponent::Water => [9.9827e-1, -3.7879e-5, 4.0347e-7],
            FoodComponent::Ice => [4.6677e-1, 8.0636e-4, 0.0],
        }
    }
}

/// Specific heat of SUPERCOOLED water, −40 to 32 °F, Btu/(lb·°F).
///
/// Materially different from the above-freezing fit — 1.406 against 1.000 at
/// −40 °F. Applying the wrong branch is a 40 % error in the term that dominates
/// almost every food's specific heat, so the branch is explicit.
const CP_WATER_BELOW_FREEZING: [f64; 3] = [1.0725, -5.3992e-3, 7.3361e-5];

fn check_range(celsius: f64) -> Result<(), ThermoError> {
    // `.contains` rather than a manual pair: identical for NaN (both false,
    // so both refuse), and clippy is right that it reads better.
    if !(CHOI_OKOS_MIN_C..=CHOI_OKOS_MAX_C).contains(&celsius) {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    Ok(())
}

/// Thermal conductivity of a pure food component, W·m⁻¹·K⁻¹.
pub fn component_conductivity(c: FoodComponent, celsius: f64) -> Result<f64, ThermoError> {
    check_range(celsius)?;
    Ok(eval_poly(c.k_btu(), c_to_f_local(celsius)) * K_IMPERIAL_TO_SI)
}

/// Density of a pure food component, kg·m⁻³.
pub fn component_density(c: FoodComponent, celsius: f64) -> Result<f64, ThermoError> {
    check_range(celsius)?;
    Ok(eval_poly(c.rho_lb(), c_to_f_local(celsius)) * RHO_IMPERIAL_TO_SI)
}

/// Specific heat capacity of a pure food component, J·kg⁻¹·K⁻¹.
pub fn component_specific_heat(c: FoodComponent, celsius: f64) -> Result<f64, ThermoError> {
    check_range(celsius)?;
    let t_f = c_to_f_local(celsius);
    let poly = if c == FoodComponent::Water && t_f < WATER_FREEZE_F {
        CP_WATER_BELOW_FREEZING
    } else {
        c.cp_btu()
    };
    Ok(eval_poly(poly, t_f) * CP_IMPERIAL_TO_SI)
}

/// Mass fractions of the proximate components, each 0–1.
///
/// NOT renormalised: a set that does not sum to 1 describes a food with unnamed
/// mass, and scaling it up would invent composition the source did not measure.
#[derive(Debug, Clone, Copy)]
pub struct MassFractions {
    pub water: f64,
    pub protein: f64,
    pub fat: f64,
    pub carbohydrate: f64,
    pub fibre: f64,
    pub ash: f64,
}

impl MassFractions {
    fn get(&self, c: FoodComponent) -> f64 {
        match c {
            FoodComponent::Water => self.water,
            FoodComponent::Protein => self.protein,
            FoodComponent::Fat => self.fat,
            FoodComponent::Carbohydrate => self.carbohydrate,
            FoodComponent::Fibre => self.fibre,
            FoodComponent::Ash => self.ash,
            FoodComponent::Ice => 0.0,
        }
    }
}

/// Derived thermophysical properties of a food at a temperature.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct FoodThermophysicalProperties {
    pub density_kg_m3: f64,
    pub specific_heat_j_kg_k: f64,
    pub conductivity_w_m_k: f64,
    /// Derived as k/(ρ·cp), m²·s⁻¹.
    pub diffusivity_m2_s: f64,
    /// How much mass the fractions failed to account for. Zero when they sum to 1.
    pub unaccounted_fraction: f64,
}

/// Thermophysical properties of a food from its composition.
///
/// ⚠️ Conductivity uses VOLUME fractions (Eq 35/36) and specific heat uses MASS
/// fractions (Eq 7). They are not interchangeable — fat's density is barely half
/// of ash's, so a fatty food's volume fractions look nothing like its mass ones.
pub fn food_properties(
    fractions: MassFractions,
    celsius: f64,
    porosity: f64,
) -> Result<FoodThermophysicalProperties, ThermoError> {
    check_range(celsius)?;
    if !(0.0..1.0).contains(&porosity) {
        return Err(ThermoError::OutsideCorrelationRange);
    }

    let mut specific_heat = 0.0;
    let mut volume_per_mass = 0.0;
    let mut shares = [0.0_f64; 6];

    for (i, c) in COMPOSITION_COMPONENTS.iter().enumerate() {
        let x = fractions.get(*c);
        if !(0.0..=1.0).contains(&x) {
            return Err(ThermoError::OutsideCorrelationRange);
        }
        specific_heat += x * component_specific_heat(*c, celsius)?;
        let share = x / component_density(*c, celsius)?;
        shares[i] = share;
        volume_per_mass += share;
    }

    if !(volume_per_mass > 0.0) {
        return Err(ThermoError::OutsideCorrelationRange);
    }

    let mut conductivity = 0.0;
    for (i, c) in COMPOSITION_COMPONENTS.iter().enumerate() {
        conductivity += (shares[i] / volume_per_mass) * component_conductivity(*c, celsius)?;
    }

    let density = (1.0 - porosity) / volume_per_mass;
    let total: f64 = COMPOSITION_COMPONENTS
        .iter()
        .map(|c| fractions.get(*c))
        .sum();

    Ok(FoodThermophysicalProperties {
        density_kg_m3: density,
        specific_heat_j_kg_k: specific_heat,
        conductivity_w_m_k: conductivity,
        diffusivity_m2_s: conductivity / (density * specific_heat),
        unaccounted_fraction: 1.0 - total,
    })
}

// ============================================================================
// Latent heat
// ============================================================================
//
// The Rust half of `src/lib/cooking/latentHeat.ts`. See that file for the
// rationale. The short version: heating a kilogram of water 20 → 100 °C costs
// ~335 kJ and boiling it away costs ~2257 kJ, so the latent terms — not the
// oven dial — set the pace of most cooking.

/// Fleagle & Andreas intercept, J·kg⁻¹ at 0 K.
const FLEAGLE_INTERCEPT_J_KG: f64 = 3.121e6;
/// Fleagle & Andreas slope, J·kg⁻¹·K⁻¹.
const FLEAGLE_SLOPE_J_KG_K: f64 = 2.274e3;
/// 0 °C in kelvin.
const KELVIN_OFFSET: f64 = 273.15;

/// Validity floor of the vaporisation fit, °C.
pub const VAPORISATION_MIN_C: f64 = 0.0;
/// Validity ceiling of the vaporisation fit, °C.
pub const VAPORISATION_MAX_C: f64 = 100.0;

/// Enthalpy of vaporisation of water, J·kg⁻¹.
///
/// BASIS: Fleagle & Andreas, *Atmospheric Dynamics*, `Δh = 3.121e6 − 2.274e3·T`
/// with T in KELVIN.
///
/// ⚠️ VALIDITY IS 0–100 °C AND THIS REFUSES OUTSIDE IT. `[MEASURED 2026-08-18]`
/// against steam-table saturation values the fit is within 0.707 % across that
/// range (0.042 % at 0 °C, 0.036 % at 20 °C, 0.707 % at 100 °C) and degrades to
/// 2.1 % by 150 °C. A linear fit to a curve that must vanish at the critical
/// point cannot be extended — it stays finite and wrong.
pub fn latent_heat_vaporisation(celsius: f64) -> Result<f64, ThermoError> {
    if !(VAPORISATION_MIN_C..=VAPORISATION_MAX_C).contains(&celsius) {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    Ok(FLEAGLE_INTERCEPT_J_KG - FLEAGLE_SLOPE_J_KG_K * (celsius + KELVIN_OFFSET))
}

/// Latent heat of fusion of PURE water, J·kg⁻¹.
///
/// BASIS: 1998 ASHRAE Refrigeration Handbook Ch. 8 states `Lo = 143.4 Btu/lb`.
/// Converted here rather than transcribed as 333 550, so the constant
/// regenerates from its own stated basis — 1 Btu/lb is exactly 2326 J/kg.
pub fn water_fusion_j_kg() -> f64 {
    143.4 * (BTU_IT_J / POUND_KG)
}

/// Fraction of a food's water that will NOT freeze at ordinary freezer
/// temperatures.
///
/// ⚠️ NOT A ROUNDING. Omitting it overstates the freezing load by 25 %. Bound
/// water is held by solutes and macromolecules and stays liquid; the
/// food-freezing literature converges on treating the latent release as about
/// 80 % of what total water content would suggest. A rigorous treatment
/// resolves the ice fraction continuously below the initial freezing point
/// (ASHRAE Eq 4/5), which needs a per-food initial freezing point this codebase
/// does not hold.
pub const BOUND_WATER_FRACTION: f64 = 0.2;

fn check_fraction(v: f64) -> Result<(), ThermoError> {
    if !(0.0..=1.0).contains(&v) {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    Ok(())
}

/// The part of a food's water that can actually freeze, as a mass fraction OF
/// THE FOOD.
pub fn freezable_water_fraction(water_mass_fraction: f64) -> Result<f64, ThermoError> {
    check_fraction(water_mass_fraction)?;
    Ok(water_mass_fraction * (1.0 - BOUND_WATER_FRACTION))
}

/// Energy to freeze or thaw one kilogram of FOOD, J·kg⁻¹.
pub fn food_fusion_enthalpy(water_mass_fraction: f64) -> Result<f64, ThermoError> {
    Ok(freezable_water_fraction(water_mass_fraction)? * water_fusion_j_kg())
}

/// Energy to evaporate ALL the water out of one kilogram of food, J·kg⁻¹.
///
/// A ceiling, not a prediction — no process drives a food to zero moisture.
pub fn food_vaporisation_enthalpy(
    water_mass_fraction: f64,
    celsius: f64,
) -> Result<f64, ThermoError> {
    check_fraction(water_mass_fraction)?;
    Ok(water_mass_fraction * latent_heat_vaporisation(celsius)?)
}

/// Energy carried away by evaporating a given fraction of a food's MASS.
///
/// `mass_loss_fraction` is loss as a share of starting mass — what a scale
/// measures — not a share of the food's water.
pub fn evaporative_energy_loss(
    mass_loss_fraction: f64,
    celsius: f64,
) -> Result<f64, ThermoError> {
    check_fraction(mass_loss_fraction)?;
    Ok(mass_loss_fraction * latent_heat_vaporisation(celsius)?)
}

/// Enthalpy of fusion of culinary fat, J·kg⁻¹ of FAT — a BAND, deliberately.
///
/// Unlike water, whose fusion enthalpy is a constant to five figures, a fat's
/// depends on its fatty-acid profile AND on which polymorphic form (α/β′/β) it
/// is in — the same fat differs by tens of percent between them. Reported
/// values for animal fats span roughly 125–210 kJ·kg⁻¹. Publishing one figure
/// would invent a precision the quantity does not have.
pub const FAT_FUSION_LOW_J_KG: f64 = 125e3;
pub const FAT_FUSION_TYPICAL_J_KG: f64 = 167e3;
pub const FAT_FUSION_HIGH_J_KG: f64 = 210e3;

/// Melting range of culinary fat, °C. Fat does not melt at a point.
pub const FAT_MELTING_LOW_C: f64 = 25.0;
pub const FAT_MELTING_HIGH_C: f64 = 45.0;

/// How many kelvin of sensible heating one latent term is worth.
///
/// The most clarifying number here: evaporating 5 % of a food's mass costs
/// about as much as raising the whole thing 30 K, which is why moisture loss
/// and not the dial sets the pace of a roast.
pub fn latent_as_temperature_rise(
    latent_j_kg: f64,
    specific_heat_j_kg_k: f64,
) -> Result<f64, ThermoError> {
    if !(specific_heat_j_kg_k > 0.0) {
        return Err(ThermoError::NonPositiveZValue);
    }
    Ok(latent_j_kg / specific_heat_j_kg_k)
}

// ============================================================================
// Boundary network — fluid properties, correlations, evaporation, resistances
// ============================================================================
//
// Mirror of `src/lib/cooking/boundaryNetwork.ts`. Every table row, coefficient
// and envelope is duplicated here on purpose: the golden fixture asserts the
// two runtimes agree to the BIT, so a transcription that drifts fails a test
// rather than quietly serving two different answers on server and client.
//
// The commentary explaining WHY each value is what it is lives in the
// TypeScript file. This file carries the basis lines and the traps only.

/// Standard acceleration of gravity, m·s⁻². Exact by definition (CGPM 1901).
pub const STANDARD_GRAVITY: f64 = 9.80665;

/// Molar mass of water, kg·mol⁻¹. IUPAC 2021 standard atomic weights.
pub const MOLAR_MASS_WATER: f64 = 0.01801528;

/// Universal gas constant, J·mol⁻¹·K⁻¹. Exact by the 2019 SI redefinition.
pub const GAS_CONSTANT: f64 = 8.31446261815324;

/// Dry air at 1 atm: `[K, ρ, cp, μ, k]`. Incropera Table A.4.
///
/// ν, α and Pr are DERIVED, not stored — they are algebraically redundant, and
/// the printed columns are used in the test files as a transcription check.
const AIR_TABLE: [[f64; 5]; 12] = [
    [250.0, 1.3947, 1006.0, 159.6e-7, 22.3e-3],
    [300.0, 1.1614, 1007.0, 184.6e-7, 26.3e-3],
    [350.0, 0.995, 1009.0, 208.2e-7, 30.0e-3],
    [400.0, 0.8711, 1014.0, 230.1e-7, 33.8e-3],
    [450.0, 0.774, 1021.0, 250.7e-7, 37.3e-3],
    [500.0, 0.6964, 1030.0, 270.1e-7, 40.7e-3],
    [550.0, 0.6329, 1040.0, 288.4e-7, 43.9e-3],
    [600.0, 0.5804, 1051.0, 305.8e-7, 46.9e-3],
    [650.0, 0.5356, 1063.0, 322.5e-7, 49.7e-3],
    [700.0, 0.4975, 1075.0, 338.8e-7, 52.4e-3],
    [750.0, 0.4643, 1087.0, 354.6e-7, 54.9e-3],
    [800.0, 0.4354, 1099.0, 369.8e-7, 57.3e-3],
];

/// Saturated liquid water: `[K, ρ, cp, μ, k, σ, h_fg]`. Incropera Table A.6.
///
/// ⚠️ The 373.15 K viscosity is the independently known **0.2818 mPa·s**, not
/// the 279e-6 first transcribed — which closed the Prandtl identity to 1.730
/// against a printed 1.76, an outlier against every other row's ≤0.4 %.
const WATER_TABLE: [[f64; 7]; 11] = [
    [280.0, 1000.0, 4198.0, 1422e-6, 582e-3, 74.8e-3, 2485e3],
    [290.0, 999.0, 4184.0, 1080e-6, 598e-3, 73.7e-3, 2461e3],
    [300.0, 997.0, 4179.0, 855e-6, 613e-3, 71.7e-3, 2438e3],
    [310.0, 993.05, 4178.0, 695e-6, 628e-3, 70.0e-3, 2414e3],
    [320.0, 989.12, 4180.0, 577e-6, 640e-3, 68.3e-3, 2390e3],
    [330.0, 984.25, 4184.0, 489e-6, 650e-3, 66.6e-3, 2366e3],
    [340.0, 979.43, 4188.0, 420e-6, 660e-3, 64.9e-3, 2342e3],
    [350.0, 973.71, 4195.0, 365e-6, 668e-3, 63.2e-3, 2317e3],
    [360.0, 967.12, 4203.0, 324e-6, 674e-3, 61.4e-3, 2291e3],
    [370.0, 960.61, 4214.0, 289e-6, 679e-3, 59.5e-3, 2265e3],
    [373.15, 957.85, 4217.0, 281.8e-6, 680e-3, 58.9e-3, 2257e3],
];

/// Lowest tabulated air temperature, °C.
pub const AIR_MIN_C: f64 = 250.0 - 273.15;
/// Highest tabulated air temperature, °C.
pub const AIR_MAX_C: f64 = 800.0 - 273.15;
/// Lowest tabulated saturated-water temperature, °C.
pub const WATER_MIN_C: f64 = 280.0 - 273.15;
/// Highest tabulated saturated-water temperature, °C — the normal boiling point.
pub const WATER_MAX_C: f64 = 373.15 - 273.15;

/// A fluid's transport properties at one temperature.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct FluidState {
    pub celsius: f64,
    pub kelvin: f64,
    pub rho_kg_m3: f64,
    pub cp_j_kg_k: f64,
    pub mu_pa_s: f64,
    pub k_w_m_k: f64,
    pub nu_m2_s: f64,
    pub alpha_m2_s: f64,
    pub prandtl: f64,
    pub beta_per_k: f64,
}

/// Saturated liquid water, plus the two properties only a liquid–vapour pair has.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct WaterState {
    pub fluid: FluidState,
    pub sigma_n_m: f64,
    pub hfg_j_kg: f64,
    pub rho_vapour_kg_m3: f64,
}

/// Locate `x` in a sorted first column; return the low index and the weight.
///
/// Mirrors the TypeScript loop EXACTLY, including its clamp at the top row —
/// a binary search would find the same bracket but is not guaranteed to
/// produce the same `t` in floating point, and this pair is asserted bit-equal.
fn bracket_index(first_col: &[f64], x: f64) -> (usize, f64) {
    let mut lo = 0usize;
    for i in 1..first_col.len() {
        if first_col[i] <= x {
            lo = i;
        }
    }
    if lo == first_col.len() - 1 {
        lo = first_col.len() - 2;
    }
    let span = first_col[lo + 1] - first_col[lo];
    (lo, (x - first_col[lo]) / span)
}

fn lerp(a: f64, b: f64, t: f64) -> f64 {
    a + (b - a) * t
}

/// Dry air properties at 1 atm, linearly interpolated. Refuses outside the table.
pub fn air_properties(celsius: f64) -> Result<FluidState, ThermoError> {
    if !celsius.is_finite() {
        return Err(ThermoError::NonFinite);
    }
    if celsius < AIR_MIN_C || celsius > AIR_MAX_C {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    let kelvin = celsius + 273.15;
    let firsts: Vec<f64> = AIR_TABLE.iter().map(|r| r[0]).collect();
    let (i, t) = bracket_index(&firsts, kelvin);
    let rho_kg_m3 = lerp(AIR_TABLE[i][1], AIR_TABLE[i + 1][1], t);
    let cp_j_kg_k = lerp(AIR_TABLE[i][2], AIR_TABLE[i + 1][2], t);
    let mu_pa_s = lerp(AIR_TABLE[i][3], AIR_TABLE[i + 1][3], t);
    let k_w_m_k = lerp(AIR_TABLE[i][4], AIR_TABLE[i + 1][4], t);
    let nu_m2_s = mu_pa_s / rho_kg_m3;
    let alpha_m2_s = k_w_m_k / (rho_kg_m3 * cp_j_kg_k);
    Ok(FluidState {
        celsius,
        kelvin,
        rho_kg_m3,
        cp_j_kg_k,
        mu_pa_s,
        k_w_m_k,
        nu_m2_s,
        alpha_m2_s,
        prandtl: nu_m2_s / alpha_m2_s,
        beta_per_k: 1.0 / kelvin,
    })
}

/// Saturated liquid water properties. β is a central difference on the stored
/// density column — 8.1 % high at 300 K, which is 1.97 % in h and far inside
/// the natural-convection correlations' own ±20–30 %.
pub fn saturated_water_properties(celsius: f64) -> Result<WaterState, ThermoError> {
    if !celsius.is_finite() {
        return Err(ThermoError::NonFinite);
    }
    if celsius < WATER_MIN_C || celsius > WATER_MAX_C {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    let kelvin = celsius + 273.15;
    let firsts: Vec<f64> = WATER_TABLE.iter().map(|r| r[0]).collect();
    let (i, t) = bracket_index(&firsts, kelvin);
    let rho_kg_m3 = lerp(WATER_TABLE[i][1], WATER_TABLE[i + 1][1], t);
    let cp_j_kg_k = lerp(WATER_TABLE[i][2], WATER_TABLE[i + 1][2], t);
    let mu_pa_s = lerp(WATER_TABLE[i][3], WATER_TABLE[i + 1][3], t);
    let k_w_m_k = lerp(WATER_TABLE[i][4], WATER_TABLE[i + 1][4], t);
    let sigma_n_m = lerp(WATER_TABLE[i][5], WATER_TABLE[i + 1][5], t);
    let hfg_j_kg = lerp(WATER_TABLE[i][6], WATER_TABLE[i + 1][6], t);
    let nu_m2_s = mu_pa_s / rho_kg_m3;
    let alpha_m2_s = k_w_m_k / (rho_kg_m3 * cp_j_kg_k);

    let lo = if t < 0.5 { i.saturating_sub(1) } else { i };
    let hi = (lo + 2).min(WATER_TABLE.len() - 1);
    let beta_per_k = -(WATER_TABLE[hi][1] - WATER_TABLE[lo][1])
        / (rho_kg_m3 * (WATER_TABLE[hi][0] - WATER_TABLE[lo][0]));

    let sat_kpa = saturation_pressure_kpa(celsius.min(100.0))?;
    Ok(WaterState {
        fluid: FluidState {
            celsius,
            kelvin,
            rho_kg_m3,
            cp_j_kg_k,
            mu_pa_s,
            k_w_m_k,
            nu_m2_s,
            alpha_m2_s,
            prandtl: nu_m2_s / alpha_m2_s,
            beta_per_k,
        },
        sigma_n_m,
        hfg_j_kg,
        rho_vapour_kg_m3: vapour_density_kg_m3(sat_kpa, celsius),
    })
}

/// Saturation vapour pressure of water, kPa — the FORWARD Antoine direction.
///
/// Shares the one coefficient triple with [`boiling_point_c`], so the two round
/// trip; the fixture pins that they do.
pub fn saturation_pressure_kpa(celsius: f64) -> Result<f64, ThermoError> {
    if !celsius.is_finite() {
        return Err(ThermoError::NonFinite);
    }
    if !(1.0..=100.0).contains(&celsius) {
        return Err(ThermoError::OutsideAntoineRange);
    }
    Ok(10f64.powf(8.07131 - 1730.63 / (233.426 + celsius)) / 7.500617)
}

/// Density of water vapour at a stated partial pressure, kg·m⁻³ (ideal gas).
pub fn vapour_density_kg_m3(partial_pressure_kpa: f64, celsius: f64) -> f64 {
    (partial_pressure_kpa * 1000.0 * MOLAR_MASS_WATER) / (GAS_CONSTANT * (celsius + 273.15))
}

/// Absolute humidity of moist air, kg·m⁻³.
///
/// ⚠️ Refuses above 100 °C: saturation pressure exceeds atmospheric there, so
/// any relative humidity implies more vapour than 1 atm of air can hold. That
/// is a broken variable, not a wide envelope.
pub fn absolute_humidity_kg_m3(
    celsius: f64,
    relative_humidity_pct: f64,
) -> Result<f64, ThermoError> {
    if !(0.0..=100.0).contains(&relative_humidity_pct) {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    if celsius > 100.0 {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    let partial = saturation_pressure_kpa(celsius)? * (relative_humidity_pct / 100.0);
    Ok(vapour_density_kg_m3(partial, celsius))
}

/// Vapour density of kitchen air heated to `air_c`, kg·m⁻³.
///
/// A vented oven holds room air that got hot: same mole fraction, lower density,
/// `ρ_v ∝ 1/T`. 8.609 g·m⁻³ at 20 °C becomes 5.334 at 200 °C.
pub fn humid_air_vapour_density(
    ambient_c: f64,
    relative_humidity_pct: f64,
    air_c: f64,
) -> Result<f64, ThermoError> {
    let ambient = absolute_humidity_kg_m3(ambient_c, relative_humidity_pct)?;
    Ok((ambient * (ambient_c + 273.15)) / (air_c + 273.15))
}

/// Rayleigh number `g·β·ΔT·L³/(ν·α)`.
pub fn rayleigh_number(fluid: &FluidState, delta_t_k: f64, length_m: f64) -> f64 {
    (STANDARD_GRAVITY * fluid.beta_per_k * delta_t_k.abs() * length_m * length_m * length_m)
        / (fluid.nu_m2_s * fluid.alpha_m2_s)
}

/// Which face a natural-convection correlation describes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConvectiveSurface {
    Vertical,
    HorizontalUp,
    HorizontalDown,
    HorizontalCylinder,
}

/// Result of a convection correlation.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ConvectionResult {
    pub h_w_m2_k: f64,
    pub nusselt: f64,
    /// Rayleigh for natural convection; Reynolds for forced.
    pub dimensionless: f64,
    /// True when the correlation was asked outside its published envelope.
    pub extrapolated: bool,
}

/// Natural-convection coefficient. Churchill & Chu (1975) for the vertical
/// plate and horizontal cylinder; McAdams for the flat plates.
///
/// ⚠️ These correlations carry ±20–30 % of their own. Two significant figures
/// is all the precision that exists here, however many the arithmetic prints.
pub fn natural_convection_h(
    fluid: &FluidState,
    surface: ConvectiveSurface,
    delta_t_k: f64,
    length_m: f64,
) -> Result<ConvectionResult, ThermoError> {
    if !(length_m > 0.0) || !length_m.is_finite() {
        return Err(ThermoError::NonPositiveThickness);
    }
    let ra = rayleigh_number(fluid, delta_t_k, length_m);
    let pr = fluid.prandtl;
    let (nusselt, extrapolated) = match surface {
        ConvectiveSurface::Vertical => {
            let denom = (1.0 + (0.492 / pr).powf(9.0 / 16.0)).powf(8.0 / 27.0);
            let root = 0.825 + (0.387 * ra.powf(1.0 / 6.0)) / denom;
            (root * root, false)
        }
        ConvectiveSurface::HorizontalCylinder => {
            let denom = (1.0 + (0.559 / pr).powf(9.0 / 16.0)).powf(8.0 / 27.0);
            let root = 0.6 + (0.387 * ra.powf(1.0 / 6.0)) / denom;
            (root * root, ra > 1e12)
        }
        ConvectiveSurface::HorizontalUp => {
            if ra < 1e7 {
                (0.54 * ra.powf(0.25), ra < 1e4)
            } else {
                (0.15 * ra.powf(1.0 / 3.0), ra > 1e11)
            }
        }
        ConvectiveSurface::HorizontalDown => (0.27 * ra.powf(0.25), !(1e5..=1e10).contains(&ra)),
    };
    Ok(ConvectionResult {
        h_w_m2_k: (nusselt * fluid.k_w_m_k) / length_m,
        nusselt,
        dimensionless: ra,
        extrapolated,
    })
}

/// Characteristic length for a flat plate: `A/P`. For a circle that is **D/4**.
pub fn plate_characteristic_length(area_m2: f64, perimeter_m: f64) -> Result<f64, ThermoError> {
    if !(area_m2 > 0.0) || !(perimeter_m > 0.0) {
        return Err(ThermoError::NonPositiveThickness);
    }
    Ok(area_m2 / perimeter_m)
}

/// Forced convection over a flat plate. Laminar below Re = 5e5, mixed above.
pub fn forced_convection_h_flat_plate(
    fluid: &FluidState,
    velocity_m_s: f64,
    length_m: f64,
) -> Result<ConvectionResult, ThermoError> {
    if velocity_m_s < 0.0 || !(length_m > 0.0) {
        return Err(ThermoError::NonPositiveThickness);
    }
    let re = (velocity_m_s * length_m) / fluid.nu_m2_s;
    // `powf(1/3)`, NOT `cbrt`: the two runtimes' `cbrt` disagree by 1 ULP at
    // realistic Prandtl numbers while `powf` with a ⅓ exponent agrees exactly.
    let pr_cube = fluid.prandtl.powf(1.0 / 3.0);
    let nusselt = if re < 5e5 {
        0.664 * re.sqrt() * pr_cube
    } else {
        (0.037 * re.powf(0.8) - 871.0) * pr_cube
    };
    Ok(ConvectionResult {
        h_w_m2_k: (nusselt * fluid.k_w_m_k) / length_m,
        nusselt,
        dimensionless: re,
        extrapolated: fluid.prandtl < 0.6,
    })
}

/// Rohsenow surface–fluid pairing for water, Incropera Table 10.1.
///
/// ⚠️ `C_sf` is CUBED, so scored stainless transfers 11.79× the flux of a
/// polished one at the same excess temperature — enough to put the two pans in
/// different regimes at the same dial.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BoilingSurface {
    StainlessPolished,
    StainlessEtched,
    StainlessGround,
    StainlessScored,
    CopperPolished,
    CopperScored,
    Brass,
}

impl BoilingSurface {
    pub fn csf(self) -> f64 {
        match self {
            BoilingSurface::StainlessPolished => 0.0132,
            BoilingSurface::StainlessEtched => 0.0130,
            BoilingSurface::StainlessGround => 0.0080,
            BoilingSurface::StainlessScored => 0.0058,
            BoilingSurface::CopperPolished => 0.0128,
            BoilingSurface::CopperScored => 0.0068,
            BoilingSurface::Brass => 0.0060,
        }
    }
}

/// Rohsenow's Prandtl exponent. 1.0 for water; 1.7 for every other fluid.
pub const ROHSENOW_PR_EXPONENT_WATER: f64 = 1.0;

/// Zuber's critical heat flux for saturated pool boiling, W·m⁻².
pub fn critical_heat_flux_wm2(water: &WaterState) -> f64 {
    0.149
        * water.hfg_j_kg
        * water.rho_vapour_kg_m3.sqrt()
        * (water.sigma_n_m * STANDARD_GRAVITY * (water.fluid.rho_kg_m3 - water.rho_vapour_kg_m3))
            .powf(0.25)
}

/// Nucleate pool boiling, Rohsenow (1952).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct BoilingResult {
    pub flux_w_m2: f64,
    pub h_w_m2_k: f64,
    pub critical_flux_w_m2: f64,
    pub burnout_fraction: f64,
}

/// Nucleate pool boiling flux, W·m⁻². Goes as the excess temperature CUBED.
///
/// ⚠️ REFUSES above the critical heat flux, where the vapour film goes
/// continuous and flux FALLS — Rohsenow's monotone cube points the wrong way
/// there and would invent energy.
pub fn nucleate_boiling_flux(
    water: &WaterState,
    excess_temp_k: f64,
    surface: BoilingSurface,
) -> Result<BoilingResult, ThermoError> {
    if !excess_temp_k.is_finite() {
        return Err(ThermoError::NonFinite);
    }
    if excess_temp_k <= 0.0 {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    let buoyancy = ((STANDARD_GRAVITY * (water.fluid.rho_kg_m3 - water.rho_vapour_kg_m3))
        / water.sigma_n_m)
        .sqrt();
    let bracket_term = (water.fluid.cp_j_kg_k * excess_temp_k)
        / (surface.csf() * water.hfg_j_kg * water.fluid.prandtl.powf(ROHSENOW_PR_EXPONENT_WATER));
    let flux_w_m2 = water.fluid.mu_pa_s * water.hfg_j_kg * buoyancy * bracket_term.powi(3);
    let critical_flux_w_m2 = critical_heat_flux_wm2(water);
    let burnout_fraction = flux_w_m2 / critical_flux_w_m2;
    if burnout_fraction > 1.0 {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    Ok(BoilingResult {
        flux_w_m2,
        h_w_m2_k: flux_w_m2 / excess_temp_k,
        critical_flux_w_m2,
        burnout_fraction,
    })
}

/// Binary diffusion coefficient of water vapour in air at 298 K, m²·s⁻¹.
pub const D_WATER_AIR_298: f64 = 0.26e-4;

/// Diffusion coefficient of water vapour in air, scaled as `T^{3/2}`.
///
/// ⚠️ Fuller's empirical `T^{1.75}` differs by 10.9 % at 200 °C, reaching the
/// flux as 7.4 % after `Le^{-2/3}`. Inside the convection envelope, but this is
/// the first exponent to replace if better than ±10 % is ever needed.
pub fn diffusion_water_in_air(celsius: f64) -> f64 {
    D_WATER_AIR_298 * ((celsius + 273.15) / 298.0).powf(1.5)
}

/// Evaporative mass and heat flux, Chilton–Colburn analogy.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct EvaporationResult {
    pub mass_flux_kg_m2_s: f64,
    pub latent_flux_w_m2: f64,
    pub h_mass_m_s: f64,
    pub lewis: f64,
    pub surface_vapour_kg_m3: f64,
    pub bulk_vapour_kg_m3: f64,
}

/// Evaporative flux from a free water surface.
///
/// ⚠️ FREE WATER, so an upper bound on evaporation: real food's crust limits
/// moisture migration and the true flux is lower. The negative branch is
/// condensation and is deliberately not clamped.
pub fn evaporative_flux(
    h_w_m2_k: f64,
    surface_c: f64,
    air_c: f64,
    bulk_vapour_kg_m3: f64,
    latent_heat_j_kg: f64,
) -> Result<EvaporationResult, ThermoError> {
    if h_w_m2_k < 0.0 {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    let film_c = (surface_c + air_c) / 2.0;
    let film = air_properties(film_c)?;
    let lewis = film.alpha_m2_s / diffusion_water_in_air(film_c);
    let h_mass_m_s = h_w_m2_k / (film.rho_kg_m3 * film.cp_j_kg_k * lewis.powf(2.0 / 3.0));
    let surface_vapour_kg_m3 = vapour_density_kg_m3(saturation_pressure_kpa(surface_c)?, surface_c);
    let mass_flux_kg_m2_s = h_mass_m_s * (surface_vapour_kg_m3 - bulk_vapour_kg_m3);
    Ok(EvaporationResult {
        mass_flux_kg_m2_s,
        latent_flux_w_m2: mass_flux_kg_m2_s * latent_heat_j_kg,
        h_mass_m_s,
        lewis,
        surface_vapour_kg_m3,
        bulk_vapour_kg_m3,
    })
}

/// Where a freely-evaporating surface settles.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct PinnedSurfaceResult {
    pub celsius: f64,
    pub depression_k: f64,
    pub convective_gain_w_m2: f64,
    pub radiative_gain_w_m2: f64,
    pub evaporative_loss_w_m2: f64,
    pub mass_flux_kg_m2_s: f64,
    pub saturated: bool,
}

/// Steady-state temperature of a freely-evaporating surface, by bisection.
///
/// ⚠️ The FREE-WATER limit — real food sits above it, because once a surface
/// dries the evaporative term weakens. Read it as "as cold as the surface can
/// possibly be", which is the bound worth knowing when asking why something
/// has not browned.
pub fn evaporative_pinned_surface_c(
    air_c: f64,
    bulk_vapour_kg_m3: f64,
    h_w_m2_k: f64,
    radiant_source_c: f64,
    emissivity: f64,
    ceiling_c: f64,
) -> Result<PinnedSurfaceResult, ThermoError> {
    // Explicit squaring, not `powi(4)`: matches the TypeScript half exactly,
    // where `Math.pow(x, 4)` differs from this by 1 ULP.
    fn pow4(x: f64) -> f64 {
        let sq = x * x;
        sq * sq
    }
    let source_k4 = pow4(radiant_source_c + 273.15);
    let hi = ceiling_c.min(100.0);
    let lo = 1.0_f64;

    let evaluate = |ts: f64| -> Result<(f64, EvaporationResult), ThermoError> {
        let water = saturated_water_properties(ts.clamp(WATER_MIN_C, WATER_MAX_C))?;
        let evap = evaporative_flux(h_w_m2_k, ts, air_c, bulk_vapour_kg_m3, water.hfg_j_kg)?;
        let conv = h_w_m2_k * (air_c - ts);
        let rad = emissivity * STEFAN_BOLTZMANN * (source_k4 - pow4(ts + 273.15));
        Ok((conv + rad - evap.latent_flux_w_m2, evap))
    };

    let (imbalance_hi, evap_hi) = evaluate(hi)?;
    if imbalance_hi > 0.0 {
        return Ok(PinnedSurfaceResult {
            celsius: hi,
            depression_k: air_c - hi,
            convective_gain_w_m2: h_w_m2_k * (air_c - hi),
            radiative_gain_w_m2: emissivity * STEFAN_BOLTZMANN * (source_k4 - pow4(hi + 273.15)),
            evaporative_loss_w_m2: evap_hi.latent_flux_w_m2,
            mass_flux_kg_m2_s: evap_hi.mass_flux_kg_m2_s,
            saturated: true,
        });
    }

    let mut a = lo;
    let mut b = hi;
    for _ in 0..80 {
        let mid = (a + b) / 2.0;
        if evaluate(mid)?.0 > 0.0 {
            a = mid;
        } else {
            b = mid;
        }
    }
    let celsius = (a + b) / 2.0;
    let (_, evap) = evaluate(celsius)?;
    Ok(PinnedSurfaceResult {
        celsius,
        depression_k: air_c - celsius,
        convective_gain_w_m2: h_w_m2_k * (air_c - celsius),
        radiative_gain_w_m2: emissivity
            * STEFAN_BOLTZMANN
            * (source_k4 - pow4(celsius + 273.15)),
        evaporative_loss_w_m2: evap.latent_flux_w_m2,
        mass_flux_kg_m2_s: evap.mass_flux_kg_m2_s,
        saturated: false,
    })
}

/// One link in the chain from source to core.
#[derive(Debug, Clone, PartialEq)]
pub struct BoundaryLink {
    pub id: &'static str,
    pub resistance_k_per_w: f64,
    pub area_m2: f64,
    pub h_w_m2_k: Option<f64>,
    pub share: f64,
    pub drop_k: f64,
}

/// The vessel half of a chain. Omitted for a roast on a rack.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct VesselLeg {
    pub source_to_vessel_h_w_m2_k: f64,
    pub area_m2: f64,
    pub k_w_m_k: f64,
    pub thickness_m: f64,
    pub vessel_to_medium_h_w_m2_k: f64,
}

/// The food half of a chain.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct FoodLeg {
    pub medium_to_food_h_w_m2_k: f64,
    pub geometry: FoodGeometry,
    pub half_dimension_m: f64,
    pub k_w_m_k: f64,
    pub area_m2: f64,
}

/// Solved series chain.
#[derive(Debug, Clone, PartialEq)]
pub struct BoundaryNetworkResult {
    pub links: Vec<BoundaryLink>,
    pub total_resistance_k_per_w: f64,
    pub ua_w_per_k: f64,
    pub heat_flow_w: f64,
    pub controlling: usize,
    pub node_celsius: Vec<f64>,
    /// `R_internal / R_external`, which IS the Biot number algebraically.
    ///
    /// ⚠️ Agrees with `biot_number` to a handful of ULP, not to the bit: the
    /// food's area cancels on paper, and the two paths round differently.
    pub food_biot: Option<f64>,
}

/// Solve the series chain and report which link controls.
///
/// Steady state. The transient answer for the interior is the Heisler one-term
/// series; this sizes the boundary that solution takes as given.
pub fn solve_boundary_network(
    source_c: f64,
    sink_c: f64,
    vessel: Option<VesselLeg>,
    food: Option<FoodLeg>,
) -> Result<BoundaryNetworkResult, ThermoError> {
    let mut ids: Vec<&'static str> = Vec::new();
    let mut resistances: Vec<f64> = Vec::new();
    let mut areas: Vec<f64> = Vec::new();
    let mut coefficients: Vec<Option<f64>> = Vec::new();

    if let Some(v) = vessel {
        for value in [
            v.area_m2,
            v.source_to_vessel_h_w_m2_k,
            v.k_w_m_k,
            v.thickness_m,
            v.vessel_to_medium_h_w_m2_k,
        ] {
            if !(value > 0.0) || !value.is_finite() {
                return Err(ThermoError::NonPositiveThickness);
            }
        }
        ids.push("source-to-vessel");
        resistances.push(1.0 / (v.source_to_vessel_h_w_m2_k * v.area_m2));
        areas.push(v.area_m2);
        coefficients.push(Some(v.source_to_vessel_h_w_m2_k));

        ids.push("vessel-wall");
        resistances.push(v.thickness_m / (v.k_w_m_k * v.area_m2));
        areas.push(v.area_m2);
        coefficients.push(None);

        ids.push("vessel-to-medium");
        resistances.push(1.0 / (v.vessel_to_medium_h_w_m2_k * v.area_m2));
        areas.push(v.area_m2);
        coefficients.push(Some(v.vessel_to_medium_h_w_m2_k));
    }

    let mut food_biot = None;
    if let Some(f) = food {
        for value in [
            f.medium_to_food_h_w_m2_k,
            f.half_dimension_m,
            f.k_w_m_k,
            f.area_m2,
        ] {
            if !(value > 0.0) || !value.is_finite() {
                return Err(ThermoError::NonPositiveThickness);
            }
        }
        let external = 1.0 / (f.medium_to_food_h_w_m2_k * f.area_m2);
        let length_m = f.half_dimension_m * f.geometry.characteristic_length_ratio();
        let internal = length_m / (f.k_w_m_k * f.area_m2);

        ids.push("medium-to-food");
        resistances.push(external);
        areas.push(f.area_m2);
        coefficients.push(Some(f.medium_to_food_h_w_m2_k));

        ids.push("food-interior");
        resistances.push(internal);
        areas.push(f.area_m2);
        coefficients.push(None);

        food_biot = Some(internal / external);
    }

    if resistances.is_empty() {
        return Err(ThermoError::OutsideCorrelationRange);
    }

    let total_resistance_k_per_w: f64 = resistances.iter().sum();
    let ua_w_per_k = 1.0 / total_resistance_k_per_w;
    let heat_flow_w = (source_c - sink_c) / total_resistance_k_per_w;

    let mut links = Vec::with_capacity(resistances.len());
    let mut node_celsius = vec![source_c];
    let mut running = source_c;
    let mut controlling = 0usize;
    for (i, &r) in resistances.iter().enumerate() {
        let drop_k = heat_flow_w * r;
        running -= drop_k;
        node_celsius.push(running);
        if r > resistances[controlling] {
            controlling = i;
        }
        links.push(BoundaryLink {
            id: ids[i],
            resistance_k_per_w: r,
            area_m2: areas[i],
            h_w_m2_k: coefficients[i],
            share: r / total_resistance_k_per_w,
            drop_k,
        });
    }

    Ok(BoundaryNetworkResult {
        links,
        total_resistance_k_per_w,
        ua_w_per_k,
        heat_flow_w,
        controlling,
        node_celsius,
        food_biot,
    })
}

/// Convective coefficient for filmwise condensation of steam, W·m⁻²·K⁻¹.
///
/// ⚠️ Picking one value costs almost nothing, and that is a MEASUREMENT:
/// sweeping 3 000 → 25 000 moves a 26 cm lid's loss from 65.81 W to 66.20 W,
/// a spread of 0.27 %. This resistance sits in series with an outside air film
/// two orders of magnitude larger.
pub const CONDENSATION_H_WM2K: f64 = 10000.0;

/// Steady heat balance on a lid.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct LidHeatBalance {
    pub lid_c: f64,
    pub convective_loss_w: f64,
    pub radiative_loss_w: f64,
    pub total_loss_w: f64,
    /// Steam the lid can condense per second, kg·s⁻¹ — the quantity its heat
    /// loss genuinely derives.
    pub condensation_capacity_kg_s: f64,
}

/// How hot a lid runs, and how much steam it can therefore condense back.
///
/// ⚠️ `[MEASURED 2026-08-18]` a metal lid's steady loss does NOT depend on its
/// material or gauge — 1.2 mm stainless, 1.5 mm stainless and 6 mm enamelled
/// cast iron give 66.21 / 66.19 / 66.12 W, a 0.14 % spread — because condensing
/// steam pins the underside to within a degree of the headspace whatever the
/// plate is. Glass is the exception and is not small: 8 mm glass runs at
/// 92.0 °C and loses 58.0 W, 12 % less than any metal lid.
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
) -> Result<LidHeatBalance, ThermoError> {
    if !(lid_area_m2 > 0.0) || !(lid_perimeter_m > 0.0) {
        return Err(ThermoError::NonPositiveThickness);
    }
    if !(lid_thickness_m > 0.0) || !(lid_k_w_m_k > 0.0) {
        return Err(ThermoError::NonPositiveConductivity);
    }
    if headspace_c <= ambient_c {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    fn pow4(x: f64) -> f64 {
        let sq = x * x;
        sq * sq
    }
    let lc = plate_characteristic_length(lid_area_m2, lid_perimeter_m)?;
    let ambient_k4 = pow4(ambient_c + 273.15);
    let inner_resistance = 1.0 / CONDENSATION_H_WM2K + lid_thickness_m / lid_k_w_m_k;

    let outward_flux = |lid_c: f64| -> Result<f64, ThermoError> {
        let film = air_properties((lid_c + ambient_c) / 2.0)?;
        let delta_t = (lid_c - ambient_c).max(1e-9);
        let h = natural_convection_h(&film, ConvectiveSurface::HorizontalUp, delta_t, lc)?.h_w_m2_k;
        Ok(h * (lid_c - ambient_c)
            + emissivity * STEFAN_BOLTZMANN * (pow4(lid_c + 273.15) - ambient_k4))
    };

    let mut lo = ambient_c;
    let mut hi = headspace_c;
    for _ in 0..80 {
        let mid = (lo + hi) / 2.0;
        if (headspace_c - mid) / inner_resistance > outward_flux(mid)? {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    let lid_c = (lo + hi) / 2.0;
    let film = air_properties((lid_c + ambient_c) / 2.0)?;
    let h = natural_convection_h(
        &film,
        ConvectiveSurface::HorizontalUp,
        (lid_c - ambient_c).max(1e-9),
        lc,
    )?
    .h_w_m2_k;
    let convective_loss_w = h * (lid_c - ambient_c) * lid_area_m2;
    let radiative_loss_w =
        emissivity * STEFAN_BOLTZMANN * (pow4(lid_c + 273.15) - ambient_k4) * lid_area_m2;
    let total_loss_w = convective_loss_w + radiative_loss_w;
    Ok(LidHeatBalance {
        lid_c,
        convective_loss_w,
        radiative_loss_w,
        total_loss_w,
        condensation_capacity_kg_s: total_loss_w / latent_heat_j_kg,
    })
}

/// Water a covered pot actually loses.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CoveredWaterLoss {
    pub steam_generated_kg_s: f64,
    pub condensate_returned_kg_s: f64,
    pub net_loss_kg_s: f64,
    /// The lid condenses everything the burner raises: the pot loses nothing.
    pub holding: bool,
    pub return_fraction: f64,
}

/// Net water loss under a lid, from a stated power input.
///
/// ⚠️ This REPLACES the per-seal `VAPOUR_ESCAPE_FRACTION` in `vessels.ts`, which
/// was the wrong SHAPE and not merely the wrong value. `[MEASURED 2026-08-18]`
/// a lid's condensation capacity is 11.1–11.6 % of the free-surface rate over
/// the same area, and near-identical for a tight Dutch oven and a loose
/// stockpot lid, because it is set by area and room temperature rather than by
/// seal quality. The free-surface rate does not apply under a lid at all: the
/// headspace saturates and the driving force collapses. What remains is a
/// circulation whose throughput the lid sets, plus a net loss set by how much
/// steam the POWER INPUT raises beyond that — a function of the burner, which
/// no per-seal constant can express. Same Dutch oven: nothing lost at 50 W,
/// 214 g·h⁻¹ at 200 W, 1171 g·h⁻¹ at 800 W.
///
/// ⚠️ Leakage past the seal is still not modelled and cannot be from anything
/// here — it needs a gap dimension that is not a published property of any pan.
/// This is therefore an UPPER bound on water lost.
pub fn covered_water_loss(
    power_into_contents_w: f64,
    lid_condensation_capacity_kg_s: f64,
    latent_heat_j_kg: f64,
) -> Result<CoveredWaterLoss, ThermoError> {
    if !power_into_contents_w.is_finite() || power_into_contents_w < 0.0 {
        return Err(ThermoError::OutsideCorrelationRange);
    }
    if !(latent_heat_j_kg > 0.0) {
        return Err(ThermoError::NonPositiveZValue);
    }
    let steam_generated_kg_s = power_into_contents_w / latent_heat_j_kg;
    let condensate_returned_kg_s = steam_generated_kg_s.min(lid_condensation_capacity_kg_s);
    let net_loss_kg_s = steam_generated_kg_s - condensate_returned_kg_s;
    Ok(CoveredWaterLoss {
        steam_generated_kg_s,
        condensate_returned_kg_s,
        net_loss_kg_s,
        holding: net_loss_kg_s == 0.0,
        return_fraction: if steam_generated_kg_s == 0.0 {
            1.0
        } else {
            condensate_returned_kg_s / steam_generated_kg_s
        },
    })
}
