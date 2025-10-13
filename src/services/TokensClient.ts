import { getCurrentAlchemicalState } from '@/services/RealAlchemizeService';
import type { ElementalProperties } from '@/types/celestial';

export interface TokenRatesInput {
  // Option 1: Provide current moment data
  datetime?: Date,
  location?: { latitude: number, longitude: number }
  // Option 2: Provide elemental/ESMS directly
  elemental?: ElementalProperties,
  esms?: { Spirit: number, Essence: number, Matter: number, Substance: number }
  // Option 3: Provide planetary positions
  planetaryPositions?: Record<string, { sign: string, degree: number, minute?: number, isRetrograde?: boolean }>
}

export interface TokenRatesResult {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number,
  kalchm: number,
  monica: number,
  // Additional backend metrics
  projections?: {
    nextHour: { Spirit: number, Essence: number, Matter: number, Substance: number },
    nextDay: { Spirit: number, Essence: number, Matter: number, Substance: number }
  }
  harmonicAnalysis?: {
    dominantFrequency: number,
    resonanceStrength: number,
    stabilityIndex: number
  }
  marketPhase?: 'accumulation' | 'distribution' | 'trending' | 'consolidation'
  volatilityIndex?: number,
  upcomingEvents?: Array<{
    timestamp: string,
    type: 'planetary_transition' | 'lunar_phase' | 'aspect_formation'
    impact: 'low' | 'medium' | 'high'
    description: string
  }>
}

function computeTokensFromAlchemical(alchemicalResult: any): TokenRatesResult {
  const esms = (alchemicalResult && typeof alchemicalResult === 'object');
    ? (alchemicalResult as Record<string, any>).esms
    : undefined,

  const Spirit = typeof esms?.Spirit === 'number' ? esms.Spirit : 0.5,
  const Essence = typeof esms?.Essence === 'number' ? esms.Essence : 0.5,
  const Matter = typeof esms?.Matter === 'number' ? esms.Matter : 0.5,
  const Substance = typeof esms?.Substance === 'number' ? esms.Substance : 0.5,

  return {
    Spirit,
    Essence,
    Matter,
    Substance,
    kalchm: typeof alchemicalResult?.kalchm === 'number' ? alchemicalResult.kalchm : 1.0,
    monica: typeof alchemicalResult?.monica === 'number' ? alchemicalResult.monica : 1.0;
  }
}

/**
 * Env flags required (set in .env.local):
 * - NEXT_PUBLIC_BACKEND_URL: e.g., http: //localhost:8000
 * - NEXT_PUBLIC_TOKENS_BACKEND: 'true' to enable backend-first calls
 */
export class TokensClient {
  private readonly backendUrl: string | undefined,
  private readonly useBackend: boolean,

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL,
    this.useBackend = String(process.env.NEXT_PUBLIC_TOKENS_BACKEND).toLowerCase() === 'true',
  }

  async calculateRates(input: TokenRatesInput = {}): Promise<TokenRatesResult> {
    // 1) Backend-first using centralized API client
    if (this.useBackend && this.backendUrl) {
      try {
        const request: TokenRatesRequest = {
          datetime: input.datetime?.toISOString(),
          location: input.location,
          elemental: input.elemental,
          esms: input.esms
        }

        const result = await alchmAPI.calculateTokenRates(request);
        logger.debug('TokensClient', 'Backend calculation successful', result)
        return result;
      } catch (error) {
        logger.warn('TokensClient', 'Backend calculation failed, falling back to local', error)
        // Fall through to local
      }
    }

    // 2) Local fallback using RealAlchemizeService
    const alchemicalResult = getCurrentAlchemicalState()
    return computeTokensFromAlchemical(alchemicalResult);
  }
}

export const tokensClient = new TokensClient()
;