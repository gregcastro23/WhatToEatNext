/**
 * Planet-Specific Aspect Effects on ESMS
 *
 * This module defines how specific planetary aspects (conjunctions, trines, squares, etc.)
 * modify the ESMS (Spirit, Essence, Matter, Substance) properties of a birth moment.
 *
 * Key principle: Each planet pair has unique archetypal interactions. For example:
 * - Sun-Moon conjunction drains consciousness/emotion (user's example from dignity table)
 * - Mars-Venus conjunction amplifies passion
 * - Mercury-Jupiter conjunction expands communication
 *
 * Aspects are scaled by their strength (tightness of orb) to ensure
 * closer aspects have more impact than wider aspects.
 *
 * ── ASPECT–DIGNITY COMMENSURABILITY ────────────────────────────────────────
 *
 * `[RULED 2026-08-03, λ = 1]` — the aspect layer is ratified AS MEASURED. A
 * single aspect is commensurate with a single dignity FOLD at the median and
 * with a full dignity STACK at the tail. There is deliberately NO scaling
 * constant in this module; λ = 1 is the ruling, not an omission.
 *
 * BASIS: MEASURED over 48 fixed skies (1970–2025), 1743 aspects. Reproduce with
 * `src/__tests__/aspectDignityCommensurability.test.ts`, which recomputes every
 * number below from the manifest's own constants rather than reading them off
 * this comment. Additivity residual |Σparts − total| was exactly 0, so the
 * layer decomposition the ratios rest on is valid.
 *
 * The two layers are not the same kind of quantity, which is why this needed
 * ruling at all: Layer 2 (dignity) is a per-planet MULTIPLIER, 𝒟 = 1 + score/50
 * (`src/calculations/dignityManifest.ts`), while Layer 3 (this module) is an
 * ADDITIVE term on the chart totals. Nothing structurally ties them together,
 * so either can drift out of commensurability silently.
 *
 * Measured, in gross ESMS units summed over all four axes:
 *
 *   quantity                                   value    ×fold   ×stack
 *   ───────────────────────────────────────────────────────────────────
 *   one domicile fold (+5), 𝒟=1.10             0.0468   1.00    0.45
 *   full stack (+11, Mercury 0–7° Virgo)       0.1029   2.20    1.00
 *   single aspect, p50                         0.0352   0.75    0.34
 *   single aspect, mean                        0.0514   1.10    0.50
 *   single aspect, p90                         0.1000   2.14    0.97
 *   single aspect, p100                        0.8998   19.2    8.75
 *
 * The distribution is already BRACKETED by the two dignity anchors: the median
 * aspect sits just below one fold and p90 lands on the full-stack ceiling. That
 * IS the commensurability the ruling sought, so λ = 1 changes no number. Layer 3
 * gross is 25.8% of the Layer 1×2 chart total.
 *
 * REJECTED — stack-commensurate scaling (λ = 2.0012, making the MEAN aspect
 * equal a full stack). It doubles this layer and moves ESMS shares by up to
 * 10.98 percentage points, which would move every threshold stabilised under
 * ADR-009 — the same magnitude argument that rejected DIGNITY_SCORE_DIVISOR = 10
 * in favour of 50. The other modelled options: exact fold parity (λ = 0.9102) →
 * 1.25pp; per-aspect cap at the stack ceiling → 8.27pp (7.6% of aspects capped);
 * aspects off (λ = 0) → 17.97pp.
 *
 * ⚠ Shares do NOT absorb a rescale the way a uniform mass change does. Aspects
 * are additive and asymmetric across axes, so scaling this layer genuinely moves
 * the shares the economy reads (balances, archetype, yield) — it is not a
 * normalisation that cancels.
 *
 * KNOWN, NOT FIXED: 7.6% of aspects exceed a full dignity stack, topping out at
 * 8.75× (the Sun–Moon conjunction at ±0.5 per axis). Capping the tail was
 * modelled and deliberately not adopted — at 8.27pp it costs nearly as much as
 * the rescale it would prevent.
 *
 * Python parity half: `backend/utils/aspect_esms_effects.py`, enforced through
 * the shared golden `backend/tests/aspect_effects_golden.json`.
 */

