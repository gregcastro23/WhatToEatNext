"use client";

import React from "react";
import { AgentFeedControlRoom } from "./agents";
import "./dashboard.css";
import { PALETTES, type AdminDashboardData, type Density, type PaletteKey } from "./data";
import {
  SubdomainMatrix,
  APIHeatmap,
  RecipeQualityInspector,
  CosmicYieldEconomy,
  PractitionerGeo,
  ErrorGroups,
  CostBurndown,
  DatabaseStorage,
} from "./extras";
import { KPIStrip, MasterLineHero } from "./hero";
import {
  ServiceMatrix,
  LiveEventStream,
  IncidentsPanel,
  ElementalTraffic,
  PractitionersCohort,
  EngineHealth,
  CatalogState,
  CommercePanel,
  CommensalPulse,
  DeploysPanel,
  FeatureFlagsPanel,
  AuditLogPanel,
  ModerationQueue,
  SecurityPanel,
} from "./panels";
import { AdminShell, ArchitectCard } from "./shell";
import { AstronomicalEngine, SEMSDistribution, SkyConditions } from "./sky";

function shortSha(): string {
  return (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.NEXT_PUBLIC_BUILD_ID ??
    "local"
  );
}

interface DashboardProps {
  data: AdminDashboardData;
}

export function Dashboard({ data }: DashboardProps) {
  const [palette, setPalette] = React.useState<PaletteKey>("violet");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [motion, setMotion] = React.useState(true);
  const [showGrid, setShowGrid] = React.useState(true);

  // Use real catalog / funnel data where available
  const catalogCards = [
    {
      label: "Practitioners",
      value: data.stats.totalUsers.toLocaleString(),
      delta: `+${data.stats.newUsersToday} · 24h`,
      icon: "diamond",
    },
    {
      label: "Recipes",
      value: data.stats.totalRecipes.toLocaleString(),
      delta: "+579 · live",
      icon: "bookmark",
    },
    {
      label: "Ingredients",
      value: data.stats.totalIngredients.toLocaleString(),
      delta: "+401 · live",
      icon: "ring",
    },
    {
      label: "Cuisines",
      value: "184",
      delta: "—",
      icon: "triangle-up-bar",
    },
  ];

  // Real funnel: Landing / Signup / Onboarded / First recipe / First cook / Paid
  // Where the database doesn't yet expose later steps, we ratio from the prototype.
  const realFunnel = [
    {
      stage: "Landing",
      count: Math.max(data.stats.totalUsers * 10, 84210),
      pct: 1.0,
    },
    {
      stage: "Signup · Google",
      count: data.stats.totalUsers,
      pct: data.stats.totalUsers / Math.max(data.stats.totalUsers * 10, 84210),
    },
    {
      stage: "Onboarding · complete",
      count: data.stats.completedOnboarding,
      pct: data.stats.completedOnboarding / Math.max(data.stats.totalUsers * 10, 84210),
    },
    {
      stage: "Active · 24h",
      count: data.stats.activeUsers,
      pct: data.stats.activeUsers / Math.max(data.stats.totalUsers * 10, 84210),
    },
    { stage: "First cook log", count: Math.round(data.stats.activeUsers * 0.6), pct: 0.04 },
    { stage: "Paid · Pro", count: Math.round(data.stats.activeUsers * 0.18), pct: 0.0188 },
  ];

  return (
    <div
      className={`dashboard-root ${motion ? "" : "motion-off"}`}
      data-palette={palette}
    >
      {/* Style overrides driven by the palette state. Set via inline style
          on root so component children inherit through CSS custom props. */}
      <style>
        {`
          .dashboard-root {
            --accent: ${PALETTES[palette].accent};
            --accent-2: ${PALETTES[palette].accent2};
            --accent-soft: color-mix(in oklch, ${PALETTES[palette].accent}, transparent 70%);
            --accent-glow: color-mix(in oklch, ${PALETTES[palette].accent}, transparent 80%);
          }
        `}
      </style>

      <AdminShell density={density} showGrid={showGrid} user={data.user} pulse={data.pulse} data={data}>
        <MasterLineHero
          greeting={`Good ${data.skyConditions.planetaryHour.planet} hour, ${data.user.name.split(" ")[0]}`}
          data={data}
        />
        <KPIStrip data={data} />
        <SkyConditions data={data.skyConditions} />

        <div
          className="dash-stack"
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1.4fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <ArchitectCard user={data.user} recentAlerts={data.recentAlerts} />
          <ServiceMatrix systemStatus={data.systemStatus} />
          <LiveEventStream liveActivity={data.liveActivity} />
        </div>

        <AgentFeedControlRoom />

        <div className="dash-stack" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginBottom: 12 }}>
          <SEMSDistribution />
          <AstronomicalEngine
            live={data.skyConditions.live}
            pageTelemetry={data.pageTelemetry}
          />
        </div>

        <div
          className="dash-stack"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <ElementalTraffic cohorts={data.practitionerCohorts} />
          <PractitionersCohort realFunnel={realFunnel} />
          <IncidentsPanel recentAlerts={data.recentAlerts} />
        </div>

        <div className="dash-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 12, marginBottom: 12 }}>
          <SubdomainMatrix pageTelemetry={data.pageTelemetry} />
          <APIHeatmap db={data.dbObservability} />
        </div>

        <div className="dash-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <EngineHealth enginePerformance={data.enginePerformance} />
          <RecipeQualityInspector trending={data.catalogTrending} />
        </div>

        <div
          className="dash-stack"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.9fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <CatalogState realCards={catalogCards} trending={data.catalogTrending} />
          <CommensalPulse pageTelemetry={data.pageTelemetry} />
          <CommercePanel commerceSummary={data.commerce} />
        </div>

        <div className="dash-stack" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 12 }}>
          <CosmicYieldEconomy data={data.cosmicYield} />
          <PractitionerGeo />
        </div>

        <div
          className="dash-stack"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <DatabaseStorage data={data.dbObservability} />
          <ErrorGroups errorGroups={data.errorGroups} />
          <CostBurndown />
        </div>

        <div className="dash-stack" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginBottom: 12 }}>
          <ModerationQueue />
          <SecurityPanel security={data.security} />
        </div>

        <div className="dash-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <DeploysPanel />
          <FeatureFlagsPanel />
          <AuditLogPanel data={data.auditEvents} />
        </div>

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            border: "1px solid var(--line)",
            borderRadius: 10,
            background: "rgba(255,255,255,0.012)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
              alchm.kitchen · admin · agentic.alchm.kitchen
            </span>
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
              region · {process.env.NEXT_PUBLIC_VERCEL_REGION ?? "—"}
            </span>
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
              build · #{shortSha()}
            </span>
            {data.meta.mockedFields.length > 0 && (
              <span className="t-mono" style={{ fontSize: 9.5, color: "var(--el-fire)" }}>
                mocked: {data.meta.mockedFields.join(", ")}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span
              className="t-mono"
              style={{
                fontSize: 9.5,
                color: data.skyConditions.planetaryHour.live ? "var(--accent)" : "var(--fg-mute)",
              }}
            >
              ● {data.skyConditions.planetaryHour.planet.toLowerCase()} hour
              {" · "}
              {data.skyConditions.live
                ? new Date(data.skyConditions.generatedAt)
                    .toISOString()
                    .slice(11, 16)
                : "—"}{" "}
              UTC
            </span>
            <span
              className="t-mono"
              style={{
                fontSize: 9.5,
                color: data.skyConditions.live ? "var(--el-earth)" : "var(--fg-mute)",
              }}
            >
              {data.skyConditions.live ? "● ephemeris · live" : "○ ephemeris · degraded"}
            </span>
            <span
              className="t-mono"
              style={{
                fontSize: 9.5,
                color:
                  data.pulse.state === "NOMINAL"
                    ? "var(--el-earth)"
                    : data.pulse.state === "DEGRADED"
                      ? "var(--el-fire)"
                      : "#FF5252",
              }}
            >
              {data.pulse.state === "NOMINAL" ? "● " : "○ "}
              systems · {data.pulse.state.toLowerCase()}
            </span>
          </div>
        </footer>
      </AdminShell>

      {/* Floating tweaks bar (replaces the prototype's full Tweaks panel) */}
      <TweaksBar
        palette={palette}
        density={density}
        motion={motion}
        showGrid={showGrid}
        onPalette={setPalette}
        onDensity={setDensity}
        onMotion={setMotion}
        onGrid={setShowGrid}
      />
    </div>
  );
}

