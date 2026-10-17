/**
 * Internal Agent Recipe Authoring
 * POST /api/internal/agent-recipes
 *
 * Lets the Planetary Agents service persist a recipe AUTHORED BY an agentic
 * user into `user_custom_recipes` — the same store the human "save a custom
 * recipe" flow uses — so an agent's recipe is real, durable, and attributed to
 * its user row (it shows under that user the same way human custom recipes do).
 *
 * Secret-gated (INTERNAL_API_SECRET) because agentic users have no session
 * cookie. The caller supplies the agent's WTEN user id, which Planetary Agents
 * already stores as `alchmKitchenUserId` after agent-sync. Returns the new id
 * so PA can reference it on the agent's profile feed event.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import {
  buildDeliverySummary,
  claimInboundEvent,
  completeWebhookEvent,
  failInboundClaim,
  rejectInboundClaim,
  resolveInboundDeliveryContext,
} from "@/lib/hooks/idempotency";
import { inFlightConflict } from "@/lib/hooks/inFlightConflict";
import { bearerMatches, safeEqual } from "@/lib/hooks/secureCompare";
import {
  evaluateSignatureGate,
  resolveWebhookSecret,
  verifyStandardWebhook,
} from "@/lib/hooks/standardWebhooks";
import { _logger } from "@/lib/logger";
import { isReservedAdaptation } from "@/lib/recipes/savedAdaptationSchemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AgentRecipeBodySchema = z.object({
  // The authoring agent's WTEN user id (PA's alchmKitchenUserId).
  userId: z.string().trim().min(1, "userId (agentic WTEN user id) is required"),
  name: z.string().trim().min(1, "name is required").max(200),
  cuisine: z.string().trim().max(120).optional(),
  // Where the recipe came from; defaults to "agent" so these are filterable.
  source: z.string().trim().max(60).optional(),
  // Optional catalog recipe this was riffed from.
  sourceRecipeId: z.string().trim().max(200).optional(),
  payload: z.record(z.string(), z.unknown()),
  notes: z.string().max(2000).optional(),
  skipEconomyCharge: z.boolean().optional(),
  autoSwap: z.boolean().optional(),
});

interface InsertedRow {
  id: string;
  created_at: string;
}

async function readJsonBody(request: NextRequest): Promise<{ text: string; data: unknown } | null> {
  try {
    const text = await request.text();
    return { text, data: JSON.parse(text) };
  } catch {
    return null;
  }
}

function checkAgentRecipeHeaderAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization") ?? "";
  const syncHeader = request.headers.get("x-sync-secret") ?? "";

  const isBearerAuthorized = bearerMatches(
    authHeader,
    process.env.INTERNAL_API_SECRET,
  );
  const isSyncHeaderAuthorized = safeEqual(
    syncHeader,
    process.env.ALCHM_KITCHEN_SYNC_SECRET,
  );

  if (!isBearerAuthorized && !isSyncHeaderAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function verifyAgentRecipeWebhook(
  request: NextRequest,
  rawBodyText: string,
): {
  verification: ReturnType<typeof verifyStandardWebhook>;
  response: NextResponse | null;
} {
  const verification = verifyStandardWebhook({
    headers: request.headers,
    rawBody: rawBodyText,
    secret: resolveWebhookSecret(),
  });
  const gate = evaluateSignatureGate(verification);
  if (!gate.proceed) {
    return {
      verification,
      response: NextResponse.json(
        { error: gate.error ?? "Unauthorized" },
        { status: gate.status ?? 401 },
      ),
    };
  }
  return { verification, response: null };
}

export async function POST(request: NextRequest) {
  const headerAuthError = checkAgentRecipeHeaderAuth(request);
  if (headerAuthError) return headerAuthError;

  const parsedBody = await readJsonBody(request);
  if (!parsedBody) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { text: rawBodyText, data: rawBody } = parsedBody;

  const { verification, response: gateResponse } = verifyAgentRecipeWebhook(request, rawBodyText);
  if (gateResponse) return gateResponse;

  const parsed = AgentRecipeBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;
  if (isReservedAdaptation(body.source, body.payload)) {
    return NextResponse.json({ success: false, error: "Validated adaptation provenance is reserved for the saved-adaptation action." }, { status: 400 });
  }

  const delivery = resolveInboundDeliveryContext(request.headers, rawBody, verification);

  const claimResult = await claimInboundEvent({
    source: "asol-agent-recipes",
    key: delivery.effectiveKey,
    eventType: "agent-recipe",
    subjectId: body.userId,
    summary: buildDeliverySummary({ userId: body.userId, name: body.name }, delivery),
    data: rawBody,
  });

  if (claimResult.isDuplicate) {
    if (claimResult.isInFlight) {
      return inFlightConflict({
        success: false,
        error: "conflict",
        message: "Event is currently being processed",
      });
    }
    return NextResponse.json({
      ...(claimResult.previousResult ?? { success: true }),
      deduplicated: true,
    });
  }

  try {
    const dbConnection = await import("@/lib/database/connection");
    const { agentEconomyActionService } = await import("@/services/agentEconomyActionService");
    const { RECIPE_BRANCH_COST } = await import("@/types/economy");
    type EconomyReceiptType = import("@/types/economy").EconomyReceipt;
    type PoolClientType = import("pg").PoolClient;

    class RollbackError extends Error {
      readonly status: number;
      readonly body: Record<string, unknown>;
      constructor(status: number, body: Record<string, unknown>) {
        super("Transaction rollback");
        this.status = status;
        this.body = body;
      }
    }

    const runInTx = async (
      client?: PoolClientType,
    ): Promise<{ status: number; body: Record<string, unknown> }> => {
      let economyReceipt: EconomyReceiptType = {
        charged: false,
        transactionGroupId: null,
        costBasket: RECIPE_BRANCH_COST,
        swapsExecuted: 0,
        remainingBalances: { spirit: 0, essence: 0, matter: 0, substance: 0 },
      };

      let isAgent = false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(body.userId)) {
        try {
          const uRes = client
            ? await client.query<{ is_agent: boolean }>(
                `SELECT is_agent FROM users WHERE id = $1 LIMIT 1`,
                [body.userId],
              )
            : await executeQuery<{ is_agent: boolean }>(
                `SELECT is_agent FROM users WHERE id = $1 LIMIT 1`,
                [body.userId],
              );
          const [u] = uRes.rows;
          if (u) {
            isAgent = u.is_agent === true;
          } else {
            isAgent = agentEconomyActionService.getInMemoryBalance(body.userId) !== undefined;
          }
        } catch {
          isAgent = agentEconomyActionService.getInMemoryBalance(body.userId) !== undefined;
        }
      } else {
        isAgent = agentEconomyActionService.getInMemoryBalance(body.userId) !== undefined;
      }

      if (isAgent && !body.skipEconomyCharge) {
        const debitRes = await agentEconomyActionService.debitActionInTx({
          userId: body.userId,
          costs: RECIPE_BRANCH_COST,
          sourceType: "recipe_branch",
          sourceId: body.sourceRecipeId ?? null,
          description: `Recipe branch: ${body.name}`,
          idempotencyKey: `branch:${delivery.effectiveKey}`,
          autoSwap: body.autoSwap ?? true,
          client,
        });

        if (!debitRes.success) {
          if (debitRes.reason === "insufficient_funds") {
            return {
              status: 402,
              body: {
                success: false,
                error: "insufficient_funds",
                reason: "insufficient_funds",
                message: "Insufficient ESMS funds to branch recipe",
                costBasket: RECIPE_BRANCH_COST,
                shortfall: debitRes.details.shortfall,
                deficits: debitRes.details.deficits,
                currentBalances: debitRes.details.currentBalances,
                prices: debitRes.details.prices,
              },
            };
          }
          return {
            status: 500,
            body: { success: false, error: debitRes.error },
          };
        }
        economyReceipt = debitRes.receipt;
      }

      const insertSql = `
        INSERT INTO user_custom_recipes
           (user_id, name, cuisine, source, source_recipe_id, payload, notes)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
         RETURNING id, created_at
      `;
      const result = await executeQuery<InsertedRow>(
        insertSql,
        [
          body.userId,
          body.name,
          body.cuisine ?? null,
          body.source ?? "agent",
          body.sourceRecipeId ?? null,
          JSON.stringify(body.payload),
          body.notes ?? null,
        ],
        client ? { client } : {},
      );

      const [row] = result.rows;
      if (!row) {
        return {
          status: 500,
          body: { success: false, error: "recipe insert returned no row" },
        };
      }

      return {
        status: 200,
        body: {
          success: true,
          id: row.id,
          createdAt: new Date(row.created_at).getTime(),
          economy: economyReceipt,
        },
      };
    };

    let txOutcome: { status: number; body: Record<string, unknown> };

    if (typeof dbConnection.withTransaction === "function") {
      try {
        txOutcome = await dbConnection.withTransaction(async (client) => {
          const outcome = await runInTx(client);
          if (outcome.status !== 200) {
            throw new RollbackError(outcome.status, outcome.body);
          }
          return outcome;
        });
      } catch (err) {
        if (err instanceof RollbackError) {
          if (claimResult.claim) {
            await rejectInboundClaim(claimResult.claim, err.status);
          }
          return NextResponse.json(err.body, { status: err.status });
        }
        throw err;
      }
    } else {
      txOutcome = await runInTx();
    }

    if (txOutcome.status !== 200) {
      if (claimResult.claim) {
        await rejectInboundClaim(claimResult.claim, txOutcome.status);
      }
      return NextResponse.json(txOutcome.body, { status: txOutcome.status });
    }

    if (claimResult.claim) {
      await completeWebhookEvent(claimResult.claim, "processed", txOutcome.body);
    }
    return NextResponse.json(txOutcome.body);
  } catch (error) {
    await failInboundClaim(claimResult.claim, error);
    _logger.error("[POST /api/internal/agent-recipes]", error);
    return NextResponse.json(
      { error: "Failed to author recipe" },
      { status: 500 },
    );
  }
}
