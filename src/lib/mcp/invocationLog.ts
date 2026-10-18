/**
 * MCP Invocation Log
 *
 * Records each MCP tool call into `mcp_invocations` so the admin
 * dashboard can surface external-LLM activity (Claude Desktop, Cursor,
 * the PA MCP bridge, synthetic probes) on the same telemetry surface as
 * in-app feed events.
 *
 * The recorder is fire-and-forget: a DB outage must never break a tool
 * call. When DATABASE_URL is unset (local dev without DB), the recorder
 * silently no-ops.
 *
 * @file mcp-server/src/invocationLog.ts
 */

const isServerWithDB = (): boolean => !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database/connection") | null | undefined =
  undefined;

async function getDb(): Promise<
  typeof import("@/lib/database/connection") | null
> {
  if (!isServerWithDB()) return null;
  if (dbModule !== undefined) return dbModule;
  try {
    dbModule = await import("@/lib/database/connection");
  } catch (err) {
    process.stderr.write(
      `[mcp/invocationLog] DB module load failed: ${String(err)}\n`,
    );
    dbModule = null;
  }
  return dbModule;
}

export interface InvocationContext {
  toolName: string;
  arguments: Record<string, unknown>;
  caller: string | null;
  userId: string | null;
  apiKeyId: string | null;
}

export interface InvocationOutcome {
  success: boolean;
  errorMessage: string | null;
  /**
   * Small (~1KB) summary safe to persist. Never include the raw recipe
   * body or any secrets — the JSONB column is for triage, not replay.
   */
  resultSummary: Record<string, unknown>;
  tokensDebited?: {
    spirit?: number;
    essence?: number;
    matter?: number;
    substance?: number;
  } | null;
}

/**
 * Pair of timing marks captured at tool entry:
 * - `startedAt` is a `performance.now()` reading (fractional ms, monotonic).
 *   Used solely to compute `latency_ms` with sub-ms resolution.
 * - `calledAtIso` is a `new Date().toISOString()` captured at the same instant.
 *   Used for the `called_at` wall-clock column because perf marks aren't an
 *   epoch.
 */
export interface InvocationTiming {
  startedAt: number;
  calledAtIso: string;
}

const pendingInvocations = new Set<Promise<void>>();

/** Record one invocation. Never throws. */
export function recordInvocation(
  ctx: InvocationContext,
  timing: InvocationTiming,
  outcome: InvocationOutcome,
): Promise<void> {
  const write = writeInvocation(ctx, timing, outcome);
  pendingInvocations.add(write);
  write.then(
    () => {
      pendingInvocations.delete(write);
    },
    () => {
      pendingInvocations.delete(write);
    },
  );
  return write;
}

/** Wait for pending telemetry on shutdown, up to one shared timeout. */
export async function drainMcpInvocations(timeoutMs = 1_000): Promise<void> {
  if (pendingInvocations.size === 0) return;
  const boundedTimeoutMs = Number.isFinite(timeoutMs)
    ? Math.max(0, timeoutMs)
    : 1_000;
  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<void>((resolve) => {
    deadlineTimer = setTimeout(resolve, boundedTimeoutMs);
  });
  try {
    while (pendingInvocations.size > 0) {
      const outcome = await Promise.race([
        Promise.allSettled(pendingInvocations).then(() => "drained"),
        deadline.then(() => "timed-out"),
      ]);
      if (outcome === "timed-out") return;
    }
  } finally {
    clearTimeout(deadlineTimer);
  }
}

async function writeInvocation(
  ctx: InvocationContext,
  timing: InvocationTiming,
  outcome: InvocationOutcome,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    const calledAt = timing.calledAtIso;
    const completedAt = new Date().toISOString();
    // Floor at 1 so the column stays a positive integer even when a warm-cache
    // call finishes in <0.5ms (which rounds to 0). Round because performance.now()
    // returns fractional ms.
    const latencyMs = Math.max(
      1,
      Math.round(performance.now() - timing.startedAt),
    );
    await db.executeQuery(
      `INSERT INTO mcp_invocations
         (tool_name, called_at, completed_at, latency_ms, success,
          user_id, api_key_id, caller,
          arguments, result_summary, error_message, tokens_debited)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
               $9::jsonb, $10::jsonb, $11, $12::jsonb)`,
      [
        ctx.toolName,
        calledAt,
        completedAt,
        latencyMs,
        outcome.success,
        ctx.userId,
        ctx.apiKeyId,
        ctx.caller,
        JSON.stringify(redactLogValue(ctx.arguments)),
        JSON.stringify(redactLogValue(outcome.resultSummary ?? {})),
        outcome.errorMessage,
        outcome.tokensDebited ? JSON.stringify(outcome.tokensDebited) : null,
      ],
    );
  } catch (err) {
    process.stderr.write(
      `[mcp/invocationLog] insert failed for ${ctx.toolName}: ${String(err)}\n`,
    );
  }
}

const MAX_REDACTION_DEPTH = 12;

function isSensitiveFieldKey(key: string): boolean {
  const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  // These fields describe the ESMS asset in a trade, not authentication.
  if (normalized === "givetoken" || normalized === "wanttoken") return false;
  return (
    normalized === "reflection" ||
    normalized === "review" ||
    normalized === "apikey" ||
    normalized === "authkey" ||
    normalized.endsWith("token") ||
    /secret|password|authorization|credential/.test(normalized)
  );
}

/** Remove credential fields and review bodies without mutating structured telemetry. */
function redactLogValue(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== "object") return value;
  // Also terminates cyclic objects and prevents excessive recursive traversal.
  if (depth >= MAX_REDACTION_DEPTH) return "[redacted: depth limit]";
  if (Array.isArray(value)) {
    return value.map((entry: unknown) => redactLogValue(entry, depth + 1));
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitiveFieldKey(key)
        ? "[redacted]"
        : redactLogValue(entry, depth + 1),
    ]),
  );
}
