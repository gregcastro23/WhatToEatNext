//! Unit tests for the shared physics core.
//!
//! These anchor the relations against references OUTSIDE this repository —
//! published boiling points, Baldwin's sous-vide tables, the CODATA constant.
//! Cross-runtime agreement with the TypeScript half is a separate concern and
//! lives in `tests/golden.rs`.

use super::*;

const EPS: f64 = 1e-12;

// ── Boiling point ───────────────────────────────────────────────────────────

#[test]
fn sea_level_boiling_point_is_100c_to_within_the_fit_residual() {
    let bp = boiling_point_c(ISA_P0_KPA).unwrap();
    // Stull's coefficients round-trip 100 °C to 760.3 mmHg against the defining
    // 760, i.e. +0.04 %. That shows up here as ~3 mK low.
    assert!((bp - 100.0).abs() < 0.005, "sea-level boiling point {bp}");
}

#[test]
fn denver_boiling_point_matches_the_published_figure() {
    // Denver is 1609 m; the widely published figure is 202 °F / 94.4 °C.
    let bp = boiling_point_at_elevation(1609.0).unwrap();
    let f = c_to_f(bp);
    assert!((f - 202.0).abs() < 1.0, "Denver boiling point {f} °F");
}

#[test]
fn boiling_point_refuses_pressures_outside_antoine_validity() {
    assert_eq!(boiling_point_c(0.0), Err(ThermoError::NonPositivePressure));
    assert_eq!(boiling_point_c(-1.0), Err(ThermoError::NonPositivePressure));
    assert_eq!(boiling_point_c(f64::NAN), Err(ThermoError::NonFinite));
    // A pressure cooker at 200 kPa is a steam-table question, not an Antoine one.
    assert_eq!(boiling_point_c(200.0), Err(ThermoError::OutsideAntoineRange));
}

#[test]
fn isa_exponent_reproduces_the_published_rounding() {
    // The US Standard Atmosphere 1976 publishes 5.25588. If this assertion ever
    // fails, a defining constant above was edited — not a rounding preference.
    assert!(
        (ISA_EXPONENT - 5.25588).abs() < 5e-6,
        "ISA exponent {ISA_EXPONENT} vs published 5.25588"
    );
    assert!((ISA_LAPSE_RATIO - 2.25577e-5).abs() < 1e-10);
}

#[test]
fn isa_refuses_above_the_tropopause() {
    assert_eq!(
        pressure_from_elevation(12_000.0),
        Err(ThermoError::AboveTroposphere)
    );
    assert!(pressure_from_elevation(11_000.0).is_ok());
}

// ── Rate vs temperature ─────────────────────────────────────────────────────

#[test]
fn q10_of_two_is_a_z_value_of_332c() {
    assert!((z_value_from_q10(Q10_CULINARY) - 33.219).abs() < 0.001);
}

#[test]
fn a_full_z_value_colder_is_exactly_ten_times_longer() {
    let f = time_scale_factor(-Z_VALUE_CULINARY_C, Z_VALUE_CULINARY_C).unwrap();
    assert!((f - 10.0).abs() < EPS, "factor {f}");
}

#[test]
fn the_two_altitude_regimes_differ_by_more_than_six_fold_at_denver() {
    let soft = altitude_time_multiplier(1609.0, AltitudeRegime::Softening).unwrap();
    let pasteur = altitude_time_multiplier(1609.0, AltitudeRegime::Pasteurisation).unwrap();
    assert!((soft - 1.4).abs() < 0.05, "softening {soft}");
    assert!((pasteur - 9.0).abs() < 0.5, "pasteurisation {pasteur}");
    // The whole reason the regime is a required argument.
    assert!(pasteur / soft > 6.0);
}

#[test]
fn sea_level_altitude_multiplier_is_unity_in_both_regimes() {
    for regime in [AltitudeRegime::Softening, AltitudeRegime::Pasteurisation] {
        let m = altitude_time_multiplier(0.0, regime).unwrap();
        assert!((m - 1.0).abs() < EPS, "{regime:?} → {m}");
    }
}

// ── Transient conduction ────────────────────────────────────────────────────

#[test]
fn eigenvalue_satisfies_its_own_defining_identity() {
    for biot in [0.01, 0.1, 0.5, 1.0, 5.0, 50.0, 1000.0] {
        let lambda = slab_eigenvalue(biot).unwrap();
        let residual = lambda * lambda.tan() - biot;
        assert!(
            residual.abs() < 1e-6 * biot.max(1.0),
            "Bi {biot}: λ·tan λ − Bi = {residual}"
        );
    }
}

