"use client";

/**
 * /admin/revenue — money, read straight from Stripe (GET /api/admin/revenue),
 * polled every 60s. Test-mode keys are labelled as such on every view.
 *
 * @file src/app/admin/revenue/page.tsx
 */

import React from "react";
import { Basis, ErrorBlock, LoadingBlock, PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { RevenueSchema, type RevenueView } from "@/lib/admin/schemas/revenue";
import { RecentCharges, WebhookHealth } from "./_components/RevenueActivity";
import { CheckoutFunnel, ModeBanner, RevenueKpis, VolumeChart } from "./_components/RevenueSections";

function RevenueBody({ data }: { data: RevenueView }): React.JSX.Element {
  return (
    <>
      <ModeBanner data={data} />
      <RevenueKpis data={data} />
      <VolumeChart data={data} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <CheckoutFunnel data={data} />
          <RecentCharges data={data} />
        </div>
        <WebhookHealth data={data} />
      </div>
      <Basis>
        Read live from the Stripe API with this deployment&apos;s key (cached 60s). MRR normalises each active or past-due
        subscription&apos;s actual prices to a month; purposes come from Checkout session metadata. Settlement of stuck
        restaurant orders lives on the Settlements page.
      </Basis>
    </>
  );
}

function body(data: RevenueView | null, error: string | null, retry: () => void): React.JSX.Element {
  if (data) return <RevenueBody data={data} />;
  if (error) return <ErrorBlock message={error} onRetry={retry} />;
  return <LoadingBlock label="Reading Stripe…" />;
}

export default function RevenuePage(): React.JSX.Element {
  const { data, error, updatedAt, refresh } = useAdminResource("/api/admin/revenue", RevenueSchema, 60_000);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        description="Stripe, live: recurring revenue, 30-day volume, what people try to buy and whether they finish, and whether every payment event reaches us."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />
      {body(data, error, refresh)}
    </div>
  );
}
