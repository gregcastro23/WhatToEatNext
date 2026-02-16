/**
 * Onboarding API Route
 * POST /api/onboarding - Complete user onboarding with birth data
 */

import { NextResponse } from "next/server";
import { userDatabase } from "@/services/userDatabaseService";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import emailService from "@/services/emailService";
import { UserRole } from "@/lib/auth/jwt-auth";
import type { NextRequest } from "next/server";
import type { BirthData, NatalChart, PlanetInfo } from "@/types/natalChart";
import type { Planet, ZodiacSignType, Element } from "@/types/celestial";

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
      // Create new user
      user = await userDatabase.createUser({
        email,
        name,
        roles:
          email === "xalchm@gmail.com"
            ? [UserRole.ADMIN, UserRole.USER]
            : [UserRole.USER],
      });
    }

    // Calculate natal chart
    const birthDate = new Date(dateTime);
    const planetaryPositions = await getPlanetaryPositionsForDateTime(
      birthDate,
      { latitude, longitude },
    );

    // Convert to Record<Planet, ZodiacSignType>
    // Note: Ascendant is optional as it may not always be calculated
    const positions: Record<Planet, ZodiacSignType> = {
      Sun: planetaryPositions.Sun?.sign as ZodiacSignType,
      Moon: planetaryPositions.Moon?.sign as ZodiacSignType,
      Mercury: planetaryPositions.Mercury?.sign as ZodiacSignType,
      Venus: planetaryPositions.Venus?.sign as ZodiacSignType,
      Mars: planetaryPositions.Mars?.sign as ZodiacSignType,
      Jupiter: planetaryPositions.Jupiter?.sign as ZodiacSignType,
      Saturn: planetaryPositions.Saturn?.sign as ZodiacSignType,
      Uranus: planetaryPositions.Uranus?.sign as ZodiacSignType,
      Neptune: planetaryPositions.Neptune?.sign as ZodiacSignType,
      Pluto: planetaryPositions.Pluto?.sign as ZodiacSignType,
      Ascendant:
        (planetaryPositions.Ascendant?.sign as ZodiacSignType) || "aries", // Default fallback
    };

    // Calculate alchemical properties
    const alchemicalProperties = calculateAlchemicalFromPlanets(positions);

    // Calculate elemental balance
    const elementalBalance = calculateElementalBalance(positions);

    // Calculate dominant element
    const dominantElement = calculateDominantElement(positions);

    // Create a `planets` array from the `positions` object.
    const planets: PlanetInfo[] = Object.entries(positions).map(
      ([name, sign]) => ({
        name: name as Planet,
        sign,
        position: 0, // Simplified for now
      }),
    );

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
      dominantModality: "Cardinal", // Simplified for now
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

    // Send welcome email and admin notification concurrently (non-blocking - don't fail onboarding if email fails)
    if (emailService.isConfigured()) {
      // Send welcome email to new user
      emailService
        .sendWelcomeEmail(email, name, dominantElement)
        .then((success) => {
          if (success) {
            console.log(`Welcome email sent successfully to ${email}`);
          } else {
            console.error(`Failed to send welcome email to ${email}`);
          }
        })
        .catch((error) => {
          console.error("Error sending welcome email:", error);
        });

      // Send admin notification concurrently (only for new users, not profile updates)
      if (isNewUser) {
        emailService
          .sendAdminNotificationEmail(email, name, dominantElement)
          .then((success) => {
            if (success) {
              console.log(
                `Admin notification sent successfully for new user: ${email}`,
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
      }
    } else {
      console.log(
        "Email service not configured - skipping welcome email and admin notification. Set SMTP environment variables to enable email notifications.",
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
      natalChart: {
        dominantElement: natalChart.dominantElement,
        planetaryPositions: natalChart.planetaryPositions,
        alchemicalProperties: natalChart.alchemicalProperties,
      },
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
