//! Cross-runtime parity for the culinary physics engine — the Rust half.
//!
//! The formula set is implemented ONCE PER RUNTIME: here in `thermo-core`
//! (linked by both the SpacetimeDB module and the browser WASM engine), and in
//! TypeScript in `src/lib/cooking/thermo.ts` (which the server renders and the
//! browser falls back to whenever the WASM module fails to load).
//!
//! Nothing in either build stops those two from drifting apart. The only
//! defence is that both must reproduce the SAME golden vectors exactly, so both
//! test suites read `thermo_golden_vectors.json`. The TypeScript half is
//! `src/__tests__/cookingThermoCrossRuntimeParity.test.ts`.
//!
//! ## Why this file is not circular
//!
//! The fixture is generated from this crate, so "Rust reproduces the fixture"
//! is nearly a tautology — it would pass just as happily against a defect. Two
//! things stop that from being the whole story:
//!
//!   1. The exact-equality assertions on the TypeScript side are the real
//!      drift detector. This file's job is to fail loudly when someone edits
//!      the physics and forgets to regenerate, so the fixture can never quietly
//!      describe a version of the code that no longer exists.
//!   2. `external_anchors_still_hold` checks the computed values against
//!      published figures from OUTSIDE this repository. Regenerating the
//!      fixture cannot launder a wrong number past those, because the bands are
//!      not read back from the values they judge.
//!
//! `[MEASURED 2026-08-16]` Before the shared core existed, the Rust and
//! TypeScript implementations disagreed in three ways that no amount of
//! reviewing found and one afternoon of measuring did: a food-effusivity
//! literal 0.018 off its own stated basis, an Antoine validity envelope of
//! 0–105 °C against 1–100 °C, and a convection buoyancy constant 6× apart.

use serde_json::Value;
use thermo_core::*;

fn fixture() -> Value {
    let raw = include_str!("thermo_golden_vectors.json");
    serde_json::from_str(raw).expect("golden vectors must be valid JSON")
}

fn f(v: &Value) -> f64 {
    v.as_f64().expect("expected a number")
}

/// Exact equality on the bit pattern.
///
/// Deliberately not an epsilon. `toBeCloseTo(…, 15)` once passed against three
/// separately wrong constants elsewhere in this repository; a tolerance here
/// would wave through exactly the class of drift this file exists to catch.
///
/// The ONE exception is the slabEigenvalue tan-bisection family — see
/// `assert_slab_ulps` below.
fn assert_bits_eq(actual: f64, expected: f64, what: &str) {
    assert_eq!(
        actual.to_bits(),
        expected.to_bits(),
        "{what}: got {actual:.17e}, fixture has {expected:.17e} (Δ {:.3e})",
        (actual - expected).abs()
    );
}

/// Measured ULP budget for values derived from the `slabEigenvalue` tan
/// bisection, and for NOTHING else.
///
/// ⚠️ A MEASUREMENT, NOT A COMFORT MARGIN — the same budget, for the same
/// reason, as MAX_ULP in scripts/verify-thermo-wasm-parity.mjs: across the
/// three runtimes every disagreement sits in this one family (worst observed
/// 4 ULP), because `tan` comes from each platform's libm while everything else
/// here reproduces bit-identically.
///
/// `[MEASURED 2026-08-16, PR #768]` The first-ever linux run of this suite
/// found glibc computing the roasting slab cook time 2 ULPs (Δ 7.1e-15) from
/// the macOS-generated fixture. The fixture is not wrong and neither is glibc;
/// bit-exactness across host libms is not a promise `tan` makes. A genuinely
/// wrong constant lands at 1e-7 relative or worse — eight orders of magnitude
/// outside this window. Do not raise the budget to make a failure go away.
const SLAB_MAX_ULP: u64 = 8;

/// ULP distance for same-sign finite doubles (every slab quantity is positive).
fn ulp_distance(a: f64, b: f64) -> u64 {
    (a.to_bits() as i64).abs_diff(b.to_bits() as i64)
}

fn assert_slab_ulps(actual: f64, expected: f64, what: &str) {
    let d = ulp_distance(actual, expected);
    assert!(
        d <= SLAB_MAX_ULP,
        "{what}: got {actual:.17e}, fixture has {expected:.17e} (Δ {:.3e}, {d} ULPs > {SLAB_MAX_ULP})",
        (actual - expected).abs()
    );
}

#[test]
fn constants_match_the_fixture() {
    let g = fixture();
    let c = &g["constants"];
    assert_bits_eq(STEFAN_BOLTZMANN, f(&c["STEFAN_BOLTZMANN"]), "STEFAN_BOLTZMANN");
    assert_bits_eq(KPA_TO_MMHG, f(&c["KPA_TO_MMHG"]), "KPA_TO_MMHG");
    assert_bits_eq(ANTOINE_A, f(&c["ANTOINE_A"]), "ANTOINE_A");
    assert_bits_eq(ANTOINE_B, f(&c["ANTOINE_B"]), "ANTOINE_B");
    assert_bits_eq(ANTOINE_C, f(&c["ANTOINE_C"]), "ANTOINE_C");
    assert_bits_eq(ISA_EXPONENT, f(&c["ISA_EXPONENT"]), "ISA_EXPONENT");
    assert_bits_eq(ISA_LAPSE_RATIO, f(&c["ISA_LAPSE_RATIO"]), "ISA_LAPSE_RATIO");
    assert_bits_eq(ISA_P0_KPA, f(&c["ISA_P0_KPA"]), "ISA_P0_KPA");
    assert_bits_eq(Z_VALUE_CULINARY_C, f(&c["Z_VALUE_CULINARY_C"]), "Z_VALUE_CULINARY_C");
    assert_bits_eq(Q10_CULINARY, f(&c["Q10_CULINARY"]), "Q10_CULINARY");
    assert_bits_eq(z_value_from_q10(Q10_CULINARY), f(&c["Z_FROM_Q10"]), "Z_FROM_Q10");
    assert_bits_eq(
        food_effusivity_lean_meat(),
        f(&c["FOOD_EFFUSIVITY_LEAN_MEAT"]),
        "FOOD_EFFUSIVITY_LEAN_MEAT",
    );
}