import type { AspectType } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";

/**
 * ESMS modification from a specific planetary aspect
 * Each value represents the amount to add/subtract from the total
 */
export interface AspectESMSEffect {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  description: string;
}

/**
 * Aspect type for object keys
 */
export type PlanetPair = `${string}-${string}`;

/**
 * Aspect data structure with strength
 * strength: 0-1 scale (1 = exact aspect, 0 = wide orb)
 */
export interface AspectWithStrength {
  planet1: string;
  planet2: string;
  type: AspectType;
  strength: number;
}

/**
 * ============================================================================
 * PLANET-PAIR ASPECT EFFECTS
 * ============================================================================
 *
 * Each planet pair defines archetypal interactions based on their mythological
 * and astrological meanings.
 */

/**
 * SUN-MOON ASPECTS
 * The primary consciousness-unconsciousness dynamic
 * Sun = conscious will, identity
 * Moon = unconscious emotions, instincts, nurturing
 */
const SUN_MOON_ASPECTS: Record<AspectType, AspectESMSEffect> = {
  conjunction: {
    Spirit: -0.5,    // Conscious will submerged in emotional tides
    Essence: -0.5,   // Emotional energy temporarily depleted
    Matter: 0,       // No material manifestation
    Substance: 0,
    description: "New Moon: ego and emotion merge, temporary depletion of conscious drive",
  },
  opposition: {
    Spirit: 0.3,     // Full Moon: heightened awareness, illumination
    Essence: 0.3,    // Emotional clarity and release
    Matter: 0,
    Substance: 0,
    description: "Full Moon: conscious awareness faces emotional truth, creating balance",
  },
  trine: {
    Spirit: 0.2,     // Easy expression of will through emotion
    Essence: 0.2,    // Harmonious emotional flow
    Matter: 0,
    Substance: 0,
    description: "Harmonious flow between conscious purpose and emotional needs",
  },
  square: {
    Spirit: -0.1,    // Tension between will and emotion
    Essence: -0.1,   // Emotional friction
    Matter: 0.2,     // Generates material action from inner conflict
    Substance: 0,
    description: "Creative tension: emotional challenges drive physical action",
  },
  sextile: {
    Spirit: 0.1,
    Essence: 0.1,
    Matter: 0,
    Substance: 0,
    description: "Opportunity for consciousness to understand emotional needs",
  },
  quincunx: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0.1, description: "Adjustment between will and emotion" },
  inconjunct: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0.1, description: "Adjustment between will and emotion" },
  "semi-sextile": { Spirit: 0, Essence: 0.05, Matter: 0, Substance: 0, description: "Subtle emotional support" },
  sesquisquare: { Spirit: 0, Essence: 0, Matter: 0.1, Substance: 0, description: "Minor inner friction drives action" },
  semisquare: { Spirit: 0, Essence: 0, Matter: 0.1, Substance: 0, description: "Minor tension between ego and emotion" },
  quintile: { Spirit: 0.1, Essence: 0.05, Matter: 0, Substance: 0, description: "Creative emotional expression" },
  biquintile: { Spirit: 0.1, Essence: 0.05, Matter: 0, Substance: 0, description: "Artistic self-expression" },
};

/**
 * MARS-VENUS ASPECTS
 * The desire-action dynamic
 * Mars = action, aggression, driving force
 * Venus = desire, attraction, values, harmony
 */
