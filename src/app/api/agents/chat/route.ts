import { NextResponse } from "next/server";
import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { createLogger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("PlanetaryAgentChat");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, agent, context, initialContext, sessionId, userId, culinaryContext } = body;

    const agentId = agent?.id || initialContext?.agentId || "planetary-sun-aries-0";
    const message = userMessage || "Greetings";
    const effectiveSessionId = sessionId || context?.sessionId;
    const effectiveUserId = userId || "demo-user";
    const date = initialContext?.date || context?.date || body.date;

    const effectiveCulinaryContext = culinaryContext || {
      ingredients: body.ingredients || context?.ingredients,
      dietPreference: body.dietPreference || context?.dietPreference,
      cuisine: body.cuisine || context?.cuisine,
      selectedRecipeId: body.selectedRecipeId || context?.selectedRecipeId,
    };

    const result = await planetaryAgentsGateway.chatWithAgent({
      agentId,
      userMessage: message,
      sessionId: effectiveSessionId,
      userId: effectiveUserId,
      date,
      agent: {
        name: agent?.name,
        element: agent?.element,
        dignity: agent?.dignity,
        planetaryRuler: agent?.planetaryRuler,
        exactDegree: initialContext?.degree ?? agent?.exactDegree,
        activationStrength: agent?.activationStrength,
      },
      culinaryContext: effectiveCulinaryContext,
    });

    return NextResponse.json({
      content: result.content,
      sessionId: result.sessionId,
      agentId: result.agentId,
      astrologicalContext: result.astrologicalContext,
      metadata: result.metadata,
      newConsciousnessLevel: result.newConsciousnessLevel,
      evolutionGain: result.evolutionGain,
      insights: result.insights,
      isDormant: result.isDormant,
      status: result.status,
    });
  } catch (error) {
    logger.error("Error in planetary agent chat:", error);
    return NextResponse.json(
      { error: "Failed to generate agent response" },
      { status: 500 }
    );
  }
}
