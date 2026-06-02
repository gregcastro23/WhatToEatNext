/* screens.jsx — desktop screens for alchm.kitchen */

// ============================================================
// SHARED CHROME
// ============================================================
function LabHeader({ active = "kitchen", showSearch = true, user = { name: "G. Castro", id: "alch-7741" } }) {
  const nav = [
    { id: "kitchen",    label: "Kitchen" },
    { id: "ingredients", label: "Ingredients" },
    { id: "cuisines",   label: "Cuisines" },
    { id: "saved",      label: "Cabinet" },
    { id: "lab",        label: "Lab" },
  ];
  return (
    <header style={{
      display: "grid", gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center", gap: 20,
      padding: "14px 28px",
      borderBottom: "1px solid var(--line)",
      position: "relative", zIndex: 5,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Logo />
        <div className="rule" style={{ width: 20, transform: "rotate(90deg)", flexShrink: 0 }} />
        <CelestialHeaderClock />
      </div>

      <nav style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.025)", border: "1px solid var(--line)", borderRadius: 999 }}>
        {nav.map(n => (
          <button key={n.id} className="t-mono" style={{
            padding: "6px 14px",
            fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
            color: n.id === active ? "var(--fg)" : "var(--fg-mute)",
            background: n.id === active ? "rgba(255,255,255,0.06)" : "transparent",
            border: "none", borderRadius: 999, cursor: "pointer",
          }}>{n.label}</button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
        {showSearch && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 12px",
            background: "rgba(255,255,255,0.025)", border: "1px solid var(--line)",
            borderRadius: 8, minWidth: 220,
          }}>
            <Glyph name="search" size={14} stroke={1.4} style={{ color: "var(--fg-mute)" }} />
            <span style={{ fontSize: 12, color: "var(--fg-mute)" }}>Search ingredients, recipes…</span>
            <span className="t-mono" style={{ marginLeft: "auto", fontSize: 9, color: "var(--fg-faint)", padding: "2px 5px", border: "1px solid var(--line)", borderRadius: 4 }}>⌘K</span>
          </div>
        )}
        <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", textAlign: "right", lineHeight: 1.3 }}>
          <div style={{ color: "var(--fg)" }}>{user.name}</div>
          <div>{user.id}</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", border: "1px solid var(--line-hi)" }} />
      </div>
    </header>
  );
}

function Logo({ size = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: "var(--fg)" }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3 L12 21 M3 12 L21 12" opacity="0.35" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span className="t-display" style={{ fontSize: 18, color: "var(--fg)" }}>alchm</span>
        <span className="t-mono" style={{ fontSize: 8, letterSpacing: "0.3em", color: "var(--fg-mute)" }}>KITCHEN</span>
      </div>
    </div>
  );
}

// Persistent live planetary readout in the header — present on every page.
function CelestialHeaderClock() {
  const [t, setT] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hours = t.getHours();
  const planetaryRulers = ["☉", "♀", "☿", "☽", "♄", "♃", "♂"];
  const planetNames =     ["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
  const idx = ((hours - 6) + 14 * 7) % 7;
  const ruler = planetaryRulers[idx];
  const name = planetNames[idx];
  const time = t.toTimeString().slice(0, 5);
  const seconds = t.getSeconds().toString().padStart(2, "0");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "5px 12px 5px 8px",
      border: "1px solid var(--line)", borderRadius: 999,
      background: "rgba(255,255,255,0.02)",
    }}>
      <span style={{ display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "color-mix(in oklch, var(--accent), transparent 75%)", border: "1px solid color-mix(in oklch, var(--accent), transparent 50%)", fontFamily: "JetBrains Mono", fontSize: 13, color: "var(--accent)" }}>{ruler}</span>
      <div className="t-mono" style={{ fontSize: 10, lineHeight: 1.15 }}>
        <div style={{ color: "var(--fg)", letterSpacing: "0.06em" }}>{name.toUpperCase()} HOUR</div>
        <div style={{ color: "var(--fg-mute)", letterSpacing: "0.12em" }}>{time}<span style={{ opacity: 0.5 }}>:{seconds}</span> · 40.71N</div>
      </div>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)", animation: "blink 1.4s ease-in-out infinite" }} data-motion />
    </div>
  );
}

