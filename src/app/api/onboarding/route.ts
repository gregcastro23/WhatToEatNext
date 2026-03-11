/**
 * Onboarding API Route
 * POST /api/onboarding - Complete user onboarding with birth data
 */

import { NextResponse } from "next/server";
import { UserRole } from "@/lib/auth/jwt-auth";
import {
  calculatePlanetaryPositions,
  calculateAscendantPosition,
} from "@/utils/serverPlanetaryCalculations";
import emailService from "@/services/emailService";
import { userDatabase } from "@/services/userDatabaseService";
import type { Planet, ZodiacSignType, Element, Modality } from "@/types/celestial";
import type { BirthData, NatalChart, PlanetInfo } from "@/types/natalChart";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Helper to calculate dominant element from planetary positions
function calculateDominantElement(
  planetaryPositions: Record<Planet, ZodiacSignType>,
): Element {
  const elementCounts: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  // Zodiac sign to element mapping
  const signToElement: Record<ZodiacSignType, Element> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };

  // Count elements from planetary positions
  Object.values(planetaryPositions).forEach((sign) => {
    const element = signToElement[sign];
    if (element) {
      elementCounts[element]++;
    }
  });

  // Find dominant element
  let maxCount = 0;
  let dominantElement: Element = "Fire";

  Object.entries(elementCounts).forEach(([element, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantElement = element as Element;
    }
  });

  return dominantElement;
}

// Helper to calculate dominant modality from planetary positions
function calculateDominantModality(
  planetaryPositions: Record<Planet, ZodiacSignType>,
): Modality {
  const modalityCounts: Record<string, number> = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };

  const signToModality: Record<ZodiacSignType, string> = {
    aries: "Cardinal",
    cancer: "Cardinal",
    libra: "Cardinal",
    capricorn: "Cardinal",
    taurus: "Fixed",
    leo: "Fixed",
    scorpio: "Fixed",
    aquarius: "Fixed",
    gemini: "Mutable",
    virgo: "Mutable",
    sagittarius: "Mutable",
    pisces: "Mutable",
  };

  Object.values(planetaryPositions).forEach((sign) => {
    const modality = signToModality[sign];
    if (modality) {
      modalityCounts[modality]++;
    }
  });

  let maxCount = 0;
  let dominantModality: Modality = "Cardinal";
  Object.entries(modalityCounts).forEach(([modality, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantModality = modality as Modality;
    }
  });

  return dominantModality;
}

