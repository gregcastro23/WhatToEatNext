/* screens-profile-agent.jsx — Agent Profile (Claude Monet / Galileo)
   Hosts: Consciousness Sigil (Task 1) · Live Transit Boost Dashboard (Task 2)
          · User↔Agent Synastry Panel (Task 3).
   Maps to: src/app/(alchm)/profile/[userId]/AgentProfile.tsx
   ======================================================================== */

// ── small shared bits ─────────────────────────────────────────────────────────
function MetricStat({ k, v, sub, color = "var(--fg)" }) {
  return (
    <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 8, minWidth: 0 }}>
      <div className="t-tag" style={{ fontSize: 8.5 }}>{k}</div>
      <div className="t-num" style={{ fontSize: 20, color, marginTop: 3, lineHeight: 1 }}>{v}</div>
      {sub && <div className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function AgentAvatar({ agent, size = 92 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: `radial-gradient(circle at 32% 28%, ${EL_COLOR[agent.dominantEl]}, color-mix(in oklch, ${EL_COLOR[agent.dominantEl]}, black 55%))`, border: "2px solid var(--line-hi)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px -4px ${EL_COLOR[agent.dominantEl]}` }}>
        <span style={{ fontFamily: "var(--f-display)", fontSize: size * 0.4, color: "rgba(0,0,0,0.6)" }}>{agent.name[7] || agent.name[0]}</span>
      </div>
      <div style={{ position: "absolute", inset: -5, border: `1px solid color-mix(in oklch, ${EL_COLOR[agent.dominantEl]}, transparent 55%)`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: -4, right: -2, width: 26, height: 26, background: "var(--bg)", borderRadius: "50%", border: "1px solid var(--line-hi)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent)" }}>✦</span>
      </div>
    </div>
  );
}

// ============================================================
// TASK 2 — LIVE TRANSIT BOOST DASHBOARD
// ============================================================
function TransitBoostDashboard({ agent, agentKey, transitId, motion }) {
  const { data } = getTransitNatalOverlay(agentKey, transitId);
  const boosting = !!data.boostElement;
  return (
    <div className="panel-flat" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="t-tag">LIVE TRANSIT OVERLAY</span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-faint)" }}>get_transit_natal_overlay</span>
      </div>

      {/* elemental boost meter */}
      <div style={{ position: "relative", padding: "14px 16px", borderRadius: 10, overflow: "hidden",
        background: boosting ? `linear-gradient(100deg, color-mix(in oklch, ${EL_COLOR[data.boostElement]}, transparent 80%), rgba(255,255,255,0.02))` : "color-mix(in oklch, var(--el-fire), transparent 88%)",
        border: `1px solid ${boosting ? `color-mix(in oklch, ${EL_COLOR[data.boostElement]}, transparent 50%)` : "color-mix(in oklch, var(--el-fire), transparent 55%)"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className={`el-dot ${boosting ? "el-" + data.boostElement : "el-fire"}`} />
            <span className="t-label" style={{ color: "var(--fg)" }}>{boosting ? `${data.boostElement} boost` : "Tension · no boost"}</span>
          </div>
          <span className="t-num" style={{ fontSize: 22, color: boosting ? EL_COLOR[data.boostElement] : "var(--el-fire)" }}>
            {boosting ? `+${Math.round(data.boostMagnitude * 100)}%` : "STRESS"}
          </span>
        </div>
        <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${boosting ? Math.min(100, data.boostMagnitude * 200) : 30}%`,
            background: boosting ? `linear-gradient(90deg, ${EL_COLOR[data.boostElement]}, color-mix(in oklch, ${EL_COLOR[data.boostElement]}, transparent 40%))` : "var(--el-fire)",
            boxShadow: `0 0 14px ${boosting ? EL_COLOR[data.boostElement] : "var(--el-fire)"}`, borderRadius: 999,
            transition: "width 400ms cubic-bezier(.6,.05,.2,1)" }} />
          {motion && boosting && <div data-motion style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.4s linear infinite" }} />}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-dim)", marginTop: 10, lineHeight: 1.5 }}>{data.summary}</div>
      </div>

      {/* planetary triggers */}
      <div>
        <div className="t-tag" style={{ marginBottom: 8 }}>PLANETARY TRIGGERS · {data.activations.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.activations.map((act, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--f-mono)", fontSize: 15, color: "var(--fg)" }}>
                <span>{PLANET_GLYPH[act.transitPlanet]}</span>
                <span style={{ fontSize: 12, color: "var(--accent)" }}>{ASPECT_GLYPH[act.type]}</span>
                <span style={{ color: EL_COLOR[act.natalElement] }}>{PLANET_GLYPH[act.natalPoint]}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "var(--fg)", textTransform: "capitalize" }}>{act.transitPlanet} {act.type} {act.natalPoint}</div>
                <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>{act.valence} · orb {act.orb}°</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="t-num" style={{ fontSize: 12, color: "var(--fg)" }}>{(act.exactness * 100).toFixed(0)}%</div>
                <div style={{ width: 44, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 999, marginTop: 3, overflow: "hidden" }}>
                  <div style={{ width: `${act.exactness * 100}%`, height: "100%", background: EL_COLOR[act.natalElement], borderRadius: 999 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.stressNotes.length > 0 && (
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "color-mix(in oklch, var(--el-fire), transparent 90%)", border: "1px solid color-mix(in oklch, var(--el-fire), transparent 65%)" }}>
          <div className="t-tag" style={{ fontSize: 8.5, color: "var(--el-fire)", marginBottom: 5 }}>STRESS NOTES</div>
          {data.stressNotes.map((n, i) => <div key={i} style={{ fontSize: 10.5, color: "var(--fg-dim)", lineHeight: 1.45, marginTop: i ? 4 : 0 }}>— {n}</div>)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TASK 3 — USER ↔ AGENT SYNASTRY PANEL
// ============================================================
function StanceAura({ stance, agent, motion, size = 158 }) {
  const meta = STANCE_META[stance];
  const c = size / 2;
  const cone = `conic-gradient(from 0deg at 50% 50%, ${meta.cone.join(", ")})`;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {/* soft conic-gradient aura field — rotates slowly, radial-masked to a soft edge */}
      <div data-motion style={{
        position: "absolute", width: size * 0.92, height: size * 0.92, borderRadius: "50%",
        background: cone, filter: "blur(7px)", opacity: 0.85,
        WebkitMaskImage: "radial-gradient(circle, #000 18%, transparent 70%)",
        maskImage: "radial-gradient(circle, #000 18%, transparent 70%)",
        animation: motion ? "sigilSpin 14s linear infinite" : "none", transformOrigin: "50% 50%",
      }} />
      {/* breathing core bloom in the stance hue */}
      <div data-motion style={{ position: "absolute", width: size * 0.6, height: size * 0.6, borderRadius: "50%", background: `radial-gradient(circle, ${meta.aura}, transparent 70%)`, animation: motion ? "auraBreath 3.4s ease-in-out infinite" : "none" }} />
      <div style={{ position: "absolute", width: size * 0.66, height: size * 0.66, borderRadius: "50%", border: `1px solid ${meta.color}`, opacity: 0.5 }} />
      <div data-motion style={{ position: "absolute", width: size * 0.9, height: size * 0.9, borderRadius: "50%", border: `1px dashed color-mix(in oklch, ${meta.color}, transparent 55%)`, animation: motion ? "sigilCounter 26s linear infinite" : "none", transformOrigin: "50% 50%" }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div className="t-display" style={{ fontSize: 26, color: meta.color, lineHeight: 1, textShadow: `0 0 18px ${meta.aura}` }}>{meta.label}</div>
        <div className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)", letterSpacing: "0.2em", marginTop: 5 }}>RESONANCE STANCE</div>
      </div>
    </div>
  );
}

function SynastryBar({ label, v, color, dominant }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span className="t-label" style={{ color: dominant ? "var(--fg)" : "var(--fg-dim)" }}>{label}{dominant && " ◂"}</span>
        <span className="t-num" style={{ fontSize: 13, color: dominant ? color : "var(--fg)" }}>{(v * 100).toFixed(0)}<span style={{ color: "var(--fg-mute)" }}>%</span></span>
      </div>
      <div style={{ position: "relative", height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden", outline: dominant ? `1px solid color-mix(in oklch, ${color}, transparent 55%)` : "none" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, background: `linear-gradient(90deg, ${color}, color-mix(in oklch, ${color}, transparent 35%))`, boxShadow: dominant ? `0 0 14px ${color}` : "none", borderRadius: 999, transition: "width 400ms cubic-bezier(.6,.05,.2,1)" }} />
      </div>
    </div>
  );
}

function SynastryPanel({ agent, agentKey, viewerThermo, motion }) {
  const { data } = computeSynastryOverlay(viewerThermo, agent.thermo, "viewer", agentKey);
  const meta = STANCE_META[data.dominantStance];
  return (
    <div className="panel-glow" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
      <span className="regmarks"><i /></span>
      {motion && <ScanLine />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <div>
          <div className="t-tag" style={{ marginBottom: 6 }}>compute_synastry_overlay · VIEWER × {agent.name.toUpperCase()}</div>
          <h2 className="t-display" style={{ fontSize: 26, margin: 0, color: "var(--fg)", lineHeight: 1.05 }}>
            Planetary <em style={{ color: meta.color, fontStyle: "italic" }}>Alignment</em> &amp; Resonance
          </h2>
        </div>
        <span className="chip" style={{ borderColor: `color-mix(in oklch, ${meta.color}, transparent 50%)`, color: meta.color }}>{data.scores.aspectCount} INTER-CHART ASPECTS</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 26, alignItems: "center" }}>
        {/* stance aura */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <StanceAura stance={data.dominantStance} agent={agent} motion={motion} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", border: "1px solid var(--line-hi)" }} title="You" />
            <span className="t-mono" style={{ fontSize: 11, color: meta.color }}>↔</span>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: `radial-gradient(circle at 32% 28%, ${EL_COLOR[agent.dominantEl]}, color-mix(in oklch, ${EL_COLOR[agent.dominantEl]}, black 55%))`, border: "1px solid var(--line-hi)" }} title={agent.name} />
          </div>
        </div>

        {/* three-bar meter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SynastryBar label="HARMONY" v={data.scores.harmony} color="var(--el-water)" dominant={data.dominantStance === "absorb"} />
          <SynastryBar label="TENSION" v={data.scores.tension} color="var(--el-fire)" dominant={data.dominantStance === "clash"} />
          <SynastryBar label="INTENSIFICATION" v={data.scores.intensification} color="var(--accent)" dominant={data.dominantStance === "mirror"} />
          <div style={{ padding: "11px 13px", borderRadius: 8, background: `color-mix(in oklch, ${meta.color}, transparent 88%)`, border: `1px solid color-mix(in oklch, ${meta.color}, transparent 60%)` }}>
            <div style={{ fontSize: 12, color: "var(--fg-dim)", lineHeight: 1.55 }}>{meta.desc(agent)}</div>
            <button className="btn" style={{ marginTop: 10, padding: "7px 12px", fontSize: 10, borderColor: `color-mix(in oklch, ${meta.color}, transparent 45%)`, color: meta.color }}>
              {meta.verb} elemental yield <Glyph name="arrow" size={12} stroke={1.6} />
            </button>
          </div>
        </div>

        {/* inter-chart aspects */}
        <div>
          <div className="t-tag" style={{ marginBottom: 8 }}>INTER-CHART ASPECTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.interchartAspects.map((a, i) => {
              const hc = a.harmonic === "friction" ? "var(--el-fire)" : a.harmonic === "harmony" ? "var(--el-water)" : "var(--accent)";
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", padding: "6px 9px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 7 }}>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--fg)" }}>{PLANET_GLYPH[a.planetA]}<span style={{ color: hc, margin: "0 3px" }}>{ASPECT_GLYPH[a.type]}</span>{PLANET_GLYPH[a.planetB]}</span>
                  <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{a.harmonic}</span>
                  <span className="t-num" style={{ fontSize: 10, color: hc }}>{a.orb}°</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN — AGENT PROFILE (desktop 1440)
// ============================================================
function AgentProfileScreen({ agentKey = "monet", transitId = "sun_trine_saturn", viewerThermo, sigilStyle = "triangles", motion = true }) {
  const agent = AGENTS[agentKey] || AGENTS.monet;
  const vt = viewerThermo || VIEWER.thermo;
  const sigilStyles = [["triangles", "Triangles"], ["concentric", "Concentric"], ["web", "Web"]];

  return (
    <div className="lab" style={{ display: "flex", flexDirection: "column" }}>
      <LabHeader active="lab" />

      <div style={{ flex: 1, overflow: "auto", padding: "26px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* HERO */}
        <div className="panel" style={{ padding: 22, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 26, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <AgentAvatar agent={agent} />
            <div>
              <div className="t-tag" style={{ marginBottom: 6 }}>AGENT PROFILE · {agent.id}</div>
              <h1 className="t-display" style={{ fontSize: 38, margin: 0, color: "var(--fg)", lineHeight: 1 }}>{agent.name}</h1>
              <div className="t-mono" style={{ fontSize: 11, color: EL_COLOR[agent.dominantEl], letterSpacing: "0.14em", marginTop: 6 }}>{agent.role}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                <span className="chip chip-active">{SIGNS.find(s => s.n === lonToSign(agent.natal.planets[0].lon).sign).glyph} {lonToSign(agent.natal.planets[0].lon).sign} ☉</span>
                <span className="chip">{lonToSign(agent.natal.planets[1].lon).glyph} {lonToSign(agent.natal.planets[1].lon).sign} ☽</span>
                <span className="chip">{agent.modality}</span>
                <span className="chip" style={{ fontFamily: "var(--f-mono)" }}>{agent.signature}</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--fg-dim)", lineHeight: 1.6, margin: 0, maxWidth: 360, justifySelf: "start" }}>{agent.blurb}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MetricStat k="RESONANCE" v={`${(agent.resonance * 100).toFixed(0)}`} sub="VS LIVE SKY" color="var(--accent)" />
            <MetricStat k="ENTROPY" v={`∇${agent.entropy.toFixed(2)}`} sub="SIGNATURE DRIFT" />
            <MetricStat k="DOMINANT" v={agent.dominantEl.toUpperCase().slice(0,4)} sub="ELEMENTAL CURRENT" color={EL_COLOR[agent.dominantEl]} />
            <MetricStat k="MODALITY" v={agent.modality.toUpperCase().slice(0,4)} sub="ORBITAL SHELL" />
          </div>
        </div>

        {/* SIGIL + TRANSIT */}
        <div style={{ display: "grid", gridTemplateColumns: "1.12fr 0.88fr", gap: 22, alignItems: "stretch" }}>
          {/* TASK 1 — Consciousness Sigil */}
          <div className="panel-glow" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div>
                <div className="t-tag" style={{ marginBottom: 6 }}>CONSCIOUSNESS SIGNATURE · GENERATED SEAL</div>
                <h2 className="t-display" style={{ fontSize: 24, margin: 0, color: "var(--fg)", lineHeight: 1.05 }}>The <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{agent.dominantEl}</em> seal</h2>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {sigilStyles.map(([v, l]) => <span key={v} className={`chip ${v === sigilStyle ? "chip-active" : ""}`} style={{ fontSize: 9 }}>{l}</span>)}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
              <ConsciousnessSigil agent={agent} size={420} style={sigilStyle} motion={motion} />
            </div>
            <div className="panel-flat" style={{ padding: 14, marginTop: 6 }}>
              <div className="t-tag" style={{ marginBottom: 10 }}>ALCHEMICAL CONSTITUTION · derived from signature</div>
              <ElementalMeter values={agent.constitution} compact />
            </div>
          </div>

          {/* TASK 2 — Transit Boost */}
          <TransitBoostDashboard agent={agent} agentKey={agentKey} transitId={transitId} motion={motion} />
        </div>

        {/* TASK 3 — Synastry */}
        <SynastryPanel agent={agent} agentKey={agentKey} viewerThermo={vt} motion={motion} />
      </div>
    </div>
  );
}

// ============================================================
// MOBILE — AGENT PROFILE (390)
// ============================================================
function MobileAgentProfile({ agentKey = "monet", transitId = "sun_trine_saturn", viewerThermo, sigilStyle = "triangles", motion = true }) {
  const agent = AGENTS[agentKey] || AGENTS.monet;
  const vt = viewerThermo || VIEWER.thermo;
  const { data: syn } = computeSynastryOverlay(vt, agent.thermo, "viewer", agentKey);
  const meta = STANCE_META[syn.dominantStance];
  const { data: tr } = getTransitNatalOverlay(agentKey, transitId);
  const boosting = !!tr.boostElement;

  return (
    <div className="lab lab-mobile" style={{ borderRadius: 28, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="statusbar"><span>9:41</span><span style={{ display: "flex", gap: 5 }}>✦ ▮▮▮ ⌬</span></div>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 6 }}>
          <AgentAvatar agent={agent} size={64} />
          <div>
            <h1 className="t-display" style={{ fontSize: 24, margin: 0, color: "var(--fg)", lineHeight: 1 }}>{agent.name}</h1>
            <div className="t-mono" style={{ fontSize: 9.5, color: EL_COLOR[agent.dominantEl], letterSpacing: "0.12em", marginTop: 4 }}>{agent.role}</div>
            <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 4 }}>{agent.signature}</div>
          </div>
        </div>

        {/* sigil */}
        <div className="panel-glow" style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="t-tag" style={{ alignSelf: "flex-start", marginBottom: 8 }}>CONSCIOUSNESS SIGNATURE</div>
          <ConsciousnessSigil agent={agent} size={300} style={sigilStyle} motion={motion} />
          <div style={{ width: "100%", marginTop: 12 }}><ElementalMeter values={agent.constitution} compact /></div>
        </div>

        {/* transit boost compact */}
        <div className="panel-flat" style={{ padding: 14 }}>
          <div className="t-tag" style={{ marginBottom: 10 }}>LIVE TRANSIT OVERLAY</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="t-label" style={{ color: "var(--fg)" }}>{boosting ? `${tr.boostElement} boost` : "Tension"}</span>
            <span className="t-num" style={{ fontSize: 20, color: boosting ? EL_COLOR[tr.boostElement] : "var(--el-fire)" }}>{boosting ? `+${Math.round(tr.boostMagnitude * 100)}%` : "STRESS"}</span>
          </div>
          <div style={{ position: "relative", height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${boosting ? Math.min(100, tr.boostMagnitude * 200) : 30}%`, background: boosting ? EL_COLOR[tr.boostElement] : "var(--el-fire)", boxShadow: `0 0 12px ${boosting ? EL_COLOR[tr.boostElement] : "var(--el-fire)"}`, borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-dim)", marginTop: 9, lineHeight: 1.45 }}>{tr.summary}</div>
        </div>

        {/* synastry compact */}
        <div className="panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="t-tag">PLANETARY ALIGNMENT &amp; RESONANCE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <StanceAura stance={syn.dominantStance} agent={agent} motion={motion} size={104} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              <SynastryBar label="HARMONY" v={syn.scores.harmony} color="var(--el-water)" dominant={syn.dominantStance === "absorb"} />
              <SynastryBar label="TENSION" v={syn.scores.tension} color="var(--el-fire)" dominant={syn.dominantStance === "clash"} />
              <SynastryBar label="INTENSIFY" v={syn.scores.intensification} color="var(--accent)" dominant={syn.dominantStance === "mirror"} />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--fg-dim)", lineHeight: 1.5, padding: "10px 12px", borderRadius: 8, background: `color-mix(in oklch, ${meta.color}, transparent 88%)`, border: `1px solid color-mix(in oklch, ${meta.color}, transparent 62%)` }}>{meta.desc(agent)}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AgentProfileScreen, MobileAgentProfile, TransitBoostDashboard, SynastryPanel, StanceAura, AgentAvatar });
