/**
 * @jest-environment node
 *
 * Regression: `runPostDeployProbes` caps concurrent probe executions at 2 so a
 * fresh deployment's `after()` fan-out stays inside the serverless `pg` pool
 * cap (`DB_MAX_CONNECTIONS=4`).
 */

let inFlight = 0;
let peakInFlight = 0;

function trackProbe(probeName: string) {
  return jest.fn(async () => {
    inFlight += 1;
    peakInFlight = Math.max(peakInFlight, inFlight);
    await new Promise((r) => setTimeout(r, 10));
    inFlight -= 1;
    return {
      probeName,
      startedAt: "",
      completedAt: "",
      status: "success",
      latencyMs: 10,
      httpStatus: 200,
      errorMessage: null,
      responsePayload: {},
    };
  });
}

jest.mock("@/app/api/cron/_lib/cronAuth", () => ({
  getCronBaseUrl: () => "https://alchm.kitchen",
}));

jest.mock("@/services/syntheticProbeService", () => ({
  runOnboardingSkipProbe: trackProbe("onboarding-skip"),
  runRecommendationsProbe: trackProbe("recommendations"),
  runAuthHandshakeProbe: trackProbe("auth-handshake"),
  runAuthSigninProbe: trackProbe("auth-signin"),
  runStripeWebhookProbe: trackProbe("stripe-webhook"),
  runMcpProbe: trackProbe("mcp"),
}));

import { POST_DEPLOY_PROBES, runPostDeployProbes } from "../deploymentHandlers";

describe("runPostDeployProbes", () => {
  beforeEach(() => {
    inFlight = 0;
    peakInFlight = 0;
  });

  it("runs all 6 probes with concurrency capped at 2", async () => {
    const results = await runPostDeployProbes();
    expect(results).toHaveLength(POST_DEPLOY_PROBES.length);
    expect(results.map((r) => r.probeName)).toEqual(POST_DEPLOY_PROBES);
    expect(peakInFlight).toBeGreaterThan(0);
    expect(peakInFlight).toBeLessThanOrEqual(2);
  });
});
