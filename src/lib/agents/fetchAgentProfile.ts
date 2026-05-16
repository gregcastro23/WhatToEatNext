import type { CraftedAgentProfile } from "./craftedAgentTypes";

const AGENTS_BASE_URL =
  process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL || "https://agents.alchm.kitchen";

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
