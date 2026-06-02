/* screens-profile-user.jsx — TASK 4: Premium User Profile Ledger
   Essence (natal wheel) · Palate (radar + dietary protocol) · Practice (yield
   ledger + implicit-learning dashboard). Maps to:
   src/components/profile/ProfileBlockRegistry.tsx  (one block per tab)
   ======================================================================== */

// ── NATAL WHEEL — 12-sector zodiac wheel w/ planet placements ──────────────────
function NatalWheel({ planets, size = 380, motion = true, dominantEl = "air" }) {
  const c = size / 2;
  const rOuter = c * 0.92, rSign = c * 0.81, rInner = c * 0.66, rPlanet = c * 0.55;
  const [hover, setHover] = React.useState(null);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="nw-glow"><stop offset="0%" stopColor={EL_COLOR[dominantEl]} stopOpacity="0.28" /><stop offset="70%" stopColor="transparent" /></radialGradient>
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
              <line x1={c + Math.cos(a0) * rInner} y1={c + Math.sin(a0) * rInner} x2={c + Math.cos(a0) * rOuter} y2={c + Math.sin(a0) * rOuter} stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
              <text x={c + Math.cos(aM) * rSign} y={c + Math.sin(aM) * rSign} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontFamily="JetBrains Mono" fill={EL_COLOR[s.el]} opacity="0.85">{s.glyph}</text>
            </g>
          );
        })}

        {/* degree ticks */}
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * 2 * Math.PI - Math.PI / 2;
          const big = i % 6 === 0;
          return <line key={i} x1={c + Math.cos(a) * (rInner - (big ? 6 : 3))} y1={c + Math.sin(a) * (rInner - (big ? 6 : 3))} x2={c + Math.cos(a) * rInner} y2={c + Math.sin(a) * rInner} stroke="rgba(255,255,255,0.16)" strokeWidth={big ? 0.7 : 0.4} />;
        })}

        {/* aspect lines between planets */}
        <g stroke="var(--accent)" strokeWidth="0.5" opacity="0.32">
          {planets.map((p, i) => planets.slice(i + 1).map((q, j) => {
            let d = Math.abs(p.lon - q.lon) % 360; if (d > 180) d = 360 - d;
            if (![0, 60, 90, 120, 180].some(ang => Math.abs(d - ang) <= 6)) return null;
            const ap = (p.lon / 360) * 2 * Math.PI - Math.PI / 2, aq = (q.lon / 360) * 2 * Math.PI - Math.PI / 2;
            return <line key={`${i}-${j}`} x1={c + Math.cos(ap) * rPlanet} y1={c + Math.sin(ap) * rPlanet} x2={c + Math.cos(aq) * rPlanet} y2={c + Math.sin(aq) * rPlanet} />;
          }))}
        </g>

        {/* planets */}
        {planets.map((p, i) => {
          const a = (p.lon / 360) * 2 * Math.PI - Math.PI / 2;
          const rr = rPlanet * (0.86 + (i % 3) * 0.07);
          const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr;
          return (
            <g key={p.planet} style={{ cursor: "help" }} onMouseMove={(e) => setHover({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, p })} onMouseLeave={() => setHover(null)}>
              <line x1={c + Math.cos(a) * rInner} y1={c + Math.sin(a) * rInner} x2={x} y2={y} stroke={EL_COLOR[p.el]} strokeWidth="0.5" opacity="0.4" />
              <circle cx={x} cy={y} r="9" fill="var(--bg)" stroke={EL_COLOR[p.el]} strokeWidth="1.1" style={{ filter: `drop-shadow(0 0 5px ${EL_COLOR[p.el]})` }} />
              <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="JetBrains Mono" fill="var(--fg)">{p.glyph}</text>
            </g>
          );
        })}
        <circle cx={c} cy={c} r={c * 0.1} fill="var(--bg)" stroke="var(--accent)" strokeWidth="0.7" />
        <circle cx={c} cy={c} r={c * 0.04} fill="var(--accent)" opacity="0.7" />
      </svg>
      {hover && (
        <div style={{ position: "absolute", left: Math.min(hover.x + 12, size - 140), top: Math.max(hover.y - 8, 4), width: 130, padding: "7px 9px", pointerEvents: "none", background: "rgba(10,8,18,0.96)", border: `1px solid ${EL_COLOR[hover.p.el]}`, borderRadius: 7, zIndex: 4 }}>
          <div className="t-mono" style={{ fontSize: 10, color: EL_COLOR[hover.p.el], letterSpacing: "0.1em" }}>{hover.p.glyph} {hover.p.planet.toUpperCase()}</div>
          <div style={{ fontSize: 10.5, color: "var(--fg)", marginTop: 3 }}>{hover.p.sign} {hover.p.deg}°</div>
          <div style={{ fontSize: 9.5, color: "var(--fg-mute)", marginTop: 2, textTransform: "uppercase" }}>{hover.p.el} · {hover.p.mod}</div>
        </div>
      )}
    </div>
  );
}

