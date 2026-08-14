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
import { jsonbOrNull } from "@/services/userDatabaseService";
import { agentMonicaWithMethod } from "@/utils/agentMonicaResolver";
import {
  natalPositionsFromStoredChart,
  normaliseNatalPositions,
} from "@/utils/fullChartMonica";

/** `{}` and `[]` mean "absent" here, exactly as jsonbOrNull treats them. */
const nonEmpty = <T,>(v: T): T | undefined => (jsonbOrNull(v) === null ? undefined : v);

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
    if (!body?.email) {
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
    if (birthDate && birthLocation?.latitude !== undefined && birthLocation.longitude !== undefined) {
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
    // §18j — WTEN computes its own monica from the agent's own name, the same
    // way sync-debit and agents/unified do. This endpoint used to trust
    // `monicaConstant` straight from the sync payload (PA's own legacy,
    // unsigned, disconnected formula) via a bare parseFloat with no
    // validation — a fourth write path the original three-site §18e fix
    // missed. A name that matches no construction yields null, which the
    // COALESCE below reads as "leave the stored value alone."
    //
    // `agentMonicaWithMethod` covers BOTH constructions. It previously called
    // `agentMonicaFromName`, which is single-body only, so every Moon-phase agent
    // synced through here was written unclassified — the same gap measured on
    // sync-debit, latent here but identical in kind. It is also writer-safe: the
    // two-body resolver THROWS for an unclassifiable phase, which must not turn a
    // sync into a 500.
    void monicaConstant; // intentionally ignored — see comment above
    const resolved = agentMonicaWithMethod(resolvedName, (error) =>
      console.warn(
        `[agent-sync] phase agent with an unclassifiable phase: ${resolvedName} —` +
          ` left for the nightly backfill to surface. ${String(error)}`,
      ),
    );
    const resolvedMonica = resolved?.monica ?? null;

    // The upstream producer emits `longitude: data?.longitude ?? data?.degrees ?? 0`
    // over objects carrying neither key, so every body arrives with a fabricated
    // `longitude: 0`. This is the boundary that upstream crosses, so it is the
    // boundary that strips it — see normaliseNatalPositions.
    const suppliedPositions = normaliseNatalPositions(natalPositions);

    // A chart-bearing agent is the same kind of user as a chart-bearing HUMAN,
    // so it derives positions the same way. #751 fixed exactly this asymmetry on
    // the human side: `createUser` stored `natal_chart` and nothing else, so
    // `natal_positions` — the column `parseNatalPositions` actually reads — was
    // empty for 8 of 8 chart-bearing humans and every full-chart monica silently
    // computed over nothing.
    //
    // This route never had that bug, because its caller sends positions
    // alongside the chart. But it had no defence against a caller that stops:
    // it stored whatever arrived, and a chart with no positions would have
    // produced the same silent emptiness here. `natalPositionsFromStoredChart`
    // is the SAME converter the human writer uses, so a chart-bearing agent and
    // a chart-bearing human now cannot disagree about what their chart means.
    //
    // `[MEASURED 2026-08-13]` against production this repairs no existing row —
    // of 6,311 agents with a profile, 71 hold a real chart and all 71 already
    // hold real positions, and the other 6,240 hold neither. It is a guard, not
    // a backfill. Derivation is the FALLBACK, never an override: a caller that
    // sends positions is the authority on its own chart.
    //
    // `normaliseNatalPositions` returns `unknown` — it passes a non-array
    // through untouched — so "usable" is tested as "a non-empty array" rather
    // than by truthiness. `[]` and a stray object are both absent here, which is
    // the same emptiness rule `jsonbOrNull` applies one line down.
    const suppliedIsUsable =
      Array.isArray(suppliedPositions) && suppliedPositions.length > 0;
    const derivedPositions = suppliedIsUsable
      ? null
      : natalPositionsFromStoredChart(natalChart);
    const cleanNatalPositions = suppliedIsUsable
      ? suppliedPositions
      : derivedPositions;
    if (derivedPositions?.length) {
      console.warn(
        `[agent-sync] ${email} sent a chart with no usable positions —` +
          ` derived ${derivedPositions.length} bodies from the chart itself.`,
      );
    }
    const parsedMonicaConstant = resolvedMonica?.combined ?? null;

    const userProfilePayload = {
      email,
      isAgent: true,
      name: resolvedName,
      bio: bio || undefined,
      // Same emptiness rule as the columns below: `x || undefined` keeps a
      // truthy '{}', which would merge an empty chart into users.profile.
      birthData: nonEmpty(birthData),
      natalChart: nonEmpty(natalChart),
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
             user_id, name, bio, birth_data, natal_chart, natal_positions,
             monica_constant, monica_single, monica_two_body,
             monica_diurnal, monica_nocturnal, monica_method, dominant_element
           ) VALUES ($1, $2, $3, $4, $5, $6,
             CASE WHEN $10 = 'single-body' THEN $7::numeric END,
             CASE WHEN $10 = 'single-body' THEN $7::numeric END,
             CASE WHEN $10 = 'two-body'    THEN $7::numeric END,
             $8, $9, $10, $11)
           ON CONFLICT (user_id) DO UPDATE SET
             name = COALESCE(EXCLUDED.name, user_profiles.name),
             bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
             birth_data = COALESCE(EXCLUDED.birth_data, user_profiles.birth_data),
             natal_chart = COALESCE(EXCLUDED.natal_chart, user_profiles.natal_chart),
             natal_positions = COALESCE(EXCLUDED.natal_positions, user_profiles.natal_positions),
             monica_constant = COALESCE(user_profiles.monica_constant, EXCLUDED.monica_constant),
             monica_single = COALESCE(user_profiles.monica_single, EXCLUDED.monica_single),
             monica_two_body = COALESCE(user_profiles.monica_two_body, EXCLUDED.monica_two_body),
             monica_diurnal = COALESCE(EXCLUDED.monica_diurnal, user_profiles.monica_diurnal),
             monica_nocturnal = COALESCE(EXCLUDED.monica_nocturnal, user_profiles.monica_nocturnal),
             monica_method = COALESCE(user_profiles.monica_method, EXCLUDED.monica_method),
             dominant_element = COALESCE(EXCLUDED.dominant_element, user_profiles.dominant_element),
             updated_at = now()`,
          [
            wtenUserId,
            resolvedName,
            bio || null,
            // jsonbOrNull, not `x ? stringify(x) : null` — an EMPTY object is
            // truthy, so the old guard wrote '{}' for a caller that has no chart.
            // Where this statement COALESCEs onto the stored value, a non-null
            // '{}' WINS that COALESCE and overwrites a real stored chart with an
            // empty one. NULL correctly leaves the stored value alone.
            jsonbOrNull(birthData),
            jsonbOrNull(natalChart),
            jsonbOrNull(cleanNatalPositions),
            parsedMonicaConstant,
            resolvedMonica?.diurnal ?? null,
            resolvedMonica?.nocturnal ?? null,
            resolved?.method ?? null,
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
             user_id, name, bio, birth_data, natal_chart, natal_positions,
             monica_constant, monica_single, monica_two_body,
             monica_diurnal, monica_nocturnal, monica_method, dominant_element
           ) VALUES ($1, $2, $3, $4, $5, $6,
             CASE WHEN $10 = 'single-body' THEN $7::numeric END,
             CASE WHEN $10 = 'single-body' THEN $7::numeric END,
             CASE WHEN $10 = 'two-body'    THEN $7::numeric END,
             $8, $9, $10, $11)`,
          [
            wtenUserId,
            resolvedName,
            bio || null,
            // jsonbOrNull, not `x ? stringify(x) : null` — an EMPTY object is
            // truthy, so the old guard wrote '{}' for a caller that has no chart.
            // Where this statement COALESCEs onto the stored value, a non-null
            // '{}' WINS that COALESCE and overwrites a real stored chart with an
            // empty one. NULL correctly leaves the stored value alone.
            jsonbOrNull(birthData),
            jsonbOrNull(natalChart),
            jsonbOrNull(cleanNatalPositions),
            parsedMonicaConstant,
            resolvedMonica?.diurnal ?? null,
            resolvedMonica?.nocturnal ?? null,
            resolved?.method ?? null,
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
