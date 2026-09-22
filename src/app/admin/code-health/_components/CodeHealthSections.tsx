"use client";

/**
 * Headline numbers and trends on /admin/code-health.
 *
 * @file src/app/admin/code-health/_components/CodeHealthSections.tsx
 */

import React from "react";
import { BarList, ColumnChart } from "@/components/admin/live/charts";
import { fmtAgo, fmtInt, fmtPct, shortSha } from "@/components/admin/live/format";
import { Absent, Panel, Pill, Stat, StatGrid, type Tone } from "@/components/admin/live/primitives";
import { TrendChart } from "@/components/admin/live/TrendChart";
import type { CodeHealthView } from "@/lib/admin/schemas/codeHealth";

type View = CodeHealthView;

function countTone(n: number | null | undefined): Tone {
  if (n === null || n === undefined) return "neutral";
  return n === 0 ? "ok" : "warn";
}

/** tsc: a measured reading, else what a green Verify leg implies. */
function tscStat(data: View): { value: string | null; sub: string; tone: Tone } {
  const { latest } = data.readings;
  if (latest?.tscErrors != null) {
    return { value: fmtInt(latest.tscErrors), sub: `measured on ${shortSha(latest.commitSha)} ${fmtAgo(latest.measuredAt)}`, tone: countTone(latest.tscErrors) };
  }
  const verify = data.ci.latestJobs.find((j) => j.name.includes("Verify"));
  if (verify?.conclusion === "success") return { value: "0", sub: "implied: Verify (typecheck) green on master", tone: "ok" };
  return { value: null, sub: "no reading yet", tone: "neutral" };
}

interface StatSpec {
  value: string | null;
  sub: string;
  tone: Tone;
}

const maybeInt = (n: number | null | undefined): string | null => (n == null ? null : fmtInt(n));

function eslintStat(data: View): StatSpec {
  const { latest } = data.readings;
  if (!latest) return { value: null, sub: "awaiting first CI reading", tone: "neutral" };
  return {
    value: maybeInt(latest.eslintWarnings),
    sub: `${fmtInt(latest.eslintErrors ?? 0)} errors · ${shortSha(latest.commitSha)}`,
    tone: countTone(latest.eslintWarnings),
  };
}

function castsStat(debt: View["ratchets"]["lintDebt"]): StatSpec {
  if (!debt) return { value: null, sub: "baseline unreadable", tone: "neutral" };
  return {
    value: maybeInt(debt.castsTotal),
    // Worded, not spelled as syntax: the regex cast scanner behind the
    // lint-debt ratchet counts the literal cast text even inside strings.
    sub: `${debt.asAny ?? "?"} to any · ${debt.asUnknownAs ?? "?"} double (via unknown)`,
    tone: countTone(debt.castsTotal),
  };
}

function ciStat(data: View): StatSpec {
  const lastRun = data.ci.runs.find((r) => r.status === "completed");
  const tone: Tone = lastRun?.conclusion === "success" ? "ok" : "bad";
  if (data.ci.passRate === null) {
    return { value: lastRun?.conclusion ?? null, sub: data.ci.state.status === "live" ? "no completed runs" : "GitHub not read", tone };
  }
  return { value: lastRun?.conclusion ?? null, sub: `${fmtPct(data.ci.passRate)} of last ${data.ci.runs.length} runs green`, tone };
}

export function CodeKpis({ data }: { data: View }): React.JSX.Element {
  const debt = data.ratchets.lintDebt;
  return (
    <StatGrid>
      <Stat label="TypeScript errors" {...tscStat(data)} />
      <Stat label="ESLint warnings" {...eslintStat(data)} />
      <Stat label="Tracked lint debt" value={maybeInt(debt?.trackedTotal)} sub="28 audited rules · ratchet" tone="info" />
      <Stat label="Unsafe casts" {...castsStat(debt)} />
      <Stat label="Non-null assertions" value={maybeInt(debt?.nonNullAssertions)} sub={debt?.assertionSites == null ? "" : `${fmtInt(debt.assertionSites)} assertion sites total`} />
      <Stat label="Master CI" {...ciStat(data)} />
    </StatGrid>
  );
}

