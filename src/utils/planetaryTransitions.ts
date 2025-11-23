/**
 * Planetary Transition Calculator
 *
 * Calculates when planets will move into their next zodiac sign
 * based on average daily motion and current position.
 */

import type { PlanetPosition } from "@/utils/astrologyUtils";

/**
 * Average daily motion for each planet in degrees per day
 * Note: These are approximations. Actual motion varies due to elliptical orbits.
 */
export const AVERAGE_DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856, // ~1 degree/day
  Moon: 13.176, // ~13 degrees/day
  Mercury: 1.383, // ~1.4 degrees/day (varies widely due to retrograde)
  Venus: 1.202, // ~1.2 degrees/day (varies due to retrograde)
  Mars: 0.524, // ~0.5 degrees/day
  Jupiter: 0.083, // ~0.08 degrees/day
  Saturn: 0.033, // ~0.03 degrees/day
  Uranus: 0.012, // ~0.01 degrees/day
  Neptune: 0.006, // ~0.006 degrees/day
  Pluto: 0.004, // ~0.004 degrees/day
};

/**
 * Zodiac signs in order
 */
const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

/**
 * Get the next zodiac sign in the cycle
 */
function getNextSign(currentSign: string): string {
  const currentIndex = ZODIAC_SIGNS.indexOf(currentSign.toLowerCase() as any);
  if (currentIndex === -1) return "aries";
  const nextIndex = (currentIndex + 1) % ZODIAC_SIGNS.length;
  return ZODIAC_SIGNS[nextIndex];
}

/**
 * Get the previous zodiac sign in the cycle
 */
function getPreviousSign(currentSign: string): string {
  const currentIndex = ZODIAC_SIGNS.indexOf(currentSign.toLowerCase() as any);
  if (currentIndex === -1) return "pisces";
  const prevIndex = (currentIndex - 1 + ZODIAC_SIGNS.length) % ZODIAC_SIGNS.length;
  return ZODIAC_SIGNS[prevIndex];
}

/**
 * Calculate when a planet will move into the next sign
 *
 * @param planetName - Name of the planet (e.g., "Sun", "Moon")
 * @param position - Current position of the planet
 * @returns Object with next sign, estimated date, and days until transition
 */
export function calculateNextSignTransition(
  planetName: string,
  position: PlanetPosition,
): {
  nextSign: string;
  estimatedDate: Date;
  daysUntil: number;
  direction: "forward" | "retrograde";
} {
  const dailyMotion = AVERAGE_DAILY_MOTION[planetName];

  if (!dailyMotion) {
    // Unknown planet, return a default estimate
    return {
      nextSign: getNextSign(position.sign),
      estimatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      daysUntil: 30,
      direction: "forward",
    };
  }

  // Calculate current position within sign (0-30 degrees)
  const currentPositionInSign = position.degree + position.minute / 60;

  let degreesRemaining: number;
  let nextSign: string;
  let direction: "forward" | "retrograde";

  if (position.isRetrograde) {
    // Moving backwards, will enter the previous sign
    degreesRemaining = currentPositionInSign;
    nextSign = getPreviousSign(position.sign);
    direction = "retrograde";
  } else {
    // Moving forwards, will enter the next sign
    degreesRemaining = 30 - currentPositionInSign;
    nextSign = getNextSign(position.sign);
    direction = "forward";
  }

  // Calculate days until transition
  const daysUntil = degreesRemaining / dailyMotion;

  // Calculate estimated date
  const estimatedDate = new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000);

  return {
    nextSign,
    estimatedDate,
    daysUntil,
    direction,
  };
}

/**
 * Format days until transition into a human-readable string
 *
 * @param days - Number of days
 * @returns Formatted string (e.g., "2.3 days", "5 hours", "3 months")
 */
export function formatTransitionTime(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  } else if (days < 7) {
    return `${days.toFixed(1)} days`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} ${months === 1 ? "month" : "months"}`;
  } else {
    const years = Math.round(days / 365);
    return `${years} ${years === 1 ? "year" : "years"}`;
  }
}

/**
 * Capitalize first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
