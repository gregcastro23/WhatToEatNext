/* atoms.jsx — shared visual atoms for alchm.kitchen redesign */

// ============================================================
// GLYPH — abstract atomic / orbital marks (NOT cliché stars/moons)
// ============================================================
function Glyph({ name, size = 24, stroke = 1.2, className = "", style = {} }) {
  const s = size;
  const sw = stroke;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", className, style };
  switch (name) {
    case "orbital":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "atom":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(45 12 12)" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3" />
          <path d="M7 16h10" opacity="0.6" />
        </svg>
      );
    case "mortar":
      return (
        <svg {...common}>
          <path d="M4 10h16l-2 7a3 3 0 0 1-3 2.4H9a3 3 0 0 1-3-2.4L4 10z" />
          <path d="M14 4l3 4M14 4l-1 4" />
        </svg>
      );
    case "spiral":
      return (
        <svg {...common}>
          <path d="M12 12a4 4 0 1 1 8 0 8 8 0 1 1-16 0 12 12 0 1 1 24 0" />
        </svg>
      );
    case "ring":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <path d="M12 2L22 12L12 22L2 12Z" />
          <path d="M2 12h20M12 2v20" opacity="0.4" />
        </svg>
      );
    case "triangle-up":
      return (<svg {...common}><path d="M12 3 L22 20 H2 Z" /></svg>);
    case "triangle-down":
      return (<svg {...common}><path d="M12 21 L2 4 H22 Z" /></svg>);
    case "triangle-up-bar":
      return (<svg {...common}><path d="M12 5 L22 20 H2 Z" /><path d="M6 14h12" /></svg>);
    case "triangle-down-bar":
      return (<svg {...common}><path d="M12 19 L2 4 H22 Z" /><path d="M6 10h12" /></svg>);
    case "crosshair":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M2 12c2 0 2-4 5-4s3 8 5 8 3-8 5-8 3 4 5 4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 3h12v18l-6-4-6 4V3z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case "plus":
      return (<svg {...common}><path d="M12 4v16M4 12h16" /></svg>);
    case "minus":
      return (<svg {...common}><path d="M4 12h16" /></svg>);
    case "x":
      return (<svg {...common}><path d="M5 5l14 14M19 5L5 19" /></svg>);
    case "check":
      return (<svg {...common}><path d="M4 12l5 5 11-12" /></svg>);
    case "google":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" className={className} style={style}>
          <path fill="#EA4335" d="M12 11v3.2h5.4c-.2 1.4-1.7 4-5.4 4-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.5 12 2.5c-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.2 0-.6 0-1-.1-1.3H12z"/>
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.3-1.3L13.7 3h-3.4l-.6 2.4a7 7 0 0 0-2.3 1.3l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.3 1.3l.6 2.4h3.4l.6-2.4a7 7 0 0 0 2.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z" />
        </svg>
      );
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