#[test]
fn boiling_point_matches_the_fixture() {
    for row in fixture()["boilingPoint"].as_array().unwrap() {
        let p = f(&row["pressureKpa"]);
        let got = boiling_point_c(p).unwrap();
        assert_bits_eq(got, f(&row["celsius"]), &format!("boilingPointC({p})"));
    }
}

#[test]
fn elevation_matches_the_fixture() {
    for row in fixture()["elevation"].as_array().unwrap() {
        let e = f(&row["elevationM"]);
        assert_bits_eq(
            pressure_from_elevation(e).unwrap(),
            f(&row["pressureKpa"]),
            &format!("pressureFromElevation({e})"),
        );
        assert_bits_eq(
            boiling_point_at_elevation(e).unwrap(),
            f(&row["boilingC"]),
            &format!("boilingPointCAtElevation({e})"),
        );
        assert_bits_eq(
            altitude_time_multiplier(e, AltitudeRegime::Softening).unwrap(),
            f(&row["softeningMultiplier"]),
            &format!("altitude softening @{e}"),
        );
        assert_bits_eq(
            altitude_time_multiplier(e, AltitudeRegime::Pasteurisation).unwrap(),
            f(&row["pasteurisationMultiplier"]),
            &format!("altitude pasteurisation @{e}"),
        );
    }
}

#[test]
fn slab_eigenvalues_match_the_fixture() {
    for row in fixture()["slabEigen"].as_array().unwrap() {
        let bi = f(&row["biot"]);
        let lambda = slab_eigenvalue(bi).unwrap();
        assert_slab_ulps(lambda, f(&row["lambda1"]), &format!("λ₁(Bi={bi})"));
        assert_slab_ulps(
            slab_coefficient(lambda),
            f(&row["coefficientA1"]),
            &format!("A₁(Bi={bi})"),
        );
    }
}

#[test]
fn bessel_series_matches_the_fixture_bit_exactly() {
    // NOT `assert_slab_ulps`. The series is `+ − × ÷` only, so unlike the tan
    // family it owes no debt to the host libm and must reproduce to the bit.
    // If this ever needs a ULP budget, the series has been changed into
    // something that calls a transcendental and that is the bug.
    for row in fixture()["bessel"].as_array().unwrap() {
        let x = f(&row["x"]);
        assert_bits_eq(bessel_j0(x), f(&row["j0"]), &format!("J₀({x})"));
        assert_bits_eq(bessel_j1(x), f(&row["j1"]), &format!("J₁({x})"));
    }
}

#[test]
fn bessel_j0_vanishes_at_its_first_zero() {
    // Anchors BESSEL_J0_FIRST_ZERO against the function it claims to be the
    // zero of, so a mistyped digit in the constant cannot pass unnoticed. The
    // constant bounds the cylinder eigenvalue search, so a wrong one would
    // silently truncate the bisection interval.
    assert!(
        bessel_j0(BESSEL_J0_FIRST_ZERO).abs() < 1e-15,
        "J₀ at the tabulated first zero should vanish, got {:.3e}",
        bessel_j0(BESSEL_J0_FIRST_ZERO)
    );
}

#[test]
fn geometry_eigenvalues_match_the_fixture() {
    for row in fixture()["geometryEigen"].as_array().unwrap() {
        let bi = f(&row["biot"]);
        let name = row["geometry"].as_str().unwrap();
        let geom = match name {
            "slab" => FoodGeometry::Slab,
            "cylinder" => FoodGeometry::Cylinder,
            "sphere" => FoodGeometry::Sphere,
            other => panic!("unknown geometry in fixture: {other}"),
        };
        let lambda = geometry_eigenvalue(geom, bi).unwrap();
        assert_slab_ulps(lambda, f(&row["lambda1"]), &format!("λ₁({name}, Bi={bi})"));
        assert_slab_ulps(
            geometry_coefficient(geom, lambda),
            f(&row["coefficientA1"]),
            &format!("A₁({name}, Bi={bi})"),
        );
        assert_bits_eq(
            geom.characteristic_length_ratio(),
            f(&row["lengthRatio"]),
            &format!("Lc/R({name})"),
        );
    }
}

#[test]
fn the_geometry_path_and_the_slab_path_agree_exactly() {
    // `slab_eigenvalue` and `geometry_eigenvalue(Slab, …)` are two entry points
    // to one answer. Nothing in the type system stops them drifting, and a
    // caller has no way to tell which one a given panel used.
    for row in fixture()["slabEigen"].as_array().unwrap() {
        let bi = f(&row["biot"]);
        assert_bits_eq(
            geometry_eigenvalue(FoodGeometry::Slab, bi).unwrap(),
            slab_eigenvalue(bi).unwrap(),
            &format!("slab λ₁ via both paths (Bi={bi})"),
        );
    }
}

#[test]
fn a_sphere_cores_faster_than_a_slab_at_equal_biot() {
    // The ordering IS the physics: more surface feeding the same volume means a
    // larger eigenvalue, and λ₁ enters the exponent as λ₁², so the sphere's
    // Fourier time is the shortest of the three. If this ever inverts, the
    // residuals have been mixed up between geometries — a swap the fixture
    // alone would happily ratify, since it was generated from the same code.
    for bi in [0.1_f64, 1.0, 10.0, 100.0] {
        let slab = geometry_eigenvalue(FoodGeometry::Slab, bi).unwrap();
        let cyl = geometry_eigenvalue(FoodGeometry::Cylinder, bi).unwrap();
        let sph = geometry_eigenvalue(FoodGeometry::Sphere, bi).unwrap();
        assert!(
            slab < cyl && cyl < sph,
            "at Bi={bi} expected λ₁ slab < cylinder < sphere, got {slab} / {cyl} / {sph}"
        );
    }
}

