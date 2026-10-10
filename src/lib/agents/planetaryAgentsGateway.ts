/**
 * Planetary Agents Gateway Module
 *
 * Centralized server-side gateway for communicating with Alchemical Agents (ASOL).
 *
 * Host routing:
 *   - agentsUi (https://agents.alchm.kitchen): Next.js app routes (activations, degrees, degree/:deg)
 *   - planetaryAgentsApi (https://api.agents.alchm.kitchen): Python/FastAPI routes (/api/chat, /api/multi_agent_chat)
 *
 * Responsibilities:
 *   1. Host selection & URL resolution
 *   2. Exact-transit degree activation verification (prevents dormant degree agent chat)
 *   3. Session continuity (maintains stable sessionId across turns)
 *   4. Kitchen context enrichment (ingredients, dietary preferences, cuisine, live sky)
 *   5. Response metadata preservation (MCP live sky, ingredient scans, model/provider provenance)
 *   6. Resilient timeouts & graceful degradation
 */

import { _logger } from "@/lib/logger";
import { getServiceUrlSafe } from "@/lib/serviceUrls";

export interface ActiveDegreeAgent {
  id: string;
  name: string;
  exactDegree?: number;
  absoluteDegree?: number;
  strength?: number;
  activationStrength?: number;
  dignity?: string;
  element?: string;
  planetaryRuler?: string;
  sign?: string;
  role?: string;
  esmsBalance?: number;
  config?: Record<string, unknown>;
  consciousnessState?: {
    level?: string;
    powerLevel?: number;
  };
}

export interface DegreeActivationMap {
  [degree: number]: ActiveDegreeAgent;
}

export interface AgentChatInput {
  agentId: string;
  userMessage: string;
  sessionId?: string;
  userId?: string;
  date?: string | Date;
  agent?: {
    name?: string;
    element?: string;
    dignity?: string;
    planetaryRuler?: string;
    exactDegree?: number;
    activationStrength?: number;
    kind?: string;
  };
  culinaryContext?: {
    ingredients?: string[];
    dietPreference?: string;
    cuisine?: string;
    selectedRecipeId?: string;
  };
}

export interface AgentChatResult {
  content: string;
  sessionId: string;
  agentId: string;
  astrologicalContext: Record<string, unknown>;
  metadata: {
    provider?: string;
    model?: string;
    tier?: string;
    ragUsed?: boolean;
    mcp?: Record<string, unknown>;
    aiGenerated?: boolean;
  };
  newConsciousnessLevel?: string;
  evolutionGain?: number;
  insights?: string[];
  isDormant?: boolean;
  status: "live" | "degraded" | "dormant";
  error?: string;
}

export interface CouncilChatInput {
  agentIds: string[];
  userMessage: string;
  sessionId?: string;
  mode?: "discussion" | "debate" | "consensus";
  availableAgents?: Array<{
    id: string;
    name: string;
    element?: string;
    planetaryRuler?: string;
    activationStrength?: number;
    exactDegree?: number;
  }>;
  culinaryContext?: {
    ingredients?: string[];
    dietPreference?: string;
    cuisine?: string;
  };
}

export interface CouncilChatResult {
  sessionId: string;
  responses: Array<{
    agentId: string;
    agentName: string;
    content: string;
    consensusWeight: number;
    element?: string;
  }>;
  summary: string;
  status: "live" | "degraded";
}

const NEXT_TIMEOUT_MS = 4500;
const CHAT_TIMEOUT_MS = 8000;

class PlanetaryAgentsGateway {
  private getNextHost(): string {
    return getServiceUrlSafe("agentsUi");
  }

  private getFastApiHost(): string {
    return getServiceUrlSafe("planetaryAgentsApi");
  }

  /**
   * Fetch active degree agents for a specific date from ASOL Next.js
   */
  async fetchActivationsForDate(date: Date = new Date(), limit = 20): Promise<{
    activations: ActiveDegreeAgent[];
    status: "live" | "degraded";
    date: string;
  }> {
    const nextHost = this.getNextHost();
    const dateStr = date.toISOString();

    try {
      const res = await fetch(`${nextHost}/api/agents/activations?date=${encodeURIComponent(dateStr)}&limit=${limit}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(NEXT_TIMEOUT_MS),
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.activations) ? data.activations : [];
        return {
          activations: list.map((a: any) => ({
            id: a.agent?.id || a.id,
            name: a.agent?.name || a.name,
            exactDegree: a.exactDegree ?? a.agent?.degree,
            absoluteDegree: a.absoluteDegree,
            strength: a.strength,
            activationStrength: Math.round((a.strength ?? 0.85) * 100),
            dignity: a.dignity,
            element: a.element,
            planetaryRuler: a.planetaryRuler,
            sign: a.sign,
            config: a.config,
            consciousnessState: a.consciousnessState,
          })),
          status: "live",
          date: dateStr,
        };
      }
    } catch (err) {
      _logger.warn("[PlanetaryAgentsGateway] activations fetch failed, degrading gracefully:", err);
    }

    return {
      activations: [],
      status: "degraded",
      date: dateStr,
    };
  }

  /**
   * Fetch the full 360-degree map for a given date from ASOL Next.js
   */
  async fetchDegreesMap(date: Date = new Date()): Promise<{
    degrees: DegreeActivationMap;
    status: "live" | "degraded";
  }> {
    const nextHost = this.getNextHost();
    const dateStr = date.toISOString();

    try {
      const res = await fetch(`${nextHost}/api/agents/degrees?date=${encodeURIComponent(dateStr)}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(NEXT_TIMEOUT_MS),
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const data = await res.json();
        return {
          degrees: (data || {}) as DegreeActivationMap,
          status: "live",
        };
      }
    } catch (err) {
      _logger.warn("[PlanetaryAgentsGateway] degrees map fetch failed:", err);
    }

    return {
      degrees: {},
      status: "degraded",
    };
  }

