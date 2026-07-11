import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildAgentContext } from "@/lib/agents/persona/build-agent-context";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { calculateNatalChart } from "@/services/natalChartService";
import type { NextRequest} from "next/server";

const PA_TIMEOUT_MS = 10000;

interface UnifiedAgentRequest {
  action: string;
  parameters?: any;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body: UnifiedAgentRequest = await request.json();
    const { action, parameters = {} } = body;
    const timestamp = new Date().toISOString();

    switch (action) {
      case "list": {
        const result = await executeQuery<any>(
          `SELECT u.id AS user_id, u.email, up.name, up.bio, up.dominant_element, up.monica_constant
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
          monicaConstant: row.monica_constant ? parseFloat(row.monica_constant) : null
        }));
        return NextResponse.json({ success: true, data: agents, timestamp });
      }

      case "get": {
        if (!parameters.agentId) {
          return NextResponse.json({ success: false, error: "Missing agentId", timestamp }, { status: 400 });
        }
        const ctx = await buildAgentContext(parameters.agentId);
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

        const birthData = {
          dateTime: new Date(Date.UTC(
            birthInfo.year,
            birthInfo.month - 1,
            birthInfo.day,
            birthInfo.hour,
            birthInfo.minute
          )).toISOString(),
          latitude: Number(birthInfo.latitude),
          longitude: Number(birthInfo.longitude),
          timezone: birthInfo.timezone || "UTC",
          name: birthInfo.locationName || birthInfo.location?.name || "Unknown"
        };

        console.log(`[unified-api] Calculating natal chart on create for agent: ${name}`);
        const serverChart = await calculateNatalChart(birthData);

        const spirit = Math.round((serverChart.elementalBalance.Fire || 0) * 100);
        const essence = Math.round((serverChart.elementalBalance.Water || 0) * 100);
        const matter = Math.round((serverChart.elementalBalance.Earth || 0) * 100);
        const substance = Math.round((serverChart.elementalBalance.Air || 0) * 100);

        let dominantElement = "Fire";
        let maxVal = spirit;
        if (essence > maxVal) { maxVal = essence; dominantElement = "Water"; }
        if (matter > maxVal) { maxVal = matter; dominantElement = "Earth"; }
        if (substance > maxVal) { maxVal = substance; dominantElement = "Air"; }

        // Convert serverChart structure to client-compatible structure
        const formattedChart = {
          planets: {} as Record<string, { sign: string; degree: number; retrograde: boolean; longitude: number }>,
          houses: {} as Record<string, number>,
          aspects: [] as any[],
          ascendant: 0,
          midheaven: 0
        };

        serverChart.planets.forEach((p) => {
          formattedChart.planets[p.name] = {
            sign: p.sign,
            degree: p.position % 30,
            retrograde: false,
            longitude: p.position
          };
        });

        const SIGN_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const ascIdx = SIGN_ORDER.indexOf(serverChart.ascendant);
        formattedChart.ascendant = ascIdx >= 0 ? ascIdx * 30 : 0;

        const sunLong = serverChart.planets.find(p => p.name === 'Sun')?.position || 0;
        const moonLong = serverChart.planets.find(p => p.name === 'Moon')?.position || 0;
        const monicaConstant = ((sunLong + moonLong + formattedChart.ascendant) / 3 / 360) * 10;

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
             user_id, name, bio, birth_data, natal_chart, natal_positions, monica_constant, dominant_element, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())`,
          [
            agentId,
            name,
            purpose,
            JSON.stringify(birthData),
            JSON.stringify(formattedChart),
            JSON.stringify(formattedChart.planets || {}),
            monicaConstant,
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
        if (!agentId) {
          return NextResponse.json({ success: false, error: "Missing agentId", timestamp }, { status: 400 });
        }

        const msgContent = message || userMessage;
        if (!msgContent) {
          return NextResponse.json({ success: false, error: "Missing message", timestamp }, { status: 400 });
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
