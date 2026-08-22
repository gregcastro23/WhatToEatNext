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

// ============================================================================
// Heat-flow regimes
// ============================================================================

/// Every regime, for the sweeps below. Kept exhaustive by hand ON PURPOSE: a
/// `match` in `regime_params` will not compile when a variant is added, and
/// this array is the second place the compiler cannot help — so
/// `every_regime_is_covered_by_the_sweeps` checks the count against `from_u8`.
const ALL_REGIMES: [HeatRegime; 10] = [
    HeatRegime::BuoyantAir,
    HeatRegime::Oil,
    HeatRegime::RollingBoil,
    HeatRegime::CondensingSteam,
    HeatRegime::StillLiquid,
    HeatRegime::Radiant,
    HeatRegime::SolidContact,
    HeatRegime::Cryogenic,
    HeatRegime::Diffusion,
    HeatRegime::Distillation,
];

#[test]
fn every_regime_is_covered_by_the_sweeps() {
    for (i, r) in ALL_REGIMES.iter().enumerate() {
        assert_eq!(HeatRegime::from_u8(i as u8), Some(*r), "discriminant {i}");
    }
    assert_eq!(
        HeatRegime::from_u8(ALL_REGIMES.len() as u8),
        None,
        "an unknown discriminant must be refused, never defaulted to BuoyantAir"
    );
}

/// The derived scale must regenerate the constant it was derived from.
///
/// This crate's standing rule is that a constant which cannot be reproduced
/// from its own stated basis is a guess with a citation. `SCENE_SCALE` is
/// defined backwards out of `BUOYANCY_PER_K`, so the round trip is the whole
/// claim: if it does not hold to the bit, then every other regime's buoyancy is
/// scaled against something that is not the shipped air value.
#[test]
fn derived_air_buoyancy_reproduces_the_shipped_constant() {
    assert_eq!(
        buoyancy_for_beta(BETA_AIR_OVEN).to_bits(),
        BUOYANCY_PER_K.to_bits(),
        "g·β_air·SCENE_SCALE must be exactly BUOYANCY_PER_K"
    );
}

/// Mean vertical velocity after a fixed simulated time.
fn mean_vy(regime: HeatRegime, medium_c: f32, h: f32, steps: usize) -> f32 {
    let mut ps = seeded_particles(48);
    for _ in 0..steps {
        step_medium_simulation(&mut ps, 1.0 / 60.0, regime, medium_c, h, 505.0);
    }
    ps.iter().map(|p| p.vy).sum::<f32>() / ps.len() as f32
}

/// ⚠️ THE regression this enum was added for.
///
/// `[MEASURED 2026-08-17]` With `(T − 20).max(0.0)`, a −196 °C cryogen produced
/// exactly the same dead-calm buoyancy as a 20 °C room, so `cryo_cooking`
/// animated as still air inside a chamber the canvas painted hot amber. A
/// cryogen's vapour is denser than the room and falls.
#[test]
fn a_cryogen_sinks_and_an_oven_rises() {
    let oven = mean_vy(HeatRegime::BuoyantAir, 190.0, 25.0, 120);
    let cryo = mean_vy(HeatRegime::Cryogenic, -196.0, 250.0, 120);
    assert!(oven > 0.0, "hot air must rise, got {oven}");
    assert!(cryo < 0.0, "a cryogen must sink, got {cryo}");
}

/// Condensation is the only hot regime whose mass flux points at the food.
#[test]
fn condensing_steam_travels_downward_while_a_boil_travels_up() {
    let boil = mean_vy(HeatRegime::RollingBoil, 100.0, 3000.0, 120);
    let steam = mean_vy(HeatRegime::CondensingSteam, 100.0, 9000.0, 120);
    assert!(boil > 0.0, "vapour must leave a boil upward, got {boil}");
    assert!(
        steam < boil,
        "condensate must run counter to the boil: steam {steam} vs boil {boil}"
    );
}