  /**
   * Fetch active agent details for a specific degree (0-359) from ASOL Next.js
   */
  async fetchAgentForDegree(degree: number, date: Date = new Date()): Promise<{
    active: boolean;
    degree: number;
    agent?: any;
    message?: string;
  }> {
    const nextHost = this.getNextHost();
    const dateStr = date.toISOString();

    try {
      const res = await fetch(`${nextHost}/api/agents/degree/${degree}?date=${encodeURIComponent(dateStr)}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(NEXT_TIMEOUT_MS),
        next: { revalidate: 60 },
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      _logger.warn(`[PlanetaryAgentsGateway] fetchAgentForDegree(${degree}) failed:`, err);
    }

    return {
      active: false,
      degree,
      message: `Degree ${degree}° is currently dormant.`,
    };
  }

  /**
   * Check if a specific degree or degree-agent is active for the given date.
   * Historical agents always return true.
   */
  async isAgentActiveForDate(agentId: string, date: Date = new Date()): Promise<{
    isActive: boolean;
    isHistorical: boolean;
    degree?: number;
    reason?: string;
  }> {
    const lowered = agentId.toLowerCase().trim();

    // Historical agents and named companions are always active
    const isHistorical =
      !lowered.startsWith("degree-") &&
      !lowered.startsWith("planetary-") &&
      !lowered.startsWith("moon-phase-") &&
      !/^([a-z]+)-([a-z]+)-(\d+)$/.test(lowered);

    if (isHistorical) {
      return { isActive: true, isHistorical: true };
    }

    // Parse degree from agentId
    let targetDegree: number | undefined;
    const degreeMatch = lowered.match(/(?:degree|planetary-[a-z]+-[a-z]+|[a-z]+-[a-z]+)-(\d+)$/);
    if (degreeMatch?.[1]) {
      targetDegree = parseInt(degreeMatch[1], 10);
    }

    if (targetDegree === undefined || isNaN(targetDegree)) {
      // If we cannot parse a degree, allow chat to proceed safely
      return { isActive: true, isHistorical: false };
    }

    const { degrees } = await this.fetchDegreesMap(date);
    const hasTransit = Boolean(degrees[targetDegree]);

    return {
      isActive: hasTransit,
      isHistorical: false,
      degree: targetDegree,
      ...(hasTransit ? {} : { reason: `No planetary transit at ${targetDegree}° for selected date` }),
    };
  }

  /**
   * Authenticated, transit-gated chat with an agent
   */
  async chatWithAgent(input: AgentChatInput): Promise<AgentChatResult> {
    const {
      agentId,
      userMessage,
      sessionId = `wten-chat-${agentId}-${Date.now()}`,
      userId = "demo-user",
      date = new Date(),
      agent,
      culinaryContext,
    } = input;

    const parsedDate = date instanceof Date ? date : new Date(date);

    // 1. Verify exact-transit activation gate
    const eligibility = await this.isAgentActiveForDate(agentId, parsedDate);
    if (!eligibility.isActive) {
      const degreeLabel = eligibility.degree !== undefined ? `${eligibility.degree}°` : "this placement";
      return {
        content: `I am currently dormant in the celestial vault. At ${degreeLabel}, no transiting planet occupies my exact celestial degree on this date. Reconnect when a planetary body enters my degree, or commune with our active historical alchemists.`,
        sessionId,
        agentId,
        astrologicalContext: {
          degree: eligibility.degree,
          status: "dormant",
          date: parsedDate.toISOString(),
        },
        metadata: { aiGenerated: false },
        isDormant: true,
        status: "dormant",
      };
    }

    // 2. Call ASOL FastAPI /api/chat
    const fastApiHost = this.getFastApiHost();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }

    try {
      const paRes = await fetch(`${fastApiHost}/api/chat`, {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
        body: JSON.stringify({
          agentId,
          message: userMessage,
          sessionId,
          userId,
          context: {
            date: parsedDate.toISOString(),
            element: agent?.element,
            dignity: agent?.dignity,
            planetaryRuler: agent?.planetaryRuler,
            degree: agent?.exactDegree,
            ingredients: culinaryContext?.ingredients,
            dietPreference: culinaryContext?.dietPreference,
            cuisine: culinaryContext?.cuisine,
            selectedRecipeId: culinaryContext?.selectedRecipeId,
          },
        }),
      });

      if (paRes.ok) {
        const data = await paRes.json();
        const meta = data.metadata || {};
        return {
          content: data.text || "",
          sessionId: data.sessionId || sessionId,
          agentId: data.agentId || agentId,
          astrologicalContext: meta.astrologicalContext || {
            planetaryRuler: agent?.planetaryRuler,
            element: agent?.element,
            degree: agent?.exactDegree,
          },
          metadata: {
            provider: meta.provider,
            model: meta.model,
            tier: meta.tier,
            ragUsed: meta.rag_used,
            mcp: meta.mcp,
            aiGenerated: data.ai_generated ?? true,
          },
          newConsciousnessLevel: meta.consciousnessLevel || "Active",
          evolutionGain: meta.evolutionGain ?? 0.05,
          insights: (meta.insights as string[]) || (data.insights as string[]) || [],
          status: "live",
        };
      } else {
        _logger.warn(`[PlanetaryAgentsGateway] /api/chat returned status ${paRes.status}`);
      }
    } catch (err) {
      _logger.warn("[PlanetaryAgentsGateway] /api/chat request failed, using voiced fallback:", err);
    }

    // 3. Graceful degradation: voiced alchemical perspective
    const elementName = agent?.element || "Spirit";
    const ruler = agent?.planetaryRuler || "Planetary Intelligence";
    const dignity = agent?.dignity || "peregrine";
    const strength = agent?.activationStrength ?? 85;

    return {
      content: `As ${agent?.name || "Planetary Intelligence"} (${dignity} dignity, ${strength}% potency), I perceive the celestial currents of ${elementName} aligning with your inquiry: "${userMessage}". In this sacred space, let us transmute these cosmic vectors into culinary wisdom.`,
      sessionId,
      agentId,
      astrologicalContext: {
        planetaryRuler: ruler,
        element: elementName,
        dignity,
        strength,
      },
      metadata: { aiGenerated: false },
      status: "degraded",
    };
  }

  /**
   * Multi-agent Council chat with dynamic prompt overrides and consensus tracking
   */
  async chatWithCouncil(input: CouncilChatInput): Promise<CouncilChatResult> {
    const {
      agentIds,
      userMessage,
      sessionId = `wten-council-${Date.now()}`,
      mode = "discussion",
      availableAgents = [],
      culinaryContext,
    } = input;

    const fastApiHost = this.getFastApiHost();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }

    // Build system prompt overrides so each agent speaks from their real culinary & planetary persona
    const systemPromptOverrides: Record<string, string> = {};
    for (const a of availableAgents) {
      if (a.id) {
        systemPromptOverrides[a.id.toLowerCase().trim()] =
          `You are ${a.name}, an active planetary intelligence in the ${a.element || "Cosmic"} domain ruled by ${a.planetaryRuler || "the cosmos"}. Speak in 2-3 concise sentences addressing the culinary question with elemental wisdom.`;
      }
    }

    try {
      const paRes = await fetch(`${fastApiHost}/api/multi_agent_chat`, {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
        body: JSON.stringify({
          agentIds,
          message: userMessage,
          sessionId,
          context: {
            mode,
            ingredients: culinaryContext?.ingredients,
            dietPreference: culinaryContext?.dietPreference,
            cuisine: culinaryContext?.cuisine,
          },
          systemPromptOverrides,
        }),
      });

      if (paRes.ok) {
        const data = await paRes.json();
        if (Array.isArray(data.responses) && data.responses.length > 0) {
          const turns = data.responses.map((r: any) => ({
            agentId: r.agentId,
            agentName: r.name || r.agentId,
            content: r.text || "",
            consensusWeight: r.consensusWeight ?? 0.85,
            element: r.element,
          }));

          const avgWeight = turns.reduce((sum: number, t: any) => sum + t.consensusWeight, 0) / turns.length;
          const summary = `The Council of Active Degrees harmonizes on this matter with ${Math.round(avgWeight * 100)}% elemental resonance across ${turns.map((t: any) => t.agentName).join(", ")}.`;

          return {
            sessionId: data.sessionId || sessionId,
            responses: turns,
            summary,
            status: "live",
          };
        }
      }
    } catch (err) {
      _logger.warn("[PlanetaryAgentsGateway] /api/multi_agent_chat failed, using synthesis fallback:", err);
    }

    // Synthesis fallback
    const selected = availableAgents.filter((a) => agentIds.includes(a.id));
    const turns = selected.map((agent) => {
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
        content: `From my ${element} perspective as ${agent.name}: "${userMessage}" calls for awareness. ${styleNote}`,
        consensusWeight: strength / 100,
        element,
      };
    });

    const avgWeight = turns.length > 0
      ? turns.reduce((sum, r) => sum + r.consensusWeight, 0) / turns.length
      : 0.8;

    return {
      sessionId,
      responses: turns,
      summary: `The Council harmonizes with ${Math.round(avgWeight * 100)}% elemental resonance across ${turns.map((t) => t.agentName).join(", ")}.`,
      status: "degraded",
    };
  }
}

export const planetaryAgentsGateway = new PlanetaryAgentsGateway();
