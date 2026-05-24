"use client";

import React from "react";
import type {
  CosmicYieldData,
  DatabaseObservabilityData,
  PageTelemetryData,
  CatalogTrendingData,
} from "@/services/dashboardPanelsService";
import { Glyph } from "./atoms";
import { seeded } from "./data";
import { Card } from "./hero";

// ============================================================
// SUBDOMAIN MATRIX
// ============================================================
interface SubdomainMatrixProps {
  pageTelemetry?: PageTelemetryData;
}

export function SubdomainMatrix({ pageTelemetry }: SubdomainMatrixProps) {
  const tele = pageTelemetry || {
    foodDiary: 421,
    customRecipes: 89,
    restaurants: 24,
    commensals: 12,
    mealPlans: 156,
    live: false,
  };

  const routes = [
    {
      route: "/food-tracking",
      purpose: "diary logs & elemental affinity",
      component: "<FoodDiary />",
      table: "food_diary_entries",
      rows: tele.foodDiary,
      latency: "44ms",
      err: 0.01,
      color: "var(--accent)",
    },
    {
      route: "/meal-plan",
      purpose: "calendar & planetary pacing",
      component: "<MealPlanner />",
      table: "user_meal_plans",
      rows: tele.mealPlans,
      latency: "62ms",
      err: 0.0,
      color: "var(--accent-2)",
    },
    {
      route: "/restaurants",
      purpose: "elemental dish search",
      component: "<RestaurantDiscovery />",
      table: "restaurants",
      rows: tele.restaurants,
      latency: "120ms",
      err: 0.02,
      color: "var(--el-fire)",
    },
    {
      route: "/commensal",
      purpose: "group dining compatibility",
      component: "<CommensalPortal />",
      table: "manual_companion_charts",
      rows: tele.commensals,
      latency: "96ms",
      err: 0.03,
      color: "var(--el-water)",
    },
    {
      route: "/recipe-builder",
      purpose: "planetary recipe formulation",
      component: "<RecipeComposer />",
      table: "recipes",
      rows: tele.customRecipes,
      latency: "32ms",
      err: 0.0,
      color: "var(--el-earth)",
    },
  ];

  return (
    <Card title="Canonical Route Telemetry" subtitle="core pages · route resolution, component binding, underlying table, and live row counts">
      <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.3fr 1.1fr 1.3fr 0.7fr 0.5fr 0.5fr",
            padding: "6px 10px",
            borderBottom: "1px solid var(--line-hi)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {["Route", "Purpose", "Component", "Db Table", "Live Rows", "Latency", "Err%"].map((h, i) => (
            <span
              key={h}
              className="t-tag"
              style={{ fontSize: 8.5, textAlign: i >= 4 ? "right" : "left" }}
            >
              {h}
            </span>
          ))}
        </div>
        {routes.map((r, i) => (
          <div
            key={r.route}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.3fr 1.1fr 1.3fr 0.7fr 0.5fr 0.5fr",
              padding: "10px 10px",
              alignItems: "center",
              borderBottom: i === routes.length - 1 ? "none" : "1px solid var(--line)",
              fontFamily: "var(--f-mono)",
              fontSize: 11,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="el-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
              <span style={{ color: "var(--fg)" }}>{r.route}</span>
            </span>
            <span style={{ color: "var(--fg-dim)", fontSize: 10 }}>{r.purpose}</span>
            <span style={{ color: "var(--accent-2)", fontSize: 10.5 }}>{r.component}</span>
            <span style={{ color: "var(--fg-dim)", fontSize: 10 }}>{r.table}</span>
            <span style={{ textAlign: "right", color: "var(--fg)" }}>
              {r.rows.toLocaleString()}{" "}
              <span style={{ fontSize: 8, color: tele.live ? "var(--el-earth)" : "var(--fg-mute)" }}>
                {tele.live ? "live" : "mock"}
              </span>
            </span>
            <span style={{ textAlign: "right", color: "var(--fg-dim)" }}>{r.latency}</span>
            <span style={{ textAlign: "right", color: r.err > 0.02 ? "var(--el-fire)" : "var(--fg-dim)" }}>
              {r.err.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// API HEATMAP
// ============================================================
interface APIHeatmapProps {
  db?: DatabaseObservabilityData;
}

export function APIHeatmap({ db }: APIHeatmapProps) {
  const endpoints = [
    "GET  /api/recommendations",
    "POST /api/recipe/compose",
    "GET  /api/ingredients/:id",
    "GET  /api/transit",
    "GET  /api/natal",
    "POST /api/cart/bundle",
    "GET  /api/recipes/:id",
    "POST /api/feedback",
    "GET  /api/pantry",
    "POST /api/dossier/export",
    "GET  /api/cuisines",
    "POST /api/commensal/dispatch",
  ];
  const rows = endpoints.map((_, ri) => seeded(ri * 13 + 7, 24, 0.05, 1.0));
  const max = 1.0;
  return (
    <Card
      title="API Endpoint Heatmap"
      subtitle="last 24h · request volume × hour"
      right={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>12 endpoints · 1.3M requests</span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 80px", gap: 8 }}>
        <div />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)" }}>
          {Array.from({ length: 24 }, (_, h) => (
            <span
              key={h}
              className="t-mono"
              style={{ fontSize: 8, color: "var(--fg-mute)", textAlign: "center", padding: "0 1px" }}
            >
              {h % 4 === 0 ? String(h).padStart(2, "0") : ""}
            </span>
          ))}
        </div>
        <span className="t-tag" style={{ fontSize: 8.5, textAlign: "right" }}>RPS · P95</span>

        {endpoints.map((e, ri) => {
          const peak = Math.max(...rows[ri]);
          const peakIdx = rows[ri].indexOf(peak);
          const rps = Math.round(peak * 1240);
          const p95 = 60 + (ri * 17) % 240;
          return (
            <React.Fragment key={e}>
              <span
                className="t-mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-dim)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {e}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 1.5 }}>
                {rows[ri].map((v, hi) => (
                  <div
                    key={hi}
                    style={{
                      height: 16,
                      background: `color-mix(in oklch, var(--accent), transparent ${(1 - v / max) * 92}%)`,
                      border: "1px solid var(--line)",
                      borderRadius: 2,
                      position: "relative",
                    }}
                  >
                    {hi === peakIdx && v > 0.6 && (
                      <div
                        style={{
                          position: "absolute",
                          inset: -1,
                          border: "1px solid var(--accent-2)",
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <span className="t-mono" style={{ fontSize: 10, color: "var(--fg)", textAlign: "right" }}>
                {rps} ·{" "}
                <span style={{ color: p95 > 200 ? "var(--el-fire)" : "var(--fg-mute)" }}>{p95}ms</span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>
          PEAK · 21:30 UTC · /api/recommendations · 1,182 rps
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>low</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div
              key={v}
              style={{
                width: 14,
                height: 10,
                background: `color-mix(in oklch, var(--accent), transparent ${(1 - v) * 92}%)`,
                border: "1px solid var(--line)",
                borderRadius: 2,
              }}
            />
          ))}
          <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>high</span>
        </div>
      </div>

      {/* Slow query hotspots telemetry */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTop: "1px dashed var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="t-tag" style={{ color: "var(--accent)" }}>SLOW QUERY TELEMETRY (THRESHOLD: {db?.slowQueryThresholdMs ?? 200}ms)</span>
          <span className="t-mono" style={{ fontSize: 8.5, color: db?.live ? "var(--el-earth)" : "var(--fg-mute)" }}>
            {db?.live ? "● Live stats" : "○ Local cache fallback"}
          </span>
        </div>
        
        {db?.slowQueries && db.slowQueries.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {db.slowQueries.slice(0, 3).map((sq, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--f-mono)",
                  fontSize: 10,
                  background: "rgba(255,255,255,0.015)",
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    color: "var(--fg-dim)",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "75%",
                  }}
                  title={sq.query}
                >
                  {sq.query}
                </span>
                <span style={{ color: sq.durationMs > 500 ? "var(--el-fire)" : "var(--accent-2)" }}>
                  {sq.durationMs}ms
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", fontStyle: "italic", padding: "4px 0" }}>
            No slow queries detected in the past 24 hours. Database performance is nominal.
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// RECIPE QUALITY INSPECTOR
// ============================================================
interface RecipeQualityInspectorProps {
  trending?: CatalogTrendingData;
}

export function RecipeQualityInspector({ trending }: RecipeQualityInspectorProps) {
  const liveRecipes = trending?.recipes || [];
  
  const items = liveRecipes.length > 0
    ? liveRecipes.slice(0, 6).map((r, i) => {
        const rating = r.rating || 5.0;
        const state = rating >= 4.7 ? "GREEN" : rating >= 4.0 ? "REVIEW" : "FLAG";
        
        // Generate beautiful deterministic SEMS elements
        const semsBase = seeded(i * 12 + 5, 4, 0.4, 0.95);
        
        // Generate issue tags if low popularity or low reviews
        const issues: string[] = [];
        if (r.ratingCount === 0) {
          issues.push("No registered user reviews");
        } else if (r.ratingCount < 3) {
          issues.push("Low sample size");
        }
        
        if (r.popularity < 0.2) {
          issues.push("Low recommendation affinity");
        }
        
        return {
          id: `RC-LN${String(i).padStart(3, "0")}`,
          name: r.name,
          author: `Cuisine: ${r.cuisine}`,
          state,
          sems: { 
            s: semsBase[0] ?? 0.6, 
            e: semsBase[1] ?? 0.7, 
            m: semsBase[2] ?? 0.5, 
            sub: semsBase[3] ?? 0.5 
          },
          issues,
          score: r.popularity * 100, // Show popularity as a scale
          eta: r.rating >= 4.7 ? "high harmony" : "rising",
        };
      })
    : [
        {
          id: "RC-c8f1ad",
          name: "Braised cheek · pomegranate · sumac",
          author: "engine-v17",
          state: "GREEN",
          sems: { s: 0.62, e: 0.71, m: 0.48, sub: 0.55 },
          issues: [] as string[],
          score: 94,
          eta: "approved",
        },
        {
          id: "RC-84a210",
          name: "Molecular caviar · tangerine pearl",
          author: "engine-v17",
          state: "REVIEW",
          sems: { s: 0.84, e: 0.42, m: 0.18, sub: 0.22 },
          issues: ["Substance too low · 22%", "Matter outside band", "no allergen tag"],
          score: 62,
          eta: "needs you",
        },
        {
          id: "RC-192bb7",
          name: "Burnt cabbage · brown butter · capers",
          author: "engine-v17",
          state: "GREEN",
          sems: { s: 0.41, e: 0.68, m: 0.62, sub: 0.51 },
          issues: [] as string[],
          score: 91,
          eta: "approved",
        },
        {
          id: "RC-7c3091",
          name: "Kheer · saffron · cardamom",
          author: "@isobel.r → enhanced",
          state: "GREEN",
          sems: { s: 0.58, e: 0.55, m: 0.49, sub: 0.42 },
          issues: [] as string[],
          score: 88,
          eta: "approved",
        },
        {
          id: "RC-412de8",
          name: "Squid ink risotto · sea urchin",
          author: "engine-v17",
          state: "FLAG",
          sems: { s: 0.72, e: 0.81, m: 0.61, sub: 0.74 },
          issues: [
            "High allergen · shellfish + cephalopod",
            "Sourcing limited to coastal regions",
          ],
          score: 74,
          eta: "tag · gate",
        },
        {
          id: "RC-ee920f",
          name: "Pho gà · star anise · rice paper",
          author: "engine-v17",
          state: "GREEN",
          sems: { s: 0.52, e: 0.74, m: 0.51, sub: 0.41 },
          issues: [] as string[],
          score: 92,
          eta: "approved",
        },
      ];

  const stateColor: Record<string, string> = {
    GREEN: "var(--el-earth)",
    REVIEW: "var(--accent)",
    FLAG: "var(--el-fire)",
  };
  return (
    <Card
      title="Recipe Quality Inspector"
      subtitle="auto-generated recipes · SEMS + allergen + sourcing"
      right={
        <button className="btn btn-primary" style={{ padding: "5px 10px", fontSize: 9 }} type="button">
          BATCH REVIEW
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 110px 100px 100px",
              gap: 10,
              alignItems: "center",
              padding: "8px 10px",
              border: "1px solid var(--line)",
              borderRadius: 8,
              background:
                r.state === "FLAG"
                  ? "color-mix(in oklch, var(--el-fire), transparent 94%)"
                  : r.state === "REVIEW"
                    ? "color-mix(in oklch, var(--accent), transparent 92%)"
                    : "transparent",
              borderColor:
                r.state === "FLAG"
                  ? "color-mix(in oklch, var(--el-fire), transparent 60%)"
                  : r.state === "REVIEW"
                    ? "color-mix(in oklch, var(--accent), transparent 60%)"
                    : "var(--line)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>{r.id}</span>
                <span style={{ fontSize: 12, color: "var(--fg)", fontWeight: "500" }}>{r.name}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--accent-2)" }}>{r.author}</span>
                {r.issues.length > 0 && (
                  <span className="t-mono" style={{ fontSize: 9, color: "var(--el-fire)" }}>
                    {r.issues.map((i) => `· ${i}`).join("   ")}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 2 }}>
              {[
                { v: r.sems.s, c: "S", col: "var(--el-fire)" },
                { v: r.sems.e, c: "E", col: "var(--accent)" },
                { v: r.sems.m, c: "M", col: "var(--el-earth)" },
                { v: r.sems.sub, c: "Sb", col: "var(--el-water)" },
              ].map((b) => (
                <div
                  key={b.c}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 26,
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 3,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: `${b.v * 100}%`,
                        background: b.col,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span
                    className="t-mono"
                    style={{ fontSize: 7.5, color: "var(--fg-mute)", marginTop: 1, letterSpacing: "0.1em" }}
                  >
                    {b.c}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${stateColor[r.state]}`,
                  color: stateColor[r.state],
                  fontFamily: "var(--f-mono)",
                  fontSize: 9,
                  letterSpacing: "0.16em",
                }}
              >
                {r.state}
              </span>
              <span className="t-num" style={{ fontSize: 13, color: "var(--fg)", marginTop: 2 }}>
                {r.score.toFixed(0)}%
              </span>
            </div>
            <span
              className="t-mono"
              style={{
                fontSize: 9,
                color:
                  r.eta === "needs edit"
                    ? "var(--el-fire)"
                    : r.eta === "approved"
                      ? "var(--el-earth)"
                      : "var(--accent)",
                textAlign: "right",
                letterSpacing: "0.14em",
              }}
            >
              {r.eta.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// COSMIC YIELD ECONOMY
// ============================================================
export function CosmicYieldEconomy({ data }: { data: CosmicYieldData }) {
  const burndata = seeded(51, 30, 0.4, 0.85);
  const mintdata = seeded(53, 30, 0.45, 0.9);
  const maxSink = Math.max(1, ...data.sinks24h.map((s) => s.amount));
  const sinks = data.sinks24h.map((s) => ({
    k: s.source.replace(/_/g, " "),
    v: Math.round(s.amount),
    p: s.amount / maxSink,
  }));
  return (
    <Card
      title="Cosmic Yield · internal economy"
      subtitle={`${Math.round(data.inCirculation).toLocaleString()} CY in circulation · ${data.live ? "live ledger" : "cached"}`}
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          OPEN LEDGER
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <Stat2
              k="Minted · 30d"
              v={Math.round(data.minted30d).toLocaleString()}
              d="credits across all sources"
            />
            <Stat2
              k="Burned · 30d"
              v={Math.round(data.burned30d).toLocaleString()}
              d="debits across all sinks"
            />
            <Stat2
              k="Circulation"
              v={Math.round(data.inCirculation).toLocaleString()}
              d="ESMS token balances"
            />
            <Stat2
              k="Net flow · 30d"
              v={`${data.netFlow30d >= 0 ? "+" : ""}${Math.round(data.netFlow30d).toLocaleString()}`}
              d={data.netFlow30d >= 0 ? "inflationary tilt" : "deflationary tilt"}
              accent
            />
          </div>
          <div
            style={{
              position: "relative",
              height: 76,
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: 6,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div className="t-tag" style={{ fontSize: 8, position: "absolute", top: 4, left: 8 }}>
              MINT vs BURN · 30D
            </div>
            <svg viewBox="0 0 280 60" width="100%" height="60" style={{ marginTop: 12 }}>
              <path
                d={mintdata
                  .map((v, i) => `${i === 0 ? "M" : "L"}${(i / 29) * 280} ${60 - v * 50}`)
                  .join(" ")}
                fill="none"
                stroke="var(--el-earth)"
                strokeWidth="1.2"
              />
              <path
                d={burndata
                  .map((v, i) => `${i === 0 ? "M" : "L"}${(i / 29) * 280} ${60 - v * 50}`)
                  .join(" ")}
                fill="none"
                stroke="var(--el-fire)"
                strokeWidth="1.2"
              />
            </svg>
            <div style={{ position: "absolute", bottom: 4, right: 8, display: "flex", gap: 8 }}>
              <span className="t-mono" style={{ fontSize: 8.5, color: "var(--el-earth)" }}>━ mint</span>
              <span className="t-mono" style={{ fontSize: 8.5, color: "var(--el-fire)" }}>━ burn</span>
            </div>
          </div>
          <div className="t-tag" style={{ marginTop: 10, marginBottom: 4 }}>SINKS · LAST 24H</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sinks.length === 0 && (
              <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                no debits in last 24h
              </span>
            )}
            {sinks.map((s) => (
              <div
                key={s.k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 50px",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 10.5,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--fg-dim)" }}>{s.k}</span>
                    <span className="t-num" style={{ color: "var(--fg)" }}>{s.v.toLocaleString()}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: 3,
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 999,
                      marginTop: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${s.p * 100}%`,
                        height: "100%",
                        background: "var(--accent)",
                        boxShadow: "0 0 6px var(--accent)",
                      }}
                    />
                  </div>
                </div>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", textAlign: "right" }}>CY</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="t-tag" style={{ marginBottom: 6 }}>TOP HOLDERS · BY BALANCE</div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
            {data.topHolders.length === 0 && (
              <div style={{ padding: "10px 12px", textAlign: "center" }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                  no token holders yet
                </span>
              </div>
            )}
            {data.topHolders.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr 110px",
                  padding: "8px 10px",
                  alignItems: "center",
                  gap: 6,
                  borderBottom:
                    i === data.topHolders.length - 1 ? "none" : "1px solid var(--line)",
                }}
              >
                <span className="t-num" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
                  {i + 1}
                </span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--accent-2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.handle}
                </span>
                <span className="t-num" style={{ fontSize: 11, color: "var(--fg)", textAlign: "right" }}>
                  {Math.round(t.balance).toLocaleString()} CY
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, padding: "8px 10px", border: "1px dashed var(--line)", borderRadius: 8 }}>
            <div className="t-tag" style={{ fontSize: 8 }}>DISTRIBUTION · GINI</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span className="t-num" style={{ fontSize: 16 }}>0.42</span>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--el-earth)" }}>healthy · &lt; 0.5</span>
            </div>
            <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 1.5 }}>
              {[0.1, 0.2, 0.3, 0.45, 0.55, 0.65, 0.72, 0.78, 0.88, 0.95].map((v, i) => (
                <div
                  key={i}
                  style={{
                    height: v * 28,
                    alignSelf: "end",
                    background: "var(--accent)",
                    opacity: 0.8 - i * 0.05,
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="t-mono" style={{ fontSize: 8, color: "var(--fg-mute)" }}>top 10%</span>
              <span className="t-mono" style={{ fontSize: 8, color: "var(--fg-mute)" }}>bottom 10%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Stat2({ k, v, d, accent }: { k: string; v: string; d: string; accent?: boolean }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 6,
        padding: "8px 10px",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="t-tag" style={{ fontSize: 8 }}>{k}</div>
      <div className="t-num" style={{ fontSize: 16, color: accent ? "var(--accent)" : "var(--fg)" }}>{v}</div>
      <div className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)", letterSpacing: "0.1em", marginTop: 1 }}>
        {d}
      </div>
    </div>
  );
}

// ============================================================
// PRACTITIONER GEO
// ============================================================
export function PractitionerGeo() {
  const hotspots = [
    { name: "New York", x: 26, y: 38, n: 4120, intensity: 0.9 },
    { name: "London", x: 48, y: 32, n: 3240, intensity: 0.8 },
    { name: "Tokyo", x: 84, y: 42, n: 2840, intensity: 0.75 },
    { name: "Berlin", x: 51, y: 30, n: 1820, intensity: 0.65 },
    { name: "Mumbai", x: 68, y: 50, n: 1240, intensity: 0.55 },
    { name: "Lagos", x: 49, y: 56, n: 980, intensity: 0.5 },
    { name: "São Paulo", x: 32, y: 70, n: 760, intensity: 0.42 },
    { name: "Seoul", x: 82, y: 40, n: 1340, intensity: 0.6 },
    { name: "LA", x: 14, y: 42, n: 1820, intensity: 0.62 },
    { name: "Sydney", x: 88, y: 76, n: 540, intensity: 0.35 },
    { name: "Cairo", x: 56, y: 46, n: 480, intensity: 0.3 },
    { name: "Mexico City", x: 18, y: 50, n: 720, intensity: 0.4 },
  ];
  const dots = seeded(61, 120, 0.05, 0.95).map((v, i) => {
    const x = seeded(63 + i, 1, 5, 95)[0];
    const y = seeded(67 + i, 1, 15, 85)[0];
    return { x, y, v };
  });
  return (
    <Card
      title="Practitioner Geography"
      subtitle="12,847 active · last 24h · 96 countries"
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          OPEN MAP
        </button>
      }
    >
      <div
        style={{
          position: "relative",
          height: 240,
          border: "1px solid var(--line)",
          borderRadius: 8,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(140,100,255,0.05), transparent 70%), rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 100 60"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <defs>
            <pattern id="mapdots" width="2" height="2" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.25" fill="rgba(255,255,255,0.06)" />
            </pattern>
          </defs>
          <rect width="100" height="60" fill="url(#mapdots)" />
          {[15, 30, 45].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
          ))}
          {[25, 50, 75].map((x) => (
            <line key={x} x1={x} x2={x} y1="0" y2="60" stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
          ))}
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={(d.y / 100) * 60}
              r={d.v * 0.4}
              fill="var(--accent)"
              opacity={d.v * 0.4}
            />
          ))}
          {hotspots.map((h) => (
            <g key={h.name}>
              <circle
                cx={h.x}
                cy={(h.y / 100) * 60}
                r={2 + h.intensity * 3}
                fill="var(--accent)"
                opacity={h.intensity * 0.5}
              />
              <circle
                cx={h.x}
                cy={(h.y / 100) * 60}
                r={0.8 + h.intensity * 1.2}
                fill="var(--accent-2)"
                style={{ filter: "drop-shadow(0 0 2px var(--accent-2))" }}
              />
              <text
                x={h.x + 3}
                y={(h.y / 100) * 60 + 1}
                fill="var(--fg-dim)"
                fontSize="2"
                fontFamily="JetBrains Mono"
              >
                {h.name}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: "absolute", top: 8, left: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>
            WORLD · DOT DENSITY
          </span>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>● 12 hot · NA/EU/EA</span>
        </div>
        <div style={{ position: "absolute", top: 8, right: 10, textAlign: "right" }}>
          <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>
            BY REGION
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end", marginTop: 2 }}>
            {[
              { r: "NA", n: "5,420", p: 42 },
              { r: "EU", n: "3,240", p: 25 },
              { r: "APAC", n: "2,840", p: 22 },
              { r: "LATAM", n: "820", p: 6 },
              { r: "MEA", n: "520", p: 4 },
            ].map((r) => (
              <span key={r.r} className="t-mono" style={{ fontSize: 9, color: "var(--fg-dim)" }}>
                <span style={{ color: "var(--fg-mute)" }}>{r.r}</span> {r.n} · {r.p}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// ERROR GROUPS
// ============================================================
export function ErrorGroups() {
  const errs = [
    {
      id: "E-7741",
      title: "AmazonFreshAdapterError: tax mismatch on multi-state cart",
      count: 184,
      trend: "▲ 4.2x",
      last: "2m",
      fp: "amz-fresh",
      recent: true,
    },
    {
      id: "E-7740",
      title: "TimeoutError: /api/transit > 8s",
      count: 64,
      trend: "▼ -22%",
      last: "12m",
      fp: "transit-svc",
      recent: false,
    },
    {
      id: "E-7738",
      title: "GalileoQueueError: model overload retry",
      count: 41,
      trend: "▲ +18%",
      last: "4m",
      fp: "galileo",
      recent: true,
    },
    {
      id: "E-7735",
      title: "PantryPushFailed: APNS rejected device token",
      count: 22,
      trend: "—",
      last: "31m",
      fp: "pantry-push",
      recent: false,
    },
    {
      id: "E-7728",
      title: "AuthFlowError: OAuthCallback nonce mismatch",
      count: 14,
      trend: "▼ -8",
      last: "1h",
      fp: "auth",
      recent: false,
    },
  ];
  return (
    <Card
      title="Error Groups"
      subtitle="top 5 · last 24h · grouped by stack fingerprint"
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          SENTRY
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {errs.map((e, i) => (
          <div
            key={e.id}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 60px 60px 36px",
              gap: 8,
              alignItems: "center",
              padding: "10px 0",
              borderBottom: i === errs.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 32,
                borderRadius: 999,
                background: e.recent ? "var(--el-fire)" : "var(--fg-faint)",
                boxShadow: e.recent ? "0 0 6px var(--el-fire)" : "none",
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>{e.id}</span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--fg)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.title}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--accent-2)" }}>fp · {e.fp}</span>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>last · {e.last}</span>
              </div>
            </div>
            <span className="t-num" style={{ textAlign: "right", color: "var(--fg)" }}>{e.count.toLocaleString()}</span>
            <span
              className="t-mono"
              style={{
                textAlign: "right",
                fontSize: 10,
                color: e.trend.startsWith("▲") ? "var(--el-fire)" : "var(--el-earth)",
              }}
            >
              {e.trend}
            </span>
            <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 8 }} type="button">
              OPEN
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// COST BURNDOWN
// ============================================================
export function CostBurndown() {
  const buckets = [
    { k: "Compute · API + engine", v: 1840, b: 3000, color: "var(--accent)" },
    { k: "Galileo · GPU image gen", v: 1240, b: 1500, color: "var(--accent-2)", warn: true },
    { k: "LLM · agent reasoning", v: 982, b: 1800, color: "var(--el-water)" },
    { k: "Postgres + Vector store", v: 612, b: 800, color: "var(--el-earth)" },
    { k: "Astronomical ephemeris", v: 184, b: 240, color: "var(--el-air)" },
    { k: "CDN · edge", v: 420, b: 600, color: "var(--el-fire)" },
    { k: "Amazon Fresh adapter", v: 84, b: 200, color: "#D6CFE8" },
  ];
  const total = buckets.reduce((s, b) => s + b.v, 0);
  const budget = buckets.reduce((s, b) => s + b.b, 0);
  return (
    <Card
      title="Cost Burndown · MTD"
      subtitle={`$${total.toLocaleString()} of $${budget.toLocaleString()} budgeted · ${Math.round((total / budget) * 100)}% utilized`}
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          EXPORT
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {buckets.map((b) => {
          const pct = b.v / b.b;
          const projected = Math.round(b.v * 2.1);
          return (
            <div key={b.k}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "16px 1fr 60px 80px 80px",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <span className="el-dot" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                <span style={{ fontSize: 11, color: "var(--fg-dim)" }}>{b.k}</span>
                <span className="t-num" style={{ fontSize: 11, color: "var(--fg)", textAlign: "right" }}>
                  ${b.v.toLocaleString()}
                </span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 9,
                    color: b.warn ? "var(--el-fire)" : "var(--fg-mute)",
                    textAlign: "right",
                  }}
                >
                  of ${b.b.toLocaleString()}
                </span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 9,
                    color: projected > b.b ? "var(--el-fire)" : "var(--fg-mute)",
                    textAlign: "right",
                  }}
                >
                  proj ${projected.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 6,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(pct, 1) * 100}%`,
                    height: "100%",
                    background: b.color,
                    boxShadow: `0 0 8px ${b.color}`,
                    opacity: 0.85,
                  }}
                />
                {pct > 0.9 && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: -1,
                      bottom: -1,
                      width: 2,
                      background: "var(--el-fire)",
                      boxShadow: "0 0 6px var(--el-fire)",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 10,
          padding: "8px 10px",
          border: "1px dashed var(--el-fire)",
          borderRadius: 8,
          background: "color-mix(in oklch, var(--el-fire), transparent 94%)",
        }}
      >
        <div className="t-tag" style={{ color: "var(--el-fire)", fontSize: 8.5 }}>OVERAGE FORECAST</div>
        <div style={{ fontSize: 11, color: "var(--fg-dim)", marginTop: 2 }}>
          Galileo on track for <span style={{ color: "var(--el-fire)" }}>$2,604</span> ·{" "}
          <span style={{ color: "var(--el-fire)" }}>+74%</span> over budget. Throttle option: cap free-tier image renders
          at 3/recipe.
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// DATABASE / STORAGE / VECTORS
// ============================================================
function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i] ?? "B"}`;
}

export function DatabaseStorage({ data }: { data: DatabaseObservabilityData }) {
  const { pool, slowQueries, slowQueryThresholdMs, tables, live } = data;
  const poolLoad = pool.max > 0 ? pool.total / pool.max : 0;
  const maxTableSize = Math.max(1, ...tables.map((t) => t.sizeBytes));
  return (
    <Card
      title="Database · Postgres observability"
      subtitle={`${formatBytes(data.dbSizeBytes)} · ${data.activeConnections} active connections`}
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--el-earth)" : "var(--fg-mute)" }}
        >
          {live ? "● LIVE" : "○ CACHED"}
        </span>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Stat2
          k="Pool · in use"
          v={`${pool.total} / ${pool.max}`}
          d={`${Math.round(poolLoad * 100)}% of max`}
          accent={poolLoad > 0.8}
        />
        <Stat2 k="Idle" v={String(pool.idle)} d="ready connections" />
        <Stat2
          k="Waiting"
          v={String(pool.waiting)}
          d="queued acquires"
          accent={pool.waiting > 0}
        />
        <Stat2 k="DB size" v={formatBytes(data.dbSizeBytes)} d="current database" />
      </div>

      <div className="t-tag" style={{ marginBottom: 4 }}>
        SLOW QUERIES · LAST 24H &gt; {slowQueryThresholdMs}MS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
        {slowQueries.length === 0 ? (
          <span className="t-mono" style={{ fontSize: 9, color: "var(--el-earth)" }}>
            none — all logged queries under {slowQueryThresholdMs}ms
          </span>
        ) : (
          slowQueries.map((q, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 64px",
                gap: 8,
                alignItems: "center",
                fontSize: 10,
              }}
            >
              <span
                className="t-mono"
                style={{
                  color: "var(--fg-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {q.query}
              </span>
              <span className="t-num" style={{ textAlign: "right", color: "var(--el-fire)" }}>
                {q.durationMs}ms
              </span>
            </div>
          ))
        )}
      </div>

      <div className="t-tag" style={{ marginBottom: 4 }}>LARGEST TABLES</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {tables.length === 0 && (
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
            table stats unavailable
          </span>
        )}
        {tables.map((t, i) => (
          <div
            key={t.name}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1.4fr 90px 80px 0.8fr",
              gap: 8,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: i === tables.length - 1 ? "none" : "1px solid var(--line)",
              fontSize: 11,
            }}
          >
            <Glyph name="diamond" size={12} style={{ color: "var(--el-earth)" }} />
            <span style={{ color: "var(--fg)" }}>{t.name}</span>
            <span
              className="t-mono"
              style={{ fontSize: 10, color: "var(--fg-dim)", textAlign: "right" }}
            >
              {t.rows.toLocaleString()} rows
            </span>
            <span
              className="t-mono"
              style={{ fontSize: 10, color: "var(--fg-dim)", textAlign: "right" }}
            >
              {formatBytes(t.sizeBytes)}
            </span>
            <div
              style={{
                position: "relative",
                height: 4,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(t.sizeBytes / maxTableSize) * 100}%`,
                  height: "100%",
                  background: "var(--el-earth)",
                  boxShadow: "0 0 6px var(--el-earth)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
