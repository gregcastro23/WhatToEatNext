"use client";

/**
 * /admin/growth — are real people signing up, coming back, and paying?
 * Humans only (GET /api/admin/growth), polled every 60s.
 *
 * @file src/app/admin/growth/page.tsx
 */

import React from "react";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { GrowthSchema, type GrowthView } from "@/lib/admin/schemas/growth";
import { Cohorts, Funnel, GrowthBasis, GrowthCharts, GrowthKpis } from "./_components/GrowthSections";
import { MostActive, RecentSignups } from "./_components/GrowthTables";

function GrowthBody({ data }: { data: GrowthView }): React.JSX.Element {
  return (
    <>
      <GrowthKpis data={data} />
      <GrowthCharts data={data} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Funnel data={data} />
        <Cohorts data={data} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecentSignups rows={data.recentSignups} />
        <MostActive rows={data.mostActive} />
      </div>
      <GrowthBasis data={data} />
    </>
  );
}

function body(data: GrowthView | null, error: string | null, retry: () => void): React.JSX.Element {
  if (data) return <GrowthBody data={data} />;
  if (error) return <ErrorBlock message={error} onRetry={retry} />;
  return <LoadingBlock label="Loading growth…" />;
}

export default function GrowthPage(): React.JSX.Element {
  const { data, error, updatedAt, refresh } = useAdminResource("/api/admin/growth", GrowthSchema, 60_000);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Growth"
        description="Human users only — signups, daily/weekly/monthly actives, retention by signup week, and the path from signup to paying."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />
      {body(data, error, refresh)}
    </div>
  );
}
