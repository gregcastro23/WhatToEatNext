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
