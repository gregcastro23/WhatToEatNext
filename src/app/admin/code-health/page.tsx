"use client";

/**
 * /admin/code-health — the TypeScript campaign, live: tsc and ESLint
 * readings per commit, the ratchet baselines and their history, CI on master,
 * and what is deployed. GET /api/admin/code-health, polled every 2 minutes.
 *
 * @file src/app/admin/code-health/page.tsx
 */

import React from "react";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { CodeHealthSchema, type CodeHealthView } from "@/lib/admin/schemas/codeHealth";
import { CiPanel, RatchetGates, ShippingPanel } from "./_components/CodeHealthActivity";
import { CodeKpis, DebtTrend, ReadingsNotice, RuleBreakdown, WarningsHistory } from "./_components/CodeHealthSections";

function CodeHealthBody({ data }: { data: CodeHealthView }): React.JSX.Element {
  return (
    <>
      <CodeKpis data={data} />
      <ReadingsNotice data={data} />
      <DebtTrend data={data} />
      <WarningsHistory data={data} />
      <RuleBreakdown data={data} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <CiPanel data={data} />
        <RatchetGates data={data} />
        <ShippingPanel data={data} />
      </div>
    </>
  );
}

function body(data: CodeHealthView | null, error: string | null, retry: () => void): React.JSX.Element {
  if (data) return <CodeHealthBody data={data} />;
  if (error) return <ErrorBlock message={error} onRetry={retry} />;
  return <LoadingBlock label="Reading CI, baselines, and snapshots…" />;
}

export default function CodeHealthPage(): React.JSX.Element {
  const { data, error, updatedAt, refresh } = useAdminResource("/api/admin/code-health", CodeHealthSchema, 120_000);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Code Health"
        description="TypeScript errors, ESLint warnings, and every ratchet the verify gate enforces — per commit, with the trend since the campaign began."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />
      {body(data, error, refresh)}
    </div>
  );
}
