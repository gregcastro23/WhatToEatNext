"use client";

/**
 * /admin/traffic — who is on alchm.kitchen, where they came from, what they
 * read. First-party page views (GET /api/admin/traffic), polled every 10s.
 *
 * @file src/app/admin/traffic/page.tsx
 */

import React, { useState } from "react";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { TrafficSummarySchema, type TrafficSummaryView } from "@/lib/admin/schemas/traffic";
import { RecentVisits } from "./_components/RecentVisits";
import {
  LiveNow,
  TopLists,
  TrafficBasis,
  TrafficChart,
  TrafficKpis,
  TrafficStatusNotice,
} from "./_components/TrafficSections";

type Range = TrafficSummaryView["range"];
const RANGES: Range[] = ["24h", "7d", "30d"];

function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }): React.JSX.Element {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={value === r}
          onClick={(): void => onChange(r)}
          className={`px-3 py-1 text-xs font-semibold rounded-md ${value === r ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function TrafficBody({ data }: { data: TrafficSummaryView }): React.JSX.Element {
  return (
    <>
      <TrafficStatusNotice data={data} />
      <TrafficKpis data={data} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><TrafficChart data={data} /></div>
        <LiveNow data={data} />
      </div>
      <RecentVisits visits={data.recent} />
      <TopLists data={data} />
      <TrafficBasis data={data} />
    </>
  );
}

function Pending({ error, onRetry }: { error: string | null; onRetry: () => void }): React.JSX.Element {
  return error ? <ErrorBlock message={error} onRetry={onRetry} /> : <LoadingBlock label="Loading traffic…" />;
}

export default function TrafficPage(): React.JSX.Element {
  const [range, setRange] = useState<Range>("24h");
  const { data, error, updatedAt, refresh } = useAdminResource(`/api/admin/traffic?range=${range}`, TrafficSummarySchema, 10_000);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic"
        description="Every human visit to alchm.kitchen as it happens: who is on the site now, where they came from, and what they read."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
        controls={<RangePicker value={range} onChange={setRange} />}
      />
      {data ? <TrafficBody data={data} /> : <Pending error={error} onRetry={refresh} />}
    </div>
  );
}
