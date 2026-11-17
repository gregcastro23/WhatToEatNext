/**
 * Threshold webhook alerts: reviewer arrivals, route friction/error spikes,
 * per-session cooldown deduplication, and silent no-op when unconfigured.
 *
 * @file src/services/admin/__tests__/webhookAlertService.test.ts
 */

import type { PageViewInsert } from "@/services/admin/trafficTypes";
import {
  evaluatePageViewWebhookAlerts,
  resetWebhookAlertStateForTests,
} from "@/services/admin/webhookAlertService";

function baseView(overrides: Partial<PageViewInsert> = {}): PageViewInsert {
  return {
    viewId: "v-1",
    path: "/menu-planner",
    referrerHost: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    refTag: null,
    durationMs: 0,
    interactions: [],
    visitorHash: "vis-abc123",
    sessionId: "sess-1",
    userId: null,
    country: "US",
    region: "NY",
    city: "New York",
    deviceType: "desktop",
    browser: "Chrome",
    os: "macOS",
    isBot: false,
    ...overrides,
  };
}

describe("webhookAlertService", () => {
  const origEnv = process.env.ADMIN_ALERT_WEBHOOK_URL;
  const origFetch = global.fetch;

  beforeEach(() => {
    resetWebhookAlertStateForTests();
    delete process.env.ADMIN_ALERT_WEBHOOK_URL;
  });

  afterAll(() => {
    if (origEnv === undefined) delete process.env.ADMIN_ALERT_WEBHOOK_URL;
    else process.env.ADMIN_ALERT_WEBHOOK_URL = origEnv;
    Object.defineProperty(globalThis, "fetch", {
      value: origFetch,
      configurable: true,
      writable: true,
    });
  });

  it("is a silent no-op when ADMIN_ALERT_WEBHOOK_URL is unset", async () => {
    const fetchSpy = jest.fn();
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
      configurable: true,
      writable: true,
    });

    const sent = await evaluatePageViewWebhookAlerts(baseView({ refTag: "prod-smoke" }), 1_000);
    expect(sent).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("alerts on ?ref= reviewer arrivals with per-session cooldown deduplication", async () => {
    process.env.ADMIN_ALERT_WEBHOOK_URL = "https://hooks.example.com/admin-alerts";
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
      configurable: true,
      writable: true,
    });

    const first = await evaluatePageViewWebhookAlerts(baseView({ refTag: "alex-feedback" }), 10_000);
    const second = await evaluatePageViewWebhookAlerts(baseView({ refTag: "alex-feedback" }), 20_000);

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const callInit = fetchSpy.mock.calls[0]?.[1];
    const bodyArg =
      typeof callInit === "object" && callInit !== null && "body" in callInit
        ? String(callInit.body ?? "")
        : "";
    expect(bodyArg).toContain("ref=alex-feedback");
    expect(bodyArg).toContain("/menu-planner");
  });

  it("triggers a friction spike alert when 2+ rage clicks or errors hit a route within 10 minutes", async () => {
    process.env.ADMIN_ALERT_WEBHOOK_URL = "https://hooks.example.com/admin-alerts";
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
      configurable: true,
      writable: true,
    });

    const hit1 = await evaluatePageViewWebhookAlerts(
      baseView({
        sessionId: "sess-a",
        interactions: ["friction:rage_click:/menu-planner:generate"],
      }),
      100_000,
    );
    expect(hit1).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();

    const hit2 = await evaluatePageViewWebhookAlerts(
      baseView({
        sessionId: "sess-b",
        interactions: ["error:api_500:/api/menu-planner"],
      }),
      120_000,
    );
    expect(hit2).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const bodyArg = String(fetchSpy.mock.calls[0]?.[1]?.body ?? "");
    expect(bodyArg).toContain("Friction spike on /menu-planner");
  });
});
