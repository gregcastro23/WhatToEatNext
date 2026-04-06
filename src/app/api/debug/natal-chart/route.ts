/**
 * Debug API Route - Natal Chart Data Inspection
 * GET /api/debug/natal-chart - Inspect stored natal chart vs current positions
 *
 * This route helps diagnose the natal/transit overlap bug by comparing:
 * 1. The natal chart stored in the database
 * 2. The current planetary positions
 * 3. Birth data timestamp vs current timestamp
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { getCurrentPlanetaryPositions } from "@/services/astrologizeApi";
import { validatePlanetaryPositions, formatValidationResult } from "@/utils/astrology/planetaryValidation";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get stored natal chart from database
    const natalChart = user.profile.natalChart;
    const birthData = user.profile.birthData;

    if (!natalChart || !birthData) {
      return NextResponse.json({
        success: false,
        message: "No natal chart found. Complete onboarding first.",
        hasNatalChart: !!natalChart,
        hasBirthData: !!birthData,
      });
    }

    // Get current planetary positions for comparison
    const currentPositions = await getCurrentPlanetaryPositions();

    // Extract birth timestamp
    const birthTimestamp = birthData.dateTime ? new Date(birthData.dateTime).toISOString() : null;
    const currentTimestamp = new Date().toISOString();

    // Compare positions
    const comparison: Record<string, any> = {};
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    for (const planet of planets) {
      const natalSign = natalChart.planetaryPositions?.[planet];
      const currentSign = currentPositions[planet]?.sign;
      const areIdentical = natalSign?.toLowerCase() === currentSign?.toLowerCase();

      comparison[planet] = {
        natal: natalSign || 'N/A',
        current: currentSign || 'N/A',
        identical: areIdentical,
        natalDegree: natalChart.planets?.find(p => p.name === planet)?.position,
        currentDegree: currentPositions[planet]?.exactLongitude,
      };
    }

    // Calculate how many are identical
    const identicalCount = Object.values(comparison).filter(c => c.identical).length;
    const totalCount = planets.length;
    const suspiciouslySimilar = identicalCount >= 8; // If 8+ planets match, likely bug

    // 🛡️ VALIDATE: Run astronomical validation on stored natal chart
    const birthDate = new Date(birthData.dateTime);
    const natalPositionsForValidation: Record<string, PlanetPosition> = {};

    // Convert natal chart format to validation format
    for (const planet of [...planets, 'Ascendant']) {
      const planetInfo = natalChart.planets?.find(p => p.name === planet);
      const sign = natalChart.planetaryPositions?.[planet];

      if (sign && planetInfo) {
        const degree = Math.floor(planetInfo.position % 30);
        const minute = Math.floor(((planetInfo.position % 30) - degree) * 60);

        natalPositionsForValidation[planet] = {
          sign,
          degree,
          minute,
          exactLongitude: planetInfo.position,
          isRetrograde: false, // Not stored in our natal chart format
        };
      }
    }

    const validation = validatePlanetaryPositions(natalPositionsForValidation, birthDate);
    const validationFormatted = formatValidationResult(validation);

    _logger.info(`[Debug Natal Chart] ${identicalCount}/${totalCount} planets match current sky`, {
      userId: user.id,
      birthTimestamp,
      currentTimestamp,
      validationPassed: validation.valid,
    });

    return NextResponse.json({
      success: true,
      diagnosis: {
        suspiciouslySimilar,
        identicalCount,
        totalCount,
        message: suspiciouslySimilar
          ? '🚨 BUG DETECTED: Natal chart appears to contain current positions instead of birth positions!'
          : '✅ Natal chart appears correct (different from current sky)',
      },
      timestamps: {
        birth: birthTimestamp,
        current: currentTimestamp,
        calculated: natalChart.calculatedAt,
      },
      birthData: {
        dateTime: birthData.dateTime,
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        timezone: birthData.timezone,
      },
      comparison,
      natalChart: {
        ascendant: natalChart.ascendant,
        dominantElement: natalChart.dominantElement,
        planetaryPositions: natalChart.planetaryPositions,
        alchemicalProperties: natalChart.alchemicalProperties,
      },
      currentPositions: Object.fromEntries(
        planets.map(p => [p, currentPositions[p]])
      ),
      validation: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        details: validation.details,
        formatted: validationFormatted,
      },
    });
  } catch (error) {
    _logger.error("[Debug Natal Chart] Error:", error as any);
    return NextResponse.json(
      { success: false, message: "Failed to inspect natal chart data", error: String(error) },
      { status: 500 }
    );
  }
}
