"use client";

/**
 * /messages/[conversationId] — a single DM/circle thread
 * (docs/plans/pr3-messaging-plan.md §5). Flag-gated; the ConversationView
 * resolves the viewer id and streams messages over the adaptive poll.
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ConversationView } from "@/components/chat/ConversationView";
import { GlassPanel } from "@/components/tables/ui/GlassPanel";
import {
  isCirclesEnabledClient,
  isDmsEnabledClient,
} from "@/lib/chat/flags";
import type { JSX } from "react";

export default function ConversationPage(): JSX.Element {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params?.conversationId;
  const enabled = isDmsEnabledClient() || isCirclesEnabledClient();

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col p-4 md:p-6">
      <Link
        href="/messages"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-alchm-fg-mute hover:text-alchm-fg"
      >
        <ArrowLeft size={14} aria-hidden />
        Messages
      </Link>

      {!enabled || !conversationId ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-alchm-fg-mute">This conversation isn&apos;t available.</p>
        </GlassPanel>
      ) : (
        <GlassPanel className="flex min-h-0 flex-1 flex-col p-4">
          <ConversationView conversationId={conversationId} className="min-h-0 flex-1" />
        </GlassPanel>
      )}
    </div>
  );
}
