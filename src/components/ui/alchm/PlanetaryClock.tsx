"use client";

import type { CSSProperties, JSX } from "react";

export type PlanetaryClockStyle = "orbital" | "radial" | "constellation";

export interface PlanetaryPosition {
  id: string;
  sym: string;
  /** Orbital radius as a fraction of `size`, 0–0.5 */
  rFrac: number;
  /** Angle in degrees, 0 = 12 o'clock */
  a: number;
  /** Body color (any CSS color or var) */
  color: string;
  /** Relative mass for body diameter scaling (0–1) */
  mass: number;
}

export interface PlanetaryClockProps {
  size?: number;
  rotation?: number;
  motion?: boolean;
  style?: PlanetaryClockStyle;
  data?: PlanetaryPosition[];
  activeId?: string;
  hourLabel?: string;
  raLabel?: string;
  decLabel?: string;
  jdLabel?: string;
}

const DEFAULT_PLANETS: PlanetaryPosition[] = [
  { id: "Sol", sym: "☉", rFrac: 0.42, a: 0, color: "var(--accent-2)", mass: 1.0 },
  { id: "Mercury", sym: "☿", rFrac: 0.34, a: 52, color: "#C4B8A0", mass: 0.4 },
  { id: "Venus", sym: "♀", rFrac: 0.28, a: 110, color: "#E8C9B5", mass: 0.7 },
  { id: "Luna", sym: "☽", rFrac: 0.22, a: 168, color: "#D6CFE8", mass: 0.5 },
  { id: "Mars", sym: "♂", rFrac: 0.38, a: 215, color: "var(--el-fire)", mass: 0.6 },
  { id: "Jupiter", sym: "♃", rFrac: 0.30, a: 262, color: "#E8B870", mass: 0.9 },
  { id: "Saturn", sym: "♄", rFrac: 0.40, a: 308, color: "#9B8FA8", mass: 0.5 },
];

