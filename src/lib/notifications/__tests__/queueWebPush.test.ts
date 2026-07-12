/**
 * queueWebPush + webPush sender — triple-gate + prune-on-410 (PR 5).
 * web-push is mocked; the sender's DB access is mocked. Recipient fixtures are
 * the historical-agent roster (design-spec §4.8): Nikola Tesla.
 */

const mockSetVapidDetails = jest.fn();
const mockSendNotification = jest.fn();

jest.mock("web-push", () => ({
  __esModule: true,
  default: {
    setVapidDetails: (...a: unknown[]) => mockSetVapidDetails(...a),
    sendNotification: (...a: unknown[]) => mockSendNotification(...a),
  },
}));

jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));
jest.mock("@/lib/logger", () => ({ _logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() } }));

import { executeQuery } from "@/lib/database";
import { queueWebPush } from "@/lib/notifications/queueWebPush";

const TESLA = "22222222-2222-4222-8222-222222222222";
const mockQuery = executeQuery as jest.Mock;

const ORIGINAL_ENV = { ...process.env };

/** A flush helper — queueWebPush is fire-and-forget (void async IIFE). */
const flush = () => new Promise((r) => setTimeout(r, 0));

function eligiblePayload(type = "comment_received") {
  return { type, title: "New comment", body: "Marie Curie commented on your dish", url: "/feed#event-x" };
}

describe("queueWebPush gating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    process.env.VAPID_PUBLIC_KEY = "pub";
    process.env.VAPID_PRIVATE_KEY = "priv";
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("bails when WEB_PUSH_ENABLED is not 'true' (kill switch)", async () => {
    delete process.env.WEB_PUSH_ENABLED;
    queueWebPush(TESLA, eligiblePayload());
    await flush();
    expect(mockSendNotification).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("bails for an ineligible type even when enabled", async () => {
    process.env.WEB_PUSH_ENABLED = "true";
    queueWebPush(TESLA, eligiblePayload("reaction_received")); // poll-only
    await flush();
    expect(mockSendNotification).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("bails when the recipient set preferences.push.enabled = false", async () => {
    process.env.WEB_PUSH_ENABLED = "true";
    mockQuery.mockResolvedValueOnce({ rows: [{ disabled: true }] }); // pref → disabled
    queueWebPush(TESLA, eligiblePayload());
    await flush();
    expect(mockSendNotification).not.toHaveBeenCalled();
  });

  it("sends when all gates pass", async () => {
    process.env.WEB_PUSH_ENABLED = "true";
    mockQuery
      .mockResolvedValueOnce({ rows: [{ disabled: false }] }) // pref
      .mockResolvedValueOnce({
        rows: [{ id: "s1", endpoint: "https://push/1", p256dh: "k", auth: "a" }],
      }) // subs
      .mockResolvedValue({ rows: [] }); // last_used_at update
    mockSendNotification.mockResolvedValue({});
    queueWebPush(TESLA, eligiblePayload());
    await flush();
    await flush();
    expect(mockSetVapidDetails).toHaveBeenCalled();
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    const [sub, body, opts] = mockSendNotification.mock.calls[0];
    expect(sub.endpoint).toBe("https://push/1");
    expect(JSON.parse(body).title).toBe("New comment");
    expect(opts.TTL).toBe(24 * 60 * 60);
  });

  it("prunes a dead subscription on 410 Gone", async () => {
    process.env.WEB_PUSH_ENABLED = "true";
    const deleteCalls: unknown[][] = [];
    mockQuery.mockImplementation((sql: string, params?: unknown[]) => {
      if (sql.includes("preferences")) return Promise.resolve({ rows: [{ disabled: false }] });
      if (sql.includes("SELECT id, endpoint")) {
        return Promise.resolve({ rows: [{ id: "dead", endpoint: "https://push/gone", p256dh: "k", auth: "a" }] });
      }
      if (sql.includes("DELETE FROM push_subscriptions")) {
        deleteCalls.push(params ?? []);
        return Promise.resolve({ rows: [], rowCount: 1 });
      }
      return Promise.resolve({ rows: [] });
    });
    mockSendNotification.mockRejectedValue({ statusCode: 410 });
    queueWebPush(TESLA, eligiblePayload());
    await flush();
    await flush();
    expect(deleteCalls).toHaveLength(1);
    expect(deleteCalls[0]).toEqual(["dead"]);
  });
});
