//! Host integration unit tests for LivePot simmer reduction and ownership logic.
//!
//! Run via: `cargo test -p alchm_culinary`

use alchm_culinary::words::*;

#[test]
fn test_live_pot_1000w_halving_matches_golden_anchor() {
    // 1000 W boiling 1.0 L of water with no lid (seal = 0, escape = 1.0)
    // Evaporates 0.5 L in ~18.02 minutes (~1081.5 s) at 4 ULP
    let dt_18m = 18.0 * 60.0;
    let step_18m = compute_pot_simmer_step(1.0, 1.0, 1000.0, 0, 0.5, dt_18m)
        .expect("simmer step should succeed");

    assert!(
        (0.49..=0.51).contains(&step_18m.current_vol_l),
        "expected ~0.5 L remaining at 18 min, got {:.4} L",
        step_18m.current_vol_l
    );
    assert!(
        (1.95..=2.05).contains(&step_18m.concentration_ratio),
        "expected concentration ratio ~2.0, got {:.4}",
        step_18m.concentration_ratio
    );
    assert!(step_18m.is_boiling, "liquid remaining, pot should still be boiling");

    // Stepping past 1081.5 s triggers target reduction alarm
    let step_triggered = compute_pot_simmer_step(1.0, 1.0, 1000.0, 0, 0.5, 18.1 * 60.0)
        .expect("triggered step should succeed");
    assert!(step_triggered.alarm_triggered, "halving target at 18.1 min should trigger alarm");
}

#[test]
fn test_live_pot_seal_ordering_is_strictly_monotonic() {
    // Over a 15-minute simmer, tighter lids must retain strictly more volume:
    // none (0) < cracked (1) < loose (2) < tight (3)
    let dt_s = 15.0 * 60.0;
    let results: Vec<SimmerStepOutput> = (0..=3)
        .map(|seal| {
            compute_pot_simmer_step(2.0, 2.0, 1200.0, seal, 0.5, dt_s)
                .expect("seal step should succeed")
        })
        .collect();

    for i in 0..3 {
        assert!(
            results[i].current_vol_l < results[i + 1].current_vol_l,
            "seal state {} ({:.3} L) should lose more water than seal state {} ({:.3} L)",
            i,
            results[i].current_vol_l,
            i + 1,
            results[i + 1].current_vol_l
        );
    }
}

#[test]
fn test_live_pot_unauthorized_mutation_refusal() {
    let chef_identity = [0xAAu8; 32];
    let unauthorized_identity = [0xBBu8; 32];

    assert!(
        check_pot_ownership(&chef_identity, &chef_identity).is_ok(),
        "owner identity match should be authorized"
    );

    let err = check_pot_ownership(&chef_identity, &unauthorized_identity);
    assert!(err.is_err(), "unauthorized identity must be refused");
    assert!(
        err.unwrap_err().contains("unauthorized"),
        "error message should clearly indicate authorization refusal"
    );
}

#[test]
fn test_live_pot_boiled_dry_clamping_and_alarm() {
    // If a pot boils for an absurdly long time (10 hours at 2000 W), volume clamps at 0.0,
    // concentration ratio is infinity, is_boiling is false, and alarm is triggered.
    let dt_s = 36000.0;
    let step = compute_pot_simmer_step(1.0, 1.0, 2000.0, 0, 0.5, dt_s)
        .expect("boil dry step should succeed");

    assert_eq!(step.current_vol_l, 0.0);
    assert_eq!(step.concentration_ratio, f64::INFINITY);
    assert!(!step.is_boiling);
    assert!(step.alarm_triggered);
}

#[test]
fn test_live_pot_validation_guards() {
    // Refuses invalid parameters
    assert!(validate_live_pot_params("", "recipe_1", "Stockpot", 2.0, 1000.0, 0, 0.5).is_err());
    assert!(validate_live_pot_params("sess_1", "recipe_1", "", 2.0, 1000.0, 0, 0.5).is_err());
    assert!(validate_live_pot_params("sess_1", "recipe_1", "Stockpot", -1.0, 1000.0, 0, 0.5).is_err());
    assert!(validate_live_pot_params("sess_1", "recipe_1", "Stockpot", 2.0, 0.0, 0, 0.5).is_err());
    assert!(validate_live_pot_params("sess_1", "recipe_1", "Stockpot", 2.0, 1000.0, 4, 0.5).is_err());
    assert!(validate_live_pot_params("sess_1", "recipe_1", "Stockpot", 2.0, 1000.0, 0, 1.5).is_err());
    assert!(validate_live_pot_params("sess_1", "recipe_1", "Stockpot", 2.0, 1000.0, 0, 0.5).is_ok());
}
