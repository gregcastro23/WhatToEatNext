/**
 * POST /api/generate-tilt-skillet-plan
 *
 * Thin proxy in front of the Planetary Agents backend's /api/tilt-skillet-plan endpoint —
 * the same proxy → PA pattern as /api/generate-cosmic-recipe. WTEN's job here:
 *   - Require an authenticated user who can afford the plan: a chart-priced ESMS cost
 *     (featureCharge), checked before the agents call and collected only once a valid
 *     plan comes back (hard 402 otherwise). Operators are not charged.
 *   - Compute the deterministic recipe-as-a-circuit grounding from the staged ingredient list
 *     (computeBatchCircuit reuses the existing kinetics / Kalchm / Monica engine).
 *   - Forward the grounding + stages to PA, which owns the LLM persona, JSON mode, validation,
 *     retry, and cache.
 *   - Defensive Zod re-check of PA's response against tiltSkilletBatchSchema so schema drift
 *     surfaces at the WTEN edge.
 */
import { gateDemoOrAuth } from "@/lib/auth/demoAccess";
import { collectOrRefuse, quoteFeature, refuseIfUnaffordable } from "@/lib/economy/featureCharge";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { getServiceUrl } from "@/lib/serviceUrls";
import {
  tiltSkilletBatchSchema,
  tiltSkilletBodySchema,
} from "@/types/tiltSkilletSchema";
import { computeBatchCircuit } from "@/utils/tiltSkilletCircuit";
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
  // Passersby/anonymous users get prompt to sign in
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

  const { userId } = access;

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
  const { prompt, batchServings, cuisine, diet, disallowed_ingredients: disallowedIngredients, stages } = parsed.data;

  const { userDatabase } = await import("@/services/userDatabaseService");
  const payer = await userDatabase.getUserById(userId);
  if (!payer) {
    return json({ error: "auth_required", message: "Please sign in to generate a batch plan." }, 401);
  }
  // It used to check the four-axis total but debit all 5 from Spirit, without
  // checking the debit landed. Now priced on the chart and collected on delivery.
  const quote = await quoteFeature(payer, "tiltSkillet");
  const cannotPay = await refuseIfUnaffordable(userId, quote);
  if (cannotPay) return cannotPay;

  const circuit = computeBatchCircuit(
    stages.map((s) => ({
      ingredients: s.ingredients,
      ...(s.name !== undefined ? { name: s.name } : {}),
    })),
  );

  const agentBaseUrl = getServiceUrl("planetaryAgentsApi");
  let plan: z.infer<typeof tiltSkilletBatchSchema>;
  try {
    const agentResponse = await fetch(`${agentBaseUrl}/api/tilt-skillet-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt ?? "A large-batch braise for the week ahead.",
        batchServings,
        cuisine,
        dietPreference: diet ?? "omnivore",
        disallowedIngredients: disallowedIngredients ?? undefined,
        stages: stages.map((s) => ({ name: s.name, ingredients: s.ingredients })),
        circuitContext: circuit,
        userId,
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
      _logger.error(
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
    _logger.error("[generate-tilt-skillet-plan] Error calling planetary agents API:", error);
    return json({ error: "Internal server error contacting agents network" }, 500);
  }

  const unpaid = await collectOrRefuse(userId, quote);
  if (unpaid) return unpaid;
  return json(plan, 200);
}

export const POST = withObservability(
  { routeName: "/api/generate-tilt-skillet-plan" },
  handlePost,
);
