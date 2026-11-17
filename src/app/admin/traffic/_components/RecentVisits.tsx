"use client";

/**
 * Visitor Journeys, ?ref= Attribution Rollups & Raw Visit Stream — tracks who
 * is on alchm.kitchen, where they came from, how long they stayed on each
 * view, and the exact sequence of pages, feature funnel steps, and client/API
 * errors they encountered.
 *
 * @file src/app/admin/traffic/_components/RecentVisits.tsx
 */

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { fmtAgo, fmtDateTime, fmtInt, fmtPct } from "@/components/admin/live/format";
import { Panel, Pill } from "@/components/admin/live/primitives";
import type { TrafficSummaryView } from "@/lib/admin/schemas/traffic";
import {
  classifyInteractionTag,
  isFrustrationOrPerfTag,
  isInteractiveRoute,
  type InteractionTone,
} from "@/lib/analytics/interactionClassify";

type Visit = TrafficSummaryView["recent"][number];
type Session = NonNullable<TrafficSummaryView["sessions"]>[number];
type RefRollup = NonNullable<TrafficSummaryView["refRollups"]>[number];
type FeedbackStatus = "open" | "resolved" | "dismissed";

export type DiagnosticPreset =
  | "all"
  | "live"
  | "engaged"
  | "stuck"
  | "friction"
  | "error"
  | "ref"
  | "returning"
  | "feedback";

const TONE_BADGE_STYLE: Record<InteractionTone, string> = {
  conversion: "bg-emerald-50 border-emerald-200 text-emerald-800",
  friction: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-rose-50 border-rose-200 text-rose-800 font-semibold",
  feature: "bg-indigo-50 border-indigo-200 text-indigo-800",
};

const TONE_ICON: Record<InteractionTone, string> = {
  conversion: "✓",
  friction: "⚠️",
  error: "🚨",
  feature: "⚡",
};