const MARS_VENUS_ASPECTS: Record<AspectType, AspectESMSEffect> = {
  conjunction: {
    Spirit: 0,
    Essence: 0.4,    // Passion amplified
    Matter: 0.2,     // Physical attraction manifests
    Substance: 0,
    description: "Passionate union of desire and action, erotic energy",
  },
  opposition: {
    Spirit: 0,
    Essence: -0.2,   // Relationship tension and desire conflict
    Matter: 0,
    Substance: 0.2,  // Requires substantial commitment and maturity
    description: "Attraction vs. action tension, magnetism with challenge",
  },
  trine: {
    Spirit: 0,
    Essence: 0.3,    // Harmonious passion
    Matter: 0.1,     // Natural physical expression
    Substance: 0,
    description: "Harmonious passion and creative sexuality",
  },
  square: {
    Spirit: 0,
    Essence: -0.1,   // Desire thwarted or blocked
    Matter: 0.3,     // Generates intense physical/sexual energy from friction
    Substance: 0,
    description: "Sexual/creative friction driving intense physical expression",
  },
  sextile: {
    Spirit: 0,
    Essence: 0.2,    // Easy desire flow
    Matter: 0.1,     // Natural physical expression
    Substance: 0,
    description: "Creative opportunity for harmonious passion",
  },
  quincunx: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0.1, description: "Desire adjustment needed" },
  inconjunct: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0.1, description: "Desire adjustment needed" },
  "semi-sextile": { Spirit: 0, Essence: 0.1, Matter: 0, Substance: 0, description: "Gentle harmonious attraction" },
  sesquisquare: { Spirit: 0, Essence: 0, Matter: 0.1, Substance: 0, description: "Minor passion friction" },
  semisquare: { Spirit: 0, Essence: 0, Matter: 0.1, Substance: 0, description: "Minor desire friction" },
  quintile: { Spirit: 0, Essence: 0.2, Matter: 0.1, Substance: 0, description: "Creative romantic gift" },
  biquintile: { Spirit: 0, Essence: 0.2, Matter: 0.1, Substance: 0, description: "Artistic sexual expression" },
};

/**
 * MERCURY-JUPITER ASPECTS
 * The communication-expansion dynamic
 * Mercury = thinking, communication, perception
 * Jupiter = expansion, wisdom, philosophy, excess
 */
const MERCURY_JUPITER_ASPECTS: Record<AspectType, AspectESMSEffect> = {
  conjunction: {
    Spirit: 0.4,     // Expanded consciousness, philosophical mind
    Essence: 0,
    Matter: 0,
    Substance: 0.2,  // Philosophical substance and depth
    description: "Philosophical mind expansion and wisdom in communication",
  },
  opposition: {
    Spirit: 0.1,     // Balance between detail and big picture
    Essence: 0,
    Matter: 0,
    Substance: 0.2,  // Substance from balancing perspectives
    description: "Finding balance between details and philosophy",
  },
  trine: {
    Spirit: 0.3,     // Easy expansion of consciousness
    Essence: 0,
    Matter: 0,
    Substance: 0.1,
    description: "Easy learning, teaching, and intellectual expansion",
  },
  square: {
    Spirit: -0.1,    // Over-optimistic thinking, lack of grounding
    Essence: 0,
    Matter: 0,
    Substance: -0.1,
    description: "Overconfident communication, exaggeration",
  },
  sextile: {
    Spirit: 0.2,     // Opportunities for growth through learning
    Essence: 0,
    Matter: 0,
    Substance: 0.1,
    description: "Opportunities for intellectual and philosophical growth",
  },
  quincunx: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0, description: "Belief adjustment" },
  inconjunct: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0, description: "Belief adjustment" },
  "semi-sextile": { Spirit: 0.1, Essence: 0, Matter: 0, Substance: 0, description: "Subtle wisdom" },
  sesquisquare: { Spirit: 0, Essence: 0, Matter: 0, Substance: -0.05, description: "Minor mental friction" },
  semisquare: { Spirit: 0, Essence: 0, Matter: 0, Substance: -0.05, description: "Minor philosophical friction" },
  quintile: { Spirit: 0.2, Essence: 0, Matter: 0, Substance: 0.1, description: "Gifted communication and teaching" },
  biquintile: { Spirit: 0.2, Essence: 0, Matter: 0, Substance: 0.1, description: "Inspired philosophizing" },
};

