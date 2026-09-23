import React from "react";
import type { AsolHealthOverview, AsolSourceStats } from "@/services/admin/asolHealthService";
import { formatLatency } from "./asolHelpers";

interface Props {
  data: AsolHealthOverview | null;
}

function RouteRow({ stat }: { stat: AsolSourceStats }): React.ReactElement {
  const { valid, unsigned, failed } = stat.signatureBreakdown;

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-900">
        {stat.source}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {stat.received.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right text-emerald-600 font-medium">
        {stat.processed.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-medium">
        <span className="text-amber-600">{stat.liveInFlight.toLocaleString()}</span>
        {stat.staleLocks > 0 && (
          <span className="text-rose-600 text-xs ml-1" title={`${stat.staleLocks} stale locks (>300s)`}>
            ({stat.staleLocks} stale)
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-rose-600 font-medium">
        {stat.failed.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right text-blue-600 font-medium">
        {stat.duplicates.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs">
        <span className="text-emerald-600" title="Valid standard webhook signatures">{valid}</span>
        <span className="text-gray-400 mx-1">/</span>
        <span className="text-gray-500" title="Unsigned requests">{unsigned}</span>
        <span className="text-gray-400 mx-1">/</span>
        <span className={failed > 0 ? "text-rose-600 font-bold" : "text-gray-400"} title="Failed signatures">{failed}</span>
      </td>
      <td className="px-4 py-3 text-right text-purple-600 font-medium">
        {formatLatency(stat.p95LatencyMs)}
      </td>
    </tr>
  );
}

export function AsolRouteBreakdown({ data }: Props): React.ReactElement {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">
          Route Health Breakdown
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Inbound Route Source</th>
              <th className="px-4 py-3 text-right">Received</th>
              <th className="px-4 py-3 text-right">Processed</th>
              <th className="px-4 py-3 text-right">In-Flight</th>
              <th className="px-4 py-3 text-right">Failed</th>
              <th className="px-4 py-3 text-right">Duplicates</th>
              <th className="px-4 py-3 text-right">Signatures (v/u/f)</th>
              <th className="px-4 py-3 text-right">P95 Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.sources.map((s) => (
              <RouteRow key={s.source} stat={s} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
