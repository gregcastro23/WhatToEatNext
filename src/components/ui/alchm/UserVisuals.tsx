"use client";

import React, { useState } from "react";

// Scaffold zodiac signs
const SIGNS = [
  { n: "Aries",       glyph: "♈", el: "fire" },
  { n: "Taurus",      glyph: "♉", el: "earth" },
  { n: "Gemini",      glyph: "♊", el: "air" },
  { n: "Cancer",      glyph: "♋", el: "water" },
  { n: "Leo",         glyph: "♌", el: "fire" },
  { n: "Virgo",       glyph: "♍", el: "earth" },
  { n: "Libra",       glyph: "♎", el: "air" },
  { n: "Scorpio",     glyph: "♏", el: "water" },
  { n: "Sagittarius", glyph: "♐", el: "fire" },
  { n: "Capricorn",   glyph: "♑", el: "earth" },
  { n: "Aquarius",    glyph: "♒", el: "air" },
  { n: "Pisces",      glyph: "♓", el: "water" },
];

const EL_COLOR: Record<string, string> = {
  fire: "var(--el-fire)",
  water: "var(--el-water)",
  earth: "var(--el-earth)",
  air: "var(--el-air)",
  Fire: "var(--el-fire)",
  Water: "var(--el-water)",
  Earth: "var(--el-earth)",
  Air: "var(--el-air)",
};

interface PlanetPoint {
  planet: string;
  lon: number;
  sign: string;
  glyph: string;
  deg: number;
  el: string;
  mod: string;
}

// ── NATAL WHEEL — 12-sector zodiac wheel w/ planet placements ──────────────────
interface NatalWheelProps {
  planets: PlanetPoint[];
  size?: number;
  motion?: boolean;
  dominantEl?: string;
}

