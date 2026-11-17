/**
 * Real-Time Admin SSE Stream — GET /api/admin/stream
 *
 * Pushes validated `OverviewPulseSchema` frames every 12 seconds (up to 50s max
 * connection lifetime inside a 60s route budget) while filtering live-activity
 * deltas after the client's cursor (`last-event-id` / `?since=`) when provided.
 * Uses normal `overviewPulseService` cache TTLs (`ttlScale = 1`) and skips
 * overlapping ticks so slow DB responses can never pile up connections.
 *
 * @requires Authentication - Admin role required
 * @file src/app/api/admin/stream/route.ts
 */

import { type NextRequest } from "next/server";
import {
  ADMIN_STREAM_INTERVAL_MS,
  OverviewPulseSchema,
  type OverviewPulseView,
} from "@/lib/admin/schemas/overviewPulse";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { buildOverviewPulsePayload } from "@/services/admin/overviewPulseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CONNECTION_MS = 50_000;
const RETRY_MS = 5_000;
const encoder = new TextEncoder();

function formatSseFrame(event: string, data: unknown, id?: string): Uint8Array {
  const idLine = id ? `id: ${id}\n` : "";
  return encoder.encode(`event: ${event}\n${idLine}data: ${JSON.stringify(data)}\n\n`);
}

function withCursorFilter(payload: OverviewPulseView, sinceIso: string | null): OverviewPulseView {
  if (!sinceIso || !payload.liveActivity) return payload;
  const sinceMs = new Date(sinceIso).getTime();
  if (!Number.isFinite(sinceMs)) return payload;
  const freshEvents = payload.liveActivity.events.filter((e) => new Date(e.at).getTime() >= sinceMs);
  return freshEvents.length === payload.liveActivity.events.length
    ? payload
    : { ...payload, liveActivity: { ...payload.liveActivity, events: freshEvents } };
}

async function readValidatedPulse(sinceIso: string | null): Promise<OverviewPulseView> {
  const raw = await buildOverviewPulsePayload(1);
  return OverviewPulseSchema.parse(withCursorFilter(raw, sinceIso));
}

function createPulseSseStream(signal: AbortSignal, once: boolean, initialCursor: string | null): ReadableStream<Uint8Array> {
  let closed = false;
  let inFlight = false;
  let tickTimer: ReturnType<typeof setInterval> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let cursor = initialCursor;
  const cleanup = (): void => {
    if (closed) return;
    closed = true;
    if (tickTimer) clearInterval(tickTimer);
    if (maxTimer) clearTimeout(maxTimer);
    tickTimer = null;
    maxTimer = null;
  };
  return new ReadableStream<Uint8Array>({
    async start(controller): Promise<void> {
      const closeStream = (): void => {
        if (closed) return;
        cleanup();
        try { controller.close(); } catch { /* stream already closed */ }
      };
      const isInactive = (): boolean => closed || signal.aborted;
      const emitPulse = async (): Promise<void> => {
        if (isInactive()) { closeStream(); return; }
        inFlight = true;
        try {
          const validated = await readValidatedPulse(cursor);
          cursor = validated.generatedAt;
          if (isInactive()) { closeStream(); return; }
          controller.enqueue(formatSseFrame("pulse", validated, validated.generatedAt));
        } finally {
          inFlight = false;
        }
      };
      signal.addEventListener("abort", closeStream, { once: true });
      try {
        controller.enqueue(encoder.encode(`retry: ${RETRY_MS}\n\n`));
        await emitPulse();
      } catch { closeStream(); return; }
      if (once || signal.aborted || closed) { closeStream(); return; }
      tickTimer = setInterval(() => {
        if (inFlight || closed || signal.aborted) return;
        emitPulse().then(() => {
          if (!closed && !signal.aborted) controller.enqueue(encoder.encode("event: keepalive\n: ping\n\ndata: {}\n\n"));
        }).catch(() => closeStream());
      }, ADMIN_STREAM_INTERVAL_MS);
      maxTimer = setTimeout(() => {
        if (!closed && !signal.aborted) {
          try { controller.enqueue(formatSseFrame("reconnect", { reason: "lifetime" })); } catch { /* stream closed */ }
        }
        closeStream();
      }, MAX_CONNECTION_MS);
    },
    cancel(): void { cleanup(); },
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;
  const url = new URL(request.url);
  const once = url.searchParams.get("once") === "1";
  const cursor = request.headers.get("last-event-id") ?? url.searchParams.get("since");
  const stream = createPulseSseStream(request.signal, once, cursor);
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
