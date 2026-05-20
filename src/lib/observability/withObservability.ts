/**
 * withObservability — opt-in observability HOC for App Router handlers.
 *
 * Wrap a route handler with this to record an entry in the in-memory
 * request log (see `requestLog.ts`). Recording is fire-and-forget so
 * it never adds measurable latency to the response:
 *
 *   - The handler runs as normal; we time it with performance.now().
 *   - As soon as the handler returns (or throws), we resolve the
 *     response back to Next.js immediately.
 *   - A microtask kicks off in the background to resolve the userId
 *     and IP hash, then push the entry into the ring. If that work
 *     fails, we swallow the error rather than blow up an already-
 *     served request.
 *
 * Pass a `routeName` so dynamic-segment routes group cleanly in the
 * admin panel — `/api/recipes/:recipeId` rather than every individual
 * recipe ID becoming its own bucket.
 *
 * @file src/lib/observability/withObservability.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { extractClientIp, hashIp } from "./hashIp";
import { recordRequest } from "./requestLog";

type AnyContext = Record<string, unknown>;

/**
 * Handler signature — accepts either `Request` (what the route file
 * usually types) or `NextRequest` (what Next.js actually passes at
 * runtime). The wrapper coerces internally so the route doesn't need
 * to be edited beyond the export.
 */
export type ObservedHandler<TCtx extends AnyContext = AnyContext> = (
  request: NextRequest,
  context: TCtx,
) => Promise<Response> | Response;

export interface ObservabilityOptions {
  /**
   * Stable name for this route, used as the `path` in the ring buffer.
   * For dynamic routes, prefer the template form
   * (`/api/recipes/:recipeId`) so requests group together.
   */
  routeName: string;
  /**
   * If true, skip resolving the userId — useful for high-traffic
   * public endpoints where the auth lookup would be wasted work.
   * Defaults to false.
   */
  skipUserResolution?: boolean;
}

/**
 * Wrap an App Router handler. The returned function has the same
 * signature as the input — drop it in next to the export.
 *
 *   export const GET = withObservability(
 *     { routeName: "/api/recipes" },
 *     async (request) => { ... },
 *   );
 */
export function withObservability<TCtx extends AnyContext = AnyContext>(
  options: ObservabilityOptions,
  handler: ObservedHandler<TCtx>,
): ObservedHandler<TCtx> {
  return async (request, context) => {
    const startedAt = performance.now();
    const method = request.method;
    let response: Response;
    let threw: unknown;

    try {
      const result = handler(request, context);
      response = result instanceof Promise ? await result : result;
    } catch (err) {
      threw = err;
      response = NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }

    const latencyMs = Math.round(performance.now() - startedAt);
    const status = response.status;

    // Fire-and-forget: kick the userId + ip-hash resolution into the
    // background. The response goes back to the client immediately;
    // the ring buffer entry shows up a few ms later. We deliberately
    // do not await this so the request hot path is unaffected.
    void resolveAndRecord({
      request,
      routeName: options.routeName,
      method,
      status,
      latencyMs,
      skipUserResolution: options.skipUserResolution ?? false,
    });

    if (threw !== undefined) {
      // Preserve Next.js's normal error path — if the inner handler
      // threw, the framework should see it after we recorded the 500.
      throw threw;
    }
    return response;
  };
}

interface ResolveAndRecordOpts {
  request: NextRequest;
  routeName: string;
  method: string;
  status: number;
  latencyMs: number;
  skipUserResolution: boolean;
}

async function resolveAndRecord(opts: ResolveAndRecordOpts): Promise<void> {
  let userId: string | null = null;
  let ipHashed: string | null = null;
  try {
    if (!opts.skipUserResolution) {
      userId = await getUserIdFromRequest(opts.request);
    }
    const ip = extractClientIp(opts.request.headers);
    ipHashed = ip ? hashIp(ip) : null;
  } catch {
    // Swallow: recording must never throw past the response.
  }
  try {
    recordRequest({
      method: opts.method,
      path: opts.routeName,
      status: opts.status,
      latencyMs: opts.latencyMs,
      userId,
      ipHash: ipHashed,
    });
  } catch {
    // Ring buffer is in-memory; if it errors something is very wrong,
    // but we still don't want to crash an already-served request.
  }
}