export function NatalWheel({ planets, size = 380, motion: _motion = true, dominantEl = "air" }: NatalWheelProps) {
  const c = size / 2;
  const rOuter = c * 0.92;
  const rSign = c * 0.81;
  const rInner = c * 0.66;
  const rPlanet = c * 0.55;
  const [hover, setHover] = useState<{ x: number; y: number; p: PlanetPoint } | null>(null);

  // Aspect matching between planets
  const aspects: Array<{ p1: PlanetPoint; p2: PlanetPoint; x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p = planets[i];
      const q = planets[j];
      let d = Math.abs(p.lon - q.lon) % 360;
      if (d > 180) d = 360 - d;
      // Check for major aspects: conjunction (0), sextile (60), square (90), trine (120), opposition (180)
      if ([0, 60, 90, 120, 180].some(ang => Math.abs(d - ang) <= 6)) {
        const ap = (p.lon / 360) * 2 * Math.PI - Math.PI / 2;
        const aq = (q.lon / 360) * 2 * Math.PI - Math.PI / 2;
        aspects.push({
          p1: p, p2: q,
          x1: c + Math.cos(ap) * rPlanet,
          y1: c + Math.sin(ap) * rPlanet,
          x2: c + Math.cos(aq) * rPlanet,
          y2: c + Math.sin(aq) * rPlanet
        });
      }
    }
  }

  const activeColor = EL_COLOR[dominantEl] || "var(--accent)";

  return (
    <div style={{ position: "relative", width: size, height: size }} className="select-none mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="nw-glow">
            <stop offset="0%" stopColor={activeColor} stopOpacity="0.28" />
            <stop offset="70%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx={c} cy={c} r={rPlanet} fill="url(#nw-glow)" />
        <circle cx={c} cy={c} r={rOuter} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
        <circle cx={c} cy={c} r={rInner} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
        <circle cx={c} cy={c} r={rPlanet * 0.62} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />

        {/* 12 sectors */}
        {SIGNS.map((s, i) => {
          const a0 = (i / 12) * 2 * Math.PI - Math.PI / 2;
          const aM = ((i + 0.5) / 12) * 2 * Math.PI - Math.PI / 2;
          return (
            <g key={s.n}>
              <line 
                x1={c + Math.cos(a0) * rInner} 
                y1={c + Math.sin(a0) * rInner} 
                x2={c + Math.cos(a0) * rOuter} 
                y2={c + Math.cos(a0) * rOuter} 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="0.6" 
              />
              <text 
                x={c + Math.cos(aM) * rSign} 
                y={c + Math.sin(aM) * rSign} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize="13" 
                fontFamily="JetBrains Mono" 
                fill={EL_COLOR[s.el]} 
                opacity="0.85"
              >
                {s.glyph}
              </text>
            </g>
          );
        })}

        {/* degree ticks */}
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * 2 * Math.PI - Math.PI / 2;
          const big = i % 6 === 0;
          return (
            <line 
              key={i} 
              x1={c + Math.cos(a) * (rInner - (big ? 6 : 3))} 
              y1={c + Math.sin(a) * (rInner - (big ? 6 : 3))} 
              x2={c + Math.cos(a) * rInner} 
              y2={c + Math.sin(a) * rInner} 
              stroke="rgba(255,255,255,0.16)" 
              strokeWidth={big ? 0.7 : 0.4} 
            />
          );
        })}

        {/* aspect lines between planets */}
        <g stroke="var(--accent)" strokeWidth="0.5" opacity="0.32">
          {aspects.map((asp, idx) => (
            <line key={idx} x1={asp.x1} y1={asp.y1} x2={asp.x2} y2={asp.y2} />
          ))}
        </g>

        {/* planets */}
        {planets.map((p, i) => {
          const a = (p.lon / 360) * 2 * Math.PI - Math.PI / 2;
          const rr = rPlanet * (0.86 + (i % 3) * 0.07);
          const x = c + Math.cos(a) * rr;
          const y = c + Math.sin(a) * rr;
          const color = EL_COLOR[p.el] || "var(--accent)";
          return (
            <g 
              key={p.planet} 
              style={{ cursor: "help" }} 
              onMouseMove={(e) => {
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                const xPos = e.clientX - (rect?.left ?? 0);
                const yPos = e.clientY - (rect?.top ?? 0);
                setHover({ x: xPos, y: yPos, p });
              }} 
              onMouseLeave={() => setHover(null)}
            >
              <line x1={c + Math.cos(a) * rInner} y1={c + Math.sin(a) * rInner} x2={x} y2={y} stroke={color} strokeWidth="0.5" opacity="0.4" />
              <circle cx={x} cy={y} r="9" fill="#07060b" stroke={color} strokeWidth="1.1" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
              <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="JetBrains Mono" fill="#f2edff">{p.glyph}</text>
            </g>
          );
        })}
        <circle cx={c} cy={c} r={c * 0.1} fill="#07060b" stroke="var(--accent)" strokeWidth="0.7" />
        <circle cx={c} cy={c} r={c * 0.04} fill="var(--accent)" opacity="0.7" />
      </svg>
      {hover && (
        <div style={{ position: "absolute", left: Math.min(hover.x + 12, size - 140), top: Math.max(hover.y - 8, 4), width: 130, padding: "7px 9px", pointerEvents: "none", background: "rgba(10,8,18,0.96)", border: `1px solid ${EL_COLOR[hover.p.el]}`, borderRadius: 7, zIndex: 40 }}>
          <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: EL_COLOR[hover.p.el] }}>{hover.p.glyph} {hover.p.planet.toUpperCase()}</div>
          <div style={{ fontSize: 10.5, color: "#f2edff", marginTop: 3 }}>{hover.p.sign} {hover.p.deg}°</div>
          <div style={{ fontSize: 9.5, color: "#b5adcc", marginTop: 2, textTransform: "uppercase" }}>{hover.p.el} · {hover.p.mod}</div>
        </div>
      )}
    </div>
  );
}

// ── PALATE RADAR — Spicy / Sweet / Bitter / Acidic / Umami ─────────────────────
interface PalateRadarProps {
  values: {
    spicy: number;
    sweet: number;
    umami: number;
    acidic: number;
    bitter: number;
  };
  size?: number;
}

