"use client";

/**
 * HostModerationMenu — the per-message affordance menu. Every viewer can
 * report; the sender or the host can delete; the host can also mute/kick the
 * sender. A tiny popover keeps the message row uncluttered.
 */

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";

export interface HostModerationMenuProps {
  isHost: boolean;
  isOwnMessage: boolean;
  onReport: () => void;
  onDelete?: () => void;
  onMuteSender?: () => void;
  onKickSender?: () => void;
}

export function HostModerationMenu({
  isHost,
  isOwnMessage,
  onReport,
  onDelete,
  onMuteSender,
  onKickSender,
}: HostModerationMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const item = "block w-full px-3 py-1.5 text-left text-xs hover:bg-white/5";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Message actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-alchm-bg-elev/80 text-alchm-fg-mute backdrop-blur hover:text-alchm-fg"
      >
        <MoreHorizontal size={14} aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-7 z-10 w-32 overflow-hidden rounded-xl border border-white/10 bg-alchm-bg-elev py-1 shadow-xl"
        >
          {!isOwnMessage && (
            <button type="button" role="menuitem" className={`${item} text-alchm-fg`} onClick={() => { setOpen(false); onReport(); }}>
              Report
            </button>
          )}
          {onDelete && (
            <button type="button" role="menuitem" className={`${item} text-rose-300`} onClick={() => { setOpen(false); onDelete(); }}>
              Delete
            </button>
          )}
          {isHost && onMuteSender && (
            <button type="button" role="menuitem" className={`${item} text-alchm-fg`} onClick={() => { setOpen(false); onMuteSender(); }}>
              Mute sender
            </button>
          )}
          {isHost && onKickSender && (
            <button type="button" role="menuitem" className={`${item} text-rose-300`} onClick={() => { setOpen(false); onKickSender(); }}>
              Remove sender
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default HostModerationMenu;
