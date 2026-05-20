"use client";

import React from "react";
import { Sparkline } from "./atoms";
import { seeded } from "./data";
import { Card } from "./hero";

// ============================================================
// SKY CONDITIONS — current planetary positions
// ============================================================
export function SkyConditions() {
  const planets = [
    { sym: "☉", n: "Sun", pos: "06°41′ Gem", speed: "+0.96°/d", state: "DIRECT", color: "var(--accent-2)" },
    { sym: "☽", n: "Moon", pos: "22°08′ Vir", speed: "+13.2°/d", state: "DIRECT", color: "var(--el-water)" },
    { sym: "☿", n: "Mercury", pos: "01°14′ Gem", speed: "+1.84°/d", state: "DIRECT", color: "var(--el-air)" },
    { sym: "♀", n: "Venus", pos: "29°47′ Tau", speed: "-0.04°/d", state: "Rx · stationing", color: "var(--el-fire)", warn: true },
    { sym: "♂", n: "Mars", pos: "14°22′ Leo", speed: "+0.68°/d", state: "HOUR · live", color: "var(--accent)", live: true },
    { sym: "♃", n: "Jupiter", pos: "08°53′ Gem", speed: "+0.22°/d", state: "DIRECT", color: "var(--el-earth)" },
    { sym: "♄", n: "Saturn", pos: "00°12′ Ari", speed: "+0.11°/d", state: "DIRECT", color: "var(--fg-mute)" },
  ];
  const aspects = [
    { a: "☿", op: "△", b: "♄", deg: "0°14′", kind: "applying", color: "var(--el-earth)" },
    { a: "♂", op: "□", b: "♀", deg: "2°41′", kind: "applying", color: "var(--el-fire)" },
    { a: "☉", op: "✶", b: "♃", deg: "1°06′", kind: "separating", color: "var(--accent-2)" },
  ];
  return (
    <section
      className="panel"
      style={{ padding: "10px 14px", marginBottom: 12, position: "relative", overflow: "hidden" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center" }}>
        <div>
          <div className="t-tag" style={{ fontSize: 8.5 }}>SKY CONDITIONS · LIVE</div>
          <div className="t-display" style={{ fontSize: 16, marginTop: 2 }}>
            Mars hour <span style={{ color: "var(--accent)" }}>♂</span> · Venus stationing Rx
          </div>
          <div
            className="t-mono"
            style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 2, letterSpacing: "0.12em" }}
          >
            VSOP87 · DE440 · IAU 2006 · drift &lt; 0.4″
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", padding: "2px 0" }}>
          {planets.map((p) => (
            <div
              key={p.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                border: `1px solid ${p.live ? p.color : "var(--line)"}`,
                borderRadius: 999,
                background: p.live ? "color-mix(in oklch, var(--accent), transparent 88%)" : "rgba(255,255,255,0.02)",
                whiteSpace: "nowrap",
                boxShadow: p.live ? `0 0 18px color-mix(in oklch, ${p.color}, transparent 75%)` : "none",
              }}
            >
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: p.color }}>{p.sym}</span>
              <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg)" }}>{p.pos}</span>
              <span className="t-mono" style={{ fontSize: 9, color: p.warn ? "var(--el-fire)" : "var(--fg-mute)" }}>
                {p.speed}
              </span>
              {p.warn && (
                <span className="t-mono" style={{ fontSize: 8, color: "var(--el-fire)", letterSpacing: "0.12em" }}>
                  Rx
                </span>
              )}
              {p.live && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: p.color,
                    boxShadow: `0 0 6px ${p.color}`,
                  }}
                />
              )}
            </div>
          ))}
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
          {aspects.map((a, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
              <div className="t-mono" style={{ fontSize: 12, color: a.color, letterSpacing: "0.1em" }}>
                {a.a}
                {a.op}
                {a.b}
              </div>
              <div className="t-mono" style={{ fontSize: 8, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>
                {a.deg}
              </div>
            </div>
          ))}
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
        <div className="t-tag" style={{ fontSize: 8 }}>PLANETARY HOUR · 60-MIN BAR</div>
        <PlanetaryHourBar />
        <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.12em" }}>
          NEXT · <span style={{ color: "var(--el-air)" }}>☿ MERCURY</span> @ 22:34 UTC · +47m
        </div>
      </div>
    </section>
  );
}

