"use client";

import React, { useState } from "react";

// Deterministic hash from the signature string → stable per-agent geometry
export function sigHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Equilateral triangle path. up=true points up; rot in degrees.
function triPath(cx: number, cy: number, r: number, up: boolean, rot = 0) {
  const pts = [0, 1, 2].map((i) => {
    const a = (((up ? -90 : 90) + i * 120 + rot) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  return `M${  pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")  } Z`;
}

// Horizontal bar across a triangle at vertical fraction f (0=top, 1=bottom)
function triBar(cx: number, cy: number, r: number, up: boolean, f: number) {
  const top = cy + (up ? -r : r);
  const bot = cy + (up ? r * 0.5 : -r * 0.5);
  const y = top + (bot - top) * f;
  const halfW = (Math.abs(y - (cy + (up ? r * 0.5 : -r * 0.5))) / (1.5 * r)) * (Math.sqrt(3) * r);
  return { x1: cx - halfW / 2, x2: cx + halfW / 2, y };
}

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
];

const SIGN_TO_ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Planets: "☉", Ascendant: "ASC", MC: "MC"
};

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
  el: "fire" | "water" | "earth" | "air";
  mod: string;
}

interface SigilHoverInfo {
  x: number;
  y: number;
  title: string;
  lines: string[];
  color: string;
}

interface ConsciousnessSigilProps {
  agent: {
    signature?: string | null;
    entropy?: number;
    dominantEl?: string | null;
    modality?: string | null;
    constitution?: {
      fire: number;
      water: number;
      earth: number;
      air: number;
    } | null;
    natal?: {
      planets: Array<{
        planet: string;
        lon: number;
        sign: string;
        glyph: string;
        deg: number;
        el: string;
        mod: string;
      }>;
    } | null;
    consciousness?: {
      signature?: string;
      dominantElement?: string;
      dominantModality?: string;
      level?: string;
      strength?: string;
      emotion?: string;
      alchemicalElements?: {
        spirit: number;
        essence: number;
        matter: number;
        substance: number;
      };
      natalChart?: {
        planets: Record<string, {
          sign: string;
          degree: number;
          retrograde?: boolean;
          house?: number | string;
        }>;
      };
    } | null;
  };
  size?: number;
  style?: "triangles" | "concentric" | "web";
  motion?: boolean;
}

