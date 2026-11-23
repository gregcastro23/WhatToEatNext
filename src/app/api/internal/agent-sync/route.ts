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
import { z } from "zod";
import {
  AGENTIC_EMAIL_DOMAIN,
  canonicalizeAgentEmail,
  LEGACY_AGENTS_EMAIL_DOMAIN,
} from "@/lib/agents/canonicalizeAgentEmail";
import { isClassicalElement } from "@/lib/agents/consciousnessAxes";
import { withTransaction } from "@/lib/database";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import { jsonbOrNull } from "@/services/userDatabaseService";
import { agentMonicaWithMethod } from "@/utils/agentMonicaResolver";
import {
  fullChartMonica,
  natalPositionsFromStoredChart,
  normaliseNatalPositions,
} from "@/utils/fullChartMonica";

interface SyncedMonicaValues {
  combined: number | null;
  diurnal: number | null;
  nocturnal: number | null;
  method: "single-body" | "two-body" | "full-chart" | null;
}

function resolveSyncMonica(
  resolved: ReturnType<typeof agentMonicaWithMethod>,
  cleanNatalPositions: unknown,
): SyncedMonicaValues {
  if (resolved !== null) {
    return {
      combined: resolved.monica.combined,
      diurnal: resolved.monica.diurnal,
      nocturnal: resolved.monica.nocturnal,
      method: resolved.method,
    };
  }
  const fullChart = cleanNatalPositions ? fullChartMonica(cleanNatalPositions) : null;
  if (fullChart !== null) {
    return {
      combined: fullChart.combined,
      diurnal: fullChart.diurnal,
      nocturnal: fullChart.nocturnal,
      method: "full-chart",
    };
  }
  return { combined: null, diurnal: null, nocturnal: null, method: null };
}

const NEW_USER_PROFILE_INSERT_SQL = `INSERT INTO user_profiles (
             user_id, name, bio, birth_data, natal_chart, natal_positions,
             monica_constant, monica_single, monica_two_body, monica_full_chart,
             monica_diurnal, monica_nocturnal, monica_method, dominant_element
           ) VALUES ($1, $2, $3, $4, $5, $6,
             CASE WHEN $10 = 'single-body' THEN $7::numeric END,
             CASE WHEN $10 = 'single-body' THEN $7::numeric END,
             CASE WHEN $10 = 'two-body'    THEN $7::numeric END,
             CASE WHEN $10 = 'full-chart'  THEN $7::numeric END,
             $8, $9, $10, $11)`;

const EXISTING_USER_PROFILE_UPSERT_SQL = `${NEW_USER_PROFILE_INSERT_SQL}
           ON CONFLICT (user_id) DO UPDATE SET
             name = COALESCE(EXCLUDED.name, user_profiles.name),
             bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
             birth_data = COALESCE(EXCLUDED.birth_data, user_profiles.birth_data),
             natal_chart = COALESCE(EXCLUDED.natal_chart, user_profiles.natal_chart),
             natal_positions = COALESCE(EXCLUDED.natal_positions, user_profiles.natal_positions),
             monica_constant = CASE
               WHEN EXCLUDED.monica_method = 'full-chart' AND (user_profiles.monica_method IS NULL OR user_profiles.monica_method = 'full-chart') THEN NULL
               WHEN user_profiles.monica_method IS NULL THEN EXCLUDED.monica_constant
               ELSE user_profiles.monica_constant
             END,
             monica_single = CASE
               WHEN EXCLUDED.monica_method = 'full-chart' AND (user_profiles.monica_method IS NULL OR user_profiles.monica_method = 'full-chart') THEN NULL
               WHEN user_profiles.monica_method IS NULL THEN EXCLUDED.monica_single
               ELSE user_profiles.monica_single
             END,
             monica_two_body = CASE
               WHEN EXCLUDED.monica_method = 'full-chart' AND (user_profiles.monica_method IS NULL OR user_profiles.monica_method = 'full-chart') THEN NULL
               WHEN user_profiles.monica_method IS NULL THEN EXCLUDED.monica_two_body
               ELSE user_profiles.monica_two_body
             END,
             monica_full_chart = CASE
               WHEN EXCLUDED.monica_method = 'full-chart' AND (user_profiles.monica_method IS NULL OR user_profiles.monica_method = 'full-chart') THEN EXCLUDED.monica_full_chart
               WHEN user_profiles.monica_method IS NULL THEN EXCLUDED.monica_full_chart
               ELSE user_profiles.monica_full_chart
             END,
             monica_diurnal = CASE
               WHEN EXCLUDED.monica_method = 'full-chart' AND (user_profiles.monica_method IS NULL OR user_profiles.monica_method = 'full-chart') THEN EXCLUDED.monica_diurnal
               WHEN user_profiles.monica_method IS NULL THEN EXCLUDED.monica_diurnal
               ELSE user_profiles.monica_diurnal
             END,
             monica_nocturnal = CASE
               WHEN EXCLUDED.monica_method = 'full-chart' AND (user_profiles.monica_method IS NULL OR user_profiles.monica_method = 'full-chart') THEN EXCLUDED.monica_nocturnal
               WHEN user_profiles.monica_method IS NULL THEN EXCLUDED.monica_nocturnal
               ELSE user_profiles.monica_nocturnal
             END,
             monica_method = CASE
               WHEN EXCLUDED.monica_method = 'full-chart' AND (user_profiles.monica_method IS NULL OR user_profiles.monica_method = 'full-chart') THEN EXCLUDED.monica_method
               WHEN user_profiles.monica_method IS NULL THEN EXCLUDED.monica_method
               ELSE user_profiles.monica_method
             END,
             dominant_element = COALESCE(EXCLUDED.dominant_element, user_profiles.dominant_element),
             updated_at = now()`;

