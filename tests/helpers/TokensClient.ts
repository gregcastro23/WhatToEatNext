import { calculateKalchm } from "@/data/unified/alchemicalCalculations";
import { alchmAPI, type TokenRatesRequest } from "@/lib/api/alchm-client";
import { _logger as logger } from "@/lib/logger";
import {
  getCurrentAlchemicalState,
  type StandardizedAlchemicalResult,
} from "@/services/RealAlchemizeService";
import type { ElementalProperties } from "@/types/celestial";

export interface TokenRatesInput {
  // Option 1: Provide current moment data
  datetime?: Date;
  location?: { latitude: number; longitude: number };
  // Option 2: Provide elemental/ESMS directly
  elemental?: ElementalProperties;
  esms?: { Spirit: number; Essence: number; Matter: number; Substance: number };
  // Option 3: Provide planetary positions
  planetaryPositions?: Record<
    string,
    { sign: string; degree: number; minute?: number; isRetrograde?: boolean }
  >;
}

export interface TokenRatesResult {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  kalchm: number;
  /** null when the source had no elemental input — see alchm-client.ts. */
  monica: number | null;
  // Additional backend metrics
  projections?: {
    nextHour: {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    };
    nextDay: {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    };
  };
  harmonicAnalysis?: {
    dominantFrequency: number;
    resonanceStrength: number;
    stabilityIndex: number;
  };
  marketPhase?: "accumulation" | "distribution" | "trending" | "consolidation";
  volatilityIndex?: number;
  upcomingEvents?: Array<{
    timestamp: string;
    type: "planetary_transition" | "lunar_phase" | "aspect_formation";
    impact: "low" | "medium" | "high";
    description: string;
  }>;
}

/**
 * Map the canonical engine's result onto the token-rate shape.
 *
 * ── Why this takes a TYPE and not `unknown` ─────────────────────────────────
 *
 * It used to take `unknown`, narrow each field with `typeof x === "number"`, and
 * substitute a literal when the narrowing failed — `0.5` for each ESMS axis and
 * `1.0` for kalchm. Those are fabricated quantities: downstream, an invented
 * 0.5 is indistinguishable from a measured one. (`0.5` is also the same magic
 * number agent registration once wrote into `monicaConstant`.)
 *
 * The substitutions were also unreachable. The sole caller passes
 * `getCurrentAlchemicalState()`, whose `StandardizedAlchemicalResult` declares
 * `esms` (all four axes), `kalchm` and `monica` as required numbers.
 * `[MEASURED 2026-07-26]` calling it returns
 * `esms {3.8914, 5.2642, 1.8918, 1.1930}`, `kalchm 300875.5648`,
 * `monica 0.02208` — no branch fires.
 *
 * So the guards defended nothing and the literals could only ever mislead. The
 * parameter is typed instead: absence is now impossible by construction rather
 * than papered over at runtime.
 *
 * The path where absence CAN arise is the backend one, which casts an unvalidated
 * JSON body to `TokenRatesResult`. That is handled in `calculateRates` below.
 */
function computeTokensFromAlchemical(
  alchemicalResult: StandardizedAlchemicalResult,
): TokenRatesResult {
  const { Spirit, Essence, Matter, Substance } = alchemicalResult.esms;
  return {
    Spirit,
    Essence,
    Matter,
    Substance,
    kalchm: alchemicalResult.kalchm,
    monica: alchemicalResult.monica,
  };
}

/** The fields a token-rate response must carry to be usable at all. */
const REQUIRED_RATE_FIELDS = [
  "Spirit",
  "Essence",
  "Matter",
  "Substance",
] as const;

/**
 * Validate a backend token-rate response instead of trusting the cast.
 *
 * `AlchmAPIClient.request` ends in `response.json() as Promise<TResponse>` — a
 * bare assertion over an unvalidated body. If the server omits an axis, the
 * caller holds `undefined` while the type says `number`, and it renders as one.
 *
 * Returns null when the body is unusable, which the caller treats exactly like a
 * thrown request: fall through to the local engine. That is strictly better than
 * either a fabricated literal (invents data) or a half-populated object (lies in
 * the type) — the local path produces a real, complete answer.
 *
 * `monica` is deliberately NOT required. The backend returns `monica: null` by
 * design when it has no elemental input, because monica needs elements, elements
 * come from signs, and a planetary hour names no sign.
 *
 * `kalchm` is also not required, because it is RECOVERABLE: it is a function of
 * the four ESMS axes alone, so when the axes are present it is recomputed with
 * the canonical engine rather than defaulted. Deriving it is not inventing it.
 */
function validateRateResponse(value: unknown): TokenRatesResult | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  for (const field of REQUIRED_RATE_FIELDS) {
    if (typeof raw[field] !== "number" || !Number.isFinite(raw[field])) {
      return null;
    }
  }
  const Spirit = raw.Spirit as number;
  const Essence = raw.Essence as number;
  const Matter = raw.Matter as number;
  const Substance = raw.Substance as number;

  return {
    ...raw,
    Spirit,
    Essence,
    Matter,
    Substance,
    kalchm:
      typeof raw.kalchm === "number" && Number.isFinite(raw.kalchm)
        ? raw.kalchm
        : calculateKalchm({ Spirit, Essence, Matter, Substance }),
    monica:
      typeof raw.monica === "number" && Number.isFinite(raw.monica)
        ? raw.monica
        : null,
  };
}

/**
 * Env flags required (set in .env.local):
 * - NEXT_PUBLIC_BACKEND_URL: e.g., http: //localhost:8000
 * - NEXT_PUBLIC_TOKENS_BACKEND: 'true' to enable backend-first calls
 */
export class TokensClient {
  private readonly backendUrl: string | undefined;
  private readonly useBackend: boolean;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    this.useBackend =
      String(process.env.NEXT_PUBLIC_TOKENS_BACKEND).toLowerCase() === "true";
  }

  async calculateRates(input: TokenRatesInput = {}): Promise<TokenRatesResult> {
    // 1) Backend-first using centralized API client
    if (this.useBackend && this.backendUrl) {
      try {
        const request: TokenRatesRequest = {
          datetime: input.datetime?.toISOString(),
          location: input.location,
          elemental: input.elemental,
          esms: input.esms,
        };

        const raw = await alchmAPI.calculateTokenRates(request);
        const result = validateRateResponse(raw);
        if (!result) {
          // A body that does not carry the four axes is unusable. Falling
          // through to the local engine yields a real, complete answer;
          // returning the object anyway would hand callers `undefined` typed
          // as `number`, which renders as one.
          void logger.warn(
            "TokensClient: Backend token rates missing required ESMS axes, falling back to local",
            raw,
          );
        } else {
          void logger.debug(
            "TokensClient: Backend calculation successful",
            result,
          );
          return result;
        }
      } catch (error) {
        void logger.warn(
          "TokensClient: Backend calculation failed, falling back to local",
          error,
        );
        // Fall through to local
      }
    }

    // 2) Local fallback using RealAlchemizeService
    const alchemicalResult = getCurrentAlchemicalState();
    return computeTokensFromAlchemical(alchemicalResult);
  }
}

export const tokensClient = new TokensClient();
