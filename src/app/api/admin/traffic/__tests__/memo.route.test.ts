/**
 * @jest-environment node
 *
 * GET /api/admin/traffic reuses its computed summary for as long as the page's
 * poll interval. It was 5 s against a 10 s poll, so every poll recomputed all of
 * the readers.
 *
 * `memoize` starts the TTL when a compute FINISHES, so with the TTL equal to the
 * poll a poll 7 s after a compute is served from memory and one just past 10 s
 * recomputes.
 *
 * @file src/app/api/admin/traffic/__tests__/memo.route.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";

const mockGetTrafficSummary = jest.fn<(range: string) => Promise<{ marker: number }>>();

jest.mock("@/services/admin/trafficAnalyticsService", () => ({
  getTrafficSummary: (range: string) => mockGetTrafficSummary(range),
}));
jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: () => Promise.resolve({ user: { id: "admin" } }),
}));

import { GET } from "@/app/api/admin/traffic/route";
import { TRAFFIC_POLL_MS } from "@/lib/admin/trafficPoll";

const poll = (range: string): Promise<Response> =>
  GET(new NextRequest(`http://localhost/api/admin/traffic?range=${range}`));

beforeEach(() => {
  jest.useFakeTimers({ now: new Date("2026-11-23T00:00:00Z") });
  mockGetTrafficSummary.mockReset();
  mockGetTrafficSummary.mockResolvedValue({ marker: 1 });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("GET /api/admin/traffic memo", () => {
  it("pins the shared poll interval at 10 s", () => {
    expect(TRAFFIC_POLL_MS).toBe(10_000);
  });

  it("serves a poll that arrives 7 s after a compute from the memo", async () => {
    await poll("24h");
    jest.advanceTimersByTime(7_000);
    const second = await poll("24h");

    expect(mockGetTrafficSummary).toHaveBeenCalledTimes(1);
    expect(await second.json()).toEqual({ success: true, marker: 1 });
  });

  it("recomputes once the poll interval has passed", async () => {
    await poll("7d");
    jest.advanceTimersByTime(TRAFFIC_POLL_MS + 1);
    await poll("7d");

    expect(mockGetTrafficSummary).toHaveBeenCalledTimes(2);
  });

  it("makes two overlapping polls share one compute (unchanged behaviour: a control)", async () => {
    let finish: (value: { marker: number }) => void = () => undefined;
    mockGetTrafficSummary.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const both = Promise.all([poll("30d"), poll("30d")]);
    await Promise.resolve();
    finish({ marker: 2 });
    await both;

    expect(mockGetTrafficSummary).toHaveBeenCalledTimes(1);
  });
});
