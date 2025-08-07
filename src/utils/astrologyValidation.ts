import { getLatestAstrologicalState } from '@/services/AstrologicalService';

// Removed unused PlanetPosition import

// Add a more specific interface for the reference positions
interface PlanetaryPosition {
  sign: string;
  degree: number;
  minute: number;
  isRetrograde?: boolean;
}

// Reference data from https://www.jessicaadams.com/astrology/current-planetary-positions/ (March 23, 2025)
const REFERENCE_POSITIONS: Record<string, PlanetaryPosition> = {
  'sun': { sign: 'aries', degree: 2, minute: 37 },
  'moon': { sign: 'capricorn', degree: 8, minute: 54 },
  'mercury': { sign: 'aries', degree: 5, minute: 57, isRetrograde: true },
  'venus': { sign: 'aries', degree: 2, minute: 40, isRetrograde: true },
  'mars': { sign: 'cancer', degree: 20, minute: 55 },
  'jupiter': { sign: 'gemini', degree: 14, minute: 40 },
  'saturn': { sign: 'pisces', degree: 23, minute: 23 },
  'uranus': { sign: 'taurus', degree: 24, minute: 22 },
  'neptune': { sign: 'pisces', degree: 29, minute: 43 },
  'pluto': { sign: 'aquarius', degree: 3, minute: 23 },
  'ascendant': { sign: 'libra', degree: 18, minute: 19 }
};

// Calculate the difference between two positions in minutes
function _calculatePositionDifference(pos1: PlanetaryPosition, pos2: PlanetaryPosition): number {
  if (pos1.sign !== pos2.sign) {
    // Different signs - more complex calculation needed
    const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

    const signIndex1 = signs.indexOf(pos1.sign);
    const signIndex2 = signs.indexOf(pos2.sign);

    if (signIndex1 === -1 || signIndex2 === -1) {
      return -1; // Can't calculate if sign not found
    }

    const signDiff = (signIndex1 - signIndex2 + 12) % 12;
    const degreeDiff = pos1.degree - (signDiff === 0 ? pos2.degree : 0);
    const minuteDiff = pos1.minute - (signDiff === 0 && degreeDiff === 0 ? pos2.minute : 0);

    return (signDiff * 30 * 60) + (degreeDiff * 60) + minuteDiff;
  }

  // Same sign, calculate degree and minute difference
  const degreeDiff = pos1.degree - pos2.degree;
  const minuteDiff = pos1.minute - pos2.minute;

  return (degreeDiff * 60) + minuteDiff;
}

// Main validation function
export async function validatePlanetaryPositions(positions?: Record<string, unknown>): Promise<{ accurate: boolean, differences: Record<string, unknown> } | boolean> {
  // If positions are provided, perform basic validation on the object structure
  if (positions) {
    return validatePlanetaryPositionsStructure(positions);
  }

  // Otherwise, perform detailed validation against reference data
  try {
    const diff: Record<string, unknown> = {};
    let totalAccuracy = true;

    // Check each planet in the reference data
    const astrologicalState = await getLatestAstrologicalState();
    Object.entries(REFERENCE_POSITIONS).forEach(([planet, refPosition]) => {
      // Get the calculated position for this planet
      const calculated = astrologicalState.data?.planetaryPositions[planet];

      if (!calculated) {
        diff[planet] = { status: 'missing' };
        totalAccuracy = false;
        return;
      }

      // Safe access to calculated properties
      const calculatedData = calculated as unknown as Record<string, unknown>;

      // Convert our formatting to match reference format
      const formattedCalculated: PlanetaryPosition = {
        sign: String(calculatedData.sign || '').toLowerCase(),
        degree: Math.floor(Number(calculatedData.degree || 0)),
        minute: Math.floor((Number(calculatedData.degree || 0) % 1) * 60),
        isRetrograde: Boolean(calculatedData.isRetrograde)
      };

      // Calculate difference
      const signDiff = formattedCalculated.sign !== refPosition.sign;
      const degreeDiff = Math.abs(formattedCalculated.degree - refPosition.degree);
      const minuteDiff = refPosition.minute ? Math.abs((formattedCalculated.minute || 0) - refPosition.minute) : 0;
      const retrogradeMatch = formattedCalculated.isRetrograde === refPosition.isRetrograde;

      // Consider accurate if sign matches and degree is within tolerance
      const accurate = !signDiff &&
                       degreeDiff < 1 &&
                       (refPosition.minute === undefined || minuteDiff < 5) &&
                       (refPosition.isRetrograde === undefined || retrogradeMatch);

      // Store the differences
      diff[planet] = {
        reference: refPosition,
        calculated: formattedCalculated,
        differences: {
          sign: signDiff ? `${refPosition.sign} ≠ ${formattedCalculated.sign}` : null,
          degree: degreeDiff > 1 ? `${refPosition.degree}° ≠ ${formattedCalculated.degree}°` : null,
          minute: minuteDiff > 5 ? `${refPosition.minute}' ≠ ${formattedCalculated.minute || 0}'` : null,
          retrograde: !retrogradeMatch ? `${refPosition.isRetrograde} ≠ ${formattedCalculated.isRetrograde}` : null
        },
        accurate
      };

      if (!accurate) totalAccuracy = false;
    });

    return {
      accurate: totalAccuracy,
      differences: diff
    };
  } catch (error) {
    console.error("Error validating planetary positions:", error);
    return {
      accurate: false,
      differences: { error: String(error) }
    };
  }
}

