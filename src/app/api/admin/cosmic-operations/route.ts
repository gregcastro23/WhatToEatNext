import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import {
  getCosmicOperationsSummary,
  reconcileExpiredCosmicOperations,
} from "@/lib/cooking/cosmicOperationReconciler";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GetQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const SweepBodySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  dryRun: z.boolean().optional(),
});

async function handleGet(request: NextRequest): Promise<Response> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const parsed = GetQuerySchema.safeParse({
    limit: searchParams.get("limit") ?? "25",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid query parameters" },
      { status: 400 },
    );
  }

  try {
    const summary = await getCosmicOperationsSummary(parsed.data.limit);
    return NextResponse.json(summary);
  } catch (error) {
    _logger.error("[api/admin/cosmic-operations] failed to query cosmic ops:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cosmic generation operation diagnostics are currently unavailable",
      },
      { status: 503 },
    );
  }
}

async function handlePost(request: NextRequest): Promise<Response> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const rawBody: unknown = await request.json().catch(() => ({}));
  const parsed = SweepBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const outcome = await reconcileExpiredCosmicOperations({
      ...(parsed.data.limit !== undefined ? { limit: parsed.data.limit } : {}),
      ...(parsed.data.dryRun !== undefined ? { dryRun: parsed.data.dryRun } : {}),
    });
    return NextResponse.json(outcome);
  } catch (error) {
    _logger.error("[api/admin/cosmic-operations] failed to sweep cosmic ops:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to reconcile expired cosmic generation operations",
      },
      { status: 503 },
    );
  }
}

export const GET = withObservability(
  { routeName: "/api/admin/cosmic-operations" },
  handleGet,
);

export const POST = withObservability(
  { routeName: "/api/admin/cosmic-operations" },
  handlePost,
);

