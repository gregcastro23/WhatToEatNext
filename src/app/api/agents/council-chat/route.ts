import { NextResponse } from "next/server";
import { z } from "zod";
import {
  planetaryAgentsGateway,
  type CouncilChatInput,
} from "@/lib/agents/planetaryAgentsGateway";
import { createLogger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("PlanetaryCouncilChat");

const CouncilAgentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  element: z.string().optional(),
  planetaryRuler: z.string().optional(),
  activationStrength: z.number().optional(),
  exactDegree: z.number().optional(),
}).passthrough();

const CouncilChatPayloadSchema = z.object({
  userMessage: z.string().optional(),
  agentIds: z.array(z.string()).optional(),
  availableAgents: z.array(CouncilAgentSchema).optional(),
  mode: z.enum(["discussion", "debate", "consensus"]).optional(),
  sessionId: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  dietPreference: z.string().optional(),
  cuisine: z.string().optional(),
  culinaryContext: z
    .object({
      ingredients: z.array(z.string()).optional(),
      dietPreference: z.string().optional(),
      cuisine: z.string().optional(),
    })
    .passthrough()
    .optional(),
}).passthrough();

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => ({}));
    const parseResult = CouncilChatPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const validatedData = parseResult.data;
    const { userMessage, agentIds, availableAgents, mode, sessionId, culinaryContext } = validatedData;

    const message = userMessage ?? "What guidance do you offer?";
    const parsedAgents = (availableAgents ?? []).map((a) => {
      const item: NonNullable<CouncilChatInput["availableAgents"]>[number] = {
        id: a.id,
        name: a.name ?? a.id,
      };
      if (a.element) item.element = a.element;
      if (a.planetaryRuler) item.planetaryRuler = a.planetaryRuler;
      if (typeof a.activationStrength === "number") item.activationStrength = a.activationStrength;
      if (typeof a.exactDegree === "number") item.exactDegree = a.exactDegree;
      return item;
    });

    const ids = Array.isArray(agentIds) && agentIds.length > 0
      ? agentIds
      : parsedAgents.map((a) => a.id).filter(Boolean);

    const culinaryPayload: NonNullable<CouncilChatInput["culinaryContext"]> = {};
    const ing = culinaryContext?.ingredients ?? validatedData.ingredients;
    if (ing) culinaryPayload.ingredients = ing;
    const diet = culinaryContext?.dietPreference ?? validatedData.dietPreference;
    if (diet) culinaryPayload.dietPreference = diet;
    const cuis = culinaryContext?.cuisine ?? validatedData.cuisine;
    if (cuis) culinaryPayload.cuisine = cuis;

    const councilMode: "discussion" | "debate" | "consensus" =
      mode === "debate" || mode === "consensus" ? mode : "discussion";

    const councilInput: CouncilChatInput = {
      agentIds: ids,
      userMessage: message,
      mode: councilMode,
    };
    if (sessionId) councilInput.sessionId = sessionId;
    if (parsedAgents.length > 0) councilInput.availableAgents = parsedAgents;
    if (Object.keys(culinaryPayload).length > 0) councilInput.culinaryContext = culinaryPayload;

    const result = await planetaryAgentsGateway.chatWithCouncil(councilInput);

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