#[test]
fn geometry_eigenvalues_reproduce_the_published_table() {
    // EXTERNAL anchor, not a self-check: Incropera & DeWitt, Fundamentals of
    // Heat and Mass Transfer, Table 5.1. The fixture above was generated from
    // this same code, so it can only catch drift — it cannot catch the whole
    // family being wrong. These values were not.
    //
    // Tolerance is 5e-5 because the table is PRINTED to four decimals; that is
    // the table's precision, not a margin chosen to make this pass.
    // clippy reads the 1.5708 below as a fumbled FRAC_PI_2. It is not an
    // approximation of anything — it is the figure Table 5.1 PRINTS, copied as
    // printed. That it happens to be π/2 to four places is a real property of
    // the sphere at Bi = 1 (cot(π/2) = 0, so 1 − λ·cot λ = 1 exactly there),
    // and `the_sphere_at_biot_one_is_exactly_half_pi` asserts that separately.
    // Replacing it with the constant would silently upgrade the book's
    // four-decimal print to full precision and destroy what this test checks.
    #[allow(clippy::approx_constant)]
    let table: [(&str, f64, f64, f64); 9] = [
        ("slab", 0.1, 0.3111, 1.0161),
        ("cylinder", 0.1, 0.4417, 1.0246),
        ("sphere", 0.1, 0.5423, 1.0298),
        ("slab", 1.0, 0.8603, 1.1191),
        ("cylinder", 1.0, 1.2558, 1.2071),
        ("sphere", 1.0, 1.5708, 1.2732),
        ("slab", 10.0, 1.4289, 1.2620),
        ("cylinder", 10.0, 2.1795, 1.5677),
        ("sphere", 10.0, 2.8363, 1.9249),
    ];
    for (name, bi, want_lambda, want_a1) in table {
        let geom = match name {
            "slab" => FoodGeometry::Slab,
            "cylinder" => FoodGeometry::Cylinder,
            _ => FoodGeometry::Sphere,
        };
        let lambda = geometry_eigenvalue(geom, bi).unwrap();
        let a1 = geometry_coefficient(geom, lambda);
        assert!(
            (lambda - want_lambda).abs() < 5e-5,
            "λ₁({name}, Bi={bi}) = {lambda}, Incropera Table 5.1 prints {want_lambda}"
        );
        assert!(
            (a1 - want_a1).abs() < 5e-5,
            "A₁({name}, Bi={bi}) = {a1}, Incropera Table 5.1 prints {want_a1}"
        );
    }
}

#[test]
fn the_sphere_at_biot_one_is_exactly_half_pi() {
    // An anchor that owes nothing to the fixture, the table, or a tolerance.
    // At Bi = 1 the sphere equation 1 − λ·cot λ = Bi reduces to cot λ = 0, so
    // λ₁ is π/2 exactly. Any residual reformulation that moved the root would
    // land here first — including the sin-λ multiply-through, which is why this
    // is worth a test of its own rather than a comment.
    let lambda = geometry_eigenvalue(FoodGeometry::Sphere, 1.0).unwrap();
    assert!(
        (lambda - std::f64::consts::FRAC_PI_2).abs() < 1e-15,
        "sphere λ₁(Bi=1) should be π/2 exactly, got {lambda} (Δ {:.3e})",
        (lambda - std::f64::consts::FRAC_PI_2).abs()
    );
}

#[test]
fn choi_okos_component_properties_match_the_fixture() {
    for row in fixture()["choiOkosComponents"].as_array().unwrap() {
        let name = row["component"].as_str().unwrap();
        let c = match name {
            "water" => FoodComponent::Water,
            "protein" => FoodComponent::Protein,
            "fat" => FoodComponent::Fat,
            "carbohydrate" => FoodComponent::Carbohydrate,
            "fibre" => FoodComponent::Fibre,
            "ash" => FoodComponent::Ash,
            "ice" => FoodComponent::Ice,
            other => panic!("unknown component in fixture: {other}"),
        };
        let t = f(&row["celsius"]);
        // Pure polynomial arithmetic — no transcendental anywhere, so these owe
        // nothing to the host libm and must reproduce to the bit.
        assert_bits_eq(
            component_conductivity(c, t).unwrap(),
            f(&row["k"]),
            &format!("k({name}, {t} C)"),
        );
        assert_bits_eq(
            component_density(c, t).unwrap(),
            f(&row["rho"]),
            &format!("rho({name}, {t} C)"),
        );
        assert_bits_eq(
            component_specific_heat(c, t).unwrap(),
            f(&row["cp"]),
            &format!("cp({name}, {t} C)"),
        );
    }
}

#[test]
fn choi_okos_mixtures_match_the_fixture() {
    for row in fixture()["choiOkosMixtures"].as_array().unwrap() {
        let name = row["name"].as_str().unwrap();
        let r = food_properties(
            MassFractions {
                water: f(&row["water"]),
                protein: f(&row["protein"]),
                fat: f(&row["fat"]),
                carbohydrate: f(&row["carbohydrate"]),
                fibre: f(&row["fibre"]),
                ash: f(&row["ash"]),
            },
            f(&row["celsius"]),
            0.0,
        )
        .unwrap();
        assert_bits_eq(r.density_kg_m3, f(&row["density"]), &format!("{name} rho"));
        assert_bits_eq(
            r.specific_heat_j_kg_k,
            f(&row["specificHeat"]),
            &format!("{name} cp"),
        );
        assert_bits_eq(
            r.conductivity_w_m_k,
            f(&row["conductivity"]),
            &format!("{name} k"),
        );
        assert_bits_eq(
            r.diffusivity_m2_s,
            f(&row["diffusivity"]),
            &format!("{name} alpha"),
        );
        assert_bits_eq(
            r.unaccounted_fraction,
            f(&row["unaccounted"]),
            &format!("{name} unaccounted"),
        );
    }
}

