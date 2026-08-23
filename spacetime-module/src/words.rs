//! Pure, side-effect-free culinary aggregation logic.
//!
//! Everything here is deliberately free of any `spacetimedb` dependency so it
//! can be unit-tested on the host with a plain `cargo test`. SpacetimeDB
//! reducers can only run inside the wasm runtime (they need a live
//! `ReducerContext`), so the *math* lives here and the reducers in
//! [`crate::reducers`] are thin wrappers that read/write tables and delegate
//! every calculation to these functions.
//!
//! ## Two distinct 4-dimensional spaces
//!
//! The culinary model uses two different "elemental" vocabularies that happen
//! to both have four slots — keep them separate:
//!
//! * **`elemental_signature` / `elemental_profile`** — the alchemical
//!   *ESMS* signature `[Spirit, Essence, Matter, Substance]`. Aggregated by
//!   summing (recipes) or averaging (cuisines).
//! * **`primary_element`** — the classical-element classification
//!   `0 = Fire, 1 = Earth, 2 = Air, 3 = Water`. A recipe/cuisine's
//!   `primary_element` is derived by a *majority vote* over its constituents'
//!   `primary_element`, **not** by taking the argmax of the ESMS signature
//!   (an ESMS argmax would mislabel, say, a high-Spirit dish as "Fire").

use std::collections::BTreeSet;

/// Number of components in an ESMS elemental signature.
pub const SIG_DIM: usize = 4;

/// Number of classical elements (Fire / Earth / Air / Water).
pub const ELEMENT_COUNT: usize = 4;

/// An ESMS signature: `[Spirit, Essence, Matter, Substance]`.
pub type Signature = [f32; SIG_DIM];

/// One ingredient line as seen by the recipe aggregator: the ingredient's own
/// per-serving profile, plus the `amount` of it used in the recipe.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct NutrientLine {
    pub signature: Signature,
    pub primary_element: u8,
    pub calories: u32,
    pub protein_g: f32,
    pub fat_g: f32,
    pub carbs_g: f32,
    pub amount: f32,
}

/// The computed aggregate for a recipe.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct RecipeAggregate {
    pub signature: Signature,
    pub primary_element: u8,
    pub total_calories: u32,
    pub total_protein: f32,
    pub total_fat: f32,
    pub total_carbs: f32,
}

/// Treat a NaN/infinite/negative amount as zero contribution. The reducer
/// rejects such amounts up front; this keeps the pure math total and safe even
/// if it is ever called with raw input.
fn sanitize_amount(amount: f32) -> f32 {
    if amount.is_finite() && amount > 0.0 {
        amount
    } else {
        0.0
    }
}

/// Round a non-negative f64 calorie total into a `u32`, saturating instead of
/// wrapping/panicking on overflow and flooring negatives/NaN at zero.
fn clamp_to_u32(value: f64) -> u32 {
    if !value.is_finite() || value <= 0.0 {
        return 0;
    }
    let rounded = value.round();
    if rounded >= u32::MAX as f64 {
        u32::MAX
    } else {
        rounded as u32
    }
}

/// Collapse an f64 accumulator back into a finite `f32`. NaN maps to `0.0`;
/// magnitudes beyond the f32 range saturate to `±f32::MAX` rather than casting
/// to `±inf`. Aggregation runs in f64 and funnels every stored float through
/// this so an extreme (but finite) ingredient value can never poison a recipe
/// or cuisine with NaN/Inf. (Reducers also reject non-finite inputs up front;
/// this is the defense-in-depth backstop.)
fn finite_f32(value: f64) -> f32 {
    if value.is_nan() {
        return 0.0;
    }
    value.clamp(-(f32::MAX as f64), f32::MAX as f64) as f32
}

/// Amount-weighted majority vote over classical elements.
///
/// Each `(element, weight)` pair contributes `weight` to its element's tally;
/// the element with the greatest tally wins. Ties (and the empty case) break
/// deterministically toward the **lowest** element index. Out-of-range element
/// indices are tallied faithfully (the caller is responsible for validating
/// that ingredient elements are `0..ELEMENT_COUNT`).
pub fn dominant_element(votes: &[(u8, f32)]) -> u8 {
    if votes.is_empty() {
        return 0;
    }
    let max_idx = votes.iter().map(|(e, _)| *e as usize).max().unwrap_or(0);
    let mut tally = vec![0f64; max_idx + 1];
    for (element, weight) in votes {
        let w = sanitize_amount(*weight) as f64;
        tally[*element as usize] += w;
    }
    let mut best = 0usize;
    let mut best_weight = tally[0];
    for (i, &w) in tally.iter().enumerate().skip(1) {
        if w > best_weight {
            best_weight = w;
            best = i;
        }
    }
    best as u8
}