// ============================================================
// PLANETARY CLOCK — astronomical, draggable, scientific
// ============================================================
function PlanetaryClock({ size = 360, rotation = 0, onRotate, motion = true, style = "orbital" }) {
  const c = size / 2;
  const planets = [
    { id: "Sol",      sym: "☉", r: size * 0.42, a: 0,    color: "var(--accent-2)", mass: 1.0 },
    { id: "Mercury",  sym: "☿", r: size * 0.34, a: 52,   color: "#C4B8A0", mass: 0.4 },
    { id: "Venus",    sym: "♀", r: size * 0.28, a: 110,  color: "#E8C9B5", mass: 0.7 },
    { id: "Luna",     sym: "☽", r: size * 0.22, a: 168,  color: "#D6CFE8", mass: 0.5 },
    { id: "Mars",     sym: "♂", r: size * 0.38, a: 215,  color: "var(--el-fire)", mass: 0.6 },
    { id: "Jupiter",  sym: "♃", r: size * 0.30, a: 262,  color: "#E8B870", mass: 0.9 },
    { id: "Saturn",   sym: "♄", r: size * 0.40, a: 308,  color: "#9B8FA8", mass: 0.5 },
  ];

  const ringRadii = [size * 0.20, size * 0.26, size * 0.32, size * 0.38, size * 0.44];

  return (
    <div className="planetary-clock" style={{ position: "relative", width: size, height: size }}>
      {/* outer ring labels */}
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="pc-glow">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <pattern id="pc-ticks" patternUnits="userSpaceOnUse" width="1" height="6">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* center glow */}
        <circle cx={c} cy={c} r={size * 0.45} fill="url(#pc-glow)" />

        {/* concentric rings */}
        {ringRadii.map((r, i) => (
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        ))}

        {/* primary degree ring (outer) */}
        <g transform={`rotate(${rotation} ${c} ${c})`}>
          <circle cx={c} cy={c} r={size * 0.48} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
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
          {/* cardinal labels */}
          {[0, 90, 180, 270].map((deg, i) => {
            const a = (deg / 360) * 2 * Math.PI - Math.PI / 2;
            const r = size * 0.54;
            const x = c + Math.cos(a) * r;
            const y = c + Math.sin(a) * r;
            return (
              <text key={i} x={x} y={y} fill="rgba(255,255,255,0.4)" fontSize={size * 0.024} fontFamily="JetBrains Mono" textAnchor="middle" dominantBaseline="middle">
                {String(deg).padStart(3, "0")}°
              </text>
            );
          })}
        </g>

        {/* zodiac wedges (subtle) */}
        <g opacity="0.18">
          {Array.from({ length: 12 }, (_, i) => {
            const a1 = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const a2 = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
            const r1 = size * 0.40;
            const r2 = size * 0.46;
            const x1 = c + Math.cos(a1) * r1, y1 = c + Math.sin(a1) * r1;
            const x2 = c + Math.cos(a1) * r2, y2 = c + Math.sin(a1) * r2;
            const x3 = c + Math.cos(a2) * r2, y3 = c + Math.sin(a2) * r2;
            const x4 = c + Math.cos(a2) * r1, y4 = c + Math.sin(a2) * r1;
            return (
              <path key={i} d={`M${x1} ${y1} L${x2} ${y2} A${r2} ${r2} 0 0 1 ${x3} ${y3} L${x4} ${y4} A${r1} ${r1} 0 0 0 ${x1} ${y1}Z`}
                    fill={i % 2 ? "rgba(255,255,255,0.04)" : "transparent"} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
            );
          })}
        </g>

        {/* planet orbits (elliptical for orbital style) */}
        {style === "orbital" && (
          <g>
            <ellipse cx={c} cy={c} rx={size * 0.42} ry={size * 0.42} fill="none" stroke="rgba(255,255,255,0.05)" />
            <ellipse cx={c} cy={c} rx={size * 0.42} ry={size * 0.24} fill="none" stroke="rgba(180,140,255,0.18)" strokeDasharray="2 4" transform={`rotate(${rotation * 0.2} ${c} ${c})`} />
            <ellipse cx={c} cy={c} rx={size * 0.34} ry={size * 0.30} fill="none" stroke="rgba(180,140,255,0.12)" strokeDasharray="2 4" transform={`rotate(${30 + rotation * 0.4} ${c} ${c})`} />
            <ellipse cx={c} cy={c} rx={size * 0.40} ry={size * 0.18} fill="none" stroke="rgba(255,180,90,0.18)" strokeDasharray="2 4" transform={`rotate(${75 - rotation * 0.3} ${c} ${c})`} />
          </g>
        )}

        {style === "constellation" && (
          <g stroke="rgba(180,140,255,0.25)" strokeWidth="0.5">
            {planets.map((p, i) => {
              const next = planets[(i + 1) % planets.length];
              const a1 = (p.a / 360) * 2 * Math.PI - Math.PI / 2;
              const a2 = (next.a / 360) * 2 * Math.PI - Math.PI / 2;
              return (
                <line key={i}
                  x1={c + Math.cos(a1) * p.r}
                  y1={c + Math.sin(a1) * p.r}
                  x2={c + Math.cos(a2) * next.r}
                  y2={c + Math.sin(a2) * next.r}
                />
              );
            })}
          </g>
        )}

        {/* core */}
        <circle cx={c} cy={c} r={size * 0.07} fill="var(--bg)" stroke="var(--accent)" strokeWidth="0.6" />
        <circle cx={c} cy={c} r={size * 0.035} fill="var(--accent)" opacity="0.7" />
        {motion && (
          <circle cx={c} cy={c} r={size * 0.10} fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.4" data-motion style={{ transformOrigin: `${c}px ${c}px`, animation: "breathe 4s ease-in-out infinite" }} />
        )}

        {/* coordinate readout cross */}
        <g stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          <line x1={c - size * 0.49} y1={c} x2={c - size * 0.20} y2={c} />
          <line x1={c + size * 0.20} y1={c} x2={c + size * 0.49} y2={c} />
          <line x1={c} y1={c - size * 0.49} x2={c} y2={c - size * 0.20} />
          <line x1={c} y1={c + size * 0.20} x2={c} y2={c + size * 0.49} />
        </g>
      </svg>

      {/* planets (positioned absolutely so they react to rotation) */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `rotate(${rotation}deg)` }}>
        {planets.map((p) => {
          const a = (p.a / 360) * 2 * Math.PI - Math.PI / 2;
          const x = c + Math.cos(a) * p.r;
          const y = c + Math.sin(a) * p.r;
          const ps = Math.max(18, size * 0.06 * (0.7 + p.mass * 0.6));
          const isActive = p.id === "Mars";
          return (
            <div key={p.id} style={{
              position: "absolute", left: x - ps / 2, top: y - ps / 2,
              transform: `rotate(${-rotation}deg)`,
            }}>
              <div style={{
                width: ps, height: ps, borderRadius: "50%",
                background: `radial-gradient(circle at 30% 30%, ${p.color}, ${p.color} 40%, color-mix(in oklch, ${p.color}, black 60%))`,
                boxShadow: isActive
                  ? `0 0 0 1.5px var(--accent), 0 0 24px color-mix(in oklch, var(--accent), transparent 40%), inset 0 0 8px rgba(0,0,0,0.4)`
                  : `0 0 0 1px rgba(255,255,255,0.18), inset 0 0 6px rgba(0,0,0,0.4)`,
                position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "JetBrains Mono", fontSize: ps * 0.42, color: "rgba(0,0,0,0.7)",
              }}>
                {p.sym}
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)",
                  fontFamily: "JetBrains Mono", fontSize: 9, letterSpacing: "0.1em",
                  color: isActive ? "var(--accent)" : "var(--fg-mute)",
                  whiteSpace: "nowrap", textTransform: "uppercase",
                }}>
                  {p.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* corner coordinates */}
      <div style={{ position: "absolute", top: 8, left: 8 }} className="t-mono" >
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>RA · {(rotation / 15).toFixed(2)}h</div>
      </div>
      <div style={{ position: "absolute", top: 8, right: 8, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>DEC · +40°42′</div>
      </div>
      <div style={{ position: "absolute", bottom: 8, left: 8 }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>JD · 2460814.71</div>
      </div>
      <div style={{ position: "absolute", bottom: 8, right: 8, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.14em" }}>HOUR · ♂ MARS</div>
      </div>
    </div>
  );
}

// ============================================================
// ELEMENTAL METER — Fire / Water / Earth / Air bars
// ============================================================
function ElementalMeter({ values = { fire: 0.62, water: 0.28, earth: 0.71, air: 0.45 }, compact = false, layout = "bars" }) {
  const els = [
    { id: "fire",  label: "FIRE",  v: values.fire,  color: "var(--el-fire)",  sym: "△" },
    { id: "water", label: "WATER", v: values.water, color: "var(--el-water)", sym: "▽" },
    { id: "earth", label: "EARTH", v: values.earth, color: "var(--el-earth)", sym: "▽\u0305" },
    { id: "air",   label: "AIR",   v: values.air,   color: "var(--el-air)",   sym: "△\u0305" },
  ];

  if (layout === "radial") {
    const size = compact ? 100 : 140;
    const c = size / 2;
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          {els.map((el, i) => {
            const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
            const r = c * 0.7 * el.v;
            const x = c + Math.cos(angle) * r;
            const y = c + Math.sin(angle) * r;
            return null;
          })}
          {/* axes */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
            return (
              <line key={i} x1={c} y1={c} x2={c + Math.cos(angle) * c * 0.85} y2={c + Math.sin(angle) * c * 0.85} stroke="rgba(255,255,255,0.08)" />
            );
          })}
          {/* rings */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle key={r} cx={c} cy={c} r={c * 0.85 * r} fill="none" stroke="rgba(255,255,255,0.05)" />
          ))}
          {/* polygon */}
          <polygon
            points={els.map((el, i) => {
              const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
              const r = c * 0.85 * el.v;
              return `${c + Math.cos(angle) * r},${c + Math.sin(angle) * r}`;
            }).join(" ")}
            fill="color-mix(in oklch, var(--accent), transparent 75%)"
            stroke="var(--accent)"
            strokeWidth="1"
          />
          {els.map((el, i) => {
            const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
            const r = c * 0.85 * el.v;
            return <circle key={el.id} cx={c + Math.cos(angle) * r} cy={c + Math.sin(angle) * r} r={2.5} fill={el.color} />;
          })}
        </svg>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 12, width: "100%" }}>
      {els.map((el) => (
        <div key={el.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`el-dot el-${el.id}`} />
              <span className="t-label" style={{ color: "var(--fg-dim)" }}>{el.label}</span>
            </div>
            <span className="t-num" style={{ fontSize: compact ? 11 : 13, color: "var(--fg)" }}>{(el.v * 100).toFixed(1)}<span style={{ color: "var(--fg-mute)" }}>%</span></span>
          </div>
          <div style={{ position: "relative", height: compact ? 4 : 6, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${el.v * 100}%`,
              background: `linear-gradient(90deg, ${el.color}, color-mix(in oklch, ${el.color}, transparent 30%))`,
              boxShadow: `0 0 12px ${el.color}`,
              borderRadius: 999,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// COMPATIBILITY RING — circular score
// ============================================================
function CompatibilityRing({ value = 0.87, size = 80, label = "MATCH" }) {
  const r = size / 2 - 6;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx={c} cy={c} r={r} fill="none"
          stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value)}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ filter: `drop-shadow(0 0 6px color-mix(in oklch, var(--accent), transparent 50%))` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="t-num" style={{ fontSize: size * 0.28, color: "var(--fg)" }}>{Math.round(value * 100)}</div>
        <div className="t-tag" style={{ fontSize: 8 }}>{label}</div>
      </div>
    </div>
  );
}

// ============================================================
// SPARKLINE — for energy/time graphs
// ============================================================
function Sparkline({ data, width = 140, height = 32, color = "var(--accent)", filled = true }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(" ");
  const fill = filled ? `${path} L${width} ${height} L0 ${height} Z` : null;
  return (
    <svg width={width} height={height}>
      {fill && <path d={fill} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {points.map((p, i) => i === points.length - 1 && <circle key={i} cx={p[0]} cy={p[1]} r="2" fill={color} />)}
    </svg>
  );
}

// ============================================================
// LIVE TIMECODE
// ============================================================
function LiveTimecode({ format = "JD" }) {
  const [t, setT] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (format === "JD") {
    // approximate Julian Day
    const jd = (t.getTime() / 86400000) + 2440587.5;
    return <span className="t-mono">JD {jd.toFixed(5)}</span>;
  }
  return <span className="t-mono">{t.toISOString().split("T")[1].slice(0, 8)} UTC</span>;
}

// ============================================================
// SCAN LINE OVERLAY
// ============================================================
function ScanLine() {
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      borderRadius: "inherit",
    }}>
      <div data-motion style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, color-mix(in oklch, var(--accent), transparent 40%), transparent)",
        animation: "scanLine 6s linear infinite",
        opacity: 0.5,
      }} />
    </div>
  );
}

// Export to window
Object.assign(window, { Glyph, PlanetaryClock, ElementalMeter, CompatibilityRing, Sparkline, LiveTimecode, ScanLine });
