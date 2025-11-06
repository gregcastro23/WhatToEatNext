import {
  alchmAPI,
  type RuneAgentRequest,
  type RuneResult as APIRuneResult,
} from "@/lib/api/alchm-client";
import { logger } from "@/lib/logger";
import { getCurrentAlchemicalState } from "@/services/RealAlchemizeService";
import type { ElementalProperties } from "@/types/celestial";

export interface RuneAgentInput {
  datetime?: Date;
  location?: { latitude: number; longitude: number };
  context?: "cuisine" | "recipe" | "ingredient" | "cooking_method";
  preferences?: {
    dietaryRestrictions?: string[];
    cuisineTypes?: string[];
    intensity?: "mild" | "moderate" | "intense";
  };
}

export interface RuneResult {
  symbol: string;
  name: string;
  meaning: string;
  influence: {
    elemental: ElementalProperties;
    energy: {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    };
    guidance: string;
  };
  imageUrl?: string;
}

export interface AgentRecommendation {
  type: "cuisine" | "recipe" | "ingredient" | "cooking_method";
  recommendations: Array<{
    name: string;
    score: number;
    reasoning: string;
    elementalAlignment: number;
    runeResonance: number;
  }>;
  agentPersonality: {
    name: string;
    archetype: string;
    guidance: string;
    specialties: string[];
  };
}

export interface RuneAgentResult {
  rune: RuneResult;
  agent: AgentRecommendation;
  consciousness: {
    mcValues: { [key: string]: number };
    transitEffects: string[];
    momentumIndicators: {
      creativity: number;
      stability: number;
      transformation: number;
      harmony: number;
    };
  };
}

function generateLocalRune(): RuneResult {
  // Simplified local fallback - would use more sophisticated logic
  const runes = [
    { symbol: "᚛", name: "Fehu", meaning: "Wealth, abundance, nourishment" },
    { symbol: "᚜", name: "Uruz", meaning: "Strength, vitality, primal energy" },
    {
      symbol: "᚝",
      name: "Thurisaz",
      meaning: "Transformation, protection, power",
    },
    {
      symbol: "᚞",
      name: "Ansuz",
      meaning: "Communication, wisdom, divine breath",
    },
    { symbol: "᚟", name: "Raidho", meaning: "Journey, movement, rhythm" },
  ];

  const selected = runes[Math.floor(Math.random() * runes.length)];

  return {
    symbol: selected.symbol,
    name: selected.name,
    meaning: selected.meaning,
    influence: {
      elemental: { Fire: 0.3, Water: 0.2, Earth: 0.25, Air: 0.25 },
      energy: { Spirit: 0.5, Essence: 0.4, Matter: 0.3, Substance: 0.6 },
      guidance: `The ${selected.name} rune suggests focusing on ${selected.meaning.toLowerCase()}`,
    },
  };
}

function generateLocalAgent(context = "cuisine"): AgentRecommendation {
  const agents = {
    cuisine: {
      name: "Culinary Sage",
      archetype: "Wise Cook",
      guidance: "Balance flavors with elemental harmony",
      specialties: ["fusion", "seasonal cooking", "elemental balance"],
    },
    recipe: {
      name: "Recipe Alchemist",
      archetype: "Transformative Chef",
      guidance: "Transform simple ingredients into magical dishes",
      specialties: [
        "ingredient transformation",
        "flavor alchemy",
        "nutritional optimization",
      ],
    },
    ingredient: {
      name: "Ingredient Oracle",
      archetype: "Nature's Voice",
      guidance: "Choose ingredients that resonate with your current energy",
      specialties: [
        "seasonal selection",
        "energetic properties",
        "healing foods",
      ],
    },
    cooking_method: {
      name: "Method Master",
      archetype: "Technique Guardian",
      guidance: "The right technique unlocks hidden potential",
      specialties: ["thermal dynamics", "texture mastery", "timing precision"],
    },
  };

  const agent = agents[context as keyof typeof agents] || agents.cuisine;

  return {
    type: context as any,
    recommendations: [
      {
        name: "Sample Recommendation",
        score: 0.8,
        reasoning: "Aligned with current energies",
        elementalAlignment: 0.75,
        runeResonance: 0.7,
      },
    ],
    agentPersonality: agent,
  };
}

/**
 * Env flags required (set in .env.local):
 * - NEXT_PUBLIC_BACKEND_URL: e.g., http: //localhost:8000
 * - NEXT_PUBLIC_RUNE_AGENT_BACKEND: 'true' to enable backend-first calls
 */
export class RuneAgentClient {
  private readonly backendUrl: string | undefined;
  private readonly useBackend: boolean;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    this.useBackend =
      String(process.env.NEXT_PUBLIC_RUNE_AGENT_BACKEND).toLowerCase() ===
      "true";
  }

  async generateRuneOfMoment(input: RuneAgentInput = {}): Promise<RuneResult> {
    // 1) Backend-first using centralized API client
    if (this.useBackend && this.backendUrl) {
      try {
        const request: RuneAgentRequest = {
          datetime: input.datetime?.toISOString(),
          location: input.location,
          context: input.context,
          preferences: input.preferences,
        };

        const result = await alchmAPI.getRuneGuidance(request);
        logger.debug(
          "RuneAgentClient",
          "Backend rune generation successful",
          result,
        );
        return result;
      } catch (error) {
        logger.warn(
          "RuneAgentClient",
          "Backend rune generation failed, falling back to local",
          error,
        );
        // Fall through to local
      }
    }

    // 2) Local fallback
    return generateLocalRune();
  }

  async generateAgentRecommendations(
    input: RuneAgentInput = {},
  ): Promise<AgentRecommendation> {
    // 1) Backend-first for agent recommendations
    if (this.useBackend && this.backendUrl) {
      try {
        const url = new URL("/api/consciousness/live", this.backendUrl);
        const payload = {
          datetime: input.datetime?.toISOString() || new Date().toISOString(),
          location: input.location,
          context: input.context || "cuisine",
          preferences: input.preferences,
        };

        const res = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);

        const data = (await res.json()) as Partial<AgentRecommendation>;
        if (data.type && data.recommendations && data.agentPersonality) {
          return data as AgentRecommendation;
        }
      } catch (_error) {
        // Fall through to local
      }
    }

    // 2) Local fallback
    return generateLocalAgent(input.context);
  }

  async generateComplete(input: RuneAgentInput = {}): Promise<RuneAgentResult> {
    const [rune, agent] = await Promise.all([
      this.generateRuneOfMoment(input),
      this.generateAgentRecommendations(input),
    ]);

    // Generate consciousness data (simplified local version)
    const alchemicalState = getCurrentAlchemicalState();
    const consciousness = {
      mcValues: {
        creativity: alchemicalState.thermodynamicProperties.entropy,
        stability: 1 - alchemicalState.thermodynamicProperties.reactivity,
        transformation: alchemicalState.thermodynamicProperties.heat,
        harmony: alchemicalState.score,
      },
      transitEffects: [
        "Current planetary alignment supports culinary exploration",
      ],
      momentumIndicators: {
        creativity: alchemicalState.thermodynamicProperties.entropy,
        stability: 1 - alchemicalState.thermodynamicProperties.reactivity,
        transformation: alchemicalState.thermodynamicProperties.heat,
        harmony: alchemicalState.score,
      },
    };

    return { rune, agent, consciousness };
  }
}

export const runeAgentClient = new RuneAgentClient();
