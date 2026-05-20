/**
 * Admin Dashboard API Route
 * GET /api/admin/dashboard - Telemetry payload for the High Alchemist dashboard
 *
 * @requires Authentication - Admin role required
 *
 * Response shape: `AdminDashboardData` from src/app/admin/_dashboard/data.ts.
 * Real values come from the user database; everything else is filled with
 * the deterministic seed used by the original prototype so the visual
 * output stays stable. See `meta.mockedFields` for the list of fields
 * that still need real telemetry wiring.
 */

import { NextResponse } from "next/server";
import type { AdminDashboardData } from "@/app/admin/_dashboard/data";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MOCKED_FIELDS = [
  "pulse", // TODO: wire to real /api/health + uptime monitor
  "services", // TODO: per-service health from infra metrics
  "kpis", // TODO: MRR, NDCG, agent dispatches from real telemetry
  "agents", // TODO: agents.alchm.kitchen mesh status feed
  "incidents", // TODO: incident manager / PagerDuty
  "skyConditions", // TODO: astrologize /api/transit
  "deploys", // TODO: deploy history from Railway/CI
  "featureFlags", // TODO: feature flag store
  "audit", // TODO: admin audit log table
  "moderation", // TODO: moderation queue table
  "commerce", // TODO: Stripe orders + MRR rollup
  "catalog", // partially wired — counts from db, trending mocked
  "cosmicYield", // TODO: token economy ledger
  "geo", // TODO: session geo aggregation
  "errors", // TODO: Sentry / error tracker
  "cost", // TODO: cloud cost rollup
  "db", // TODO: pg / qdrant / redis store stats
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const allUsers = await userDatabase.getAllUsers();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((u) => u.isActive).length,
      newUsersToday: allUsers.filter((u) => new Date(u.createdAt) > oneDayAgo).length,
      completedOnboarding: allUsers.filter(
        (u) => u.profile.birthData && u.profile.natalChart,
      ).length,
    };

    const recentUsers = [...allUsers]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        email: u.email,
        name: u.profile.name ?? null,
        createdAt: new Date(u.createdAt).toISOString(),
        dominantElement: u.profile.natalChart?.dominantElement
          ? String(u.profile.natalChart.dominantElement)
          : null,
        isActive: u.isActive,
      }));

    const data: AdminDashboardData = {
      user: {
        handle: "gregcastro23",
        name: "Greg Castro",
        email: "gregcastro23@gmail.com",
        role: "ARCHITECT",
        badge: "ALCH-0001",
        initial: "G",
        tier: "ROOT",
        joined: "2023-08-14",
        location: "Brooklyn, NY · 40.6782°N",
        onCall: true,
      },
      pulse: {
        // Mocked — replace with real /api/health telemetry once available.
        state: "NOMINAL",
        score: 98.7,
        uptime30d: 99.978,
        activeIncidents: 1,
        p95: 184,
        errRate: 0.04,
        deployFreshness: "23m",
      },
      stats,
      recentUsers,
      meta: {
        generatedAt: now.toISOString(),
        mockedFields: MOCKED_FIELDS,
      },
    };

    // Backwards-compatible response: legacy `/admin` (PR #412) reads
    // `stats` and `recentUsers` from the top level; the new
    // `/admin/dashboard` reads `data`. Both shapes ship together.
    return NextResponse.json({ success: true, stats, recentUsers, data });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}
