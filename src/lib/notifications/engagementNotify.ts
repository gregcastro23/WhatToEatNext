/**
 * Engagement notification dispatch (PR 5) — fire-and-forget bells for feed
 * reactions and comments. Both funnel through
 * notificationDatabase.createOrBumpEventNotification so the bell shows at most
 * ONE unread row per (recipient, event, type), bumping count + lastActorName
 * as more actors pile on.
 *
 * Suppression (defense-in-depth — writes are already refused for blocked pairs):
 *   • never notify your own action (actorId === recipientId)
 *   • never notify an agent recipient (historical agents don't read bells)
 *   • never notify across a blocked pair (either direction)
 *
 * Copy carries NO token amounts. Metadata carries eventId for the bell deep
 * link (/feed#event-<uuid>). Everything is best-effort: a failed bell must
 * never break the reaction/comment write, so callers invoke with `void …`.
 */

import { executeQuery } from "@/lib/database";
import { isBlockedBetween } from "@/lib/feed/commentEnforcement";
import { _logger } from "@/lib/logger";
import { queueWebPush } from "@/lib/notifications/queueWebPush";
import { resolveDisplayIdentity } from "@/lib/social/identity";
import { notificationDatabase } from "@/services/notificationDatabaseService";

/** Shared gate: resolve the actor's display name unless the notify is suppressed. */
async function gate(actorId: string, recipientId: string): Promise<string | null> {
  if (!actorId || !recipientId || actorId === recipientId) return null;

  // Recipient must be a real human (agents don't read bells).
  const rec = await executeQuery<{ is_agent: boolean }>(
    "SELECT COALESCE(is_agent, false) AS is_agent FROM users WHERE id = $1::uuid",
    [recipientId],
  );
  if (rec.rows.length === 0 || rec.rows[0].is_agent === true) return null;

  // Blocked either direction → stay silent.
  if (await isBlockedBetween(actorId, recipientId)) return null;

  const identities = await resolveDisplayIdentity([actorId]);
  return identities[actorId]?.name ?? "An alchemist";
}

export async function notifyReactionReceived(args: {
  eventId: string;
  actorId: string;
  recipientId: string;
  kind: string;
  dishLabel?: string;
}): Promise<void> {
  try {
    const actorName = await gate(args.actorId, args.recipientId);
    if (!actorName) return;

    const dish = args.dishLabel?.trim() || "your dish";
    await notificationDatabase.createOrBumpEventNotification({
      recipientId: args.recipientId,
      actorId: args.actorId,
      type: "reaction_received",
      eventId: args.eventId,
      title: "New resonance",
      firstMessage: `${actorName} resonated with ${dish}`,
      bumpTemplate: `__ACTOR__ and __OTHERS__ others resonated with ${dish}`,
      lastActorName: actorName,
      extraMetadata: { kind: args.kind },
    });
  } catch (error) {
    _logger.warn("[engagementNotify] reaction bell failed:", error);
  }
}

export async function notifyCommentReceived(args: {
  eventId: string;
  actorId: string;
  recipientId: string;
  excerpt?: string;
  dishLabel?: string;
}): Promise<void> {
  try {
    const actorName = await gate(args.actorId, args.recipientId);
    if (!actorName) return;

    const dish = args.dishLabel?.trim() || "your dish";
    await notificationDatabase.createOrBumpEventNotification({
      recipientId: args.recipientId,
      actorId: args.actorId,
      type: "comment_received",
      eventId: args.eventId,
      title: "New comment",
      firstMessage: `${actorName} commented on ${dish}`,
      bumpTemplate: `__ACTOR__ and __OTHERS__ others commented on ${dish}`,
      lastActorName: actorName,
    });

    // comment_received is push-eligible — queueWebPush is triple-gated + dark by
    // default, so this is a guarded no-op until WEB_PUSH_ENABLED is flipped on.
    queueWebPush(args.recipientId, {
      type: "comment_received",
      title: "New comment",
      body: `${actorName} commented on ${dish}`,
      url: `/feed#event-${args.eventId}`,
      tag: `evt-${args.eventId}`,
    });
  } catch (error) {
    _logger.warn("[engagementNotify] comment bell failed:", error);
  }
}
