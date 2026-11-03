import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import {
  RecipeRecommendationRequestSchema,
  type RecipeRecommendationRequest,
} from "@/lib/validation/recipeRecommendationRequest";

/**
 * The Python backend, named the way the sibling routes name it (BACKEND_URL, then
 * NEXT_PUBLIC_BACKEND_URL). There is deliberately no fallback to this deployment's own URL
 * (VERCEL_URL): the endpoint called below is this route's own path, so a missing variable made it
 * POST to itself, and every hop re-validated and forwarded the same body until the function timed
 * out. Only local development has a default.
 */
function backendBaseUrl(): string | undefined {
  const configured = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
  if (configured) return configured;
  return process.env.NODE_ENV === "development" ? "http://localhost:8001" : undefined;
}

/** The client gives up after 10 s (fetchAstrologicalRecipes); stop waiting for the backend sooner. */
const BACKEND_TIMEOUT_MS = 8000;

async function forwardToBackend(chartRequest: RecipeRecommendationRequest): Promise<NextResponse> {
  const baseUrl = backendBaseUrl();
  if (!baseUrl) {
    _logger.error("Recipe recommendations: neither BACKEND_URL nor NEXT_PUBLIC_BACKEND_URL is set");
    return NextResponse.json({ message: "Recipe recommendations are not available" }, { status: 503 });
  }

  const backendResponse = await fetch(`${baseUrl}/api/astrological/recipe-recommendations-by-chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chartRequest),
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });

  if (!backendResponse.ok) {
    // The backend's error body can carry SQL text, bound parameters and host names: it goes to
    // the log, and the browser gets a fixed message with the status.
    const errorData: unknown = await backendResponse.json().catch(() => ({ message: backendResponse.statusText }));
    _logger.error(`Recipe recommendations backend answered ${backendResponse.status}`, errorData);
    return NextResponse.json(
      { message: "Failed to fetch recipe recommendations from backend" },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(await backendResponse.json());
}

function failureResponse(error: unknown): NextResponse {
  if (error instanceof Error && error.name === "TimeoutError") {
    _logger.error("Recipe recommendations backend did not answer in time");
    return NextResponse.json({ message: "The recommendations backend did not answer in time" }, { status: 504 });
  }
  // error.message can name the backend's address (connect ECONNREFUSED ...): log it, do not send it.
  _logger.error("Error in recipe recommendations API route:", error);
  return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const rawBody: unknown = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
    }

    const parsed = RecipeRecommendationRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid chart payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return await forwardToBackend(parsed.data);
  } catch (error) {
    return failureResponse(error);
  }
}
