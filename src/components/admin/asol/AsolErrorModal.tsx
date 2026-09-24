import React, { useState } from "react";
import type { AsolDeliveryEvent } from "@/services/admin/asolHealthService";
import { formatRelative, getStatusBadge } from "./asolHelpers";

interface Props {
  event: AsolDeliveryEvent | null;
  onClose: () => void;
}

function EventMetaGrid({ event }: { event: AsolDeliveryEvent }): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <span className="text-gray-500">Source:</span>
        <p className="font-semibold text-gray-900">{event.source}</p>
      </div>
      <div>
        <span className="text-gray-500">Event Type:</span>
        <p className="font-semibold text-gray-900">{event.eventType}</p>
      </div>
      <div>
        <span className="text-gray-500">Subject:</span>
        <p className="font-mono text-gray-900 truncate">{event.subjectId ?? "—"}</p>
      </div>
      <div>
        <span className="text-gray-500">Status:</span>
        <p className="mt-0.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(event.status)}`}>
            {event.status.toUpperCase()}
          </span>
        </p>
      </div>
      <div>
        <span className="text-gray-500">Attempts / Dups:</span>
        <p className="font-semibold text-gray-900">
          {event.attempts} attempt{event.attempts === 1 ? "" : "s"} / {event.duplicates} dup{event.duplicates === 1 ? "" : "s"}
        </p>
      </div>
      <div>
        <span className="text-gray-500">Received:</span>
        <p className="font-semibold text-gray-900">{formatRelative(event.receivedAt)}</p>
      </div>
    </div>
  );
}

function ErrorPayloadSection({ error }: { error?: string | null }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    if (!error) return;
    navigator.clipboard
      .writeText(error)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Error Payload</span>
        <button
          onClick={handleCopy}
          disabled={!error}
          className="text-[11px] font-medium text-purple-600 hover:text-purple-800 disabled:text-gray-400"
        >
          {copied ? "Copied!" : "Copy Error"}
        </button>
      </div>
      <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-rose-700 overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
        {error ?? "No recorded error details."}
      </pre>
    </div>
  );
}

function OperatorGuidance(): React.ReactElement {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
      <p className="font-semibold">Operator Guidance</p>
      <p className="text-blue-700">
        Inbound idempotency shields permit safe automatic retries. Planetary Agents will retry delivery with the same event ID, which will be claimed and reprocessed.
      </p>
    </div>
  );
}

export function AsolErrorModal({ event, onClose }: Props): React.ReactElement | null {
  if (!event) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asol-error-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close dialog backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-default"
      />

      <div className="relative z-10 bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 id="asol-error-modal-title" className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>⚠️</span> Delivery Failure Details
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{event.eventId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close error details dialog"
          >
            ×
          </button>
        </div>

        <EventMetaGrid event={event} />
        <ErrorPayloadSection error={event.lastError} />
        <OperatorGuidance />

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