#[test]
fn choi_okos_reproduces_the_published_worked_example() {
    // EXTERNAL anchor. ASHRAE 1998 Refrigeration Handbook Ch. 8, Example 2:
    // lamb at 41 F, x_wo 0.7342 / x_p 0.2029 / x_f 0.0525 / x_a 0.0106, worked
    // through to c = 0.858 Btu/(lb.F). The fixture was generated from this same
    // code and cannot vouch for the coefficients being right; this can.
    //
    // The chapter also prints each component value at 41 F, so the individual
    // polynomials are checked, not just their weighted sum.
    let t = (41.0 - 32.0) * 5.0 / 9.0;
    for (c, want) in [
        (FoodComponent::Water, 0.9974),
        (FoodComponent::Protein, 0.4811),
        (FoodComponent::Fat, 0.4756),
        (FoodComponent::Ash, 0.2632),
    ] {
        let btu = component_specific_heat(c, t).unwrap() / CP_IMPERIAL_TO_SI;
        assert!(
            (btu - want).abs() < 5e-5,
            "cp({c:?}) at 41 F = {btu}, ASHRAE prints {want}"
        );
    }
    let lamb = food_properties(
        MassFractions { water: 0.7342, protein: 0.2029, fat: 0.0525, carbohydrate: 0.0, fibre: 0.0, ash: 0.0106 },
        t,
        0.0,
    )
    .unwrap();
    let btu = lamb.specific_heat_j_kg_k / CP_IMPERIAL_TO_SI;
    assert!(
        (btu - 0.858).abs() < 5e-4,
        "mixture cp at 41 F = {btu} Btu/(lb.F), ASHRAE Example 2 gives 0.858"
    );
}

#[test]
fn choi_okos_refuses_to_extrapolate_past_its_fit() {
    // The fits are stated for -40 to 300 F. Past that they are still smooth and
    // still return a number, which is precisely why refusing has to be explicit.
    assert_eq!(
        component_conductivity(FoodComponent::Water, CHOI_OKOS_MAX_C + 0.1),
        Err(ThermoError::OutsideCorrelationRange)
    );
    assert_eq!(
        component_density(FoodComponent::Protein, CHOI_OKOS_MIN_C - 0.1),
        Err(ThermoError::OutsideCorrelationRange)
    );
    // A fraction above 1 is almost certainly grams per 100 g.
    assert_eq!(
        food_properties(
            MassFractions { water: 88.3, protein: 0.0, fat: 0.0, carbohydrate: 0.0, fibre: 0.0, ash: 0.0 },
            20.0,
            0.0
        ),
        Err(ThermoError::OutsideCorrelationRange)
    );
}

#[test]
fn the_water_specific_heat_branch_actually_switches_at_freezing() {
    // Two DIFFERENT published fits meet at 32 F. If the branch were dropped, the
    // above-freezing polynomial would extrapolate smoothly downward and nothing
    // would look wrong — it is 40 % low at -40 C.
    let below = component_specific_heat(FoodComponent::Water, -40.0).unwrap();
    let above = component_specific_heat(FoodComponent::Water, 0.0).unwrap();
    assert!(
        below > above * 1.3,
        "supercooled water cp should be far above the 0 C value, got {below} vs {above}"
    );
}

#[test]
fn latent_heat_matches_the_fixture() {
    let g = fixture();
    let l = &g["latentHeat"];
    assert_bits_eq(water_fusion_j_kg(), f(&l["waterFusionJkg"]), "water fusion");
    assert_bits_eq(
        BOUND_WATER_FRACTION,
        f(&l["boundWaterFraction"]),
        "bound water fraction",
    );
    for row in l["vaporisation"].as_array().unwrap() {
        let t = f(&row["celsius"]);
        assert_bits_eq(
            latent_heat_vaporisation(t).unwrap(),
            f(&row["jPerKg"]),
            &format!("h_fg({t} C)"),
        );
    }
    for row in l["foods"].as_array().unwrap() {
        let name = row["name"].as_str().unwrap();
        let w = f(&row["water"]);
        let t = f(&row["celsius"]);
        assert_bits_eq(
            freezable_water_fraction(w).unwrap(),
            f(&row["freezable"]),
            &format!("{name} freezable"),
        );
        assert_bits_eq(
            food_fusion_enthalpy(w).unwrap(),
            f(&row["fusionJkg"]),
            &format!("{name} fusion"),
        );
        assert_bits_eq(
            food_vaporisation_enthalpy(w, t).unwrap(),
            f(&row["vaporisationJkg"]),
            &format!("{name} vaporisation"),
        );
        assert_bits_eq(
            evaporative_energy_loss(0.05, t).unwrap(),
            f(&row["lossFivePercentJkg"]),
            &format!("{name} 5% loss"),
        );
    }
}

#[test]
fn latent_heat_reproduces_the_steam_tables() {
    // EXTERNAL anchor. Saturation enthalpy of vaporisation, kJ/kg, from the
    // steam tables — a source entirely outside this repository, which the
    // Rust-generated fixture cannot vouch for.
    //
    // `[MEASURED 2026-08-18]` the Fleagle & Andreas fit sits within 0.707 %
    // across 0-100 C. That bound is a MEASUREMENT of this fit, not a comfort
    // margin: it is 0.042 % at 0 C and worst at the boil.
    for (t, table_kj) in [(0.0, 2500.9), (20.0, 2453.5), (50.0, 2382.0), (100.0, 2256.5)] {
        let ours = latent_heat_vaporisation(t).unwrap() / 1000.0;
        let rel = (ours - table_kj).abs() / table_kj;
        assert!(
            rel < 0.008,
            "h_fg({t} C) = {ours} kJ/kg vs steam table {table_kj} ({:.3} %)",
            rel * 100.0
        );
    }
    // The fusion constant must regenerate from ASHRAE's 143.4 Btu/lb to the
    // standard 333.55 kJ/kg — the check that it was converted, not transcribed.
    assert!(
        (water_fusion_j_kg() - 333_550.0).abs() < 5.0,
        "water fusion {} J/kg should reproduce the standard 333550",
        water_fusion_j_kg()
    );
}

#[test]
fn latent_heat_refuses_to_extrapolate_past_the_boil() {
    // The fit is linear and the true curve falls to zero at the critical point,
    // so above 100 C it stays finite and wrong rather than failing visibly.
    assert_eq!(
        latent_heat_vaporisation(100.1),
        Err(ThermoError::OutsideCorrelationRange)
    );
    assert_eq!(
        latent_heat_vaporisation(-0.1),
        Err(ThermoError::OutsideCorrelationRange)
    );
}

