import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import {
  AdaptationConflict,
  AdaptationUnavailable,
} from "@/lib/recipes/adaptationAgentBasis";
import {
  AdaptationRequestSchema,
  AdaptationSuccessSchema,
} from "@/lib/recipes/savedAdaptationSchemas";
import { createSavedAdaptation } from "@/lib/recipes/savedAdaptationService";
import type { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function rejection(error: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

async function authorize(request: NextRequest): Promise<string | NextResponse> {
  const requesterId = await getUserIdFromRequest(request);
  if (!requesterId)
    return rejection("Sign in to request a saved version.", 401);
  const limit = await rateLimit(request, {
    window: 60_000,
    max: 10,
    bucket: "recipe-adaptation",
    identifier: requesterId,
  });
  if (!limit.allowed)
    return NextResponse.json(
      {
        success: false,
        error: "Too many adaptation requests. Try again later.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) },
      },
    );
  return requesterId;
}

async function readRequest(
  request: NextRequest,
): Promise<z.infer<typeof AdaptationRequestSchema> | NextResponse> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return rejection("Invalid JSON body.", 400);
  }
  const parsed = AdaptationRequestSchema.safeParse(rawBody);
  return parsed.success
    ? parsed.data
    : rejection(
        "A supported agent, vegetarian mode and UUID request ID are required.",
        400,
      );
}

function failed(error: unknown): NextResponse {
  if (error instanceof AdaptationConflict) return rejection(error.message, 409);
  if (error instanceof AdaptationUnavailable)
    return rejection(error.message, 422);
  if (error instanceof ZodError)
    return rejection(
      "The adaptation proposal was malformed. No version was saved.",
      502,
    );
  return rejection(
    "Adaptation confirmation is unavailable. Retry the same request to check for a saved version.",
    503,
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
): Promise<NextResponse> {
  try {
    const requesterId = await authorize(request);
    if (requesterId instanceof NextResponse) return requesterId;
    const body = await readRequest(request);
    if (body instanceof NextResponse) return body;
    const { recipeId } = await params;
    return NextResponse.json(
      AdaptationSuccessSchema.parse(
        await createSavedAdaptation(requesterId, recipeId, body),
      ),
    );
  } catch (error) {
    return failed(error);
  }
}
