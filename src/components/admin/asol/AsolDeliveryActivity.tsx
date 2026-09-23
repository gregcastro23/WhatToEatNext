import React, { useState } from "react";
import type { AsolDeliveryEvent } from "@/services/admin/asolHealthService";
import { formatLatency, formatRelative, getStatusBadge } from "./asolHelpers";

interface Props {
  events: AsolDeliveryEvent[];
}

interface FilterProps {
  sourceFilter: string;
  statusFilter: string;
  totalFiltered: number;
  onSourceChange: (source: string) => void;
  onStatusChange: (status: string) => void;
}

function FilterBar({
  sourceFilter,
  statusFilter,
  totalFiltered,
  onSourceChange,
  onStatusChange,
}: FilterProps): React.ReactElement {
  return (
    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-gray-900">
        Recent Inbound Deliveries ({totalFiltered})
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sourceFilter}
          onChange={(e) => onSourceChange(e.target.value)}
          className="text-xs border-gray-300 rounded-md py-1 bg-white shadow-sm"
        >
          <option value="all">All Sources</option>
          <option value="asol-sync-event">asol-sync-event</option>
          <option value="asol-feed">asol-feed</option>
          <option value="asol-agent-recipes">asol-agent-recipes</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs border-gray-300 rounded-md py-1 bg-white shadow-sm"
        >
          <option value="all">All Statuses</option>
          <option value="processed">Processed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>
  );
}

function EventRow({ evt }: { evt: AsolDeliveryEvent }): React.ReactElement {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
        {formatRelative(evt.receivedAt)}
      </td>
      <td className="px-4 py-2 text-gray-900 font-semibold whitespace-nowrap">
        {evt.source}
      </td>
      <td className="px-4 py-2 text-gray-600 truncate max-w-[140px]" title={evt.eventId}>
        {evt.eventId}
      </td>
      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
        {evt.eventType}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
            evt.status,
          )}`}
        >
          {evt.status.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-2 text-right text-gray-600">
        {evt.duplicates > 0 ? evt.duplicates : "—"}
      </td>
      <td className="px-4 py-2 text-right text-gray-600">
        {formatLatency(evt.latencyMs)}
      </td>
      <td className="px-4 py-2 text-rose-600 truncate max-w-[200px]" title={evt.lastError ?? ""}>
        {evt.lastError ?? "—"}
      </td>
    </tr>
  );
}

export function AsolDeliveryActivity({ events }: Props): React.ReactElement {
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredEvents = events.filter((e) => {
    if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
    if (statusFilter !== "all" && e.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <FilterBar
        sourceFilter={sourceFilter}
        statusFilter={statusFilter}
        totalFiltered={filteredEvents.length}
        onSourceChange={setSourceFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5 text-left">Time</th>
              <th className="px-4 py-2.5 text-left">Source</th>
              <th className="px-4 py-2.5 text-left">Event ID</th>
              <th className="px-4 py-2.5 text-left">Type</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-right">Dups</th>
              <th className="px-4 py-2.5 text-right">Latency</th>
              <th className="px-4 py-2.5 text-left">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-mono">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-sans">
                  No matching webhook deliveries found.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => <EventRow key={evt.id} evt={evt} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