#[test]
fn bound_water_is_not_quietly_dropped() {
    // Omitting the bound-water correction overstates the freezing load by 25 %,
    // and nothing about the resulting number looks wrong. This pins the gap
    // between the two so the correction cannot be removed silently.
    let water = 0.883;
    let with_binding = food_fusion_enthalpy(water).unwrap();
    let naive = water * water_fusion_j_kg();
    assert!(
        (naive / with_binding - 1.25).abs() < 1e-9,
        "ignoring bound water should overstate by exactly 25 %, got {}",
        naive / with_binding
    );
}

#[test]
fn evaporation_dwarfs_sensible_heating() {
    // The claim the whole file exists to support, asserted rather than narrated:
    // losing a few percent of a food's mass to steam costs more energy than a
    // large temperature rise. Chicken breast at 70 C, cp from Choi & Okos.
    let cp = food_properties(
        MassFractions { water: 0.653, protein: 0.3102, fat: 0.0357, carbohydrate: 0.0, fibre: 0.0, ash: 0.0106 },
        70.0,
        0.0,
    )
    .unwrap()
    .specific_heat_j_kg_k;
    let five_percent = evaporative_energy_loss(0.05, 70.0).unwrap();
    let kelvin = latent_as_temperature_rise(five_percent, cp).unwrap();
    assert!(
        kelvin > 25.0,
        "5 % moisture loss should be worth more than 25 K of sensible heating, got {kelvin}"
    );
}

#[test]
fn slab_cook_times_match_the_fixture() {
    for row in fixture()["slabCookTime"].as_array().unwrap() {
        let name = row["name"].as_str().unwrap();
        let r = slab_core_time(SlabCookInput {
            thickness_mm: f(&row["thicknessMm"]),
            medium_c: f(&row["mediumC"]),
            initial_c: f(&row["initialC"]),
            target_c: f(&row["targetC"]),
            h_w_m2_k: f(&row["hWm2K"]),
            k_w_m_k: LEAN_MEAT_K_W_M_K,
            alpha_m2_s: LEAN_MEAT_ALPHA_M2_S,
            one_sided: row["oneSided"].as_bool().unwrap(),
        })
        .unwrap();
        assert_slab_ulps(r.minutes, f(&row["minutes"]), &format!("{name} minutes"));
        // Bi = h·L/k is pure arithmetic — no transcendental, no band.
        assert_bits_eq(r.biot, f(&row["biot"]), &format!("{name} Bi"));
        assert_slab_ulps(r.fourier, f(&row["fourier"]), &format!("{name} Fo"));
        assert_slab_ulps(r.lambda1, f(&row["lambda1"]), &format!("{name} λ₁"));
        assert_slab_ulps(
            r.coefficient_a1,
            f(&row["coefficientA1"]),
            &format!("{name} A₁"),
        );
        assert_eq!(
            r.one_term_valid,
            row["oneTermValid"].as_bool().unwrap(),
            "{name} one-term validity"
        );
    }
}

#[test]
fn radiation_matches_the_fixture() {
    for row in fixture()["radiation"].as_array().unwrap() {
        let (s, sf, e, v) = (
            f(&row["sourceK"]),
            f(&row["surfaceK"]),
            f(&row["emissivity"]),
            f(&row["viewFactor"]),
        );
        assert_bits_eq(
            radiant_flux_kw_m2(s, sf, e, v),
            f(&row["fluxKwM2"]),
            &format!("flux({s}, {sf})"),
        );
        assert_bits_eq(
            radiative_h(s, sf, e),
            f(&row["radiativeH"]),
            &format!("h_rad({s}, {sf})"),
        );
    }
}

#[test]
fn contact_temperatures_match_the_fixture() {
    let food = food_effusivity_lean_meat();
    for row in fixture()["contact"].as_array().unwrap() {
        let name = row["material"].as_str().unwrap();
        let e = effusivity(f(&row["kWmK"]), f(&row["rhoKgM3"]), f(&row["cJkgK"]));
        assert_bits_eq(e, f(&row["effusivity"]), &format!("{name} effusivity"));
        assert_bits_eq(
            contact_temperature_c(230.0, 5.0, e, food),
            f(&row["contactC"]),
            &format!("{name} contact temperature"),
        );
    }
}

#[test]
fn wet_bulb_matches_the_fixture() {
    for row in fixture()["wetBulb"].as_array().unwrap() {
        let (t, rh) = (f(&row["dryBulbC"]), f(&row["relativeHumidityPct"]));
        match wet_bulb_c(t, rh) {
            Some(v) => assert_bits_eq(v, f(&row["wetBulbC"]), &format!("wetBulb({t}, {rh})")),
            None => assert!(
                row["wetBulbC"].is_null(),
                "wetBulb({t}, {rh}) declined but the fixture has a value"
            ),
        }
    }
}

#[test]
fn simulation_trace_matches_the_fixture() {
    let g = fixture();
    let sim = &g["simulation"];
    assert_bits_eq(BUOYANCY_PER_K as f64, f(&sim["buoyancyPerK"]), "buoyancyPerK");
    assert_bits_eq(
        SWIRL_AMPLITUDE as f64,
        f(&sim["swirlAmplitude"]),
        "swirlAmplitude",
    );
    assert_bits_eq(CONVECTION_DRAG as f64, f(&sim["drag"]), "drag");
    assert_eq!(
        FLOATS_PER_PARTICLE as u64,
        sim["floatsPerParticle"].as_u64().unwrap()
    );

    let mut ps = seeded_particles(8);
    let mut expected = sim["trace"].as_array().unwrap().iter();
    let mut next = expected.next();
    for step in 1..=60u64 {
        step_oven_simulation(&mut ps, 1.0 / 60.0, 175.0, 25.0, 505.0);
        if let Some(row) = next
            && row["step"].as_u64().unwrap() == step
        {
            {
                let p = ps[row["particle"].as_u64().unwrap() as usize];
                assert_bits_eq(p.x as f64, f(&row["x"]), &format!("step {step} x"));
                assert_bits_eq(p.y as f64, f(&row["y"]), &format!("step {step} y"));
                assert_bits_eq(p.z as f64, f(&row["z"]), &format!("step {step} z"));
                assert_bits_eq(p.vy as f64, f(&row["vy"]), &format!("step {step} vy"));
                assert_bits_eq(
                    p.temp_c as f64,
                    f(&row["tempC"]),
                    &format!("step {step} tempC"),
                );
                next = expected.next();
            }
        }
    }
    assert!(next.is_none(), "not every trace row was reached");
}

