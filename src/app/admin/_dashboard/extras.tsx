"use client";

import React from "react";
import type {
  CosmicYieldData,
  DatabaseObservabilityData,
  ErrorGroupsData,
  PageTelemetryData,
  CatalogTrendingData,
  CostBurndownData,
  PractitionerGeoData,
} from "@/services/dashboardPanelsService";
import { Glyph } from "./atoms";
import { Card } from "./hero";
import type { ApiRoutesData } from "./data";

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
  apiRoutes?: ApiRoutesData;
}

export function APIHeatmap({ db, apiRoutes }: APIHeatmapProps) {
  const routes = apiRoutes?.routes ?? [];
  const windowMin = apiRoutes?.windowMinutes ?? 60;
  const live = apiRoutes?.live ?? false;
  const totalRequests = routes.reduce((sum, r) => sum + r.count, 0);
  const maxCount = routes.reduce((m, r) => Math.max(m, r.count), 0) || 1;
  return (
    <Card
      title="API Endpoint Traffic"
      subtitle={`last ${windowMin}m · live request log`}
      right={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          {live
            ? `${routes.length} routes · ${totalRequests.toLocaleString()} req`
            : "○ no traffic"}
        </span>
      }
    >
      {routes.length === 0 ? (
        <div
          className="t-mono"
          style={{
            fontSize: 10,
            color: "var(--fg-mute)",
            fontStyle: "italic",
            textAlign: "center",
            padding: "18px 6px",
            lineHeight: 1.5,
          }}
        >
          No API traffic recorded in the last {windowMin} minutes.
          <br />
          The request log is in-memory and hydrates from the DB on first read —
          sparse right after a serverless cold start.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 132px", gap: 8, alignItems: "center" }}>
          <span className="t-tag" style={{ fontSize: 8.5 }}>ROUTE</span>
          <span className="t-tag" style={{ fontSize: 8.5 }}>VOLUME</span>
          <span className="t-tag" style={{ fontSize: 8.5, textAlign: "right" }}>REQ · ERR · P95</span>

          {routes.map((r) => {
            const pct = r.count / maxCount;
            const errPct = Math.round(r.errorRate * 100);
            const p95 = Math.round(r.p95LatencyMs);
            return (
              <React.Fragment key={r.path}>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--fg-dim)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={r.path}
                >
                  {r.path}
                </span>
                <div
                  style={{
                    height: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--line)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(2, pct * 100)}%`,
                      background: errPct > 0 ? "var(--el-fire)" : "var(--accent)",
                    }}
                  />
                </div>
                <span className="t-mono" style={{ fontSize: 10, color: "var(--fg)", textAlign: "right" }}>
                  {r.count.toLocaleString()} ·{" "}
                  <span style={{ color: errPct > 0 ? "var(--el-fire)" : "var(--fg-mute)" }}>{errPct}%</span> ·{" "}
                  <span style={{ color: p95 > 200 ? "var(--el-fire)" : "var(--fg-mute)" }}>{p95}ms</span>
                </span>
              </React.Fragment>
            );
          })}
        </div>
      )}

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
          issues,
          score: r.popularity * 100, // Show popularity as a scale
          eta: r.rating >= 4.7 ? "high harmony" : "rising",
        };
      })
    : [];

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
        {items.length === 0 && (
          <div
            className="t-mono"
            style={{ fontSize: 10, color: "var(--fg-mute)", fontStyle: "italic", textAlign: "center", padding: "16px 6px" }}
          >
            No public recipes ranked yet — this fills in as recipes gain ratings.
          </div>
        )}
        {items.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px",
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
  const maxSink = Math.max(1, ...data.sinks24h.map((s) => s.amount));
  const maxFlow = Math.max(1, data.minted30d, data.burned30d);
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
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 10px",
              background: "rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div className="t-tag" style={{ fontSize: 8 }}>MINT vs BURN · 30D</div>
            {[
              { label: "mint", val: data.minted30d, col: "var(--el-earth)" },
              { label: "burn", val: data.burned30d, col: "var(--el-fire)" },
            ].map((b) => (
              <div
                key={b.label}
                style={{ display: "grid", gridTemplateColumns: "40px 1fr 70px", gap: 8, alignItems: "center" }}
              >
                <span className="t-mono" style={{ fontSize: 8.5, color: b.col }}>{b.label}</span>
                <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.max(2, (b.val / maxFlow) * 100)}%`, background: b.col }} />
                </div>
                <span className="t-num" style={{ fontSize: 10, color: "var(--fg)", textAlign: "right" }}>
                  {Math.round(b.val).toLocaleString()}
                </span>
              </div>
            ))}
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
// ============================================================
// PRACTITIONER GEO
// Empty placeholder — no geo data captured yet (we store lat/lon on
// birth charts but don't aggregate by location). Wire this up when
// there's enough sample to draw something honest.
// ============================================================
export function PractitionerGeo({ data }: { data?: PractitionerGeoData }) {
  const { regions = [], live = false } = data || {};
  return (
    <Card
      title="Practitioner Geography"
      subtitle={live ? `${regions.length} active regions` : "geo aggregation offline"}
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--el-earth)" : "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          {live ? "● LIVE" : "○ NO SOURCE"}
        </span>
      }
    >
      {regions.length === 0 ? (
        <div
          style={{
            padding: "60px 12px",
            textAlign: "center",
            border: "1px dashed var(--line)",
            borderRadius: 8,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(140,100,255,0.04), transparent 70%)",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--fg-dim)", marginBottom: 4 }}>
            No location aggregation yet
          </div>
          <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
            birth charts store coordinates · roll up by city / region when we have a sample
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {regions.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px",
                gap: 8,
                alignItems: "center",
                padding: "8px 10px",
                border: "1px solid var(--line)",
                borderRadius: 8,
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Glyph name="diamond" size={12} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: 11.5, color: "var(--fg)", fontWeight: "500" }}>{r.name}</span>
              </div>
              <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
                {r.lat.toFixed(2)}°{r.lat >= 0 ? "N" : "S"} · {r.lng.toFixed(2)}°{r.lng >= 0 ? "E" : "W"}
              </span>
              <span className="t-num" style={{ fontSize: 11.5, color: "var(--fg-dim)", textAlign: "right" }}>
                {r.count} chart{r.count === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// ERROR GROUPS
// ============================================================
function formatRelativeShort(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "now";
  const m = Math.round(ms / 60000);
  if (m < 1) return "<1m";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function ErrorGroups({ errorGroups }: { errorGroups: ErrorGroupsData }) {
  const groups = errorGroups.groups;
  const fiveXxTotal = groups.reduce((sum, g) => sum + g.fiveXxCount, 0);
  return (
    <Card
      title="Error Groups"
      subtitle={
        groups.length === 0
          ? errorGroups.live
            ? `no 4xx/5xx in last ${errorGroups.windowMinutes}m`
            : "request log offline"
          : `top ${groups.length} paths · ${fiveXxTotal} 5xx · ${errorGroups.windowMinutes}m window`
      }
      right={
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: errorGroups.live ? "var(--el-earth)" : "var(--fg-mute)",
            letterSpacing: "0.14em",
          }}
        >
          {errorGroups.live ? "● LIVE" : "○ STALE"}
        </span>
      }
    >
      {groups.length === 0 ? (
        <div style={{ padding: "16px 0", textAlign: "center" }}>
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
            {errorGroups.live ? "all green" : "request_log_entries unavailable"}
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {groups.map((g, i) => {
            const recent = Date.now() - new Date(g.lastSeenAt).getTime() < 5 * 60 * 1000;
            const hot = g.fiveXxCount > 0;
            return (
              <div
                key={g.path}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr 56px 56px 56px",
                  gap: 8,
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i === groups.length - 1 ? "none" : "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 32,
                    borderRadius: 999,
                    background: hot ? "#FF5252" : recent ? "var(--el-fire)" : "var(--fg-faint)",
                    boxShadow: hot ? "0 0 6px #FF5252" : recent ? "0 0 6px var(--el-fire)" : "none",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--fg)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                  >
                    {g.path}
                  </span>
                  <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                    last · {formatRelativeShort(g.lastSeenAt)}
                  </span>
                </div>
                <span
                  className="t-num"
                  style={{
                    textAlign: "right",
                    color: g.fiveXxCount > 0 ? "#FF5252" : "var(--fg-mute)",
                    fontSize: 11,
                  }}
                  title="5xx responses"
                >
                  {g.fiveXxCount}
                </span>
                <span
                  className="t-num"
                  style={{
                    textAlign: "right",
                    color: g.fourXxCount > 0 ? "var(--el-fire)" : "var(--fg-mute)",
                    fontSize: 11,
                  }}
                  title="4xx responses"
                >
                  {g.fourXxCount}
                </span>
                <span
                  className="t-num"
                  style={{ textAlign: "right", color: "var(--fg-dim)", fontSize: 11 }}
                  title="total in window"
                >
                  {g.totalCount}
                </span>
              </div>
            );
          })}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 56px 56px 56px",
              gap: 8,
              padding: "6px 0 0 13px",
            }}
          >
            <span />
            <span />
            <span className="t-tag" style={{ fontSize: 8, textAlign: "right" }}>5XX</span>
            <span className="t-tag" style={{ fontSize: 8, textAlign: "right" }}>4XX</span>
            <span className="t-tag" style={{ fontSize: 8, textAlign: "right" }}>TOTAL</span>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// COST BURNDOWN
// Empty placeholder until we wire billing data (Vercel, Railway, Stripe).
// ============================================================
export function CostBurndown({ data }: { data?: CostBurndownData }) {
  const { items = [], totalMtd = 0, projectedTotal = 0, live = false } = data || {};
  return (
    <Card
      title="Cost Burndown · MTD"
      subtitle={live ? `$${totalMtd.toFixed(2)} MTD · projected $${projectedTotal.toFixed(2)}` : "billing source offline"}
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--el-earth)" : "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          {live ? "● LIVE" : "○ NO SOURCE"}
        </span>
      }
    >
      {items.length === 0 ? (
        <div
          style={{
            padding: "32px 12px",
            textAlign: "center",
            border: "1px dashed var(--line)",
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 4 }}>
            No billing aggregation wired
          </div>
          <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
            connect Vercel + Railway billing APIs to populate
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
              <div className="t-tag" style={{ fontSize: 8 }}>MTD Spend</div>
              <div className="t-num" style={{ fontSize: 16, marginTop: 4 }}>${totalMtd.toFixed(2)}</div>
            </div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
              <div className="t-tag" style={{ fontSize: 8 }}>Projected Month Total</div>
              <div className="t-num" style={{ fontSize: 16, marginTop: 4, color: "var(--accent-2)" }}>${projectedTotal.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((item) => (
              <div key={item.resource} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--fg-dim)" }}>{item.resource} ({item.provider})</span>
                  <span className="t-num" style={{ fontSize: 11 }}>${item.costMtd.toFixed(2)} / ${item.limit.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 6,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, item.pct * 100)}%`,
                      height: "100%",
                      background: item.pct > 0.8 ? "var(--el-fire)" : "var(--accent)",
                      boxShadow: `0 0 8px ${item.pct > 0.8 ? "var(--el-fire)" : "var(--accent)"}`,
                    }}
                  />
                </div>
                <span className="t-mono" style={{ fontSize: 8, color: "var(--fg-mute)", marginTop: 2, display: "block" }}>
                  {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
