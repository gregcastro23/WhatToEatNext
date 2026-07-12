"use client";

/**
 * /tables/[tableId] — table detail across all four lifecycle statuses:
 * planned (edit/invite/RSVP), live (photos + roster; presence room arrives
 * with the flag-gated live layer), memory (frozen artifact + accreting
 * photos/comments), cancelled (tombstone).
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { TableChatPanel } from "@/components/chat/TableChatPanel";
import { CommentList } from "@/components/tables/CommentList";
import { InvitePanel } from "@/components/tables/InvitePanel";
import { LifecycleControls } from "@/components/tables/LifecycleControls";
import { LiveTableRoom } from "@/components/tables/LiveTableRoom";
import { MembersPanel } from "@/components/tables/MembersPanel";
import { PhotoGrid } from "@/components/tables/PhotoGrid";
import { TableCompositePanel } from "@/components/tables/TableCompositePanel";
import {
  ElementChip,
  GlassPanel,
  GradientButton,
  GradientText,
  LabelXS,
} from "@/components/tables/ui";
import { useTable } from "@/hooks/useTables";
import type { TableStatus } from "@/types/table";

const STATUS_HEADLINE: Record<TableStatus, string> = {
  planned: "Upcoming Table",
  live: "Live Table",
  memory: "Table Memory",
  cancelled: "Cancelled Table",
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TableDetailPage() {
  const params = useParams<{ tableId: string }>();
  const tableId = params?.tableId;
  const { table, viewerId, loading, error, statusCode, refetch } = useTable(tableId);
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-xl">
          <GlassPanel className="p-10 text-center">
            <p className="text-alchm-fg-dim">
              {statusCode === 403
                ? "This table is set for its own circle."
                : error || "This table could not be found."}
            </p>
            <Link
              href="/tables"
              className="mt-4 inline-block text-sm text-alchm-copper-bright hover:text-alchm-copper"
            >
              Back to your tables
            </Link>
          </GlassPanel>
        </div>
      </div>
    );
  }

  const isHost = !!viewerId && table.hostId === viewerId;
  const selfMember = viewerId ? table.members.find((m) => m.userId === viewerId) : undefined;
  const isJoined = selfMember?.rsvpStatus === "joined";
  const isInvited = selfMember?.rsvpStatus === "invited";
  const dominant = table.compositeSnapshot?.compositeChart.dominantElement;

  const respond = async (response: "joined" | "declined") => {
    if (!tableId || rsvpBusy) return;
    setRsvpBusy(true);
    setRsvpError(null);
    try {
      const res = await fetch(`/api/tables/${tableId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setRsvpError(data.message || "Could not record your response.");
        return;
      }
      await refetch();
    } catch {
      setRsvpError("Could not record your response.");
    } finally {
      setRsvpBusy(false);
    }
  };

  const venueLabel =
    table.venue.type === "restaurant"
      ? table.venue.name || "A restaurant"
      : table.venue.type === "home"
        ? table.venue.name || "Home"
        : table.venue.name || "Elsewhere";

  const memoryPhotoUrls = table.memory?.photoUrls ?? [];

  return (
    <div className="min-h-screen bg-transparent p-4 text-white md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/tables"
          className="inline-flex items-center gap-1.5 text-sm text-alchm-fg-mute hover:text-alchm-fg"
        >
          <ArrowLeft size={14} aria-hidden />
          Tables
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <LabelXS
              className={
                table.status === "live"
                  ? "text-alchm-violet-bright"
                  : table.status === "cancelled"
                    ? "text-alchm-fg-mute"
                    : "text-alchm-copper-bright"
              }
            >
              {STATUS_HEADLINE[table.status]}
            </LabelXS>
            <GradientText as="h1" className="mt-1 block text-3xl font-extrabold md:text-4xl">
              {table.title}
            </GradientText>
            <p className="mt-2 text-alchm-fg-dim">
              {formatWhen(table.scheduledAt)} · {venueLabel}
            </p>
            {table.description && (
              <p className="mt-2 max-w-2xl text-sm text-alchm-fg-dim">{table.description}</p>
            )}
          </div>
          {dominant && <ElementChip element={dominant}>{`${dominant.toUpperCase()} DOMINANT`}</ElementChip>}
        </div>

        {isHost && (
          <LifecycleControls tableId={table.id} status={table.status} onChanged={() => void refetch()} />
        )}

        {isInvited && table.status !== "cancelled" && table.status !== "memory" && (
          <GlassPanel className="p-5">
            <p className="text-sm text-alchm-fg">You&apos;re invited to this table.</p>
            {rsvpError && <p className="mt-2 text-sm text-rose-400">{rsvpError}</p>}
            <div className="mt-3 flex items-center gap-3">
              <GradientButton onClick={() => void respond("joined")} disabled={rsvpBusy}>
                Join the Table
              </GradientButton>
              <button
                type="button"
                onClick={() => void respond("declined")}
                disabled={rsvpBusy}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-alchm-fg-mute hover:text-alchm-fg disabled:opacity-40"
              >
                Decline
              </button>
            </div>
          </GlassPanel>
        )}

        {/* Live presence room — flag-gated (NEXT_PUBLIC_SPACETIME_LIVE_TABLES),
            renders null when off/disconnected/not-live. Mounted for memory too
            so it can watch the live -> memory transition and fire the
            best-effort module-side session close. Presence only — chat is PR 3. */}
        {(table.status === "live" || table.status === "memory") && (
          <LiveTableRoom
            tableId={table.id}
            tableTitle={table.title}
            tableStatus={table.status}
            members={table.members}
            viewerId={viewerId}
            isHost={isHost}
          />
        )}

        {/* Live Discussion — table chat (PR 3). Ships VISIBLE (not server
            flag-gated); mounts only while live and only for a joined member.
            When the Spacetime chat flag is off/disconnected it runs on the 10s
            Postgres poll. */}
        {table.status === "live" && isJoined && (
          <TableChatPanel
            tableId={table.id}
            isHost={isHost}
            viewerId={viewerId}
            enabled
          />
        )}

        {table.status === "cancelled" ? (
          <GlassPanel className="p-8 text-center">
            <p className="text-alchm-fg-dim">This table was cancelled by the host.</p>
          </GlassPanel>
        ) : (
          <div className="grid gap-6 md:grid-cols-12">
            <div className="space-y-6 md:col-span-7">
              {table.status === "memory" && memoryPhotoUrls.length > 0 && (
                <div className="grid grid-cols-3 grid-rows-2 gap-1 overflow-hidden rounded-[32px]">
                  {memoryPhotoUrls.slice(0, 3).map((url, index) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={url}
                      src={url}
                      alt={`From the table (${index + 1})`}
                      loading="lazy"
                      className={`h-full w-full object-cover ${
                        index === 0 ? "col-span-2 row-span-2" : ""
                      }`}
                    />
                  ))}
                </div>
              )}

              {table.menu.length > 0 && (
                <GlassPanel className="p-5">
                  <LabelXS className="text-alchm-fg-dim">The Sequence</LabelXS>
                  <ul className="mt-3 space-y-2">
                    {table.menu.map((item, index) => (
                      <li key={`${item.name}-${index}`}>
                        <p className="text-lg text-alchm-fg">{item.name}</p>
                        {item.course && (
                          <p className="text-xs text-alchm-fg-mute">{item.course}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </GlassPanel>
              )}

              {(table.status === "live" || table.status === "memory") && (
                <PhotoGrid
                  tableId={table.id}
                  photos={table.photos}
                  canUpload={isJoined}
                  onChanged={() => void refetch()}
                />
              )}

              {(isJoined || isInvited || table.status === "memory") && (
                <CommentList
                  tableId={table.id}
                  hostId={table.hostId}
                  canComment={!!selfMember}
                />
              )}
            </div>

            <div className="space-y-6 md:col-span-5">
              <TableCompositePanel
                tableId={table.id}
                snapshot={table.compositeSnapshot}
                compositeUpdatedAt={table.compositeUpdatedAt}
                isHost={isHost}
                onChanged={() => void refetch()}
              />

              <MembersPanel
                tableId={table.id}
                members={table.members}
                currentUserId={viewerId}
                isHost={isHost}
                onChanged={() => void refetch()}
              />

              {isHost && table.status !== "memory" && (
                <InvitePanel
                  tableId={table.id}
                  invites={table.invites ?? []}
                  onChanged={() => void refetch()}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
