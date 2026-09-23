"use client";

/**
 * /admin/jobs — are the crons and synthetic probes actually running, and which
 * of them keep emailing? GET /api/admin/jobs, polled every 60s.
 *
 * @file src/app/admin/jobs/page.tsx
 */

import React from "react";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { JobsSchema, type JobsView } from "@/lib/admin/schemas/jobs";
import { AlertNoise } from "./_components/AlertNoise";
import { JobsKpis, MinuteLoadPanel } from "./_components/JobsSummary";
import { JobsTable } from "./_components/JobsTable";

function JobsBody({ data }: { data: JobsView }): React.JSX.Element {
  return (
    <>
      <JobsKpis data={data} />
      <JobsTable data={data} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MinuteLoadPanel data={data} />
        <AlertNoise data={data} />
      </div>
    </>
  );
}

function body(data: JobsView | null, error: string | null, retry: () => void): React.JSX.Element {
  if (data) return <JobsBody data={data} />;
  if (error) return <ErrorBlock message={error} onRetry={retry} />;
  return <LoadingBlock label="Loading jobs…" />;
}

export default function JobsPage(): React.JSX.Element {
  const { data, error, updatedAt, refresh } = useAdminResource("/api/admin/jobs", JobsSchema, 60_000);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs & probes"
        description="Every cron and synthetic probe, judged by the runs it actually recorded: missed runs, failures, how close each runs to its time limit, and which components keep sending alert emails."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />
      {body(data, error, refresh)}
    </div>
  );
}