function PlanetaryHourBar() {
  const planets = ["♂", "☉", "♀", "☿", "☽", "♄", "♃"];
  const segs = Array.from({ length: 24 }, (_, i) => {
    const idx = (i + 3) % 7;
    const isLive = i === 8;
    const isPast = i < 8;
    return { sym: planets[idx], isLive, isPast };
  });
  const colors: Record<string, string> = {
    "♂": "var(--el-fire)",
    "☉": "var(--accent-2)",
    "♀": "var(--el-water)",
    "☿": "var(--el-air)",
    "☽": "#D6CFE8",
    "♄": "var(--fg-mute)",
    "♃": "var(--el-earth)",
  };
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
      {segs.map((s, i) => (
        <div
          key={i}
          style={{
            background: s.isLive
              ? "var(--accent)"
              : s.isPast
                ? `color-mix(in oklch, ${colors[s.sym]}, transparent 70%)`
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
          {s.sym}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ASTRONOMICAL ENGINE
// ============================================================
export function AstronomicalEngine() {
  const refs = [
    { k: "EPHEMERIS", v: "DE440 · 2020-2050", ok: true },
    { k: "VSOP87 KERNEL", v: "rev · 2024-03-12", ok: true },
    { k: "IAU 2006 PRECESSION", v: "P03 · OK", ok: true },
    { k: "ΔT MODEL", v: "ESPENAK-MEEUS", ok: true },
    { k: "LEAP SECOND TABLE", v: "37s · 2017-01-01", ok: true },
    { k: "JPL HORIZONS DRIFT", v: "max · 0.38″ Saturn", ok: true },
  ];
  const compute = [
    { k: "natal · /api/natal", rps: 38, p95: "184ms", color: "var(--accent)" },
    { k: "transit · /api/transit", rps: 142, p95: "62ms", color: "var(--accent-2)" },
    { k: "houses · /api/houses", rps: 18, p95: "42ms", color: "var(--el-water)" },
    { k: "asteroids · /api/asteroids", rps: 6, p95: "108ms", color: "var(--el-air)" },
    { k: "fixed-stars · /api/stars", rps: 3, p95: "240ms", color: "var(--fg-mute)" },
  ];
  return (
    <Card
      title="Astronomical Engine · astrologize"
      subtitle="planetary truth source · sub-ms hot path"
      right={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--el-earth)" }}>● HEALTHY · 99.998%</span>
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
          <div className="t-tag" style={{ marginBottom: 6 }}>COMPUTE · ENDPOINTS · 60s</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {compute.map((c, i) => (
              <div
                key={c.k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 50px 50px",
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
                  {c.rps}
                  <span style={{ color: "var(--fg-mute)" }}>/s</span>
                </span>
                <span className="t-num" style={{ textAlign: "right", color: "var(--fg-dim)" }}>{c.p95}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: "8px 10px", border: "1px dashed var(--line)", borderRadius: 8 }}>
        <div className="t-tag" style={{ marginBottom: 4 }}>UPCOMING SKY EVENTS · DEMAND IMPACT FORECAST</div>
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
// ============================================================
export function SEMSDistribution() {
  const sems = [
    { id: "spirit", label: "Spirit", sym: "🜀", v: 0.62, target: 0.55, sub: "volatile · aroma · top-notes" },
    { id: "essence", label: "Essence", sym: "🜁", v: 0.71, target: 0.65, sub: "umami · core flavor compounds" },
    { id: "matter", label: "Matter", sym: "🜃", v: 0.48, target: 0.5, sub: "texture · structure · weight" },
    {
      id: "substance",
      label: "Substance",
      sym: "🜄",
      v: 0.34,
      target: 0.45,
      sub: "minerals · base · bottom",
      low: true,
    },
  ];
  const monica = 0.847;
  return (
    <Card
      title="Alchm · SEMS Thermodynamic Balance"
      subtitle="Spirit · Essence · Matter · Substance — site-wide across 184 active recipes"
      right={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>K-EQUILIBRIUM · 1.214</span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
            <div className="t-tag" style={{ marginBottom: 6 }}>ALCHM CONSTANTS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <KV2 k="Monica" v={monica.toFixed(3)} />
              <KV2 k="Kalchm" v="K = 1.214" accent />
              <KV2 k="P = IV" v="P = 1.62V" />
              <KV2 k="Δ entropy" v="0.014" />
              <KV2 k="ΔG free" v="−2.41 kJ" />
              <KV2 k="τ relax" v="1.6 hr" />
            </div>
          </div>

          <div
            style={{
              border: "1px dashed var(--el-fire)",
              borderRadius: 8,
              padding: "10px 12px",
              background: "color-mix(in oklch, var(--el-fire), transparent 94%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="t-tag" style={{ color: "var(--el-fire)" }}>ANOMALIES · 24H</span>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--el-fire)" }}>2 active</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-dim)", lineHeight: 1.5 }}>
              <div>• Substance running 11pts below target band — recipes lacking minerality / base structure</div>
              <div style={{ marginTop: 4 }}>• Engine v17.4 may be over-weighting Spirit during Mars hour</div>
            </div>
            <button className="btn btn-ghost" style={{ marginTop: 8, padding: "4px 10px", fontSize: 9 }} type="button">
              OPEN DOSSIER →
            </button>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
            <div className="t-tag" style={{ marginBottom: 6 }}>CALIBRATION · OBSERVED vs PREDICTED</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span className="t-num" style={{ fontSize: 18 }}>0.942</span>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--el-earth)" }}>R² · +0.018 vs 7d</span>
            </div>
            <Sparkline data={seeded(31, 30, 0.85, 0.96)} width={220} height={28} color="var(--accent)" />
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
