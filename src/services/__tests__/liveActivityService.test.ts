/**
 * `LiveActivityPayload.live` is documented as "True only when every source
 * query succeeded". It was structurally incapable of being false: all six
 * readers caught their own errors and returned `[]`, so every promise handed
 * to `Promise.allSettled` was fulfilled and `every(fulfilled)` was a tautology.
 *
 * The visible consequence was the worst kind: a total database outage rendered
 * as a green "all sources live" feed reading "Quiet — no activity".
 */

import { getLiveActivity } from "@/services/liveActivityService";

// NOTE: the service imports from "@/lib/database/connection", not
// "@/lib/database". Mocking the wrong path leaves the real executeQuery in
// place, which rejects under the no-network test env — the failure assertions
// would then pass for entirely the wrong reason.
jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const { executeQuery } = jest.requireMock("@/lib/database/connection") as {
  executeQuery: jest.Mock;
};

describe("getLiveActivity live flag", () => {
  beforeEach(() => {
    executeQuery.mockReset();
  });

  it("reports live: false when every source query fails", async () => {
    executeQuery.mockRejectedValue(new Error("connection refused"));

    const payload = await getLiveActivity();

    // The whole point: a dead database must not read as a healthy quiet feed.
    expect(payload.live).toBe(false);
    expect(payload.events).toEqual([]);
  });

  it("reports live: false when only one source fails", async () => {
    let call = 0;
    executeQuery.mockImplementation(() => {
      call += 1;
      if (call === 1) return Promise.reject(new Error("one source down"));
      return Promise.resolve({ rows: [] });
    });

    const payload = await getLiveActivity();

    expect(payload.live).toBe(false);
  });

  it("reports live: true when every source succeeds, even with no rows", async () => {
    executeQuery.mockResolvedValue({ rows: [] });

    const payload = await getLiveActivity();

    // A genuinely quiet window is a real measurement, not a degraded one.
    expect(payload.live).toBe(true);
    expect(payload.events).toEqual([]);
  });
});
