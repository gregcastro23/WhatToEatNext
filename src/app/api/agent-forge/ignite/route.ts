/**
 * POST /api/agent-forge/ignite
 *
 * Core backend orchestrator for the Agent Forge 30-second onboarding.
 *
 * Steps:
 * 1. Authenticates the active NextAuth session.
 * 2. Ingests dob and city, and geocodes coordinates.
 * 3. Invokes the Swisseph temporal chart calculation for elemental balances.
 * 4. Maps elements Fire -> Spirit, Water -> Essence, Earth -> Matter, Air -> Substance.
 * 5. Persists the balances and dominant archetype to the database.
 * 6. Generates a complimentary onboarding recipe routed through the free-tier Groq/Gemini chain.
 *
 * @file src/app/api/agent-forge/ignite/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database";
import { getServiceUrl } from "@/lib/serviceUrls";
import { geocodeLocationSingle } from "@/services/geocodingService";
import { calculateNatalChart } from "@/services/natalChartService";
import { alchemize } from "@/services/RealAlchemizeService";
import { userDatabase } from "@/services/userDatabaseService";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { getDominantElementFromPositions } from "@/utils/astrology/signElement";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";

export const dynamic = "force-dynamic";

/**
 * Bound each recipe-generation fetch so a hung upstream can't consume the whole
 * 60s function budget (vercel.json) and 504 the onboarding. Recipe generation is
 * the last, non-critical step — the alchemical constitution is persisted and
 * onboarding is marked complete *before* this runs — so on timeout/failure we
 * degrade to `cosmicRecipe: null` rather than failing the whole request.
 */
const RECIPE_GEN_TIMEOUT_MS = 20_000;

