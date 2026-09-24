import React, { useState } from "react";
import type { AsolDeliveryEvent } from "@/services/admin/asolHealthService";
import { AsolErrorModal } from "./AsolErrorModal";
import { formatLatency, formatRelative, getStatusBadge } from "./asolHelpers";

interface Props {
  events: AsolDeliveryEvent[];
  statusFilter?: "all" | "failed";
  onStatusFilterChange?: (status: "all" | "failed") => void;
}

const SOURCES = [
  { value: "all", label: "All Sources" },
  { value: "asol-feed", label: "Feed Events" },
  { value: "asol-sync", label: "Economy Sync" },
  { value: "asol-agent-recipes", label: "Agent Recipes" },
];

function FilterBar({
  sourceFilter,
  statusFilter,
  totalFiltered,
  onSourceChange,
  onStatusChange,
}: {
  sourceFilter: string;
  statusFilter: string;
  totalFiltered: number;
  onSourceChange: (val: string) => void;
  onStatusChange: (val: string) => void;
}): React.ReactElement {
  return (
    <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-gray-900">Recent Webhook Deliveries</h2>
        <span className="text-xs text-gray-500">({totalFiltered} events)</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={sourceFilter}
          onChange={(e) => onSourceChange(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          aria-label="Filter deliveries by source"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          aria-label="Filter deliveries by status"
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

function EventRow({
  evt,
  onInspect,
}: {
  evt: AsolDeliveryEvent;
  onInspect: (evt: AsolDeliveryEvent) => void;
}): React.ReactElement {
  const isClickable = Boolean(evt.lastError) || evt.status === "failed";
  const badgeClass = `inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(evt.status)}`;

  return (
    <tr
      onClick={() => onInspect(evt)}
      className={`transition ${isClickable ? "cursor-pointer hover:bg-rose-50/50" : "hover:bg-gray-50"}`}
    >
      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{formatRelative(evt.receivedAt)}</td>
      <td className="px-4 py-2 text-gray-900 font-semibold whitespace-nowrap">{evt.source}</td>
      <td className="px-4 py-2 text-gray-600 truncate max-w-[140px]" title={evt.eventId}>{evt.eventId}</td>
      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{evt.eventType}</td>
      <td className="px-4 py-2 whitespace-nowrap">
        <span className={badgeClass}>{evt.status.toUpperCase()}</span>
      </td>
      <td className="px-4 py-2 text-right text-gray-600">{evt.duplicates > 0 ? evt.duplicates : "—"}</td>
      <td className="px-4 py-2 text-right text-gray-600">{formatLatency(evt.latencyMs)}</td>
      <td className="px-4 py-2 text-rose-600 truncate max-w-[200px]" title={evt.lastError ?? ""}>
        {evt.lastError ? <span className="underline decoration-dotted">{evt.lastError}</span> : "—"}
      </td>
    </tr>
  );
}

function EventsTable({
  events,
  onInspect,
}: {
  events: AsolDeliveryEvent[];
  onInspect: (evt: AsolDeliveryEvent) => void;
}): React.ReactElement {
  return (
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
            <th className="px-4 py-2.5 text-left">Error (click to inspect)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 font-mono">
          {events.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-sans">
                No matching webhook deliveries found.
              </td>
            </tr>
          ) : (
            events.map((evt) => <EventRow key={evt.id} evt={evt} onInspect={onInspect} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AsolDeliveryActivity({
  events,
  statusFilter: externalStatusFilter,
  onStatusFilterChange,
}: Props): React.ReactElement {
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [internalStatusFilter, setInternalStatusFilter] = useState<string>("all");
  const [inspectingEvent, setInspectingEvent] = useState<AsolDeliveryEvent | null>(null);

  const activeStatusFilter = externalStatusFilter ?? internalStatusFilter;

  const handleStatusChange = (val: string): void => {
    setInternalStatusFilter(val);
    if (onStatusFilterChange && (val === "all" || val === "failed")) {
      onStatusFilterChange(val);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
    if (activeStatusFilter !== "all" && e.status.toLowerCase() !== activeStatusFilter) return false;
    return true;
  });

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <FilterBar
          sourceFilter={sourceFilter}
          statusFilter={activeStatusFilter}
          totalFiltered={filteredEvents.length}
          onSourceChange={setSourceFilter}
          onStatusChange={handleStatusChange}
        />
        <EventsTable events={filteredEvents} onInspect={setInspectingEvent} />
      </div>

      <AsolErrorModal
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
      />
    </>
  );
}
