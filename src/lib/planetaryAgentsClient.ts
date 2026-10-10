// src/lib/planetaryAgentsClient.ts

import { _logger } from "@/lib/logger";
import { getServiceUrlSafe } from "@/lib/serviceUrls";

export const PLANETARY_AGENTS_URL = getServiceUrlSafe("planetaryAgentsApi");
export { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";

export async function fetchAgentForDegree(degree: number, date?: Date) {
  if (typeof window === "undefined") {
    try {
      const { planetaryAgentsGateway } = await import("@/lib/agents/planetaryAgentsGateway");
      return await planetaryAgentsGateway.fetchAgentForDegree(degree, date || new Date());
    } catch (err) {
      _logger.error(`Failed to fetch agent for degree ${degree} on server:`, err);
      return null;
    }
  }

  try {
    const dateQuery = date ? `?date=${encodeURIComponent(date.toISOString())}` : "";
    const res = await fetch(`/api/agents/degree/${degree}${dateQuery}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    _logger.error("Failed to fetch agent for degree:", error);
    return null;
  }
}

export async function fetchAllDegreeAgents(date?: Date) {
  if (typeof window === "undefined") {
    try {
      const { planetaryAgentsGateway } = await import("@/lib/agents/planetaryAgentsGateway");
      const res = await planetaryAgentsGateway.fetchDegreesMap(date || new Date());
      return res.degrees;
    } catch (err) {
      _logger.error("Failed to fetch degree agents on server:", err);
      return {};
    }
  }

  try {
    const dateQuery = date ? `?date=${encodeURIComponent(date.toISOString())}` : "";
    const res = await fetch(`/api/agents/degrees${dateQuery}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (error) {
    _logger.error("Failed to fetch all degree agents:", error);
    return {};
  }
}

export async function fetchAgentsForDate(date: Date = new Date(), limit = 20) {
  if (typeof window === "undefined") {
    try {
      const { planetaryAgentsGateway } = await import("@/lib/agents/planetaryAgentsGateway");
      const res = await planetaryAgentsGateway.fetchActivationsForDate(date, limit);
      return res.activations;
    } catch (err) {
      _logger.error("Failed to fetch activations on server:", err);
      return [];
    }
  }

  try {
    const res = await fetch(`/api/agents/activations?date=${encodeURIComponent(date.toISOString())}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.activations ?? [];
  } catch (error) {
    _logger.error("Failed to fetch agents for date:", error);
    return [];
  }
}

export async function fetchAgentReactions(context: any) {
  try {
    const res = await fetch(`${PLANETARY_AGENTS_URL}/api/agents/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    _logger.error("Failed to fetch agent reactions:", error);
    return null;
  }
}