// Helper to calculate elemental balance
function calculateElementalBalance(
  planetaryPositions: Record<Planet, ZodiacSignType>,
): { Fire: number; Water: number; Earth: number; Air: number } {
  const elementCounts: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  const signToElement: Record<ZodiacSignType, Element> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };

  Object.values(planetaryPositions).forEach((sign) => {
    const element = signToElement[sign];
    if (element) {
      elementCounts[element]++;
    }
  });

  // Normalize to 0-1 range
  const total = Object.values(elementCounts).reduce((a, b) => a + b, 0);
  return {
    Fire: elementCounts.Fire / total,
    Water: elementCounts.Water / total,
    Earth: elementCounts.Earth / total,
    Air: elementCounts.Air / total,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, birthData } = body;

    // Validate required fields
    if (!email || !name || !birthData) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, name, and birth data are required",
        },
        { status: 400 },
      );
    }

    // Validate birth data
    const { dateTime, latitude, longitude, timezone } = birthData;
    if (!dateTime || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complete birth data (dateTime, latitude, longitude) required",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    let user = await userDatabase.getUserByEmail(email);
    const isNewUser = !user;

    if (!user) {
      // Determine role: admin email or first-ever user gets ADMIN
      const adminEmail = process.env.AUTH_ADMIN_EMAIL || "xalchm@gmail.com";
      const allUsers = await userDatabase.getAllUsers();
      const isAdmin = email === adminEmail || allUsers.length === 0;

      user = await userDatabase.createUser({
        email,
        name,
        roles: isAdmin
          ? [UserRole.ADMIN, UserRole.USER]
          : [UserRole.USER],
      });
    }

    // Calculate natal chart — use server-side calculations directly to avoid
    // the HTTP call chain in astrologizeApi which can mis-route to the wrong
    // backend endpoint and fall back to hardcoded static positions.
    const birthDate = new Date(dateTime);
    const [rawPositions, ascendantPos] = await Promise.all([
      calculatePlanetaryPositions(birthDate),
      Promise.resolve(calculateAscendantPosition(birthDate, latitude, longitude)),
    ]);

    // Merge Ascendant into the positions map
    const planetaryPositions = {
      ...rawPositions,
      Ascendant: ascendantPos,
    };

    // Convert to Record<Planet, ZodiacSignType>
    const positions: Record<Planet, ZodiacSignType> = {
      Sun: planetaryPositions.Sun?.sign,
      Moon: planetaryPositions.Moon?.sign,
      Mercury: planetaryPositions.Mercury?.sign,
      Venus: planetaryPositions.Venus?.sign,
      Mars: planetaryPositions.Mars?.sign,
      Jupiter: planetaryPositions.Jupiter?.sign,
      Saturn: planetaryPositions.Saturn?.sign,
      Uranus: planetaryPositions.Uranus?.sign,
      Neptune: planetaryPositions.Neptune?.sign,
      Pluto: planetaryPositions.Pluto?.sign,
      Ascendant: ascendantPos.sign,
    };

    // Calculate alchemical properties
    const alchemicalProperties = calculateAlchemicalFromPlanets(positions);

    // Calculate elemental balance
    const elementalBalance = calculateElementalBalance(positions);

    // Calculate dominant element
    const dominantElement = calculateDominantElement(positions);

    // Create a `planets` array with real degree positions from the raw planetary data
    const planets: PlanetInfo[] = Object.entries(positions).map(
      ([name, sign]) => {
        const rawPosition = planetaryPositions[name];
        const exactLongitude = rawPosition?.exactLongitude ?? 0;
        return {
          name: name as Planet,
          sign,
          position: exactLongitude,
        };
      },
    );

    // Calculate dominant modality from planetary positions
    const dominantModality = calculateDominantModality(positions);

    // Create natal chart
    const natalChart: NatalChart = {
      birthData: {
        dateTime,
        latitude,
        longitude,
        timezone,
      } as BirthData,
      planets,
      ascendant: positions.Ascendant,
      planetaryPositions: positions,
      dominantElement,
      dominantModality,
      elementalBalance,
      alchemicalProperties,
      calculatedAt: new Date().toISOString(),
    };

    // Update user profile with birth data and natal chart
    const updatedUser = await userDatabase.updateUserProfile(user.id, {
      birthData: natalChart.birthData,
      natalChart,
    });

    if (!updatedUser) {
      throw new Error("Failed to update user profile");
    }

    // Send onboarding emails concurrently (non-blocking - don't fail onboarding if email fails)
    // NOTE: Welcome email and initial admin notification are now sent at sign-in time
    // (in auth.ts signIn callback). Here we only send an admin notification about
    // onboarding/birth-data completion, so the team knows the user finished setup.

    emailService.ensureInitialized();
    if (emailService.isConfigured()) {
      // Admin notification: inform team that user completed onboarding with birth data
      emailService
        .sendAdminNotificationEmail(email, name, dominantElement)
        .then((success) => {
          if (success) {
            console.log(
              `Admin notification sent for onboarding completion: ${email} (new=${isNewUser}, dominantElement=${dominantElement})`,
            );
          } else {
            console.error(
              `Failed to send admin notification for user: ${email}`,
            );
          }
        })
        .catch((error) => {
          console.error("Error sending admin notification:", error);
        });
    } else {
      console.log(
        "Email service not configured - skipping onboarding emails. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables to enable email notifications.",
      );
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.profile.name,
      },
      natalChart,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Onboarding failed",
      },
      { status: 500 },
    );
  }
}
