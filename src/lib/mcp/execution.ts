import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export interface InvocationOptions {
  signal?: AbortSignal;
  correlationId?: string;
  traceId?: string;
  evidenceSnapshotId?: string;
}

interface InvocationContext {
  signal: AbortSignal;
  correlationId: string;
  traceId: string;
  caller?: string;
  evidenceSnapshotId?: string;
}

const context = new AsyncLocalStorage<InvocationContext>();
let active = 0;
export const MAX_CONCURRENT_MCP_CALLS = 4;
export const MCP_CALL_TIMEOUT_MS = 20000;

export function getMcpInvocationContext(): InvocationContext | undefined {
  return context.getStore();
}

export function correlationIdFor(value: unknown): string {
  return typeof value === "string" && /^[a-zA-Z0-9._:-]{1,128}$/.test(value)
    ? value
    : randomUUID();
}

/** No unbounded wait queue; never release a slot while its work is still running. */
export async function runMcpInvocation<T>(
  options: InvocationOptions,
  work: () => Promise<T>,
): Promise<T | null> {
  if (active >= MAX_CONCURRENT_MCP_CALLS) return null;
  active++;
  const controller = new AbortController();
  const abort = (): void => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) abort();
  const timer = setTimeout(
    () => controller.abort(new Error("MCP request deadline exceeded")),
    MCP_CALL_TIMEOUT_MS,
  );
  try {
    return await context.run(
      {
        signal: controller.signal,
        correlationId: correlationIdFor(options.correlationId),
        traceId: correlationIdFor(options.traceId ?? options.correlationId),
        ...(options.evidenceSnapshotId
          ? { evidenceSnapshotId: correlationIdFor(options.evidenceSnapshotId) }
          : {}),
      },
      async () => {
        try {
          return await work();
        } catch (error) {
          if (controller.signal.aborted) throw controller.signal.reason;
          throw error;
        }
      },
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
    active--;
  }
}