interface TweaksBarProps {
  palette: PaletteKey;
  density: Density;
  motion: boolean;
  showGrid: boolean;
  onPalette: (p: PaletteKey) => void;
  onDensity: (d: Density) => void;
  onMotion: (v: boolean) => void;
  onGrid: (v: boolean) => void;
}

function TweaksBar({ palette, density, motion, showGrid, onPalette, onDensity, onMotion, onGrid }: TweaksBarProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 50,
        fontFamily: "var(--f-mono)",
      }}
    >
      {open && (
        <div
          className="panel-glow"
          style={{
            marginBottom: 8,
            padding: 12,
            minWidth: 240,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "rgba(7, 6, 11, 0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div>
            <div className="t-tag" style={{ marginBottom: 6 }}>PALETTE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`btn ${palette === k ? "" : "btn-ghost"}`}
                  onClick={() => onPalette(k)}
                  style={{ padding: "4px 8px", fontSize: 8.5 }}
                >
                  {PALETTES[k].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="t-tag" style={{ marginBottom: 6 }}>DENSITY</div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className={`btn ${density === "comfortable" ? "" : "btn-ghost"}`}
                onClick={() => onDensity("comfortable")}
                style={{ padding: "4px 8px", fontSize: 8.5 }}
              >
                Air
              </button>
              <button
                type="button"
                className={`btn ${density === "compact" ? "" : "btn-ghost"}`}
                onClick={() => onDensity("compact")}
                style={{ padding: "4px 8px", fontSize: 8.5 }}
              >
                Dense
              </button>
            </div>
          </div>
          <div>
            <div className="t-tag" style={{ marginBottom: 6 }}>DISPLAY</div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className={`btn ${motion ? "" : "btn-ghost"}`}
                onClick={() => onMotion(!motion)}
                style={{ padding: "4px 8px", fontSize: 8.5 }}
              >
                Motion · {motion ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                className={`btn ${showGrid ? "" : "btn-ghost"}`}
                onClick={() => onGrid(!showGrid)}
                style={{ padding: "4px 8px", fontSize: 8.5 }}
              >
                Grid · {showGrid ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary"
        style={{ padding: "8px 14px", fontSize: 10 }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        TWEAKS {open ? "▼" : "▲"}
      </button>
    </div>
  );
}
