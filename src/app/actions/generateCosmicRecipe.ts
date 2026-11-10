/**
 * Durable Cosmic Recipe Generation Action & Operation Orchestrator (Phase 45 Follow-Through).
 *
 * Claims `(user_id, operation_key)` durability in PostgreSQL (`cosmic_generation_operations`)
 * with a 90-second stale-lock recovery threshold, replays completed receipts,
 * rejects mismatched request fingerprints, and automatically triggers `refundSpirit`
 * on generation failure.
 */
import {
  claimCosmicGenerationOperation,
  completeCosmicGenerationOperation,
  computeCosmicRequestFingerprint,
  COSMIC_GENERATION_STALE_LOCK_SECONDS,
  failCosmicGenerationOperation,
  recordCosmicOperationDebit,
  refundSpirit,
  type ClaimOperationResult,
  type CosmicGenerationOperationRow,
} from "@/lib/cooking/cosmicGenerationOperations";

export {
  claimCosmicGenerationOperation,
  completeCosmicGenerationOperation,
  computeCosmicRequestFingerprint,
  COSMIC_GENERATION_STALE_LOCK_SECONDS,
  failCosmicGenerationOperation,
  recordCosmicOperationDebit,
  refundSpirit,
  type ClaimOperationResult,
  type CosmicGenerationOperationRow,
};

export interface DurableCosmicGenerationInput {
  userId: string;
  operationKey: string;
  prompt?: string;
  diet?: string;
  preferredCuisine?: string;
  ingredientsMain?: readonly string[];
  disallowedIngredients?: readonly string[];
  debitTxId?: string | null;
  debitCosts?: {
    spirit: number;
    essence?: number;
    matter?: number;
    substance?: number;
  } | null;
}

export interface DurableCosmicGenerationOutcome<T extends { id: string }> {
  status: "completed" | "replayed" | "in_progress" | "fingerprint_mismatch" | "failed";
  replayed: boolean;
  recoveredStaleLock: boolean;
  recipe: T | null;
  operation: CosmicGenerationOperationRow;
  refunded: boolean;
  refundTxId: string | null;
  errorMessage?: string;
}

function buildNonClaimOutcome<T extends { id: string }>(
  claim: Exclude<ClaimOperationResult, { outcome: "claimed" }>,
): DurableCosmicGenerationOutcome<T> {
  if (claim.outcome === "fingerprint_mismatch") {
    return {
      status: "fingerprint_mismatch",
      replayed: false,
      recoveredStaleLock: false,
      recipe: null,
      operation: claim.operation,
      refunded: false,
      refundTxId: null,
      errorMessage: "Operation key already used with different request parameters.",
    };
  }
  if (claim.outcome === "in_progress") {
    return {
      status: "in_progress",
      replayed: false,
      recoveredStaleLock: false,
      recipe: null,
      operation: claim.operation,
      refunded: false,
      refundTxId: null,
      errorMessage: "Cosmic recipe generation is already in progress for this operation key.",
    };
  }
  return {
    status: "replayed",
    replayed: true,
    recoveredStaleLock: false,
    recipe: null,
    operation: claim.operation,
    refunded: false,
    refundTxId: claim.operation.refundTxId,
  };
}

async function handleGenerationFailure<T extends { id: string }>(
  input: DurableCosmicGenerationInput,
  claim: Extract<ClaimOperationResult, { outcome: "claimed" }>,
  effectiveDebitTxId: string | null | undefined,
  error: unknown,
): Promise<DurableCosmicGenerationOutcome<T>> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  let refunded = false;
  let refundTxId: string | null = null;
  if (effectiveDebitTxId && input.debitCosts && input.debitCosts.spirit > 0) {
    const res = await refundSpirit({
      userId: input.userId,
      operationKey: input.operationKey,
      debitTxId: effectiveDebitTxId,
      amountSpirit: input.debitCosts.spirit,
      ...(input.debitCosts.essence !== undefined ? { amountEssence: input.debitCosts.essence } : {}),
      ...(input.debitCosts.matter !== undefined ? { amountMatter: input.debitCosts.matter } : {}),
      ...(input.debitCosts.substance !== undefined ? { amountSubstance: input.debitCosts.substance } : {}),
    });
    ({ refunded, refundTxId } = res);
  }
  await failCosmicGenerationOperation({
    userId: input.userId,
    operationKey: input.operationKey,
    refunded,
    refundTxId,
    errorMessage,
  });
  return {
    status: "failed",
    replayed: false,
    recoveredStaleLock: claim.recoveredStaleLock,
    recipe: null,
    operation: {
      ...claim.operation,
      status: refunded ? "refunded" : "failed",
      debitTxId: effectiveDebitTxId ?? null,
      refundTxId,
      errorMessage,
    },
    refunded,
    refundTxId,
    errorMessage,
  };
}

/**
 * Execute a cosmic recipe generation under a durable PostgreSQL operation lock
 * with a 90s stale-lock recovery threshold and automatic Spirit/ESMS refund on failure.
 */
export async function generateCosmicRecipeEntry<T extends { id: string }>(
  input: DurableCosmicGenerationInput,
  executeGeneration: () => Promise<T>,
): Promise<DurableCosmicGenerationOutcome<T>> {
  const requestFingerprint = computeCosmicRequestFingerprint({
    prompt: input.prompt ?? "",
    diet: input.diet ?? "omnivore",
    preferredCuisine: input.preferredCuisine ?? "",
    ingredientsMain: input.ingredientsMain ?? [],
    disallowedIngredients: input.disallowedIngredients ?? [],
  });
  const claim = await claimCosmicGenerationOperation({
    userId: input.userId,
    operationKey: input.operationKey,
    requestFingerprint,
    staleLockSeconds: COSMIC_GENERATION_STALE_LOCK_SECONDS,
  });
  if (claim.outcome !== "claimed") return buildNonClaimOutcome(claim);
  const effectiveDebitTxId = input.debitTxId ?? claim.operation.debitTxId;
  if (effectiveDebitTxId) {
    await recordCosmicOperationDebit({
      userId: input.userId,
      operationKey: input.operationKey,
      debitTxId: effectiveDebitTxId,
    });
  }
  try {
    const recipe = await executeGeneration();
    await completeCosmicGenerationOperation({
      userId: input.userId,
      operationKey: input.operationKey,
      recipeId: recipe.id,
      responsePayload: { id: recipe.id },
    });
    return {
      status: "completed",
      replayed: false,
      recoveredStaleLock: claim.recoveredStaleLock,
      recipe,
      operation: { ...claim.operation, status: "completed", recipeId: recipe.id, debitTxId: effectiveDebitTxId ?? null },
      refunded: false,
      refundTxId: null,
    };
  } catch (error) {
    return handleGenerationFailure(input, claim, effectiveDebitTxId, error);
  }
}
