import type { CraftedAgentProfile } from "./craftedAgentTypes";

const AGENTS_BASE_URL =
  process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL || "https://agents.alchm.kitchen";

export interface AgentInteraction {
  id: string;
  kind: "agent_to_agent" | "agent_to_user";
  counterparty: {
    slug?: string;
    name: string;
    userId?: string;
  };
  topic: string;
  messagePreview: string;
  messageCount: number;
  startedAt: string;
  lastTurnAt: string;
  chatThread: string;
}

export interface AgentAction {
  id: string;
  type: string;
  createdAt: string;
  metadata: Record<string, any>;
  links: {
    chatThread?: string;
    recipe?: string;
  };
}

export interface AgentArtifact {
  id: string;
  kind: "recipe" | "lab_entry" | "insight";
  title: string;
  createdAt: string;
  summary: string;
  alchmKitchenPath?: string;
}

export function agentSlugFromEmail(email: string): string {
  return email.split("@")[0];
}

export async function fetchAgentProfile(
  slug: string,
): Promise<CraftedAgentProfile | null> {
  try {
    const res = await fetch(`${AGENTS_BASE_URL}/api/agents/${slug}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.agent ?? data ?? null) as CraftedAgentProfile | null;
  } catch {
    return null;
  }
}

export async function fetchAgentInteractions(
  slug: string,
): Promise<AgentInteraction[]> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }
    const res = await fetch(`${AGENTS_BASE_URL}/api/agents/${slug}/interactions`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.interactions ?? data ?? []) as AgentInteraction[];
  } catch {
    return [];
  }
}

export async function fetchAgentActions(
  slug: string,
): Promise<AgentAction[]> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }
    const res = await fetch(`${AGENTS_BASE_URL}/api/agents/${slug}/actions`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.actions ?? data ?? []) as AgentAction[];
  } catch {
    return [];
  }
}

export async function fetchAgentArtifacts(
  slug: string,
): Promise<AgentArtifact[]> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }
    const res = await fetch(`${AGENTS_BASE_URL}/api/agents/${slug}/artifacts`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.artifacts ?? data ?? []) as AgentArtifact[];
  } catch {
    return [];
  }
}
