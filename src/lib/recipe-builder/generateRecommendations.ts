/**
 * The Recipe Builder's one door to `POST /api/recommendations/generate`,
 * shared by the builder's Generate button and the page's quick-synthesis bar
 * so the two cannot drift: the same payload shape, the same free retry inside
 * the server's 5-minute timeout window, and the same status → outcome mapping.
 *
 * The body is validated, not asserted: an unreadable envelope is a failure,
 * and a recommendation missing a field the carousel reads is dropped.
 *
 * @file src/lib/recipe-builder/generateRecommendations.ts
 */
import { safeReadJson } from "@/lib/api/json";
import type { DayOfWeek } from "@/types/menuPlanner";
import type {
  AstrologicalState,
  RecommendedMeal,
  UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";

const ENDPOINT = "/api/recommendations/generate";

export const GENERATION_COST_COPY = "5 Spirit · 5 Essence";

const DAYS: readonly DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

/** Today's planetary day, read from the local clock. */
export function currentDayOfWeek(): DayOfWeek {
  return DAYS[new Date().getDay()] ?? 0;
}

export interface GenerationRequest {
  dayOfWeek: DayOfWeek;
  astroState: AstrologicalState;
  options: Record<string, unknown>;
}

export type GenerationFailureReason = "tokens" | "auth" | "timeout" | "failed";

export type GenerationOutcome =
  | { ok: true; recommendations: RecommendedMeal[] }
  | { ok: false; reason: GenerationFailureReason; message: string };

const FAILURE_COPY: Record<GenerationFailureReason, string> = {
  tokens: "Insufficient tokens. Each generation costs 5 Spirit + 5 Essence.",
  auth: "Please sign in to generate recipes.",
  timeout: "Generation timed out. Please retry.",
  failed: "Could not generate recipes right now. Please try again.",
};

/** The parts of the response envelope this client acts on. */
interface GenerateEnvelope {
  success: boolean;
  retryToken: string | null;
  recommendations: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The fields the suggestion carousel dereferences without a guard. */
export function isRecommendedMeal(value: unknown): value is RecommendedMeal {
  if (!isRecord(value) || !isRecord(value.recipe)) return false;
  return (
    typeof value.recipe.name === "string" &&
    typeof value.score === "number" &&
    typeof value.dayAlignment === "number" &&
    typeof value.planetaryAlignment === "number" &&
    Array.isArray(value.reasons)
  );
}

/** Hand-written rather than zod, so the page's first-load bundle does not carry a schema library. */
function parseEnvelope(value: unknown): GenerateEnvelope | null {
  if (!isRecord(value)) return null;
  const { success, retry, recommendations } = value;
  return {
    success: success === true,
    retryToken: isRecord(retry) && typeof retry.token === "string" ? retry.token : null,
    recommendations: Array.isArray(recommendations) ? recommendations : [],
  };
}

function failure(reason: GenerationFailureReason): GenerationOutcome {
  return { ok: false, reason, message: FAILURE_COPY[reason] };
}

function failureForStatus(status: number): GenerationOutcome {
  if (status === 402) return failure("tokens");
  if (status === 401) return failure("auth");
  if (status === 504) return failure("timeout");
  return failure("failed");
}

async function post(body: unknown): Promise<{ status: number; ok: boolean; envelope: GenerateEnvelope | null }> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const envelope = await safeReadJson<GenerateEnvelope | null>(res, null, parseEnvelope);
  return { status: res.status, ok: res.ok, envelope };
}

/**
 * Never rejects: a network error or unreadable body is a `failed` outcome.
 * A 504 carrying a retry token is retried once, free, with that token.
 */
export async function requestRecommendations(request: GenerationRequest): Promise<GenerationOutcome> {
  try {
    let response = await post(request);
    const retryToken = response.envelope?.retryToken;
    if (response.status === 504 && retryToken) {
      response = await post({ ...request, retryToken });
    }
    if (!response.ok || response.envelope?.success !== true) {
      return failureForStatus(response.ok ? 500 : response.status);
    }
    return { ok: true, recommendations: response.envelope.recommendations.filter(isRecommendedMeal) };
  } catch {
    return failure("failed");
  }
}

/** Opens what fixes the failure: the token shop for 402, sign-in for 401. */
export function openFailureRemedy(outcome: GenerationOutcome): void {
  if (outcome.ok || typeof window === "undefined") return;
  if (outcome.reason === "tokens") window.dispatchEvent(new Event("open-token-shop"));
  if (outcome.reason === "auth") window.dispatchEvent(new Event("open-signin-modal"));
}

interface AstroSource {
  currentZodiac: string;
  lunarPhase: AstrologicalState["lunarPhase"];
  activePlanets: string[];
  domElements: AstrologicalState["domElements"];
  currentPlanetaryHour: string | null;
}

export function toRequestAstroState(astro: AstroSource): AstrologicalState {
  return {
    currentZodiac: astro.currentZodiac,
    lunarPhase: astro.lunarPhase,
    activePlanets: astro.activePlanets,
    domElements: astro.domElements,
    ...(astro.currentPlanetaryHour ? { currentPlanetaryHour: astro.currentPlanetaryHour } : {}),
  };
}

interface PersonalizationSource {
  natalChart?: UserPersonalizationContext["natalChart"];
  stats?: UserPersonalizationContext["stats"];
}

/** Undefined without a natal chart; the server rebuilds it from the stored profile either way. */
export function toUserContext(
  user: PersonalizationSource | null,
): UserPersonalizationContext | undefined {
  if (!user?.natalChart) return undefined;
  return {
    natalChart: user.natalChart,
    prioritizeHarmony: true,
    ...(user.stats ? { stats: user.stats } : {}),
  };
}