/** `{}` and `[]` mean "absent" here, exactly as jsonbOrNull treats them. */
const nonEmpty = <T>(v: T): T | undefined =>
  jsonbOrNull(v) === null ? undefined : v;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_AGENT_DOMAINS = [
  AGENTIC_EMAIL_DOMAIN,
  LEGACY_AGENTS_EMAIL_DOMAIN,
];

const syncBodySchema = z.object({
  email: z.string().min(1),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthLocation: z
    .object({
      name: z.string().optional(),
      displayName: z.string().optional(),
      latitude: z.number().finite().optional(),
      longitude: z.number().finite().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
  natalChart: z.unknown().optional(),
  natalPositions: z.unknown().optional(),
  // Accepted for backward compatibility, but never trusted for persistence.
  monicaConstant: z.union([z.string(), z.number()]).optional(),
  dominantElement: z.string().optional(),
});

interface SyncedBirthData {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  name?: string;
}

export async function POST(req: NextRequest | Request) {
  try {
    // 1. Authorize: Validate X-Sync-Secret matches ALCHM_KITCHEN_SYNC_SECRET
    const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
    const clientSecret = req.headers.get("X-Sync-Secret");

    if (!syncSecret) {
      _logger.error(
        "[agent-sync] ALCHM_KITCHEN_SYNC_SECRET is not configured in the host environment",
      );
      return NextResponse.json(
        { success: false, message: "Sync service misconfigured" },
        { status: 500 },
      );
    }

    if (!safeEqual(clientSecret, syncSecret)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 2. Parse and Validate Request Body
    const rawBody: unknown = await req.json().catch(() => null);
    const parsedBody = syncBodySchema.safeParse(rawBody);
    if (!parsedBody.success) {
      const emailIsInvalid = parsedBody.error.issues.some(
        (issue) => issue.path[0] === "email",
      );
      return NextResponse.json(
        {
          success: false,
          message: emailIsInvalid
            ? "email is required"
            : "Invalid sync payload",
        },
        { status: 400 },
      );
    }
    const body = parsedBody.data;

    const email = canonicalizeAgentEmail(body.email);
    const isDomainAllowed = email.endsWith(AGENTIC_EMAIL_DOMAIN);
    if (!isDomainAllowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid email domain. Sync is restricted to agentic namespaces: ${ALLOWED_AGENT_DOMAINS.join(", ")}`,
        },
        { status: 400 },
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
      dominantElement,
    } = body;

    const resolvedDominantElement = isClassicalElement(dominantElement)
      ? dominantElement
      : null;
    if (dominantElement !== undefined && resolvedDominantElement === null) {
      _logger.warn(
        `[agent-sync] Ignoring non-classical dominantElement "${dominantElement}" for ${email}`,
      );
    }

    // 3. Map & Reconstruct Birth Data
    let birthData: SyncedBirthData | null = null;
    if (
      birthDate &&
      birthLocation?.latitude !== undefined &&
      birthLocation.longitude !== undefined
    ) {
      const timeStr = birthTime ?? "12:00";
      try {
        const parsedDate = new Date(`${birthDate}T${timeStr}`);
        if (!Number.isNaN(parsedDate.getTime())) {
          const locName = birthLocation.name ?? birthLocation.displayName;
          birthData = {
            dateTime: parsedDate.toISOString(),
            latitude: Number(birthLocation.latitude),
            longitude: Number(birthLocation.longitude),
            ...(birthLocation.timezone ? { timezone: birthLocation.timezone } : {}),
            ...(locName ? { name: locName } : {}),
          };
        }
      } catch (err) {
        _logger.error("[agent-sync] Failed to map birthDate and time", {
          birthDate,
          birthTime,
          error: err,
        });
      }
    }

    const resolvedName = displayName?.trim() ?? email.split("@")[0] ?? email;
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
    const resolved = agentMonicaWithMethod(resolvedName, (error) =>
      _logger.error(
        `[agent-sync] phase agent with an unclassifiable phase: ${resolvedName} —` +
          " left for the nightly backfill to surface",
        error,
      ),
    );
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
      _logger.error(
        `[agent-sync] ${email} sent a chart with no usable positions —` +
          ` derived ${derivedPositions.length} bodies from the chart itself.`,
      );
    }

    const syncedMonica = resolveSyncMonica(resolved, cleanNatalPositions);

    const userProfilePayload = {
      email,
      isAgent: true,
      name: resolvedName,
      bio: bio ?? undefined,
      // Same emptiness rule as the columns below: `x || undefined` keeps a
      // truthy '{}', which would merge an empty chart into users.profile.
      birthData: nonEmpty(birthData),
      natalChart: nonEmpty(natalChart),
    };

    const profileParams = [
      "",
      resolvedName,
      bio ?? null,
      // jsonbOrNull, not `x ? stringify(x) : null` — an EMPTY object is
      // truthy, so the old guard wrote '{}' for a caller that has no chart.
      // Where this statement COALESCEs onto the stored value, a non-null
      // '{}' WINS that COALESCE and overwrites a real stored chart with an
      // empty one. NULL correctly leaves the stored value alone.
      jsonbOrNull(birthData),
      jsonbOrNull(natalChart),
      jsonbOrNull(cleanNatalPositions),
      syncedMonica.combined,
      syncedMonica.diurnal,
      syncedMonica.nocturnal,
      syncedMonica.method,
      resolvedDominantElement,
    ];

    let wtenUserId = "";
    let created = false;

    // 4. Transactional Upsert
    await withTransaction(async (client) => {
      // Check if user already exists
      const existingUserResult = await client.query<{ id: string }>(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );

      if (existingUserResult.rows.length > 0) {
        // User exists: update user columns
        const [existingUserRow] = existingUserResult.rows;
        if (!existingUserRow) {
          throw new Error("agent-sync: user lookup returned no row");
        }
        wtenUserId = existingUserRow.id;
        created = false;

        await client.query(
          `UPDATE users
              SET is_agent = true,
                  name = COALESCE($2, name),
                  profile = COALESCE(profile, '{}'::jsonb) || $3::jsonb,
                  updated_at = now()
            WHERE id = $1`,
          [wtenUserId, resolvedName, JSON.stringify(userProfilePayload)],
        );

        // Upsert user profile (recomputes full-chart monica if natal_positions refreshed)
        await client.query(EXISTING_USER_PROFILE_UPSERT_SQL, [
          wtenUserId,
          ...profileParams.slice(1),
        ]);
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
          [wtenUserId, email, resolvedName, JSON.stringify(userProfilePayload)],
        );

        await client.query(NEW_USER_PROFILE_INSERT_SQL, [
          wtenUserId,
          ...profileParams.slice(1),
        ]);

        // Seed wallet balance & tracking streaks for agentic user
        await client.query(
          `INSERT INTO token_balances (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [wtenUserId],
        );
        await client.query(
          `INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [wtenUserId],
        );
      }
    });

    return NextResponse.json({
      ok: true,
      wtenUserId,
      created,
    });
  } catch (error) {
    _logger.error(
      "[POST /api/internal/agent-sync] Transactional sync failed",
      error,
    );
    return NextResponse.json(
      { success: false, message: "Internal transactional server error" },
      { status: 500 },
    );
  }
}
