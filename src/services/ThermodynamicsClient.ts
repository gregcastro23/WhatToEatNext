import { ThermodynamicCalculator } from '@/lib/ThermodynamicCalculator';
import { calculateAlchemicalProperties, getCurrentAlchemicalState } from '@/services/RealAlchemizeService';
import type { ElementalProperties } from '@/types/celestial';

export interface ESMSProperties {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number
}

export interface ThermodynamicsInput {
  // Option 1: Provide elemental and ESMS directly
  elemental?: ElementalProperties,
  esms?: ESMSProperties,
  // Option 2: Provide ingredients for calculator fallback
  ingredients?: unknown[],
  // Option 3: Provide planetary positions to compute via RealAlchemizeService locally
  planetaryPositions?: Record<string, { sign: string, degree: number, minute?: number, isRetrograde?: boolean }>
}

export interface ThermodynamicsResult {
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number
}

function computeFromElemental(elemental: ElementalProperties, esms: ESMSProperties): ThermodynamicsResult {
  const Spirit = Number(esms.Spirit) || 0;
  const Essence = Number(esms.Essence) || 0;
  const Matter = Number(esms.Matter) || 0;
  const Substance = Number(esms.Substance) || 0;
  const Fire = Number(elemental.Fire) || 0;
  const Water = Number(elemental.Water) || 0;
  const Air = Number(elemental.Air) || 0;
  const Earth = Number(elemental.Earth) || 0;

  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
  const heat = heatNum / (heatDen || 1);

  const entropyNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / (entropyDen || 1);

  const reactivityNum =
    Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Essence, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = reactivityNum / (reactivityDen || 1);

  const gregsEnergy = heat - entropy * reactivity;

  return { heat, entropy, reactivity, gregsEnergy };
}

/**
 * Env flags required (set in .env.local):
 * - NEXT_PUBLIC_BACKEND_URL: e.g., http://localhost:8000
 * - NEXT_PUBLIC_THERMODYNAMICS_BACKEND: 'true' to enable backend-first calls
 */
export class ThermodynamicsClient {
  private readonly backendUrl: string | undefined;
  private readonly useBackend: boolean;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    this.useBackend = String(process.env.NEXT_PUBLIC_THERMODYNAMICS_BACKEND).toLowerCase() === 'true';
  }

  async calculate(input: ThermodynamicsInput): Promise<ThermodynamicsResult> {
    // 1) Backend-first
    if (this.useBackend && this.backendUrl) {
      try {
        const url = new URL('/api/thermodynamics/calculate', this.backendUrl);
        const res = await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        const data = (await res.json()) as Partial<ThermodynamicsResult>;
        if (
          typeof data.heat === 'number' &&
          typeof data.entropy === 'number' &&
          typeof data.reactivity === 'number' &&
          typeof data.gregsEnergy === 'number'
        ) {
          return {
            heat: data.heat,
            entropy: data.entropy,
            reactivity: data.reactivity,
            gregsEnergy: data.gregsEnergy
          };
        }
      } catch (_error) {
        // Fall through to local
      }
    }

    // 2) Local fallbacks in order of fidelity
    // 2a) If planetary positions are provided, use RealAlchemizeService
    if (input.planetaryPositions && Object.keys(input.planetaryPositions).length > 0) {
      const result = calculateAlchemicalProperties(input.planetaryPositions as any);
      const t = result.thermodynamicProperties;
      return { heat: t.heat, entropy: t.entropy, reactivity: t.reactivity, gregsEnergy: t.gregsEnergy };
    }

    // 2b) If both elemental and ESMS provided, use exact formulas
    if (input.elemental && input.esms) {
      return computeFromElemental(input.elemental, input.esms);
    }

    // 2c) If ingredients provided, use ThermodynamicCalculator
    if (input.ingredients && input.ingredients.length > 0) {
      const calc = new ThermodynamicCalculator();
      const heat = calc.calculateHeatValue(input.ingredients);
      const entropy = calc.calculateEntropyValue(input.ingredients);
      const reactivity = calc.calculateReactivityValue(input.ingredients);
      const gregsEnergy = heat - entropy * reactivity;
      return { heat, entropy, reactivity, gregsEnergy };
    }

    // 2d) As a final real fallback, use current alchemical state (no placeholders)
    const current = getCurrentAlchemicalState();
    const t = current.thermodynamicProperties;
    return { heat: t.heat, entropy: t.entropy, reactivity: t.reactivity, gregsEnergy: t.gregsEnergy };
  }
}

export const thermodynamicsClient = new ThermodynamicsClient();