/**
 * SATURN-SUN ASPECTS
 * The structure-identity dynamic
 * Saturn = limitation, time, discipline, structure, responsibility
 * Sun = identity, will, vitality, expression
 */
const SATURN_SUN_ASPECTS: Record<AspectType, AspectESMSEffect> = {
  conjunction: {
    Spirit: -0.3,    // Ego limitation and humbling
    Essence: 0,
    Matter: 0.4,     // Builds material, lasting form
    Substance: 0.2,  // Develops substantial character
    description: "Ego meets discipline: maturation through limitation",
  },
  opposition: {
    Spirit: 0,       // Balances freedom with responsibility
    Essence: 0,
    Matter: 0.2,     // Material growth through responsibility
    Substance: 0.3,  // Develops lasting substance and maturity
    description: "Finding balance between freedom and responsibility",
  },
  square: {
    Spirit: -0.2,    // Ego challenged by authority
    Essence: 0,
    Matter: 0.3,     // Authority challenges strengthen character
    Substance: 0,
    description: "Authority challenges lead to character strength",
  },
  trine: {
    Spirit: 0.1,     // Natural authority and confidence
    Essence: 0,
    Matter: 0.3,     // Natural achievement through discipline
    Substance: 0.2,
    description: "Natural discipline, structure, and achievement",
  },
  sextile: {
    Spirit: 0.1,
    Essence: 0,
    Matter: 0.2,     // Opportunities through structure
    Substance: 0.1,
    description: "Opportunities arising through structure and discipline",
  },
  quincunx: { Spirit: 0, Essence: 0, Matter: 0.1, Substance: 0.1, description: "Duty adjustment" },
  inconjunct: { Spirit: 0, Essence: 0, Matter: 0.1, Substance: 0.1, description: "Duty adjustment" },
  "semi-sextile": { Spirit: 0, Essence: 0, Matter: 0.1, Substance: 0, description: "Gentle discipline" },
  sesquisquare: { Spirit: -0.1, Essence: 0, Matter: 0.1, Substance: 0, description: "Minor restriction" },
  semisquare: { Spirit: -0.1, Essence: 0, Matter: 0.1, Substance: 0, description: "Minor limitation" },
  quintile: { Spirit: 0.1, Essence: 0, Matter: 0.2, Substance: 0, description: "Mastery through disciplined effort" },
  biquintile: { Spirit: 0.1, Essence: 0, Matter: 0.2, Substance: 0, description: "Structured creativity" },
};

/**
 * DEFAULT ASPECT EFFECTS
 * Used when specific planet pair is not defined
 * Generic harmonious/challenging effects based on aspect type only
 */
const DEFAULT_ASPECT_EFFECTS: Record<AspectType, AspectESMSEffect> = {
  conjunction: {
    Spirit: 0.1,
    Essence: 0.1,
    Matter: 0,
    Substance: 0,
    description: "Planets merge energies and identity",
  },
  opposition: {
    Spirit: 0,
    Essence: 0,
    Matter: 0.1,
    Substance: 0,
    description: "Polarity creates manifestation and physicality",
  },
  trine: {
    Spirit: 0.05,
    Essence: 0.05,
    Matter: 0,
    Substance: 0,
    description: "Harmonious flow and ease",
  },
  square: {
    Spirit: 0,
    Essence: 0,
    Matter: 0.1,
    Substance: 0,
    description: "Creative tension produces action and manifestation",
  },
  sextile: {
    Spirit: 0.05,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    description: "Supportive opportunity and luck",
  },
  quincunx: {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0.05,
    description: "Adjustment and recalibration needed",
  },
  inconjunct: {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0.05,
    description: "Adjustment and recalibration needed",
  },
  "semi-sextile": {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    description: "Subtle link and connection",
  },
  sesquisquare: {
    Spirit: 0,
    Essence: 0,
    Matter: 0.05,
    Substance: 0,
    description: "Minor friction and tension",
  },
  semisquare: {
    Spirit: 0,
    Essence: 0,
    Matter: 0.05,
    Substance: 0,
    description: "Minor tension and irritation",
  },
  quintile: {
    Spirit: 0.05,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    description: "Creative gift and talent",
  },
  biquintile: {
    Spirit: 0.05,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    description: "Artistic talent and creative expression",
  },
};

