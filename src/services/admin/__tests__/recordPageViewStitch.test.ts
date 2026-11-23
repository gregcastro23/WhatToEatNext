/**
 * @jest-environment node
 *
 * `recordPageView` used to launch `stitchSessionUser` as a bare un-awaited
 * promise. The pageview route returns right after `recordPageView`, Vercel then
 * freezes the instance, and the write left in flight was resumed later as
 * "Query read timeout" with `executionTime` up to 373,723 ms, logged under
 * unrelated routes (production runtime logs, 2026-11-22 22:38-22:44Z).
 *
 * It now goes through `runAfterResponse`, which registers it with `after()`.
 *
 * @file src/services/admin/__tests__/recordPageViewStitch.test.ts
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

interface FakeResult {
  command: string;
  rowCount: number;
  oid: number;
  fields: never[];
  rows: Record<string, unknown>[];
}

const EMPTY: FakeResult = { command: "SELECT", rowCount: 0, oid: 0, fields: [], rows: [] };

// `mock`-prefixed so jest lets the factories close over them; read lazily at call time.
const mockAfterTasks: Array<() => Promise<void>> = [];
const mockExecuteQuery = jest.fn<(...args: unknown[]) => Promise<FakeResult>>();

jest.mock("next/server", () => ({
  ...jest.requireActual<Record<string, unknown>>("next/server"),
  after: (task: () => Promise<void>) => {
    mockAfterTasks.push(task);
  },
}));
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));
jest.mock("@/services/admin/webhookAlertService", () => ({
  evaluatePageViewWebhookAlerts: () => Promise.resolve(false),
  evaluateFeedbackWebhookAlert: () => Promise.resolve(false),
}));

import { recordPageView } from "@/services/admin/trafficAnalyticsService";
import type { PageViewInsert } from "@/services/admin/trafficTypes";

const SIGNED_IN: PageViewInsert = {
  path: "/recipes",
  referrerHost: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  visitorHash: "visitor-hash",
  sessionId: "session-1",
  userId: "user-1",
  country: null,
  region: null,
  city: null,
  deviceType: "desktop",
  browser: null,
  os: null,
  isBot: false,
};

const flush = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));
const sqlSoFar = (): string[] => mockExecuteQuery.mock.calls.map((call) => String(call[0]));
const stitchIssued = (): boolean => sqlSoFar().some((sql) => sql.includes("UPDATE page_views"));

function registeredTask(): () => Promise<void> {
  const task = mockAfterTasks[0];
  if (!task) throw new Error("the stitch was not registered with after()");
  return task;
}

beforeEach(() => {
  mockAfterTasks.length = 0;
  mockExecuteQuery.mockReset();
  mockExecuteQuery.mockResolvedValue(EMPTY);
});

describe("recordPageView: the session stitch", () => {
  it("registers the stitch with after() and does not start it, so the response never leaves it in flight", async () => {
    const recorded = await recordPageView(SIGNED_IN);

    expect(recorded).toBe(true);
    expect(mockAfterTasks).toHaveLength(1);
    expect(sqlSoFar()).toHaveLength(1);
    expect(sqlSoFar()[0]).toContain("INSERT INTO page_views");
    expect(stitchIssued()).toBe(false);
  });

  it("runs the stitch when after() fires, and holds the invocation open until it settles", async () => {
    let release: (value: FakeResult) => void = () => undefined;
    await recordPageView(SIGNED_IN);
    mockExecuteQuery.mockImplementationOnce(
      () =>
        new Promise<FakeResult>((resolve) => {
          release = resolve;
        }),
    );

    let finished = false;
    const running = registeredTask()().then(() => {
      finished = true;
    });
    await flush();
    expect(stitchIssued()).toBe(true);
    expect(finished).toBe(false); // after() awaits it, which is what keeps the instance alive

    release(EMPTY);
    await running;
    expect(finished).toBe(true);
  });

  it("stays non-fatal when the stitch write fails", async () => {
    const recorded = await recordPageView(SIGNED_IN);
    mockExecuteQuery.mockRejectedValueOnce(new Error("Query read timeout"));

    await expect(registeredTask()()).resolves.toBeUndefined();
    expect(recorded).toBe(true);
    expect(stitchIssued()).toBe(true);
  });

  it.each([
    ["a bot", { ...SIGNED_IN, isBot: true }],
    ["an anonymous visitor", { ...SIGNED_IN, userId: null }],
    ["a page view with no session", { ...SIGNED_IN, sessionId: null }],
  ])("registers no stitch for %s (a control: unchanged behaviour)", async (_label, row) => {
    await recordPageView(row);

    expect(mockAfterTasks).toHaveLength(0);
    expect(stitchIssued()).toBe(false);
  });
});
