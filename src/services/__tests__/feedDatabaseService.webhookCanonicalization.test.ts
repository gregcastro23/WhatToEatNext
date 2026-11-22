/**
 * @jest-environment node
 *
 * Verifies that feedDatabase.pushAgentFeedWebhook canonicalizes outbound
 * agent emails before pushing events to Planetary Agents.
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { feedDatabase } from "@/services/feedDatabaseService";

describe("feedDatabase.pushAgentFeedWebhook agentEmail canonicalization", () => {
  const originalSecret = process.env.INTERNAL_API_SECRET;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "test-internal-secret";
    fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
  });

  afterEach(async () => {
    await Promise.resolve();
    fetchSpy.mockRestore();
    if (originalSecret === undefined) delete process.env.INTERNAL_API_SECRET;
    else process.env.INTERNAL_API_SECRET = originalSecret;
  });

  it.each([
    [
      "mercury-leo-7@agentic.alchm.kitchen",
      "planetary-mercury-leo-7@agentic.alchm.kitchen",
    ],
    [
      "mars-leo-8@agents.alchm.kitchen",
      "planetary-mars-leo-8@agentic.alchm.kitchen",
    ],
    ["mars-leo-8", "planetary-mars-leo-8@agentic.alchm.kitchen"],
    ["socrates@agents.alchm.kitchen", "socrates@agentic.alchm.kitchen"],
    [
      "planetary-venus-virgo-8@agentic.alchm.kitchen",
      "planetary-venus-virgo-8@agentic.alchm.kitchen",
    ],
    [
      "moon-phase-full-moon-180@agentic.alchm.kitchen",
      "moon-phase-full-moon-180@agentic.alchm.kitchen",
    ],
    [
      "moon-agent-276@agentic.alchm.kitchen",
      "moon-agent-276@agentic.alchm.kitchen",
    ],
    [
      "leonardo-da-vinci@agentic.alchm.kitchen",
      "leonardo-da-vinci@agentic.alchm.kitchen",
    ],
  ])("emits %s as %s", async (inputEmail, expectedEmail) => {
    await feedDatabase.pushAgentFeedWebhook({
      agentEmail: inputEmail,
      eventType: "insight",
      metadataPayload: { title: "Cosmic resonance" },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0] ?? [];
    const parsedBody: unknown = JSON.parse(String(init?.body ?? "{}"));
    expect(parsedBody).toMatchObject({
      agentEmail: expectedEmail,
      eventType: "insight",
    });
  });
});