/// Every regime, pinned with the real numbers of a method that cooks in it.
///
/// The trace above pins ONE motion model. This pins the other nine, and it is
/// the only thing standing between the two runtimes and a regime that silently
/// exists on one side alone — the failure mode the whole layer was added to
/// remove, so it does not get to rely on the layer's own good intentions.
#[test]
fn regime_traces_match_the_fixture() {
    let g = fixture();
    let cases = g["simulation"]["regimes"].as_array().unwrap();
    assert_eq!(cases.len(), 10, "every regime must carry a vector");

    for case in cases {
        let name = case["name"].as_str().unwrap();
        let regime = HeatRegime::from_u8(case["regime"].as_u64().unwrap() as u8)
            .unwrap_or_else(|| panic!("{name}: unknown discriminant in the fixture"));

        // The parameters, not just the trajectory. A regime whose buoyancy has
        // been retuned produces a different trace, but so does one whose
        // *inputs* moved — asserting both says which happened.
        let p = regime_params(regime);
        let fp = &case["params"];
        assert_bits_eq(
            p.buoyancy_per_k as f64,
            f(&fp["buoyancyPerK"]),
            &format!("{name} buoyancyPerK"),
        );
        assert_bits_eq(p.swirl as f64, f(&fp["swirl"]), &format!("{name} swirl"));
        assert_bits_eq(p.drag as f64, f(&fp["drag"]), &format!("{name} drag"));
        assert_bits_eq(
            p.nucleation_per_s as f64,
            f(&fp["nucleationPerS"]),
            &format!("{name} nucleationPerS"),
        );
        assert_bits_eq(
            p.nucleation_dir as f64,
            f(&fp["nucleationDir"]),
            &format!("{name} nucleationDir"),
        );
        assert_bits_eq(
            p.cooling_sign as f64,
            f(&fp["coolingSign"]),
            &format!("{name} coolingSign"),
        );

        let medium_c = f(&case["mediumC"]) as f32;
        let h = f(&case["hWm2K"]) as f32;
        let radiant_k = f(&case["radiantSourceK"]) as f32;

        let mut ps = seeded_particles(8);
        let mut expected = case["trace"].as_array().unwrap().iter();
        let mut next = expected.next();
        for step in 1..=60u64 {
            step_medium_simulation(&mut ps, 1.0 / 60.0, regime, medium_c, h, radiant_k);
            if let Some(row) = next
                && row["step"].as_u64().unwrap() == step
            {
                let p = ps[row["particle"].as_u64().unwrap() as usize];
                assert_bits_eq(p.x as f64, f(&row["x"]), &format!("{name} step {step} x"));
                assert_bits_eq(p.y as f64, f(&row["y"]), &format!("{name} step {step} y"));
                assert_bits_eq(p.z as f64, f(&row["z"]), &format!("{name} step {step} z"));
                assert_bits_eq(p.vy as f64, f(&row["vy"]), &format!("{name} step {step} vy"));
                assert_bits_eq(
                    p.temp_c as f64,
                    f(&row["tempC"]),
                    &format!("{name} step {step} tempC"),
                );
                assert_bits_eq(
                    p.phase_frac as f64,
                    f(&row["phaseFrac"]),
                    &format!("{name} step {step} phaseFrac"),
                );
                next = expected.next();
            }
        }
        assert!(next.is_none(), "{name}: not every trace row was reached");
    }
}

/// The part of this file that is NOT circular.
///
/// These bands come from published sources outside this repository, and they
/// are asserted against the freshly COMPUTED values — not read back from the
/// fixture's own numbers. Regenerating the fixture cannot make a wrong constant
/// pass here.
#[test]
fn external_anchors_still_hold() {
    let g = fixture();
    let a = &g["externalAnchors"];

    // Denver's published boiling point.
    let denver = &a["denverBoilingF"];
    let computed_f = c_to_f(boiling_point_at_elevation(f(&denver["elevationM"])).unwrap());
    assert!(
        (computed_f - f(&denver["published"])).abs() <= f(&denver["toleranceF"]),
        "Denver: computed {computed_f} °F vs published {} °F ({})",
        f(&denver["published"]),
        denver["source"].as_str().unwrap()
    );

    // Sea level, by definition of the Celsius scale.
    let sea = &a["seaLevelBoilingC"];
    let computed_c = boiling_point_c(ISA_P0_KPA).unwrap();
    assert!(
        (computed_c - f(&sea["published"])).abs() <= f(&sea["toleranceC"]),
        "sea level: computed {computed_c} °C"
    );

    // Baldwin's sous-vide tables.
    let baldwin = &a["baldwinSousVideMin"];
    let r = slab_core_time(SlabCookInput::lean_meat(25.0, 55.0, 5.0, 54.5, 95.0)).unwrap();
    assert!(
        r.minutes >= f(&baldwin["low"]) && r.minutes <= f(&baldwin["high"]),
        "Baldwin: computed {} min, published band {}–{} ({})",
        r.minutes,
        f(&baldwin["low"]),
        f(&baldwin["high"]),
        baldwin["source"].as_str().unwrap()
    );

    // The ISA published exponent — the check that would have caught a CODATA
    // gas constant being substituted for the ISA-defined one.
    let isa = &a["isaExponent"];
    assert!(
        (ISA_EXPONENT - f(&isa["published"])).abs() <= f(&isa["tolerance"]),
        "ISA exponent {ISA_EXPONENT} vs published {}",
        f(&isa["published"])
    );

    // CODATA, exact by SI definition — tolerance is literally zero.
    let sigma = &a["stefanBoltzmann"];
    assert!(
        (STEFAN_BOLTZMANN - f(&sigma["published"])).abs() <= f(&sigma["tolerance"]),
        "Stefan–Boltzmann drifted from the CODATA definition"
    );
}

// ============================================================================
// Boundary network
// ============================================================================

