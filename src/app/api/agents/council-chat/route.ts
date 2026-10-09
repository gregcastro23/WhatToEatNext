import { NextRequest, NextResponse } from "next/server";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { createLogger } from "@/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("PlanetaryCouncilChat");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, agentIds, availableAgents, mode } = body;

    const message = userMessage || "What guidance do you offer?";
    const agents = Array.isArray(availableAgents) ? availableAgents : [];
    const ids = Array.isArray(agentIds) ? agentIds : agents.map((a: any) => a.id);

    const paApi = getServiceUrlSafe("planetaryAgentsApi");

    let turns: Array<{ agentId: string; agentName: string; content: string; consensusWeight: number }> = [];

    try {
      const paRes = await fetch(`${paApi}/api/multi_agent_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentIds: ids,
          message,
          sessionId: `wten-council-${Date.now()}`,
          context: { mode: mode || "discussion" },
        }),
      });

      if (paRes.ok) {
        const data = await paRes.json();
        if (Array.isArray(data.responses) && data.responses.length > 0) {
          turns = data.responses.map((r: any) => ({
            agentId: r.agentId,
            agentName: r.name || r.agentId,
            content: r.text,
            consensusWeight: 0.85,
          }));
        }
      } else {
        logger.warn(`PA multi-agent chat responded with ${paRes.status}`);
      }
    } catch (fetchErr) {
      logger.warn("PA backend unavailable for council chat, synthesizing perspectives", fetchErr);
    }

    // If PA didn't return turns, synthesize voiced perspectives for the active agents
    if (turns.length === 0) {
      const selected = agents.filter((a: any) => ids.includes(a.id));
      turns = selected.map((agent: any) => {
        const element = agent.element || "Spirit";
        const strength = agent.activationStrength ?? 80;
        let styleNote = "";
        if (mode === "debate") {
          styleNote = `I challenge the conventional view: ${agent.planetaryRuler}'s current placement cautions against rush.`;
        } else if (mode === "consensus") {
          styleNote = `Our elemental harmonies unite in recommending balanced culinary transmutation.`;
        } else {
          styleNote = `The planetary currents flow with ${strength}% intensity through my domain.`;
        }

        return {
          agentId: agent.id,
          agentName: agent.name,
          content: `From my ${element} perspective as ${agent.name}: "${message}" calls for awareness. ${styleNote}`,
          consensusWeight: strength / 100,
        };
      });
    }

    const avgWeight = turns.length > 0
      ? turns.reduce((sum, r) => sum + r.consensusWeight, 0) / turns.length
      : 0.8;

    const summary = `The Council of Active Planetary Degrees harmonizes on this matter with ${Math.round(avgWeight * 100)}% elemental resonance across ${turns.map(t => t.agentName).join(", ")}.`;

    return NextResponse.json({
      responses: turns,
      summary,
    });
  } catch (error) {
    logger.error("Error in planetary council chat:", error);
    return NextResponse.json(
      { error: "Failed to generate council response" },
      { status: 500 }
    );
  }
}
