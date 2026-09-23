import React from "react";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";
import { formatLatency } from "./asolHelpers";

interface Props {
  data: AsolHealthOverview | null;
}

interface CardProps {
  label: string;
  value: string;
  subtext: string;
  valueColor?: string;
}

function KpiCard({ label, value, subtext, valueColor = "text-gray-900" }: CardProps): React.ReactElement {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${valueColor} mt-1`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
  );
}

export function AsolKpiGrid({ data }: Props): React.ReactElement {
  const successRate =
    data && data.totalReceived > 0
      ? Math.round((data.totalProcessed / data.totalReceived) * 100)
      : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard
        label="Total Inbound"
        value={data ? data.totalReceived.toLocaleString() : "—"}
        subtext={data ? `${data.totalProcessed} completed` : "—"}
      />
      <KpiCard
        label="Success Rate"
        value={successRate !== null ? `${successRate}%` : "—"}
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
        value={data ? data.totalInFlight.toLocaleString() : "—"}
        subtext="Active processing locks"
        valueColor="text-amber-600"
      />
      <KpiCard
        label="Failed"
        value={data ? data.totalFailed.toLocaleString() : "—"}
        subtext="Delivery errors"
        valueColor="text-rose-600"
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
