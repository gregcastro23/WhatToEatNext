// src/lib/planetaryAgentsClient.ts

import {
  planetaryAgentsGateway,
  type ActiveDegreeAgent,
  type DegreeActivationMap,
} from "@/lib/agents/planetaryAgentsGateway";
import { readJson } from "@/lib/api/json";
import { _logger } from "@/lib/logger";
import { getServiceUrlSafe } from "@/lib/serviceUrls";

export const PLANETARY_AGENTS_URL = getServiceUrlSafe("planetaryAgentsApi");
export { planetaryAgentsGateway };

export interface DegreeActivationItem {
  id?: string;
  name?: string;
  description?: string;
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
  agent?: {
    id?: string;
    name?: string;
    description?: string;
  };
}

export interface DegreeAgentStatus {
  active: boolean;
  degree: number;
  agent?: ActiveDegreeAgent;
  message?: string;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function parseConsciousnessState(
  raw: unknown,
): ActiveDegreeAgent["consciousnessState"] | undefined {
  if (!isPlainObject(raw)) return undefined;
  const out: NonNullable<ActiveDegreeAgent["consciousnessState"]> = {};
  if (typeof raw.level === "string") out.level = raw.level;
  if (typeof raw.powerLevel === "number") out.powerLevel = raw.powerLevel;
  return out;
}

function parseActiveDegreeAgent(raw: unknown): ActiveDegreeAgent | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null;
  const out: ActiveDegreeAgent = { id: raw.id, name: raw.name };
  if (typeof raw.exactDegree === "number") out.exactDegree = raw.exactDegree;
  if (typeof raw.absoluteDegree === "number") out.absoluteDegree = raw.absoluteDegree;
  if (typeof raw.strength === "number") out.strength = raw.strength;
  if (typeof raw.activationStrength === "number") {
    out.activationStrength = raw.activationStrength;
  }
  if (typeof raw.dignity === "string") out.dignity = raw.dignity;
  if (typeof raw.element === "string") out.element = raw.element;
  if (typeof raw.planetaryRuler === "string") out.planetaryRuler = raw.planetaryRuler;
  if (typeof raw.sign === "string") out.sign = raw.sign;
  if (typeof raw.role === "string") out.role = raw.role;
  if (typeof raw.esmsBalance === "number") out.esmsBalance = raw.esmsBalance;
  if (isPlainObject(raw.config)) out.config = raw.config;
  const consciousness = parseConsciousnessState(raw.consciousnessState);
  if (consciousness) out.consciousnessState = consciousness;
  return out;
}

export function parseDegreeAgentResponse(raw: unknown): DegreeAgentStatus | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.active !== "boolean" || typeof raw.degree !== "number") {
    return null;
  }
  const out: DegreeAgentStatus = { active: raw.active, degree: raw.degree };
  const agent = parseActiveDegreeAgent(raw.agent);
  if (agent) out.agent = agent;
  if (typeof raw.message === "string") out.message = raw.message;
  return out;
}

export function parseDegreeActivationMap(raw: unknown): DegreeActivationMap {
  if (!isPlainObject(raw)) return {};
  const out: DegreeActivationMap = {};
  for (const [k, v] of Object.entries(raw)) {
    const deg = Number(k);
    if (!Number.isInteger(deg) || deg < 0 || deg > 359) continue;
    const agent = parseActiveDegreeAgent(v);
    if (agent) out[deg] = agent;
  }
  return out;
}

function parseNestedAgent(
  raw: unknown,
): DegreeActivationItem["agent"] | undefined {
  if (!isPlainObject(raw)) return undefined;
  const nested: NonNullable<DegreeActivationItem["agent"]> = {};
  if (typeof raw.id === "string") nested.id = raw.id;
  if (typeof raw.name === "string") nested.name = raw.name;
  if (typeof raw.description === "string") nested.description = raw.description;
  return nested;
}

function parseDegreeActivationItem(raw: unknown): DegreeActivationItem | null {
  if (!isPlainObject(raw)) return null;
  const out: DegreeActivationItem = {};
  if (typeof raw.id === "string") out.id = raw.id;
  if (typeof raw.name === "string") out.name = raw.name;
  if (typeof raw.description === "string") out.description = raw.description;
  if (typeof raw.exactDegree === "number") out.exactDegree = raw.exactDegree;
  if (typeof raw.absoluteDegree === "number") out.absoluteDegree = raw.absoluteDegree;
  if (typeof raw.strength === "number") out.strength = raw.strength;
  if (typeof raw.activationStrength === "number") {
    out.activationStrength = raw.activationStrength;
  }
  if (typeof raw.dignity === "string") out.dignity = raw.dignity;
  if (typeof raw.element === "string") out.element = raw.element;
  if (typeof raw.planetaryRuler === "string") out.planetaryRuler = raw.planetaryRuler;
  if (typeof raw.sign === "string") out.sign = raw.sign;
  if (typeof raw.role === "string") out.role = raw.role;
  if (typeof raw.esmsBalance === "number") out.esmsBalance = raw.esmsBalance;
  if (isPlainObject(raw.config)) out.config = raw.config;
  const consciousness = parseConsciousnessState(raw.consciousnessState);
  if (consciousness) out.consciousnessState = consciousness;
  const nested = parseNestedAgent(raw.agent);
  if (nested) out.agent = nested;
  return out;
}

export function parseActivationsResponse(raw: unknown): DegreeActivationItem[] {
  if (!isPlainObject(raw) || !Array.isArray(raw.activations)) return [];
  return raw.activations
    .map(parseDegreeActivationItem)
    .filter((item): item is DegreeActivationItem => item !== null);
}

export function parseJsonRecord(raw: unknown): Record<string, unknown> | null {
  return isPlainObject(raw) ? raw : null;
}

export async function fetchAgentForDegree(
  degree: number,
  date?: Date,
): Promise<DegreeAgentStatus | null> {
  if (typeof window === "undefined") {
    try {
      return await planetaryAgentsGateway.fetchAgentForDegree(degree, date ?? new Date());
    } catch (err) {
      _logger.error(`Failed to fetch agent for degree ${degree} on server:`, err);
      return null;
    }
  }

  try {
    const dateQuery = date ? `?date=${encodeURIComponent(date.toISOString())}` : "";
    const res = await fetch(`/api/agents/degree/${degree}${dateQuery}`);
    if (!res.ok) return null;
    return await readJson(res, { parse: parseDegreeAgentResponse });
  } catch (error) {
    _logger.error("Failed to fetch agent for degree:", error);
    return null;
  }
}

export async function fetchAllDegreeAgents(date?: Date): Promise<DegreeActivationMap> {
  if (typeof window === "undefined") {
    try {
      const res = await planetaryAgentsGateway.fetchDegreesMap(date ?? new Date());
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
    return await readJson(res, { parse: parseDegreeActivationMap });
  } catch (error) {
    _logger.error("Failed to fetch all degree agents:", error);
    return {};
  }
}

export async function fetchAgentsForDate(
  date: Date = new Date(),
  limit = 20,
): Promise<DegreeActivationItem[]> {
  if (typeof window === "undefined") {
    try {
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
    return await readJson(res, { parse: parseActivationsResponse });
  } catch (error) {
    _logger.error("Failed to fetch agents for date:", error);
    return [];
  }
}

export async function fetchAgentReactions(
  context: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${PLANETARY_AGENTS_URL}/api/agents/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });
    if (!res.ok) return null;
    return await readJson(res, { parse: parseJsonRecord });
  } catch (error) {
    _logger.error("Failed to fetch agent reactions:", error);
    return null;
  }
}
