/**
 * @jest-environment node
 *
 * notificationDatabaseService.updateJoinRequestStatus (PR 6 adversarial-review
 * fix): flips a table_join_request notification's own lifecycle status
 * (pending → actioned | dismissed) independent of `is_read`, so merely
 * viewing a request can never destroy its actionability or unblock dedupe.
 *
 * No DATABASE_URL is set in the test env, so the service runs its in-memory
 * fallback store — the same fallback contract every other method here already
 * exercises when a DB module isn't available.
 *
 * Real roster identities (design-spec §4.8).
 */

import { notificationDatabase } from "@/services/notificationDatabaseService";

const HOST = "10000000-0000-0000-0000-000000000001"; // da Vinci
const OTHER = "20000000-0000-0000-0000-000000000002"; // Curie

describe("notificationDatabase.updateJoinRequestStatus", () => {
  it("flips status to 'actioned' and marks the row read, independent of a prior read", async () => {
    const notif = await notificationDatabase.createNotification(
      HOST,
      "table_join_request",
      "Ask to Join",
      "Someone would like to join.",
      {
        relatedUserId: OTHER,
        metadata: { tableId: "t-actioned", requesterId: OTHER, requesterName: "Marie Curie", status: "pending" },
      },
    );
    expect(notif).toBeTruthy();

    // Simulate the panel's click-to-read happening BEFORE any action.
    await notificationDatabase.markAsRead(notif!.id, HOST);

    const ok = await notificationDatabase.updateJoinRequestStatus(notif!.id, HOST, "actioned");
    expect(ok).toBe(true);

    const all = await notificationDatabase.getNotificationsForUser(HOST, { limit: 50 });
    const reloaded = all.find((n) => n.id === notif!.id);
    expect(reloaded?.metadata?.status).toBe("actioned");
    expect(reloaded?.isRead).toBe(true);
  });

  it("flips status to 'dismissed'", async () => {
    const notif = await notificationDatabase.createNotification(
      HOST,
      "table_join_request",
      "Ask to Join",
      "Someone would like to join.",
      { metadata: { tableId: "t-dismissed", requesterId: OTHER, status: "pending" } },
    );
    const ok = await notificationDatabase.updateJoinRequestStatus(notif!.id, HOST, "dismissed");
    expect(ok).toBe(true);

    const all = await notificationDatabase.getNotificationsForUser(HOST, { limit: 50 });
    const reloaded = all.find((n) => n.id === notif!.id);
    expect(reloaded?.metadata?.status).toBe("dismissed");
    expect(reloaded?.isRead).toBe(true);
  });

  it("refuses to update a notification owned by a different user", async () => {
    const notif = await notificationDatabase.createNotification(
      HOST,
      "table_join_request",
      "Ask to Join",
      "Someone would like to join.",
      { metadata: { tableId: "t-foreign", requesterId: OTHER, status: "pending" } },
    );
    const ok = await notificationDatabase.updateJoinRequestStatus(notif!.id, OTHER, "actioned");
    expect(ok).toBe(false);

    const all = await notificationDatabase.getNotificationsForUser(HOST, { limit: 50 });
    const reloaded = all.find((n) => n.id === notif!.id);
    expect(reloaded?.metadata?.status).toBe("pending"); // untouched
  });

  it("returns false for a non-existent notification id", async () => {
    const ok = await notificationDatabase.updateJoinRequestStatus("notif_does_not_exist", HOST, "actioned");
    expect(ok).toBe(false);
  });
});
