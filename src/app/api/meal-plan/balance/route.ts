import { NextResponse } from "next/server";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { ElementalProperties, Recipe } from "@/types/recipe";

export const dynamic = "force-dynamic";

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
type Element = (typeof ELEMENTS)[number];

function normalize(e: Partial<ElementalProperties> | undefined): Record<Element, number> {
  const fire = Number(e?.Fire ?? 0);
  const water = Number(e?.Water ?? 0);
  const earth = Number(e?.Earth ?? 0);
  const air = Number(e?.Air ?? 0);
  const sum = fire + water + earth + air;
  if (sum <= 0) return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  return { Fire: fire / sum, Water: water / sum, Earth: earth / sum, Air: air / sum };
}

function cosineSimilarity(a: Record<Element, number>, b: Record<Element, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const el of ELEMENTS) {
    dot += a[el] * b[el];
    na += a[el] * a[el];
    nb += b[el] * b[el];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Compute the target elemental profile that would counterbalance `current`.
 * We don't "oppose" elements (no opposing elements principle); instead we lift
 * underrepresented elements so the week trends toward even distribution.
 */
function computeTargetProfile(current: Record<Element, number>): Record<Element, number> {
  const even = 0.25;
  const inverted: Record<Element, number> = {
    Fire: Math.max(0.05, even * 2 - current.Fire),
    Water: Math.max(0.05, even * 2 - current.Water),
    Earth: Math.max(0.05, even * 2 - current.Earth),
    Air: Math.max(0.05, even * 2 - current.Air),
  };
  const sum = inverted.Fire + inverted.Water + inverted.Earth + inverted.Air;
  return {
    Fire: inverted.Fire / sum,
    Water: inverted.Water / sum,
    Earth: inverted.Earth / sum,
    Air: inverted.Air / sum,
  };
}

interface BalanceBody {
  current?: Partial<ElementalProperties>;
  excludeRecipeIds?: string[];
  limit?: number;
}

export async function POST(request: Request) {
  try {
    const body: BalanceBody = await request.json().catch(() => ({}));
    const currentRaw = body.current ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    const current = normalize(currentRaw);
    const target = computeTargetProfile(current);
    const exclude = new Set(body.excludeRecipeIds ?? []);
    const limit = Math.max(1, Math.min(20, body.limit ?? 6));

    const service = UnifiedRecipeService.getInstance();
    const all = await service.getAllRecipes();

    const scored = all
      .filter((r: Recipe) => r.id && !exclude.has(r.id))
      .map((r: Recipe) => {
        const profile = normalize(r.elementalProperties);
        return {
          id: r.id,
          name: r.name,
          cuisine: r.cuisine ?? null,
          elementalProperties: profile,
          similarityToTarget: cosineSimilarity(profile, target),
        };
      })
      .sort((a, b) => b.similarityToTarget - a.similarityToTarget)
      .slice(0, limit);

    return NextResponse.json({
      current,
      target,
      suggestions: scored,
    });
  } catch (error) {
    console.error("[meal-plan/balance] error:", error);
    return NextResponse.json(
      { error: "Failed to compute balance suggestions" },
      { status: 500 },
    );
  }
}
