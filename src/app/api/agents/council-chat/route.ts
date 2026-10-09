import { NextResponse } from "next/server";
import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { createLogger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("PlanetaryCouncilChat");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, agentIds, availableAgents, mode, sessionId, culinaryContext } = body;

    const message = userMessage || "What guidance do you offer?";
    const agents = Array.isArray(availableAgents) ? availableAgents : [];
    const ids = Array.isArray(agentIds) ? agentIds : agents.map((a: any) => a.id);

    const effectiveCulinaryContext = culinaryContext || {
      ingredients: body.ingredients,
      dietPreference: body.dietPreference,
      cuisine: body.cuisine,
    };

    const result = await planetaryAgentsGateway.chatWithCouncil({
      agentIds: ids,
      userMessage: message,
      sessionId,
      mode: mode || "discussion",
      availableAgents: agents,
      culinaryContext: effectiveCulinaryContext,
    });

    return NextResponse.json({
      responses: result.responses,
      summary: result.summary,
      sessionId: result.sessionId,
      status: result.status,
    });
  } catch (error) {
    logger.error("Error in planetary council chat:", error);
    return NextResponse.json(
      { error: "Failed to generate council response" },
      { status: 500 }
    );
  }
}
