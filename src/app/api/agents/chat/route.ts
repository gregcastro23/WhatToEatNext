import { NextRequest, NextResponse } from "next/server";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { createLogger } from "@/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("PlanetaryAgentChat");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, agent, context, initialContext } = body;

    const agentId = agent?.id || initialContext?.agentId || "planetary-sun-aries-0";
    const message = userMessage || "Greetings";

    const paApi = getServiceUrlSafe("planetaryAgentsApi");

    let responseText = "";
    let metadata: Record<string, unknown> = {};

    try {
      const paRes = await fetch(`${paApi}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          message,
          sessionId: context?.sessionId || `wten-chat-${agentId}-${Date.now()}`,
          context: {
            element: agent?.element,
            dignity: agent?.dignity,
            planetaryRuler: agent?.planetaryRuler,
            degree: initialContext?.degree ?? agent?.exactDegree,
            sign: initialContext?.sign,
          },
        }),
      });

      if (paRes.ok) {
        const data = await paRes.json();
        responseText = data.text || "";
        metadata = data.metadata || {};
      } else {
        logger.warn(`PA chat responded with ${paRes.status}, falling back to voiced response`);
      }
    } catch (fetchErr) {
      logger.warn("PA backend unavailable for chat, using voiced alchemical response", fetchErr);
    }

    if (!responseText) {
      const elementName = agent?.element || "Spirit";
      const ruler = agent?.planetaryRuler || "Planetary Intelligence";
      const dignity = agent?.dignity || "peregrine";
      const strength = agent?.activationStrength ?? 85;

      responseText = `As ${agent?.name || "Planetary Intelligence"} (${dignity} dignity, ${strength}% potency), I perceive the celestial currents of ${elementName} aligning with your inquiry: "${message}". In this sacred space, let us transmute these cosmic vectors into culinary wisdom.`;
    }

    return NextResponse.json({
      content: responseText,
      astrologicalContext: metadata.astrologicalContext || {
        currentPlanets: {
          [agent?.planetaryRuler || "Sun"]: { sign: initialContext?.sign || "Aries" },
        },
        transitInfluence: `${agent?.element || "Cosmic"} resonance at exact degree ${initialContext?.degree ?? 0}°`,
      },
      newConsciousnessLevel: metadata.consciousnessLevel || context?.currentConsciousness || "Active",
      evolutionGain: 0.05,
      insights: (metadata.insights as string[]) || [`Understanding of ${agent?.element || "elemental"} energy patterns`],
    });
  } catch (error) {
    logger.error("Error in planetary agent chat:", error);
    return NextResponse.json(
      { error: "Failed to generate agent response" },
      { status: 500 }
    );
  }
}
