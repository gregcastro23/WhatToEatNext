"use client";

import Link from "next/link";
import React, { useCallback, useState } from "react";
import { z } from "zod";
import { readJson } from "@/lib/api/json";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { Dashboard } from "../_dashboard/Dashboard";
import { FALLBACK_DATA, type AdminDashboardData } from "../_dashboard/data";

/**
 * /admin/dashboard — High Alchemist dashboard.
 *
 * The alchm.kitchen "Master Line" control surface. Companion to
 * /admin (which keeps the AdvancedMetricsPanel from PR #412).
 * Fetches the telemetry payload from /api/admin/dashboard and
 * renders the full dashboard on first paint with the deterministic
 * fallback while the API is still warming.
 */
function isValidAdminDashboardData(val: unknown): val is AdminDashboardData {
  if (!val || typeof val !== "object") return false;
  if (!("user" in val) || !val.user || typeof val.user !== "object") return false;
  if (!("pulse" in val) || !val.pulse || typeof val.pulse !== "object") return false;
  if (!("stats" in val) || !val.stats || typeof val.stats !== "object") return false;
  const { pulse, stats } = val;
  return (
    "totalUsers" in stats &&
    typeof stats.totalUsers === "number" &&
    "state" in pulse &&
    typeof pulse.state === "string"
  );
}

const AdminDashboardDataSchema = z.custom<AdminDashboardData>(
  isValidAdminDashboardData,
  "Expected valid AdminDashboardData object with user, pulse, and stats",
);

const AdminDashboardPayloadSchema = z
  .object({
    success: z.boolean(),
    data: AdminDashboardDataSchema.optional(),
  })
  .passthrough();

async function fetchDashboardData(): Promise<{ ok: boolean; data?: AdminDashboardData; error?: string }> {
  try {
    const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
    if (!res.ok) {
      return { ok: false, error: `Failed to load dashboard (HTTP ${res.status})` };
    }
    const json = await readJson(res, {
      parse: (raw) => AdminDashboardPayloadSchema.parse(raw),
    });
    if (json.success && json.data) {
      return { ok: true, data: json.data };
    }
    return { ok: false, error: "Dashboard payload missing" };
  } catch (_err) {
    return { ok: false, error: "Failed to connect to admin API" };
  }
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }): React.JSX.Element {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        padding: "6px 12px",
        borderRadius: 6,
        background: "rgba(255, 82, 82, 0.15)",
        color: "#FF5252",
        border: "1px solid #FF5252",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.1em",
      }}
    >
      {error}{" "}
      <button
        type="button"
        onClick={onRetry}
        style={{ background: "transparent", border: "none", color: "#FF5252", marginLeft: 8, cursor: "pointer" }}
      >
        retry
      </button>{" "}
      ·{" "}
      <Link href="/" style={{ color: "#FF5252" }}>
        home
      </Link>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData>(FALLBACK_DATA);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<{ ok: boolean }> => {
    const res = await fetchDashboardData();
    if (res.ok && res.data) {
      setData(res.data);
      setError(null);
      return { ok: true };
    }
    setError(res.error ?? "Failed to load dashboard");
    return { ok: false };
  }, []);

  // Visibility-aware polling with error backoff — pauses on hidden tabs,
  // refreshes immediately on refocus, and slows down while the API is failing.
  useHardenedPolling(fetchData, { baseIntervalMs: 30_000 });

  return (
    <>
      {error && (
        <ErrorBanner
          error={error}
          onRetry={() => {
            void fetchData();
          }}
        />
      )}
      <Dashboard data={data} />
    </>
  );
}
