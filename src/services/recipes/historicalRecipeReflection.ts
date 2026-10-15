import { HISTORICAL_LORE_CRITIQUES } from "@/data/historicalCritiqueLore";
import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { _logger } from "@/lib/logger";

interface ReflectionContext {
  agentSlug: string;
  agentName: string;
  diet: Record<string, unknown>;
  cuisine: string;
  recipeName: string;
  recipeId: string;
  dominantElement: string | null;
}
interface HistoricalRecipeReflection {
  text: string;
  contentState: "live" | "gateway-degraded" | "curated";
}

async function gatewayReflection(context: ReflectionContext): Promise<HistoricalRecipeReflection | null> {
  try {
    const response = await planetaryAgentsGateway.chatWithAgent({
      agentId: context.agentSlug,
      userMessage: `As ${context.agentName}, please provide an authentic 2-3 sentence culinary critique and pairing tip for "${context.recipeName}". Emphasize your historical dietary philosophy (${context.diet.dietaryPhilosophy ?? "alchemical nourishment"}) and cultural perspective (${context.diet.culturalCuisine ?? context.cuisine}).`,
      culinaryContext: { selectedRecipeId: context.recipeId, cuisine: context.cuisine },
    });
    if ((response.status === "live" || response.status === "degraded") && response.content && response.content.trim().length > 20) {
      if (response.status === "degraded") {
        _logger.error(`[recipe-critique] Gateway chat returned degraded state for ${context.agentSlug}`);
      }
      return { text: response.content.trim(), contentState: response.status === "live" ? "live" : "gateway-degraded" };
    }
  } catch (error) {
    _logger.error(`[recipe-critique] Gateway chat failed for ${context.agentSlug}`, error);
  }
  return null;
}

function curatedReflection(context: ReflectionContext): string {
  const generator = HISTORICAL_LORE_CRITIQUES[context.agentSlug];
  if (generator) return generator(context.recipeName, context.cuisine);
  const rawPhilosophy = typeof context.diet.dietaryPhilosophy === "string" ? context.diet.dietaryPhilosophy : undefined;
  const philosophy = rawPhilosophy ? ` As I have always observed: "${rawPhilosophy.slice(0, 120)}..."` : "";
  return `In observing "${context.recipeName}", the ${context.dominantElement ?? "Fire"} element harmonizes the culinary transformation.${philosophy} A balanced preparation that honors both bodily constitution and culinary heritage.`;
}

export async function generateHistoricalReflection(context: ReflectionContext): Promise<HistoricalRecipeReflection> {
  const generated = await gatewayReflection(context);
  if (generated) return generated;
  _logger.error(`[recipe-critique] Used curated lore fallback for ${context.agentSlug}`);
  return { text: curatedReflection(context), contentState: "curated" };
}
