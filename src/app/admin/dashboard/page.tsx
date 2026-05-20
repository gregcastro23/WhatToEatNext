"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
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
export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData>(FALLBACK_DATA);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (!res.ok) {
        setError(`Failed to load dashboard (HTTP ${res.status})`);
        return;
      }
      const json = (await res.json()) as { success: boolean; data?: AdminDashboardData };
      if (json.success && json.data) {
        setData(json.data);
        setError(null);
      } else {
        setError("Dashboard payload missing");
      }
    } catch (_err) {
      setError("Failed to connect to admin API");
    }
  }, []);

  useEffect(() => {
    void fetchData();
    // Refresh every 30s for the rest of the page lifetime.
    const id = setInterval(() => {
      void fetchData();
    }, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  return (
    <>
      {error && (
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
            onClick={() => {
              void fetchData();
            }}
            style={{ background: "transparent", border: "none", color: "#FF5252", marginLeft: 8, cursor: "pointer" }}
          >
            retry
          </button>{" "}
          ·{" "}
          <Link href="/" style={{ color: "#FF5252" }}>
            home
          </Link>
        </div>
      )}
      <Dashboard data={data} />
    </>
  );
}
