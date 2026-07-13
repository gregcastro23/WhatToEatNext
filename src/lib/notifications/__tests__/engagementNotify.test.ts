/**
 * engagementNotify — reaction/comment bell dispatch + suppression (PR 5).
 * Fixture identities are the historical-agent roster (design-spec §4.8):
 * Marie Curie reacts/comments; Nikola Tesla is the recipient.
 */

jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));
jest.mock("@/lib/feed/commentEnforcement", () => ({ isBlockedBetween: jest.fn() }));
jest.mock("@/lib/social/identity", () => ({ resolveDisplayIdentity: jest.fn() }));
jest.mock("@/lib/logger", () => ({ _logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() } }));
jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: { createOrBumpEventNotification: jest.fn() },
}));

import { executeQuery } from "@/lib/database";
import { isBlockedBetween } from "@/lib/feed/commentEnforcement";
import { resolveDisplayIdentity } from "@/lib/social/identity";
import { notifyCommentReceived, notifyReactionReceived } from "@/lib/notifications/engagementNotify";
import { notificationDatabase } from "@/services/notificationDatabaseService";

const CURIE = "11111111-1111-4111-8111-111111111111"; // actor
const TESLA = "22222222-2222-4222-8222-222222222222"; // recipient
const EVENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const mockQuery = executeQuery as jest.Mock;
const mockBlocked = isBlockedBetween as jest.Mock;
const mockResolve = resolveDisplayIdentity as jest.Mock;
const mockUpsert = notificationDatabase.createOrBumpEventNotification as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [{ is_agent: false }] }); // recipient is human
  mockBlocked.mockResolvedValue(false);
  mockResolve.mockResolvedValue({ [CURIE]: { userId: CURIE, name: "Marie Curie", image: null, isAgent: false, dominantElement: "Water" } });
});

describe("notifyReactionReceived", () => {
  it("dispatches a deduped reaction bell when nothing suppresses it", async () => {
    await notifyReactionReceived({ eventId: EVENT, actorId: CURIE, recipientId: TESLA, kind: "fire" });
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const arg = mockUpsert.mock.calls[0][0];
    expect(arg).toMatchObject({
      recipientId: TESLA,
      actorId: CURIE,
      type: "reaction_received",
      eventId: EVENT,
      lastActorName: "Marie Curie",
    });
    expect(arg.firstMessage).toContain("Marie Curie");
    expect(arg.extraMetadata).toEqual({ kind: "fire" });
    // Copy must never carry a token amount.
    expect(arg.firstMessage).not.toMatch(/\d/);
  });

  it("suppresses a self-reaction (actor === recipient)", async () => {
    await notifyReactionReceived({ eventId: EVENT, actorId: TESLA, recipientId: TESLA, kind: "fire" });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("suppresses an agent recipient", async () => {
    mockQuery.mockResolvedValue({ rows: [{ is_agent: true }] });
    await notifyReactionReceived({ eventId: EVENT, actorId: CURIE, recipientId: TESLA, kind: "fire" });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("suppresses when the pair is blocked (either direction)", async () => {
    mockBlocked.mockResolvedValue(true);
    await notifyReactionReceived({ eventId: EVENT, actorId: CURIE, recipientId: TESLA, kind: "fire" });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("never throws — a failed bell is swallowed", async () => {
    mockUpsert.mockRejectedValue(new Error("db down"));
    await expect(
      notifyReactionReceived({ eventId: EVENT, actorId: CURIE, recipientId: TESLA, kind: "fire" }),
    ).resolves.toBeUndefined();
  });
});

describe("notifyCommentReceived", () => {
  it("dispatches a deduped comment bell", async () => {
    await notifyCommentReceived({ eventId: EVENT, actorId: CURIE, recipientId: TESLA, excerpt: "nice" });
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockUpsert.mock.calls[0][0]).toMatchObject({ type: "comment_received", eventId: EVENT });
  });

  it("suppresses self / agent / blocked", async () => {
    await notifyCommentReceived({ eventId: EVENT, actorId: TESLA, recipientId: TESLA });
    mockBlocked.mockResolvedValue(true);
    await notifyCommentReceived({ eventId: EVENT, actorId: CURIE, recipientId: TESLA });
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