// ============================================================
// PLACEHOLDER IMAGE — for agent-generated assets
// ============================================================
function AgentImage({ label = "AGENT · IMG", aspect = "4/3", style = {} }) {
  return (
    <div style={{
      position: "relative",
      aspectRatio: aspect,
      borderRadius: 10,
      overflow: "hidden",
      background: `
        repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 14px),
        radial-gradient(ellipse at 30% 20%, color-mix(in oklch, var(--accent), transparent 70%), transparent 60%),
        linear-gradient(180deg, #1A1525, #0E0B16)
      `,
      border: "1px solid var(--line)",
      ...style,
    }}>
      <div style={{ position: "absolute", inset: 12, border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 6 }} />
      <div style={{
        position: "absolute", top: 12, left: 12,
        fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--fg-mute)",
      }}>{label}</div>
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--fg-faint)",
      }}>/api/generate-image</div>
    </div>
  );
}

// ============================================================
// SCREEN 1 — SIGN IN
// ============================================================
function SignInScreen() {
  return (
    <div className="lab" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr" }}>
      {/* LEFT — sigil / atelier */}
      <section style={{ position: "relative", borderRight: "1px solid var(--line)", overflow: "hidden", padding: 40 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SigilArt size={520} />
        </div>

        {/* corner labels */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          <Logo size={26} />
          <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.18em", textAlign: "right" }}>
            <div style={{ color: "var(--fg-dim)" }}>EST. MMXXIV</div>
            <div>ALCHEMICAL CULINARY SOC.</div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 32, left: 40, right: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="t-tag" style={{ marginBottom: 6 }}>STATION · 01 / GATE</div>
            <div className="t-display" style={{ fontSize: 42, lineHeight: 1.05, color: "var(--fg)", maxWidth: 460 }}>
              The kitchen is a <em style={{ color: "var(--accent)", fontStyle: "italic" }}>laboratory</em>.<br/>
              Step inside.
            </div>
          </div>
          <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-faint)", textAlign: "right", lineHeight: 1.6 }}>
            <div>RA · 23h 41m 12s</div>
            <div>DEC · +40°42′ 51″</div>
            <div>LMST · 14h 22m</div>
          </div>
        </div>
      </section>

      {/* RIGHT — sign in card */}
      <section style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="t-tag" style={{ marginBottom: 18 }}>AUTH · NEXTAUTH ◇ GOOGLE OAUTH</div>
          <h1 className="t-display" style={{ fontSize: 44, margin: "0 0 6px", lineHeight: 1.05, color: "var(--fg)" }}>
            Enter the kitchen
          </h1>
          <p style={{ color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.6, margin: "0 0 32px" }}>
            Your natal chart calibrates every recommendation. We compute against the live sky in sub-1ms over Railway's internal mesh.
          </p>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 16px", fontSize: 12 }}>
            <Glyph name="google" size={16} /> Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span className="t-tag">OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="practitioner@email.com" style={inputStyle} />
            <button className="btn" style={{ width: "100%", justifyContent: "center", padding: "12px 16px" }}>
              Continue with email <Glyph name="arrow" size={14} />
            </button>
          </div>

          {/* telemetry */}
          <div style={{ marginTop: 36, padding: "14px 0 0", borderTop: "1px solid var(--line)" }}>
            <div className="t-tag" style={{ marginBottom: 10 }}>NIGHTLY TELEMETRY</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                ["RECIPES", "12,438"],
                ["INGREDIENTS", "2,901"],
                ["CUISINES", "184"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="t-num" style={{ fontSize: 22, color: "var(--fg)" }}>{v}</div>
                  <div className="t-tag" style={{ fontSize: 9, marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="t-mono" style={{ marginTop: 28, fontSize: 9, color: "var(--fg-faint)", letterSpacing: "0.16em", lineHeight: 1.8 }}>
            By continuing you accept the Terms.<br/>
            VSOP87 ephemeris · IAU 2006 precession · DE440
          </div>
        </div>

        {/* register marks */}
        <div className="regmarks"><i /></div>
      </section>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  color: "var(--fg)",
  fontFamily: "var(--f-body)",
  fontSize: 13,
  outline: "none",
};

// SIGIL — atomic-orbital style; NO moon/star clichés
function SigilArt({ size = 520 }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ color: "var(--accent)" }}>
      <defs>
        <radialGradient id="sigil-glow">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
          <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={size * 0.42} fill="url(#sigil-glow)" />

      {/* outer dial */}
      <circle cx={c} cy={c} r={size * 0.40} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <circle cx={c} cy={c} r={size * 0.36} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.4" strokeDasharray="2 6" />

      {/* tick ring */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
        const big = i % 5 === 0;
        return (
          <line key={i}
            x1={c + Math.cos(a) * (size * 0.40)}
            y1={c + Math.sin(a) * (size * 0.40)}
            x2={c + Math.cos(a) * (size * (big ? 0.42 : 0.41))}
            y2={c + Math.sin(a) * (size * (big ? 0.42 : 0.41))}
            stroke="rgba(255,255,255,0.3)" strokeWidth={big ? 0.8 : 0.4}
          />
        );
      })}

      {/* atomic orbitals */}
      {[0, 60, 120].map((rot) => (
        <ellipse key={rot} cx={c} cy={c} rx={size * 0.32} ry={size * 0.16} fill="none"
          stroke="rgba(180,140,255,0.30)" strokeWidth="0.6"
          transform={`rotate(${rot} ${c} ${c})`} />
      ))}

      {/* 4-element triangles */}
      {[
        { sym: "△",  rot: 0,   col: "var(--el-fire)" },
        { sym: "▽",  rot: 90,  col: "var(--el-water)" },
        { sym: "△",  rot: 180, col: "var(--el-air)" },
        { sym: "▽",  rot: 270, col: "var(--el-earth)" },
      ].map((e, i) => {
        const a = (e.rot / 360) * 2 * Math.PI - Math.PI / 2;
        return (
          <g key={i} transform={`translate(${c + Math.cos(a) * size * 0.28} ${c + Math.sin(a) * size * 0.28})`}>
            <circle r="14" fill="var(--bg)" stroke={e.col} strokeWidth="0.8" />
            <text textAnchor="middle" dominantBaseline="middle" fill={e.col} fontSize="14" fontFamily="JetBrains Mono">{e.sym}</text>
          </g>
        );
      })}

      {/* core */}
      <circle cx={c} cy={c} r={size * 0.08} fill="var(--bg)" stroke="var(--accent)" strokeWidth="0.8" />
      <circle cx={c} cy={c} r={size * 0.04} fill="var(--accent)" opacity="0.7" />
      <circle cx={c} cy={c} r={size * 0.12} fill="none" stroke="var(--accent)" strokeWidth="0.4" data-motion style={{ transformOrigin: `${c}px ${c}px`, animation: "breathe 4s ease-in-out infinite" }} />

      {/* cardinals */}
      {[0, 90, 180, 270].map(d => {
        const a = (d / 360) * 2 * Math.PI - Math.PI / 2;
        const x = c + Math.cos(a) * size * 0.46;
        const y = c + Math.sin(a) * size * 0.46;
        return <text key={d} x={x} y={y} fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" dominantBaseline="middle">{String(d).padStart(3, "0")}°</text>;
      })}

      {/* corner crosses */}
      {[[size*0.1, size*0.1],[size*0.9, size*0.1],[size*0.1, size*0.9],[size*0.9, size*0.9]].map(([x, y], i) => (
        <g key={i} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5">
          <line x1={x-6} y1={y} x2={x+6} y2={y} />
          <line x1={x} y1={y-6} x2={x} y2={y+6} />
        </g>
      ))}
    </svg>
  );
}

// ============================================================
// SCREEN 2 — LABORATORY DASHBOARD
// ============================================================
function DashboardScreen() {
  return (
    <div className="lab" style={{ display: "flex", flexDirection: "column" }}>
      <LabHeader active="kitchen" />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr 340px", gap: 0, minHeight: 0 }}>
        {/* LEFT RAIL */}
        <aside style={{ borderRight: "1px solid var(--line)", padding: "24px 22px", display: "flex", flexDirection: "column", gap: 22, overflow: "auto" }}>
          <div>
            <div className="t-tag" style={{ marginBottom: 10 }}>NATAL CHART</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--line-hi)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: "var(--accent-2)" }}>♎</span>
              </div>
              <div>
                <div className="t-display" style={{ fontSize: 18, color: "var(--fg)" }}>Libra · Sun</div>
                <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>1991-10-12 · 14:22 EDT</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["MOON", "♓ Pisces"], ["RISING", "♐ Sag"], ["MERCURY", "♏ Scorp"], ["VENUS", "♍ Virgo"]].map(([k, v]) => (
                <div key={k} style={{ padding: "6px 10px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--line)", borderRadius: 6 }}>
                  <div className="t-tag" style={{ fontSize: 8 }}>{k}</div>
                  <div className="t-mono" style={{ fontSize: 11, color: "var(--fg)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rule" />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span className="t-tag">ELEMENTAL BALANCE</span>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>NATAL ⊗ TRANSIT</span>
            </div>
            <ElementalMeter values={{ fire: 0.71, water: 0.42, earth: 0.55, air: 0.83 }} />
          </div>

          <div className="rule" />

          <div>
            <div className="t-tag" style={{ marginBottom: 10 }}>THERMODYNAMICS</div>
            <ThermoQuartet />
          </div>

          <div className="rule" />

          <div>
            <div className="t-tag" style={{ marginBottom: 10 }}>DIETARY KEYS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Pescatarian", "G-Free", "Low-FODMAP", "Soy-Free"].map(k => (
                <span key={k} className="chip">{k}</span>
              ))}
              <span className="chip" style={{ color: "var(--fg-mute)" }}>+ add</span>
            </div>
          </div>
        </aside>

        {/* CENTER — Clock + Recommendations */}
        <main style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, overflow: "auto", minHeight: 0 }}>
          {/* Hero row */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "center" }}>
            <PlanetaryClock size={300} rotation={42} motion={true} />

            <div>
              <div className="t-tag" style={{ marginBottom: 8 }}>CURRENT TRANSIT · MARS HOUR</div>
              <h1 className="t-display" style={{ fontSize: 46, lineHeight: 1.0, margin: "0 0 14px", color: "var(--fg)" }}>
                A hot, tannic, <em style={{ color: "var(--accent)", fontStyle: "italic" }}>fire-forward</em><br/>
                supper aligns to the sky.
              </h1>
              <p style={{ color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.55, maxWidth: 540, margin: "0 0 18px" }}>
                With Mars rising through your 8th house and Venus retrograde in Virgo, the engine biases toward iron-rich proteins, fermented acidity, and concentrated heat.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary">Compose Tonight's Menu <Glyph name="arrow" size={14} /></button>
                <button className="btn">Open Lab</button>
              </div>
            </div>
          </div>

          <div className="rule" />

          {/* Recommendation grid */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div>
                <div className="t-tag">ENHANCED INGREDIENT RECOMMENDER</div>
                <h2 className="t-display" style={{ fontSize: 22, margin: "4px 0 0", color: "var(--fg)" }}>Aligned to the present sky</h2>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Proteins", "Aromatics", "Acids", "Fats", "Botanicals"].map((f, i) => (
                  <span key={f} className={`chip ${i === 0 ? "chip-active" : ""}`}>{f}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {ingredientCards.map((ing, i) => <IngredientCard key={i} ing={ing} />)}
            </div>
          </div>

          {/* Bottom row — cuisine + sauce lineage */}
          <div className="rule" />

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
            <CuisineExplorerPanel />
            <SauceLineagePanel />
          </div>
        </main>

        {/* RIGHT RAIL */}
        <aside style={{ borderLeft: "1px solid var(--line)", padding: "24px 22px", display: "flex", flexDirection: "column", gap: 22, overflow: "auto" }}>
          <AstrologicalClockPanel />
          <div className="rule" />
          <TonightsCompositionPanel />
          <div className="rule" />
          <PipelinePanel />
        </aside>
      </div>
    </div>
  );
}

