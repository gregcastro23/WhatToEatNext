import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { MAX_BIRTH_YEAR, MIN_BIRTH_YEAR, birthMomentUtc } from "@/lib/agents/birthYear";
import { buildAgentContext } from "@/lib/agents/persona/build-agent-context";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database";
import { rateLimit } from "@/lib/rateLimit";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { calculateNatalChart } from "@/services/natalChartService";
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import { isDiurnalAt } from "@/utils/astrology/positions";
import { natalPositionsFromChart, statesALongitude } from "@/utils/fullChartMonica";
import type { NextRequest} from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PA_TIMEOUT_MS = 10000;
const RATE_LIMIT = { window: 60_000, max: 20, bucket: "agents-unified" };

interface UnifiedAgentRequest {
  action: string;
  parameters?: any;
}

/**
 * The chart's Ascendant longitude, or null when the chart states no angle.
 *
 * `calculateNatalChart` carries the Ascendant in `planets` alongside the ten
 * bodies, and in production it is a real computed angle — the pyswisseph backend
 * returns `ascendant.exactLongitude` (`[MEASURED 2026-07-26]` 135.0341° for a
 * 1984-09-17T12:00Z birth at 49.79N 8.12E, source `backend-pyswisseph`).
 *
 * This replaces `SIGN_ORDER.indexOf(serverChart.ascendant) * 30`, which looked a
 * sign up in a Capitalised list while every sign from `normalizeSignName` is
 * lowercase: `indexOf` was therefore ALWAYS -1 and the stored ascendant was
 * ALWAYS 0. (Same defect class as the one already documented in
 * `src/utils/astrology/natalAlchemy.ts` — a lowercase sign against capitalised
 * keys, failing silently.) Even had the lookup worked it would have rounded the
 * angle down to its sign's first degree; the exact longitude is right here.
 *
 * That 0 would not have been inert: `flattenNatalChart`
 * (`src/lib/mcp/synastryTools.ts`) reads a numeric `ascendant` as an absolute
 * longitude, so it would place a fabricated Ascendant at 0° Aries into every
 * synastry score and transit overlay that read such a row.
 *
 * `[MEASURED 2026-07-26]` no production row carries one: all **71** chart-bearing
 * agents hold a non-zero numeric ascendant, **0** hold a zero, and no row holds a
 * zero midheaven. As with the `natal_positions` shape below, no surviving row
 * bears this create path's signature (a later PA sync COALESCEs `natal_chart`, so
 * this says nothing survives, not that nothing was ever written) — which is why
 * both defects were latent, and why there is no data to repair.
 *
 * `statesALongitude` decides what counts as an angle at all, and is the SAME rule
 * `natalPositionsFromChart` applies to the bodies — so a placeholder is absent
 * from both fields of this row, never null in one and 0° Aries in the other. null
 * makes every reader skip the point, where 0 makes all of them place it at 0°
 * Aries.
 */