// ── PALATE RADAR — Spicy / Sweet / Bitter / Acidic / Umami ─────────────────────
function PalateRadar({ values, size = 240 }) {
  const axes = [
    { id: "spicy",  label: "SPICY",  v: values.spicy,  color: "var(--el-fire)" },
    { id: "sweet",  label: "SWEET",  v: values.sweet,  color: "var(--el-air)" },
    { id: "umami",  label: "UMAMI",  v: values.umami,  color: "var(--accent)" },
    { id: "acidic", label: "ACIDIC", v: values.acidic, color: "var(--el-water)" },
    { id: "bitter", label: "BITTER", v: values.bitter, color: "var(--el-earth)" },
  ];
  const c = size / 2, R = c * 0.66;
  const pt = (i, f) => { const a = (i / 5) * 2 * Math.PI - Math.PI / 2; return [c + Math.cos(a) * R * f, c + Math.sin(a) * R * f]; };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((f, k) => (
        <polygon key={k} points={axes.map((_, i) => pt(i, f).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      ))}
      {axes.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />; })}
      <polygon points={axes.map((ax, i) => pt(i, ax.v).join(",")).join(" ")} fill="color-mix(in oklch, var(--accent), transparent 80%)" stroke="var(--accent)" strokeWidth="1.4" style={{ filter: "drop-shadow(0 0 6px color-mix(in oklch, var(--accent), transparent 55%))" }} />
      {axes.map((ax, i) => { const [x, y] = pt(i, ax.v); return <circle key={i} cx={x} cy={y} r="3" fill={ax.color} stroke="var(--bg)" strokeWidth="1" />; })}
      {axes.map((ax, i) => {
        const [x, y] = pt(i, 1.22);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="JetBrains Mono" fill="var(--fg-dim)" style={{ letterSpacing: "0.1em" }}>{ax.label}</text>;
      })}
    </svg>
  );
}

// ── DAILY YIELD LEDGER — spirit/essence/matter/substance over time ─────────────
function DailyYieldLedger({ width = 720, height = 200 }) {
  const series = [
    { id: "spirit",    color: "var(--el-air)",   data: [.32,.41,.38,.52,.48,.61,.55,.68,.64,.72,.7,.78,.74,.82] },
    { id: "essence",   color: "var(--el-water)", data: [.5,.55,.62,.58,.66,.7,.68,.74,.78,.76,.82,.8,.86,.84] },
    { id: "matter",    color: "var(--el-earth)", data: [.6,.58,.55,.5,.52,.48,.51,.46,.49,.44,.47,.43,.45,.42] },
    { id: "substance", color: "var(--el-fire)",  data: [.4,.44,.42,.48,.46,.5,.54,.52,.58,.56,.6,.62,.59,.64] },
  ];
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const n = series[0].data.length;
  const px = (i) => pad.l + (i / (n - 1)) * W;
  const py = (v) => pad.t + (1 - v) * H;
  return (
    <div>
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
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {["14d", "10d", "7d", "3d", "today"].map((l, i) => <span key={i} className="t-mono" style={{ fontSize: 9, color: l === "today" ? "var(--accent)" : "var(--fg-faint)" }}>{l}</span>)}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        {series.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 10, height: 2, background: s.color, boxShadow: `0 0 6px ${s.color}`, display: "inline-block" }} />
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.id}</span>
            <span className="t-num" style={{ fontSize: 10, color: "var(--fg)" }}>{(s.data[n - 1] * 100).toFixed(0)}q</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── IMPLICIT LEARNING DASHBOARD ────────────────────────────────────────────────