export async function POST(req: Request) {
  try {
    // 1. Authenticate user from active NextAuth session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "You must be signed in to ignite the Agent Forge." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // 2. Parse request payload
    const body = await req.json().catch(() => null);
    if (!body || !body.dob || !body.city) {
      return NextResponse.json(
        { success: false, error: "bad_request", message: "Date of Birth (dob) and City (city) are required." },
        { status: 400 }
      );
    }
    const { dob, city } = body;

    // 3. Geocode location to coordinates
    const geocoded = await geocodeLocationSingle(city);
    const latitude = geocoded?.latitude ?? 40.7498; // Fallback NY
    const longitude = geocoded?.longitude ?? -73.7976;
    const timezone = geocoded?.estimatedTimezone ?? "UTC";

    // 4. Temporal Analysis (retrieves elemental balance)
    const birthData = {
      dateTime: new Date(dob).toISOString(),
      latitude,
      longitude,
      timezone,
    };
    
    console.log(`[ignite] Calculating natal chart for user ${userId} at ${dob} in ${city}...`);
    const chart = await calculateNatalChart(birthData);

    // 5. Token Translation (Map elements Fire/Water/Earth/Air to reserves 0-100)
    const spirit = Math.round((chart.elementalBalance.Fire || 0) * 100);
    const essence = Math.round((chart.elementalBalance.Water || 0) * 100);
    const matter = Math.round((chart.elementalBalance.Earth || 0) * 100);
    const substance = Math.round((chart.elementalBalance.Air || 0) * 100);

    // 6. Archetype Assignment
    let dominantToken = 'Fire';
    let maxVal = spirit;
    let baseArchetype = 'Solar Forager';

    if (essence > maxVal) {
      maxVal = essence;
      dominantToken = 'Water';
      baseArchetype = 'Lunar Adept';
    }
    if (matter > maxVal) {
      maxVal = matter;
      dominantToken = 'Earth';
      baseArchetype = 'Root Alchemist';
    }
    if (substance > maxVal) {
      maxVal = substance;
      dominantToken = 'Air';
      baseArchetype = 'Wind Whisperer';
    }

    console.log(`[ignite] Dominant token: ${dominantToken}, Archetype: ${baseArchetype}`);

    // 7. Database Persistence (Raw PostgreSQL insert/upsert using executeQuery)
    console.log(`[ignite] Persisting alchemical constitution in DB...`);
    await executeQuery(`
      INSERT INTO alchemical_constitutions (
        user_id,
        spirit_balance,
        essence_balance,
        matter_balance,
        substance_balance,
        base_archetype,
        last_transit_sync
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        spirit_balance = EXCLUDED.spirit_balance,
        essence_balance = EXCLUDED.essence_balance,
        matter_balance = EXCLUDED.matter_balance,
        substance_balance = EXCLUDED.substance_balance,
        base_archetype = EXCLUDED.base_archetype,
        last_transit_sync = NOW(),
        updated_at = NOW()
    `, [userId, spirit, essence, matter, substance, baseArchetype]);

    // Persist birth data, natal chart, and onboarding completion through the
    // canonical profile writer. This dual-writes BOTH the users.profile JSONB
    // AND the normalized user_profiles columns (birth_data, natal_chart,
    // onboarding_completed, onboarding_completed_at). Those columns are the
    // source of truth that rowToUserWithProfile reads back into the session JWT
    // and that the admin onboarding funnel queries — a raw jsonb_set on
    // users.profile alone is invisible to both, which is why completions via
    // this route read 0% in the funnel. updateUserProfile handles the JSONB
    // write internally, so it fully replaces the previous raw UPDATE.
    try {
      await userDatabase.updateUserProfile(
        userId,
        { birthData, natalChart: chart, onboardingComplete: true },
        session.user.email || undefined,
      );
      console.log(`[ignite] Persisted natal profile + marked onboarding complete (user_profiles synced).`);
    } catch (err) {
      // Non-blocking, to preserve the "never 500 a successful ignition" contract
      // (the constitution is already stored above). But log at error level: a
      // failure here means the user onboarded yet will NOT appear in the funnel,
      // so it must surface in logs/alerts rather than fail silently.
      console.error(
        "[ignite] CRITICAL: profile persistence failed — onboarding will not be reflected in user_profiles/funnel:",
        err,
      );
    }

    // 8. Recipe Generation (free-tier Groq/Gemini fallback)
    let cosmicRecipe: any = null;
    let fallbackUsed = false;

    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`;
        
      console.log(`[ignite] Invoking server-side recipe generation at: ${baseUrl}/api/generate-cosmic-recipe`);
      const generateRes = await fetch(`${baseUrl}/api/generate-cosmic-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cookie": req.headers.get("cookie") || "",
        },
        body: JSON.stringify({
          birthData: {
            dateTime: birthData.dateTime,
            latitude: birthData.latitude,
            longitude: birthData.longitude,
          },
          prompt: "A nourishing, restorative onboarding meal aligned with your alchemical constitution.",
        }),
        signal: AbortSignal.timeout(RECIPE_GEN_TIMEOUT_MS),
      });

      if (generateRes.ok) {
        const payload = await generateRes.json();
        cosmicRecipe = payload.recipe || payload;
        console.log(`[ignite] Recipe generated successfully via local endpoint proxy.`);
      } else {
        const text = await generateRes.text();
        console.warn(`[ignite] Local endpoint returned status ${generateRes.status}:`, text);
        fallbackUsed = true;
      }
    } catch (error) {
      console.warn("[ignite] Local endpoint invocation failed, using direct fallback:", error);
      fallbackUsed = true;
    }

    // Direct Fallback if server-side fetch failed. The complimentary recipe is
    // best-effort: the constitution is already persisted and onboarding is
    // marked complete above, so a failure here must NOT 500 the onboarding (the
    // client would bounce the user back to the form despite a successful
    // ignition). On timeout/error we log and leave cosmicRecipe = null; the
    // onboarding reveal renders a graceful "couldn't compile your recipe" state.
    if (fallbackUsed || !cosmicRecipe) {
      try {
        console.log(`[ignite] Initiating direct fallback fetch to planetary agents API...`);
        const agentBaseUrl = getServiceUrl("planetaryAgentsApi");

        const raw = getAccuratePlanetaryPositions(new Date());
        const dominantElement = getDominantElementFromPositions(raw);

        const esms = calculateAlchemicalFromPlanets(
          Object.entries(raw).reduce((acc, [planet, pos]) => {
            acc[planet] = String((pos as any).sign ?? "");
            return acc;
          }, {} as Record<string, string>)
        );

        const alchemizedResult = alchemize(
          Object.entries(raw).reduce((acc, [planet, pos]) => {
            acc[planet] = {
              sign: String((pos as any).sign ?? "").toLowerCase(),
              degree: Number((pos as any).degree) || 0,
              minute: Number((pos as any).minute) || 0,
              isRetrograde: Boolean((pos as any).isRetrograde),
            };
            return acc;
          }, {} as any)
        );

        const agentResponse = await fetch(`${agentBaseUrl}/api/generate-recipe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: "A nourishing, restorative onboarding meal aligned with your alchemical constitution.",
            dominantElement,
            birthData,
            dietPreference: "omnivore",
            alchemicalState: esms,
            thermodynamicProperties: alchemizedResult?.thermodynamicProperties,
            userId,
            tier: "free", // Strictly free-tier Groq/Gemini
          }),
          signal: AbortSignal.timeout(RECIPE_GEN_TIMEOUT_MS),
        });

        if (!agentResponse.ok) {
          throw new Error(`Planetary agents direct fallback failed with status ${agentResponse.status}`);
        }

        const payload = await agentResponse.json();
        cosmicRecipe = payload.recipe || payload;

        // Since we bypassed the endpoint proxy, record the limit directly in PostgreSQL for consistency
        try {
          await executeQuery(`
            INSERT INTO user_daily_limits (user_id, date, recipes_generated)
            VALUES ($1, CURRENT_DATE, 1)
            ON CONFLICT (user_id, date)
            DO UPDATE SET recipes_generated = user_daily_limits.recipes_generated + 1
          `, [userId]);
          console.log(`[ignite] Manually incremented user_daily_limits counter.`);
        } catch (err) {
          console.warn("[ignite] Failed to update user_daily_limits:", err);
        }
      } catch (err) {
        // Non-fatal: onboarding already succeeded — return without a recipe.
        console.warn(
          "[ignite] Complimentary recipe generation failed; completing onboarding without it:",
          err
        );
        cosmicRecipe = null;
      }
    }

    // 9. Return Response Payload
    return NextResponse.json({
      success: true,
      alchemical_constitution: {
        userId,
        spiritBalance: spirit,
        essenceBalance: essence,
        matterBalance: matter,
        substanceBalance: substance,
        baseArchetype,
        lastTransitSync: new Date().toISOString(),
      },
      cosmicRecipe,
    });
  } catch (error: any) {
    console.error("[ignite] Ignition process failed:", error);
    return NextResponse.json(
      { success: false, error: "internal_server_error", message: error.message || "An unexpected error occurred during ignition." },
      { status: 500 }
    );
  }
}
