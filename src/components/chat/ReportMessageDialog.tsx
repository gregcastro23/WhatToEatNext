"use client";

/**
 * ReportMessageDialog — files a report against a message. Auto-hide at 3
 * distinct reporters is enforced server-side; this dialog just collects a
 * reason + optional detail and POSTs to /api/chat/messages/[id]/report.
 */

import { useState } from "react";
import { GradientButton } from "@/components/tables/ui/GradientButton";
import type { MessageReportReason } from "@/types/chat";
import type { JSX } from "react";

const REASONS: Array<{ value: MessageReportReason; label: string }> = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "other", label: "Something else" },
];

export interface ReportMessageDialogProps {
  messageId: string;
  onClose: () => void;
}

export function ReportMessageDialog({ messageId, onClose }: ReportMessageDialogProps): JSX.Element {
  const [reason, setReason] = useState<MessageReportReason>("inappropriate");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/messages/${messageId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason, detail: detail.trim() || undefined }),
      });
      if (!res.ok) {
        setError("Could not file the report. Try again.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Could not file the report. Try again.");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Report message"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-alchm-bg-elev p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <p className="text-sm text-alchm-fg">Thanks — our team will take a look.</p>
            <button type="button" onClick={onClose} className="mt-4 text-sm text-alchm-copper-bright hover:text-alchm-copper">
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-alchm-fg">Report this message</h2>
            <fieldset className="mt-3 space-y-2">
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm text-alchm-fg-dim">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </fieldset>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value.slice(0, 1000))}
              placeholder="Add context (optional)"
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] p-2 text-sm text-alchm-fg placeholder:text-alchm-fg-mute focus:outline-none focus:ring-1 focus:ring-alchm-violet"
            />
            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="text-sm text-alchm-fg-mute hover:text-alchm-fg">
                Cancel
              </button>
              <GradientButton onClick={() => void submit()} disabled={busy}>
                Submit report
              </GradientButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportMessageDialog;