/// Sum each ingredient's signature and nutrients, weighted by `amount`, and
/// derive the recipe's dominant classical element by amount-weighted vote.
///
/// The signature is a *weighted sum* (not a normalized average) — matching the
/// schema note "computed by summing ingredient signatures".
pub fn aggregate_recipe(lines: &[NutrientLine]) -> RecipeAggregate {
    // Accumulate in f64 so an extreme (but finite) input cannot overflow to
    // infinity mid-sum; `finite_f32` saturates the result back into f32 range.
    let mut signature = [0f64; SIG_DIM];
    let mut total_protein = 0f64;
    let mut total_fat = 0f64;
    let mut total_carbs = 0f64;
    let mut total_calories = 0f64;
    let mut votes: Vec<(u8, f32)> = Vec::with_capacity(lines.len());

    for line in lines {
        let w = sanitize_amount(line.amount);
        let wf = w as f64;
        for (acc, component) in signature.iter_mut().zip(line.signature) {
            *acc += component as f64 * wf;
        }
        total_protein += line.protein_g as f64 * wf;
        total_fat += line.fat_g as f64 * wf;
        total_carbs += line.carbs_g as f64 * wf;
        total_calories += line.calories as f64 * wf;
        votes.push((line.primary_element, w));
    }

    RecipeAggregate {
        signature: [
            finite_f32(signature[0]),
            finite_f32(signature[1]),
            finite_f32(signature[2]),
            finite_f32(signature[3]),
        ],
        primary_element: dominant_element(&votes),
        total_calories: clamp_to_u32(total_calories),
        total_protein: finite_f32(total_protein),
        total_fat: finite_f32(total_fat),
        total_carbs: finite_f32(total_carbs),
    }
}

/// Component-wise arithmetic mean of recipe signatures — the cuisine's
/// aggregated `elemental_profile`. Empty input yields a zero profile.
pub fn average_signatures(signatures: &[Signature]) -> Signature {
    if signatures.is_empty() {
        return [0.0; SIG_DIM];
    }
    let mut acc = [0f64; SIG_DIM];
    for sig in signatures {
        for (acc_component, &component) in acc.iter_mut().zip(sig.iter()) {
            *acc_component += component as f64;
        }
    }
    let n = signatures.len() as f64;
    [
        finite_f32(acc[0] / n),
        finite_f32(acc[1] / n),
        finite_f32(acc[2] / n),
        finite_f32(acc[3] / n),
    ]
}

/// The cuisine's `primary_element`: an unweighted majority vote over its member
/// recipes' `primary_element` (one vote per recipe). Ties break toward the
/// lowest element index.
pub fn dominant_element_unweighted(elements: &[u8]) -> u8 {
    let votes: Vec<(u8, f32)> = elements.iter().map(|&e| (e, 1.0)).collect();
    dominant_element(&votes)
}