// Export a debug component function to display validation results
export async function getValidationSummary(): Promise<string> {
  const result = await validatePlanetaryPositions();

  // Handle the case where result is a boolean
  if (typeof result === 'boolean') {
    return `Planetary Positions Validation: ${result ? 'PASSED ✓' : 'FAILED ✗'}`;
  }

  // Now we know result is an object with accurate and differences
  const { accurate, differences } = result as { accurate: boolean; differences: Record<string, unknown> };

  let summary = `Planetary Positions Validation (Reference: Jessica Adams):\n`;
  summary += `Overall Accuracy: ${accurate ? 'PASSED ✓' : 'FAILED ✗'}\n\n`;

  Object.entries(differences).forEach(([planet, data]) => {
    const planetData = data as Record<string, unknown>;

    if (planetData.status === 'missing') {
      summary += `${planet}: MISSING\n`;
      return;
    }

    const calculated = planetData.calculated;
    const reference = planetData.reference;
    const planetAccurate = planetData.accurate;

    summary += `${planet.padEnd(10)}: ${planetAccurate ? '✓' : '✗'} `;
    summary += `Calculated: ${(calculated as Record<string, unknown>).sign} ${(calculated as Record<string, unknown>).degree}°${(calculated as Record<string, unknown>).minute}' `;

    if ((calculated as Record<string, unknown>).isRetrograde) {
      summary += 'R ';
    }

    summary += `| Reference: ${(reference as Record<string, unknown>).sign} ${(reference as Record<string, unknown>).degree}°${(reference as Record<string, unknown>).minute}' `;

    if ((reference as Record<string, unknown>).isRetrograde) {
      summary += 'R';
    }

    summary += '\n';
  });

  return summary;
}

// Add a function to fetch the latest positions from our API
export async function fetchLatestPositions(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch('/api/planetary-positions');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseData = data as Record<string, unknown>;
    return (responseData.calculatedPositions || {}) as Record<string, unknown>;
  } catch (error) {
    console.error('Error fetching latest positions:', error);
    return {};
  }
}

// Create a function that checks against the API directly
export async function validateAgainstAPI(): Promise<{ accurate: boolean, differences: Record<string, unknown> }> {
  const calculatedPositions = await fetchLatestPositions();
  const differences: Record<string, unknown> = {};
  let accurate = true;

  // If we couldn't fetch positions, return early
  if (!calculatedPositions || Object.keys(calculatedPositions).length === 0) {
    return {
      accurate: false,
      differences: { error: 'Could not fetch planetary positions' }
    };
  }

  // Compare each planet
  Object.entries(REFERENCE_POSITIONS).forEach(([planet, refPosition]) => {
    const calculatedPosition = (calculatedPositions )[planet];

    if (!calculatedPosition) {
      differences[planet] = { status: 'missing' };
      accurate = false;
      return;
    }

    // Safe access to calculated position data
    const positionData = calculatedPosition as Record<string, unknown>;

    const formattedCalculated: PlanetaryPosition = {
      sign: String(positionData.sign || '').toLowerCase(),
      degree: Math.floor(Number(positionData.degree || 0)),
      minute: Math.floor((Number(positionData.degree || 0) % 1) * 60),
      isRetrograde: Boolean(positionData.isRetrograde)
    };

    // Calculate differences
    const signDiff = formattedCalculated.sign !== refPosition.sign;
    const degreeDiff = Math.abs(formattedCalculated.degree - refPosition.degree);
    const minuteDiff = refPosition.minute ? Math.abs((formattedCalculated.minute || 0) - refPosition.minute) : 0;
    const retrogradeMatch = formattedCalculated.isRetrograde === refPosition.isRetrograde;

    const planetAccurate = !signDiff &&
                          degreeDiff < 1 &&
                          (refPosition.minute === undefined || minuteDiff < 5) &&
                          (refPosition.isRetrograde === undefined || retrogradeMatch);

    differences[planet] = {
      reference: refPosition,
      calculated: formattedCalculated,
      differences: {
        sign: signDiff ? `${refPosition.sign} ≠ ${formattedCalculated.sign}` : null,
        degree: degreeDiff > 1 ? `${refPosition.degree}° ≠ ${formattedCalculated.degree}°` : null,
        minute: minuteDiff > 5 ? `${refPosition.minute}' ≠ ${formattedCalculated.minute || 0}'` : null,
        retrograde: !retrogradeMatch ? `${refPosition.isRetrograde} ≠ ${formattedCalculated.isRetrograde}` : null
      },
      accurate: planetAccurate
    };

    if (!planetAccurate) accurate = false;
  });

  return { accurate, differences };
}

// Renamed function to avoid duplication
export function validatePlanetaryPositionsStructure(positions: Record<string, unknown>): boolean {
  const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
                          'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

  return requiredPlanets.every(planet => {
    const p = positions[planet];
    // Apply safe type casting for property access
    const planetData = p as Record<string, unknown>;
    return planetData &&
      typeof planetData.longitude === 'number' &&
      planetData.longitude >= 0 && planetData.longitude < 360 &&
      typeof planetData.latitude === 'number' &&
      typeof planetData.distance === 'number';
  });
}