/** ISO-3166 alpha-2 → regional-indicator flag; anything else → empty. */
function flag(country: string | null): string {
  if (!country || !/^[A-Za-z]{2}$/.test(country)) return "";
  return String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function place(v: { city: string | null; region: string | null; country: string | null }): string {
  const parts = [v.city, v.region, v.country].filter((p): p is string => p !== null && p.length > 0);
  return parts.length > 0 ? parts.join(", ") : "unknown location";
}

function fmtDuration(ms: number | undefined): string {
  if (!ms || ms < 1_000) return "—";
  const sec = Math.round(ms / 1_000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function shortVisitorId(hash: string | null | undefined, sessionId: string | null | undefined, fallbackId: string): string {
  const raw = (hash && hash.length > 0 ? hash : null) ?? (sessionId && sessionId.length > 0 ? sessionId : null) ?? fallbackId;
  return raw.slice(0, 6).toLowerCase();
}

/** Group flat visits client-side when `sessions` is not pre-populated. */
function deriveSessionsFromVisits(visits: Visit[]): Session[] {
  const byKey = new Map<string, Visit[]>();
  for (const v of visits) {
    const key = v.sessionId ?? v.visitorHash ?? v.id;
    const list = byKey.get(key);
    if (list) list.push(v);
    else byKey.set(key, [v]);
  }
  const nowMs = Date.now();
  const activeCutoff = nowMs - 5 * 60_000;
  const liveNowCutoff = nowMs - 90_000;
  const out: Session[] = [];
  for (const [sessionKey, rows] of byKey.entries()) {
    const asc = [...rows].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    const [first] = asc;
    const last = asc[asc.length - 1];
    if (!first || !last) continue;
    const steps = asc.map((r) => ({
      id: r.id,
      at: r.at,
      path: r.path,
      durationMs: r.durationMs ?? 0,
      refTag: r.refTag ?? null,
      interactions: r.interactions ?? [],
    }));
    const sumMs = steps.reduce((acc, s) => acc + s.durationMs, 0);
    const spanMs = Math.max(0, new Date(last.at).getTime() - new Date(first.at).getTime());
    const totalDurationMs = Math.max(sumMs, spanMs + (last.durationMs ?? 0));
    const lastSeenMs = new Date(last.at).getTime() + (last.durationMs ?? 0);
    const actionsCount = steps.reduce((acc, s) => acc + s.interactions.length, 0);
    const hasError = steps.some((s) => s.interactions.some((act) => act.startsWith("error:")));
    const isStuck =
      totalDurationMs > 45_000 &&
      actionsCount === 0 &&
      steps.some((s) => isInteractiveRoute(s.path));
    const hasFriction =
      steps.some((s) => s.interactions.some((act) => isFrustrationOrPerfTag(act))) || isStuck;
    out.push({
      sessionKey,
      visitorHash: first.visitorHash ?? sessionKey.slice(0, 24),
      sessionId: first.sessionId,
      startedAt: first.at,
      lastSeenAt: new Date(lastSeenMs).toISOString(),
      totalDurationMs,
      pageCount: steps.length,
      engaged: steps.length > 1 || totalDurationMs >= 15_000 || actionsCount > 0,
      activeNow: lastSeenMs >= activeCutoff,
      liveNow90s: lastSeenMs >= liveNowCutoff,
      isStuck,
      hasError,
      hasFriction,
      entryPath: first.path,
      exitPath: last.path,
      referrerHost: asc.find((r) => r.referrerHost !== null)?.referrerHost ?? null,
      utmSource: asc.find((r) => r.refTag != null)?.refTag ?? null,
      refTag: asc.find((r) => r.refTag != null)?.refTag ?? null,
      country: first.country,
      region: first.region,
      city: first.city,
      deviceType: first.deviceType,
      browser: first.browser,
      os: first.os,
      user: asc.find((r) => r.user !== null)?.user ?? null,
      steps,
    });
  }

  const byIdentity = new Map<string, Session[]>();
  for (const s of [...out].sort((a, b) => (a.startedAt < b.startedAt ? -1 : a.startedAt > b.startedAt ? 1 : 0))) {
    const identityKey = s.user ? `u:${s.user.id}` : `v:${s.visitorHash}`;
    const list = byIdentity.get(identityKey) ?? [];
    s.visitNumber = list.length + 1;
    s.priorSessionKeys = list.map((p) => p.sessionKey);
    list.push(s);
    byIdentity.set(identityKey, list);
  }

  return out.sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : a.lastSeenAt > b.lastSeenAt ? -1 : 0));
}

function interactionMatches(tag: string, filter: string): boolean {
  const ix = filter.trim().toLowerCase();
  if (!ix) return true;
  const normalized = tag.toLowerCase();
  return normalized === ix || normalized.startsWith(`${ix}:`);
}

function visitMatchesPreset(
  v: Visit,
  preset: DiagnosticPreset,
  feedbackStatusOverrides: Record<string, FeedbackStatus>,
): boolean {
  if (preset === "all") return true;
  if (preset === "live") {
    if (v.isLive !== undefined) return v.isLive;
    const seenMs = new Date(v.lastSeenAt ?? v.at).getTime() + (v.durationMs ?? 0);
    return seenMs >= Date.now() - 90_000;
  }
  if (preset === "engaged") {
    return v.isEngaged ?? ((v.durationMs ?? 0) >= 15_000 || (v.interactions?.length ?? 0) > 0);
  }
  if (preset === "stuck") {
    return (v.durationMs ?? 0) > 45_000 && (v.interactions?.length ?? 0) === 0 && isInteractiveRoute(v.path);
  }
  if (preset === "friction") {
    return (
      (v.interactions?.some((act) => isFrustrationOrPerfTag(act)) ?? false) ||
      ((v.durationMs ?? 0) > 45_000 && (v.interactions?.length ?? 0) === 0 && isInteractiveRoute(v.path))
    );
  }
  if (preset === "error") {
    return v.interactions?.some((act) => act.startsWith("error:")) ?? false;
  }
  if (preset === "ref") {
    return Boolean(v.refTag);
  }
  if (preset === "returning") {
    return (v.visitNumber ?? 1) > 1;
  }
  return (v.feedback ?? []).some(
    (fb) => (feedbackStatusOverrides[fb.id] ?? fb.status ?? "open") === "open",
  );
}

function InteractionPill({
  tag,
  active = false,
  onClick,
}: {
  tag: string;
  active?: boolean;
  onClick?: (tag: string) => void;
}): React.JSX.Element {
  const classified = classifyInteractionTag(tag);
  const titleText = `${classified.category} · ${classified.action}${classified.meta ? ` (${classified.meta})` : ""}`;
  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(tag);
        }}
        title={`${titleText} — click to filter by this interaction`}
        className={`px-1.5 py-0.5 rounded border font-mono text-[10px] transition-colors ${
          active
            ? `ring-2 ring-indigo-500 ring-offset-1 ${TONE_BADGE_STYLE[classified.tone]}`
            : `${TONE_BADGE_STYLE[classified.tone]} hover:opacity-80`
        }`}
      >
        {TONE_ICON[classified.tone]} {tag}
      </button>
    );
  }
  return (
    <span
      className={`px-1.5 py-0.5 rounded border font-mono text-[10px] ${TONE_BADGE_STYLE[classified.tone]}`}
      title={titleText}
    >
      {TONE_ICON[classified.tone]} {tag}
    </span>
  );
}

function ViewerBadge({
  user,
  visitorHash,
  sessionId,
  fallbackId,
  visitNumber,
  onFilterVisitor,
}: {
  user: Visit["user"];
  visitorHash?: string | null;
  sessionId?: string | null;
  fallbackId: string;
  visitNumber?: number;
  onFilterVisitor?: (vid: string) => void;
}): React.JSX.Element {
  const shortId = shortVisitorId(visitorHash, sessionId, fallbackId);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {user ? (
        <>
          <Link href={`/admin/users/${user.id}`} className="font-semibold text-indigo-700 hover:underline">
            {user.name ?? user.email}
          </Link>
          {user.isAdmin && <span className="text-[10px] text-gray-400">(admin)</span>}
          <span className="font-mono text-[10px] text-gray-400">#{shortId}</span>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onFilterVisitor?.(shortId)}
          title="Click to filter by this anonymous visitor"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-mono text-[11px] transition-colors"
        >
          <span>Visitor #{shortId}</span>
        </button>
      )}
      {visitNumber !== undefined && visitNumber > 1 && (
        <button
          type="button"
          onClick={() => onFilterVisitor?.(user?.email ?? shortId)}
          title="Click to view all sessions from this returning visitor"
          className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-semibold hover:bg-teal-100 transition-colors"
        >
          Returning ({ordinal(visitNumber)} visit)
        </button>
      )}
    </div>
  );
}