/// Fail-closed existence check: returns the id of the first referenced
/// ingredient that is absent from `known_ids`, or `None` if every referenced
/// ingredient exists. [`crate::reducers::create_recipe`] enforces the same
/// invariant via per-id table lookups before writing any row.
pub fn first_missing_ingredient(referenced: &[u64], known_ids: &BTreeSet<u64>) -> Option<u64> {
    referenced
        .iter()
        .copied()
        .find(|id| !known_ids.contains(id))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn line(sig: Signature, element: u8, cal: u32, protein: f32, amount: f32) -> NutrientLine {
        NutrientLine {
            signature: sig,
            primary_element: element,
            calories: cal,
            protein_g: protein,
            fat_g: 0.0,
            carbs_g: 0.0,
            amount,
        }
    }

    #[test]
    fn aggregates_calories_protein_and_signature_weighted_by_amount() {
        // A used at amount 2.0, B used at amount 1.0.
        let a = line([1.0, 2.0, 3.0, 4.0], 0, 100, 10.0, 2.0);
        let b = line([4.0, 3.0, 2.0, 1.0], 2, 50, 5.0, 1.0);

        let agg = aggregate_recipe(&[a, b]);

        // signature = A*2 + B*1
        assert_eq!(agg.signature, [6.0, 7.0, 8.0, 9.0]);
        // calories = 100*2 + 50*1
        assert_eq!(agg.total_calories, 250);
        // protein = 10*2 + 5*1
        assert_eq!(agg.total_protein, 25.0);
        // element 0 has weight 2, element 2 has weight 1 -> 0 wins
        assert_eq!(agg.primary_element, 0);
    }

    #[test]
    fn fractional_amounts_scale_and_round_calories() {
        let a = line([2.0, 0.0, 0.0, 0.0], 1, 100, 4.0, 0.5);
        let b = line([0.0, 0.0, 0.0, 0.0], 1, 33, 0.0, 1.0);

        let agg = aggregate_recipe(&[a, b]);

        assert_eq!(agg.signature, [1.0, 0.0, 0.0, 0.0]);
        // 100*0.5 + 33*1 = 83
        assert_eq!(agg.total_calories, 83);
        assert_eq!(agg.total_protein, 2.0);
        assert_eq!(agg.primary_element, 1);
    }

    #[test]
    fn empty_recipe_aggregates_to_zero() {
        let agg = aggregate_recipe(&[]);
        assert_eq!(agg.signature, [0.0, 0.0, 0.0, 0.0]);
        assert_eq!(agg.total_calories, 0);
        assert_eq!(agg.total_protein, 0.0);
        assert_eq!(agg.primary_element, 0);
    }

    #[test]
    fn dominant_element_breaks_ties_toward_lowest_index() {
        assert_eq!(dominant_element(&[(3, 1.0), (1, 1.0)]), 1);
        assert_eq!(dominant_element(&[(2, 5.0), (0, 1.0), (2, 1.0)]), 2);
        assert_eq!(dominant_element(&[]), 0);
    }

    #[test]
    fn average_signatures_is_component_wise_mean() {
        let mean = average_signatures(&[[2.0, 4.0, 6.0, 8.0], [4.0, 8.0, 12.0, 16.0]]);
        assert_eq!(mean, [3.0, 6.0, 9.0, 12.0]);
        assert_eq!(average_signatures(&[]), [0.0, 0.0, 0.0, 0.0]);
    }

    #[test]
    fn cuisine_vote_is_one_per_recipe() {
        // Fire(0), Fire(0), Water(3) -> Fire wins by count.
        assert_eq!(dominant_element_unweighted(&[0, 0, 3]), 0);
        // Tie between Earth(1) and Air(2) -> lowest index, Earth.
        assert_eq!(dominant_element_unweighted(&[1, 2]), 1);
    }

    #[test]
    fn calorie_total_saturates_and_floors() {
        // Negative / NaN amounts contribute nothing.
        let bad = line([0.0; 4], 0, 1000, 0.0, f32::NAN);
        assert_eq!(aggregate_recipe(&[bad]).total_calories, 0);

        // Saturate rather than wrap on overflow.
        let huge = line([0.0; 4], 0, u32::MAX, 0.0, 10.0);
        assert_eq!(aggregate_recipe(&[huge]).total_calories, u32::MAX);
    }

    #[test]
    fn extreme_finite_values_saturate_instead_of_overflowing() {
        // 1e38 is representable in f32, but 1e38 * 100 overflows f32 to +inf.
        // f64 accumulation + finite_f32 saturation must keep the result finite.
        let huge = NutrientLine {
            signature: [1e38, 0.0, 0.0, 0.0],
            primary_element: 0,
            calories: 0,
            protein_g: 1e38,
            fat_g: 0.0,
            carbs_g: 0.0,
            amount: 100.0,
        };
        let agg = aggregate_recipe(&[huge]);
        assert!(agg.signature[0].is_finite());
        assert!(agg.total_protein.is_finite());
        assert_eq!(agg.signature[0], f32::MAX);
        assert_eq!(agg.total_protein, f32::MAX);
    }

    #[test]
    fn average_signatures_stays_finite_for_extreme_inputs() {
        // (MAX + MAX) / 2 == MAX in f64; naive f32 accumulation would hit +inf.
        let mean = average_signatures(&[[f32::MAX, 0.0, 0.0, 0.0], [f32::MAX, 0.0, 0.0, 0.0]]);
        assert!(mean[0].is_finite());
        assert_eq!(mean[0], f32::MAX);
    }

    #[test]
    fn first_missing_ingredient_flags_absent_id() {
        let known: BTreeSet<u64> = [1, 3, 5].into_iter().collect();
        // This is the check that makes `create_recipe` fail closed and roll back.
        assert_eq!(first_missing_ingredient(&[1, 2, 3], &known), Some(2));
        assert_eq!(first_missing_ingredient(&[1, 3, 5], &known), None);
        assert_eq!(first_missing_ingredient(&[], &known), None);
    }

    #[test]
    fn pot_simmer_step_1000w_halves_in_about_18_minutes() {
        // At 18.0 min (1080 s), remaining is ~0.5007 L; at 18.1 min (1086 s), it passes 0.5 L and triggers alarm
        let out_18min = compute_pot_simmer_step(1.0, 1.0, 1000.0, 0, 0.5, 18.0 * 60.0).unwrap();
        assert!((0.49..=0.51).contains(&out_18min.current_vol_l), "got {}", out_18min.current_vol_l);
        assert!((1.95..=2.05).contains(&out_18min.concentration_ratio), "got {}", out_18min.concentration_ratio);
        assert!(out_18min.is_boiling);

        let out_triggered = compute_pot_simmer_step(1.0, 1.0, 1000.0, 0, 0.5, 18.1 * 60.0).unwrap();
        assert!(out_triggered.alarm_triggered);
    }

    #[test]
    fn pot_simmer_seals_are_strictly_monotonic() {
        let dt = 600.0; // 10 minutes
        let remaining: Vec<f64> = (0..=3)
            .map(|seal| compute_pot_simmer_step(2.0, 2.0, 1200.0, seal, 0.5, dt).unwrap().current_vol_l)
            .collect();
        // None loses the most, tight loses the least: remaining volume must strictly increase with seal tightness
        for pair in remaining.windows(2) {
            assert!(pair[1] > pair[0], "tight seal must preserve more volume: {:?}", remaining);
        }
    }

    #[test]
    fn pot_simmer_dry_boil_clamps_at_zero() {
        let out = compute_pot_simmer_step(1.0, 1.0, 2000.0, 0, 0.5, 100_000.0).unwrap();
        assert_eq!(out.current_vol_l, 0.0);
        assert_eq!(out.concentration_ratio, f64::INFINITY);
        assert!(!out.is_boiling);
        assert!(out.alarm_triggered);
    }

    #[test]
    fn pot_ownership_check_enforces_identity_match() {
        let id1 = [1u8; 32];
        let id2 = [2u8; 32];
        assert!(check_pot_ownership(&id1, &id1).is_ok());
        assert!(check_pot_ownership(&id1, &id2).is_err());
    }
}

