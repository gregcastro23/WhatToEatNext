import type { ElementalCharacter } from "./alchemy";
import type { CelestialPosition } from "./celestial";

/**
 * A validated position exposed by the client astrology hooks.
 *
 * Planet keys are lowercase at runtime. Lunar providers may also attach a
 * phase to the Moon position, so that extension is validated explicitly.
 */
export interface AstrologicalPosition extends CelestialPosition {
  phase?: string;
}

/** Honest runtime shape returned by useAstrologicalState. */
export type AstrologicalPositionMap = Record<
  string,
  AstrologicalPosition | undefined
>;

/** Minimum position data required by tarot calculations. */
export interface TarotPlanetPosition {
  sign: string;
  degree: number;
  exactLongitude?: number;
}

export type TarotPlanetaryAlignment = Record<
  string,
  TarotPlanetPosition | undefined
>;

/**
 * Additive tarot influence deltas, not a normalized elemental balance.
 * These values intentionally do not sum to 1.
 */
export type TarotElementBoostModifiers = Record<ElementalCharacter, number>;