function ImplicitLearning() {
  const items = [
    { agent: "Galileo", glyph: "♄", el: "earth", learned: "prefers Earth-rich ingredients for dinner", conf: 0.91, n: 34 },
    { agent: "Monet",   glyph: "☽", el: "water", learned: "reaches for acid + ferment on lunar-hour evenings", conf: 0.84, n: 27 },
    { agent: "Monet",   glyph: "♀", el: "water", learned: "skips bitter botanicals before noon", conf: 0.77, n: 19 },
    { agent: "Galileo", glyph: "♂", el: "fire",  learned: "tolerates high spice only with dairy fat present", conf: 0.72, n: 15 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `radial-gradient(circle at 32% 28%, ${EL_COLOR[it.el]}, color-mix(in oklch, ${EL_COLOR[it.el]}, black 55%))`, border: "1px solid var(--line-hi)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-mono)", fontSize: 13, color: "rgba(0,0,0,0.65)" }}>{it.glyph}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.4 }}><span style={{ color: EL_COLOR[it.el] }}>{it.agent}</span> learned: {it.learned}</div>
            <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 2, letterSpacing: "0.06em" }}>FROM {it.n} OBSERVATIONS · IMPLICIT</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="t-num" style={{ fontSize: 13, color: "var(--accent)" }}>{(it.conf * 100).toFixed(0)}%</div>
            <div className="t-tag" style={{ fontSize: 8 }}>CONF</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── DIETARY PROTOCOL — tags + inline modifiers ─────────────────────────────────
function DietaryProtocol() {
  const tags = [
    { k: "Pescatarian", mod: "strict" }, { k: "Gluten-free", mod: "strict" },
    { k: "Low-FODMAP", mod: "flexible" }, { k: "Soy-free", mod: "strict" },
    { k: "Spice", mod: "HIGH" }, { k: "Dairy", mod: "moderate" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {tags.map((t) => (
        <span key={t.k} className="chip" style={{ paddingRight: 4 }}>
          {t.k}
          <span style={{ marginLeft: 4, padding: "2px 7px", borderRadius: 999, fontSize: 8.5, background: t.mod === "strict" || t.mod === "HIGH" ? "color-mix(in oklch, var(--accent), transparent 78%)" : "rgba(255,255,255,0.05)", color: t.mod === "strict" || t.mod === "HIGH" ? "var(--accent)" : "var(--fg-mute)", border: "1px solid var(--line)" }}>{t.mod.toUpperCase()}</span>
        </span>
      ))}
    </div>
  );
}

// ============================================================
// SCREEN — USER PROFILE (desktop 1440)
// ============================================================
const USER = {
  name: "Greg Castro", id: "ALCH-7741", tier: "PRACTITIONER",
  constitution: { fire: 0.42, water: 0.55, earth: 0.38, air: 0.81 },
  palate: { spicy: 0.72, sweet: 0.34, umami: 0.88, acidic: 0.66, bitter: 0.48 },
  archetype: "The aromatic balancer",
};

function ProfileTabNav({ tab }) {
  const tabs = [["essence", "Essence"], ["palate", "Palate"], ["practice", "Practice"]];
  return (
    <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.025)", border: "1px solid var(--line)", borderRadius: 999, width: "fit-content" }}>
      {tabs.map(([id, label]) => (
        <span key={id} className="t-mono" style={{ padding: "7px 18px", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: id === tab ? "var(--fg)" : "var(--fg-mute)", background: id === tab ? "rgba(255,255,255,0.06)" : "transparent", borderRadius: 999, cursor: "pointer" }}>{label}</span>
      ))}
    </div>
  );
}

