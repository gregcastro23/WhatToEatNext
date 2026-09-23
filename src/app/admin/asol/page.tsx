"use client";

import React from "react";
import { PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { AsolAlertBanner } from "@/components/admin/asol/AsolAlertBanner";
import { AsolDeliveryActivity } from "@/components/admin/asol/AsolDeliveryActivity";
import { AsolKpiGrid } from "@/components/admin/asol/AsolKpiGrid";
import { AsolRouteBreakdown } from "@/components/admin/asol/AsolRouteBreakdown";
import { AsolStatusPanels } from "@/components/admin/asol/AsolStatusPanels";
import { AsolHealthOverviewSchema } from "@/lib/admin/schemas/asol";

export default function AsolHealthPage(): React.ReactElement {
  const { data, error, updatedAt, refresh } = useAdminResource(
    "/api/admin/asol",
    AsolHealthOverviewSchema,
    15_000,
  );

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Planetary Agents (ASOL) Delivery Health"
        description="Real-time delivery telemetry, idempotency deduplication shields, and cross-app integration health."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />

      <AsolAlertBanner data={data} />

      {error && !data && (
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
