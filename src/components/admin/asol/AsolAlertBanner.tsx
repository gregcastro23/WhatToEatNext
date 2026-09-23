import React from "react";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";

interface Props {
  data: AsolHealthOverview | null;
}

interface AlertItem {
  id: string;
  severity: "critical" | "warning";
  title: string;
  description: string;
}

export function AsolAlertBanner({ data }: Props): React.ReactElement | null {
  if (!data) return null;

  const alerts: AlertItem[] = [];

  // 1. Stale locks (> 300s)
  if (data.totalStaleLocks > 0) {
    alerts.push({
      id: "stale-locks",
      severity: "critical",
      title: `${data.totalStaleLocks} Stale Processing Lock${data.totalStaleLocks === 1 ? "" : "s"} Detected`,
      description: "Locks older than 300 seconds are eligible for automated redelivery recovery.",
    });
  }

  // 2. Unreclaimed failures in 24h
  if (data.totalFailed > 0) {
    alerts.push({
      id: "failed-deliveries",
      severity: "warning",
      title: `${data.totalFailed} Failed Deliver${data.totalFailed === 1 ? "y" : "ies"} in Last 24 Hours`,
      description: "Inbound events recorded with status 'failed'. Check last errors in delivery activity below.",
    });
  }

  // 3. High latency thresholds
  for (const src of data.sources) {
    const threshold = src.source === "asol-agent-recipes" ? 4000 : 5000;
    if (src.p95LatencyMs !== null && src.p95LatencyMs > threshold) {
      alerts.push({
        id: `p95-${src.source}`,
        severity: "warning",
        title: `High p95 Latency on ${src.source}: ${src.p95LatencyMs}ms`,
        description: `Exceeds the ${threshold}ms operational threshold for inbound webhook handling.`,
      });
    }
  }

  // 4. Misconfigured signature mode
  if (data.feedStatus.signatureModeInfo && !data.feedStatus.signatureModeInfo.valid) {
    const raw = data.feedStatus.signatureModeInfo.raw ?? "";
    alerts.push({
      id: "sig-mode-invalid",
      severity: "critical",
      title: `Invalid Signature Mode Configuration: "${raw}"`,
      description: 'ASOL_WEBHOOK_SIGNATURES must be one of "off", "shadow", or "required". Defaulting to shadow.',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3.5 rounded-lg border text-xs flex items-start justify-between gap-3 ${
            alert.severity === "critical"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="space-y-0.5">
            <p className="font-semibold flex items-center gap-1.5">
              <span>{alert.severity === "critical" ? "🚨" : "⚠️"}</span>
              {alert.title}
            </p>
            <p className="text-gray-600">{alert.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