#[test]
fn eigenvalue_and_coefficient_approach_their_infinite_biot_limits() {
    // Bi → ∞ drives λ₁ → π/2 and A₁ → 4/π.
    let lambda = slab_eigenvalue(1e9).unwrap();
    assert!((lambda - std::f64::consts::FRAC_PI_2).abs() < 1e-6, "λ {lambda}");
    let a1 = slab_coefficient(lambda);
    assert!((a1 - 4.0 / std::f64::consts::PI).abs() < 1e-6, "A₁ {a1}");
}

#[test]
fn baldwin_sous_vide_window_is_reproduced() {
    // 25 mm slab, 5 °C → within 0.5 °C of a 55 °C bath, h = 95 W·m⁻²·K⁻¹.
    // Baldwin's published tables give 60–70 min for this geometry.
    let r = slab_core_time(SlabCookInput::lean_meat(25.0, 55.0, 5.0, 54.5, 95.0)).unwrap();
    assert!(
        r.minutes > 55.0 && r.minutes < 85.0,
        "core time {} min",
        r.minutes
    );
    assert!(r.one_term_valid, "Fo {} should exceed 0.2", r.fourier);
}

#[test]
fn the_thickness_exponent_rises_with_biot_number() {
    // `[MEASURED 2026-08-16]` Doubling thickness does NOT cost a flat 4×. The
    // exponent interpolates from L¹ (surface-limited) toward L² (conduction-
    // limited) as Bi grows. A flat "t ∝ L²" claim overstates the oven penalty
    // by 65 %.
    let ratio_at = |h: f64| {
        let thin = slab_core_time(SlabCookInput::lean_meat(12.5, 175.0, 5.0, 60.0, h))
            .unwrap()
            .minutes;
        let thick = slab_core_time(SlabCookInput::lean_meat(25.0, 175.0, 5.0, 60.0, h))
            .unwrap()
            .minutes;
        thick / thin
    };
    let oven = ratio_at(25.0);
    let bath = ratio_at(95.0);
    let fryer = ratio_at(500.0);
    let boil = ratio_at(3000.0);

    assert!(oven < bath && bath < fryer && fryer < boil, "monotonic in Bi");
    assert!(oven > 2.0 && oven < 2.7, "oven ratio {oven}");
    assert!(boil > 3.7 && boil < 4.0, "boiling ratio {boil}");
}

#[test]
fn one_sided_heating_doubles_the_conduction_path() {
    let mut two = SlabCookInput::lean_meat(20.0, 175.0, 5.0, 60.0, 25.0);
    two.one_sided = false;
    let mut one = two;
    one.one_sided = true;
    // Same slab, one face: the path is the full thickness, so Bi doubles.
    let two_r = slab_core_time(two).unwrap();
    let one_r = slab_core_time(one).unwrap();
    assert!((one_r.biot / two_r.biot - 2.0).abs() < EPS);
    assert!(one_r.minutes > two_r.minutes);
}

#[test]
fn slab_refuses_a_target_the_medium_cannot_reach() {
    // A 60 °C core in a 55 °C bath is not a slow cook, it is impossible.
    assert_eq!(
        slab_core_time(SlabCookInput::lean_meat(25.0, 55.0, 5.0, 60.0, 95.0)),
        Err(ThermoError::TargetUnreachable)
    );
}

// ── Radiation ───────────────────────────────────────────────────────────────

#[test]
fn oven_wall_radiant_flux_is_a_few_kilowatts_per_square_metre() {
    let flux = radiant_flux_kw_m2(505.0, 298.0, 0.85, 1.0);
    assert!(flux > 2.0 && flux < 3.5, "flux {flux} kW·m⁻²");
}

#[test]
fn a_charcoal_bed_outradiates_an_oven_wall_by_more_than_an_order_of_magnitude() {
    let oven = radiant_flux_kw_m2(505.0, 298.0, 0.85, 1.0);
    let charcoal = radiant_flux_kw_m2(1200.0, 298.0, 0.85, 1.0);
    assert!(
        charcoal / oven > 30.0,
        "charcoal {charcoal} / oven {oven} = {}",
        charcoal / oven
    );
}

// ── Contact mechanics ───────────────────────────────────────────────────────

#[test]
fn effusivity_constant_round_trips_from_its_own_basis() {
    // The defect this guards: a literal 1286.0 beside a comment claiming
    // sqrt(0.45 * 1050 * 3500), which is 1285.98211496116846.
    let derived = food_effusivity_lean_meat();
    assert_eq!(
        derived,
        effusivity(LEAN_MEAT_K_W_M_K, LEAN_MEAT_RHO_KG_M3, LEAN_MEAT_C_J_KG_K)
    );
    assert!((derived - 1286.0).abs() > 0.01, "the old literal was wrong by {}", (derived - 1286.0).abs());
}

