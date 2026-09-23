import React from "react";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";
import { formatRelative } from "./asolHelpers";

interface Props {
  data: AsolHealthOverview | null;
}

function SecretRow({ label, isConfigured }: { label: string; isConfigured: boolean }): React.ReactElement {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium border ${
          isConfigured
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-rose-50 text-rose-700 border-rose-200"
        }`}
      >
        {isConfigured ? "CONFIGURED" : "MISSING"}
      </span>
    </div>
  );
}

function SecurityStatusPanel({ data }: Props): React.ReactElement {
  const feedStatus = data?.feedStatus;
  const isInternalConfigured = Boolean(feedStatus?.internalSecretConfigured);
  const isSyncConfigured = Boolean(feedStatus?.syncSecretConfigured);
  const isHookConfigured = Boolean(feedStatus?.hookSecretConfigured);
  const signatureMode = feedStatus?.signatureMode ?? "off";
  const signatureModeInfo = feedStatus?.signatureModeInfo;

  const getSignatureBadgeStyle = (): string => {
    if (signatureModeInfo && !signatureModeInfo.valid) return "bg-rose-50 text-rose-700 border-rose-200";
    if (signatureMode === "required") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (signatureMode === "shadow") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const signatureBadgeLabel = signatureModeInfo && !signatureModeInfo.valid
    ? `INVALID (${signatureModeInfo.raw ?? signatureMode})`
    : signatureMode.toUpperCase();

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>🛡️</span> Integration Security & Auth Status
      </h2>
      <div className="space-y-3 text-sm">
        <SecretRow label="HOOK_SECRET_ASOL" isConfigured={isHookConfigured} />
        <SecretRow label="INTERNAL_API_SECRET" isConfigured={isInternalConfigured} />
        <SecretRow label="ALCHM_KITCHEN_SYNC_SECRET" isConfigured={isSyncConfigured} />

        <div className="flex items-center justify-between py-1.5">
          <span className="text-gray-600">ASOL_WEBHOOK_SIGNATURES</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSignatureBadgeStyle()}`}>
            {signatureBadgeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function FeedEmitterPanel({ data }: Props): React.ReactElement {
  const lastEmit = data?.feedStatus.lastEmit;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>📡</span> Live Feed Emitter Status
      </h2>
      {lastEmit ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Last Event Type</span>
            <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
              {lastEmit.eventType}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Agent Email</span>
            <span className="font-mono text-xs text-gray-900 truncate max-w-[200px]">
              {lastEmit.agentEmail}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-gray-600">Response Code / Time</span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  lastEmit.responseCode === 200
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                HTTP {lastEmit.responseCode}
              </span>
              <span className="text-xs text-gray-400">
                {formatRelative(lastEmit.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 py-6 text-center">
          No recent in-memory feed emit recorded in this instance lifecycle.
        </div>
      )}
    </div>
  );
}

export function AsolStatusPanels({ data }: Props): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SecurityStatusPanel data={data} />
      <FeedEmitterPanel data={data} />
    </div>
  );
}
