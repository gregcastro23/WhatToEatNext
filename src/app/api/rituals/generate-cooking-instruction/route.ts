/**
 * POST /api/rituals/generate-cooking-instruction
 * Generates an alchemical cooking ritual instruction, celestial transit alignment,
 * potency score, and ESMS quantities for the recipe ritual modal.
 */

import { NextResponse } from "next/server";
import { getCurrentAlchemicalState } from "@/services/RealAlchemizeService";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RITUAL_INSTRUCTIONS_BY_ELEMENT: Record<string, string[]> = {
  Fire: [
    "Channel radiant heat with focused intention; sear and caramelize to awaken solar dynamism and invigorating warmth.",
    "Ignite the culinary flame with deliberate mindfulness; allow high-heat transformation to release bold aromatic vitality.",
    "Work with vibrant flame and rapid agitation; seal the vital essence swiftly to preserve inner spirited moisture.",
  ],
  Water: [
    "Embrace fluid cohesion; simmer gently and let the aromatics infuse with lunar clarity and emotional depth.",
    "Allow the ingredients to merge seamlessly in gentle liquid resonance; stir clockwise to harmonize subtle oceanic notes.",
    "Nurture a quiet, patient poaching or gentle braise; let moisture dissolve tension and yield restorative richness.",
  ],
  Air: [
    "Infuse lightness and breath; toss and aerate fresh ingredients under mercurial inspiration and aromatic lift.",
    "Emphasize quick, fragrant whisking and delicate steam; invite citrus and volatile oils to rise through the palate.",
    "Cultivate vibrant lightness; layer crisp textures and aromatic herbal accents with breezy culinary precision.",
  ],
  Earth: [
    "Ground the flavours deeply; slow-roast and anchor rich earth roots with saturnian patience and mineral depth.",
    "Embrace patient caramelization and slow braising; let hearty textures absorb nourishing, grounding sustenance.",
    "Anchor the preparation with deliberate, measured pacing; allow dense root essences to harmonize in steady, deep heat.",
  ],
};

const RITUAL_INSTRUCTIONS_BY_PLANET: Record<string, string> = {
  Sun: "Harness the apex solar fire: illuminate the dish with vibrant golden searing and joyful culinary presence.",
  Moon: "Honor lunar tides: balance delicate broths and tender essences with gentle, mindful steaming or simmering.",
  Mars: "Harness martial spice and pungent heat: sear decisively and let crisp, bold vitality lead the transformation.",
  Venus: "Invoke venereal harmony: balance sweet and savoury harmonies with velvety emulsions and luscious texture.",
  Mercury: "Express mercurial agility: combine quick knife-work, bright acid accents, and lively herbs in swift harmony.",
  Jupiter: "Celebrate jovial abundance: generously layer warming spices and rich braises to magnify communal vitality.",
  Saturn: "Engage saturnian endurance: slow-cook, ferment, or deeply reduce to distill patient culinary mastery.",
};

const PLANET_CANDIDATES = ["Sun", "Moon", "Mars", "Venus", "Mercury", "Jupiter", "Saturn"];

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      recipe_id?: string;
    };
    const now = new Date();
    const alchemicalState = getCurrentAlchemicalState();
    const positions = getAccuratePlanetaryPositions(now);

    // Identify dominant planet / transit
    let dominantTransit = "Sun";
    let maxMomentum = -Infinity;

    for (const planet of PLANET_CANDIDATES) {
      const momentum = Math.abs(alchemicalState.planetaryMomentum?.[planet] ?? 0);
      if (momentum > maxMomentum) {
        maxMomentum = momentum;
        dominantTransit = planet;
      }
    }

    if (maxMomentum === 0 && positions.Sun) {
      dominantTransit = alchemicalState.metadata.isDiurnal ? "Sun" : "Moon";
    }

    const { dominantElement } = alchemicalState.metadata;
    const elementInstructions = RITUAL_INSTRUCTIONS_BY_ELEMENT[dominantElement] ?? RITUAL_INSTRUCTIONS_BY_ELEMENT.Fire;
    const elementInstruction = elementInstructions[now.getDate() % elementInstructions.length];
    const planetInstruction = RITUAL_INSTRUCTIONS_BY_PLANET[dominantTransit] ?? RITUAL_INSTRUCTIONS_BY_PLANET.Sun;

    const ritualInstruction = `${planetInstruction} ${elementInstruction}`;

    // Total Potency score (scaled to intuitive 70 - 99 scale)
    const baseEnergy = (alchemicalState.esms.Spirit + alchemicalState.esms.Essence + alchemicalState.esms.Matter + alchemicalState.esms.Substance) / 4;
    const potencyPercent = Math.min(99, Math.max(65, Math.round(75 + baseEnergy * 15 + alchemicalState.score * 10)));

    return NextResponse.json({
      success: true,
      recipe_id: body.recipe_id ?? null,
      ritual_instruction: ritualInstruction,
      dominant_transit: dominantTransit,
      total_potency_score: potencyPercent,
      alchemical_quantities: {
        spirit_score: Number(alchemicalState.esms.Spirit.toFixed(2)),
        essence_score: Number(alchemicalState.esms.Essence.toFixed(2)),
        matter_score: Number(alchemicalState.esms.Matter.toFixed(2)),
        substance_score: Number(alchemicalState.esms.Substance.toFixed(2)),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        ritual_instruction: "Cook with mindfulness, intention, and gratitude for the nourishment before you.",
        dominant_transit: null,
        total_potency_score: 75,
        alchemical_quantities: {
          spirit_score: 1.0,
          essence_score: 1.0,
          matter_score: 1.0,
          substance_score: 1.0,
        },
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 },
    );
  }
}
