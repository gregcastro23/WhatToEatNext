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
