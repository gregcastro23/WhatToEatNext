import { _logger } from "@/lib/logger";
import { getLaunchReadiness } from "@/services/launchReadinessService";
import { summarizeRecent, getRecentRequests } from "@/lib/observability/requestLog";
import {
  LaunchReadinessResponseSchema,
  ObservabilityResponseSchema,
  LiveActivityResponseSchema,
} from "../adminResponseSchemas";

describe("Admin Response Schemas Producer-Bound Round-Trip", () => {
  beforeEach(() => {
    jest.spyOn(_logger, "error").mockImplementation(() => {});
    jest.spyOn(_logger, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("validates live launchReadinessService output through LaunchReadinessResponseSchema", async () => {
    const report = await getLaunchReadiness();
    const wirePayload = { success: true, ...report };

    const parsed = LaunchReadinessResponseSchema.parse(wirePayload);
    expect(parsed.success).toBe(true);
    expect(parsed.subsystems.length).toBeGreaterThan(0);
    expect(typeof parsed.readyCount).toBe("number");
    expect(parsed.settlement).toBeDefined();
    expect(typeof parsed.settlement.live).toBe("boolean");
  });

  it("marks alerting READY when RESEND_API_KEY is set without ALERT_SLACK_WEBHOOK_URL", async () => {
    const prevResend = process.env.RESEND_API_KEY;
    const prevSlack = process.env.ALERT_SLACK_WEBHOOK_URL;
    try {
      process.env.RESEND_API_KEY = "re_test_key";
      delete process.env.ALERT_SLACK_WEBHOOK_URL;
      const report = await getLaunchReadiness();
      const alerting = report.subsystems.find((s) => s.key === "alerting");
      expect(alerting?.status).toBe("READY");
      expect(alerting?.configured).toBe(1);
      expect(alerting?.total).toBe(1);
    } finally {
      if (prevResend === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = prevResend;
      if (prevSlack === undefined) delete process.env.ALERT_SLACK_WEBHOOK_URL;
      else process.env.ALERT_SLACK_WEBHOOK_URL = prevSlack;
    }
  });

  it("validates real observability producer output through ObservabilityResponseSchema", () => {
    const summary = summarizeRecent();
    const recent = getRecentRequests({ limit: 10 });
    const wirePayload = {
      success: true,
      generatedAt: new Date().toISOString(),
      requests: {
        summary,
        recent,
        recentFailures: [],
      },
    };

    const parsed = ObservabilityResponseSchema.parse(wirePayload);
    expect(parsed.success).toBe(true);
    expect(parsed.requests.summary.count).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(parsed.requests.recent)).toBe(true);
  });

  it("validates live activity wire payload with visit category through LiveActivityResponseSchema", () => {
    const payload = {
      success: true,
      generatedAt: new Date().toISOString(),
      windowHours: 6,
      events: [
        {
          id: "visit:123",
          at: new Date().toISOString(),
          category: "visit",
          type: "page_view",
          description: "Anonymous visitor viewed /recipes",
          status: "info",
          actor: null,
        },
      ],
      countsByCategory: {
        signup: 0,
        auth: 0,
        onboarding: 0,
        recipe: 0,
        economy: 0,
        agent: 0,
        diary: 0,
        visit: 1,
      },
      live: true,
    };

    const parsed = LiveActivityResponseSchema.parse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.events[0].category).toBe("visit");
    expect(parsed.live).toBe(true);
  });

  it("rejects malformed admin payload cleanly", () => {
    const badPayload = {
      success: true,
      subsystems: "not-an-array",
    };

    expect(() => LaunchReadinessResponseSchema.parse(badPayload)).toThrow();
  });
});
