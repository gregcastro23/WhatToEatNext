"use client";

/**
 * Admin chat-reports moderation queue (docs/plans/pr3-messaging-plan.md §4).
 * Lists reported messages by status; an admin can mark a report reviewed,
 * dismissed (unhide), or actioned (hide). Mirrors the admin/users pattern.
 */

import { useCallback, useEffect, useState } from "react";
import type { MessageReport, MessageReportStatus } from "@/types/chat";

const STATUS_TABS: MessageReportStatus[] = ["open", "actioned", "dismissed", "reviewed"];

const STATUS_LABEL: Record<MessageReportStatus, string> = {
  open: "Open",
  actioned: "Actioned",
  dismissed: "Dismissed",
  reviewed: "Reviewed",
};

export default function AdminChatReportsPage() {
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
        setError(res.status === 403 ? "Admin access required." : "Could not load reports.");
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
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 text-white">
      <h1 className="text-2xl font-bold">Chat Reports</h1>
      <p className="mt-1 text-sm text-white/50">
        Reported messages. Messages auto-hide at three distinct reporters; actioning keeps a message
        hidden, dismissing restores it when nothing else holds it down.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatus(tab)}
            className={`rounded-full px-3 py-1 text-sm ${
              status === tab ? "bg-white/15 text-white" : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {STATUS_LABEL[tab]}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-rose-400">{error}</p>}
      {loading && <p className="mt-6 text-sm text-white/50">Loading…</p>}

      {!loading && !error && reports.length === 0 && (
        <p className="mt-8 text-sm text-white/50">No {STATUS_LABEL[status].toLowerCase()} reports.</p>
      )}

      <ul className="mt-6 space-y-3">
        {reports.map((report) => (
          <li key={report.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
              <span>
                {report.reason} · {report.conversationKind ?? "?"} ·{" "}
                {new Date(report.createdAt).toLocaleString()}
              </span>
              {report.messageHidden && (
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-rose-300">Hidden</span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-black/30 p-2 text-sm text-white/90">
              {report.messageBody || <span className="italic text-white/40">(removed)</span>}
            </p>
            {report.detail && <p className="mt-2 text-xs text-white/60">Reporter note: {report.detail}</p>}

            {report.status === "open" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === report.id}
                  onClick={() => void resolve(report.id, "actioned")}
                  className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/30 disabled:opacity-50"
                >
                  Hide message
                </button>
                <button
                  type="button"
                  disabled={busyId === report.id}
                  onClick={() => void resolve(report.id, "dismissed")}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/15 disabled:opacity-50"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  disabled={busyId === report.id}
                  onClick={() => void resolve(report.id, "reviewed")}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/15 disabled:opacity-50"
                >
                  Mark reviewed
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/40">
                {STATUS_LABEL[report.status]}
                {report.resolvedAt ? ` · ${new Date(report.resolvedAt).toLocaleString()}` : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
