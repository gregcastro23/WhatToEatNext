"use client";

/**
 * ShareMenuModal — modal to share the current weekly menu to the community feed.
 *
 * @file src/components/menu-planner/modals/ShareMenuModal.tsx
 */

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { useShareIdentityDefault } from "@/hooks/useShareIdentityDefault";
import { readJson } from "@/lib/api/json";
import { shareIdentityForPost } from "@/lib/feed/identity";
import { isLiveFeedEnabled } from "@/lib/spacetime/config";
import { publishLiveFeedEvent } from "@/lib/spacetime/liveFeedPublish";
import type { WeeklyMenu } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";
import Sheet from "../shell/Sheet";

const logger = createLogger("ShareMenuModal");

interface FeedShareResponse {
  success: boolean;
  message?: string | undefined;
  completedQuests?:
    | Array<{
        tokenRewardAmount: number;
        tokenRewardType: string;
      }>
    | undefined;
}

const FeedShareResponseSchema: z.ZodType<FeedShareResponse> = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  completedQuests: z
    .array(
      z.object({
        tokenRewardAmount: z.number(),
        tokenRewardType: z.string(),
      }),
    )
    .optional(),
});

interface ShareMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMenu: WeeklyMenu | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ShareMenuModal({
  isOpen,
  onClose,
  currentMenu,
  onSuccess,
  onError,
}: ShareMenuModalProps): React.ReactElement | null {
  const [shareTitle, setShareTitle] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [postAnonymously, setPostAnonymously] = useState(false);

  const { shareByDefault } = useShareIdentityDefault();
  const { connection: stdbConnection, status: stdbStatus } = useSpacetime();
  const { data: authSession } = useSession();

  useEffect(() => {
    if (isOpen) {
      setShareTitle("");
      setPostAnonymously(!shareByDefault);
    }
  }, [isOpen, shareByDefault]);

  if (!isOpen || !currentMenu) return null;

  const handleShare = async (): Promise<void> => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const mealCount = currentMenu.meals.filter((m) => m.recipe).length;
      const res = await fetch("/api/feed/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareType: "menu",
          shareIdentity: shareIdentityForPost(postAnonymously, shareByDefault),
          payload: {
            menuTitle: shareTitle.trim() || "a weekly menu",
            weekStartDate: currentMenu.weekStartDate,
            mealCount,
          },
        }),
      });
      const data = await readJson(res, {
        parse: FeedShareResponseSchema.parse,
      });
      if (data.success) {
        let questMessage = "";
        const [rewardQuest] = data.completedQuests ?? [];
        if (rewardQuest) {
          questMessage = ` ✨ +${rewardQuest.tokenRewardAmount} ${rewardQuest.tokenRewardType} — the Work notices.`;
        }
        if (isLiveFeedEnabled() && stdbConnection && stdbStatus === "connected") {
          publishLiveFeedEvent(stdbConnection, {
            actorName: postAnonymously ? "" : (authSession?.user?.name ?? ""),
            eventType: "shared_menu",
            payload: {
              menuTitle: shareTitle.trim() || "a weekly menu",
              weekStartDate: currentMenu.weekStartDate,
              mealCount,
            },
          });
        }
        onSuccess(`Successfully shared to community feed!${questMessage}`);
        onClose();
      } else {
        onError(data.message ?? "Failed to share to feed");
      }
    } catch (err) {
      onError("Error sharing menu to feed");
      logger.error("Error sharing menu to feed:", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open && !isSharing) onClose(); }} title="Share Menu to Feed" description="Publish your weekly plan to the community feed.">
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="share-menu-title" className="block mb-2 text-xs font-mono uppercase text-on-surface-variant font-semibold">
              Menu Title / Note
            </label>
            <input
              id="share-menu-title"
              type="text"
              value={shareTitle}
              onChange={(e) => setShareTitle(e.target.value)}
              placeholder="e.g., Autumn High-Protein Alchemical Week"
              className="w-full px-4 py-2 border border-muted bg-surface-container-low text-primary text-sm rounded-xl focus:border-active-violet focus:outline-none placeholder:text-on-surface-variant/40"
            />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer p-3 bg-surface-container-low rounded-xl border border-muted">
            <input
              type="checkbox"
              checked={postAnonymously}
              onChange={(e) => setPostAnonymously(e.target.checked)}
              className="form-checkbox h-4 w-4 text-active-violet rounded border-muted bg-surface-container-lowest focus:ring-active-violet"
            />
            <span className="text-xs text-primary font-medium">
              Post anonymously (hide my handle)
            </span>
          </label>
        </div>

        <div className="p-5 border-t border-muted bg-surface-container-lowest/80 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSharing}
            className="flex-1 px-4 py-2 border border-muted text-on-surface-variant hover:text-white rounded-xl text-xs font-mono uppercase font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { handleShare().catch(() => {}); }}
            disabled={isSharing}
            className="flex-1 px-4 py-2 bg-active-violet text-background font-semibold rounded-xl text-xs font-mono uppercase hover:bg-white transition-all cursor-pointer disabled:opacity-50"
          >
            {isSharing ? "Sharing..." : "Share to Feed"}
          </button>
        </div>
    </Sheet>
  );
}
