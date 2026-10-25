"use client";

import React from "react";
import type {
  PageTelemetryData,
  SemsDistributionData,
} from "@/services/dashboardPanelsService";
import type {
  PlanetaryHourSnapshot,
  SkyConditionsData,
} from "@/services/skyConditionsService";
import { Card } from "./hero";

// ============================================================
// SKY CONDITIONS — current planetary positions
// ============================================================
const PLANET_COLOR: Record<string, string> = {
  Sun: "var(--accent-2)",
  Moon: "var(--el-water)",
  Mercury: "var(--el-air)",
  Venus: "var(--el-fire)",
  Mars: "var(--accent)",
  Jupiter: "var(--el-earth)",
  Saturn: "var(--fg-mute)",
};

export function SkyConditions({ data }: { data: SkyConditionsData }) {
  const { planets, aspects, headline, live, planetaryHour } = data;
  const retrogradeCount = planets.filter((p) => p.retrograde).length;
  return (
    <section
      className="panel"
      style={{ padding: "10px 14px", marginBottom: 12, position: "relative", overflow: "hidden" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center" }}>
        <div>
          <div className="t-tag" style={{ fontSize: 8.5 }}>
            SKY CONDITIONS · {live ? "LIVE" : "CACHED"}
          </div>
          <div className="t-display" style={{ fontSize: 16, marginTop: 2 }}>
            {headline}
          </div>
          <div
            className="t-mono"
            style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 2, letterSpacing: "0.12em" }}
          >
            VSOP87 · DE440 · IAU 2006 · geocentric
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", padding: "2px 0" }}>
          {planets.map((p) => {
            const color = PLANET_COLOR[p.name] ?? "var(--fg-mute)";
            const flagged = p.retrograde || p.stationing;
            return (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  border: `1px solid ${flagged ? color : "var(--line)"}`,
                  borderRadius: 999,
                  background: flagged
                    ? `color-mix(in oklch, ${color}, transparent 90%)`
                    : "rgba(255,255,255,0.02)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color }}>{p.symbol}</span>
                <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg)" }}>{p.position}</span>
                <span
                  className="t-mono"
                  style={{ fontSize: 9, color: flagged ? "var(--el-fire)" : "var(--fg-mute)" }}
                >
                  {p.speed}
                </span>
                {p.retrograde && (
                  <span
                    className="t-mono"
                    style={{ fontSize: 8, color: "var(--el-fire)", letterSpacing: "0.12em" }}
                  >
                    Rx
                  </span>
                )}
                {p.stationing && !p.retrograde && (
                  <span
                    className="t-mono"
                    style={{ fontSize: 8, color: "var(--el-fire)", letterSpacing: "0.12em" }}
                  >
                    SR
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            paddingLeft: 12,
            borderLeft: "1px solid var(--line)",
          }}
        >
          {aspects.length === 0 ? (
            <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
              no major aspects
            </span>
          ) : (
            aspects.map((a, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                <div
                  className="t-mono"
                  style={{
                    fontSize: 12,
                    color: a.applying ? "var(--accent)" : "var(--fg-mute)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {a.a}
                  {a.op}
                  {a.b}
                </div>
                <div
                  className="t-mono"
                  style={{ fontSize: 8, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
                >
                  {a.orb}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px dashed var(--line)",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div className="t-tag" style={{ fontSize: 8 }}>
          PLANETARY HOUR · {planetaryHour.live ? "LIVE" : "CACHED"}
        </div>
        <PlanetaryHourBar snapshot={planetaryHour} />
        <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.12em" }}>
          {planets.length} BODIES · {retrogradeCount} Rx · {aspects.length} ASPECTS
        </div>
      </div>
    </section>
  );
}

const PLANETARY_HOUR_COLORS: Record<string, string> = {
  "♂": "var(--el-fire)",
  "☉": "var(--accent-2)",
  "♀": "var(--el-water)",
  "☿": "var(--el-air)",
  "☽": "#D6CFE8",
  "♄": "var(--fg-mute)",
  "♃": "var(--el-earth)",
};

function PlanetaryHourBar({ snapshot }: { snapshot: PlanetaryHourSnapshot }) {
  // Empty segments (degraded state) — render a uniform muted strip so the
  // bar doesn't collapse layout while the ephemeris recovers.
  const segs = snapshot.segments.length > 0
    ? snapshot.segments
    : Array.from({ length: 24 }, (_, hour) => ({
        hour,
        symbol: "·",
        planet: snapshot.dayRuler,
        isLive: false,
        isPast: false,
      }));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(24, 1fr)",
        gap: 1.5,
        alignItems: "stretch",
        height: 22,
      }}
    >
      {segs.map((s) => {
        const color = PLANETARY_HOUR_COLORS[s.symbol] ?? "var(--fg-mute)";
        return (
          <div
            key={s.hour}
            title={`${String(s.hour).padStart(2, "0")}:00 · ${s.planet}`}
            style={{
              background: s.isLive
                ? "var(--accent)"
                : s.isPast
                  ? `color-mix(in oklch, ${color}, transparent 70%)`
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${s.isLive ? "var(--accent)" : "var(--line)"}`,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "JetBrains Mono",
              fontSize: 9,
              color: s.isLive ? "#0A0712" : s.isPast ? "var(--fg-dim)" : "var(--fg-mute)",
              boxShadow: s.isLive ? "0 0 12px var(--accent)" : "none",
            }}
          >
            {s.symbol}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// ASTRONOMICAL ENGINE
// ============================================================
interface AstronomicalEngineProps {
  live?: boolean;
  pageTelemetry?: PageTelemetryData;
}

export function AstronomicalEngine({
  live = false,
  pageTelemetry,
}: AstronomicalEngineProps = {}) {
  // Static kernel/reference facts baked into the build — not monitored
  // signals, so they carry no live dots or health coloring.
  const refs = [
    { k: "EPHEMERIS", v: "DE440 · 2020-2050" },
    { k: "VSOP87 KERNEL", v: "rev · 2024-03-12" },
    { k: "IAU 2006 PRECESSION", v: "P03" },
    { k: "ΔT MODEL", v: "ESPENAK-MEEUS" },
    { k: "LEAP SECOND TABLE", v: "37s · 2017-01-01" },
  ];

  // pageTelemetry surfaces the row counts we actually capture in Postgres
  // (no per-endpoint RPS). When the source degraded its zeros are absence,
  // so every row renders "—" instead of a fabricated 0.
  const t = pageTelemetry?.live ? pageTelemetry : null;
  const compute = [
    { k: "natal · charts stored", count: t ? t.natalCharts : null, color: "var(--accent)" },
    { k: "food diary · entries", count: t ? t.foodDiary : null, color: "var(--accent-2)" },
    { k: "meal plans · saved", count: t ? t.mealPlans : null, color: "var(--el-water)" },
    { k: "restaurants · stored", count: t ? t.restaurants : null, color: "var(--el-air)" },
    { k: "commensals · saved", count: t ? t.commensals : null, color: "var(--fg-mute)" },
  ];
  return (
    <Card
      title="Astronomical Engine · astrologize"
      subtitle="planetary truth source · sub-ms hot path"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--el-earth)" : "var(--fg-mute)" }}
        >
          {live ? "● LIVE EPHEMERIS" : "○ DEGRADED"}
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div className="t-tag" style={{ marginBottom: 6 }}>REFERENCE · KERNELS</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {refs.map((r, i) => (
              <div
                key={r.k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: i === refs.length - 1 ? "none" : "1px solid var(--line)",
                }}
              >
                <span
                  className="t-mono"
                  style={{ fontSize: 9.5, color: "var(--fg-mute)", letterSpacing: "0.1em" }}
                >
                  {r.k}
                </span>
                <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-dim)" }}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="t-tag" style={{ marginBottom: 6 }}>
            COMPUTE · USER-FACING SURFACES{pageTelemetry?.live ? "" : " · OFFLINE"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {compute.map((c, i) => (
              <div
                key={c.k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 70px",
                  gap: 8,
                  alignItems: "center",
                  padding: "5px 0",
                  borderBottom: i === compute.length - 1 ? "none" : "1px solid var(--line)",
                  fontFamily: "var(--f-mono)",
                  fontSize: 10.5,
                }}
              >
                <span style={{ color: "var(--fg-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="el-dot" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                  {c.k}
                </span>
                <span className="t-num" style={{ textAlign: "right", color: "var(--fg)" }}>
                  {c.count === null
                    ? "—"
                    : c.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </Card>
  );
}

// ============================================================
// SEMS THERMODYNAMIC BALANCE
// Populates from the live catalog `recipes.read_model` +
// `recipe_calibration_profiles` rollup; degrades honestly when
// `data?.live` is false.
// ============================================================
export function SEMSDistribution({
  data,
}: { data?: SemsDistributionData | undefined } = {}) {
  const isLive = Boolean(data?.live && data.recipeCount > 0);
  if (!isLive || !data) {
    return (
      <Card
        title="Alchm · SEMS Thermodynamic Balance"
        subtitle="Spirit · Essence · Matter · Substance"
        right={
          <span
            className="t-mono"
            style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
          >
            ○ NOT WIRED
          </span>
        }
      >
        <div
          style={{
            padding: "10px 12px",
            border: "1px dashed var(--line)",
            borderRadius: 8,
          }}
        >
          <div className="t-tag" style={{ marginBottom: 4 }}>SEMS ROLLUP · NOT WIRED</div>
          <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", lineHeight: 1.6 }}>
            This panel will populate from a per-recipe SEMS rollup (Spirit /
            Essence / Matter / Substance scores plus the derived Monica and
            Kalchm constants) once recipe ingestion captures a thermodynamic
            score table. No live source exists yet — nothing is shown rather
            than sample numbers.
          </div>
        </div>
      </Card>
    );
  }

  const axisColor: Record<string, string> = {
    Spirit: "var(--accent)",
    Essence: "var(--el-water)",
    Matter: "var(--el-earth)",
    Substance: "var(--accent-2)",
  };
  const elementColor: Record<string, string> = {
    Fire: "var(--el-fire)",
    Water: "var(--el-water)",
    Earth: "var(--el-earth)",
    Air: "var(--el-air)",
  };

  return (
    <Card
      title="Alchm · SEMS Thermodynamic Balance"
      subtitle={`${data.recipeCount.toLocaleString()} catalog recipes · A# ${data.aSharpMean >= 0 ? "+" : ""}${data.aSharpMean.toFixed(2)} · ${(data.harmonyMean * 100).toFixed(1)}% harmony`}
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: "var(--el-earth)", letterSpacing: "0.14em" }}
        >
          ● LIVE ROLLUP
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="t-tag" style={{ fontSize: 8.5 }}>
            ESMS QUATERNARY DISTRIBUTION · N={data.recipeCount}
          </div>
          {data.axes.map((ax) => {
            const maxBin = Math.max(1, ...ax.bins);
            const color = axisColor[ax.key] ?? "var(--accent)";
            return (
              <div
                key={ax.key}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "6px 8px",
                  background: "rgba(255,255,255,0.012)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--fg)" }}>
                    <span className="el-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    {ax.key}
                  </span>
                  <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-dim)" }}>
                    μ <b style={{ color: "var(--fg)" }}>{ax.mean.toFixed(2)}</b> · σ {ax.stdDev.toFixed(2)} · [{ax.min.toFixed(1)}–{ax.max.toFixed(1)}]
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 1fr)",
                    gap: 3,
                    height: 18,
                    alignItems: "end",
                  }}
                >
                  {ax.bins.map((b, idx) => (
                    <div
                      key={idx}
                      title={`Bin ${idx + 1}: ${b} recipes`}
                      style={{
                        height: `${Math.max(12, Math.round((b / maxBin) * 100))}%`,
                        background: b > 0 ? color : "rgba(255,255,255,0.04)",
                        opacity: b > 0 ? 0.35 + 0.65 * (b / maxBin) : 0.3,
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div className="t-tag" style={{ fontSize: 8.5, marginBottom: 6 }}>
              ELEMENTAL MEAN · CATALOG
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
                const val = data.elementalMeans[el];
                const col = elementColor[el];
                return (
                  <div
                    key={el}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 6,
                      padding: "6px 8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                      <span style={{ color: "var(--fg-dim)", display: "flex", alignItems: "center", gap: 5 }}>
                        <span className="el-dot" style={{ background: col, boxShadow: `0 0 5px ${col}` }} />
                        {el}
                      </span>
                      <span className="t-num" style={{ color: "var(--fg)" }}>
                        {(val * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: "8px 10px",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span className="t-tag" style={{ fontSize: 8 }}>
                MONICA CALIBRATION · {data.monicaCalibration.calibratedProfiles} PROFILES
              </span>
              <span className="t-mono" style={{ fontSize: 9.5, color: "var(--accent-2)" }}>
                M̄ = {data.monicaCalibration.meanConstant.toFixed(3)}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {data.monicaCalibration.methods.map((m) => (
                <div
                  key={m.method}
                  className="t-mono"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 9,
                    color: "var(--fg-dim)",
                  }}
                >
                  <span>{m.method.replace(/_/g, " ")}</span>
                  <span className="t-num" style={{ color: "var(--fg)" }}>
                    {m.count} profiles
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
