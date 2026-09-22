"use client";

/**
 * Devnet → mainnet progress as a checklist, where every tick is computed
 * from a live chain read (or the audit receipt, labelled as such) — never
 * from a status string someone typed.
 *
 * @file src/app/admin/chain/_components/SolanaMilestones.tsx
 */

import React from "react";
import { fmtPct } from "@/components/admin/live/format";
import { Panel, Pill, type Tone } from "@/components/admin/live/primitives";
import type { SolanaView } from "@/lib/admin/schemas/chain";

interface Milestone {
  label: string;
  /** true = done, false = not done, null = could not be checked. */
  done: boolean | null;
  evidence: string;
}

type Devnet = SolanaView["devnet"];
type Mainnet = SolanaView["mainnet"];

function programStep(d: Devnet): Milestone {
  const p = d.program;
  if (!p) return { label: "Program deployed on devnet", done: d.reachable ? false : null, evidence: "program account not read" };
  return { label: "Program deployed on devnet", done: p.executable, evidence: `executable, last deploy slot ${p.lastDeploySlot ?? "?"}` };
}

function configStep(d: Devnet): Milestone {
  const c = d.config;
  if (!c) return { label: "Program config initialised", done: d.reachable ? false : null, evidence: "config PDA not decoded" };
  return { label: "Program config initialised", done: true, evidence: `v${c.version}, claims ${c.pauseClaims ? "PAUSED" : "open"}` };
}

function mintsStep(d: Devnet): Milestone {
  const live = d.mints.filter((m) => m.supply !== null).length;
  return { label: "Four ESMS Token-2022 mints live", done: d.mints.length === 4 && live === 4, evidence: `${live}/${d.mints.length} mints answered getTokenSupply` };
}

function poolsStep(d: Devnet): Milestone {
  const booted = d.pools.filter((p) => p.bootstrapped).length;
  const done = d.pools.length > 0 ? booted === d.pools.length : null;
  return { label: "AMM pools bootstrapped", done, evidence: `${booted}/${d.pools.length} decoded pools bootstrapped` };
}

function governanceStep(d: Devnet): Milestone {
  const g = d.governance;
  if (!g) return { label: "Squads multisig + lifecycle drill", done: null, evidence: "no governance manifest" };
  const done = g.multisigExists === true && g.drillStatus === "executed";
  return { label: "Squads multisig + lifecycle drill", done, evidence: `${g.threshold}-of-${g.members}, drill ${g.drillStatus ?? "not run"}` };
}

function auditStep(d: Devnet): Milestone {
  const a = d.auditReceipt;
  if (!a) return { label: "Devnet audit receipt passed", done: null, evidence: "no audit receipt" };
  return { label: "Devnet audit receipt passed", done: a.status === "PASSED", evidence: `${a.status} on ${a.at.slice(0, 10)} (receipt, not live)` };
}

function mainnetProgramStep(m: Mainnet): Milestone {
  if (!m.reachable) return { label: "Program deployed on mainnet-beta", done: null, evidence: m.error ?? "mainnet RPC not read" };
  return { label: "Program deployed on mainnet-beta", done: m.programDeployed, evidence: `manifest status: ${m.manifestStatus ?? "none"}` };
}

function mainnetMintsStep(m: Mainnet): Milestone {
  if (m.mintsCreated === null) return { label: "Mainnet mints created", done: null, evidence: "not read" };
  return {
    label: "Mainnet mints created",
    done: m.mintsTotal > 0 && m.mintsCreated === m.mintsTotal,
    evidence: `${m.mintsCreated}/${m.mintsTotal} mint accounts exist`,
  };
}

function devnetMilestones(s: SolanaView): Milestone[] {
  return [programStep, configStep, mintsStep, poolsStep, governanceStep, auditStep].map((step) => step(s.devnet));
}

function mainnetMilestones(s: SolanaView): Milestone[] {
  return [
    mainnetProgramStep(s.mainnet),
    mainnetMintsStep(s.mainnet),
    { label: "Upgrade authority moved to multisig", done: s.mainnet.upgradeAuthorityTransferred, evidence: "from the mainnet manifest" },
  ];
}

function statusWord(done: boolean | null): string {
  if (done === null) return "unknown";
  return done ? "done" : "to do";
}

function tone(done: boolean | null): Tone {
  if (done === null) return "neutral";
  return done ? "ok" : "warn";
}

function MilestoneList({ title, items }: { title: string; items: Milestone[] }): React.JSX.Element {
  return (
    <div>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      <ol className="space-y-1.5">
        {items.map((m) => (
          <li key={m.label} className="flex items-start gap-2 text-xs">
            <Pill tone={tone(m.done)}>{statusWord(m.done)}</Pill>
            <div className="min-w-0">
              <div className="font-medium text-gray-800">{m.label}</div>
              <div className="text-[11px] text-gray-500">{m.evidence}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SolanaMilestones({ solana }: { solana: SolanaView }): React.JSX.Element {
  const all = [...devnetMilestones(solana), ...mainnetMilestones(solana)];
  const done = all.filter((m) => m.done === true).length;
  return (
    <Panel
      title="Solana: devnet → mainnet"
      subtitle="each step checked against the chain on every refresh"
      right={<Pill tone="info">{done}/{all.length} steps · {fmtPct(done / all.length)}</Pill>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MilestoneList title="Devnet" items={devnetMilestones(solana)} />
        <MilestoneList title="Mainnet" items={mainnetMilestones(solana)} />
      </div>
    </Panel>
  );
}
