"use client";

/**
 * /messages — the inbox (docs/plans/pr3-messaging-plan.md §5). Flag-gated by
 * NEXT_PUBLIC_CHAT_DMS / NEXT_PUBLIC_CHAT_CIRCLES; when both are off the route
 * shows a quiet "not available yet" state rather than 404ing.
 */

import { InboxList } from "@/components/chat/InboxList";
import { GradientText } from "@/components/tables/ui/GradientText";
import { useChatInbox } from "@/hooks/useChatInbox";
import {
  isCirclesEnabledClient,
  isDmsEnabledClient,
} from "@/lib/chat/flags";
import type { JSX } from "react";

export default function MessagesPage(): JSX.Element {
  const enabled = isDmsEnabledClient() || isCirclesEnabledClient();
  const { entries, loading, error } = useChatInbox(enabled);

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <GradientText as="h1" className="block text-2xl font-extrabold md:text-3xl">
        Messages
      </GradientText>

      {!enabled ? (
        <p className="mt-8 text-center text-sm text-alchm-fg-mute">
          Direct messages aren&apos;t open yet.
        </p>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-alchm-fg-mute">{error}</p>
      ) : (
        <InboxList entries={entries} loading={loading} className="mt-6" />
      )}
    </div>
  );
}
