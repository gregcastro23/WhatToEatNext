"use client";

/**
 * TableLiveCollaborativePlanner — Real-time menu sequence voting & cursor presence
 * for dinner table guests.
 *
 * Built with SpacetimeDB live synchronization (TableMealVote, TableCursorPresence).
 * Features:
 * - Live consensus voting (+1 Upvote, -1 Restriction/Dislike, 0 Neutral)
 * - Guest focus presence rings (displays which guests are viewing which courses)
 * - Silent fallback to static menu view when offline or not connected
 */

import { Heart, ThumbsDown, Sparkles, ChefHat, Utensils, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { GlassPanel, LabelXS } from "@/components/tables/ui";
import { useSpacetimeTable } from "@/hooks/useSpacetimeTable";
import type { TableMenuItem } from "@/types/table";

export type CourseProgressionStatus = "upcoming" | "prep" | "cooking" | "served" | "completed";

const NEXT_STATUS_MAP: Record<CourseProgressionStatus, CourseProgressionStatus> = {
  upcoming: "prep",
  prep: "cooking",
  cooking: "served",
  served: "completed",
  completed: "upcoming",
};

const STATUS_CONFIG: Record<
  CourseProgressionStatus,
  { label: string; bg: string; border: string; text: string; dot: string; icon: typeof ChefHat }
> = {
  upcoming: {
    label: "Up Next",
    bg: "bg-white/[0.04]",
    border: "border-white/10",
    text: "text-alchm-fg-mute",
    dot: "bg-white/40",
    icon: Utensils,
  },
  prep: {
    label: "Prepping",
    bg: "bg-sky-400/10",
    border: "border-sky-400/30",
    text: "text-sky-300",
    dot: "bg-sky-400",
    icon: ChefHat,
  },
  cooking: {
    label: "In the Pan",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    text: "text-amber-300",
    dot: "bg-amber-400 animate-pulse",
    icon: ChefHat,
  },
  served: {
    label: "Served",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
    icon: Utensils,
  },
  completed: {
    label: "Cleared",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
    text: "text-purple-300",
    dot: "bg-purple-400",
    icon: CheckCircle2,
  },
};

interface TableLiveCollaborativePlannerProps {
  tableId: string;
  menu: TableMenuItem[];
  canVote: boolean;
  viewerId: string | null;
  isHost?: boolean;
  className?: string;
  onUpdateCourseStatus?: (itemRef: string, status: CourseProgressionStatus) => void;
}

export function TableLiveCollaborativePlanner({
  tableId,
  menu,
  canVote,
  viewerId,
  isHost = false,
  className = "",
  onUpdateCourseStatus,
}: TableLiveCollaborativePlannerProps): React.JSX.Element | null {
  const {
    live,
    votesByRecipeRef,
    cursorsBySlotRef,
    voteMeal,
    setCursor,
    clearCursor,
  } = useSpacetimeTable(tableId, { viewerId });

  const [votingBusyRef, setVotingBusyRef] = useState<string | null>(null);
  const [courseStatuses, setCourseStatuses] = useState<Record<string, CourseProgressionStatus>>({});

  if (menu.length === 0) {
    return null;
  }

  const handleVote = async (
    recipeRef: string,
    recipeName: string,
    currentVote: number,
    targetScore: number,
  ): Promise<void> => {
    if (!canVote || votingBusyRef) return;
    setVotingBusyRef(recipeRef);

    // If clicking same button, toggle off (0)
    const newScore = currentVote === targetScore ? 0 : targetScore;
    try {
      await voteMeal(recipeRef, recipeName, newScore);
    } finally {
      setVotingBusyRef(null);
    }
  };

  return (
    <GlassPanel className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LabelXS className="text-alchm-fg-dim">The Sequence</LabelXS>
          {live && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
              </span>
              Live Consensus
            </span>
          )}
        </div>
        {canVote && (
          <span className="text-[11px] text-alchm-fg-mute">
            Tap to vote on menu consensus
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {menu.map((item, index) => {
          const itemRef = item.recipeRef ?? item.name;
          const voteData = votesByRecipeRef[itemRef] ?? {
            recipeRef: itemRef,
            recipeName: item.name,
            totalScore: 0,
            upvotes: 0,
            downvotes: 0,
            voters: [],
            viewerVote: 0,
          };

          const cursorData = cursorsBySlotRef[itemRef];
          const activeGuests = cursorData?.activeGuests ?? [];

          const hasPositiveConsensus = voteData.totalScore > 0;

          const itemStatus = item.status as CourseProgressionStatus | undefined;
          const currentStatus: CourseProgressionStatus =
            courseStatuses[itemRef] ?? itemStatus ?? "upcoming";
          const statusCfg = STATUS_CONFIG[currentStatus];
          const StatusIcon = statusCfg.icon;

          const toggleStatus = (): void => {
            const nextStatus = NEXT_STATUS_MAP[currentStatus];
            setCourseStatuses((prev) => ({ ...prev, [itemRef]: nextStatus }));
            onUpdateCourseStatus?.(itemRef, nextStatus);
          };

          return (
            <li
              key={`${item.name}-${index}`}
              className={`group relative rounded-xl border p-3.5 transition-all ${
                activeGuests.length > 0
                  ? "border-amber-400/50 bg-white/[0.04] shadow-md shadow-amber-500/10"
                  : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.03]"
              }`}
            >

              {/* Active viewing presence pills on course */}
              {activeGuests.length > 0 && (
                <div className="absolute -top-2.5 right-3 flex items-center gap-1.5">
                  {activeGuests.map((guest) => (
                    <span
                      key={guest.memberHex}
                      style={{
                        borderColor: guest.colorHex,
                        backgroundColor: `${guest.colorHex}22`,
                        color: guest.colorHex,
                      }}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold shadow-sm backdrop-blur-md"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: guest.colorHex }}
                      />
                      {guest.displayName.split(" ")[0]}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-alchm-fg-mute">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <p className="text-base font-semibold text-alchm-fg truncate">
                      {item.name}
                    </p>
                    {hasPositiveConsensus && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                        <Sparkles size={10} />
                        +{voteData.totalScore}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {item.course && (
                      <span className="text-xs text-alchm-fg-mute font-mono">
                        {item.course}
                      </span>
                    )}
                    {/* Course progression badge / host interactive toggle */}
                    {isHost ? (
                      <button
                        type="button"
                        onClick={toggleStatus}
                        title="Click to advance course stage"
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all hover:scale-105 active:scale-95 ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        <StatusIcon size={10} />
                        {statusCfg.label}
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        <StatusIcon size={10} />
                        {statusCfg.label}
                      </span>
                    )}
                  </div>

                  {/* Voters list pill indicator */}
                  {voteData.voters.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-alchm-fg-dim">
                      <span className="text-alchm-fg-mute">Voted by:</span>
                      {voteData.voters.map((voter, vIdx) => (
                        <span
                          key={`${voter.memberHex}-${vIdx}`}
                          className={`rounded px-1.5 py-0.2 text-[9px] font-medium ${
                            voter.score > 0
                              ? "bg-amber-400/10 text-amber-300"
                              : "bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {voter.name} ({voter.score > 0 ? "♥" : "✕"})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Voting Affordances */}
                {canVote && live && (
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {/* Love / Upvote button */}
                    <button
                      type="button"
                      disabled={votingBusyRef === itemRef}
                      onFocus={() => {
                        setCursor(itemRef).catch(() => {});
                      }}
                      onBlur={() => {
                        clearCursor().catch(() => {});
                      }}
                      onMouseEnter={() => {
                        setCursor(itemRef).catch(() => {});
                      }}
                      onMouseLeave={() => {
                        clearCursor().catch(() => {});
                      }}
                      onClick={() => {
                        handleVote(
                          itemRef,
                          item.name,
                          voteData.viewerVote,
                          1,
                        ).catch(() => {});
                      }}
                      aria-label={`Vote love for ${item.name}`}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        voteData.viewerVote === 1
                          ? "border border-amber-400/60 bg-amber-400/20 text-amber-300 shadow-sm shadow-amber-500/20"
                          : "border border-white/10 bg-white/5 text-alchm-fg-mute hover:border-amber-400/30 hover:text-alchm-fg"
                      }`}
                    >
                      <Heart
                        size={13}
                        className={
                          voteData.viewerVote === 1
                            ? "fill-amber-400 text-amber-400"
                            : ""
                        }
                      />
                      {voteData.upvotes > 0 && (
                        <span className="font-mono text-[11px]">
                          {voteData.upvotes}
                        </span>
                      )}
                    </button>

                    {/* Restriction / Dislike button */}
                    <button
                      type="button"
                      disabled={votingBusyRef === itemRef}
                      onFocus={() => {
                        setCursor(itemRef).catch(() => {});
                      }}
                      onBlur={() => {
                        clearCursor().catch(() => {});
                      }}
                      onMouseEnter={() => {
                        setCursor(itemRef).catch(() => {});
                      }}
                      onMouseLeave={() => {
                        clearCursor().catch(() => {});
                      }}
                      onClick={() => {
                        handleVote(
                          itemRef,
                          item.name,
                          voteData.viewerVote,
                          -1,
                        ).catch(() => {});
                      }}
                      aria-label={`Vote restriction or dislike for ${item.name}`}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                        voteData.viewerVote === -1
                          ? "border border-rose-500/60 bg-rose-500/20 text-rose-300 shadow-sm shadow-rose-500/20"
                          : "border border-white/10 bg-white/5 text-alchm-fg-mute hover:border-rose-400/30 hover:text-alchm-fg"
                      }`}
                    >
                      <ThumbsDown
                        size={12}
                        className={
                          voteData.viewerVote === -1
                            ? "fill-rose-400 text-rose-400"
                            : ""
                        }
                      />
                      {voteData.downvotes > 0 && (
                        <span className="font-mono text-[11px]">
                          {voteData.downvotes}
                        </span>
                      )}
                    </button>
                  </div>
                )}


              </div>
            </li>


          );
        })}
      </ul>
    </GlassPanel>
  );
}

export default TableLiveCollaborativePlanner;
