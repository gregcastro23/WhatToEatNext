import { getDefaultPlanetaryPositions } from './astrologyUtils';
// Removed duplicate: // Removed duplicate: import type { PlanetPosition } from './astrologyUtils';

// Add a more specific interface for the reference positions
interface PlanetaryPosition {
  sign: string;
  degree: number;
  minute: number;
  isRetrograde?: boolean;
}

// Reference data from https://www.jessicaadams.com / (astrology || 1) / (current || 1)-planetary-positions / ((March || 1) 23, 2025)
const REFERENCE_POSITIONS: Record<string, PlanetaryPosition> = {
  sun: { sign: 'aries', degree: 2, minute: 37 },
  moon: { sign: 'capricorn', degree: 8, minute: 54 },
  mercury: { sign: 'aries', degree: 5, minute: 57, isRetrograde: true },
  venus: { sign: 'aries', degree: 2, minute: 40, isRetrograde: true },
  mars: { sign: 'cancer', degree: 20, minute: 55 },
  jupiter: { sign: 'gemini', degree: 14, minute: 40 },
  saturn: { sign: 'pisces', degree: 23, minute: 23 },
  uranus: { sign: 'taurus', degree: 24, minute: 22 },
  neptune: { sign: 'pisces', degree: 29, minute: 43 },
  pluto: { sign: 'aquarius', degree: 3, minute: 23 },
  ascendant: { sign: 'libra', degree: 18, minute: 19 },
};

// Calculate the difference between two positions in minutes
function calculatePositionDifference(
  pos1: PlanetaryPosition,
  pos2: PlanetaryPosition
): number {
  if (pos1.sign !== pos2.sign) {
    // Different signs - more complex calculation needed
    const signs = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ];

    const signIndex1 = signs.indexOf(pos1.sign);
    const signIndex2 = signs.indexOf(pos2.sign);

    if (signIndex1 === -1 || signIndex2 === -1) {
      return -1; // Can't calculate if sign not found
    }

    const signDiff = (signIndex1 - signIndex2 + 12) % 12;
    const degreeDiff = pos1.degree - (signDiff === 0 ? pos2.degree : 0);
    const minuteDiff =
      pos1.minute - (signDiff === 0 && degreeDiff === 0 ? pos2.minute : 0);

    return signDiff * 30 * 60 + degreeDiff * 60 + minuteDiff;
  }

  // Same sign, calculate degree and minute difference
  const degreeDiff = pos1.degree - pos2.degree;
  const minuteDiff = pos1.minute - pos2.minute;

  return degreeDiff * 60 + minuteDiff;
}

// Main validation function
export function validatePlanetaryPositions(
  positions?: Record<string, unknown>
): { accurate: boolean; differences: Record<string, unknown> } | boolean {
  // If positions are provided, perform basic validation on the object structure
  if (positions) {
    return validatePlanetaryPositionsStructure(positions);
  }

  // Otherwise, perform detailed validation against reference data
  try {
    const diff: Record<string, unknown> = {};
    let totalAccuracy = true;

    // Check each planet in the reference data
    Object.entries(REFERENCE_POSITIONS).forEach(([planet, refPosition]) => {
      // Get the calculated position for this planet
      const calculated = getDefaultPlanetaryPositions()[planet];

      if (!calculated) {
        diff[planet] = { status: 'missing' };
        totalAccuracy = false;
        return;
      }

      // Convert our formatting to match reference format
      const formattedCalculated: PlanetaryPosition = {
        sign: calculated.sign.toLowerCase(),
        degree: Math.floor(calculated.degree),
        minute: Math.floor((calculated.degree % 1) * 60),
        isRetrograde: calculated.isRetrograde,
      };

      // Calculate difference
      const signDiff = formattedCalculated.sign !== refPosition.sign;
      const degreeDiff = Math.abs(
        formattedCalculated.degree - refPosition.degree
      );
      const minuteDiff = refPosition.minute
        ? Math.abs((formattedCalculated.minute || 0) - refPosition.minute)
        : 0;
      const retrogradeMatch =
        formattedCalculated.isRetrograde === refPosition.isRetrograde;

      // Consider accurate if sign matches and degree is within tolerance
      const accurate =
        !signDiff &&
        degreeDiff < 1 &&
        (refPosition.minute === undefined || minuteDiff < 5) &&
        (refPosition.isRetrograde === undefined || retrogradeMatch);

      // Store the differences
      diff[planet] = {
        reference: refPosition,
        calculated: formattedCalculated,
        differences: {
          sign: signDiff
            ? `${refPosition.sign} ≠ ${formattedCalculated.sign}`
            : null,
          degree:
            degreeDiff > 1
              ? `${refPosition.degree}° ≠ ${formattedCalculated.degree}°`
              : null,
          minute:
            minuteDiff > 5
              ? `${refPosition.minute}' ≠ ${formattedCalculated.minute || 0}'`
              : null,
          retrograde: !retrogradeMatch
            ? `${refPosition.isRetrograde} ≠ ${formattedCalculated.isRetrograde}`
            : null,
        },
        accurate,
      };

      if (!accurate) totalAccuracy = false;
    });

    return {
      accurate: totalAccuracy,
      differences: diff,
    };
  } catch (error) {
    // console.error("Error validating planetary positions:", error);
    return {
      accurate: false,
      differences: { error: String(error) },
    };
  }
}