// ---------------------------------------------------------------------------
// Simmer reduction constants & helpers
// ---------------------------------------------------------------------------

/// Share of free-surface evaporation that escapes, graded by seal state.
///
/// Index:
/// - 0 = none (1.00)
/// - 1 = cracked (0.55)
/// - 2 = loose (0.25)
/// - 3 = tight (0.08)
pub const VAPOUR_ESCAPE_FRACTIONS: [f64; 4] = [1.0, 0.55, 0.25, 0.08];

/// Latent heat of vaporisation at 100 °C boiling saturation, J/kg.
///
/// Cited from Incropera & DeWitt Table A.6 (saturated water).
pub const LATENT_HEAT_SATURATION_100C_J_KG: f64 = 2_257_000.0;

/// Output of a simulated simmer reduction step.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SimmerStepOutput {
    pub current_vol_l: f64,
    pub concentration_ratio: f64,
    pub is_boiling: bool,
    pub alarm_triggered: bool,
    pub net_loss_kg_s: f64,
}

/// Validate input parameters when creating a LivePot.
pub fn validate_live_pot_params(
    session_id: &str,
    recipe_ref: &str,
    vessel_name: &str,
    initial_vol_l: f64,
    burner_power_w: f64,
    lid_seal: u8,
    target_reduction_pct: f64,
) -> Result<(), String> {
    if session_id.trim().is_empty() {
        return Err("session_id must not be empty".to_string());
    }
    if session_id.len() > 320 {
        return Err("session_id must be <= 320 bytes".to_string());
    }
    if recipe_ref.len() > 256 {
        return Err("recipe_ref must be <= 256 bytes".to_string());
    }
    if vessel_name.trim().is_empty() {
        return Err("vessel_name must not be empty".to_string());
    }
    if vessel_name.len() > 256 {
        return Err("vessel_name must be <= 256 bytes".to_string());
    }
    if !initial_vol_l.is_finite() || initial_vol_l <= 0.0 || initial_vol_l > 100.0 {
        return Err("initial_vol_l must be a positive finite number <= 100 L".to_string());
    }
    if !burner_power_w.is_finite() || burner_power_w <= 0.0 || burner_power_w > 50_000.0 {
        return Err("burner_power_w must be a positive finite number <= 50000 W".to_string());
    }
    if lid_seal as usize >= VAPOUR_ESCAPE_FRACTIONS.len() {
        return Err("lid_seal must be 0..=3 (0=none, 1=cracked, 2=loose, 3=tight)".to_string());
    }
    if !target_reduction_pct.is_finite() || target_reduction_pct < 0.0 || target_reduction_pct >= 1.0 {
        return Err("target_reduction_pct must be in [0.0, 1.0)".to_string());
    }
    Ok(())
}

