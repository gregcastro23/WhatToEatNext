import { NextResponse } from "next/server";
import { PlanetaryHourCalculator } from "@/lib/PlanetaryHourCalculator";
import type { Planet } from "@/types/celestial";
import { PLANETARY_ALCHEMY } from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AlchemicalKey = "Spirit" | "Essence" | "Matter" | "Substance";

interface TransmutationRecommendation {
  date: string;
  time_range: string;
  ruling_planet: string;
  imbalance_to_address: string;
  recommendation_text: string;
  total_potency_score_multiplier: number;
}

interface AlchemicalScores {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

const DAY_RULERS: Planet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

const CHALDEAN_HOUR_ORDER: Planet[] = [
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
  "Saturn",
  "Jupiter",
  "Mars",
];

const WEAKNESS_LABELS: Record<AlchemicalKey, string> = {
  Spirit: "Spirit deficit",
  Essence: "Essence deficit",
  Matter: "Matter deficit",
  Substance: "Substance deficit",
};

const WEAKNESS_HINTS: Record<AlchemicalKey, string> = {
  Spirit: "uplift focus and conscious intent",
  Essence: "increase fluidity and harmonizing richness",
  Matter: "strengthen grounding and structural body",
  Substance: "improve adaptability, integration, and bind",
};

const PLANETARY_INGREDIENT_CUES: Partial<Record<Planet, string[]>> = {
  Sun: ["citrus zest", "saffron", "golden turmeric"],
  Moon: ["coconut milk", "cucumber", "white sesame"],
  Mars: ["red pepper flakes", "smoked paprika", "fresh ginger"],
  Mercury: ["fresh mint", "fennel seed", "lemon balm"],
  Jupiter: ["nutmeg", "clove", "star anise"],
  Venus: ["rose water", "vanilla bean", "strawberries"],
  Saturn: ["black sesame", "roasted mushrooms", "aged vinegar"],
  Uranus: ["shiso", "microgreens", "sumac"],
  Neptune: ["kombu", "sea salt", "dill"],
  Pluto: ["black garlic", "charred onion", "fermented chili paste"],
  Ascendant: ["mineral salt", "whole grain", "root vegetable"],
};

function normalizeScores(input: unknown): AlchemicalScores {
  const payload = (input || {}) as Record<string, unknown>;
  const spirit = Number(payload.spirit_score ?? payload.Spirit ?? 0);
  const essence = Number(payload.essence_score ?? payload.Essence ?? 0);
  const matter = Number(payload.matter_score ?? payload.Matter ?? 0);
  const substance = Number(payload.substance_score ?? payload.Substance ?? 0);

  return {
    Spirit: Number.isFinite(spirit) ? spirit : 0,
    Essence: Number.isFinite(essence) ? essence : 0,
    Matter: Number.isFinite(matter) ? matter : 0,
    Substance: Number.isFinite(substance) ? substance : 0,
  };
}

function normalizeLocation(
  payload: Record<string, unknown>,
): { latitude?: number; longitude?: number } {
  const latitude = Number(
    payload.latitude ?? payload.lat ?? (payload.location as any)?.latitude,
  );
  const longitude = Number(
    payload.longitude ?? payload.lng ?? (payload.location as any)?.longitude,
  );

  return {
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
  };
}

function getPlanetaryHourRuler(
  date: Date,
  location?: { latitude?: number; longitude?: number },
): Planet {
  if (
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number"
  ) {
    const calculator = new PlanetaryHourCalculator(
      location.latitude,
      location.longitude,
    );
    const current = calculator.getPlanetaryHour(date);
    if (current?.planet) return current.planet;
  }

  const dayPlanet = DAY_RULERS[date.getDay()] || "Sun";
  const startIndex = CHALDEAN_HOUR_ORDER.indexOf(dayPlanet);
  const hourIndex = (startIndex + date.getHours()) % CHALDEAN_HOUR_ORDER.length;
  return CHALDEAN_HOUR_ORDER[hourIndex] || "Sun";
}

function formatHourRange(date: Date): string {
  const start = new Date(date);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  const format = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return `${format(start)} - ${format(end)}`;
}

function getLowestKey(scores: AlchemicalScores): AlchemicalKey {
  return (Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] || "Substance") as AlchemicalKey;
}

function pickCue(planet: Planet, index: number): string {
  const cues =
    PLANETARY_INGREDIENT_CUES[planet] ||
    PLANETARY_INGREDIENT_CUES.Sun ||
    ["fresh herbs"];
  return cues[index % cues.length] || "fresh herbs";
}

function buildRecommendation(
  date: Date,
  planet: Planet,
  weakest: AlchemicalKey,
  index: number,
): TransmutationRecommendation {
  const planetAlchemy = PLANETARY_ALCHEMY[planet as keyof typeof PLANETARY_ALCHEMY] || {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };
  const directBoost = Number(planetAlchemy[weakest] || 0);
  const bridgesGap = directBoost > 0;
  const potencyMultiplier = directBoost >= 1 ? 1.25 : bridgesGap ? 1.15 : 1.05;

  const cue = pickCue(planet, index);
  const bridgeCopy = bridgesGap
    ? `This ${planet} hour directly reinforces ${weakest.toLowerCase()}.`
    : `This ${planet} hour boosts adjacent qualities while stabilizing ${weakest.toLowerCase()}.`;

  return {
    date: date.toISOString().split("T")[0],
    time_range: formatHourRange(date),
    ruling_planet: planet,
    imbalance_to_address: WEAKNESS_LABELS[weakest],
    recommendation_text: `${bridgeCopy} Add ${planet}-aligned ${cue} to ${WEAKNESS_HINTS[weakest]}.`,
    total_potency_score_multiplier: potencyMultiplier,
  };
}

async function getRecommendations(request: NextRequest): Promise<TransmutationRecommendation[]> {
  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const scores = normalizeScores((payload as any)?.alchemicalQuantities ?? payload);
  const location = normalizeLocation(payload);
  const weakest = getLowestKey(scores);

  const now = new Date();
  return Array.from({ length: 3 }).map((_, index) => {
    const target = new Date(now);
    target.setHours(now.getHours() + index);
    const ruler = getPlanetaryHourRuler(target, location);
    return buildRecommendation(target, ruler, weakest, index);
  });
}

export async function GET(request: NextRequest) {
  try {
    const recommendations = await getRecommendations(request);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("[transmutation_recommendations] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute transmutation recommendations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const recommendations = await getRecommendations(request);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("[transmutation_recommendations] POST failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute transmutation recommendations" },
      { status: 500 },
    );
  }
}