#[test]
fn boundary_network_matches_fixture() {
    let g = fixture();
    let bn = &g["boundaryNetwork"];

    for row in bn["air"].as_array().unwrap() {
        let a = air_properties(f(&row["celsius"])).unwrap();
        assert_bits_eq(a.rho_kg_m3, f(&row["rho"]), "air rho");
        assert_bits_eq(a.cp_j_kg_k, f(&row["cp"]), "air cp");
        assert_bits_eq(a.mu_pa_s, f(&row["mu"]), "air mu");
        assert_bits_eq(a.k_w_m_k, f(&row["k"]), "air k");
        assert_bits_eq(a.nu_m2_s, f(&row["nu"]), "air nu");
        assert_bits_eq(a.alpha_m2_s, f(&row["alpha"]), "air alpha");
        assert_bits_eq(a.prandtl, f(&row["prandtl"]), "air Pr");
        assert_bits_eq(a.beta_per_k, f(&row["beta"]), "air beta");
    }

    for row in bn["water"].as_array().unwrap() {
        let w = saturated_water_properties(f(&row["celsius"])).unwrap();
        assert_bits_eq(w.fluid.rho_kg_m3, f(&row["rho"]), "water rho");
        assert_bits_eq(w.fluid.prandtl, f(&row["prandtl"]), "water Pr");
        assert_bits_eq(w.fluid.beta_per_k, f(&row["beta"]), "water beta");
        assert_bits_eq(w.sigma_n_m, f(&row["sigma"]), "water sigma");
        assert_bits_eq(w.hfg_j_kg, f(&row["hfg"]), "water hfg");
        assert_bits_eq(w.rho_vapour_kg_m3, f(&row["rhoVapour"]), "water rhoVapour");
    }

    for row in bn["vapour"].as_array().unwrap() {
        let c = f(&row["celsius"]);
        let p = saturation_pressure_kpa(c).unwrap();
        assert_bits_eq(p, f(&row["satKpa"]), "satKpa");
        assert_bits_eq(vapour_density_kg_m3(p, c), f(&row["rhoSat"]), "rhoSat");
        assert_bits_eq(
            absolute_humidity_kg_m3(c, 50.0).unwrap(),
            f(&row["absHumid50"]),
            "absHumid50",
        );
        assert_bits_eq(
            humid_air_vapour_density(c, 50.0, 200.0).unwrap(),
            f(&row["heatedTo200"]),
            "heatedTo200",
        );
    }

    let film = air_properties(60.0).unwrap();
    for row in bn["convection"].as_array().unwrap() {
        let surface = match row["surface"].as_str().unwrap() {
            "vertical" => ConvectiveSurface::Vertical,
            "horizontal-up" => ConvectiveSurface::HorizontalUp,
            "horizontal-down" => ConvectiveSurface::HorizontalDown,
            "horizontal-cylinder" => ConvectiveSurface::HorizontalCylinder,
            other => panic!("unknown surface {other}"),
        };
        let r = natural_convection_h(&film, surface, 80.0, f(&row["lengthM"])).unwrap();
        assert_bits_eq(r.dimensionless, f(&row["rayleigh"]), "convection Ra");
        assert_bits_eq(r.nusselt, f(&row["nusselt"]), "convection Nu");
        assert_bits_eq(r.h_w_m2_k, f(&row["h"]), "convection h");
    }

    let w100 = saturated_water_properties(100.0).unwrap();
    assert_bits_eq(
        critical_heat_flux_wm2(&w100),
        f(&bn["criticalHeatFlux"]),
        "critical heat flux",
    );
    for row in bn["boiling"].as_array().unwrap() {
        let surface = match row["surface"].as_str().unwrap() {
            "stainless-polished" => BoilingSurface::StainlessPolished,
            "stainless-etched" => BoilingSurface::StainlessEtched,
            "stainless-scored" => BoilingSurface::StainlessScored,
            "copper-polished" => BoilingSurface::CopperPolished,
            other => panic!("unknown boiling surface {other}"),
        };
        let b = nucleate_boiling_flux(&w100, f(&row["excessK"]), surface).unwrap();
        assert_bits_eq(b.flux_w_m2, f(&row["flux"]), "boiling flux");
        assert_bits_eq(b.burnout_fraction, f(&row["burnout"]), "burnout fraction");
    }

    for row in bn["pinnedSurface"].as_array().unwrap() {
        let r = evaporative_pinned_surface_c(
            f(&row["airC"]),
            f(&row["bulkVapour"]),
            f(&row["h"]),
            f(&row["radiantC"]),
            0.9,
            f(&row["ceilingC"]),
        )
        .unwrap();
        assert_bits_eq(r.celsius, f(&row["celsius"]), "pinned surface");
        assert_bits_eq(r.evaporative_loss_w_m2, f(&row["evapLoss"]), "pinned evap loss");
        assert_eq!(r.saturated, row["saturated"].as_bool().unwrap());
    }

    let potato = FoodLeg {
        medium_to_food_h_w_m2_k: 15.0,
        geometry: FoodGeometry::Sphere,
        half_dimension_m: 0.025,
        k_w_m_k: 0.55,
        area_m2: 4.0 * core::f64::consts::PI * 0.025 * 0.025,
    };
    let pot_leg = VesselLeg {
        source_to_vessel_h_w_m2_k: 60.0,
        area_m2: 0.05,
        k_w_m_k: 15.0,
        thickness_m: 0.003,
        vessel_to_medium_h_w_m2_k: 5000.0,
    };
    for row in bn["network"].as_array().unwrap() {
        let (src, sink, vessel, food) = match row["case"].as_str().unwrap() {
            "oven-rack" => (200.0, 20.0, None, Some(potato)),
            "boiling-pot" => (
                250.0,
                20.0,
                Some(pot_leg),
                Some(FoodLeg { medium_to_food_h_w_m2_k: 1500.0, ..potato }),
            ),
            "empty-pot" => (250.0, 100.0, Some(pot_leg), None),
            other => panic!("unknown network case {other}"),
        };
        let n = solve_boundary_network(src, sink, vessel, food).unwrap();
        assert_bits_eq(n.total_resistance_k_per_w, f(&row["totalR"]), "network total R");
        assert_bits_eq(n.heat_flow_w, f(&row["heatFlowW"]), "network heat flow");
        assert_eq!(n.links[n.controlling].id, row["controlling"].as_str().unwrap());
        for (i, link) in row["links"].as_array().unwrap().iter().enumerate() {
            assert_eq!(n.links[i].id, link["id"].as_str().unwrap());
            assert_bits_eq(n.links[i].resistance_k_per_w, f(&link["r"]), "link R");
            assert_bits_eq(n.links[i].drop_k, f(&link["dropK"]), "link drop");
        }
    }
}

