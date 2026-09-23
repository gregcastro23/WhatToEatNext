"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AsolDeliveryActivity } from "@/components/admin/asol/AsolDeliveryActivity";
import { AsolKpiGrid } from "@/components/admin/asol/AsolKpiGrid";
import { AsolRouteBreakdown } from "@/components/admin/asol/AsolRouteBreakdown";
import { AsolStatusPanels } from "@/components/admin/asol/AsolStatusPanels";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAsolHealthOverview(value: unknown): value is AsolHealthOverview {
  if (!isRecord(value)) return false;
  return (
    typeof value.generatedAt === "string" &&
    typeof value.totalReceived === "number" &&
    typeof value.totalProcessed === "number" &&
    typeof value.totalInFlight === "number" &&
    typeof value.totalFailed === "number" &&
    typeof value.totalDuplicates === "number" &&
    Array.isArray(value.sources) &&
    Array.isArray(value.recentEvents) &&
    isRecord(value.feedStatus)
  );
}

interface HeaderProps {
  autoRefresh: boolean;
  loading: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
  onRefresh: () => void;
}

function DashboardHeader({
  autoRefresh,
  loading,
  onAutoRefreshChange,
  onRefresh,
}: HeaderProps): React.ReactElement {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Planetary Agents (ASOL) Delivery Health
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            Contract v1
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Real-time delivery telemetry, idempotency deduplication shields, and cross-app integration health.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onAutoRefreshChange(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          Auto-refresh (15s)
        </label>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition shadow-sm"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}

interface TelemetryState {
  data: AsolHealthOverview | null;
  loading: boolean;
  error: string | null;
  handleRefresh: () => void;
}

function useAsolTelemetry(autoRefresh: boolean): TelemetryState {
  const [data, setData] = useState<AsolHealthOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/asol");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: unknown = await res.json();
      if (isAsolHealthOverview(json)) {
        setData(json);
        setError(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ASOL telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback((): void => {
    fetchData().catch((): void => {});
  }, [fetchData]);

  useEffect(() => {
    fetchData().catch((): void => {});
    if (!autoRefresh) return;
    const interval = setInterval((): void => {
      fetchData().catch((): void => {});
    }, 15_000);
    return (): void => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  return { data, loading, error, handleRefresh };
}

export default function AsolHealthPage(): React.ReactElement {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, loading, error, handleRefresh } = useAsolTelemetry(autoRefresh);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <DashboardHeader
        autoRefresh={autoRefresh}
        loading={loading}
        onAutoRefreshChange={setAutoRefresh}
        onRefresh={handleRefresh}
      />

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          <p className="font-semibold">Unable to load ASOL telemetry</p>
          <p className="text-xs mt-1 text-rose-600">{error}</p>
        </div>
      )}

      <AsolKpiGrid data={data} />
      <AsolStatusPanels data={data} />
      <AsolRouteBreakdown data={data} />
      <AsolDeliveryActivity events={data?.recentEvents ?? []} />
    </div>
  );
}
