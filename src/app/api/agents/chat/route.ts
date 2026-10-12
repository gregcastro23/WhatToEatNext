import { NextResponse } from "next/server";
import { z } from "zod";
import {
  planetaryAgentsGateway,
  type AgentChatInput,
} from "@/lib/agents/planetaryAgentsGateway";
import { createLogger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("PlanetaryAgentChat");

const AgentChatPayloadSchema = z.object({
  userMessage: z.string().optional(),
  agent: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      element: z.string().optional(),
      dignity: z.string().optional(),
      planetaryRuler: z.string().optional(),
      exactDegree: z.number().optional(),
      activationStrength: z.number().optional(),
    })
    .passthrough()
    .optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  initialContext: z
    .object({
      agentId: z.string().optional(),
      degree: z.number().optional(),
      date: z.string().optional(),
    })
    .passthrough()
    .optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  date: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  dietPreference: z.string().optional(),
  cuisine: z.string().optional(),
  selectedRecipeId: z.string().optional(),
  culinaryContext: z
    .object({
      ingredients: z.array(z.string()).optional(),
      dietPreference: z.string().optional(),
      cuisine: z.string().optional(),
      selectedRecipeId: z.string().optional(),
    })
    .passthrough()
    .optional(),
}).passthrough();

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => ({}));
    const parseResult = AgentChatPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const validatedData = parseResult.data;
    const { userMessage, agent, context, initialContext, sessionId, userId, culinaryContext } = validatedData;

    const agentId = agent?.id ?? initialContext?.agentId ?? "planetary-sun-aries-0";
    const message = userMessage ?? "Greetings";
    const contextSessionId = typeof context?.sessionId === "string" ? context.sessionId : undefined;
    const contextDate = typeof context?.date === "string" ? context.date : undefined;
    const contextIngredients = Array.isArray(context?.ingredients)
      ? context.ingredients.filter((i): i is string => typeof i === "string")
      : undefined;
    const contextDiet = typeof context?.dietPreference === "string" ? context.dietPreference : undefined;
    const contextCuisine = typeof context?.cuisine === "string" ? context.cuisine : undefined;
    const contextRecipeId = typeof context?.selectedRecipeId === "string" ? context.selectedRecipeId : undefined;

    const effectiveSessionId = sessionId ?? contextSessionId;
    const effectiveUserId = userId ?? "demo-user";
    const date = initialContext?.date ?? contextDate ?? validatedData.date;

    const agentPayload: NonNullable<AgentChatInput["agent"]> = {};
    if (agent?.name) agentPayload.name = agent.name;
    if (agent?.element) agentPayload.element = agent.element;
    if (agent?.dignity) agentPayload.dignity = agent.dignity;
    if (agent?.planetaryRuler) agentPayload.planetaryRuler = agent.planetaryRuler;
    const degree = initialContext?.degree ?? agent?.exactDegree;
    if (typeof degree === "number") agentPayload.exactDegree = degree;
    if (typeof agent?.activationStrength === "number") agentPayload.activationStrength = agent.activationStrength;

    const culinaryPayload: NonNullable<AgentChatInput["culinaryContext"]> = {};
    const ing = culinaryContext?.ingredients ?? validatedData.ingredients ?? contextIngredients;
    if (ing) culinaryPayload.ingredients = ing;
    const diet = culinaryContext?.dietPreference ?? validatedData.dietPreference ?? contextDiet;
    if (diet) culinaryPayload.dietPreference = diet;
    const cuis = culinaryContext?.cuisine ?? validatedData.cuisine ?? contextCuisine;
    if (cuis) culinaryPayload.cuisine = cuis;
    const recId = culinaryContext?.selectedRecipeId ?? validatedData.selectedRecipeId ?? contextRecipeId;
    if (recId) culinaryPayload.selectedRecipeId = recId;

    const chatInput: AgentChatInput = {
      agentId,
      userMessage: message,
      userId: effectiveUserId,
    };
    if (effectiveSessionId) chatInput.sessionId = effectiveSessionId;
    if (date) chatInput.date = date;
    if (Object.keys(agentPayload).length > 0) chatInput.agent = agentPayload;
    if (Object.keys(culinaryPayload).length > 0) chatInput.culinaryContext = culinaryPayload;

    const result = await planetaryAgentsGateway.chatWithAgent(chatInput);

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
