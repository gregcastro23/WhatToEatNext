"use client";

/**
 * Admin chat-reports moderation queue (docs/plans/pr3-messaging-plan.md §4).
 * Lists reported messages by status; an admin can mark a report reviewed,
 * dismissed (unhide), or actioned (hide). Mirrors the admin/users pattern.
 */

import React, { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import type { MessageReport, MessageReportStatus } from "@/types/chat";

const STATUS_TABS: MessageReportStatus[] = ["open", "actioned", "dismissed", "reviewed"];

const STATUS_LABEL: Record<MessageReportStatus, string> = {
  open: "Open",
  actioned: "Actioned",
  dismissed: "Dismissed",
  reviewed: "Reviewed",
};

export default function AdminChatReportsPage(): React.JSX.Element {
  const [status, setStatus] = useState<MessageReportStatus>("open");
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chat/reports?status=${status}`, { credentials: "include" });
      if (!res.ok) {
        setError(res.status === 403 ? "Admin access required." : `Could not load reports (HTTP ${res.status}).`);
        setReports([]);
        return;
      }
      const data = (await res.json()) as { reports?: MessageReport[] };
      setReports(data.reports ?? []);
    } catch {
      setError("Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = async (reportId: string, next: Exclude<MessageReportStatus, "open">) => {
    setBusyId(reportId);
    try {
      const res = await fetch(`/api/admin/chat/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: next }),
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
            <h1 className="text-2xl font-bold text-gray-900">Chat Reports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Reported messages. Messages auto-hide at three distinct reporters; actioning keeps a message
              hidden, dismissing restores it when nothing else holds it down.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                status === tab
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {STATUS_LABEL[tab]}
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
                  ? "The chat moderation queue is clear — no pending reports."
                  : `No messages currently in ${STATUS_LABEL[status].toLowerCase()} state.`
              }
            />
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <ul className="mt-6 space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {report.reason} · {report.conversationKind ?? "direct"} ·{" "}
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                  {report.messageHidden && (
                    <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 font-semibold text-[11px]">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-white border border-gray-200 p-3 text-sm text-gray-800 font-mono">
                  {report.messageBody || <span className="italic text-gray-400">(removed)</span>}
                </div>
                {report.detail && (
                  <p className="mt-2 text-xs text-gray-600 font-medium">Reporter note: {report.detail}</p>
                )}

                {report.status === "open" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === report.id}
                      onClick={() => void resolve(report.id, "actioned")}
                      className="rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50 transition"
                    >
                      Hide message
                    </button>
                    <button
                      type="button"
                      disabled={busyId === report.id}
                      onClick={() => void resolve(report.id, "dismissed")}
                      className="rounded-lg bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50 transition"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      disabled={busyId === report.id}
                      onClick={() => void resolve(report.id, "reviewed")}
                      className="rounded-lg bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 text-xs font-semibold hover:bg-purple-100 disabled:opacity-50 transition"
                    >
                      Mark reviewed
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-500 font-medium">
                    {STATUS_LABEL[report.status]}
                    {report.resolvedAt ? ` · ${new Date(report.resolvedAt).toLocaleString()}` : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

