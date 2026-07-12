"use client";

/**
 * Table roster: avatar + real name + RsvpChip per member. Host can remove
 * anyone (except their own host row — leaving means cancelling); a member
 * can remove themselves.
 */

import { useState } from "react";
import { GlassPanel, LabelXS, RsvpChip } from "@/components/tables/ui";
import { AvatarCircle } from "@/components/tables/ui/AvatarCircle";
import type { Element } from "@/components/tables/ui/elements";
import type { TableMember } from "@/types/table";
import type { JSX } from "react";

export interface MembersPanelProps {
  tableId: string;
  members: TableMember[];
  currentUserId: string | null;
  isHost: boolean;
  onChanged?: () => void;
  className?: string;
}

const ELEMENT_CYCLE: Element[] = ["Fire", "Water", "Earth", "Air"];

function elementForMember(member: TableMember, index: number): Element {
  // Real photo when available (AvatarCircle); otherwise a deterministic
  // sigil so the same member always renders the same glyph.
  return ELEMENT_CYCLE[index % ELEMENT_CYCLE.length];
}

export function MembersPanel({
  tableId,
  members,
  currentUserId,
  isHost,
  onChanged,
  className = "",
}: MembersPanelProps): JSX.Element {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    setBusyId(memberId);
    setError(null);
    try {
      const res = await fetch(`/api/tables/${tableId}/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setError(data.message || "Could not remove this member.");
        return;
      }
      onChanged?.();
    } catch {
      setError("Could not remove this member.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <GlassPanel className={`p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <LabelXS className="text-alchm-fg-dim">Who&apos;s at the table</LabelXS>
        <LabelXS className="text-alchm-fg-mute">{members.length}</LabelXS>
      </div>

      {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

      <ul className="space-y-3">
        {members.map((member, index) => {
          const isSelf = !!currentUserId && member.userId === currentUserId;
          const canRemove = member.role !== "host" && (isHost || isSelf);
          return (
            <li key={member.id} className="flex items-center gap-3">
              <AvatarCircle
                name={member.name || member.displayName || "Guest"}
                src={member.avatarUrl}
                element={elementForMember(member, index)}
                size={36}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-alchm-fg">
                  {member.name || member.displayName || "Guest"}
                  {member.role === "host" && (
                    <span className="ml-1.5 text-xs text-alchm-copper-bright">Host</span>
                  )}
                  {member.isAgent && (
                    <span className="ml-1.5 text-xs text-alchm-fg-mute">Agent</span>
                  )}
                </p>
              </div>
              <RsvpChip status={member.rsvpStatus} />
              {canRemove && (
                <button
                  type="button"
                  onClick={() => void handleRemove(member.id)}
                  disabled={busyId === member.id}
                  className="text-xs text-alchm-fg-mute hover:text-rose-400 disabled:opacity-40"
                  aria-label={`Remove ${member.name || "guest"}`}
                >
                  {isSelf ? "Leave" : "Remove"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}

export default MembersPanel;
