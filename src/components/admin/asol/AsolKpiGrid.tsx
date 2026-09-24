import React from "react";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";
import { formatLatency } from "./asolHelpers";

interface Props {
  data: AsolHealthOverview | null;
  onFilterFailed?: () => void;
}

interface CardProps {
  label: string;
  value: string;
  subtext: string;
  valueColor?: string;
  onClick?: () => void;
}

function KpiCard({
  label,
  value,
  subtext,
  valueColor = "text-gray-900",
  onClick,
}: CardProps): React.ReactElement {
  const content = (
    <>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${valueColor} mt-1`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-left cursor-pointer hover:border-rose-300 hover:shadow-md transition w-full"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      {content}
    </div>
  );
}

function getSuccessRate(data: AsolHealthOverview | null): string {
  if (!data || data.totalReceived <= 0) return "—";
  return `${Math.round((data.totalProcessed / data.totalReceived) * 100)}%`;
}

function getStaleSubtext(data: AsolHealthOverview | null): string {
  if (!data || data.totalStaleLocks <= 0) return "Active processing locks";
  return `${data.totalStaleLocks} stale locks (>300s)`;
}

export function AsolKpiGrid({ data, onFilterFailed }: Props): React.ReactElement {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard
        label="Total Inbound (24h)"
        value={data ? data.totalReceived.toLocaleString() : "—"}
        subtext={data ? `${data.totalProcessed} completed` : "—"}
      />
      <KpiCard
        label="Success Rate"
        value={getSuccessRate(data)}
        subtext="Processed deliveries"
        valueColor="text-emerald-600"
      />
      <KpiCard
        label="Duplicates Blocked"
        value={data ? data.totalDuplicates.toLocaleString() : "—"}
        subtext="Idempotency shields"
        valueColor="text-blue-600"
      />
      <KpiCard
        label="In-Flight"
        value={data ? data.totalLiveInFlight.toLocaleString() : "—"}
        subtext={getStaleSubtext(data)}
        valueColor={data && data.totalStaleLocks > 0 ? "text-rose-600" : "text-amber-600"}
      />
      <KpiCard
        label="Failed"
        value={data ? data.totalFailed.toLocaleString() : "—"}
        subtext="Delivery errors (24h)"
        valueColor="text-rose-600"
        {...(onFilterFailed ? { onClick: onFilterFailed } : {})}
      />
      <KpiCard
        label="P95 Latency"
        value={data ? formatLatency(data.overallP95LatencyMs) : "—"}
        subtext="Across all endpoints"
        valueColor="text-purple-600"
      />
    </div>
  );
}