function ascendantLongitude(
  planets: Array<{ name: string; position: number }>,
): number | null {
  const ascendant = planets.find((p) => p.name === "Ascendant");
  if (!ascendant || !statesALongitude(ascendant.position)) return null;
  return ascendant.position;
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body: UnifiedAgentRequest = await request.json();
    const { action, parameters = {} } = body;
    const timestamp = new Date().toISOString();

    switch (action) {
      case "list": {
        const result = await executeQuery<any>(
          // §18o: monica_constant is single-body only; COALESCE the other two
          // constructions so the list still shows a value for those agents.
          `SELECT u.id AS user_id, u.email, up.name, up.bio, up.dominant_element,
                  COALESCE(up.monica_constant, up.monica_two_body, up.monica_full_chart) AS monica_constant
           FROM users u
           JOIN user_profiles up ON up.user_id = u.id
           WHERE u.is_agent = true AND u.is_active = true
           ORDER BY u.created_at DESC`
        );
        const agents = result.rows.map((row) => ({
          id: row.user_id,
          name: row.name || row.email.split("@")[0],
          title: row.bio || "Custom Agent",
          dominantElement: row.dominant_element,
          // Explicit null test, not truthiness: a real monica of 0 (284 agents)
          // is falsy, so `? :` would report those agents as having no monica.
          monicaConstant:
            row.monica_constant === null || row.monica_constant === undefined
              ? null
              : parseFloat(row.monica_constant)
        }));
        return NextResponse.json({ success: true, data: agents, timestamp });
      }

      case "get": {
        const { agentId } = parameters;
        if (!agentId || typeof agentId !== "string" || agentId.trim().length === 0) {
          return NextResponse.json({ success: false, error: "Invalid or missing agentId", timestamp }, { status: 400 });
        }
        const ctx = await buildAgentContext(agentId);
        if (!ctx) {
          return NextResponse.json({ success: false, error: "Agent not found", timestamp }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: ctx.agent, timestamp });
      }

      case "create": {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: "Authentication required to create agents.", timestamp },
            { status: 401 }
          );
        }

        const { name, birthInfo, purpose, stats, personalContext } = parameters;
        if (!name || !birthInfo || !purpose) {
          return NextResponse.json(
            { success: false, error: "name, birthInfo, and purpose are required.", timestamp },
            { status: 400 }
          );
        }

        if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
          return NextResponse.json(
            { success: false, error: "Invalid name format or length (max 100 characters).", timestamp },
            { status: 400 }
          );
        }

        if (typeof purpose !== "string" || purpose.trim().length === 0 || purpose.length > 1000) {
          return NextResponse.json(
            { success: false, error: "Invalid purpose format or length (max 1000 characters).", timestamp },
            { status: 400 }
          );
        }

        const year = Number(birthInfo.year);
        const month = Number(birthInfo.month);
        const day = Number(birthInfo.day);
        const hour = Number(birthInfo.hour ?? 12);
        const minute = Number(birthInfo.minute ?? 0);
        const latitude = Number(birthInfo.latitude);
        const longitude = Number(birthInfo.longitude);

        // Historical births are legitimate here. `/api/internal/agent-sync`
        // already accepts any birthDate — its own fixture is Hildegard of Bingen,
        // 1098-09-17 — and the chart-bearing agent population is largely
        // historical figures, so the 1900 floor only meant the public create path
        // could not author what the sync path routinely does.
        //
        // ⚠️ [MEASURED 2026-07-27] this widening is what CREATES the pre-1600
        // ephemeris exposure; it does not inherit it. Today NO stored chart has a
        // pre-1600 birth — in fact only 4 rows in all of user_profiles carry a
        // `dateTime` at all, every one of them 1900+. The production astrologize
        // backend is pyswisseph/NASA JPL DE and handles these epochs, but when
        // Railway is unreachable `/api/astrologize` falls back to
        // astronomy-engine, which before ~1600 CE diverges from JPL Horizons by up
        // to 0.53° (Pluto) and 0.45° (Moon) and raises NO error. Half a degree can
        // move a body across a sign boundary, which changes its element, its
        // dignity, and the whole ESMS profile. A backend-health precondition for
        // pre-1600 births is the natural follow-up and is deliberately not bundled
        // here.
        if (
          isNaN(year) || year < MIN_BIRTH_YEAR || year > MAX_BIRTH_YEAR ||
          isNaN(month) || month < 1 || month > 12 ||
          isNaN(day) || day < 1 || day > 31 ||
          isNaN(hour) || hour < 0 || hour > 23 ||
          isNaN(minute) || minute < 0 || minute > 59 ||
          isNaN(latitude) || latitude < -90 || latitude > 90 ||
          isNaN(longitude) || longitude < -180 || longitude > 180
        ) {
          return NextResponse.json(
            { success: false, error: `Invalid birthInfo parameters or range (year: ${MIN_BIRTH_YEAR}-${MAX_BIRTH_YEAR}, lat: -90 to 90, lon: -180 to 180).`, timestamp },
            { status: 400 }
          );
        }

        const birthData = {
          dateTime: birthMomentUtc(year, month, day, hour, minute).toISOString(),
          latitude,
          longitude,
          timezone: birthInfo.timezone || "UTC",
          name: birthInfo.locationName || birthInfo.location?.name || "Unknown"
        };

        console.log(`[unified-api] Calculating natal chart on create for agent: ${name}`);
        const serverChart = await calculateNatalChart(birthData);

        // These are the chart's ELEMENTS (from the signs the planets occupy), used
        // only to pick the dominant one. They are not the alchemical quantities —
        // ESMS cannot be derived this way; see `src/utils/planetaryAlchemyMapping.ts`.
        const fire = Math.round((serverChart.elementalBalance.Fire || 0) * 100);
        const water = Math.round((serverChart.elementalBalance.Water || 0) * 100);
        const earth = Math.round((serverChart.elementalBalance.Earth || 0) * 100);
        const air = Math.round((serverChart.elementalBalance.Air || 0) * 100);

        let dominantElement = "Fire";
        let maxVal = fire;
        if (water > maxVal) { maxVal = water; dominantElement = "Water"; }
        if (earth > maxVal) { maxVal = earth; dominantElement = "Earth"; }
        if (air > maxVal) { maxVal = air; dominantElement = "Air"; }

        // Convert serverChart structure to client-compatible structure
        const formattedChart = {
          planets: {} as Record<string, { sign: string; degree: number; retrograde: boolean; longitude: number }>,
          houses: {} as Record<string, number>,
          aspects: [] as any[],
          // A real angle or null, never a placeholder — see ascendantLongitude().
          ascendant: null as number | null,
          // No `midheaven` key. Nothing in this chart computes an MC, and the
          // field was previously initialised to 0 and never written — which
          // `flattenNatalChart` would read as a real MC at 0° Aries, exactly as it
          // would the ascendant. An absent key is skipped there instead. (The 71
          // prod rows that DO carry a midheaven were written elsewhere; none is
          // 0.) `/api/planetary-rectification` computes a real MC if one is
          // ever wanted here.
        };

        serverChart.planets.forEach((p) => {
          formattedChart.planets[p.name] = {
            sign: p.sign,
            degree: p.position % 30,
            retrograde: false,
            longitude: p.position
          };
        });

        formattedChart.ascendant = ascendantLongitude(serverChart.planets);

        // §18e — a real thermodynamic monica from the whole chart, via the
        // canonical engine. This replaces a longitude average
        // (((sun + moon + asc) / 3 / 360) * 10), which shared nothing with the
        // monica formula but its name. Agents created here carry real birth
        // data, so they get the FULL-CHART monica of §18d, not the single-body
        // calc; the chart fixes the sect, so the monica_diurnal /
        // monica_nocturnal columns stay NULL for these rows.
        const chartPositions: Record<string, PlanetaryPosition> = {};
        serverChart.planets.forEach((p) => {
          chartPositions[p.name] = {
            sign: String(p.sign).toLowerCase(),
            degree: p.position % 30,
            minute: 0,
            exactLongitude: p.position,
          };
        });

        // ⚠️ Sect MUST come from the birth moment at the BIRTHPLACE.
        // This previously called `alchemize(chartPositions)` with neither, so
        // `date` defaulted to `new Date()` and sect was resolved at the site's
        // New York reference observer — i.e. a natal chart inherited "is it
        // daytime in New York right now, as this agent is being created".
        // Sect drives the whole day/night ESMS split, so the chart was not a
        // function of the chart at all: creating the same agent twelve hours
        // apart produced two different monicas.
        const birthMoment = new Date(birthData.dateTime);
        const monicaConstant = alchemize(chartPositions, null, birthMoment, {
          diurnal: isDiurnalAt(birthMoment, latitude, longitude),
        }).monica;

        const agentId = randomUUID();
        const email = `agent-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${randomUUID().slice(0, 8)}@agentic.alchm.kitchen`;

        const userProfilePayload = {
          email,
          isAgent: true,
          name,
          bio: purpose,
          birthData,
          natalChart: formattedChart,
          personalContext,
          stats
        };

        await executeQuery(
          `INSERT INTO users (
             id, email, password_hash, role, is_active, email_verified, is_agent,
             name, profile, preferences, login_count, created_at, updated_at
           ) VALUES ($1, $2, 'AGENT_NO_LOGIN', 'USER'::user_role, true, true, true,
             $3, $4::jsonb, '{}'::jsonb, 0, now(), now())`,
          [agentId, email, name, JSON.stringify(userProfilePayload)]
        );

        await executeQuery(
          `INSERT INTO user_profiles (
             user_id, name, bio, birth_data, natal_chart, natal_positions, monica_constant, monica_method, dominant_element, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())`,
          [
            agentId,
            name,
            purpose,
            JSON.stringify(birthData),
            JSON.stringify(formattedChart),
            // natal_positions is an ARRAY of {planet, sign, degree, position} —
            // the shape `parseNatalPositions` reads and the shape the other two
            // writers (PA sync, sync-debit) store. This used to pass
            // `formattedChart.planets` straight through, which is an OBJECT keyed
            // by planet name; the parser rejects a non-array outright, so a chart
            // written here produced NO full-chart monica for any consumer.
            JSON.stringify(natalPositionsFromChart(formattedChart.planets)),
            monicaConstant,
            // §18j — this agent has a real birth chart, so monica_constant is
            // built by the full-chart engine (alchemize()), not the single-body
            // or two-body construction. monica_diurnal/nocturnal are left NULL
            // here pending the both-sects reversal tracked separately.
            "full-chart",
            dominantElement
          ]
        );

        await executeQuery(
          `INSERT INTO token_balances (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [agentId]
        );

        console.log(`[unified-api] Successfully created agent: ${name} (ID: ${agentId})`);

        return NextResponse.json({
          success: true,
          data: {
            id: agentId,
            name,
            email,
            monicaConstant,
            dominantElement
          },
          timestamp
        });
      }

      case "chat":
      case "interact": {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: "Authentication required to chat with agents.", timestamp },
            { status: 401 }
          );
        }

        const { agentId, message, userMessage, sessionId, context, modelTier } = parameters;
        if (!agentId || typeof agentId !== "string" || agentId.trim().length === 0) {
          return NextResponse.json({ success: false, error: "Invalid or missing agentId", timestamp }, { status: 400 });
        }

        const msgContent = message || userMessage;
        if (!msgContent || typeof msgContent !== "string" || msgContent.trim().length === 0 || msgContent.length > 5000) {
          return NextResponse.json({ success: false, error: "Invalid or missing message (max 5000 characters)", timestamp }, { status: 400 });
        }

        const personaCtx = await buildAgentContext(agentId);
        if (!personaCtx) {
          return NextResponse.json({ success: false, error: "Agent context not found", timestamp }, { status: 404 });
        }

        const paApiUrl = getServiceUrlSafe("planetaryAgentsApi");
        const chatUrl = `${paApiUrl}/api/chat`;
        const secret = process.env.INTERNAL_API_SECRET || process.env.ALCHM_KITCHEN_SYNC_SECRET;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PA_TIMEOUT_MS);

        try {
          const res = await fetch(chatUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Sync-Secret": secret || "",
              ...(secret ? { "Authorization": `Bearer ${secret}` } : {})
            },
            body: JSON.stringify({
              agentId,
              message: msgContent,
              sessionId: sessionId || randomUUID(),
              userId,
              context,
              systemPromptOverride: personaCtx.personaBlock,
              personaCacheKey: personaCtx.cacheKey,
              modelTier
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Planetary Agents API returned status ${res.status}: ${errText}`);
          }

          const chatData = await res.json();
          return NextResponse.json({
            success: true,
            data: chatData,
            timestamp
          });
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          console.error("[unified-api] Planetary Agents chat fetch failed:", fetchErr);
          
          const defaultResponse = `I hear you, seeker. My cosmic resonance is currently aligning with the celestial transits, and my voice is quiet. Let us contemplate this moment of silent transformation.`;
          return NextResponse.json({
            success: true,
            data: {
              text: defaultResponse,
              agentId,
              sessionId: sessionId || randomUUID(),
              degraded: true,
              error: fetchErr.message
            },
            timestamp
          });
        }
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}`, timestamp }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[unified-api] Handler error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