// Export a debug component function to display validation results
export function getValidationSummary(): string {
  const result = validatePlanetaryPositions();

  // Handle the case where result is a boolean
  if (typeof result === 'boolean') {
    return `Planetary Positions Validation: ${
      result ? 'PASSED ✓' : 'FAILED ✗'
    }`;
  }

  // Now we know result is an object with accurate and differences
  const { accurate, differences } = result;

  const summary = `Planetary Positions Validation (Reference: Jessica Adams):\n`;
  summary += `Overall Accuracy: ${accurate ? 'PASSED ✓' : 'FAILED ✗'}\n\n`;

  Object.entries(differences).forEach(([planet, data]) => {
    if (data.status === 'missing') {
      summary += `${planet}: MISSING\n`;
      return;
    }

    const { calculated, reference, accurate: planetAccurate } = data;
    summary += `${planet.padEnd(10)}: ${planetAccurate ? '✓' : '✗'} `;
    summary += `Calculated: ${calculated.sign} ${calculated.degree}°${calculated.minute}' `;

    if (calculated.isRetrograde) {
      summary += 'R ';
    }

    summary += `| Reference: ${reference.sign} ${reference.degree}°${reference.minute}' `;

    if (reference.isRetrograde) {
      summary += 'R';
    }

    summary += '\n';
  });

  return summary;
}

// Add a function to fetch the latest positions from our API
export async function fetchLatestPositions(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch('/api / (planetary || 1)-positions');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.calculatedPositions || {};
  } catch (error) {
    // console.error('Error fetching latest positions:', error);
    return {};
  }
}

// Create a function that checks against the API directly
export async function validateAgainstAPI(): Promise<{
  accurate: boolean;
  differences: Record<string, unknown>;
}> {
  const calculatedPositions = await fetchLatestPositions();
  const differences: Record<string, unknown> = {};
  let accurate = true;

  // If we couldn't fetch positions, return early
  if (!calculatedPositions || Object.keys(calculatedPositions).length === 0) {
    return {
      accurate: false,
      differences: { error: 'Could not fetch planetary positions' },
    };
  }

  // Compare each planet
  Object.entries(REFERENCE_POSITIONS).forEach(([planet, refPosition]) => {
    const calculated = calculatedPositions[planet];

    if (!calculated) {
      differences[planet] = { status: 'missing' };
      accurate = false;
      return;
    }

    // Calculate difference
    const diff = {
      signMatch: calculated.sign === refPosition.sign,
      degreeDiff: calculated.degree - refPosition.degree,
      minuteDiff: calculated.minute - refPosition.minute,
      retrogradeMatch: calculated.isRetrograde === refPosition.isRetrograde,
    };

    // Determine if accurate (within 5 minutes)
    const totalDiffMinutes = Math.abs(diff.degreeDiff * 60 + diff.minuteDiff);
    const isAccurate =
      diff.signMatch &&
      totalDiffMinutes <= 5 &&
      (refPosition.isRetrograde === undefined || diff.retrogradeMatch);

    differences[planet] = {
      calculated,
      reference: refPosition,
      difference: diff,
      accurate: isAccurate,
    };

    if (!isAccurate) {
      accurate = false;
    }
  });

  return { accurate, differences };
}

// Renamed function to avoid duplication
export function validatePlanetaryPositionsStructure(
  positions: Record<string, unknown>
): boolean {
  const requiredPlanets = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ];

  return requiredPlanets.every((planet) => {
    const p = positions[planet];
    return (
      p &&
      typeof p.longitude === 'number' &&
      p.longitude >= 0 &&
      p.longitude < 360 &&
      typeof p.latitude === 'number' &&
      typeof p.distance === 'number'
    );
  });
}
