"use client";

/**
 * Admin triage — reported feed comments. Converges visually with the chat
 * reports queue (PR 3). Lists open reports by default; an admin can dismiss,
 * mark reviewed, or action (which soft-deletes the offending comment).
 */

import { useCallback, useEffect, useState } from "react";

interface Report {
  id: string;
  commentId: string;
  reporterId: string;
  reason: string;
  detail: string | null;
  status: string;
  createdAt: string;
  commentBody: string | null;
  commentHidden: boolean | null;
  commentDeleted: boolean;
}

const STATUS_FILTERS = ["open", "reviewed", "dismissed", "actioned"] as const;

export default function CommentReportsAdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feed/comment-reports?status=${status}`);
      if (res.status === 403) {
        setError("Admin access required.");
        setReports([]);
        return;
      }
      const json = await res.json();
      if (json.success) setReports(json.reports || []);
      else setError(json.message || "Failed to load reports.");
    } catch {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = async (report: Report, nextStatus: string, deleteComment: boolean) => {
    try {
      await fetch(`/api/admin/feed/comment-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, commentId: report.commentId, deleteComment }),
      });
      void load();
    } catch {
      setError("Failed to update report.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white">Feed comment reports</h1>
      <p className="mt-1 text-sm text-white/50">Reported comments awaiting review.</p>

      <div className="mt-4 flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
              status === s ? "bg-purple-600 text-white" : "bg-white/5 text-white/50 hover:text-white/80"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-white/40">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-rose-400">{error}</p>
      ) : reports.length === 0 ? (
        <p className="mt-6 text-sm text-white/40">No {status} reports.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">
                    {r.reason}
                    {r.commentHidden ? " · hidden" : ""}
                    {r.commentDeleted ? " · deleted" : ""}
                  </p>
                  <p className="mt-1 text-sm text-white/85 break-words">
                    {r.commentDeleted ? <em className="text-white/40">[comment deleted]</em> : r.commentBody}
                  </p>
                  {r.detail && <p className="mt-1 text-xs text-white/45">Reporter note: {r.detail}</p>}
                  <p className="mt-1 text-[10px] font-mono text-white/25">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                {r.status === "open" && (
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => void resolve(r, "actioned", true)}
                      className="rounded-full bg-rose-600/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-rose-600"
                    >
                      Action + delete
                    </button>
                    <button
                      type="button"
                      onClick={() => void resolve(r, "reviewed", false)}
                      className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/20"
                    >
                      Reviewed
                    </button>
                    <button
                      type="button"
                      onClick={() => void resolve(r, "dismissed", false)}
                      className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:bg-white/10"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
