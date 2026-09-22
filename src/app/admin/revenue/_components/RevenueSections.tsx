"use client";

/**
 * Headline, volume, and funnel sections of /admin/revenue.
 *
 * @file src/app/admin/revenue/_components/RevenueSections.tsx
 */

import React from "react";
import { ColumnChart } from "@/components/admin/live/charts";
import { fmtInt, fmtMoney, fmtMoneyList, fmtPct } from "@/components/admin/live/format";
import { Absent, Panel, Pill, Stat, StatGrid, type Tone } from "@/components/admin/live/primitives";
import type { RevenueView } from "@/lib/admin/schemas/revenue";

export function ModeBanner({ data }: { data: RevenueView }): React.JSX.Element | null {
  if (!data.configured) {
    return <Absent><Pill tone="bad">Not connected</Pill> STRIPE_SECRET_KEY is not set in this deployment.</Absent>;
  }
  const partial = data.errors.length > 0;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {data.mode === "live" && <Pill tone="ok">Live mode — real money</Pill>}
      {data.mode === "test" && <Pill tone="warn">Test mode — these are test payments, not revenue</Pill>}
      {data.mode === "unknown" && <Pill tone="neutral">Key mode unrecognised</Pill>}
      {partial && <Pill tone="bad" title={data.errors.join("\n")}>{data.errors.length} Stripe read(s) failed</Pill>}
    </div>
  );
}

interface StatSpec {
  value: string | null;
  sub: string;
  tone?: Tone;
}

const FAILED: StatSpec = { value: null, sub: "Stripe read failed" };

function subscriptionStats(subs: RevenueView["subscriptions"]): [StatSpec, StatSpec] {
  if (!subs) return [FAILED, FAILED];
  return [
    { value: fmtMoneyList(subs.mrr), sub: "active + past_due subscriptions, from their prices", tone: "info" },
    { value: fmtInt(subs.active), sub: `+${subs.newLast30d} new / −${subs.canceledLast30d} canceled (30d)` },
  ];
}

function chargeStats(charges: RevenueView["charges"]): [StatSpec, StatSpec] {
  if (!charges) return [FAILED, FAILED];
  return [
    { value: fmtMoneyList(charges.net), sub: `${charges.succeeded} succeeded charges`, tone: charges.succeeded > 0 ? "ok" : "neutral" },
    { value: fmtInt(charges.failed), sub: `refunded ${fmtMoneyList(charges.refunded)}`, tone: charges.failed > 0 ? "warn" : "neutral" },
  ];
}

function balanceStat(balance: RevenueView["balance"]): StatSpec {
  return balance ? { value: fmtMoneyList(balance.available), sub: `pending ${fmtMoneyList(balance.pending)}` } : FAILED;
}

function deliveryStat(events: RevenueView["events"]): StatSpec {
  if (!events) return FAILED;
  const pending = events.pendingDelivery.length;
  return { value: fmtInt(pending), sub: "events awaiting delivery (7d)", tone: pending > 0 ? "bad" : "ok" };
}

export function RevenueKpis({ data }: { data: RevenueView }): React.JSX.Element {
  const [mrr, paying] = subscriptionStats(data.subscriptions);
  const [net, failed] = chargeStats(data.charges);
  return (
    <StatGrid>
      <Stat label="MRR" {...mrr} />
      <Stat label="Paying subscriptions" {...paying} />
      <Stat label="Net volume · 30d" {...net} />
      <Stat label="Available balance" {...balanceStat(data.balance)} />
      <Stat label="Failed charges · 30d" {...failed} />
      <Stat label="Webhook delivery" {...deliveryStat(data.events)} />
    </StatGrid>
  );
}

export function VolumeChart({ data }: { data: RevenueView }): React.JSX.Element {
  const { charges } = data;
  if (!charges) return <Panel title="Daily net volume"><Absent>Charges could not be read from Stripe.</Absent></Panel>;
  const currency = charges.dailyCurrency ?? "usd";
  const columns = charges.daily.map((d) => ({ key: d.day, label: d.day.slice(5).replace("-", "/"), value: d.gross }));
  return (
    <Panel title="Daily net volume" subtitle={`succeeded charges minus refunds, ${currency.toUpperCase()}, last ${charges.windowDays} days (UTC)`}>
      <ColumnChart columns={columns} format={(n): string => fmtMoney(n, currency)} ariaLabel="Daily net charge volume" />
      {charges.truncated && <p className="mt-2 text-[11px] text-amber-700">Capped at 500 charges — older days may be incomplete.</p>}
    </Panel>
  );
}

const PURPOSE_LABEL: Record<string, string> = {
  premium_subscription: "Premium subscription",
  mcp_top_up: "MCP credit top-up",
  token_package: "ESMS token pack",
  restaurant_order: "Restaurant order",
  other: "Other / untagged",
};

function CheckoutRow({ row }: { row: NonNullable<RevenueView["checkout"]>["byPurpose"][number] }): React.JSX.Element {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 font-medium text-gray-800">{PURPOSE_LABEL[row.purpose] ?? row.purpose}</td>
      <td className="px-3 py-2 font-mono">{fmtInt(row.created)}</td>
      <td className="px-3 py-2 font-mono">{fmtInt(row.completed)}</td>
      <td className="px-3 py-2 font-mono">{row.created > 0 ? fmtPct(row.completed / row.created) : "—"}</td>
      <td className="px-3 py-2 font-mono text-gray-500">{fmtInt(row.expired)} / {fmtInt(row.open)}</td>
      <td className="px-3 py-2 font-mono text-gray-900">{fmtMoney(row.revenue, row.currency ?? "usd")}</td>
    </tr>
  );
}

export function CheckoutFunnel({ data }: { data: RevenueView }): React.JSX.Element {
  const { checkout } = data;
  return (
    <Panel title="Checkout funnel by purpose" subtitle={`Stripe Checkout sessions opened in the last ${checkout?.windowDays ?? 30} days`}>
      {!checkout && <Absent>Checkout sessions could not be read from Stripe.</Absent>}
      {checkout?.byPurpose.length === 0 && <p className="text-xs text-gray-500">No checkout sessions in the window — nobody has started a purchase.</p>}
      {checkout && checkout.byPurpose.length > 0 && (
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                {["Purpose", "Started", "Paid", "Conversion", "Expired / open", "Revenue"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {checkout.byPurpose.map((row) => <CheckoutRow key={row.purpose} row={row} />)}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
