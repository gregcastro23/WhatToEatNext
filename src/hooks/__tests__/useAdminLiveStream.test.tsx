/**
 * Tests for useAdminLiveStream: SSE live updates, tab-hidden pause, and
 * automatic fallback to polling after two consecutive SSE errors.
 *
 * @file src/hooks/__tests__/useAdminLiveStream.test.tsx
 */

import { act, renderHook } from "@testing-library/react";
import { useAdminLiveStream } from "../useAdminLiveStream";

interface ListenerMap {
  [eventName: string]: Array<(ev: MessageEvent) => void>;
}

class MockEventSource {
  static instances: MockEventSource[] = [];
  readonly url: string;
  closed = false;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  private readonly listeners: ListenerMap = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, fn: (ev: MessageEvent) => void): void {
    const existing = this.listeners[type] ?? [];
    existing.push(fn);
    this.listeners[type] = existing;
  }

  emitPulse(payload: unknown): void {
    const ev = new MessageEvent("pulse", { data: JSON.stringify(payload) });
    for (const fn of this.listeners.pulse ?? []) fn(ev);
  }

  triggerError(): void {
    if (this.onerror) this.onerror(new Event("error"));
  }

  close(): void {
    this.closed = true;
  }
}

const makePulse = (eventId: string, genAt = "2026-11-16T22:00:00.000Z"): Record<string, unknown> => ({
  success: true,
  generatedAt: genAt,
  pulse: null,
  liveActivity: {
    generatedAt: genAt,
    windowHours: 6,
    events: [
      {
        id: eventId,
        at: genAt,
        category: "visit",
        type: "page_view",
        status: "info",
        description: "Visited /menu-planner",
        actor: null,
        context: { shortVisitor: "a4f9c2", paths: ["/menu-planner"] },
      },
    ],
    countsByCategory: { signup: 0, auth: 0, onboarding: 0, recipe: 0, economy: 0, agent: 0, diary: 0, visit: 1 },
    live: true,
  },
  systemStatus: null,
});

describe("useAdminLiveStream", () => {
  const origEventSource = globalThis.EventSource;
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    MockEventSource.instances = [];
    Object.defineProperty(globalThis, "EventSource", { value: MockEventSource, configurable: true, writable: true });
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "EventSource", { value: origEventSource, configurable: true, writable: true });
    Object.defineProperty(globalThis, "fetch", { value: origFetch, configurable: true, writable: true });
  });

  it("opens EventSource, receives pulse frames, highlights new events, and pauses when hidden", () => {
    const { result } = renderHook(() => useAdminLiveStream());
    expect(result.current.connectionState).toBe("live_stream");
    expect(MockEventSource.instances).toHaveLength(1);

    const es = MockEventSource.instances[0];
    expect(es?.url).toBe("/api/admin/stream");

    act(() => { es?.emitPulse(makePulse("ev-1", "2026-11-16T22:00:01.000Z")); });
    expect(result.current.data?.liveActivity?.events[0]?.id).toBe("ev-1");
    expect(result.current.newEventIds.size).toBe(0);

    act(() => { es?.emitPulse(makePulse("ev-2", "2026-11-16T22:00:05.000Z")); });
    expect(result.current.newEventIds.has("ev-2")).toBe(true);

    act(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.connectionState).toBe("paused");
    expect(es?.closed).toBe(true);
  });

  it("falls back to hardened polling after two consecutive SSE errors", async () => {
    const fetchMock = jest.fn(async () => new Response(JSON.stringify(makePulse("ev-poll")), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    Object.defineProperty(globalThis, "fetch", { value: fetchMock, configurable: true, writable: true });

    const { result } = renderHook(() => useAdminLiveStream());
    const es = MockEventSource.instances[0];

    act(() => {
      es?.triggerError();
      es?.triggerError();
    });

    expect(es?.closed).toBe(true);
    expect(result.current.connectionState).toBe("polling_fallback");
    await act(async () => { await Promise.resolve(); });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/overview-pulse", { cache: "no-store" });
  });
});
