"use client";

import React, { useCallback, useEffect, useState } from "react";
import LaunchReadinessPanel from "@/components/admin/LaunchReadinessPanel";
import { readJson } from "@/lib/api/json";
import {
  EmailStatusResponseSchema,
  EmailTestPanel,
  type EmailServiceStatus,
} from "./_components/EmailTestPanel";
import {
  EnvironmentalSeedPanel,
  EnvironmentSummaryResponseSchema,
  type EnvironmentSummary,
} from "./_components/EnvironmentalSeedPanel";
import {
  SlowQueryThresholdResponseSchema,
  SpacetimeDiagnosticsPanel,
  SpacetimeDiagnosticsSchema,
  type SlowQueryThresholdInfo,
  type SpacetimeDiagnostics,
} from "./_components/SpacetimeDiagnosticsPanel";

async function fetchSpacetime(): Promise<{ data: SpacetimeDiagnostics | null; live: boolean }> {
  try {
    const res = await fetch("/api/admin/diagnostics/spacetime", { cache: "no-store" });
    if (!res.ok) return { data: null, live: false };
    const parsed = await readJson(res, { parse: (raw) => SpacetimeDiagnosticsSchema.safeParse(raw) });
    return parsed.success ? { data: parsed.data, live: true } : { data: null, live: false };
  } catch {
    return { data: null, live: false };
  }
}

async function fetchThreshold(): Promise<SlowQueryThresholdInfo | null> {
  try {
    const res = await fetch("/api/admin/observability/slow-query-threshold", { cache: "no-store" });
    if (!res.ok) return null;
    const parsed = await readJson(res, { parse: (raw) => SlowQueryThresholdResponseSchema.parse(raw) });
    return parsed.success && typeof parsed.thresholdMs === "number" && parsed.bounds
      ? { thresholdMs: parsed.thresholdMs, bounds: parsed.bounds }
      : null;
  } catch {
    return null;
  }
}

async function fetchEmailStatus(): Promise<{ status: EmailServiceStatus | null; live: boolean }> {
  try {
    const res = await fetch("/api/admin/send-test-email", { cache: "no-store" });
    if (!res.ok) return { status: null, live: false };
    const parsed = await readJson(res, { parse: (raw) => EmailStatusResponseSchema.parse(raw) });
    return typeof parsed.configured === "boolean"
      ? { status: { configured: parsed.configured, message: parsed.message ?? "" }, live: true }
      : { status: null, live: false };
  } catch {
    return { status: null, live: false };
  }
}

async function fetchEnvSummary(): Promise<{ summary: EnvironmentSummary | null; ok: boolean }> {
  try {
    const res = await fetch("/api/admin/environment/seed", { cache: "no-store" });
    if (!res.ok) return { summary: null, ok: false };
    const parsed = await readJson(res, { parse: (raw) => EnvironmentSummaryResponseSchema.parse(raw) });
    if (!parsed.success) return { summary: null, ok: false };
    return {
      summary: {
        geohashCount: Number(parsed.geohashCount ?? 0),
        archiveSeededCount: Number(parsed.archiveSeededCount ?? 0),
        matureCount: Number(parsed.matureCount ?? 0),
        minSampleDays: Number(parsed.minSampleDays ?? 0),
        maxSampleDays: Number(parsed.maxSampleDays ?? 0),
        observationCount: Number(parsed.observationCount ?? 0),
        lastComputedAt: parsed.lastComputedAt ?? null,
        live: Boolean(parsed.live),
      },
      ok: true,
    };
  } catch {
    return { summary: null, ok: false };
  }
}

function SettingsHeader({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: () => void }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings &amp; Runtime Controls</h1>
        <p className="text-gray-600 mt-1">
          Live launch-readiness verification, runtime observability tuning, SpacetimeDB sync diagnostics, and ERA5 environmental baseline seeding.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-purple-700 hover:border-purple-300 shadow-sm disabled:opacity-50"
      >
        {refreshing ? "Refreshing…" : "Refresh Diagnostics"}
      </button>
    </div>
  );
}

interface SettingsDiagnosticsState {
  spacetime: SpacetimeDiagnostics | null;
  spacetimeLive: boolean;
  thresholdInfo: SlowQueryThresholdInfo | null;
  setThresholdInfo: React.Dispatch<React.SetStateAction<SlowQueryThresholdInfo | null>>;
  emailStatus: EmailServiceStatus | null;
  emailLive: boolean;
  envSummary: EnvironmentSummary | null;
  envEndpointOk: boolean;
  refreshing: boolean;
  loadDiagnostics: () => Promise<void>;
}

function useSettingsDiagnostics(): SettingsDiagnosticsState {
  const [spacetime, setSpacetime] = useState<SpacetimeDiagnostics | null>(null);
  const [spacetimeLive, setSpacetimeLive] = useState(false);
  const [thresholdInfo, setThresholdInfo] = useState<SlowQueryThresholdInfo | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailServiceStatus | null>(null);
  const [emailLive, setEmailLive] = useState(false);
  const [envSummary, setEnvSummary] = useState<EnvironmentSummary | null>(null);
  const [envEndpointOk, setEnvEndpointOk] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDiagnostics = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    const [st, sq, em, env] = await Promise.all([fetchSpacetime(), fetchThreshold(), fetchEmailStatus(), fetchEnvSummary()]);
    setSpacetime(st.data);
    setSpacetimeLive(st.live);
    if (sq) setThresholdInfo(sq);
    setEmailStatus(em.status);
    setEmailLive(em.live);
    setEnvSummary(env.summary);
    setEnvEndpointOk(env.ok);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDiagnostics().catch(() => {});
  }, [loadDiagnostics]);

  return { spacetime, spacetimeLive, thresholdInfo, setThresholdInfo, emailStatus, emailLive, envSummary, envEndpointOk, refreshing, loadDiagnostics };
}

export default function AdminSettingsPage(): React.JSX.Element {
  const s = useSettingsDiagnostics();

  return (
    <div className="space-y-8">
      <SettingsHeader refreshing={s.refreshing} onRefresh={() => { s.loadDiagnostics().catch(() => {}); }} />
      <LaunchReadinessPanel variant="full" />
      <SpacetimeDiagnosticsPanel
        spacetime={s.spacetime}
        spacetimeLive={s.spacetimeLive}
        thresholdInfo={s.thresholdInfo}
        onThresholdUpdated={s.setThresholdInfo}
      />
      <EmailTestPanel emailStatus={s.emailStatus} emailLive={s.emailLive} />
      <EnvironmentalSeedPanel
        envSummary={s.envSummary}
        envEndpointOk={s.envEndpointOk}
        onSeedCompleted={() => { s.loadDiagnostics().catch(() => {}); }}
      />
    </div>
  );
}