export function ReadingsNotice({ data }: { data: View }): React.JSX.Element | null {
  const { readings } = data;
  if (readings.status === "live" && readings.latest) return null;
  return (
    <Absent>
      <Pill tone="warn">No tsc/ESLint readings ingested yet</Pill>
      <p className="mt-2">
        {readings.detail ?? "The table exists but CI has not posted a snapshot."} Readings arrive from the <code>code-health</code> CI job on
        every push to master once <code>CODE_HEALTH_INGEST_SECRET</code> is set in both GitHub Actions and Vercel. Until then the ratchet
        numbers below are exact for the deployed commit and CI status stands in for tsc.
      </p>
    </Absent>
  );
}

export function DebtTrend({ data }: { data: View }): React.JSX.Element {
  const { points, state } = data.ratchetHistory;
  const debt = points.filter((p) => p.trackedTotal !== null).map((p) => ({ key: p.sha, label: p.date.slice(0, 10), value: p.trackedTotal ?? 0, detail: p.title }));
  const casts = points.filter((p) => p.castsTotal !== null).map((p) => ({ key: p.sha, label: p.date.slice(0, 10), value: p.castsTotal ?? 0, detail: p.title }));
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Panel title="Tracked lint debt over time" subtitle=".lint-debt-baseline.json at every commit that changed it">
        {state.status === "live" ? <TrendChart points={debt} format={fmtInt} ariaLabel="Tracked lint debt per commit" /> : <Absent>{state.detail}</Absent>}
      </Panel>
      <Panel title="Unsafe casts over time" subtitle="casts to any + double casts via unknown, same commits">
        {state.status === "live" ? <TrendChart points={casts} format={fmtInt} ariaLabel="Unsafe casts per commit" /> : <Absent>{state.detail}</Absent>}
      </Panel>
    </div>
  );
}

export function WarningsHistory({ data }: { data: View }): React.JSX.Element | null {
  const rows = data.readings.history.filter((r) => r.eslintWarnings !== null).slice().reverse();
  if (rows.length === 0) return null;
  const columns = rows.map((r) => ({ key: `${r.commitSha}-${r.source}`, label: shortSha(r.commitSha), value: r.eslintWarnings ?? 0 }));
  return (
    <Panel title="ESLint warnings per measured commit" subtitle="bun run lint config, from CI readings">
      <ColumnChart columns={columns} format={fmtInt} ariaLabel="ESLint warnings per commit" />
    </Panel>
  );
}

export function RuleBreakdown({ data }: { data: View }): React.JSX.Element {
  const { latest } = data.readings;
  const debt = data.ratchets.lintDebt;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Panel title="ESLint warnings by rule" subtitle={latest ? `latest reading · ${shortSha(latest.commitSha)}` : "no reading yet"}>
        <BarList rows={(latest?.eslintByRule ?? []).map((r) => ({ label: r.rule, value: r.warnings + r.errors }))} format={fmtInt} empty="No reading ingested yet." />
      </Panel>
      <Panel title="Files with the most warnings" subtitle="latest reading">
        <BarList rows={(latest?.eslintTopFiles ?? []).map((f) => ({ label: f.file.replace(/^src\//, ""), value: f.warnings + f.errors, hint: f.file }))} format={fmtInt} empty="No reading ingested yet." />
      </Panel>
      <Panel title="Audited rules · current counts" subtitle="ratchet baseline of the deployed commit (tracked + declined)">
        <BarList rows={(debt?.topRules ?? []).map((r) => ({ label: r.rule.replace("@typescript-eslint/", "ts/"), value: r.count }))} format={fmtInt} empty="Baseline unreadable." />
      </Panel>
    </div>
  );
}
