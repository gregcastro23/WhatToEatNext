"use client";

/**
 * The raw visit stream — every recent human page view, newest first. This is
 * the "someone just visited" view: where they landed, from where, on what,
 * and who they are when they are signed in.
 *
 * @file src/app/admin/traffic/_components/RecentVisits.tsx
 */

import Link from "next/link";
import React from "react";
import { fmtAgo, fmtDateTime } from "@/components/admin/live/format";
import { Panel, Pill } from "@/components/admin/live/primitives";
import type { TrafficSummaryView } from "@/lib/admin/schemas/traffic";

type Visit = TrafficSummaryView["recent"][number];

/** ISO-3166 alpha-2 → regional-indicator flag; anything else → empty. */
function flag(country: string | null): string {
  if (!country || !/^[A-Za-z]{2}$/.test(country)) return "";
  return String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function place(v: Visit): string {
  const parts = [v.city, v.region, v.country].filter((p): p is string => p !== null && p.length > 0);
  return parts.length > 0 ? parts.join(", ") : "unknown location";
}

function Who({ v }: { v: Visit }): React.JSX.Element {
  if (!v.user) return <span className="text-gray-400">anonymous</span>;
  return (
    <Link href={`/admin/users/${v.user.id}`} className="text-indigo-700 hover:underline">
      {v.user.name ?? v.user.email}
      {v.user.isAdmin && <span className="ml-1 text-[10px] text-gray-400">(admin)</span>}
    </Link>
  );
}

function VisitRow({ v }: { v: Visit }): React.JSX.Element {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 whitespace-nowrap text-gray-500" title={fmtDateTime(v.at)}>{fmtAgo(v.at)}</td>
      <td className="px-3 py-2 font-mono text-gray-900 max-w-[220px] truncate" title={v.path}>{v.path}</td>
      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
        <span aria-hidden="true">{flag(v.country)} </span>
        {place(v)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{[v.browser, v.os].filter(Boolean).join(" · ") || v.deviceType}</td>
      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{v.referrerHost ?? "—"}</td>
      <td className="px-3 py-2 whitespace-nowrap"><Who v={v} /></td>
    </tr>
  );
}

export function RecentVisits({ visits }: { visits: Visit[] }): React.JSX.Element {
  return (
    <Panel title="Visit stream" subtitle="latest human page views, newest first" right={<Pill tone="info">{visits.length} shown</Pill>}>
      {visits.length === 0 ? (
        <p className="text-xs text-gray-500">No page views recorded yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                {["When", "Page", "Where", "Device", "Referrer", "Who"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visits.map((v) => <VisitRow key={v.id} v={v} />)}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