/**
 * Map of planet pairs to their aspect effect tables
 * Key format: "Planet1-Planet2" (alphabetically sorted)
 */
export const PLANET_PAIR_ASPECT_EFFECTS: Record<PlanetPair, Record<AspectType, AspectESMSEffect>> = {
  "Moon-Sun": SUN_MOON_ASPECTS,
  "Mars-Venus": MARS_VENUS_ASPECTS,
  "Jupiter-Mercury": MERCURY_JUPITER_ASPECTS,
  "Saturn-Sun": SATURN_SUN_ASPECTS,
  // Additional pairs can be added here
  // "Jupiter-Saturn": JUPITER_SATURN_ASPECTS,
  // "Mars-Saturn": MARS_SATURN_ASPECTS,
};

/**
 * Get ESMS effect for a specific aspect between two planets
 *
 * Searches for planet-pair specific effects first, then falls back
 * to generic effects based on aspect type.
 *
 * @param planet1 - First planet name
 * @param planet2 - Second planet name
 * @param aspectType - Type of aspect (conjunction, opposition, etc.)
 * @returns AspectESMSEffect with modification values
 */
export function getAspectESMSEffect(
  planet1: string,
  planet2: string,
  aspectType: AspectType,
): AspectESMSEffect {
  // Normalize planet names and create sorted pair key
  const p1 = planet1.charAt(0).toUpperCase() + planet1.slice(1).toLowerCase();
  const p2 = planet2.charAt(0).toUpperCase() + planet2.slice(1).toLowerCase();
  const pairKey: PlanetPair = [p1, p2].sort().join("-") as PlanetPair;

  // Look up specific pair effects, fallback to default
  const pairEffects = PLANET_PAIR_ASPECT_EFFECTS[pairKey];
  if (pairEffects?.[aspectType]) {
    return pairEffects[aspectType];
  }

  return DEFAULT_ASPECT_EFFECTS[aspectType];
}

/**
 * Calculate total ESMS modifications from all aspects
 *
 * Scales each aspect's effect by its strength (orb tightness) to ensure
 * closer aspects have more impact.
 *
 * @param aspects - Array of aspects with strength values
 * @returns Total ESMS modifications to apply
 */
export function calculateAspectESMSModifications(
  aspects: AspectWithStrength[],
): AlchemicalProperties {
  const totalEffect: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };

  for (const aspect of aspects) {
    const effect = getAspectESMSEffect(aspect.planet1, aspect.planet2, aspect.type);
    if (!effect) {
      continue;
    }

    // Scale effect by aspect strength (0-1, where 1 = exact aspect).
    // `??` not `||`: a pair sitting exactly at an aspect's maximum orb has a
    // cosine-bell strength of exactly 0, and `||` would read that legitimate
    // zero as "missing" and apply the FULL archetypal effect — the widest
    // possible aspect hitting hardest, and disagreeing with every other
    // consumer of the same `strength` field.
    const scaledEffect = aspect.strength ?? 1.0;

    totalEffect.Spirit += effect.Spirit * scaledEffect;
    totalEffect.Essence += effect.Essence * scaledEffect;
    totalEffect.Matter += effect.Matter * scaledEffect;
    totalEffect.Substance += effect.Substance * scaledEffect;
  }

  return totalEffect;
}