/// A method with no heat flow must not acquire a temperature from a borrowed h.
#[test]
fn a_mass_transfer_method_has_no_temperature_story() {
    let mut ps = seeded_particles(24);
    let before: Vec<f32> = ps.iter().map(|p| p.temp_c).collect();
    for _ in 0..600 {
        // A deliberately large borrowed h — the roasting profile the old canvas
        // handed these methods. It must have no effect at all.
        step_medium_simulation(&mut ps, 1.0 / 60.0, HeatRegime::Diffusion, 190.0, 3000.0, 505.0);
    }
    for (p, was) in ps.iter().zip(before) {
        assert_eq!(p.temp_c, was, "a diffusion tracer must not change temperature");
    }
}

/// Nucleation exists only where the method actually has a phase change.
#[test]
fn only_phase_change_regimes_nucleate() {
    for r in ALL_REGIMES {
        let mut ps = seeded_particles(16);
        for _ in 0..90 {
            step_medium_simulation(&mut ps, 1.0 / 60.0, r, 100.0, 500.0, 505.0);
        }
        let active = ps.iter().any(|p| p.phase_frac > 0.0);
        let expected = regime_params(r).nucleation_per_s > 0.0;
        assert_eq!(active, expected, "{r:?} nucleation state");
    }
}

/// ⚠️ The differentiation claim, asserted rather than asserted-about.
///
/// The panel's whole premise is that a method's animation shows THAT method.
/// Before regimes existed this test could not have passed for any pair: the
/// simulation had one motion model and three scalars, so two methods with the
/// same medium temperature and the same `h` were pixel-identical no matter how
/// differently they cook.
#[test]
fn no_two_regimes_render_the_same_motion() {
    let state = |r: HeatRegime| {
        let mut ps = seeded_particles(32);
        for _ in 0..150 {
            step_medium_simulation(&mut ps, 1.0 / 60.0, r, 120.0, 500.0, 505.0);
        }
        ps.iter()
            .map(|p| (p.x, p.y, p.z, p.vy, p.phase_frac))
            .collect::<Vec<_>>()
    };
    for (i, a) in ALL_REGIMES.iter().enumerate() {
        for b in &ALL_REGIMES[i + 1..] {
            assert_ne!(
                state(*a),
                state(*b),
                "{a:?} and {b:?} render identically — they must not"
            );
        }
    }
}

// ── Composite vessel walls ──────────────────────────────────────────────────
//
// `[BASIS]` Conductivities are the alloy-class values already carried by
// `src/data/cooking/cookwareMaterials.ts` (Incropera & DeWitt, *Fundamentals of
// Heat and Mass Transfer*, Table A.1), so the two runtimes cite one source
// rather than two. Nothing here introduces a new constant.

/// A tri-ply base: 0.5 mm 304 stainless / 2.0 mm aluminium / 0.5 mm 304.
fn tri_ply() -> [WallLayer; 3] {
    [
        WallLayer::new("stainless outer", 0.0005, 15.0),
        WallLayer::new("aluminium core", 0.0020, 205.0),
        WallLayer::new("stainless inner", 0.0005, 15.0),
    ]
}

#[test]
fn a_composite_wall_is_the_sum_of_its_plies() {
    let v = VesselLeg::composite(500.0, 0.05, 1200.0, &tri_ply()).unwrap();
    let expected: f64 = tri_ply()
        .iter()
        .map(|l| l.thickness_m / (l.k_w_m_k * 0.05))
        .sum();
    assert!((v.wall_resistance_k_per_w() - expected).abs() < EPS);
}

#[test]
fn splitting_one_layer_into_identical_plies_changes_nothing() {
    // Additivity, proven BEFORE relying on the decomposition anywhere else.
    // One 3 mm layer must equal three 1 mm layers of the same material; if that
    // does not hold, every composite number downstream is built on sand.
    let single = VesselLeg::single(500.0, 0.05, 15.0, 0.003, 1200.0);
    let split = VesselLeg::composite(
        500.0,
        0.05,
        1200.0,
        &[
            WallLayer::new("a", 0.001, 15.0),
            WallLayer::new("b", 0.001, 15.0),
            WallLayer::new("c", 0.001, 15.0),
        ],
    )
    .unwrap();
    assert!(
        (single.wall_resistance_k_per_w() - split.wall_resistance_k_per_w()).abs() < EPS,
        "additivity broken: {} vs {}",
        single.wall_resistance_k_per_w(),
        split.wall_resistance_k_per_w()
    );

    // And end to end, through the solver.
    let a = solve_boundary_network(200.0, 20.0, Some(single), None).unwrap();
    let b = solve_boundary_network(200.0, 20.0, Some(split), None).unwrap();
    assert!((a.total_resistance_k_per_w - b.total_resistance_k_per_w).abs() < EPS);
    assert!((a.heat_flow_w - b.heat_flow_w).abs() < 1e-9);
}

