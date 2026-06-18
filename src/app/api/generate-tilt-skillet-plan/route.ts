/**
 * POST /api/generate-tilt-skillet-plan
 *
 * Thin proxy in front of the Planetary Agents backend's /api/tilt-skillet-plan endpoint —
 * the same proxy → PA pattern as /api/generate-cosmic-recipe. WTEN's job here:
 *   - Require an authenticated PREMIUM user (this is a premium-only tool; hard 402 otherwise).
 *   - Compute the deterministic recipe-as-a-circuit grounding from the staged ingredient list
 *     (computeBatchCircuit reuses the existing kinetics / Kalchm / Monica engine).
 *   - Forward the grounding + stages to PA, which owns the LLM persona, JSON mode, validation,
 *     retry, and cache.
 *   - Defensive Zod re-check of PA's response against tiltSkilletBatchSchema so schema drift
 *     surfaces at the WTEN edge.
 */
import { gateDemoOrAuth } from "@/lib/auth/demoAccess";
import { withObservability } from "@/lib/observability/withObservability";
import { getServiceUrl } from "@/lib/serviceUrls";
import { subscriptionService } from "@/services/subscriptionService";
import {
  tiltSkilletBatchSchema,
  tiltSkilletBodySchema,
} from "@/types/tiltSkilletSchema";
import { computeBatchCircuit, type BatchStageInput } from "@/utils/tiltSkilletCircuit";
import type { NextRequest } from "next/server";
import type { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handlePost(request: NextRequest) {
  // Premium-only: anonymous/demo users are turned away with a sign-in/upgrade nudge.
  const access = await gateDemoOrAuth(request, {
    dailyDemoQuota: 0,
    feature: "tilt skillet batch plan",
  });
  if (access.mode === "denied") return access.blocked;
  if (access.mode !== "auth") {
    return json(
      { error: "auth_required", message: "Please sign in to generate a batch plan." },
      401,
    );
  }

  const userId = access.userId;
  const sub = await subscriptionService.getUserSubscription(userId);
  if (sub?.tier !== "premium") {
    return json(
      {
        error: "premium_required",
        message:
          "Large-batch circuit planning is a premium feature. Upgrade to generate full plans.",
      },
      402,
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = tiltSkilletBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return json(
      {
        error: "invalid_request",
        message: "Batch plan input failed validation.",
        issues: parsed.error.issues
          .slice(0, 5)
          .map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      400,
    );
  }
  const { prompt, batchServings, cuisine, diet, disallowed_ingredients, stages } = parsed.data;

  // Deterministic recipe-as-a-circuit grounding — computed here so the model honors the physics.
  const circuit = computeBatchCircuit(stages);

  const agentBaseUrl = getServiceUrl("planetaryAgentsApi");
  let plan: z.infer<typeof tiltSkilletBatchSchema>;
  try {
    const agentResponse = await fetch(`${agentBaseUrl}/api/tilt-skillet-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt || "A large-batch braise for the week ahead.",
        batchServings,
        cuisine,
        dietPreference: diet || "omnivore",
        disallowedIngredients: disallowed_ingredients ?? undefined,
        stages: stages.map((s) => ({ name: s.name, ingredients: s.ingredients })),
        circuitContext: circuit,
        userId,
        tier: "premium",
      }),
    });

    if (!agentResponse.ok) {
      const upstreamBody = (await agentResponse.json().catch(() => ({}))) as Record<string, unknown>;
      const upstreamDetail =
        typeof upstreamBody.detail === "string"
          ? upstreamBody.detail
          : typeof upstreamBody.message === "string"
            ? upstreamBody.message
            : null;
      return json(
        {
          error: "Failed to generate batch plan via agents network",
          upstreamStatus: agentResponse.status,
          upstreamDetail,
        },
        // A 404 means the PA endpoint isn't deployed yet — surface as 502 (upstream not ready).
        agentResponse.status === 404 ? 502 : agentResponse.status,
      );
    }

    const parsedResp = (await agentResponse.json()) as unknown;
    const validation = tiltSkilletBatchSchema.safeParse(parsedResp);
    if (!validation.success) {
      console.error(
        "[generate-tilt-skillet-plan] PA returned a plan that failed local schema check:",
        validation.error.issues.slice(0, 5),
      );
      return json(
        {
          error: "Batch plan schema drift between PA and WTEN",
          issues: validation.error.issues
            .slice(0, 5)
            .map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        502,
      );
    }
    plan = validation.data;
  } catch (error) {
    console.error("[generate-tilt-skillet-plan] Error calling planetary agents API:", error);
    return json({ error: "Internal server error contacting agents network" }, 500);
  }

  return json(plan, 200);
}

export const POST = withObservability(
  { routeName: "/api/generate-tilt-skillet-plan" },
  handlePost,
);