// THERMO QUARTET — Spirit / Essence / Matter / Substance
function ThermoQuartet({ compact = false }) {
  const q = [
    { id: "spirit",    label: "Spirit",    sym: "🜀", v: 0.62, hint: "volatile / aroma" },
    { id: "essence",   label: "Essence",   sym: "🜁", v: 0.78, hint: "soluble / flavor" },
    { id: "matter",    label: "Matter",    sym: "🜃", v: 0.41, hint: "fixed / texture" },
    { id: "substance", label: "Substance", sym: "🜄", v: 0.55, hint: "structural / yield" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {q.map(x => (
        <div key={x.id} style={{
          padding: "10px 12px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="t-tag" style={{ fontSize: 9 }}>{x.label}</span>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "var(--accent)" }}>{x.sym}</span>
          </div>
          <div className="t-num" style={{ fontSize: 18, color: "var(--fg)", marginTop: 4 }}>
            {x.v.toFixed(2)}<span style={{ fontSize: 10, color: "var(--fg-mute)", marginLeft: 2 }}>q</span>
          </div>
          <div style={{ position: "relative", height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 999, marginTop: 6 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${x.v * 100}%`, background: "var(--accent)", borderRadius: 999, boxShadow: "0 0 6px var(--accent)" }} />
          </div>
          {!compact && <div style={{ marginTop: 4, fontSize: 9, color: "var(--fg-faint)", letterSpacing: "0.06em" }}>{x.hint}</div>}
        </div>
      ))}
    </div>
  );
}

// INGREDIENT CARD
const ingredientCards = [
  { name: "Beef Cheek",  cat: "PROTEIN",   element: "fire",  match: 0.94, props: { Spirit: 0.42, Essence: 0.81, Matter: 0.88, Substance: 0.66 }, planet: "♂", hue: 12 },
  { name: "Pomegranate", cat: "ACID",      element: "water", match: 0.91, props: { Spirit: 0.71, Essence: 0.84, Matter: 0.32, Substance: 0.45 }, planet: "♀", hue: 350 },
  { name: "Sumac",       cat: "BOTANICAL", element: "air",   match: 0.88, props: { Spirit: 0.88, Essence: 0.62, Matter: 0.22, Substance: 0.30 }, planet: "☿", hue: 20 },
  { name: "Black Trumpet", cat: "FUNGAL",  element: "earth", match: 0.86, props: { Spirit: 0.51, Essence: 0.74, Matter: 0.65, Substance: 0.72 }, planet: "♄", hue: 270 },
  { name: "Saffron",     cat: "SPICE",     element: "fire",  match: 0.84, props: { Spirit: 0.92, Essence: 0.88, Matter: 0.18, Substance: 0.21 }, planet: "☉", hue: 35 },
  { name: "Anchovy",     cat: "UMAMI",     element: "water", match: 0.82, props: { Spirit: 0.66, Essence: 0.81, Matter: 0.54, Substance: 0.41 }, planet: "♆", hue: 210 },
  { name: "Smoked Salt", cat: "MINERAL",   element: "earth", match: 0.79, props: { Spirit: 0.31, Essence: 0.42, Matter: 0.94, Substance: 0.62 }, planet: "♄", hue: 30 },
  { name: "Yuzu",        cat: "CITRUS",    element: "air",   match: 0.76, props: { Spirit: 0.84, Essence: 0.72, Matter: 0.21, Substance: 0.32 }, planet: "☿", hue: 75 },
];

function IngredientCard({ ing }) {
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <div style={{
        position: "relative",
        aspectRatio: "5/3",
        background: `
          radial-gradient(circle at 60% 40%, oklch(0.5 0.14 ${ing.hue} / 0.6), transparent 60%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 8px),
          linear-gradient(180deg, #1A1525, #0E0B16)
        `,
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ position: "absolute", top: 8, left: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span className={`el-dot el-${ing.element}`} />
          <span className="t-tag" style={{ fontSize: 8 }}>{ing.cat}</span>
        </div>
        <div style={{ position: "absolute", top: 8, right: 10, fontFamily: "JetBrains Mono", fontSize: 14, color: "var(--accent-2)" }}>{ing.planet}</div>
        <div style={{ position: "absolute", bottom: 8, right: 10 }}>
          <CompatibilityRing value={ing.match} size={48} label="" />
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 10, fontFamily: "JetBrains Mono", fontSize: 9, color: "var(--fg-faint)", letterSpacing: "0.14em" }}>
          ID · ING-{Math.floor(Math.random()*9000+1000)}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div className="t-display" style={{ fontSize: 19, color: "var(--fg)", lineHeight: 1.1 }}>{ing.name}</div>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {Object.entries(ing.props).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontSize: 9, color: "var(--fg-mute)" }}>
              <span>{k.slice(0, 3).toUpperCase()}</span>
              <span style={{ color: "var(--fg)" }}>{v.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// CUISINE EXPLORER PANEL
function CuisineExplorerPanel() {
  const cuisines = [
    { id: "lev",   name: "Levantine",   region: "MED·ME",  match: 0.92, sig: [0.6, 0.4, 0.7, 0.55], col: "var(--el-air)" },
    { id: "siz",   name: "Sicilian",    region: "MED·IT",  match: 0.88, sig: [0.7, 0.6, 0.5, 0.4],  col: "var(--el-fire)" },
    { id: "oax",   name: "Oaxacan",     region: "AMR·MX",  match: 0.81, sig: [0.85,0.3, 0.45,0.6],  col: "var(--accent)" },
    { id: "kab",   name: "Kaiseki",     region: "ASE·JP",  match: 0.76, sig: [0.3, 0.7, 0.6, 0.5],  col: "var(--el-water)" },
    { id: "bsq",   name: "Basque",      region: "EUR·ES",  match: 0.74, sig: [0.55,0.6, 0.55,0.7],  col: "var(--el-earth)" },
    { id: "tam",   name: "Tamilian",    region: "ASE·IN",  match: 0.70, sig: [0.8, 0.5, 0.4, 0.3],  col: "var(--el-fire)" },
  ];
  return (
    <div className="panel" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <div className="t-tag">CUISINE EXPLORER · TIER III</div>
          <h3 className="t-display" style={{ fontSize: 20, margin: "4px 0 0", color: "var(--fg)" }}>Aggregated signatures</h3>
        </div>
        <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>184 ENTRIES</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {cuisines.map((c, i) => (
          <div key={c.id} className="data-row" style={{ gridTemplateColumns: "auto 1fr auto auto auto" }}>
            <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", width: 20 }}>{String(i+1).padStart(2, "0")}</div>
            <div>
              <div className="t-display" style={{ fontSize: 17, color: "var(--fg)" }}>{c.name}</div>
              <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>{c.region}</div>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {c.sig.map((v, j) => (
                <div key={j} style={{
                  width: 4, height: 22,
                  background: `linear-gradient(to top, ${c.col} ${v*100}%, rgba(255,255,255,0.06) ${v*100}%)`,
                  borderRadius: 1,
                }} />
              ))}
            </div>
            <div className="t-num" style={{ fontSize: 16, color: "var(--fg)", minWidth: 50, textAlign: "right" }}>
              {(c.match*100).toFixed(0)}<span style={{ fontSize: 10, color: "var(--fg-mute)" }}>%</span>
            </div>
            <Glyph name="chevron" size={14} stroke={1.4} style={{ color: "var(--fg-mute)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// SAUCE LINEAGE PANEL
function SauceLineagePanel() {
  return (
    <div className="panel" style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <div className="t-tag">SAUCE LINEAGE TREE</div>
          <h3 className="t-display" style={{ fontSize: 20, margin: "4px 0 0", color: "var(--fg)" }}>Vincotto · derivations</h3>
        </div>
        <Glyph name="orbital" size={20} style={{ color: "var(--accent)" }} />
      </div>

      <div style={{ position: "relative", height: 200 }}>
        <svg width="100%" height="200" viewBox="0 0 320 200">
          {/* tree edges */}
          <g stroke="var(--line-hi)" strokeWidth="0.8" fill="none">
            <path d="M30 100 Q 100 100 160 60" />
            <path d="M30 100 Q 100 100 160 100" />
            <path d="M30 100 Q 100 100 160 140" />
            <path d="M160 60 Q 220 60 280 40" />
            <path d="M160 60 Q 220 60 280 80" />
            <path d="M160 100 Q 220 100 280 120" />
            <path d="M160 140 Q 220 140 280 160" />
          </g>
          {/* nodes */}
          {[
            { x: 30, y: 100, r: 9, label: "MOTHER", col: "var(--accent)" },
            { x: 160, y: 60, r: 6, label: "Saba" },
            { x: 160, y: 100, r: 6, label: "Mostarda" },
            { x: 160, y: 140, r: 6, label: "Agrodolce" },
            { x: 280, y: 40, r: 4, label: "Saba·Apple" },
            { x: 280, y: 80, r: 4, label: "Saba·Fig" },
            { x: 280, y: 120, r: 4, label: "Mostarda·Pear" },
            { x: 280, y: 160, r: 4, label: "Agro·Cipolla" },
          ].map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r} fill="var(--bg)" stroke={n.col || "var(--line-hi)"} strokeWidth="1" />
              {n.col && <circle cx={n.x} cy={n.y} r={n.r - 2} fill={n.col} opacity="0.5" />}
              <text x={n.x + n.r + 6} y={n.y + 3} fill="var(--fg-dim)" fontSize="9" fontFamily="JetBrains Mono">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
        {[["DEPTH", "3"], ["NODES", "11"], ["VARIANTS", "47"]].map(([k, v]) => (
          <div key={k}>
            <div className="t-tag" style={{ fontSize: 8 }}>{k}</div>
            <div className="t-num" style={{ fontSize: 16, color: "var(--fg)" }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ASTROLOGICAL CLOCK PANEL — right rail compact
function AstrologicalClockPanel() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span className="t-tag">ASTROLOGICAL CLOCK</span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "blink 1.4s ease-in-out infinite" }} data-motion /> LIVE
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          { p: "Sun",     sym: "☉", h: "12°47′ Libra",   d: "natal house 12", a: false },
          { p: "Moon",    sym: "☽", h: "03°12′ Cancer",  d: "void of course",  a: false },
          { p: "Mercury", sym: "☿", h: "28°08′ Virgo",   d: "stationing",     a: false },
          { p: "Venus",   sym: "♀", h: "19°51′ Virgo",   d: "retrograde",     a: false },
          { p: "Mars",    sym: "♂", h: "07°34′ Scorpio", d: "current hour",   a: true },
          { p: "Jupiter", sym: "♃", h: "21°02′ Gemini",  d: "natal trine",    a: false },
          { p: "Saturn",  sym: "♄", h: "16°41′ Pisces",  d: "—",              a: false },
        ].map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "20px 1fr auto",
            gap: 10, alignItems: "center",
            padding: "8px 10px",
            background: row.a ? "color-mix(in oklch, var(--accent), transparent 88%)" : "transparent",
            border: row.a ? "1px solid color-mix(in oklch, var(--accent), transparent 60%)" : "1px solid transparent",
            borderRadius: 6,
          }}>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: row.a ? "var(--accent)" : "var(--fg-dim)" }}>{row.sym}</span>
            <div>
              <div className="t-mono" style={{ fontSize: 11, color: "var(--fg)" }}>{row.h}</div>
              <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.08em" }}>{row.d}</div>
            </div>
            <span className="t-mono" style={{ fontSize: 9, color: row.a ? "var(--accent)" : "var(--fg-faint)" }}>{row.a ? "★" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// TONIGHT'S COMPOSITION
function TonightsCompositionPanel() {
  return (
    <div>
      <div className="t-tag" style={{ marginBottom: 12 }}>TONIGHT'S COMPOSITION</div>
      <div style={{ position: "relative", padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 10 }}>
        <AgentImage label="AGENT · COMPOSITION" style={{ marginBottom: 12 }} />
        <div className="t-display" style={{ fontSize: 19, lineHeight: 1.1, color: "var(--fg)", marginBottom: 4 }}>
          Braised cheek, pomegranate molasses, sumac labneh
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span className="chip" style={{ borderColor: "color-mix(in oklch, var(--el-fire), transparent 50%)" }}>
            <span className="el-dot el-fire" /> Fire
          </span>
          <span className="chip"><span className="el-dot el-earth" /> Earth</span>
          <span className="chip">♂ Mars</span>
          <span className="chip">3h 40m</span>
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px 14px" }}>
          Open Recipe <Glyph name="arrow" size={14} />
        </button>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.12em" }}>
            06 SUBSTANCES · $84.20
          </div>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 10px",
            background: "color-mix(in oklch, var(--accent-2), transparent 85%)",
            border: "1px solid color-mix(in oklch, var(--accent-2), transparent 55%)",
            borderRadius: 6,
            color: "var(--accent-2)",
            fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.14em", fontWeight: 600,
            cursor: "pointer",
          }}>
            <ProcurementMark size={12} /> PROCURE
          </button>
        </div>
      </div>
    </div>
  );
}

// PIPELINE PANEL
function PipelinePanel() {
  return (
    <div>
      <div className="t-tag" style={{ marginBottom: 12 }}>SERVICE TELEMETRY</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { name: "/api/astrologize",        lat: "0.42ms", up: true,  ag: false },
          { name: "/api/user/profile",       lat: "0.31ms", up: true,  ag: false },
          { name: "vsop87 · ephemeris",      lat: "12.7ms", up: true,  ag: false },
          { name: "/api/generate-image",     lat: "1.8s",   up: true,  ag: true },
          { name: "planetary_agents",        lat: "0.91s",  up: true,  ag: true },
          { name: "pg · read_model",         lat: "0.18ms", up: true,  ag: false },
        ].map(s => (
          <div key={s.name} style={{
            display: "grid", gridTemplateColumns: "8px 1fr auto",
            gap: 10, alignItems: "center",
            padding: "7px 10px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--line)",
            borderRadius: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.up ? "var(--el-earth)" : "var(--el-fire)", boxShadow: `0 0 6px ${s.up ? "var(--el-earth)" : "var(--el-fire)"}` }} />
            <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-dim)" }}>{s.name}{s.ag && <span style={{ color: "var(--accent)", marginLeft: 6 }}>·AG</span>}</span>
            <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>{s.lat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  LabHeader, Logo, CelestialHeaderClock, AgentImage, SignInScreen, DashboardScreen,
  ThermoQuartet, IngredientCard, CuisineExplorerPanel, SauceLineagePanel,
  AstrologicalClockPanel, TonightsCompositionPanel, PipelinePanel, SigilArt,
});
