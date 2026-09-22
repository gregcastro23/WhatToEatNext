"use client";

/**
 * /admin/chain — on-chain progress. Solana devnet → mainnet (program, mints,
 * pools, governance, workers, repo) and the Base Sepolia ESMS rail.
 * GET /api/admin/chain, polled every 60s (public RPCs rate-limit).
 *
 * @file src/app/admin/chain/page.tsx
 */

import React from "react";
import { Basis, ErrorBlock, LoadingBlock, PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { ChainSchema, type ChainView } from "@/lib/admin/schemas/chain";
import { BaseKpis, OperatorWallets, RecentClaims } from "./_components/BaseSections";
import { SolanaMilestones } from "./_components/SolanaMilestones";
import { AsolHealth, Governance, SolanaRepo } from "./_components/SolanaOps";
import { MintsTable, PoolsTable, ProgramActivity, SolanaKpis } from "./_components/SolanaSections";

function SolanaBlock({ data }: { data: ChainView }): React.JSX.Element {
  const { solana } = data;
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Solana</h2>
      <SolanaMilestones solana={solana} />
      <SolanaKpis solana={solana} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MintsTable devnet={solana.devnet} />
        <PoolsTable devnet={solana.devnet} />
        <Governance devnet={solana.devnet} />
        <ProgramActivity devnet={solana.devnet} />
        <AsolHealth health={solana.asolHealth} />
        <SolanaRepo repo={solana.repo} />
      </div>
      <Basis>
        Addresses come from <code>{solana.manifestSource}</code>; every value above is then read from the chain ({solana.devnet.rpc}).
        The audit-receipt step is the one exception and is labelled as a receipt.
      </Basis>
    </section>
  );
}

function BaseBlock({ data }: { data: ChainView }): React.JSX.Element {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Base · ESMS rail</h2>
      <BaseKpis base={data.base} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <OperatorWallets base={data.base} />
        <RecentClaims base={data.base} />
      </div>
    </section>
  );
}

function body(data: ChainView | null, error: string | null, retry: () => void): React.JSX.Element {
  if (data) {
    return (
      <>
        <SolanaBlock data={data} />
        <BaseBlock data={data} />
      </>
    );
  }
  if (error) return <ErrorBlock message={error} onRetry={retry} />;
  return <LoadingBlock label="Reading devnet, mainnet, and Base…" />;
}

export default function ChainPage(): React.JSX.Element {
  const { data, error, updatedAt, refresh } = useAdminResource("/api/admin/chain", ChainSchema, 60_000);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Chain"
        description="Solana devnet → mainnet progress and the Base ESMS rail, measured on-chain: program state, token supply, AMM reserves, operator gas, and claims."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />
      {body(data, error, refresh)}
    </div>
  );
}
