"use client";

/**
 * Newest human signups and most active humans, each linking to the user's
 * admin detail page.
 *
 * @file src/app/admin/growth/_components/GrowthTables.tsx
 */

import Link from "next/link";
import React from "react";
import { fmtAgo, fmtDateTime, fmtInt } from "@/components/admin/live/format";
import { Panel, Pill } from "@/components/admin/live/primitives";
import type { GrowthView } from "@/lib/admin/schemas/growth";

function UserCell({ id, name, email }: { id: string; name: string | null; email: string }): React.JSX.Element {
  return (
    <td className="px-3 py-2">
      <Link href={`/admin/users/${id}`} className="font-medium text-indigo-700 hover:underline">
        {name ?? email}
      </Link>
      {name && <div className="text-[10px] text-gray-500">{email}</div>}
    </td>
  );
}

function Header({ cols }: { cols: string[] }): React.JSX.Element {
  return (
    <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
      <tr>
        {cols.map((c) => <th key={c} scope="col" className="px-3 py-2 text-left font-semibold">{c}</th>)}
      </tr>
    </thead>
  );
}

export function RecentSignups({ rows }: { rows: GrowthView["recentSignups"] }): React.JSX.Element {
  return (
    <Panel title="Newest humans" subtitle="latest signups and whether they came back">
      {rows.length === 0 ? (
        <p className="text-xs text-gray-500">No human signups yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <table className="w-full text-xs">
            <Header cols={["User", "Joined", "Onboarded", "Last active", "Events 7d"]} />
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <UserCell id={r.id} name={r.name} email={r.email} />
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600" title={fmtDateTime(r.createdAt)}>{fmtAgo(r.createdAt)}</td>
                  <td className="px-3 py-2">{r.onboarded ? <Pill tone="ok">Yes</Pill> : <Pill tone="warn">No</Pill>}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">{fmtAgo(r.lastActiveAt)}</td>
                  <td className="px-3 py-2 font-mono text-gray-800">{fmtInt(r.events7d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export function MostActive({ rows }: { rows: GrowthView["mostActive"] }): React.JSX.Element {
  return (
    <Panel title="Most active humans" subtitle="recorded events in the last 30 days">
      {rows.length === 0 ? (
        <p className="text-xs text-gray-500">No human activity in the last 30 days.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <table className="w-full text-xs">
            <Header cols={["User", "Events 30d", "Last active"]} />
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <UserCell id={r.id} name={r.name} email={r.email} />
                  <td className="px-3 py-2 font-mono text-gray-800">{fmtInt(r.events30d)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">{fmtAgo(r.lastActiveAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