#[test]
fn copper_and_stainless_do_not_offer_the_food_the_same_interface() {
    let copper = effusivity(401.0, 8960.0, 385.0);
    let stainless = effusivity(16.2, 8000.0, 500.0);
    let food = food_effusivity_lean_meat();
    let t_cu = contact_temperature_c(230.0, 5.0, copper, food);
    let t_ss = contact_temperature_c(230.0, 5.0, stainless, food);
    assert!(t_cu > t_ss, "copper {t_cu} vs stainless {t_ss}");
    assert!(t_cu - t_ss > 20.0, "gap {} °C", t_cu - t_ss);
}

// ── Wet bulb ────────────────────────────────────────────────────────────────

#[test]
fn wet_bulb_never_exceeds_dry_bulb_across_the_whole_envelope() {
    let mut t = STULL_MIN_C;
    while t <= STULL_MAX_C {
        let mut rh = 5.0;
        while rh <= 99.0 {
            let wb = wet_bulb_c(t, rh).expect("inside envelope");
            assert!(wb <= t + EPS, "dry {t} °C, RH {rh} % → wet bulb {wb} °C");
            rh += 1.0;
        }
        t += 0.5;
    }
}

#[test]
fn wet_bulb_declines_to_answer_at_oven_temperatures() {
    assert_eq!(wet_bulb_c(175.0, 100.0), None);
    assert_eq!(wet_bulb_c(-40.0, 50.0), None);
}

// ── Simulation ──────────────────────────────────────────────────────────────

#[test]
fn simulation_keeps_every_particle_inside_the_render_box() {
    let mut ps = seeded_particles(60);
    for _ in 0..600 {
        step_oven_simulation(&mut ps, 1.0 / 60.0, 175.0, 25.0, 505.0);
    }
    for p in &ps {
        assert!(p.x >= -1.0 && p.x <= 1.0, "x escaped: {}", p.x);
        assert!(p.z >= -1.0 && p.z <= 1.0, "z escaped: {}", p.z);
        assert!(p.y.is_finite() && p.y <= 1.0, "y escaped: {}", p.y);
        assert!(p.temp_c.is_finite());
    }
}

#[test]
fn particles_relax_toward_the_medium_at_a_rate_set_by_h() {
    // `[MEASURED 2026-08-16]` An earlier version of this test asserted that
    // 2000 steps at h = 25 lands within 1 °C of the medium. It does not, and
    // the model is right to refuse: the Newton time constant there is
    // 1/(h·0.001) ≈ 40 s, while 2000 steps at 1/60 s is 33 s of simulated
    // time. The particle reached 107.6 °C, which is exp(−33/40) of the way —
    // correct behaviour that a badly-chosen expectation called a stall.
    //
    // What is worth asserting is the thing the panel actually claims: the
    // approach is monotonic, and h — not the medium temperature — sets how
    // fast it happens. That is the whole reason h is the organising quantity.
    let after = |h: f32, steps: usize| {
        let mut ps = seeded_particles(8);
        for _ in 0..steps {
            step_oven_simulation(&mut ps, 1.0 / 60.0, 175.0, h, 505.0);
        }
        ps.iter().map(|p| (175.0 - p.temp_c).abs()).sum::<f32>() / ps.len() as f32
    };

    // Monotone approach: more steps is never further away.
    let (a, b, c) = (after(25.0, 200), after(25.0, 1000), after(25.0, 2000));
    assert!(a > b && b > c, "gap must shrink: {a} → {b} → {c}");

    // An oven (h = 25) and steam (h = 9000) are not the same cook. At equal
    // simulated time the steam case is essentially equilibrated.
    let oven = after(25.0, 2000);
    let steam = after(9000.0, 2000);
    assert!(steam < 0.01, "steam should equilibrate, gap {steam} °C");
    assert!(oven > 50.0, "oven should still be far off, gap {oven} °C");
}

#[test]
fn a_hotter_oven_circulates_faster() {
    let rise = |oven: f32| {
        let mut ps = seeded_particles(40);
        for _ in 0..120 {
            step_oven_simulation(&mut ps, 1.0 / 60.0, oven, 25.0, 505.0);
        }
        ps.iter().map(|p| p.vy).sum::<f32>() / ps.len() as f32
    };
    assert!(rise(230.0) > rise(120.0), "buoyancy must scale with superheat");
    assert!(rise(20.0).abs() < rise(230.0).abs());
}