export function PalateRadar({ values, size = 240 }: PalateRadarProps) {
  const axes = [
    { id: "spicy",  label: "SPICY",  v: values.spicy,  color: "var(--el-fire)" },
    { id: "sweet",  label: "SWEET",  v: values.sweet,  color: "var(--el-air)" },
    { id: "umami",  label: "UMAMI",  v: values.umami,  color: "var(--accent)" },
    { id: "acidic", label: "ACIDIC", v: values.acidic, color: "var(--el-water)" },
    { id: "bitter", label: "BITTER", v: values.bitter, color: "var(--el-earth)" },
  ];
  const c = size / 2;
  const R = c * 0.66;
  
  const pt = (i: number, f: number) => { 
    const a = (i / 5) * 2 * Math.PI - Math.PI / 2; 
    return [c + Math.cos(a) * R * f, c + Math.sin(a) * R * f]; 
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto select-none">
      {[0.25, 0.5, 0.75, 1].map((f, k) => (
        <polygon key={k} points={axes.map((_, i) => pt(i, f).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      ))}
      {axes.map((_, i) => { 
        const [x, y] = pt(i, 1); 
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />; 
      })}
      <polygon 
        points={axes.map((ax, i) => pt(i, ax.v).join(",")).join(" ")} 
        fill="color-mix(in oklch, var(--accent), transparent 80%)" 
        stroke="var(--accent)" 
        strokeWidth="1.4" 
        style={{ filter: "drop-shadow(0 0 6px color-mix(in oklch, var(--accent), transparent 55%))" }} 
      />
      {axes.map((ax, i) => { 
        const [x, y] = pt(i, ax.v); 
        return <circle key={i} cx={x} cy={y} r="3" fill={ax.color} stroke="#07060b" strokeWidth="1" />; 
      })}
      {axes.map((ax, i) => {
        const [x, y] = pt(i, 1.22);
        return (
          <text 
            key={i} 
            x={x} 
            y={y} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontSize="9" 
            fontFamily="JetBrains Mono" 
            fill="#b5adcc" 
            style={{ letterSpacing: "0.1em" }}
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── DAILY YIELD LEDGER — spirit/essence/matter/substance over time ─────────────
interface DailyYieldLedgerProps {
  width?: number;
  height?: number;
  series?: Array<{
    id: string;
    color: string;
    data: number[];
  }>;
}

export function DailyYieldLedger({ width = 720, height = 200, series: inputSeries }: DailyYieldLedgerProps) {
  const defaultSeries = [
    { id: "spirit",    color: "var(--el-air)",   data: [.32,.41,.38,.52,.48,.61,.55,.68,.64,.72,.7,.78,.74,.82] },
    { id: "essence",   color: "var(--el-water)", data: [.5,.55,.62,.58,.66,.7,.68,.74,.78,.76,.82,.8,.86,.84] },
    { id: "matter",    color: "var(--el-earth)", data: [.6,.58,.55,.5,.52,.48,.51,.46,.49,.44,.47,.43,.45,.42] },
    { id: "substance", color: "var(--el-fire)",  data: [.4,.44,.42,.48,.46,.5,.54,.52,.58,.56,.6,.62,.59,.64] },
  ];
  
  const series = inputSeries || defaultSeries;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const n = series[0]?.data.length || 14;
  
  const px = (i: number) => pad.l + (i / Math.max(1, n - 1)) * W;
  const py = (v: number) => pad.t + (1 - v) * H;

  return (
    <div className="select-none">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[0, 0.5, 1].map((g) => <line key={g} x1={pad.l} y1={py(g)} x2={width - pad.r} y2={py(g)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />)}
        {series.map((s) => {
          const path = s.data.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
          return (
            <g key={s.id}>
              <path d={`${path} L${px(n - 1)} ${py(0)} L${px(0)} ${py(0)} Z`} fill={s.color} opacity="0.06" />
              <path d={path} fill="none" stroke={s.color} strokeWidth="1.6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${s.color})` }} />
              <circle cx={px(n - 1)} cy={py(s.data[n - 1])} r="3" fill={s.color} />
            </g>
          );
        })}
        <line x1={px(n - 1)} y1={pad.t} x2={px(n - 1)} y2={py(0)} stroke="var(--accent)" strokeDasharray="2 3" strokeWidth="0.6" />
      </svg>
      <div className="flex justify-between mt-1">
        {["14d", "10d", "7d", "3d", "today"].map((l, i) => <span key={i} className="font-mono text-[9px] text-white/30">{l}</span>)}
      </div>
      <div className="flex gap-4 mt-3 flex-wrap">
        {series.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span style={{ width: 10, height: 2, background: s.color, boxShadow: `0 0 6px ${s.color}`, display: "inline-block" }} />
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">{s.id}</span>
            <span className="font-mono text-[11px] text-white font-black">{(s.data[n - 1] * 100).toFixed(0)}q</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── IMPLICIT LEARNING DASHBOARD ────────────────────────────────────────────────
interface LearningItem {
  agent: string;
  glyph: string;
  el: string;
  learned: string;
  conf: number;
  n: number;
}

interface ImplicitLearningProps {
  items?: LearningItem[];
}

export function ImplicitLearning({ items: inputItems }: ImplicitLearningProps) {
  const defaultItems = [
    { agent: "Galileo", glyph: "♄", el: "earth", learned: "prefers Earth-rich ingredients for dinner", conf: 0.91, n: 34 },
    { agent: "Monet",   glyph: "☽", el: "water", learned: "reaches for acid + ferment on lunar-hour evenings", conf: 0.84, n: 27 },
    { agent: "Monet",   glyph: "♀", el: "water", learned: "skips bitter botanicals before noon", conf: 0.77, n: 19 },
    { agent: "Galileo", glyph: "♂", el: "fire",  learned: "tolerates high spice only with dairy fat present", conf: 0.72, n: 15 },
  ];

  const items = inputItems || defaultItems;

  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => {
        const color = EL_COLOR[it.el] || "var(--accent)";
        return (
          <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-3.5 border border-white/5 bg-white/[0.01] rounded-xl">
            <div 
              className="width-8 height-8 rounded-full border border-white/10 flex items-center justify-center font-mono text-[13px] text-black/65 shrink-0" 
              style={{
                width: 30, height: 30,
                background: `radial-gradient(circle at 32% 28%, ${color}, color-mix(in oklch, ${color}, black 55%))`,
              }}
            >
              {it.glyph}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-white leading-normal">
                <span style={{ color }}>{it.agent}</span> learned: {it.learned}
              </div>
              <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-1">
                FROM {it.n} OBSERVATIONS · IMPLICIT
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[13px] text-[var(--accent)] font-black">{(it.conf * 100).toFixed(0)}%</div>
              <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest">CONF</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DIETARY PROTOCOL — tags + inline modifiers ─────────────────────────────────
export function DietaryProtocol() {
  const tags = [
    { k: "Pescatarian", mod: "strict" }, { k: "Gluten-free", mod: "strict" },
    { k: "Low-FODMAP", mod: "flexible" }, { k: "Soy-free", mod: "strict" },
    { k: "Spice", mod: "HIGH" }, { k: "Dairy", mod: "moderate" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t.k} className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/[0.02] text-white/70 flex items-center gap-1.5 font-mono">
          {t.k}
          <span 
            className="px-2 py-0.5 rounded-full text-[9px] font-bold border" 
            style={{ 
              background: t.mod === "strict" || t.mod === "HIGH" ? "color-mix(in oklch, var(--accent), transparent 78%)" : "rgba(255,255,255,0.05)", 
              color: t.mod === "strict" || t.mod === "HIGH" ? "var(--accent)" : "var(--fg-mute)", 
              borderColor: "var(--line)" 
            }}
          >
            {t.mod.toUpperCase()}
          </span>
        </span>
      ))}
    </div>
  );
}
