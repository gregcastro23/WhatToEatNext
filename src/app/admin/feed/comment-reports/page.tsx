"use client";

/**
 * Admin triage — reported feed comments. Converges visually with the chat
 * reports queue (PR 3). Lists open reports by default; an admin can dismiss,
 * mark reviewed, or action (which soft-deletes the offending comment).
 */

import React, { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/admin/kit/EmptyState";

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

const STATUS_LABEL: Record<(typeof STATUS_FILTERS)[number], string> = {
  open: "Open",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
  actioned: "Actioned",
};

export default function CommentReportsAdminPage(): React.JSX.Element {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      if (!res.ok) {
        setError(`Failed to load reports (HTTP ${res.status}).`);
        setReports([]);
        return;
      }
      const json = (await res.json()) as { success: boolean; reports?: Report[]; message?: string };
      if (json.success) {
        setReports(json.reports ?? []);
      } else {
        setError(json.message || "Failed to load reports.");
      }
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
    setBusyId(report.id);
    try {
      const res = await fetch(`/api/admin/feed/comment-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, commentId: report.commentId, deleteComment }),
      });
      if (res.ok) {
        await load();
      } else {
        setError(`Failed to update report (HTTP ${res.status}).`);
      }
    } catch {
      setError("Failed to update report.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feed Comment Reports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Reported comments awaiting review. Action soft-deletes the comment, dismiss keeps it visible.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                status === s
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6">
            <EmptyState
              kind="cannot-read"
              title="Error loading moderation queue"
              description={error}
              action={
                <button
                  type="button"
                  onClick={() => void load()}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition"
                >
                  Retry
                </button>
              }
            />
          </div>
        )}

        {loading && (
          <div className="mt-8 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading {STATUS_LABEL[status].toLowerCase()} reports…</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="mt-6">
            <EmptyState
              kind={status === "open" ? "all-clear" : "never-used"}
              title={`No ${STATUS_LABEL[status].toLowerCase()} reports`}
              description={
                status === "open"
                  ? "The feed comment moderation queue is clear — no pending reports."
                  : `No comments currently in ${STATUS_LABEL[status].toLowerCase()} state.`
              }
            />
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <ul className="mt-6 space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                        {r.reason}
                      </span>
                      {r.commentHidden && (
                        <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                          Hidden
                        </span>
                      )}
                      {r.commentDeleted && (
                        <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-semibold">
                          Deleted
                        </span>
                      )}
                      <span className="text-gray-400 font-mono text-[11px]">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-white border border-gray-200 p-3 text-sm text-gray-800 font-mono">
                      {r.commentDeleted ? (
                        <em className="text-gray-400 font-sans">[comment deleted]</em>
                      ) : (
                        r.commentBody
                      )}
                    </div>
                    {r.detail && (
                      <p className="mt-2 text-xs text-gray-600 font-medium">Reporter note: {r.detail}</p>
                    )}
                  </div>
                  {r.status === "open" && (
                    <div className="flex shrink-0 flex-col gap-1.5 ml-2">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void resolve(r, "actioned", true)}
                        className="rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50 transition"
                      >
                        Action + delete
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void resolve(r, "reviewed", false)}
                        className="rounded-lg bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 text-xs font-semibold hover:bg-purple-100 disabled:opacity-50 transition"
                      >
                        Reviewed
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void resolve(r, "dismissed", false)}
                        className="rounded-lg bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50 transition"
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
    </div>
  );
}

