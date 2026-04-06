/**
 * Onboarding API Route
 * POST /api/onboarding — Save birth data, compute natal chart, mark onboarding complete
 *
 * Accepts: { email?, name?, birthData: BirthData }
 * Returns: { success, profile, natalChart }
 *
 * @file src/app/api/onboarding/route.ts
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { userDatabase } from "@/services/userDatabaseService";
import type { Planet, ZodiacSignType, Element, Modality } from "@/types/celestial";
import type { BirthData, NatalChart, PlanetInfo } from "@/types/natalChart";
import { validatePlanetaryPositions, formatValidationResult } from "@/utils/astrology/planetaryValidation";
import { calculateAlchemicalFromPlanets, isSectDiurnal } from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_ELEMENT: Record<ZodiacSignType, Element> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

const SIGN_TO_MODALITY: Record<ZodiacSignType, Modality> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed", leo: "Fixed", scorpio: "Fixed", aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable", sagittarius: "Mutable", pisces: "Mutable",
};

function calcDominantElement(positions: Record<Planet, ZodiacSignType>): Element {
  const counts: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  Object.values(positions).forEach((sign) => {
    const el = SIGN_TO_ELEMENT[sign];
    if (el) counts[el]++;
  });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as Element;
}

function calcDominantModality(positions: Record<Planet, ZodiacSignType>): Modality {
  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  Object.values(positions).forEach((sign) => {
    const m = SIGN_TO_MODALITY[sign];
    if (m) counts[m]++;
  });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as Modality;
}

function calcElementalBalance(positions: Record<Planet, ZodiacSignType>) {
  const counts: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  Object.values(positions).forEach((sign) => {
    const el = SIGN_TO_ELEMENT[sign];
    if (el) counts[el]++;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return {
    Fire: counts.Fire / total,
    Water: counts.Water / total,
    Earth: counts.Earth / total,
    Air: counts.Air / total,
  };
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { name, birthData } = body as {
      name?: string;
      birthData?: BirthData;
    };

    if (!birthData?.dateTime || birthData.latitude === undefined || birthData.longitude === undefined) {
      return NextResponse.json(
        { success: false, message: "birthData.dateTime, latitude, and longitude are required" },
        { status: 400 },
      );
    }

    // Resolve user from session or fallback
    const user = await getDatabaseUserFromRequest(request);

    if (!user) {
      _logger.warn("[POST /api/onboarding] User not found or not authenticated");
      return NextResponse.json(
        { success: false, message: "User not found. Please sign in first." },
        { status: 401 },
      );
    }

    const userId = user.id;

    // Compute natal chart from birth data
    const birthDate = new Date(birthData.dateTime);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid birthData.dateTime — must be a valid ISO date string" },
        { status: 400 },
      );
    }

    // 🐛 DIAGNOSTIC: Log birth date parsing
    const now = new Date();
    _logger.info("[POST /api/onboarding] 🔮 Birth Data Received:", {
      birthDataDateTime: birthData.dateTime,
      parsedBirthDate: birthDate.toISOString(),
      currentDate: now.toISOString(),
      isToday: birthDate.toDateString() === now.toDateString(),
      yearDifference: now.getFullYear() - birthDate.getFullYear(),
    });

    let rawPositions;
    try {
      rawPositions = await getPlanetaryPositionsForDateTime(birthDate, {
        latitude: birthData.latitude,
        longitude: birthData.longitude,
      });

      // 🐛 DIAGNOSTIC: Log calculated positions
      _logger.info("[POST /api/onboarding] 🌟 Calculated Natal Positions:", {
        Sun: rawPositions.Sun?.sign,
        Moon: rawPositions.Moon?.sign,
        Mercury: rawPositions.Mercury?.sign,
        Ascendant: rawPositions.Ascendant?.sign,
      });

      // 🛡️ VALIDATE: Ensure planetary positions are astronomically valid
      const validation = validatePlanetaryPositions(rawPositions, birthDate);
      const validationLog = formatValidationResult(validation);

      _logger.info(`[POST /api/onboarding] 🛡️ Position Validation Results:\n${  validationLog}`);

      if (!validation.valid) {
        // Validation errors detected, but proceed to avoid blocking onboarding.
        _logger.warn("[POST /api/onboarding] ⚠️ Position validation contained errors, but proceeding:", {
          errors: validation.errors,
          birthDate: birthDate.toISOString(),
          currentDate: now.toISOString(),
        });
      }

      // Log warnings but proceed
      if (validation.warnings && validation.warnings.length > 0) {
        _logger.warn("[POST /api/onboarding] ⚠️ Position validation warnings:", validation.warnings);
      }
    } catch (error) {
      _logger.error("[POST /api/onboarding] Planetary calculation failed", error as any);
      return NextResponse.json(
        { success: false, message: "Planetary calculation service unavailable. Please try again later." },
        { status: 503 },
      );
    }

    const positions: Record<Planet, ZodiacSignType> = {
      Sun: rawPositions.Sun?.sign,
      Moon: rawPositions.Moon?.sign,
      Mercury: rawPositions.Mercury?.sign,
      Venus: rawPositions.Venus?.sign,
      Mars: rawPositions.Mars?.sign,
      Jupiter: rawPositions.Jupiter?.sign,
      Saturn: rawPositions.Saturn?.sign,
      Uranus: rawPositions.Uranus?.sign,
      Neptune: rawPositions.Neptune?.sign,
      Pluto: rawPositions.Pluto?.sign,
      Ascendant: rawPositions.Ascendant?.sign || "aries",
    };

    const planets: PlanetInfo[] = Object.entries(positions).map(([pname, sign]) => ({
      name: pname as Planet,
      sign,
      position: rawPositions[pname]?.exactLongitude ?? 0,
    }));

    const natalChart: NatalChart = {
      birthData: {
        dateTime: birthData.dateTime,
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        timezone: birthData.timezone,
      },
      planets,
      ascendant: positions.Ascendant,
      planetaryPositions: positions,
      dominantElement: calcDominantElement(positions),
      dominantModality: calcDominantModality(positions),
      elementalBalance: calcElementalBalance(positions),
      alchemicalProperties: calculateAlchemicalFromPlanets(positions, isSectDiurnal(birthDate)),
      calculatedAt: new Date().toISOString(),
    };

    // Persist birth data, natal chart, and onboarding status
    const profileUpdates = {
      birthData: natalChart.birthData,
      natalChart,
      onboardingComplete: true,  // stored as onboarding_completed in DB
      ...(name ? { name } : {}),
    };

    const updatedUser = await userDatabase.updateUserProfile(userId, profileUpdates as any, user.email);

    // Send admin notification about completed onboarding
    // This provides the admin team with the user's dominant element
    try {
      const emailService = (await import("@/services/emailService")).default;
      emailService.ensureInitialized();
      if (emailService.isConfigured()) {
        const userName = name || user.profile.name || user.email;
        void emailService.sendAdminNotificationEmail(
          user.email,
          userName,
          natalChart.dominantElement,
        );
      }
    } catch (err) {
      _logger.error("[POST /api/onboarding] Failed to send admin notification:", err as any);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser?.id || userId,
        email: updatedUser?.email || user.email,
        name: updatedUser?.profile?.name || name || "",
      },
      profile: updatedUser?.profile ?? null,
      natalChart,
    });
  } catch (error) {
    _logger.error("[POST /api/onboarding] Onboarding error", error as any);
    return NextResponse.json(
      { success: false, message: "Onboarding failed. Please try again." },
      { status: 500 },
    );
  }
}

/** GET /api/onboarding — Check onboarding status */
export async function GET(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);

    if (!user) {
      _logger.warn("[GET /api/onboarding] User not found or not authenticated");
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      onboardingComplete: (user.profile as any).onboardingComplete ?? false,
      hasNatalChart: !!user.profile.natalChart,
      hasBirthData: !!user.profile.birthData,
    });
  } catch (error) {
    _logger.error("[GET /api/onboarding] Failed to check status", error as any);
    return NextResponse.json(
      { success: false, message: "Failed to check onboarding status" },
      { status: 500 },
    );
  }
}