function SessionJourneyDetail({
  session,
  activeInteraction,
  feedbackStatusOverrides,
  onFilterVisitor,
  onSelectInteraction,
  onToggleFeedbackStatus,
}: {
  session: Session;
  activeInteraction: string;
  feedbackStatusOverrides: Record<string, FeedbackStatus>;
  onFilterVisitor: (q: string) => void;
  onSelectInteraction: (tag: string) => void;
  onToggleFeedbackStatus: (id: string, nextStatus: FeedbackStatus) => void;
}): React.JSX.Element {
  const [copiedJson, setCopiedJson] = useState(false);
  const shortId = shortVisitorId(session.visitorHash, session.sessionId, session.sessionKey);

  const handleCopySessionJson = (): void => {
    try {
      navigator.clipboard.writeText(JSON.stringify(session, null, 2)).catch(() => undefined);
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 2_000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <div className="bg-slate-50/90 border-t border-b border-slate-200 px-4 py-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-800">
            Session Journey ({session.pageCount} {session.pageCount === 1 ? "view" : "views"})
          </span>
          <span>·</span>
          <span>Started {fmtDateTime(session.startedAt)}</span>
          {session.totalDurationMs > 0 && (
            <>
              <span>·</span>
              <span className="font-mono text-emerald-700 font-semibold">
                Total dwell: {fmtDuration(session.totalDurationMs)}
              </span>
            </>
          )}
          {session.refTag && (
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-semibold">
              ref: {session.refTag}
            </span>
          )}
          {session.isStuck && (
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold">
              ⚠️ High dwell / 0 actions (possible friction)
            </span>
          )}
          {session.hasFriction && !session.isStuck && (
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold">
              🔥 Behavioral friction / slow CWV
            </span>
          )}
          {session.hasError && (
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px] font-semibold">
              🚨 Encountered runtime/API error
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {session.priorSessionKeys && session.priorSessionKeys.length > 0 && (
            <button
              type="button"
              onClick={() => onFilterVisitor(session.user?.email ?? shortId)}
              className="text-[11px] font-semibold text-teal-700 hover:underline"
            >
              View all {(session.visitNumber ?? 1)} sessions by this visitor →
            </button>
          )}
          {session.user && (
            <Link
              href={`/admin/users/${session.user.id}`}
              className="text-[11px] font-semibold text-indigo-700 hover:underline"
            >
              User Timeline →
            </Link>
          )}
          <button
            type="button"
            onClick={handleCopySessionJson}
            className="px-2 py-0.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-mono text-[10px] font-semibold transition-colors"
            title="Copy structured session telemetry payload as JSON for debugging"
          >
            {copiedJson ? "Copied JSON ✓" : "Copy Session JSON"}
          </button>
          <span className="font-mono text-[10px] text-gray-400">
            key: {session.sessionKey.slice(0, 16)}
          </span>
        </div>
      </div>

      <ol className="space-y-1.5">
        {session.steps.map((step, index) => (
          <li
            key={step.id}
            className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-md border border-gray-200 px-3 py-1.5 text-xs"
          >
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-gray-700 font-mono text-[10px] font-bold">
                {index + 1}
              </span>
              <span className="font-mono font-semibold text-gray-900 truncate" title={step.path}>
                {step.path}
              </span>
              {step.refTag && (
                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[10px]">
                  ?ref={step.refTag}
                </span>
              )}
              {step.interactions.map((act) => (
                <InteractionPill
                  key={act}
                  tag={act}
                  active={Boolean(activeInteraction) && interactionMatches(act, activeInteraction)}
                  onClick={onSelectInteraction}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
              {step.durationMs > 0 && (
                <span className="text-emerald-700 font-semibold" title="Time spent on this page">
                  ⏱ {fmtDuration(step.durationMs)}
                </span>
              )}
              <span title={fmtDateTime(step.at)}>{fmtAgo(step.at)}</span>
            </div>
          </li>
        ))}
      </ol>

      {session.feedback && session.feedback.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">
            💬 Attached Viewer Feedback ({session.feedback.length})
          </div>
          {session.feedback.map((fb) => {
            const status = feedbackStatusOverrides[fb.id] ?? fb.status ?? "open";
            const isResolved = status === "resolved" || status === "dismissed";
            return (
              <div
                key={fb.id}
                className={`rounded-md border px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 ${
                  isResolved
                    ? "border-gray-200 bg-gray-100/70"
                    : "border-emerald-200 bg-emerald-50/80"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold uppercase ${
                      isResolved
                        ? "bg-gray-200 text-gray-700"
                        : "bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    {status}
                  </span>
                  {fb.rating !== null && (
                    <span className="font-mono font-bold text-amber-600">
                      {"★".repeat(fb.rating)}{"☆".repeat(Math.max(0, 5 - fb.rating))} ({fb.rating}/5)
                    </span>
                  )}
                  <span className="text-gray-900 font-medium">&ldquo;{fb.note}&rdquo;</span>
                  <span className="font-mono text-[10px] text-gray-500">on {fb.path}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleFeedbackStatus(fb.id, isResolved ? "open" : "resolved")}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                      isResolved
                        ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        : "border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    {isResolved ? "Reopen" : "Mark Resolved"}
                  </button>
                  <span className="font-mono text-[10px] text-gray-500">{fmtAgo(fb.at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SessionRow({
  s,
  expanded,
  activeInteraction,
  feedbackStatusOverrides,
  onToggle,
  onFilterVisitor,
  onSelectInteraction,
  onToggleFeedbackStatus,
}: {
  s: Session;
  expanded: boolean;
  activeInteraction: string;
  feedbackStatusOverrides: Record<string, FeedbackStatus>;
  onToggle: () => void;
  onFilterVisitor: (vid: string) => void;
  onSelectInteraction: (tag: string) => void;
  onToggleFeedbackStatus: (id: string, nextStatus: FeedbackStatus) => void;
}): React.JSX.Element {
  const uniquePaths = Array.from(new Set(s.steps.map((st) => st.path)));
  const totalActions = s.steps.reduce((acc, st) => acc + st.interactions.length, 0);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition-colors ${
          expanded ? "bg-indigo-50/50" : "hover:bg-gray-50"
        }`}
      >
        <td className="px-3 py-2.5 whitespace-nowrap text-gray-500" title={fmtDateTime(s.lastSeenAt)}>
          <div className="flex items-center gap-1.5">
            {s.liveNow90s ? (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"
                title="Live right now (< 90s)"
              />
            ) : s.activeNow ? (
              <span
                className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                title="Active in the last 5 minutes"
              />
            ) : null}
            <span>{fmtAgo(s.lastSeenAt)}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <ViewerBadge
            user={s.user}
            visitorHash={s.visitorHash}
            sessionId={s.sessionId}
            fallbackId={s.sessionKey}
            {...(s.visitNumber !== undefined ? { visitNumber: s.visitNumber } : {})}
            onFilterVisitor={onFilterVisitor}
          />
        </td>
        <td className="px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-1 max-w-[380px]">
            {uniquePaths.slice(0, 4).map((p, idx) => (
              <React.Fragment key={`${p}-${idx}`}>
                {idx > 0 && <span className="text-gray-400 text-[10px]">→</span>}
                <span className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[140px]" title={p}>
                  {p}
                </span>
              </React.Fragment>
            ))}
            {uniquePaths.length > 4 && (
              <span className="text-[10px] font-mono text-gray-500">+{uniquePaths.length - 4} more</span>
            )}
            {s.pageCount > 1 && (
              <span className="ml-1 text-[10px] font-mono text-indigo-600 font-semibold">
                ({s.pageCount}p)
              </span>
            )}
            {totalActions > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[10px] font-semibold">
                ⚡ {totalActions}
              </span>
            )}
            {s.isStuck && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold" title="High dwell (>45s) on interactive page with 0 actions">
                ⚠️ stuck
              </span>
            )}
            {s.hasFriction && !s.isStuck && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold" title="Behavioral friction (rage/dead click, quick back, or slow CWV)">
                🔥 friction
              </span>
            )}
            {s.hasError && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px] font-semibold" title="Encountered client/API error">
                🚨 error
              </span>
            )}
            {s.feedback && s.feedback.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-semibold" title={s.feedback[0]?.note}>
                💬 {s.feedback.length} {s.feedback.length === 1 ? "note" : "notes"}
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap font-mono">
          {s.totalDurationMs > 0 ? (
            <span className={s.engaged ? "text-emerald-700 font-semibold" : "text-gray-600"}>
              {fmtDuration(s.totalDurationMs)}
            </span>
          ) : s.engaged ? (
            <span className="text-emerald-700 text-[11px]">engaged</span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-gray-700">
          <span aria-hidden="true">{flag(s.country)} </span>
          {place(s)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">
          {[s.browser, s.os].filter(Boolean).join(" · ") || s.deviceType}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>{s.referrerHost ?? "direct"}</span>
            {s.refTag && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (s.refTag) onFilterVisitor(s.refTag);
                }}
                className="px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-mono text-[10px] font-semibold transition-colors"
              >
                ref:{s.refTag}
              </button>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-right">
          <span className="text-[11px] font-semibold text-indigo-600">
            {expanded ? "Hide ▲" : "Journey ▼"}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="p-0">
            <SessionJourneyDetail
              session={s}
              activeInteraction={activeInteraction}
              feedbackStatusOverrides={feedbackStatusOverrides}
              onFilterVisitor={onFilterVisitor}
              onSelectInteraction={onSelectInteraction}
              onToggleFeedbackStatus={onToggleFeedbackStatus}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function VisitRow({
  v,
  activeInteraction,
  feedbackStatusOverrides,
  onFilterVisitor,
  onSelectInteraction,
  onToggleFeedbackStatus,
}: {
  v: Visit;
  activeInteraction: string;
  feedbackStatusOverrides: Record<string, FeedbackStatus>;
  onFilterVisitor: (vid: string) => void;
  onSelectInteraction: (tag: string) => void;
  onToggleFeedbackStatus: (id: string, nextStatus: FeedbackStatus) => void;
}): React.JSX.Element {
  const sessionShort = shortVisitorId(v.sessionId, v.visitorHash, v.id);
  const lastSeenLabel = v.lastSeenAt ? fmtDateTime(v.lastSeenAt) : fmtDateTime(v.at);
  const engaged = v.isEngaged ?? ((v.durationMs ?? 0) >= 15_000 || (v.interactions?.length ?? 0) > 0);
  const clientStack = [v.deviceType, [v.browser, v.os].filter(Boolean).join(" · ")].filter(Boolean).join(" · ");

  return (
    <tr className="hover:bg-gray-50 align-top">
      <td
        className="px-3 py-2.5 whitespace-nowrap text-gray-500"
        title={`Viewed: ${fmtDateTime(v.at)}\nLast heartbeat: ${lastSeenLabel}`}
      >
        <div className="flex items-center gap-1.5">
          {v.isLive && (
            <span
              className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"
              title="Live right now (< 90s)"
            />
          )}
          <span className="font-medium text-gray-700">{fmtAgo(v.at)}</span>
        </div>
        {v.lastSeenAt && v.lastSeenAt !== v.at && (
          <div className="text-[10px] font-mono text-gray-400">hb {fmtAgo(v.lastSeenAt)}</div>
        )}
      </td>

      <td className="px-3 py-2.5 whitespace-nowrap">
        <ViewerBadge
          user={v.user}
          visitorHash={v.visitorHash ?? null}
          sessionId={v.sessionId}
          fallbackId={v.id}
          {...(v.visitNumber !== undefined ? { visitNumber: v.visitNumber } : {})}
          onFilterVisitor={onFilterVisitor}
        />
        <div className="mt-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onFilterVisitor(v.sessionId ?? v.visitorHash ?? sessionShort)}
            title="Click to filter views in this session"
            className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 font-mono text-[10px] transition-colors"
          >
            sess:#{sessionShort}
          </button>
        </div>
      </td>

      <td className="px-3 py-2.5 font-mono text-gray-900 max-w-[260px]">
        <div className="truncate font-semibold" title={v.path}>
          {v.path}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px]">
          {v.stepIndex !== undefined && v.stepCount !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Step {v.stepIndex}/{v.stepCount}
            </span>
          )}
          {v.isEntry && (
            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
              Entry
            </span>
          )}
          {v.isExit && (
            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
              Exit
            </span>
          )}
        </div>
      </td>

      <td className="px-3 py-2.5 whitespace-nowrap text-gray-700">
        <div className="text-gray-700">{clientStack || "—"}</div>
        <div className="text-[11px] text-gray-500">
          <span aria-hidden="true">{flag(v.country)} </span>
          {place(v)}
        </div>
      </td>

      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-gray-600">
        <div className={engaged ? "text-emerald-700 font-semibold" : "text-gray-600"}>
          {fmtDuration(v.durationMs)}
        </div>
        {engaged && (
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
            Engaged
          </span>
        )}
      </td>

      <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">
        <div>{v.referrerHost ?? "direct"}</div>
        {v.refTag && (
          <button
            type="button"
            onClick={() => {
              if (v.refTag) onFilterVisitor(v.refTag);
            }}
            className="mt-1 px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-mono text-[10px] font-semibold transition-colors"
          >
            ref:{v.refTag}
          </button>
        )}
      </td>

      <td className="px-3 py-2.5 min-w-[200px]">
        <div className="flex flex-wrap items-center gap-1">
          {v.interactions && v.interactions.length > 0 ? (
            v.interactions.map((act) => (
              <InteractionPill
                key={act}
                tag={act}
                active={Boolean(activeInteraction) && interactionMatches(act, activeInteraction)}
                onClick={onSelectInteraction}
              />
            ))
          ) : (
            !(v.feedback && v.feedback.length > 0) && <span className="text-gray-400">—</span>
          )}
        </div>
        {v.feedback && v.feedback.length > 0 && (
          <div className="mt-1 space-y-1">
            {v.feedback.map((fb) => {
              const status = feedbackStatusOverrides[fb.id] ?? fb.status ?? "open";
              const isResolved = status === "resolved" || status === "dismissed";
              return (
                <div
                  key={fb.id}
                  className={`px-1.5 py-1 rounded border text-[10px] flex flex-wrap items-center justify-between gap-1.5 ${
                    isResolved
                      ? "border-gray-200 bg-gray-100 text-gray-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  }`}
                  title={fmtDateTime(fb.at)}
                >
                  <span>
                    <span className="font-mono uppercase font-semibold mr-1">[{status}]</span>
                    💬 {fb.rating !== null ? `★${fb.rating} ` : ""}&ldquo;{fb.note}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleFeedbackStatus(fb.id, isResolved ? "open" : "resolved")}
                    className="px-1.5 py-0.5 rounded border border-current/25 bg-white hover:bg-gray-50 font-semibold text-[10px]"
                  >
                    {isResolved ? "Reopen" : "Mark Resolved"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </td>
    </tr>
  );
}

export function RefAttributionPanel({
  rollups,
  activeRefFilter,
  onSelectRef,
}: {
  rollups: RefRollup[];
  activeRefFilter: string;
  onSelectRef: (tag: string) => void;
}): React.JSX.Element | null {
  if (rollups.length === 0) return null;
  return (
    <Panel
      title="Share-link (?ref=) attribution & conversion"
      subtitle="per-tag performance across unique visitors, engaged sessions, dwell time, and sign-in conversion"
      right={<Pill tone="info">{rollups.length} active tags</Pill>}
    >
      <div className="overflow-x-auto -mx-4 sm:-mx-5">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              {["?ref= Tag", "Visitors", "Sessions", "Engaged Rate", "Median Dwell", "Avg Pages", "Signed-In", ""].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rollups.map((r) => {
              const selected = activeRefFilter.toLowerCase() === r.refTag.toLowerCase();
              return (
                <tr key={r.refTag} className={selected ? "bg-purple-50/70" : "hover:bg-gray-50"}>
                  <td className="px-3 py-2 font-mono font-semibold text-purple-800">
                    ref:{r.refTag}
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-800">{fmtInt(r.visitors)}</td>
                  <td className="px-3 py-2 font-mono text-gray-800">{fmtInt(r.sessions)}</td>
                  <td className="px-3 py-2 font-mono">
                    <span className={r.engagedRate >= 0.5 ? "text-emerald-700 font-semibold" : "text-gray-700"}>
                      {fmtPct(r.engagedRate)}
                    </span>{" "}
                    <span className="text-gray-400 text-[10px]">({r.engagedSessions}/{r.sessions})</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-700">{fmtDuration(r.medianDwellMs)}</td>
                  <td className="px-3 py-2 font-mono text-gray-700">{r.avgPagesPerSession.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono text-indigo-700 font-semibold">{fmtInt(r.signedInUsers)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectRef(selected ? "" : r.refTag)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        selected
                          ? "bg-purple-700 text-white"
                          : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                      }`}
                    >
                      {selected ? "Showing ✓" : "Filter sessions →"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function RecentVisits({
  visits,
  sessions: providedSessions,
  refRollups = [],
  savedRefTags = [],
  initialSessionKey = null,
  initialRefFilter = "",
  initialPreset = "all",
  initialViewMode = "sessions",
  initialInteractionFilter = "",
  onSelectInteraction,
  onViewModeChange,
}: {
  visits: Visit[];
  sessions?: Session[];
  refRollups?: RefRollup[];
  savedRefTags?: string[];
  initialSessionKey?: string | null;
  initialRefFilter?: string;
  initialPreset?: DiagnosticPreset;
  initialViewMode?: "sessions" | "raw";
  initialInteractionFilter?: string;
  onSelectInteraction?: (tag: string) => void;
  onViewModeChange?: (mode: "sessions" | "raw") => void;
}): React.JSX.Element {
  const [mode, setMode] = useState<"sessions" | "raw">(initialViewMode);
  const [expandedKey, setExpandedKey] = useState<string | null>(initialSessionKey);
  const [visitorFilter, setVisitorFilter] = useState<string>(initialRefFilter);
  const [preset, setPreset] = useState<DiagnosticPreset>(initialPreset);
  const [activeInteraction, setActiveInteraction] = useState<string>(initialInteractionFilter);
  const [feedbackStatusOverrides, setFeedbackStatusOverrides] = useState<Record<string, FeedbackStatus>>({});

  useEffect(() => {
    setMode(initialViewMode);
  }, [initialViewMode]);

  useEffect(() => {
    if (initialSessionKey) {
      setExpandedKey(initialSessionKey);
      setMode("sessions");
    }
  }, [initialSessionKey]);

  useEffect(() => {
    setVisitorFilter(initialRefFilter);
  }, [initialRefFilter]);

  useEffect(() => {
    setActiveInteraction(initialInteractionFilter);
  }, [initialInteractionFilter]);

  useEffect(() => {
    setPreset(initialPreset);
  }, [initialPreset]);

  const handleToggleFeedbackStatus = async (id: string, nextStatus: FeedbackStatus): Promise<void> => {
    const previous = feedbackStatusOverrides[id];
    setFeedbackStatusOverrides((prev) => ({ ...prev, [id]: nextStatus }));
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) {
        setFeedbackStatusOverrides((prev) => {
          const copy = { ...prev };
          if (previous !== undefined) copy[id] = previous;
          else delete copy[id];
          return copy;
        });
      }
    } catch {
      setFeedbackStatusOverrides((prev) => {
        const copy = { ...prev };
        if (previous !== undefined) copy[id] = previous;
        else delete copy[id];
        return copy;
      });
    }
  };

  const handleSelectInteraction = (tag: string): void => {
    const next = activeInteraction.toLowerCase() === tag.toLowerCase() ? "" : tag;
    setActiveInteraction(next);
    onSelectInteraction?.(next);
  };

  const clearInteractionFilter = (): void => {
    setActiveInteraction("");
    onSelectInteraction?.("");
  };

  const allSessions = useMemo(
    () => (providedSessions && providedSessions.length > 0 ? providedSessions : deriveSessionsFromVisits(visits)),
    [providedSessions, visits],
  );

  const distinctRefTags = useMemo(() => {
    const tags = new Set<string>();
    for (const r of refRollups) if (r.refTag) tags.add(r.refTag);
    for (const s of allSessions) if (s.refTag) tags.add(s.refTag);
    for (const t of savedRefTags) if (t) tags.add(t);
    return Array.from(tags).slice(0, 12);
  }, [refRollups, allSessions, savedRefTags]);

  const presetCounts = useMemo(() => {
    let live = 0;
    let engaged = 0;
    let stuck = 0;
    let friction = 0;
    let error = 0;
    let ref = 0;
    let returning = 0;
    let feedbackCount = 0;
    for (const s of allSessions) {
      if (s.liveNow90s) live += 1;
      if (s.engaged) engaged += 1;
      if (s.isStuck) stuck += 1;
      if (s.hasFriction || s.isStuck || s.steps.some((st) => st.interactions.some((act) => isFrustrationOrPerfTag(act)))) {
        friction += 1;
      }
      if (s.hasError) error += 1;
      if (s.refTag) ref += 1;
      if ((s.visitNumber ?? 1) > 1) returning += 1;
      const hasOpenFeedback = (s.feedback ?? []).some(
        (fb) => (feedbackStatusOverrides[fb.id] ?? fb.status ?? "open") === "open",
      );
      if (hasOpenFeedback) feedbackCount += 1;
    }
    return {
      all: allSessions.length,
      live,
      engaged,
      stuck,
      friction,
      error,
      ref,
      returning,
      feedback: feedbackCount,
    };
  }, [allSessions, feedbackStatusOverrides]);

  const filteredSessions = useMemo(() => {
    const q = visitorFilter.trim().toLowerCase();
    return allSessions.filter((s) => {
      if (preset === "live" && !s.liveNow90s) return false;
      if (preset === "engaged" && !s.engaged) return false;
      if (preset === "stuck" && !s.isStuck) return false;
      if (preset === "friction") {
        const matchesFriction =
          Boolean(s.hasFriction) ||
          Boolean(s.isStuck) ||
          s.steps.some((st) => st.interactions.some((act) => isFrustrationOrPerfTag(act)));
        if (!matchesFriction) return false;
      }
      if (preset === "error" && !s.hasError) return false;
      if (preset === "ref" && !s.refTag) return false;
      if (preset === "returning" && (s.visitNumber ?? 1) <= 1) return false;
      if (preset === "feedback") {
        const hasOpenFeedback = (s.feedback ?? []).some(
          (fb) => (feedbackStatusOverrides[fb.id] ?? fb.status ?? "open") === "open",
        );
        if (!hasOpenFeedback) return false;
      }
      if (activeInteraction) {
        const hasIx = s.steps.some((st) => st.interactions.some((act) => interactionMatches(act, activeInteraction)));
        if (!hasIx) return false;
      }
      if (!q) return true;
      return (
        s.sessionKey.toLowerCase().includes(q) ||
        s.visitorHash.toLowerCase().includes(q) ||
        (s.sessionId?.toLowerCase().includes(q) ?? false) ||
        (s.refTag?.toLowerCase().includes(q) ?? false) ||
        (s.user?.email.toLowerCase().includes(q) ?? false) ||
        (s.user?.name?.toLowerCase().includes(q) ?? false) ||
        s.steps.some(
          (st) =>
            st.path.toLowerCase().includes(q) ||
            st.interactions.some((act) => act.toLowerCase().includes(q)),
        )
      );
    });
  }, [allSessions, visitorFilter, preset, activeInteraction, feedbackStatusOverrides]);

  const filteredVisits = useMemo(() => {
    const q = visitorFilter.trim().toLowerCase();
    return visits.filter((v) => {
      if (!visitMatchesPreset(v, preset, feedbackStatusOverrides)) return false;
      if (activeInteraction) {
        const hasIx = v.interactions?.some((act) => interactionMatches(act, activeInteraction)) ?? false;
        if (!hasIx) return false;
      }
      if (!q) return true;
      return (
        (v.visitorHash?.toLowerCase().includes(q) ?? false) ||
        (v.sessionId?.toLowerCase().includes(q) ?? false) ||
        (v.refTag?.toLowerCase().includes(q) ?? false) ||
        (v.user?.email.toLowerCase().includes(q) ?? false) ||
        (v.user?.name?.toLowerCase().includes(q) ?? false) ||
        v.path.toLowerCase().includes(q) ||
        (v.interactions?.some((act) => act.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [visits, visitorFilter, preset, activeInteraction, feedbackStatusOverrides]);

  const presets: Array<{ id: DiagnosticPreset; label: string; count: number; tone?: string }> = [
    { id: "all", label: "All", count: presetCounts.all },
    { id: "live", label: "🟢 Live Now (90s)", count: presetCounts.live },
    { id: "engaged", label: "✓ Engaged", count: presetCounts.engaged },
    { id: "friction", label: "🔥 Frustrated (Rage / Dead Click / Quick Back)", count: presetCounts.friction },
    { id: "stuck", label: "⚠️ Stuck (>45s, 0 act)", count: presetCounts.stuck },
    { id: "error", label: "🚨 Hit Error", count: presetCounts.error },
    { id: "feedback", label: "💬 Has Open Feedback", count: presetCounts.feedback },
    { id: "ref", label: "🔗 Has [ref:]", count: presetCounts.ref },
    { id: "returning", label: "🔁 Returning", count: presetCounts.returning },
  ];

  return (
    <div className="space-y-4">
      <RefAttributionPanel
        rollups={refRollups}
        activeRefFilter={visitorFilter}
        onSelectRef={(tag) => setVisitorFilter(tag)}
      />

      <Panel
        title={mode === "sessions" ? "Visitor journeys" : "Every site view"}
        subtitle={
          mode === "sessions"
            ? "grouped by viewer session — click any row to inspect their step-by-step page trail, feature interactions & dwell time"
            : "chronological ledger of every recorded human page view with step position, dwell, interactions & attached feedback"
        }
        right={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={visitorFilter}
              onChange={(e) => setVisitorFilter(e.target.value)}
              placeholder="Filter #visitor, ?ref, page, action…"
              aria-label="Filter visits"
              className="px-2.5 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {(visitorFilter || preset !== "all" || activeInteraction) && (
              <button
                type="button"
                onClick={() => {
                  setVisitorFilter("");
                  setPreset("all");
                  clearInteractionFilter();
                }}
                className="text-[11px] text-gray-500 hover:text-gray-800"
              >
                Reset
              </button>
            )}
            <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5" role="group" aria-label="View mode">
              <button
                type="button"
                onClick={() => {
                  setMode("sessions");
                  onViewModeChange?.("sessions");
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded ${
                  mode === "sessions" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Visitor Journeys ({filteredSessions.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("raw");
                  onViewModeChange?.("raw");
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded ${
                  mode === "raw" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Every Site View ({filteredVisits.length})
              </button>
            </div>
            <Pill tone="info">
              {mode === "sessions" ? `${filteredSessions.length} sessions` : `${filteredVisits.length} views`}
            </Pill>
          </div>
        }
      >
        {/* Diagnostic preset filter bar & 1-click ref: chips */}
        {(allSessions.length > 0 || Boolean(activeInteraction)) && (
          <div className="mb-3 pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Diagnostic filters">
              {presets.map((p) => {
                if (p.id !== "all" && p.count === 0 && preset !== p.id) return null;
                const active = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(active && p.id !== "all" ? "all" : p.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                      active
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {p.label} <span className="font-mono opacity-75">{p.count}</span>
                  </button>
                );
              })}

              {activeInteraction && (
                <button
                  type="button"
                  onClick={clearInteractionFilter}
                  className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-colors"
                  title="Click to clear interaction filter"
                >
                  ⚡ Interaction: {activeInteraction} ×
                </button>
              )}
            </div>

            {distinctRefTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mr-1">
                  Quick ref:
                </span>
                {distinctRefTags.map((tag) => {
                  const active = visitorFilter.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setVisitorFilter(active ? "" : tag)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border transition-colors ${
                        active
                          ? "bg-purple-700 text-white border-purple-700"
                          : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                      }`}
                    >
                      ref:{tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {visits.length === 0 ? (
          <p className="text-xs text-gray-500">No page views recorded yet.</p>
        ) : mode === "sessions" ? (
          filteredSessions.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No visitor sessions match the active filters.</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-5">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <tr>
                    {["Last seen", "Viewer", "Page trail", "Dwell", "Where", "Device", "Source / Ref", ""].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSessions.map((s) => (
                    <SessionRow
                      key={s.sessionKey}
                      s={s}
                      expanded={expandedKey === s.sessionKey}
                      activeInteraction={activeInteraction}
                      feedbackStatusOverrides={feedbackStatusOverrides}
                      onToggle={() => setExpandedKey((prev) => (prev === s.sessionKey ? null : s.sessionKey))}
                      onFilterVisitor={(vid) => setVisitorFilter(vid)}
                      onSelectInteraction={handleSelectInteraction}
                      onToggleFeedbackStatus={(id, nextStatus) => {
                        handleToggleFeedbackStatus(id, nextStatus).catch(() => undefined);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredVisits.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No site views match the active filters.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:-mx-5">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                <tr>
                  {[
                    "When / Live",
                    "Viewer & Session",
                    "Route & Step",
                    "Client",
                    "Dwell",
                    "Source / Ref",
                    "Interactions & Feedback",
                  ].map((h) => (
                    <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVisits.map((v) => (
                  <VisitRow
                    key={v.id}
                    v={v}
                    activeInteraction={activeInteraction}
                    feedbackStatusOverrides={feedbackStatusOverrides}
                    onFilterVisitor={(vid) => setVisitorFilter(vid)}
                    onSelectInteraction={handleSelectInteraction}
                    onToggleFeedbackStatus={(id, nextStatus) => {
                      handleToggleFeedbackStatus(id, nextStatus).catch(() => undefined);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
