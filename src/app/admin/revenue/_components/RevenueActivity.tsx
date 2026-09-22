"use client";

/**
 * Recent charges and webhook health on /admin/revenue.
 *
 * @file src/app/admin/revenue/_components/RevenueActivity.tsx
 */

import React from "react";
import { BarList } from "@/components/admin/live/charts";
import { fmtAgo, fmtDateTime, fmtInt, fmtMoney } from "@/components/admin/live/format";
import { Absent, Panel, Pill, type Tone } from "@/components/admin/live/primitives";
import type { RevenueView } from "@/lib/admin/schemas/revenue";

type Charge = NonNullable<RevenueView["charges"]>["recent"][number];

const STATUS_TONE: Record<string, Tone> = { succeeded: "ok", pending: "warn", failed: "bad" };

function ChargeRow({ c }: { c: Charge }): React.JSX.Element {
  const refunded = c.amountRefunded > 0;
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 whitespace-nowrap text-gray-500" title={fmtDateTime(c.created)}>{fmtAgo(c.created)}</td>
      <td className="px-3 py-2 font-mono text-gray-900">{fmtMoney(c.amount, c.currency)}</td>
      <td className="px-3 py-2">
        <Pill tone={STATUS_TONE[c.status] ?? "neutral"} title={c.failureMessage ?? c.status}>{c.status}</Pill>
        {refunded && <span className="ml-1 text-[10px] text-amber-700">refunded {fmtMoney(c.amountRefunded, c.currency)}</span>}
      </td>
      <td className="px-3 py-2 text-gray-700">{c.purpose ?? "—"}</td>
      <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate" title={c.email ?? ""}>{c.email ?? "—"}</td>
      <td className="px-3 py-2 text-gray-500">{c.method ?? "—"}</td>
    </tr>
  );
}

export function RecentCharges({ data }: { data: RevenueView }): React.JSX.Element {
  const recent = data.charges?.recent ?? null;
  return (
    <Panel title="Recent charges" subtitle="newest first, last 30 days">
      {recent === null && <Absent>Charges could not be read from Stripe.</Absent>}
      {recent?.length === 0 && <p className="text-xs text-gray-500">No charges in the last 30 days.</p>}
      {recent && recent.length > 0 && (
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                {["When", "Amount", "Status", "Purpose", "Customer", "Method"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((c) => <ChargeRow key={c.id} c={c} />)}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

const COVERAGE_TONE: Record<string, Tone> = { ok: "ok", degraded: "warn", incident: "bad", unknown: "neutral" };

function Coverage({ coverage }: { coverage: RevenueView["webhookCoverage"] }): React.JSX.Element {
  if (!coverage) return <Absent>Webhook endpoint configuration could not be read.</Absent>;
  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <Pill tone={COVERAGE_TONE[coverage.status] ?? "neutral"}>{coverage.status}</Pill>
        <span className="text-gray-700">{coverage.summary}</span>
      </div>
      {coverage.endpointUrl && <p className="font-mono text-[11px] text-gray-500 break-all">{coverage.endpointUrl} · {coverage.endpointStatus ?? "?"}</p>}
      {coverage.missingEvents.length > 0 && (
        <p className="text-rose-700">Not subscribed: {coverage.missingEvents.join(", ")}</p>
      )}
    </div>
  );
}

function PendingDeliveries({ events }: { events: NonNullable<RevenueView["events"]> }): React.JSX.Element {
  if (events.pendingDelivery.length === 0) {
    return <p className="text-xs text-emerald-700">Every event in the last {events.windowDays} days was delivered.</p>;
  }
  return (
    <ul className="space-y-1 text-xs">
      {events.pendingDelivery.map((e) => (
        <li key={e.id} className="flex justify-between gap-2">
          <span className="font-mono text-rose-700">{e.type}</span>
          <span className="text-gray-500">{fmtAgo(e.created)} · {e.pendingWebhooks} pending</span>
        </li>
      ))}
    </ul>
  );
}

export function WebhookHealth({ data }: { data: RevenueView }): React.JSX.Element {
  const { events } = data;
  return (
    <Panel title="Webhook health" subtitle="is Stripe telling us about every payment?">
      <Coverage coverage={data.webhookCoverage} />
      <h3 className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Awaiting delivery</h3>
      {events ? <PendingDeliveries events={events} /> : <Absent>Events could not be read.</Absent>}
      <h3 className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Event types · {events?.windowDays ?? 7}d ({fmtInt(events?.total ?? 0)} events)
      </h3>
      <BarList rows={(events?.byType ?? []).map((t) => ({ label: t.type, value: t.count }))} format={fmtInt} empty="No Stripe events in the window." />
    </Panel>
  );
}
