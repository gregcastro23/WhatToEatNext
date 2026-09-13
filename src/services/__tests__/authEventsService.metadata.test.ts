/**
 * @jest-environment node
 *
 * Regression coverage: In-memory auth event logging and retrieval
 * when event.metadata is undefined vs provided.
 */

delete process.env.DATABASE_URL;

import { logAuthEvent, getUserEvents } from "@/services/authEventsService";

describe("authEventsService metadata regression coverage", () => {
  it("defaults to empty object when event.metadata is undefined in memory fallback", async () => {
    await logAuthEvent({
      type: "signin_attempt",
      status: "success",
      userId: "test-user-meta-1",
      email: "meta1@example.com",
    });

    const events = await getUserEvents("test-user-meta-1", 10);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]?.metadata).toEqual({});
  });

  it("preserves metadata when event.metadata is provided", async () => {
    await logAuthEvent({
      type: "signin_attempt",
      status: "success",
      userId: "test-user-meta-2",
      email: "meta2@example.com",
      metadata: { role: "admin", reason: "test" },
    });

    const events = await getUserEvents("test-user-meta-2", 10);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]?.metadata).toEqual({ role: "admin", reason: "test" });
  });
});