export function ConsciousnessSigil({
  agent,
  size = 440,
  style = "triangles",
  motion = true,
}: ConsciousnessSigilProps) {
  const c = size / 2;
  const [hover, setHover] = useState<SigilHoverInfo | null>(null);

  // Normalize inputs across mock data and real DB formats
  const signature = agent.signature || agent.consciousness?.signature || "ALCH·KTC·0000·∇0·BAL";
  const entropy = typeof agent.entropy === "number" ? agent.entropy : 0.35;
  
  const rawDominant = agent.dominantEl || agent.consciousness?.dominantElement || "air";
  const dominantEl = (rawDominant.toLowerCase() as "fire" | "water" | "earth" | "air");

  const rawModality = agent.modality || agent.consciousness?.dominantModality || "fixed";
  const modality = (rawModality.toLowerCase() as "cardinal" | "fixed" | "mutable");

  const h = sigHash(signature);

  // This sigil visualizes the ELEMENTAL constitution (Fire/Water/Earth/Air).
  // It must NOT fall back to the ESMS quantities (spirit/essence/…): quantities
  // and elements are orthogonal readings — see CONTEXT.md — so substituting a
  // quantity for an element renders one axis as the other. When the elemental
  // breakdown is absent, show a neutral quarter rather than a mislabelled value.
  const constFire = agent.constitution?.fire ?? 0.25;
  const constWater = agent.constitution?.water ?? 0.25;
  const constEarth = agent.constitution?.earth ?? 0.25;
  const constAir = agent.constitution?.air ?? 0.25;

  const els = [
    { id: "fire",  label: "FIRE",   up: true,  v: constFire,  color: "var(--el-fire)",  bar: false },
    { id: "air",   label: "AIR",    up: true,  v: constAir,   color: "var(--el-air)",   bar: true  },
    { id: "water", label: "WATER",  up: false, v: constWater, color: "var(--el-water)", bar: false },
    { id: "earth", label: "EARTH",  up: false, v: constEarth, color: "var(--el-earth)", bar: true  },
  ];

  const modalities = [
    { id: "cardinal", label: "CARDINAL", rf: 0.40 },
    { id: "fixed",    label: "FIXED",    rf: 0.58 },
    { id: "mutable",  label: "MUTABLE",  rf: 0.76 },
  ];

  // Resolve natal planets array
  let planets: PlanetPoint[] = [];
  if (agent.natal?.planets) {
    planets = agent.natal.planets.map(p => ({
      ...p,
      el: (p.el.toLowerCase() as "fire" | "water" | "earth" | "air")
    }));
  } else if (agent.consciousness?.natalChart?.planets) {
    const rawPlanets = agent.consciousness.natalChart.planets;
    planets = Object.entries(rawPlanets).map(([name, val]) => {
      const signLower = val.sign.toLowerCase();
      const signIndex = ZODIAC_SIGNS.indexOf(signLower);
      const signIdx = signIndex >= 0 ? signIndex : 0;
      const lon = (signIdx * 30 + val.degree) % 360;
      const el = SIGN_TO_ELEMENT[signLower] || "fire";
      const mod = (signLower === "aries" || signLower === "cancer" || signLower === "libra" || signLower === "capricorn")
        ? "cardinal"
        : (signLower === "taurus" || signLower === "leo" || signLower === "scorpio" || signLower === "aquarius")
          ? "fixed"
          : "mutable";

      return {
        planet: name,
        lon,
        sign: val.sign,
        glyph: PLANET_GLYPH[name] || "✦",
        deg: Math.round(val.degree),
        el,
        mod,
      };
    });
  }

  const baseR = c * 0.82;

  // Layer emphasis per style
  const em = {
    triangles:  { tri: 1,    ring: 0.35, web: 0.18, node: 0.7 },
    concentric: { tri: 0.28, ring: 1,    web: 0.2,  node: 0.85 },
    web:        { tri: 0.3,  ring: 0.4,  web: 1,    node: 1 },
  }[style] || { tri: 1, ring: 0.4, web: 0.3, node: 0.8 };

  const nodePos = (p: PlanetPoint, i: number) => {
    const a = (p.lon / 360) * 2 * Math.PI - Math.PI / 2;
    const rr = baseR * (0.5 + ((h >> (i * 3)) & 7) / 16); // signature jitter, stable
    return { x: c + Math.cos(a) * rr, y: c + Math.sin(a) * rr, a, rr };
  };
  const nodes = planets.map(nodePos);

  // Web edges: connect node pairs whose angular separation ≈ a major aspect
  const edges: Array<[number, number, number]> = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let d = Math.abs(planets[i].lon - planets[j].lon) % 360;
      if (d > 180) d = 360 - d;
      const hit = [0, 60, 90, 120, 180].some((ang) => Math.abs(d - ang) <= 7);
      if (hit) edges.push([i, j, d]);
    }
  }

  const drawAnim = (delay: number, dur = 1.4) =>
    motion
      ? {
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: `sigilDraw ${dur}s cubic-bezier(.6,.05,.2,1) ${delay}s forwards`,
        }
      : {};

  const show = (e: React.MouseEvent, title: string, lines: string[], color: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHover({ x, y, title, lines, color });
  };
  const hide = () => setHover(null);

  const activeColor = EL_COLOR[dominantEl] || "var(--accent)";

  return (
    <div style={{ position: "relative", width: size, height: size }} className="select-none">
      {/* slow counter-rotating field */}
      <div
        className={motion ? "animate-slow-spin" : ""}
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 50%",
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="sig-core">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.4" />
              <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx={c} cy={c} r={baseR} fill="url(#sig-core)" />
          {/* outer degree dial */}
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * 2 * Math.PI - Math.PI / 2;
            const big = i % 6 === 0;
            const r0 = c * 0.9;
            const r1 = c * (big ? 0.95 : 0.93);
            return (
              <line
                key={i}
                x1={c + Math.cos(a) * r0}
                y1={c + Math.sin(a) * r0}
                x2={c + Math.cos(a) * r1}
                y2={c + Math.sin(a) * r1}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={big ? 0.8 : 0.4}
              />
            );
          })}
        </svg>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        {/* ── MODALITY RINGS (concentric) ── */}
        {modalities.map((m, i) => {
          const r = baseR * m.rf;
          const circ = 2 * Math.PI * r;
          const isActiveMod = m.id === modality;
          return (
            <circle
              key={m.id}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={isActiveMod ? "var(--accent)" : "rgba(255,255,255,0.16)"}
              strokeWidth={isActiveMod ? 1.4 : 0.7}
              opacity={em.ring}
              className={motion ? "transition-all duration-300" : ""}
              style={{
                ...drawAnim(0.2 + i * 0.25, 1.6),
                strokeDasharray: circ,
                strokeDashoffset: motion ? circ : 0,
                cursor: "help",
              }}
              onMouseMove={(e) =>
                show(
                  e,
                  `${m.label  } MODALITY`,
                  [
                    `${isActiveMod ? "DOMINANT — " : ""}orbital shell ${i + 1}/3`,
                    m.id === "cardinal"
                      ? "Initiating · the spark of a dish"
                      : m.id === "fixed"
                        ? "Sustaining · the long braise"
                        : "Adapting · the improvised finish",
                  ],
                  "var(--accent)"
                )
              }
              onMouseLeave={hide}
            />
          );
        })}

        {/* ── ELEMENT TRIANGLES (intersecting) ── */}
        {els.map((el, i) => {
          const r = baseR * (0.44 + el.v * 0.42);
          const active = el.id === dominantEl;
          const bar = el.bar ? triBar(c, c, r, el.up, 0.66) : null;
          return (
            <g
              key={el.id}
              opacity={em.tri}
              style={{ cursor: "help" }}
              onMouseMove={(e) =>
                show(
                  e,
                  el.label,
                  [
                    `Elemental flow · ${(el.v * 100).toFixed(0)}%`,
                    active ? "DOMINANT current — drives the signature" : "Supporting current",
                    `Vertex angle locked to natal ${el.id} houses`,
                  ],
                  el.color
                )
              }
              onMouseLeave={hide}
            >
              <path
                d={triPath(c, c, r, el.up, 0)}
                fill="none"
                stroke={el.color}
                strokeWidth={active ? 1.8 : 1}
                opacity={active ? 0.95 : 0.5}
                style={{
                  filter: active ? `drop-shadow(0 0 6px ${el.color})` : "none",
                  ...drawAnim(0.6 + i * 0.18),
                }}
              />
              {bar && (
                <line
                  x1={bar.x1}
                  y1={bar.y}
                  x2={bar.x2}
                  y2={bar.y}
                  stroke={el.color}
                  strokeWidth={active ? 1.6 : 0.9}
                  opacity={active ? 0.9 : 0.45}
                  style={drawAnim(0.9 + i * 0.18, 0.9)}
                />
              )}
            </g>
          );
        })}

        {/* ── ASPECT WEB ── */}
        <g opacity={em.web} stroke="var(--accent)" strokeWidth="0.6">
          {edges.map(([i, j], k) => (
            <line
              key={k}
              x1={nodes[i].x}
              y1={nodes[i].y}
              x2={nodes[j].x}
              y2={nodes[j].y}
              opacity={0.55}
              style={drawAnim(1.0 + k * 0.05, 0.8)}
            />
          ))}
        </g>

        {/* radial spokes to nodes */}
        <g opacity={em.web * 0.7} stroke="rgba(255,255,255,0.14)" strokeWidth="0.4">
          {nodes.map((n, i) => (
            <line key={i} x1={c} y1={c} x2={n.x} y2={n.y} />
          ))}
        </g>

        {/* ── PLANETARY NODES ── */}
        {planets.map((p, i) => {
          const n = nodes[i];
          if (!n) return null;
          const r = 4.5 + (style === "web" ? 2 : 0);
          const color = EL_COLOR[p.el] || "var(--accent)";
          return (
            <g
              key={p.planet}
              style={{ cursor: "help" }}
              onMouseMove={(e) =>
                show(
                  e,
                  `${p.glyph} ${p.planet.toUpperCase()}`,
                  [
                    `${p.sign} ${p.deg}° · ${p.el.toUpperCase()} · ${p.mod.toUpperCase()}`,
                    `Resonance node · entropy ${(((h >> i) & 15) / 15 * 0.4 + 0.1).toFixed(2)}`,
                    `Generates the "${p.el}" facet of the signature`,
                  ],
                  color
                )
              }
              onMouseLeave={hide}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={r + 4}
                fill={color}
                opacity={hover && hover.title.includes(p.planet) ? 0.22 : 0.1}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill="#07060b"
                stroke={color}
                strokeWidth="1.2"
                opacity={em.node + 0.15}
                style={{ filter: `drop-shadow(0 0 5px ${color})` }}
              />
              <text
                x={n.x}
                y={n.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fill="#f2edff"
              >
                {p.glyph}
              </text>
            </g>
          );
        })}

        {/* ── CORE ── */}
        <circle cx={c} cy={c} r={baseR * 0.13} fill="#07060b" stroke="var(--accent)" strokeWidth="0.8" />
        {motion && (
          <circle
            cx={c}
            cy={c}
            r={baseR * 0.18}
            fill="none"
            stroke={EL_COLOR[dominantEl]}
            strokeWidth="0.6"
            style={{
              transformOrigin: `${c}px ${c}px`,
              animation: "auraBreath 4s ease-in-out infinite",
            }}
          />
        )}
        <text
          x={c}
          y={c - 4}
          textAnchor="middle"
          fontSize={baseR * 0.11}
          fontFamily="JetBrains Mono"
          fill="var(--accent)"
          style={{ letterSpacing: "0.08em" }}
        >
          {dominantEl.slice(0, 3).toUpperCase()}
        </text>
        <text
          x={c}
          y={c + baseR * 0.09}
          textAnchor="middle"
          fontSize="8"
          fontFamily="JetBrains Mono"
          fill="var(--fg-mute)"
        >
          ∇{entropy.toFixed(2)}
        </text>
      </svg>

      {/* corner readouts */}
      <div
        className="font-mono text-white/30"
        style={{
          position: "absolute",
          top: 6,
          left: 8,
          fontSize: 8.5,
          letterSpacing: "0.14em",
        }}
      >
        SIG · {signature}
      </div>
      <div
        className="font-mono text-[var(--accent)]"
        style={{
          position: "absolute",
          bottom: 6,
          right: 8,
          fontSize: 8.5,
          letterSpacing: "0.14em",
        }}
      >
        {style.toUpperCase()} · LOCK
      </div>

      {/* tooltip */}
      {hover && (
        <div
          style={{
            position: "absolute",
            left: Math.min(hover.x + 14, size - 168),
            top: Math.max(hover.y - 10, 6),
            width: 160,
            padding: "8px 10px",
            pointerEvents: "none",
            zIndex: 50,
            background: "rgba(10,8,18,0.96)",
            border: `1px solid ${hover.color}`,
            borderRadius: 8,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 18px 40px -18px ${hover.color}`,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 10,
              color: hover.color,
              letterSpacing: "0.12em",
              marginBottom: 5,
            }}
          >
            {hover.title}
          </div>
          {hover.lines.map((l, i) => (
            <div
              key={i}
              style={{
                fontSize: 10.5,
                color: i === 0 ? "#f2edff" : "#b5adcc",
                lineHeight: 1.4,
                marginTop: i ? 3 : 0,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