#[test]
fn the_core_is_not_the_pan_a_single_layer_would_model() {
    // The reason composites exist at all. Modelling tri-ply as solid stainless
    // has to pick one k, and both available choices are wrong in a direction
    // that matters: stainless overstates the wall's resistance several-fold,
    // aluminium understates it.
    let area = 0.05;
    let composite = VesselLeg::composite(500.0, area, 1200.0, &tri_ply()).unwrap();
    let all_steel = VesselLeg::single(500.0, area, 15.0, 0.003, 1200.0);
    let all_alu = VesselLeg::single(500.0, area, 205.0, 0.003, 1200.0);

    let r_comp = composite.wall_resistance_k_per_w();
    assert!(
        r_comp < all_steel.wall_resistance_k_per_w(),
        "tri-ply must conduct better than solid stainless"
    );
    assert!(
        r_comp > all_alu.wall_resistance_k_per_w(),
        "tri-ply must conduct worse than solid aluminium"
    );
}

#[test]
fn a_single_ply_still_reports_the_original_link_id() {
    // The compatibility guarantee the golden vectors depend on.
    let v = VesselLeg::single(500.0, 0.05, 15.0, 0.003, 1200.0);
    let solved = solve_boundary_network(200.0, 20.0, Some(v), None).unwrap();
    let ids: Vec<&str> = solved.links.iter().map(|l| l.id).collect();
    assert_eq!(ids, vec!["source-to-vessel", "vessel-wall", "vessel-to-medium"]);
}

#[test]
fn a_composite_reports_one_link_per_ply() {
    let v = VesselLeg::composite(500.0, 0.05, 1200.0, &tri_ply()).unwrap();
    let solved = solve_boundary_network(200.0, 20.0, Some(v), None).unwrap();
    let ids: Vec<&str> = solved.links.iter().map(|l| l.id).collect();
    assert_eq!(
        ids,
        vec![
            "source-to-vessel",
            "vessel-layer-0",
            "vessel-layer-1",
            "vessel-layer-2",
            "vessel-to-medium",
        ]
    );
    // The shares must still close, exactly as for a simple wall.
    let sum: f64 = solved.links.iter().map(|l| l.share).sum();
    assert!((sum - 1.0).abs() < 1e-12, "shares sum to {sum}, not 1");
}

#[test]
fn a_stack_that_is_empty_or_too_deep_is_refused() {
    assert!(VesselLeg::composite(500.0, 0.05, 1200.0, &[]).is_none());
    let too_many = [WallLayer::new("x", 0.001, 15.0); MAX_WALL_LAYERS + 1];
    assert!(VesselLeg::composite(500.0, 0.05, 1200.0, &too_many).is_none());
    // Exactly at the limit is fine — an off-by-one here would silently drop a
    // five-ply pan to a refusal.
    let at_limit = [WallLayer::new("x", 0.001, 15.0); MAX_WALL_LAYERS];
    assert!(VesselLeg::composite(500.0, 0.05, 1200.0, &at_limit).is_some());
}

#[test]
fn a_zero_thickness_or_zero_k_ply_is_refused_not_absorbed() {
    // A zero-k ply is an infinite resistance. Without the per-ply check it
    // would swallow the entire chain while every other input still looked sane.
    for bad in [
        WallLayer::new("zero k", 0.001, 0.0),
        WallLayer::new("zero L", 0.0, 15.0),
        WallLayer::new("nan k", 0.001, f64::NAN),
        WallLayer::new("neg L", -0.001, 15.0),
    ] {
        let v = VesselLeg::composite(
            500.0,
            0.05,
            1200.0,
            &[WallLayer::new("ok", 0.001, 15.0), bad],
        )
        .unwrap();
        assert!(
            solve_boundary_network(200.0, 20.0, Some(v), None).is_err(),
            "ply {:?} must be refused",
            bad.name
        );
    }
}