function UserProfileScreen({ tab = "essence", motion = true }) {
  return (
    <div className="lab" style={{ display: "flex", flexDirection: "column" }}>
      <LabHeader active="kitchen" />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr", minHeight: 0 }}>
        {/* LEFT identity rail */}
        <aside style={{ borderRight: "1px solid var(--line)", padding: "26px 22px", display: "flex", flexDirection: "column", gap: 20, overflow: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ position: "relative", width: 88, height: 88 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", border: "2px solid var(--line-hi)" }} />
              <div style={{ position: "absolute", bottom: -6, right: -2, width: 28, height: 28, background: "var(--bg)", borderRadius: "50%", border: "1px solid var(--line-hi)", display: "flex", alignItems: "center", justifyContent: "center" }}><PremiumMark size={13} /></div>
            </div>
            <div className="t-display" style={{ fontSize: 24, color: "var(--fg)", marginTop: 12, lineHeight: 1.1 }}>{USER.name}</div>
            <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", marginTop: 4, letterSpacing: "0.14em" }}>{USER.id} · {USER.tier}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {VIEWER.natal.planets.slice(0, 2).map((p, i) => <span key={i} className={i === 0 ? "chip chip-active" : "chip"}>{p.glyph} {p.sign} {i === 0 ? "☉" : "☽"}</span>)}
            </div>
          </div>
          <div className="rule" />
          <div>
            <div className="t-tag" style={{ marginBottom: 10 }}>NATAL · GENERATED ONCE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["BIRTH", "1991-10-12"], ["TIME", "14:22 EDT"], ["PLACE", "Brooklyn NY"], ["LAT/LON", "40.71N 73.99W"]].map(([k, v]) => (
                <div key={k} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 6 }}>
                  <div className="t-tag" style={{ fontSize: 8 }}>{k}</div>
                  <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg)", marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rule" />
          <div>
            <div className="t-tag" style={{ marginBottom: 10 }}>CUMULATIVE YIELD · 14D</div>
            <div className="panel-flat" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>TOTAL Q</span>
                <span className="t-num" style={{ fontSize: 22, color: "var(--accent)" }}>312.4</span>
              </div>
              <Sparkline data={[180, 210, 198, 240, 262, 251, 288, 274, 300, 312]} width={232} height={34} />
            </div>
          </div>
          <div className="rule" />
          <div>
            <div className="t-tag" style={{ marginBottom: 10 }}>ARCHETYPE</div>
            <div className="t-display" style={{ fontSize: 19, color: "var(--fg)", lineHeight: 1.1 }}>The <em style={{ color: "var(--accent)", fontStyle: "italic" }}>aromatic</em> balancer</div>
          </div>
        </aside>

        {/* MAIN tab area */}
        <main style={{ padding: "26px 30px", overflow: "auto", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="t-tag" style={{ marginBottom: 6 }}>PROFILE LEDGER · ProfileBlockRegistry</div>
              <h1 className="t-display" style={{ fontSize: 32, margin: 0, color: "var(--fg)", lineHeight: 1 }}>Your <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{tab}</em></h1>
            </div>
            <ProfileTabNav tab={tab} />
          </div>

          {tab === "essence" && (
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 30, alignItems: "center" }}>
              <div className="panel-glow" style={{ padding: 20 }}>
                <div className="t-tag" style={{ marginBottom: 12 }}>NATAL CHART WHEEL · 12 HOUSES</div>
                <NatalWheel planets={VIEWER.natal.planets} size={400} motion={motion} dominantEl="air" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="panel-flat" style={{ padding: 16 }}><div className="t-tag" style={{ marginBottom: 10 }}>ALCHEMICAL CONSTITUTION</div><ElementalMeter values={USER.constitution} compact /></div>
                <div className="panel-flat" style={{ padding: 16 }}><div className="t-tag" style={{ marginBottom: 10 }}>NATAL THERMODYNAMICS</div><ThermoQuartet compact /></div>
                <div className="panel-flat" style={{ padding: 16 }}>
                  <div className="t-tag" style={{ marginBottom: 8 }}>PLACEMENTS</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {VIEWER.natal.planets.map((p) => (
                      <div key={p.planet} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 9px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 6 }}>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 13, color: EL_COLOR[p.el] }}>{p.glyph}</span>
                        <span className="t-mono" style={{ fontSize: 10, color: "var(--fg)" }}>{p.sign.slice(0, 3)} {p.deg}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "palate" && (
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 30, alignItems: "start" }}>
              <div className="panel-glow" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div className="t-tag" style={{ alignSelf: "flex-start", marginBottom: 6 }}>PALATE DNA · 5-AXIS</div>
                <PalateRadar values={USER.palate} size={300} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="panel-flat" style={{ padding: 18 }}>
                  <div className="t-tag" style={{ marginBottom: 12 }}>TASTE PROFILE · CATEGORY BREAKDOWN</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(USER.palate).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                      <div key={k}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span className="t-label" style={{ color: "var(--fg-dim)" }}>{k}</span>
                          <span className="t-num" style={{ fontSize: 12, color: "var(--fg)" }}>{(v * 100).toFixed(0)}%</span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${v * 100}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-2))", borderRadius: 999, boxShadow: "0 0 8px var(--accent-soft)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel-flat" style={{ padding: 18 }}>
                  <div className="t-tag" style={{ marginBottom: 12 }}>DIETARY PROTOCOL · TAGS + MODIFIERS</div>
                  <DietaryProtocol />
                </div>
              </div>
            </div>
          )}

          {tab === "practice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="panel-glow" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <div><div className="t-tag" style={{ marginBottom: 6 }}>DAILY YIELD HISTORY · 14 DAYS</div><h2 className="t-display" style={{ fontSize: 22, margin: 0, color: "var(--fg)" }}>Spirit · Essence · Matter · Substance</h2></div>
                  <span className="chip chip-active">▲ +18% vs prior week</span>
                </div>
                <DailyYieldLedger />
              </div>
              <div className="panel-flat" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span className="t-tag">IMPLICIT LEARNING DASHBOARD · what agents inferred</span>
                  <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-faint)" }}>95 OBSERVATIONS</span>
                </div>
                <ImplicitLearning />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// MOBILE — USER PROFILE (390)
