/**
 * Real-Time Admin SSE Stream — GET /api/admin/stream
 *
 * Pushes validated `OverviewPulseSchema` frames every 3 seconds (up to 55s max
 * connection lifetime) while filtering live-activity deltas after the client's
 * cursor (`last-event-id` / `?since=`) when provided.
 *
 * @requires Authentication - Admin role required
 * @file src/app/api/admin/stream/route.ts
 */

import { type NextRequest } from "next/server";
import { OverviewPulseSchema, type OverviewPulseView } from "@/lib/admin/schemas/overviewPulse";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { buildOverviewPulsePayload } from "@/services/admin/overviewPulseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STREAM_INTERVAL_MS = 3_000;
const MAX_CONNECTION_MS = 55_000;
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
  const raw = await buildOverviewPulsePayload(0.2);
  return OverviewPulseSchema.parse(withCursorFilter(raw, sinceIso));
}

function createPulseSseStream(signal: AbortSignal, once: boolean, initialCursor: string | null): ReadableStream<Uint8Array> {
  let closed = false;
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
      const emitPulse = async (): Promise<void> => {
        if (closed || signal.aborted) { closeStream(); return; }
        const validated = await readValidatedPulse(cursor);
        cursor = validated.generatedAt;
        if (closed || signal.aborted) { closeStream(); return; }
        controller.enqueue(formatSseFrame("pulse", validated, validated.generatedAt));
      };
      signal.addEventListener("abort", closeStream, { once: true });
      try {
        controller.enqueue(encoder.encode("retry: 3000\n\n"));
        await emitPulse();
      } catch { closeStream(); return; }
      if (once || signal.aborted || closed) { closeStream(); return; }
      tickTimer = setInterval(() => {
        emitPulse().then(() => {
          if (!closed && !signal.aborted) controller.enqueue(encoder.encode("event: keepalive\n: ping\n\ndata: {}\n\n"));
        }).catch(() => closeStream());
      }, STREAM_INTERVAL_MS);
      maxTimer = setTimeout(closeStream, MAX_CONNECTION_MS);
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
