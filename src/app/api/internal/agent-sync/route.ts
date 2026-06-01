/**
 * POST /api/internal/agent-sync
 *
 * Secure, idempotent, and transactional endpoint to provision and sync
 * Planetary Agents from the sibling PA project into WTEN's transactional tables.
 *
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 */

import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { withTransaction } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_AGENT_DOMAINS = ["@agentic.alchm.kitchen", "@agents.alchm.kitchen"];

interface SyncBody {
  email: string;
  displayName?: string;
  bio?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: {
    name?: string;
    displayName?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  natalChart?: any;
  natalPositions?: any;
  monicaConstant?: string | number;
  dominantElement?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize: Validate X-Sync-Secret matches ALCHM_KITCHEN_SYNC_SECRET
    const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
    const clientSecret = req.headers.get("X-Sync-Secret");

    if (!syncSecret) {
      console.error("[agent-sync] ALCHM_KITCHEN_SYNC_SECRET is not configured in the host environment.");
      return NextResponse.json(
        { success: false, message: "Sync service misconfigured" },
        { status: 500 }
      );
    }

    if (!clientSecret || clientSecret !== syncSecret) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse and Validate Request Body
    const body = (await req.json().catch(() => null)) as SyncBody | null;
    if (!body || !body.email) {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();
    const isDomainAllowed = ALLOWED_AGENT_DOMAINS.some(domain => email.endsWith(domain));
    if (!isDomainAllowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid email domain. Sync is restricted to agentic namespaces: ${ALLOWED_AGENT_DOMAINS.join(", ")}`
        },
        { status: 400 }
      );
    }

    const {
      displayName,
      bio,
      birthDate,
      birthTime,
      birthLocation,
      natalChart,
      natalPositions,
      monicaConstant,
      dominantElement
    } = body;

    // 3. Map & Reconstruct Birth Data
    let birthData: any = null;
    if (birthDate && birthLocation && birthLocation.latitude !== undefined && birthLocation.longitude !== undefined) {
      const timeStr = birthTime || "12:00";
      try {
        const parsedDate = new Date(`${birthDate}T${timeStr}`);
        if (!isNaN(parsedDate.getTime())) {
          birthData = {
            dateTime: parsedDate.toISOString(),
            latitude: Number(birthLocation.latitude),
            longitude: Number(birthLocation.longitude),
            timezone: birthLocation.timezone || undefined,
            name: birthLocation.name || birthLocation.displayName || undefined
          };
        }
      } catch (err) {
        console.warn("[agent-sync] Failed to map birthDate and time:", birthDate, birthTime, err);
      }
    }

    const resolvedName = displayName?.trim() || email.split("@")[0];
    const parsedMonicaConstant = monicaConstant !== undefined && monicaConstant !== null && monicaConstant !== ""
      ? parseFloat(String(monicaConstant))
      : null;

    const userProfilePayload = {
      email,
      isAgent: true,
      name: resolvedName,
      bio: bio || undefined,
      birthData: birthData || undefined,
      natalChart: natalChart || undefined,
    };

    let wtenUserId = "";
    let created = false;

    // 4. Transactional Upsert
    await withTransaction(async (client) => {
      // Check if user already exists
      const existingUserResult = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUserResult.rows.length > 0) {
        // User exists: update user columns
        wtenUserId = existingUserResult.rows[0].id;
        created = false;

        await client.query(
          `UPDATE users
              SET is_agent = true,
                  name = COALESCE($2, name),
                  profile = COALESCE(profile, '{}'::jsonb) || $3::jsonb,
                  updated_at = now()
            WHERE id = $1`,
          [wtenUserId, resolvedName, JSON.stringify(userProfilePayload)]
        );

        // Upsert user profile
        await client.query(
          `INSERT INTO user_profiles (
             user_id, name, bio, birth_data, natal_chart, natal_positions, monica_constant, dominant_element
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id) DO UPDATE SET
             name = COALESCE(EXCLUDED.name, user_profiles.name),
             bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
             birth_data = COALESCE(EXCLUDED.birth_data, user_profiles.birth_data),
             natal_chart = COALESCE(EXCLUDED.natal_chart, user_profiles.natal_chart),
             natal_positions = COALESCE(EXCLUDED.natal_positions, user_profiles.natal_positions),
             monica_constant = COALESCE(EXCLUDED.monica_constant, user_profiles.monica_constant),
             dominant_element = COALESCE(EXCLUDED.dominant_element, user_profiles.dominant_element),
             updated_at = now()`,
          [
            wtenUserId,
            resolvedName,
            bio || null,
            birthData ? JSON.stringify(birthData) : null,
            natalChart ? JSON.stringify(natalChart) : null,
            natalPositions ? JSON.stringify(natalPositions) : null,
            parsedMonicaConstant,
            dominantElement || null
          ]
        );
      } else {
        // User does not exist: create user & profile
        wtenUserId = randomUUID();
        created = true;

        await client.query(
          `INSERT INTO users (
             id, email, password_hash, role, is_active, email_verified, is_agent,
             name, profile, preferences, login_count, created_at, updated_at
           ) VALUES (
             $1, $2, 'AGENT_NO_LOGIN', 'USER'::user_role, true, true, true,
             $3, $4::jsonb, '{}'::jsonb, 0, now(), now()
           )`,
          [
            wtenUserId,
            email,
            resolvedName,
            JSON.stringify(userProfilePayload)
          ]
        );

        await client.query(
          `INSERT INTO user_profiles (
             user_id, name, bio, birth_data, natal_chart, natal_positions, monica_constant, dominant_element
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            wtenUserId,
            resolvedName,
            bio || null,
            birthData ? JSON.stringify(birthData) : null,
            natalChart ? JSON.stringify(natalChart) : null,
            natalPositions ? JSON.stringify(natalPositions) : null,
            parsedMonicaConstant,
            dominantElement || null
          ]
        );

        // Seed wallet balance & tracking streaks for agentic user
        await client.query(
          `INSERT INTO token_balances (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [wtenUserId]
        );
        await client.query(
          `INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [wtenUserId]
        );
      }
    });

    return NextResponse.json({
      ok: true,
      wtenUserId,
      created
    });
  } catch (error) {
    console.error("[POST /api/internal/agent-sync] Transactional sync failed:", error);
    return NextResponse.json(
      { success: false, message: "Internal transactional server error" },
      { status: 500 }
    );
  }
}
