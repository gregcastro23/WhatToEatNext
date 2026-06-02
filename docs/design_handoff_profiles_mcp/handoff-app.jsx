/* handoff-app.jsx — focused entry for the Profiles + MCP Engines reference.
   Mounts ONLY the four profile artboards + the relevant Tweaks. The full
   site prototype lives in the parent project; this is the slice a developer
   integrating AgentProfile.tsx / ProfileBlockRegistry.tsx needs. */

const PALETTES = {
  violet: { label: "Violet · Copper", accent: "oklch(0.72 0.18 305)", accent2: "oklch(0.78 0.14 65)" },
  bio:    { label: "Bioluminescent",  accent: "oklch(0.82 0.20 165)", accent2: "oklch(0.78 0.14 90)" },
  prism:  { label: "Prismatic",       accent: "oklch(0.74 0.22 330)", accent2: "oklch(0.78 0.16 220)" },
};

const DEFAULTS = {
  palette: "violet",
  motion: true,
  profile_agent: "monet",
  transit: "sun_trine_saturn",
  sigil_style: "triangles",
  user_tab: "essence",
  viewer_spirit: 71,
  viewer_essence: 84,
  viewer_matter: 32,
  viewer_substance: 45,
};

function applyTheme(palette) {
  const p = PALETTES[palette] || PALETTES.violet;
  const root = document.documentElement;
  root.style.setProperty("--accent", p.accent);
  root.style.setProperty("--accent-2", p.accent2);
  root.style.setProperty("--accent-soft", `color-mix(in oklch, ${p.accent}, transparent 70%)`);
  root.style.setProperty("--accent-glow", `color-mix(in oklch, ${p.accent}, transparent 80%)`);
}

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);
  React.useEffect(() => { applyTheme(t.palette); }, [t.palette]);
  React.useEffect(() => { document.body.classList.toggle("motion-off", !t.motion); }, [t.motion]);

  const viewerThermo = {
    spirit: t.viewer_spirit / 100, essence: t.viewer_essence / 100,
    matter: t.viewer_matter / 100, substance: t.viewer_substance / 100,
  };

  return (
    <>
      <DesignCanvas projectTitle="alchm.kitchen" projectSubtitle="Profiles · MCP Alchemical Engines">
        <DCSection id="profiles" title="Profiles · MCP Alchemical Engines">
          <DCArtboard id="agent-profile-d" label={`01 · Agent Profile · ${AGENTS[t.profile_agent].name} · Desktop`} width={1440} height={1340}>
            <AgentProfileScreen agentKey={t.profile_agent} transitId={t.transit} sigilStyle={t.sigil_style} motion={t.motion} viewerThermo={viewerThermo} />
          </DCArtboard>
          <DCArtboard id="agent-profile-m" label={`02 · Agent Profile · ${AGENTS[t.profile_agent].name} · Mobile`} width={390} height={1180}>
            <MobileAgentProfile agentKey={t.profile_agent} transitId={t.transit} sigilStyle={t.sigil_style} motion={t.motion} viewerThermo={viewerThermo} />
          </DCArtboard>
          <DCArtboard id="user-profile-d" label={`03 · User Profile · ${t.user_tab} · Desktop`} width={1440} height={1040}>
            <UserProfileScreen tab={t.user_tab} motion={t.motion} />
          </DCArtboard>
          <DCArtboard id="user-profile-m" label={`04 · User Profile · ${t.user_tab} · Mobile`} width={390} height={900}>
            <MobileUserProfile tab={t.user_tab} motion={t.motion} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks" defaults={DEFAULTS}>
        <TweakSection title="Profiles · MCP Engines">
          <TweakRadio label="Active agent" value={t.profile_agent} onChange={(v) => setTweak("profile_agent", v)}
            options={[{ value: "monet", label: "Monet · Water" }, { value: "galileo", label: "Galileo · Earth" }]} />
          <TweakSelect label="Live transit" value={t.transit} onChange={(v) => setTweak("transit", v)}
            options={[
              { value: "sun_trine_saturn", label: "Sun △ Saturn (boost)" },
              { value: "moon_conj_venus",  label: "Moon ☌ Venus (boost)" },
              { value: "jupiter_sext_sun", label: "Jupiter ⚹ Sun (boost)" },
              { value: "mars_square_moon", label: "Mars □ Moon (stress)" },
              { value: "saturn_opp_mars",  label: "Saturn ☍ Mars (stress)" },
            ]} />
          <TweakRadio label="Sigil geometry" value={t.sigil_style} onChange={(v) => setTweak("sigil_style", v)}
            options={[{ value: "triangles", label: "Triangles" }, { value: "concentric", label: "Rings" }, { value: "web", label: "Web" }]} />
          <TweakRadio label="User tab" value={t.user_tab} onChange={(v) => setTweak("user_tab", v)}
            options={[{ value: "essence", label: "Essence" }, { value: "palate", label: "Palate" }, { value: "practice", label: "Practice" }]} />
        </TweakSection>

        <TweakSection title="Viewer Constitution → Synastry">
          <TweakSlider label="Spirit"    value={t.viewer_spirit}    min={0} max={100} unit="q" onChange={(v) => setTweak("viewer_spirit", Number(v))} />
          <TweakSlider label="Essence"   value={t.viewer_essence}   min={0} max={100} unit="q" onChange={(v) => setTweak("viewer_essence", Number(v))} />
          <TweakSlider label="Matter"    value={t.viewer_matter}    min={0} max={100} unit="q" onChange={(v) => setTweak("viewer_matter", Number(v))} />
          <TweakSlider label="Substance" value={t.viewer_substance} min={0} max={100} unit="q" onChange={(v) => setTweak("viewer_substance", Number(v))} />
        </TweakSection>

        <TweakSection title="Display">
          <TweakSelect label="Palette" value={t.palette} onChange={(v) => setTweak("palette", v)}
            options={Object.entries(PALETTES).map(([k, v]) => ({ value: k, label: v.label }))} />
          <TweakToggle label="Motion" value={t.motion} onChange={(v) => setTweak("motion", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
