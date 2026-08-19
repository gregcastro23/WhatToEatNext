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
import { extractClientIp, hashIp } from "./hashIp";
import { recordRequest } from "./requestLog";

/**
 * Handler signature — a rest tuple so the same wrapper works for
 * non-dynamic routes (`GET(request)`) and dynamic routes
 * (`GET(request, { params: Promise<...> })`). TypeScript infers
 * `TRest` from the supplied handler, and Next.js's auto-generated
 * route type check accepts whatever shape Next itself emitted.
 *
 * The wrapper accepts either `Request` (what route files usually
 * type) or `NextRequest` (what Next.js actually passes); contravariance
 * makes the substitution safe.
 */
export type ObservedHandler<TRest extends unknown[] = []> = (
  request: NextRequest,
  ...rest: TRest
) => Promise<Response> | Response;

export interface ObservabilityOptions {
  /**
   * Stable name for this route, used as the `path` in the ring buffer.
   * For dynamic routes, prefer the template form
   * (`/api/recipes/:recipeId`) so requests group together.
   */
  routeName: string;
  /**
   * Optional refinement for catch-all routes, where one route file serves a
   * family of distinct URLs. When present, its return value is recorded as
   * the path instead of `routeName`; `routeName` stays required and is the
   * fallback if the deriver throws or returns an empty string, so the worst
   * case is exactly the previous behaviour.
   *
   * The deriver MUST return a bounded set of names — two consumers group by
   * exact path and then truncate (the error-group `LIMIT 8` and
   * `summarizeRecent().topPaths`), so unbounded output would crowd real
   * routes off both. See `authRouteName.ts` for the reference implementation.
   */
  deriveRouteName?: (request: NextRequest) => string;
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
export function withObservability<TRest extends unknown[] = []>(
  options: ObservabilityOptions,
  handler: ObservedHandler<TRest>,
): ObservedHandler<TRest> {
  return async (request, ...rest) => {
    const startedAt = performance.now();
    const { method } = request;
    let response: Response;
    let threw: unknown;

    try {
      const result = handler(request, ...rest);
      response = result instanceof Promise ? await result : result;
    } catch (err) {
      threw = err;
      response = NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }

    const latencyMs = Math.round(performance.now() - startedAt);
    const { status } = response;

    // Fire-and-forget: kick the userId + ip-hash resolution into the
    // background. The response goes back to the client immediately;
    // the ring buffer entry shows up a few ms later. We deliberately
    // do not await this so the request hot path is unaffected.
    void resolveAndRecord({
      request,
      // Resolved HERE, synchronously, rather than inside resolveAndRecord:
      // a throwing deriver is caught on the request path where we still have
      // a `try` around it, and can never reach the fire-and-forget microtask.
      routeName: resolveRouteName(options, request),
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

/**
 * Apply `deriveRouteName` when the route supplies one, falling back to the
 * static `routeName` on any failure or empty result. Never throws.
 */
function resolveRouteName(
  options: ObservabilityOptions,
  request: NextRequest,
): string {
  if (!options.deriveRouteName) return options.routeName;
  try {
    const derived = options.deriveRouteName(request);
    return typeof derived === "string" && derived.length > 0
      ? derived
      : options.routeName;
  } catch {
    return options.routeName;
  }
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
      // Imported lazily so routes that skip user resolution never load the
      // auth chain at all. `validateRequest` pulls in `jose`, which is
      // ESM-only — a static import drags it into every instrumented route,
      // including machine-to-machine endpoints that authenticate by shared
      // secret and can never have a user to resolve.
      const { getUserIdFromRequest } = await import("@/lib/auth/validateRequest");
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
