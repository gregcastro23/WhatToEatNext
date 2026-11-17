/**
 * Onboarding API Route
 * POST /api/onboarding — Save birth data, compute natal chart, mark onboarding complete
 *
 * Accepts: { email?, name?, birthData: BirthData }
 * Returns: { success, profile, natalChart }
 *
 * @file src/app/api/onboarding/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { natalBodiesFromRawPositions, unusableChartMessage } from "@/lib/astrology/natalBodies";
import { auth } from "@/lib/auth/auth";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { OnboardingRequestSchema, SkipOnboardingRequestSchema } from "@/lib/validation/apiSchemas";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import { userDatabase } from "@/services/userDatabaseService";
import type { Planet, ZodiacSignType, Modality } from "@/types/celestial";
import type { NatalChart } from "@/types/natalChart";
import { enrichBirthDataWithInstant } from "@/utils/astrology/birthTimezone";
import {
  validatePlanetaryPositions,
  formatValidationResult,
} from "@/utils/astrology/planetaryValidation";
import {
  aggregateEnhancedZodiacElementals,
  calculateAlchemicalFromPlanets,
  getDominantElement,
  isSectDiurnalForBirth,
} from "@/utils/planetaryAlchemyMapping";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_MODALITY: Record<ZodiacSignType, Modality> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed", leo: "Fixed", scorpio: "Fixed", aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable", sagittarius: "Mutable", pisces: "Mutable",
};

function calcDominantModality(positions: Record<Planet, ZodiacSignType>): Modality {
  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  Object.values(positions).forEach((sign) => {
    const m = SIGN_TO_MODALITY[sign];
    const modCount = m ? counts[m] : undefined;
    if (m && modCount !== undefined) counts[m] = modCount + 1;
  });
  return (Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Cardinal") as Modality;
}

export const POST = withObservability(
  { routeName: "/api/onboarding" },
  async (request: NextRequest) => {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const parsedBody = OnboardingRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, birthData } = parsedBody.data;

    // Resolve user from session or fallback
    const user = await getDatabaseUserFromRequest(request);

    if (!user) {
      // Distinguish "not logged in" (401) from "logged in but DB unavailable" (503).
      // getDatabaseUserFromRequest already attempted JIT creation; if it still returned
      // null, check whether a valid NextAuth session exists so the client knows whether
      // to prompt re-login or to retry after a moment.
      let hasValidSession = false;
      try {
        const session = await auth();
        hasValidSession = !!(session?.user?.email);
      } catch {
        // auth() failed — treat as unauthenticated
      }

      if (hasValidSession) {
        _logger.warn("[POST /api/onboarding] Session valid but DB lookup failed — returning 503 for client retry");
        return NextResponse.json(
          { success: false, message: "Service temporarily unavailable. Please try again in a moment." },
          { status: 503 },
        );
      }

      _logger.warn("[POST /api/onboarding] User not found or not authenticated");
      return NextResponse.json(
        { success: false, message: "User not found. Please sign in first." },
        { status: 401 },
      );
    }

    const userId = user.id;

    // Compute natal chart from birth data using the resolved birthplace instant
    const enrichedBirthData = enrichBirthDataWithInstant({
      dateTime: birthData.dateTime,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      ...(birthData.timezone ? { timezone: birthData.timezone } : {}),
      ...(birthData.location ? { location: birthData.location } : {}),
    });
    const birthDate = new Date(enrichedBirthData.dateTime);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid birthData.dateTime — must be a valid ISO date string" },
        { status: 400 },
      );
    }
    const ephemerisDate = new Date(
      enrichedBirthData.utcInstant ?? enrichedBirthData.dateTime,
    );

    // 🐛 DIAGNOSTIC: Log birth date parsing
    const now = new Date();
    _logger.info("[POST /api/onboarding] 🔮 Birth Data Received:", {
      birthDataDateTime: enrichedBirthData.dateTime,
      utcInstant: enrichedBirthData.utcInstant ?? null,
      timezone: enrichedBirthData.timezone ?? null,
      timezoneBasis: enrichedBirthData.timezoneBasis ?? null,
      parsedBirthDate: birthDate.toISOString(),
      currentDate: now.toISOString(),
      isToday: birthDate.toDateString() === now.toDateString(),
      yearDifference: now.getFullYear() - birthDate.getFullYear(),
    });

    let rawPositions;
    try {
      rawPositions = await getPlanetaryPositionsForDateTime(ephemerisDate, {
        latitude: enrichedBirthData.latitude,
        longitude: enrichedBirthData.longitude,
      });

      // 🐛 DIAGNOSTIC: Log calculated positions
      _logger.info("[POST /api/onboarding] 🌟 Calculated Natal Positions:", {
        Sun: rawPositions.Sun?.sign,
        Moon: rawPositions.Moon?.sign,
        Mercury: rawPositions.Mercury?.sign,
        Ascendant: rawPositions.Ascendant?.sign,
      });

      // 🛡️ VALIDATE: Ensure planetary positions are astronomically valid
      const validation = validatePlanetaryPositions(rawPositions, ephemerisDate);
      const validationLog = formatValidationResult(validation);

      _logger.info(`[POST /api/onboarding] 🛡️ Position Validation Results:\n${  validationLog}`);

      if (!validation.valid) {
        // Validation errors detected, but proceed to avoid blocking onboarding.
        _logger.warn("[POST /api/onboarding] ⚠️ Position validation contained errors, but proceeding:", {
          errors: validation.errors,
          birthDate: ephemerisDate.toISOString(),
          currentDate: now.toISOString(),
        });
      }

      // Log warnings but proceed
      if (validation.warnings && validation.warnings.length > 0) {
        _logger.warn("[POST /api/onboarding] ⚠️ Position validation warnings:", validation.warnings);
      }
    } catch (error) {
      _logger.error("[POST /api/onboarding] Planetary calculation failed", error);
      return NextResponse.json(
        { success: false, message: "Planetary calculation service unavailable. Please try again later." },
        { status: 503 },
      );
    }

    // One shared builder, and it REFUSES rather than filling gaps in. This block
    // used to invent an "aries" ascendant, a 0 longitude for any body the API did
    // not price, and `undefined` signs inside a Record that forbids them — then
    // PERSISTED the result. See src/lib/astrology/natalBodies.ts.
    const bodies = natalBodiesFromRawPositions(rawPositions);
    if (!bodies.ok) {
      _logger.error(
        "[POST /api/onboarding] unusable chart",
        { unusable: bodies.unusable },
      );
      return NextResponse.json(
        { success: false, message: unusableChartMessage(bodies.unusable) },
        { status: 503 },
      );
    }
    if (bodies.derivedLongitudes.length > 0) {
      // Not an error: the placement is still consistent with its sign. Logged
      // because a chart built at sign resolution is a DERIVED value, not a
      // measured one, and that distinction should be visible.
      _logger.warn(
        "[POST /api/onboarding] longitude derived from sign+degree",
        { bodies: bodies.derivedLongitudes },
      );
    }
    const { positions, planets } = bodies;
    const diurnal = isSectDiurnalForBirth(enrichedBirthData);
    const elementalBalance = aggregateEnhancedZodiacElementals(positions, diurnal);
    const dominantElement = getDominantElement(elementalBalance);

    const natalChart: NatalChart = {
      birthData: enrichedBirthData,
      planets,
      ascendant: positions.Ascendant,
      planetaryPositions: positions,
      dominantElement,
      dominantModality: calcDominantModality(positions),
      elementalBalance,
      // The canonical engine consumes the longitude-bearing chart directly, so
      // dignity and aspects cannot drift from the stored natal calculation.
      alchemicalProperties: calculateAlchemicalFromPlanets(
        rawPositions,
        diurnal,
      ),
      calculatedAt: new Date().toISOString(),
    };

    // Persist birth data, natal chart, and onboarding status
    const profileUpdates = {
      birthData: natalChart.birthData,
      natalChart,
      onboardingComplete: true,  // stored as onboarding_completed in DB
      ...(name ? { name } : {}),
    };

    const updatedUser = await userDatabase.updateUserProfile(userId, profileUpdates, user.email);
    await reportQuestEventBestEffort(userId, "complete_onboarding");

    // Send admin notification about completed onboarding
    // This provides the admin team with the user's dominant element
    try {
      const emailService = (await import("@/services/emailService")).default;
      emailService.ensureInitialized();
      if (emailService.isConfigured()) {
        const userName = name ?? user.profile.name ?? user.email;
        void emailService.sendAdminNotificationEmail(
          user.email,
          userName,
          natalChart.dominantElement,
        );
      }
    } catch (err) {
      _logger.error("[POST /api/onboarding] Failed to send admin notification:", err);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser?.id ?? userId,
        email: updatedUser?.email ?? user.email,
        name: updatedUser?.profile?.name ?? name ?? "",
      },
      profile: updatedUser?.profile ?? null,
      natalChart,
    });

    // Set server-side cookie so the middleware authorized() callback can skip
    // the /onboarding redirect on the very next navigation (before the JWT is
    // refreshed). The client also sets this cookie client-side as a fallback.
    response.cookies.set("onboarding_completed", "1", {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });

    return response;
  } catch (error) {
    _logger.error("[POST /api/onboarding] Onboarding error", error);
    return NextResponse.json(
      { success: false, message: "Onboarding failed. Please try again." },
      { status: 500 },
    );
  }
});

/** PATCH /api/onboarding — Skip natal data, mark onboarding complete */
export const PATCH = withObservability(
  { routeName: "/api/onboarding" },
  async (request: NextRequest) => {
    try {
      let rawBody: unknown;
      try {
        rawBody = await request.json();
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid JSON in request body" },
          { status: 400 },
        );
      }

      const parseResult = SkipOnboardingRequestSchema.safeParse(rawBody);
      if (!parseResult.success) {
        return NextResponse.json(
          { success: false, message: "Only skipNatal=true is accepted by this endpoint" },
          { status: 400 },
        );
      }

      const user = await getDatabaseUserFromRequest(request);

      if (!user) {
        let hasValidSession = false;
        try {
          const session = await auth();
          hasValidSession = !!(session?.user?.email);
        } catch {
          // auth() failed — treat as unauthenticated
        }

        if (hasValidSession) {
          return NextResponse.json(
            { success: false, message: "Service temporarily unavailable. Please try again in a moment." },
            { status: 503 },
          );
        }

        return NextResponse.json(
          { success: false, message: "User not found. Please sign in first." },
          { status: 401 },
        );
      }

      await userDatabase.updateUserProfile(user.id, { onboardingComplete: true }, user.email);
      await reportQuestEventBestEffort(user.id, "complete_onboarding");

      const response = NextResponse.json({ success: true });

      response.cookies.set("onboarding_completed", "1", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
      });

      return response;
    } catch (error) {
      _logger.error("[PATCH /api/onboarding] Skip onboarding error", error);
      return NextResponse.json(
        { success: false, message: "Failed to skip onboarding. Please try again." },
        { status: 500 },
      );
    }
  },
);

/** GET /api/onboarding — Check onboarding status */
export const GET = withObservability(
  { routeName: "/api/onboarding" },
  async (request: NextRequest) => {
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
        onboardingComplete: user.profile.onboardingComplete ?? false,
        hasNatalChart: !!user.profile.natalChart,
        hasBirthData: !!user.profile.birthData,
      });
    } catch (error) {
      _logger.error("[GET /api/onboarding] Failed to check status", error);
      return NextResponse.json(
        { success: false, message: "Failed to check onboarding status" },
        { status: 500 },
      );
    }
  },
);
