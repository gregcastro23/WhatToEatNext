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

let dbModule:
  | typeof import("@/lib/database/connection")
  | null
  | undefined = undefined;

async function getDb(): Promise<
  typeof import("@/lib/database/connection") | null
> {
  if (dbModule !== undefined) return dbModule;
  if (!isServerWithDB()) {
    dbModule = null;
    return null;
  }
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
  tokensDebited?: { spirit?: number; essence?: number; matter?: number; substance?: number } | null;
}

/** Record one invocation. Never throws. */
export async function recordInvocation(
  ctx: InvocationContext,
  startedAtMs: number,
  outcome: InvocationOutcome,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    const calledAt = new Date(startedAtMs).toISOString();
    const completedAt = new Date().toISOString();
    const latencyMs = Date.now() - startedAtMs;
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
        JSON.stringify(redactArguments(ctx.arguments)),
        JSON.stringify(outcome.resultSummary ?? {}),
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

/**
 * Strip well-known auth fields before persisting. Keeps the JSONB blob
 * useful for triage without ever leaking secrets into the table.
 */
function redactArguments(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    if (k === "_authKey" || k === "_apiKey" || k.toLowerCase().includes("secret")) {
      out[k] = "[redacted]";
    } else if (k === "_meta" && v && typeof v === "object") {
      const meta = v as Record<string, unknown>;
      const safeMeta: Record<string, unknown> = {};
      for (const [mk, mv] of Object.entries(meta)) {
        if (mk === "apiKey" || mk === "authKey") safeMeta[mk] = "[redacted]";
        else safeMeta[mk] = mv;
      }
      out[k] = safeMeta;
    } else {
      out[k] = v;
    }
  }
  return out;
}
