import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import {
  listZeroResultSearchGaps,
  resolveZeroResultSearchGap,
} from "@/lib/search/searchGaps";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  includeResolved: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

const ResolveBodySchema = z.object({
  normalizedQuery: z.string().trim().min(3).max(64),
  resolvedEntitySlug: z.string().trim().min(1).max(120).nullable().optional(),
  action: z.enum(["resolve", "reopen", "queue_cosmic_recipe"]).optional(),
});

function buildCosmicRecipeSlug(normalizedQuery: string): string {
  const slug = normalizedQuery
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `cosmic-recipe:${slug || "generated"}`;
}

async function handleGet(request: NextRequest): Promise<Response> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    limit: searchParams.get("limit") ?? "30",
    includeResolved: searchParams.get("includeResolved") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid query parameters" },
      { status: 400 },
    );
  }

  try {
    const summary = await listZeroResultSearchGaps({
      limit: parsed.data.limit,
      includeResolved: parsed.data.includeResolved,
    });
    return NextResponse.json(summary);
  } catch (error) {
    _logger.error("[api/admin/search-gaps] failed to query search gaps:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search gap telemetry is currently unavailable",
      },
      { status: 503 },
    );
  }
}

function resolveEffectiveActionAndSlug(data: z.infer<typeof ResolveBodySchema>): {
  action: "resolve" | "reopen" | "queue_cosmic_recipe";
  effectiveSlug: string | null;
} {
  const action = data.action ?? (data.resolvedEntitySlug ? "resolve" : "reopen");
  const effectiveSlug =
    action === "reopen"
      ? null
      : action === "queue_cosmic_recipe"
        ? (data.resolvedEntitySlug ?? buildCosmicRecipeSlug(data.normalizedQuery))
        : (data.resolvedEntitySlug ?? null);
  return { action, effectiveSlug };
}

async function handlePatch(request: NextRequest): Promise<Response> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const rawBody: unknown = await request.json().catch(() => null);
  const parsed = ResolveBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { action, effectiveSlug } = resolveEffectiveActionAndSlug(parsed.data);
  if (action === "resolve" && !effectiveSlug) {
    return NextResponse.json(
      { success: false, error: "resolvedEntitySlug is required when resolving a search gap" },
      { status: 400 },
    );
  }

  try {
    const updated = await resolveZeroResultSearchGap(parsed.data.normalizedQuery, effectiveSlug);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Search gap not found" }, { status: 404 });
    }
    const q = encodeURIComponent(parsed.data.normalizedQuery);
    const generationHref =
      action === "queue_cosmic_recipe" ? `/recipe-generator?prompt=${q}&fromGap=${q}` : null;
    return NextResponse.json({
      success: true,
      action,
      normalizedQuery: parsed.data.normalizedQuery,
      resolvedEntitySlug: effectiveSlug,
      generationHref,
    });
  } catch (error) {
    _logger.error("[api/admin/search-gaps] failed to update search gap:", error);
    return NextResponse.json({ success: false, error: "Unable to update search gap" }, { status: 503 });
  }
}

export const GET = withObservability(
  { routeName: "/api/admin/search-gaps" },
  handleGet,
);

export const PATCH = withObservability(
  { routeName: "/api/admin/search-gaps" },
  handlePatch,
);

