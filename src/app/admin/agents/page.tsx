"use client";

/**
 * Admin Agents Page
 *
 * Consolidated boundary telemetry between WTEN and Planetary Agents (ASOL):
 *   1. Service Reachability & Latency (planetaryAgentsApi, agentsUi)
 *   2. Boundary Contract Diagnostic Probes (with 401 Negative Controls)
 *   3. Agent Actions & Bridge Health (credit/debit paths, operational routes, crons, recipe pipeline)
 *   4. ASOL Inbound Delivery Telemetry (KPIs, secrets/signatures, routes, event log)
 *
 * @file src/app/admin/agents/page.tsx
 */

import React, { useState } from "react";
import { ActionsSection } from "@/components/admin/agents/ActionsSection";
import { ConnectivitySection } from "@/components/admin/agents/ConnectivitySection";
import { AsolAlertBanner } from "@/components/admin/asol/AsolAlertBanner";
import { AsolDeliveryActivity } from "@/components/admin/asol/AsolDeliveryActivity";
import { AsolKpiGrid } from "@/components/admin/asol/AsolKpiGrid";
import { AsolRouteBreakdown } from "@/components/admin/asol/AsolRouteBreakdown";
import { AsolStatusPanels } from "@/components/admin/asol/AsolStatusPanels";
import { PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { AdminAgentsSchema, type AdminAgentsView } from "@/lib/admin/schemas/agents";

function InboundTelemetrySection({
  inboundData,
}: {
  inboundData: AdminAgentsView["connectivity"]["inboundDelivery"] | null;
}): React.ReactElement {
  const [statusFilter, setStatusFilter] = useState<"all" | "failed">("all");

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div>
        <h2 className="text-base font-bold text-gray-900">Inbound Webhook Delivery Telemetry</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Real-time delivery telemetry, deduplication shields, and webhook signature verification from ASOL.
        </p>
      </div>
      <AsolAlertBanner data={inboundData} onFilterFailed={() => setStatusFilter("failed")} />
      <AsolKpiGrid data={inboundData} onFilterFailed={() => setStatusFilter("failed")} />
      <AsolStatusPanels data={inboundData} />
      <AsolRouteBreakdown data={inboundData} />
      <AsolDeliveryActivity
        events={inboundData?.recentEvents ?? []}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
}

export default function AdminAgentsPage(): React.ReactElement {
  const { data, error, updatedAt, refresh } = useAdminResource(
    "/api/admin/agents",
    AdminAgentsSchema,
    15_000,
  );

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Planetary Agents"
        description="Planetary Agents (ASOL) connectivity, contract probes, delivery telemetry, and agent action health."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />

      {error && !data && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          <p className="font-semibold">Unable to load Agents telemetry</p>
          <p className="text-xs mt-1 text-rose-600">{error}</p>
        </div>
      )}

      <ConnectivitySection connectivity={data?.connectivity} roster={data?.roster} />
      <ActionsSection actions={data?.actions} />
      <InboundTelemetrySection inboundData={data?.connectivity.inboundDelivery ?? null} />
    </div>
  );
}
