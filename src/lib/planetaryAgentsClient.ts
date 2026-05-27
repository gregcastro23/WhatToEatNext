// src/lib/planetaryAgentsClient.ts

export const PLANETARY_AGENTS_URL = process.env.NEXT_PUBLIC_PLANETARY_AGENTS_URL || 'https://api.agents.alchm.kitchen';

export async function fetchAgentForDegree(degree: number) {
  try {
    const res = await fetch(`${PLANETARY_AGENTS_URL}/api/agents/degree/${degree}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch agent for degree:", error);
    return null;
  }
}

export async function fetchAllDegreeAgents() {
  try {
    const res = await fetch(`${PLANETARY_AGENTS_URL}/api/agents/degrees`);
    if (!res.ok) return {};
    return await res.json(); // { [degree]: Agent }
  } catch (error) {
    console.error("Failed to fetch all degree agents:", error);
    return {};
  }
}

export async function fetchAgentsForDate(date: Date) {
  try {
    const res = await fetch(`${PLANETARY_AGENTS_URL}/api/agents/activations?date=${date.toISOString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.activations || [];
  } catch (error) {
    console.error("Failed to fetch agents for date:", error);
    return [];
  }
}
export async function fetchAgentReactions(context: any) {
  try {
    const res = await fetch(`${PLANETARY_AGENTS_URL}/api/agents/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch agent reactions:", error);
    return null;
  }
}