/// Published figures from OUTSIDE this repository. Regenerating the fixture
/// cannot launder a wrong table past these, because none of the bands are read
/// back from the values they judge.
#[test]
fn boundary_network_external_anchors_hold() {
    // 1. Incropera Table A.4 prints ν, α and Pr as well as the four columns
    //    stored here. Pr ≡ μ·cp/k, so the printed column is an independent
    //    check on the transcription — and it is the ONLY check on it.
    let printed_air = [
        (250.0, 0.720),
        (300.0, 0.707),
        (400.0, 0.690),
        (600.0, 0.685),
        (800.0, 0.709),
    ];
    for (kelvin, pr) in printed_air {
        let derived = air_properties(kelvin - 273.15).unwrap().prandtl;
        assert!(
            ((derived - pr) / pr).abs() < 0.001,
            "air Pr at {kelvin} K: derived {derived}, table prints {pr}"
        );
    }

    // 2. Table A.6 likewise. The 373.15 K row is the one that caught a bad
    //    viscosity: 279e-6 closes to 1.730 against a printed 1.76.
    let printed_water = [(280.0, 10.26), (300.0, 5.83), (350.0, 2.29), (373.15, 1.76)];
    for (kelvin, pr) in printed_water {
        let derived = saturated_water_properties(kelvin - 273.15).unwrap().fluid.prandtl;
        assert!(
            ((derived - pr) / pr).abs() < 0.01,
            "water Pr at {kelvin} K: derived {derived}, table prints {pr}"
        );
    }

    // 3. Water's own well-known properties at its boiling point.
    let w = saturated_water_properties(100.0).unwrap();
    assert!((w.hfg_j_kg - 2257e3).abs() < 1e3, "h_fg at 100 °C");
    assert!((w.sigma_n_m - 0.0589).abs() < 1e-4, "surface tension at 100 °C");
    assert!((w.fluid.rho_kg_m3 - 957.85).abs() < 0.1, "density at 100 °C");

    // 4. This crate's OTHER latent-heat implementation, fitted from a different
    //    source (Fleagle & Andreas), lands within 1 % of the table value. Two
    //    independent derivations agreeing is worth more than either alone.
    let fitted = latent_heat_vaporisation(100.0).unwrap();
    assert!(
        ((w.hfg_j_kg - fitted) / w.hfg_j_kg).abs() < 0.01,
        "table h_fg {} vs fitted {fitted}",
        w.hfg_j_kg
    );

    // 5. Antoine round-trips through its own inverse, which is the shared
    //    coefficient triple's only guard against one copy being edited alone.
    for t in [1.0_f64, 20.0, 50.0, 80.0, 100.0] {
        let back = boiling_point_c(saturation_pressure_kpa(t).unwrap()).unwrap();
        assert!((back - t).abs() < 1e-9, "Antoine round trip at {t} °C gave {back}");
    }
    // …and 20 °C sits on the published 2.339 kPa.
    let p20 = saturation_pressure_kpa(20.0).unwrap();
    assert!(((p20 - 2.339) / 2.339).abs() < 0.005, "p_sat(20 °C) = {p20}");

    // 6. Zuber's critical heat flux for water at 1 atm is published at
    //    ~1.1–1.25 MW·m⁻², the spread being the finite-plate correction.
    let chf = critical_heat_flux_wm2(&w);
    assert!(
        (1.0e6..1.4e6).contains(&chf),
        "critical heat flux {chf} outside the published band"
    );

    // 7. Natural convection in air lives at 2–25 W·m⁻²·K⁻¹. Anything outside
    //    that is a units error, not a nuance.
    let film = air_properties(60.0).unwrap();
    let h = natural_convection_h(&film, ConvectiveSurface::Vertical, 80.0, 0.15)
        .unwrap()
        .h_w_m2_k;
    assert!((2.0..25.0).contains(&h), "natural convection h = {h}");

    // 8. Nucleate boiling at a 10 K excess is ~10⁵ W·m⁻² in every textbook.
    let b = nucleate_boiling_flux(&w, 10.0, BoilingSurface::StainlessEtched).unwrap();
    assert!(
        (5e4..5e5).contains(&b.flux_w_m2),
        "nucleate boiling flux {} at ΔTe = 10 K",
        b.flux_w_m2
    );
}

/// Every refusal in the layer, exercised. A validity envelope that is never
/// tested is a comment.
#[test]
fn boundary_network_refuses_outside_its_envelopes() {
    assert!(air_properties(AIR_MIN_C - 1.0).is_err());
    assert!(air_properties(AIR_MAX_C + 1.0).is_err());
    assert!(saturated_water_properties(WATER_MAX_C + 1.0).is_err());
    assert!(saturation_pressure_kpa(0.5).is_err());
    assert!(saturation_pressure_kpa(101.0).is_err());
    // Relative humidity stops meaning anything above the boiling point.
    assert!(absolute_humidity_kg_m3(200.0, 10.0).is_err());
    // Past burnout Rohsenow's monotone cube points the wrong way.
    let w = saturated_water_properties(100.0).unwrap();
    assert!(nucleate_boiling_flux(&w, 30.0, BoilingSurface::StainlessEtched).is_err());
    assert!(nucleate_boiling_flux(&w, 0.0, BoilingSurface::StainlessEtched).is_err());
    assert!(nucleate_boiling_flux(&w, 10.0, BoilingSurface::StainlessScored).is_err());
    // A chain with nothing in it.
    assert!(solve_boundary_network(200.0, 20.0, None, None).is_err());
}