/// Compute a simulation step for pot simmer reduction.
pub fn compute_pot_simmer_step(
    initial_vol_l: f64,
    current_vol_l: f64,
    burner_power_w: f64,
    lid_seal: u8,
    target_reduction_pct: f64,
    dt_s: f64,
) -> Result<SimmerStepOutput, String> {
    if !initial_vol_l.is_finite() || initial_vol_l <= 0.0 {
        return Err("initial_vol_l must be a positive finite number".to_string());
    }
    if !current_vol_l.is_finite() || current_vol_l < 0.0 {
        return Err("current_vol_l must be a non-negative finite number".to_string());
    }
    if !burner_power_w.is_finite() || burner_power_w <= 0.0 {
        return Err("burner_power_w must be a positive finite number".to_string());
    }
    if lid_seal as usize >= VAPOUR_ESCAPE_FRACTIONS.len() {
        return Err("lid_seal must be 0..=3 (0=none, 1=cracked, 2=loose, 3=tight)".to_string());
    }
    if !dt_s.is_finite() || dt_s < 0.0 {
        return Err("dt_s must be a non-negative finite number".to_string());
    }

    if current_vol_l <= 0.0 {
        return Ok(SimmerStepOutput {
            current_vol_l: 0.0,
            concentration_ratio: f64::INFINITY,
            is_boiling: false,
            alarm_triggered: true,
            net_loss_kg_s: 0.0,
        });
    }

    let escape_frac = VAPOUR_ESCAPE_FRACTIONS[lid_seal as usize];
    let step = thermo_core::simmer_trajectory_step(
        current_vol_l,
        burner_power_w,
        LATENT_HEAT_SATURATION_100C_J_KG,
        escape_frac,
        100.0,
        dt_s,
    ).map_err(|e| format!("thermo error: {:?}", e))?;

    let remaining_vol_l = step[1].max(0.0);
    let net_loss_kg_s = step[3];
    let is_boiling = remaining_vol_l > 0.0;
    let concentration_ratio = if remaining_vol_l > 0.0 {
        initial_vol_l / remaining_vol_l
    } else {
        f64::INFINITY
    };
    let target_remaining_vol_l = (1.0 - target_reduction_pct.clamp(0.0, 1.0)) * initial_vol_l;
    let alarm_triggered = remaining_vol_l <= target_remaining_vol_l;

    Ok(SimmerStepOutput {
        current_vol_l: remaining_vol_l,
        concentration_ratio,
        is_boiling,
        alarm_triggered,
        net_loss_kg_s,
    })
}

/// Refuse mutation if the caller is not the row owner.
pub fn check_pot_ownership(owner_bytes: &[u8], sender_bytes: &[u8]) -> Result<(), String> {
    if owner_bytes != sender_bytes {
        return Err("unauthorized: caller does not own this live pot".to_string());
    }
    Ok(())
}

