import type { Element } from "@/types/alchemy";

/**
 * Tunable thresholds + canonical ordering for the shared elemental signature
 * model (`src/utils/elemental/signature.ts`).
 *
 * These values frame how the four-element vector is *described* — they never
 * change the underlying ranking math used by recommendations. They are the one
 * place to retune the adaptive "single vs. co-dominant vs. balanced" framing
 * against real sky data.
 *
 * Elemental principle: elements are individually valuable, self-reinforcing,
 * and never opposed. A "co-dominant" reading is therefore richer description —
 * an additive blend — never a conflict. There is no opposing-element logic here
 * (or anywhere downstream of these constants).
 */

/**
 * Last-resort, fully deterministic order used to break an *exact* numeric tie
 * for `dominant`. With the co-dominant tier an exact tie almost always surfaces
 * as co-dominant first, so this is only the final stabilizer that guarantees
 * `dominant` is identical on every surface for the same sky.
 */
export const CANONICAL_ELEMENT_ORDER: readonly Element[] = [
  "Fire",
  "Water",
  "Earth",
  "Air",
];

/**
 * An element joins the co-dominant set when its normalized share is within this
 * delta of the leader. 0.03 ≈ "within 3 percentage points of the top element."
 * Raise it to name secondaries more eagerly; lower it to insist on a clearer
 * lead before a second element is named. Tunable against real sky data.
 */
export const CO_DOMINANT_DELTA = 0.03;

/**
 * When the full spread (strongest minus weakest share) is below this, the whole
 * sky reads as "balanced" rather than leaning anywhere. 0.05 ≈ "all four
 * elements sit within 5 points of each other." Kept deliberately tight so a
 * genuine two-element lead (e.g. water & earth both ~8 points clear of the
 * floor) still reads as co-dominant rather than collapsing to "balanced."
 * Tunable against real sky data.
 */
export const BALANCED_SPREAD = 0.05;
