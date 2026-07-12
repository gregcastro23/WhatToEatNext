/**
 * notificationDatabase.createOrBumpEventNotification — insert vs bump (PR 5).
 * Exercises the in-memory fallback (no DATABASE_URL) so the insert→bump→bump
 * count/message progression is deterministic. Fixture identities are the
 * historical-agent roster (design-spec §4.8).
 */

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { notificationDatabase } from "@/services/notificationDatabaseService";

const TESLA = "22222222-2222-4222-8222-222222222222"; // recipient (poster)
const CURIE = "11111111-1111-4111-8111-111111111111"; // actor 1
const JUNG = "33333333-3333-4333-8333-333333333333"; // actor 2
const BOHR = "44444444-4444-4444-8444-444444444444"; // actor 3

// Force the in-memory path.
const savedDbUrl = process.env.DATABASE_URL;
beforeAll(() => {
  delete process.env.DATABASE_URL;
});
afterAll(() => {
  if (savedDbUrl !== undefined) process.env.DATABASE_URL = savedDbUrl;
});

function bump(actorId: string, actorName: string, eventId: string) {
  return notificationDatabase.createOrBumpEventNotification({
    recipientId: TESLA,
    actorId,
    type: "comment_received",
    eventId,
    title: "New comment",
    firstMessage: `${actorName} commented on your dish`,
    bumpTemplate: "__ACTOR__ and __OTHERS__ others commented on your dish",
    lastActorName: actorName,
  });
}

describe("createOrBumpEventNotification (in-memory)", () => {
  it("inserts the first actor, then bumps count + lastActorName + message", async () => {
    const EVENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01";

    const first = await bump(CURIE, "Marie Curie", EVENT);
    expect(first?.metadata?.count).toBe(1);
    expect(first?.message).toBe("Marie Curie commented on your dish");
    expect(first?.relatedUserId).toBe(CURIE);

    const second = await bump(JUNG, "Carl Jung", EVENT);
    // Same unread row — bumped, not a new insert.
    expect(second?.id).toBe(first?.id);
    expect(second?.metadata?.count).toBe(2);
    expect(second?.metadata?.lastActorName).toBe("Carl Jung");
    // "others" = the pre-increment count (1 prior actor).
    expect(second?.message).toBe("Carl Jung and 1 others commented on your dish");

    const third = await bump(BOHR, "Niels Bohr", EVENT);
    expect(third?.id).toBe(first?.id);
    expect(third?.metadata?.count).toBe(3);
    expect(third?.message).toBe("Niels Bohr and 2 others commented on your dish");
  });

  it("keeps separate rows per event", async () => {
    const EVENT_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02";
    const EVENT_B = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03";
    const a = await bump(CURIE, "Marie Curie", EVENT_A);
    const b = await bump(JUNG, "Carl Jung", EVENT_B);
    expect(a?.id).not.toBe(b?.id);
    expect(a?.metadata?.eventId).toBe(EVENT_A);
    expect(b?.metadata?.eventId).toBe(EVENT_B);
  });
});