export function PlanetaryClock({
  size = 360,
  rotation = 0,
  motion = true,
  style = "orbital",
  data,
  activeId = "Mars",
  hourLabel,
  raLabel,
  decLabel = "DEC · +40°42′",
  jdLabel = "JD · 2460814.71",
}: PlanetaryClockProps): JSX.Element {
  const c = size / 2;
  const planets = data ?? DEFAULT_PLANETS;
  const ringRadii = [size * 0.20, size * 0.26, size * 0.32, size * 0.38, size * 0.44];
  const ra = raLabel ?? `RA · ${(rotation / 15).toFixed(2)}h`;
  const active = planets.find((p) => p.id === activeId);
  const hour = hourLabel ?? (active ? `HOUR · ${active.sym} ${active.id.toUpperCase()}` : "HOUR · —");

  return (
    <div className="planetary-clock" style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <radialGradient id="pc-glow">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <circle cx={c} cy={c} r={size * 0.45} fill="url(#pc-glow)" />

        {ringRadii.map((r, i) => (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        ))}

        <g transform={`rotate(${rotation} ${c} ${c})`}>
          <circle
            cx={c}
            cy={c}
            r={size * 0.48}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.7"
          />
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * 2 * Math.PI - Math.PI / 2;
            const inner = size * 0.46;
            const outer = size * 0.49;
            const big = i % 6 === 0;
            return (
              <line
                key={i}
                x1={c + Math.cos(a) * inner}
                y1={c + Math.sin(a) * inner}
                x2={c + Math.cos(a) * (big ? size * 0.50 : outer)}
                y2={c + Math.sin(a) * (big ? size * 0.50 : outer)}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={big ? 0.9 : 0.5}
              />
            );
          })}
          {[0, 90, 180, 270].map((deg, i) => {
            const a = (deg / 360) * 2 * Math.PI - Math.PI / 2;
            const r = size * 0.54;
            const x = c + Math.cos(a) * r;
            const y = c + Math.sin(a) * r;
            return (
              <text
                key={i}
                x={x}
                y={y}
                fill="rgba(255,255,255,0.4)"
                fontSize={size * 0.024}
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {String(deg).padStart(3, "0")}°
              </text>
            );
          })}
        </g>

        <g opacity="0.18">
          {Array.from({ length: 12 }, (_, i) => {
            const a1 = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const a2 = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
            const r1 = size * 0.40;
            const r2 = size * 0.46;
            const x1 = c + Math.cos(a1) * r1;
            const y1 = c + Math.sin(a1) * r1;
            const x2 = c + Math.cos(a1) * r2;
            const y2 = c + Math.sin(a1) * r2;
            const x3 = c + Math.cos(a2) * r2;
            const y3 = c + Math.sin(a2) * r2;
            const x4 = c + Math.cos(a2) * r1;
            const y4 = c + Math.sin(a2) * r1;
            return (
              <path
                key={i}
                d={`M${x1} ${y1} L${x2} ${y2} A${r2} ${r2} 0 0 1 ${x3} ${y3} L${x4} ${y4} A${r1} ${r1} 0 0 0 ${x1} ${y1}Z`}
                fill={i % 2 ? "rgba(255,255,255,0.04)" : "transparent"}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.4"
              />
            );
          })}
        </g>

        {style === "orbital" && (
          <g>
            <ellipse cx={c} cy={c} rx={size * 0.42} ry={size * 0.42} fill="none" stroke="rgba(255,255,255,0.05)" />
            <ellipse
              cx={c}
              cy={c}
              rx={size * 0.42}
              ry={size * 0.24}
              fill="none"
              stroke="rgba(180,140,255,0.18)"
              strokeDasharray="2 4"
              transform={`rotate(${rotation * 0.2} ${c} ${c})`}
            />
            <ellipse
              cx={c}
              cy={c}
              rx={size * 0.34}
              ry={size * 0.30}
              fill="none"
              stroke="rgba(180,140,255,0.12)"
              strokeDasharray="2 4"
              transform={`rotate(${30 + rotation * 0.4} ${c} ${c})`}
            />
            <ellipse
              cx={c}
              cy={c}
              rx={size * 0.40}
              ry={size * 0.18}
              fill="none"
              stroke="rgba(255,180,90,0.18)"
              strokeDasharray="2 4"
              transform={`rotate(${75 - rotation * 0.3} ${c} ${c})`}
            />
          </g>
        )}

        {style === "constellation" && (
          <g stroke="rgba(180,140,255,0.25)" strokeWidth="0.5">
            {planets.map((p, i) => {
              const next = planets[(i + 1) % planets.length];
              const a1 = (p.a / 360) * 2 * Math.PI - Math.PI / 2;
              const a2 = (next.a / 360) * 2 * Math.PI - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1={c + Math.cos(a1) * (p.rFrac * size)}
                  y1={c + Math.sin(a1) * (p.rFrac * size)}
                  x2={c + Math.cos(a2) * (next.rFrac * size)}
                  y2={c + Math.sin(a2) * (next.rFrac * size)}
                />
              );
            })}
          </g>
        )}

        <circle cx={c} cy={c} r={size * 0.07} fill="var(--bg)" stroke="var(--accent)" strokeWidth="0.6" />
        <circle cx={c} cy={c} r={size * 0.035} fill="var(--accent)" opacity="0.7" />
        {motion && (
          <circle
            cx={c}
            cy={c}
            r={size * 0.10}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.5"
            opacity="0.4"
            data-motion
            style={{
              transformOrigin: `${c}px ${c}px`,
              animation: "alchm-breathe 4s ease-in-out infinite",
            }}
          />
        )}

        <g stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          <line x1={c - size * 0.49} y1={c} x2={c - size * 0.20} y2={c} />
          <line x1={c + size * 0.20} y1={c} x2={c + size * 0.49} y2={c} />
          <line x1={c} y1={c - size * 0.49} x2={c} y2={c - size * 0.20} />
          <line x1={c} y1={c + size * 0.20} x2={c} y2={c + size * 0.49} />
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 50%",
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {planets.map((p) => {
          const a = (p.a / 360) * 2 * Math.PI - Math.PI / 2;
          const r = p.rFrac * size;
          const x = c + Math.cos(a) * r;
          const y = c + Math.sin(a) * r;
          const ps = Math.max(18, size * 0.06 * (0.7 + p.mass * 0.6));
          const isActive = p.id === activeId;
          const wrapperStyle: CSSProperties = {
            position: "absolute",
            left: x - ps / 2,
            top: y - ps / 2,
            transform: `rotate(${-rotation}deg)`,
          };
          const bodyStyle: CSSProperties = {
            width: ps,
            height: ps,
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, ${p.color}, ${p.color} 40%, color-mix(in oklch, ${p.color}, black 60%))`,
            boxShadow: isActive
              ? `0 0 0 1.5px var(--accent), 0 0 24px color-mix(in oklch, var(--accent), transparent 40%), inset 0 0 8px rgba(0,0,0,0.4)`
              : `0 0 0 1px rgba(255,255,255,0.18), inset 0 0 6px rgba(0,0,0,0.4)`,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "JetBrains Mono",
            fontSize: ps * 0.42,
            color: "rgba(0,0,0,0.7)",
          };
          const labelStyle: CSSProperties = {
            position: "absolute",
            top: "calc(100% + 4px)",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "JetBrains Mono",
            fontSize: 9,
            letterSpacing: "0.1em",
            color: isActive ? "var(--accent)" : "var(--fg-mute)",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          };
          return (
            <div key={p.id} style={wrapperStyle}>
              <div style={bodyStyle}>
                {p.sym}
                <div style={labelStyle}>{p.id}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", top: 8, left: 8 }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>{ra}</div>
      </div>
      <div style={{ position: "absolute", top: 8, right: 8, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>{decLabel}</div>
      </div>
      <div style={{ position: "absolute", bottom: 8, left: 8 }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>{jdLabel}</div>
      </div>
      <div style={{ position: "absolute", bottom: 8, right: 8, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.14em" }}>{hour}</div>
      </div>
    </div>
  );
}

export default PlanetaryClock;
