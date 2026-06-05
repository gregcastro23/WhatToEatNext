"use client";

import React from "react";
import type { PageTelemetryData } from "@/services/dashboardPanelsService";
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
  const refs = [
    { k: "EPHEMERIS", v: "DE440 · 2020-2050", ok: live },
    { k: "VSOP87 KERNEL", v: "rev · 2024-03-12", ok: live },
    { k: "IAU 2006 PRECESSION", v: "P03 · OK", ok: live },
    { k: "ΔT MODEL", v: "ESPENAK-MEEUS", ok: live },
    { k: "LEAP SECOND TABLE", v: "37s · 2017-01-01", ok: live },
  ];

  // pageTelemetry surfaces the row counts we actually capture in Postgres
  // (no per-endpoint RPS). Show what we have; an "—" makes it obvious when
  // we don't, instead of fabricating a number.
  const t = pageTelemetry;
  const compute = [
    { k: "natal · charts stored", count: t ? t.customRecipes : null, color: "var(--accent)" },
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
                <span
                  className="t-mono"
                  style={{ fontSize: 10, color: r.ok ? "var(--fg)" : "var(--el-fire)" }}
                >
                  {r.ok && <span style={{ color: "var(--el-earth)" }}>● </span>}
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

      <div style={{ marginTop: 10, padding: "8px 10px", border: "1px dashed var(--line)", borderRadius: 8 }}>
        <div className="t-tag" style={{ marginBottom: 4 }}>UPCOMING SKY EVENTS · ILLUSTRATIVE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <SkyEvent t="+47m" e="☿ → Mercury hour" impact="planner load +18%" />
          <SkyEvent t="+2d" e="♀ stations direct" impact="cuisine: sweet/aromatic +24%" warn />
          <SkyEvent t="+12d" e="☉ ingress ♋" impact="seasonality recompute · 12,438 recipes" />
        </div>
      </div>
    </Card>
  );
}

function SkyEvent({ t, e, impact, warn }: { t: string; e: string; impact: string; warn?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "4px 6px",
        borderLeft: `2px solid ${warn ? "var(--el-fire)" : "var(--accent)"}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--fg)" }}>{e}</span>
        <span className="t-mono" style={{ fontSize: 9, color: warn ? "var(--el-fire)" : "var(--accent)" }}>{t}</span>
      </div>
      <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.1em" }}>{impact}</span>
    </div>
  );
}

// ============================================================
// SEMS THERMODYNAMIC BALANCE
// The SEMS rollup table doesn't exist yet — these are illustrative
// values. We label the card with a "SAMPLE" badge so operators
// don't read it as a live signal until the rollup is wired.
// ============================================================
export function SEMSDistribution() {
  // SEMS rollup is not wired yet — there is no per-recipe thermodynamic score
  // source. This render is data-driven and stays empty until that source
  // exists, so we never show illustrative values as if they were live.
  const sems: Array<{
    id: string;
    label: string;
    sym: string;
    v: number;
    target: number;
    sub: string;
    low?: boolean;
  }> = [];
  return (
    <Card
      title="Alchm · SEMS Thermodynamic Balance"
      subtitle="Spirit · Essence · Matter · Substance — not wired (no live source)"
      right={
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: "var(--el-fire)",
            padding: "2px 8px",
            borderRadius: 999,
            border: "1px solid color-mix(in oklch, var(--el-fire), transparent 60%)",
            background: "color-mix(in oklch, var(--el-fire), transparent 92%)",
            letterSpacing: "0.14em",
          }}
        >
          ○ NOT WIRED
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sems.length === 0 && (
            <div
              className="t-mono"
              style={{ fontSize: 10, color: "var(--fg-mute)", fontStyle: "italic", lineHeight: 1.5 }}
            >
              No live SEMS distribution. The per-recipe thermodynamic score that
              would populate Spirit · Essence · Matter · Substance isn&apos;t
              captured yet, so this panel shows no illustrative values.
            </div>
          )}
          {sems.map((s) => (
            <div key={s.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 4,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--line-hi)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "var(--accent)",
                    }}
                  >
                    {s.sym}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                    <span style={{ fontSize: 12, color: "var(--fg)" }}>{s.label}</span>
                    <span
                      className="t-mono"
                      style={{ fontSize: 8.5, color: "var(--fg-mute)", letterSpacing: "0.12em" }}
                    >
                      {s.sub}
                    </span>
                  </div>
                </span>
                <span className="t-num" style={{ fontSize: 13, color: s.low ? "var(--el-fire)" : "var(--fg)" }}>
                  {(s.v * 100).toFixed(1)}
                  <span style={{ color: "var(--fg-mute)" }}>%</span>
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 10,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${(s.target - 0.06) * 100}%`,
                    width: `${0.12 * 100}%`,
                    top: 0,
                    bottom: 0,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px dashed rgba(255,255,255,0.18)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 1,
                    bottom: 1,
                    width: `${s.v * 100}%`,
                    background: s.low
                      ? "linear-gradient(90deg, var(--el-fire), color-mix(in oklch, var(--el-fire), transparent 50%))"
                      : "linear-gradient(90deg, var(--accent), color-mix(in oklch, var(--accent), transparent 50%))",
                    boxShadow: s.low ? "0 0 10px var(--el-fire)" : "0 0 10px var(--accent)",
                    borderRadius: 3,
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span
                  className="t-mono"
                  style={{ fontSize: 8.5, color: "var(--fg-faint)", letterSpacing: "0.12em" }}
                >
                  target band {(s.target * 100).toFixed(0)}±6%
                </span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 8.5,
                    color:
                      s.v > s.target
                        ? "var(--el-fire)"
                        : s.v < s.target - 0.06
                          ? "var(--el-fire)"
                          : "var(--el-earth)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {s.v > s.target ? "+" : ""}
                  {((s.v - s.target) * 100).toFixed(1)} from center
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
            <div className="t-tag" style={{ marginBottom: 6 }}>ALCHM CONSTANTS · NOT WIRED</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <KV2 k="Monica" v="—" />
              <KV2 k="Kalchm" v="—" />
              <KV2 k="P = IV" v="—" />
              <KV2 k="Δ entropy" v="—" />
              <KV2 k="ΔG free" v="—" />
              <KV2 k="τ relax" v="—" />
            </div>
          </div>

          <div
            style={{
              border: "1px dashed var(--line)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div className="t-tag" style={{ marginBottom: 4 }}>WHEN WIRED · SOURCE</div>
            <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", lineHeight: 1.6 }}>
              SEMS rollup will read from a per-recipe thermodynamic score
              table once recipe ingestion captures it. Calibration R² will
              follow from the eval harness.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function KV2({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "4px 0" }}>
      <span className="t-tag" style={{ fontSize: 8 }}>{k}</span>
      <span className="t-num" style={{ fontSize: 13, color: accent ? "var(--accent)" : "var(--fg)" }}>{v}</span>
    </div>
  );
}
