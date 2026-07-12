"use client";

/**
 * ReportCommentDialog — reason picker + optional detail for reporting a feed
 * comment. Mirrors PR 3's ReportMessageDialog (same reasons enum). POSTs to
 * /api/feed/comments/[id]/report; the response is deliberately neutral (never
 * reveals whether the report tipped an auto-hide).
 */

import { useState, type JSX } from "react";
import { GlassPanel, GradientButton } from "@/components/tables/ui";

const REASONS: Array<{ value: string; label: string }> = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "other", label: "Other" },
];

export interface ReportCommentDialogProps {
  commentId: string;
  onClose: () => void;
  onReported?: () => void;
}

export function ReportCommentDialog({ commentId, onClose, onReported }: ReportCommentDialogProps): JSX.Element {
  const [reason, setReason] = useState<string>("spam");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await fetch(`/api/feed/comments/${commentId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail: detail.trim() || undefined }),
      });
      setDone(true);
      onReported?.();
      // Brief acknowledgment, then close.
      window.setTimeout(onClose, 900);
    } catch {
      setDone(true);
      window.setTimeout(onClose, 900);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Report comment"
      onClick={onClose}
    >
      <GlassPanel
        className="w-full max-w-sm p-5"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {done ? (
          <p className="py-4 text-center text-sm text-white/70">Thanks — our team will take a look.</p>
        ) : (
          <>
            <h3 className="text-sm font-bold text-white">Report this comment</h3>
            <p className="mt-1 text-xs text-white/45">Tell us what&apos;s wrong. Reports are anonymous.</p>
            <div className="mt-4 space-y-2">
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-purple-500"
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea
              value={detail}
              maxLength={1000}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Add any detail (optional)"
              rows={2}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/35"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-1.5 text-xs font-bold text-white/55 hover:text-white"
              >
                Cancel
              </button>
              <GradientButton onClick={() => void submit()} disabled={busy} className="px-4 py-1.5 text-xs">
                {busy ? "Sending…" : "Report"}
              </GradientButton>
            </div>
          </>
        )}
      </GlassPanel>
    </div>
  );
}

export default ReportCommentDialog;
