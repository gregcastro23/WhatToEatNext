import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { narrateFeedEvent } from "@/lib/feed/eventNarration";
import type { RecentActivity } from "./AgentProfile";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86_400 * 30) return `${Math.floor(diffSec / 86_400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function resolveActivityHref(
  meta: Record<string, unknown> | null,
  narrationHref?: string,
): string | undefined {
  const versionPath = typeof meta?.versionPath === "string" ? meta.versionPath : undefined;
  const versionId = typeof meta?.versionId === "string" ? meta.versionId : undefined;
  if (versionPath) return versionPath;
  if (versionId) return `/recipes/versions/${encodeURIComponent(versionId)}`;
  if (meta?.mcpCatalog === false) return undefined;
  if (narrationHref) return narrationHref;
  const recipeId =
    (typeof meta?.recipeId === "string" && meta.recipeId) ||
    (typeof meta?.recipe_id === "string" && meta.recipe_id) ||
    undefined;
  return recipeId ? `/recipes/${recipeId}` : undefined;
}

function resolveActivityTitle(
  meta: Record<string, unknown> | null,
  fallbackLabel: string,
): string {
  const versionName = typeof meta?.versionName === "string" ? meta.versionName : undefined;
  if (versionName) return versionName;
  const recipeName =
    (typeof meta?.recipeName === "string" && meta.recipeName) ||
    (typeof meta?.title === "string" && meta.title) ||
    (typeof meta?.dishName === "string" && meta.dishName) ||
    undefined;
  return recipeName ?? fallbackLabel;
}

interface ActivityBadgesProps {
  isAdapted: boolean;
  isCritique: boolean;
  isTransmuted: boolean;
  contentState: string | undefined;
}

function ActivityBadges({
  isAdapted,
  isCritique,
  isTransmuted,
  contentState,
}: ActivityBadgesProps): React.ReactElement {
  return (
    <>
      {isAdapted && (
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-300 py-0">
          Saved Adaptation
        </Badge>
      )}
      {isCritique && (
        <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/30 text-purple-300 py-0">
          Critique
        </Badge>
      )}
      {contentState === "curated" && (
        <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-300 py-0">
          Curated
        </Badge>
      )}
      {contentState === "live" && (
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-300 py-0">
          Live
        </Badge>
      )}
      {contentState === "gateway_degraded" && (
        <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-300 py-0">
          Degraded
        </Badge>
      )}
      {isTransmuted && (
        <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-300 py-0">
          Transmuted
        </Badge>
      )}
    </>
  );
}

function ActivityItemHeader({
  narration,
  href,
  displayTitle,
  badges,
  createdAt,
}: {
  narration: { icon: string; action: string };
  href: string | undefined;
  displayTitle: string;
  badges: React.ReactElement;
  createdAt: string;
}): React.ReactElement {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-base select-none">{narration.icon}</span>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            {href ? (
              <Link
                href={href}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1"
              >
                <span>{displayTitle}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </Link>
            ) : (
              <span className="text-xs font-medium text-white/90">
                {displayTitle}
              </span>
            )}
            {badges}
          </div>
          <p className="text-[11px] text-white/60">{narration.action}</p>
        </div>
      </div>
      <span className="text-[10px] text-white/40 font-mono shrink-0">
        {formatRelativeTime(createdAt)}
      </span>
    </div>
  );
}

export function RecentActivityItem({
  event,
}: {
  event: RecentActivity;
}): React.ReactElement {
  const meta = event.metadataPayload;
  const narration = narrateFeedEvent(event.eventType, meta);
  const href = resolveActivityHref(meta, narration.href);
  const displayTitle = resolveActivityTitle(meta, narration.label);
  const reviewText =
    (typeof meta?.review === "string" && meta.review) ||
    (typeof meta?.comment === "string" && meta.comment) ||
    (typeof meta?.reflection === "string" && meta.reflection) ||
    (typeof meta?.insightContent === "string" && meta.insightContent) ||
    undefined;

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors space-y-2">
      <ActivityItemHeader
        narration={narration}
        href={href}
        displayTitle={displayTitle}
        createdAt={event.createdAt}
        badges={
          <ActivityBadges
            isAdapted={event.eventType === "recipe_adapted" || typeof meta?.versionId === "string"}
            isCritique={
              event.eventType === "recipe_review" ||
              meta?.source === "catalog_critique" ||
              meta?.source === "catalog_review"
            }
            isTransmuted={event.eventType === "recipe_generation"}
            contentState={typeof meta?.contentState === "string" ? meta.contentState : undefined}
          />
        }
      />
      {reviewText && (
        <blockquote className="text-xs text-white/80 italic pl-3 border-l-2 border-purple-500/40 bg-white/[0.01] py-1 rounded-r">
          &ldquo;{reviewText}&rdquo;
        </blockquote>
      )}
    </div>
  );
}