// ============================================================
function MobileUserProfile({ tab = "essence", motion = true }) {
  return (
    <div className="lab lab-mobile" style={{ borderRadius: 28, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="statusbar"><span>9:41</span><span style={{ display: "flex", gap: 5 }}>✦ ▮▮▮ ⌬</span></div>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 6 }}>
          <div style={{ position: "relative", width: 56, height: 56 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", border: "2px solid var(--line-hi)" }} />
          </div>
          <div>
            <div className="t-display" style={{ fontSize: 22, color: "var(--fg)", lineHeight: 1 }}>{USER.name}</div>
            <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 3, letterSpacing: "0.12em" }}>{USER.id} · {USER.tier}</div>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}><ProfileTabNav tab={tab} /></div>

        {tab === "essence" && (
          <>
            <div className="panel-glow" style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="t-tag" style={{ alignSelf: "flex-start", marginBottom: 6 }}>NATAL CHART WHEEL</div>
              <NatalWheel planets={VIEWER.natal.planets} size={300} motion={motion} dominantEl="air" />
            </div>
            <div className="panel-flat" style={{ padding: 14 }}><div className="t-tag" style={{ marginBottom: 10 }}>CONSTITUTION</div><ElementalMeter values={USER.constitution} compact /></div>
          </>
        )}
        {tab === "palate" && (
          <>
            <div className="panel-glow" style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="t-tag" style={{ alignSelf: "flex-start", marginBottom: 4 }}>PALATE DNA</div>
              <PalateRadar values={USER.palate} size={260} />
            </div>
            <div className="panel-flat" style={{ padding: 14 }}><div className="t-tag" style={{ marginBottom: 10 }}>DIETARY PROTOCOL</div><DietaryProtocol /></div>
          </>
        )}
        {tab === "practice" && (
          <>
            <div className="panel-glow" style={{ padding: 14 }}>
              <div className="t-tag" style={{ marginBottom: 10 }}>DAILY YIELD · 14D</div>
              <DailyYieldLedger width={330} height={170} />
            </div>
            <div className="panel-flat" style={{ padding: 14 }}><div className="t-tag" style={{ marginBottom: 10 }}>IMPLICIT LEARNING</div><ImplicitLearning /></div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { UserProfileScreen, MobileUserProfile, NatalWheel, PalateRadar, DailyYieldLedger, ImplicitLearning, DietaryProtocol, USER });
