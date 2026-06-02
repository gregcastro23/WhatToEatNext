/* sigil.jsx — TASK 1: Consciousness Signature Visualizer
   ------------------------------------------------------------------------
   Turns agent.consciousness.signature (a plain DB string) into an interactive,
   generated alchemical seal. Three sacred-geometry modes (triangles / concentric
   / web), planetary nodes plotted at real natal degrees, hover tooltips reading
   spiritual resonance · entropy · elemental flow, animated draw-in paths.
   Props: { agent, size=440, style="triangles"|"concentric"|"web", motion=true }
   ======================================================================== */

// deterministic hash from the signature string → stable per-agent geometry
function sigHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

// equilateral triangle path. up=true points up; rot in degrees.
function triPath(cx, cy, r, up, rot = 0) {
  const pts = [0, 1, 2].map((i) => {
    const a = ((up ? -90 : 90) + i * 120 + rot) * Math.PI / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  return "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";
}
// horizontal bar across a triangle at vertical fraction f (0=top,1=bottom)
function triBar(cx, cy, r, up, f) {
  const top = cy + (up ? -r : r);
  const bot = cy + (up ? r * 0.5 : -r * 0.5);
  const y = top + (bot - top) * f;
  const halfW = (Math.abs(y - (cy + (up ? r * 0.5 : -r * 0.5))) / (1.5 * r)) * (Math.sqrt(3) * r);
  return { x1: cx - halfW / 2, x2: cx + halfW / 2, y };
}

function ConsciousnessSigil({ agent, size = 440, style = "triangles", motion = true }) {
  const c = size / 2;
  const [hover, setHover] = React.useState(null); // { x, y, title, lines, color }
  const h = sigHash(agent.signature);

  const els = [
    { id: "fire",  label: "FIRE · SPIRIT",    up: true,  v: agent.constitution.fire,  color: "var(--el-fire)",  bar: false },
    { id: "air",   label: "AIR · SUBSTANCE",  up: true,  v: agent.constitution.air,   color: "var(--el-air)",   bar: true  },
    { id: "water", label: "WATER · ESSENCE",  up: false, v: agent.constitution.water, color: "var(--el-water)", bar: false },
    { id: "earth", label: "EARTH · MATTER",   up: false, v: agent.constitution.earth, color: "var(--el-earth)", bar: true  },
  ];
  const modalities = [
    { id: "cardinal", label: "CARDINAL", rf: 0.40 },
    { id: "fixed",    label: "FIXED",    rf: 0.58 },
    { id: "mutable",  label: "MUTABLE",  rf: 0.76 },
  ];
  const planets = agent.natal.planets;
  const baseR = c * 0.82;

  // layer emphasis per style
  const em = {
    triangles:  { tri: 1,    ring: 0.35, web: 0.18, node: 0.7 },
    concentric: { tri: 0.28, ring: 1,    web: 0.2,  node: 0.85 },
    web:        { tri: 0.3,  ring: 0.4,  web: 1,    node: 1 },
  }[style] || { tri: 1, ring: 0.4, web: 0.3, node: 0.8 };

  const nodePos = (p, i) => {
    const a = (p.lon / 360) * 2 * Math.PI - Math.PI / 2;
    const rr = baseR * (0.5 + ((h >> (i * 3)) & 7) / 16); // signature jitter, stable
    return { x: c + Math.cos(a) * rr, y: c + Math.sin(a) * rr, a, rr };
  };
  const nodes = planets.map(nodePos);

  // web edges: connect node pairs whose angular separation ≈ a major aspect
  const edges = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let d = Math.abs(planets[i].lon - planets[j].lon) % 360; if (d > 180) d = 360 - d;
      const hit = [0, 60, 90, 120, 180].some((ang) => Math.abs(d - ang) <= 7);
      if (hit) edges.push([i, j, d]);
    }
  }

  const drawAnim = (delay, dur = 1.4) => motion
    ? { strokeDasharray: 1, strokeDashoffset: 1, animation: `sigilDraw ${dur}s cubic-bezier(.6,.05,.2,1) ${delay}s forwards` }
    : {};
  const show = (e, title, lines, color) => setHover({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, title, lines, color });
  const hide = () => setHover(null);

  return (
    <div style={{ position: "relative", width: size, height: size }} data-sigil>
      {/* slow counter-rotating field */}
      <div data-motion style={{
        position: "absolute", inset: 0,
        animation: motion ? "sigilSpin 120s linear infinite" : "none",
        transformOrigin: "50% 50%",
      }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="sig-core">
              <stop offset="0%" stopColor={EL_COLOR[agent.dominantEl]} stopOpacity="0.5" />
              <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx={c} cy={c} r={baseR} fill="url(#sig-core)" />
          {/* outer degree dial */}
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * 2 * Math.PI - Math.PI / 2;
            const big = i % 6 === 0;
            const r0 = c * 0.9, r1 = c * (big ? 0.95 : 0.93);
            return <line key={i} x1={c + Math.cos(a) * r0} y1={c + Math.sin(a) * r0} x2={c + Math.cos(a) * r1} y2={c + Math.sin(a) * r1}
              stroke="rgba(255,255,255,0.18)" strokeWidth={big ? 0.8 : 0.4} />;
          })}
        </svg>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        {/* ── MODALITY RINGS (concentric) ── */}
        {modalities.map((m, i) => {
          const r = baseR * m.rf;
          const circ = 2 * Math.PI * r;
          return (
            <circle key={m.id} cx={c} cy={c} r={r} fill="none"
              stroke={i === ["cardinal", "fixed", "mutable"].indexOf(agent.modality) ? "var(--accent)" : "rgba(255,255,255,0.16)"}
              strokeWidth={i === ["cardinal", "fixed", "mutable"].indexOf(agent.modality) ? 1.4 : 0.7}
              opacity={em.ring}
              style={{ ...drawAnim(0.2 + i * 0.25, 1.6), strokeDasharray: motion ? circ : undefined, strokeDashoffset: motion ? circ : undefined, animation: motion ? `sigilDraw 1.6s ease ${0.2 + i * 0.25}s forwards` : "none", cursor: "help" }}
              onMouseMove={(e) => show(e, m.label + " MODALITY", [
                `${m.id === agent.modality ? "DOMINANT — " : ""}orbital shell ${i + 1}/3`,
                m.id === "cardinal" ? "Initiating · the spark of a dish" : m.id === "fixed" ? "Sustaining · the long braise" : "Adapting · the improvised finish",
              ], "var(--accent)")} onMouseLeave={hide} />
          );
        })}

        {/* ── ELEMENT TRIANGLES (intersecting) ── */}
        {els.map((el, i) => {
          const r = baseR * (0.44 + el.v * 0.42);
          const active = el.id === agent.dominantEl;
          const bar = el.bar ? triBar(c, c, r, el.up, el.up ? 0.66 : 0.66) : null;
          return (
            <g key={el.id} opacity={em.tri} style={{ cursor: "help" }}
              onMouseMove={(e) => show(e, el.label, [
                `Elemental flow · ${(el.v * 100).toFixed(0)}%`,
                active ? "DOMINANT current — drives the signature" : "Supporting current",
                `Vertex angle locked to natal ${el.id} houses`,
              ], el.color)} onMouseLeave={hide}>
              <path d={triPath(c, c, r, el.up, 0)} fill="none" stroke={el.color}
                strokeWidth={active ? 1.8 : 1} opacity={active ? 0.95 : 0.5}
                pathLength="1" style={{ filter: active ? `drop-shadow(0 0 6px ${el.color})` : "none", ...drawAnim(0.6 + i * 0.18) }} />
              {bar && <line x1={bar.x1} y1={bar.y} x2={bar.x2} y2={bar.y} stroke={el.color} strokeWidth={active ? 1.6 : 0.9} opacity={active ? 0.9 : 0.45} pathLength="1" style={drawAnim(0.9 + i * 0.18, 0.9)} />}
            </g>
          );
        })}

        {/* ── ASPECT WEB ── */}
        <g opacity={em.web} stroke="var(--accent)" strokeWidth="0.6">
          {edges.map(([i, j], k) => (
            <line key={k} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y}
              opacity={0.55} pathLength="1" style={drawAnim(1.0 + k * 0.05, 0.8)} />
          ))}
        </g>

        {/* radial spokes to nodes */}
        <g opacity={em.web * 0.7} stroke="rgba(255,255,255,0.14)" strokeWidth="0.4">
          {nodes.map((n, i) => <line key={i} x1={c} y1={c} x2={n.x} y2={n.y} />)}
        </g>

        {/* ── PLANETARY NODES ── */}
        {planets.map((p, i) => {
          const n = nodes[i];
          const r = 4.5 + (style === "web" ? 2 : 0);
          return (
            <g key={p.planet} style={{ cursor: "help" }}
              onMouseMove={(e) => show(e, `${p.glyph} ${p.planet.toUpperCase()}`, [
                `${p.sign} ${p.deg}° · ${p.el} · ${p.mod}`,
                `Resonance node · entropy ${(((h >> i) & 15) / 15 * 0.4 + 0.1).toFixed(2)}`,
                `Generates the "${p.el}" facet of the signature`,
              ], EL_COLOR[p.el])} onMouseLeave={hide}>
              <circle cx={n.x} cy={n.y} r={r + 4} fill={EL_COLOR[p.el]} opacity={hover && hover.title.includes(p.planet) ? 0.22 : 0.1} />
              <circle cx={n.x} cy={n.y} r={r} fill="var(--bg)" stroke={EL_COLOR[p.el]} strokeWidth="1.2"
                opacity={em.node + 0.15} style={{ filter: `drop-shadow(0 0 5px ${EL_COLOR[p.el]})` }} />
              <text x={n.x} y={n.y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="JetBrains Mono" fill="var(--fg)">{p.glyph}</text>
            </g>
          );
        })}

        {/* ── CORE ── */}
        <circle cx={c} cy={c} r={baseR * 0.13} fill="var(--bg)" stroke="var(--accent)" strokeWidth="0.8" />
        {motion && <circle cx={c} cy={c} r={baseR * 0.18} fill="none" stroke={EL_COLOR[agent.dominantEl]} strokeWidth="0.6" data-motion style={{ transformOrigin: `${c}px ${c}px`, animation: "auraBreath 4s ease-in-out infinite" }} />}
        <text x={c} y={c - 4} textAnchor="middle" fontSize={baseR * 0.11} fontFamily="JetBrains Mono" fill="var(--accent)" style={{ letterSpacing: "0.08em" }}>{agent.dominantEl.slice(0, 3).toUpperCase()}</text>
        <text x={c} y={c + baseR * 0.09} textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="var(--fg-mute)">∇{(agent.entropy).toFixed(2)}</text>
      </svg>

      {/* corner readouts */}
      <div className="t-mono" style={{ position: "absolute", top: 6, left: 8, fontSize: 8.5, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>SIG · {agent.signature}</div>
      <div className="t-mono" style={{ position: "absolute", bottom: 6, right: 8, fontSize: 8.5, color: "var(--accent)", letterSpacing: "0.14em" }}>{style.toUpperCase()} · LOCK</div>

      {/* tooltip */}
      {hover && (
        <div style={{
          position: "absolute", left: Math.min(hover.x + 14, size - 168), top: Math.max(hover.y - 10, 6),
          width: 160, padding: "8px 10px", pointerEvents: "none", zIndex: 5,
          background: "rgba(10,8,18,0.96)", border: `1px solid ${hover.color}`, borderRadius: 8,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 18px 40px -18px ${hover.color}`,
        }}>
          <div className="t-mono" style={{ fontSize: 10, color: hover.color, letterSpacing: "0.12em", marginBottom: 5 }}>{hover.title}</div>
          {hover.lines.map((l, i) => (
            <div key={i} style={{ fontSize: 10.5, color: i === 0 ? "var(--fg)" : "var(--fg-dim)", lineHeight: 1.4, marginTop: i ? 3 : 0 }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ConsciousnessSigil, sigHash });
