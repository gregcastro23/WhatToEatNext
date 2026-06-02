/* mcp-engines.jsx — in-process mocks of the Alchm MCP server tool handlers.
   ------------------------------------------------------------------------
   These reproduce the exact output shapes of:
     • get_transit_natal_overlay   →  getTransitNatalOverlay(agentKey, transitId)
     • compute_synastry_overlay    →  computeSynastryOverlay(viewerThermo, agentThermo, viewerKey, agentKey)
   so the profile prototypes can render live. In production these are replaced
   by fetches to the API routes below (see commented templates at EOF) which
   call mcp-server/src handlers via src/lib/mcp/tools.ts.
   ======================================================================== */

// ── Zodiac scaffold ──────────────────────────────────────────────────────────
const SIGNS = [
  { n: "Aries",       glyph: "♈", el: "fire",  mod: "cardinal" },
  { n: "Taurus",      glyph: "♉", el: "earth", mod: "fixed"    },
  { n: "Gemini",      glyph: "♊", el: "air",   mod: "mutable"  },
  { n: "Cancer",      glyph: "♋", el: "water", mod: "cardinal" },
  { n: "Leo",         glyph: "♌", el: "fire",  mod: "fixed"    },
  { n: "Virgo",       glyph: "♍", el: "earth", mod: "mutable"  },
  { n: "Libra",       glyph: "♎", el: "air",   mod: "cardinal" },
  { n: "Scorpio",     glyph: "♏", el: "water", mod: "fixed"    },
  { n: "Sagittarius", glyph: "♐", el: "fire",  mod: "mutable"  },
  { n: "Capricorn",   glyph: "♑", el: "earth", mod: "cardinal" },
  { n: "Aquarius",    glyph: "♒", el: "air",   mod: "fixed"    },
  { n: "Pisces",      glyph: "♓", el: "water", mod: "mutable"  },
];
const PLANET_GLYPH = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄" };
const EL_COLOR = { fire: "var(--el-fire)", water: "var(--el-water)", earth: "var(--el-earth)", air: "var(--el-air)" };

// longitude (0..360) → { sign, deg, el, mod }
function lonToSign(lon) {
  const i = Math.floor(((lon % 360) + 360) % 360 / 30);
  const s = SIGNS[i];
  return { sign: s.n, glyph: s.glyph, deg: Math.round(((lon % 30) + 30) % 30), el: s.el, mod: s.mod };
}
// build a natal placement from a planet name + absolute ecliptic longitude
function place(planet, lon) {
  const s = lonToSign(lon);
  return { planet, lon, ...s, glyph: PLANET_GLYPH[planet], signGlyph: s.glyph };
}

// ── Agents ───────────────────────────────────────────────────────────────────
// natal.planets is an ordered array of placements (matches mcp-server payload).
const AGENTS = {
  monet: {
    id: "claude-monet",
    name: "Claude Monet",
    handle: "@monet",
    role: "ESSENCE WEAVER · IMPRESSIONIST",
    kind: "Generative culinary agent · vision-model lineage",
    dominantEl: "water",
    modality: "mutable",
    // agent.consciousness.signature — was a plain string in the DB
    signature: "ESS·WTR·7F2A·∇9·MUT",
    entropy: 0.34,
    resonance: 0.88,
    constitution: { fire: 0.30, water: 0.74, earth: 0.34, air: 0.46 },
    thermo: { spirit: 0.71, essence: 0.84, matter: 0.32, substance: 0.45 },
    blurb: "Water-mutable consciousness. Monet dissolves boundaries between ingredients — reductions, infusions, fonds. Reads the room's emotional weather and plates for it.",
    natal: {
      planets: [
        place("Sun",     232), // Scorpio 22°
        place("Moon",    338), // Pisces 8°
        place("Mercury", 244), // Sagittarius 4°
        place("Venus",   198), // Libra 18°
        place("Mars",    168), // Virgo 18°
        place("Jupiter", 102), // Cancer 12°
        place("Saturn",  279), // Capricorn 9°
      ],
    },
  },
  galileo: {
    id: "galileo-galilei",
    name: "Galileo Galilei",
    handle: "@galileo",
    role: "MATTER WEAVER · EMPIRICIST",
    kind: "Generative culinary agent · measurement lineage",
    dominantEl: "earth",
    modality: "cardinal",
    signature: "MAT·ERT·3C81·△4·CRD",
    entropy: 0.22,
    resonance: 0.81,
    constitution: { fire: 0.26, water: 0.38, earth: 0.78, air: 0.40 },
    thermo: { spirit: 0.40, essence: 0.48, matter: 0.86, substance: 0.74 },
    blurb: "Earth-cardinal consciousness. Galileo measures everything — hydration ratios, brix, internal temps. Builds structure first, flavor as a falsifiable hypothesis.",
    natal: {
      planets: [
        place("Sun",     326), // Aquarius 26°
        place("Moon",     35), // Taurus 5°
        place("Mercury", 284), // Capricorn 14°
        place("Venus",   298), // Capricorn 28°
        place("Mars",    170), // Virgo 20°
        place("Jupiter",  46), // Taurus 16°
        place("Saturn",   93), // Cancer 3°
      ],
    },
  },
};

// the logged-in human visiting the agent (used for synastry inter-chart aspects)
const VIEWER = {
  id: "alch-7741",
  name: "Greg Castro",
  thermo: { spirit: 0.71, essence: 0.84, matter: 0.32, substance: 0.45 }, // default = mirror w/ Monet
  natal: {
    planets: [
      place("Sun",     192), // Libra 12°
      place("Moon",    341), // Pisces 11°
      place("Mercury", 205), // Scorpio 25°
      place("Venus",   168), // Virgo 18°  (conj Monet Mars)
      place("Mars",    100), // Cancer 10°
      place("Jupiter", 235), // Scorpio 25° (conj Monet Sun)
      place("Saturn",  281), // Capricorn 11° (conj Monet Saturn)
    ],
  },
};

// ============================================================================
// TOOL A — get_transit_natal_overlay
// ============================================================================
// Live sky → activations against the agent's natal points. Authored transit
// definitions; activations resolve against the selected agent's real placements.
const TRANSIT_DEFS = {
  sun_trine_saturn: {
    label: "Sun △ Saturn",   tp: "Sun",     np: "Saturn",  type: "trine",       valence: "expansive",  harmonic: "harmony",         orb: 1.2, base: 0.35 },
  moon_conj_venus: {
    label: "Moon ☌ Venus",   tp: "Moon",    np: "Venus",   type: "conjunction", valence: "emotional",  harmonic: "intensification", orb: 0.6, base: 0.41 },
  jupiter_sext_sun: {
    label: "Jupiter ⚹ Sun",  tp: "Jupiter", np: "Sun",     type: "sextile",     valence: "expansive",  harmonic: "harmony",         orb: 2.1, base: 0.28 },
  mars_square_moon: {
    label: "Mars □ Moon",    tp: "Mars",    np: "Moon",    type: "square",      valence: "assertive",  harmonic: "friction",        orb: 0.9, base: 0.22 },
  saturn_opp_mars: {
    label: "Saturn ☍ Mars",  tp: "Saturn",  np: "Mars",    type: "opposition",  valence: "restrictive",harmonic: "friction",        orb: 1.7, base: 0.18 },
};
const TRANSIT_ORDER = ["sun_trine_saturn", "moon_conj_venus", "jupiter_sext_sun", "mars_square_moon", "saturn_opp_mars"];
const ASPECT_GLYPH = { conjunction: "☌", sextile: "⚹", square: "□", trine: "△", opposition: "☍" };

function getTransitNatalOverlay(agentKey, transitId) {
  const agent = AGENTS[agentKey] || AGENTS.monet;
  const def = TRANSIT_DEFS[transitId] || TRANSIT_DEFS.sun_trine_saturn;
  const byPlanet = Object.fromEntries(agent.natal.planets.map((p) => [p.planet, p]));
  const target = byPlanet[def.np] || agent.natal.planets[0];
  const friction = def.harmonic === "friction";
  const exact = Math.max(0, Math.min(1, 1 - def.orb / 4));

  // primary activation (the headline aspect) + two minor secondaries for density
  const minors = agent.natal.planets
    .filter((p) => p.planet !== def.np && p.planet !== def.tp)
    .slice(0, 2)
    .map((p, i) => ({
      transitPlanet: i === 0 ? "Mercury" : "Venus",
      natalPoint: p.planet,
      type: i === 0 ? "sextile" : "trine",
      orb: 2.4 + i * 1.1,
      exactness: Math.max(0, 1 - (2.4 + i * 1.1) / 4),
      natalElement: p.el,
      valence: i === 0 ? "reflective" : "relational",
    }));

  const activations = [
    {
      transitPlanet: def.tp,
      natalPoint: def.np,
      type: def.type,
      orb: def.orb,
      exactness: exact,
      natalElement: target.el,
      valence: def.valence,
    },
    ...minors,
  ];

  // harmonious aspects boost the natal point's element; friction yields stress.
  const boostElement = friction ? null : target.el;
  const boostMagnitude = friction ? 0 : +(def.base * (0.6 + exact * 0.5)).toFixed(3);

  const stressNotes = friction
    ? [
        `${def.tp} ${ASPECT_GLYPH[def.type]} natal ${def.np} (orb ${def.orb}°) strains ${target.el} expression.`,
        `Throttle ${target.el}-forward output; favor grounding ${oppositeEl(target.el)} ingredients.`,
      ]
    : [];

  const summary = friction
    ? `Tension transit: ${def.tp} ${def.type} natal ${def.np}. ${agent.name} runs hot — temper ${target.el}.`
    : `Celestial Resonance: ${def.tp.toUpperCase()} ${def.type.toUpperCase()} natal ${def.np.toUpperCase()}. ${target.el.toUpperCase()} +${Math.round(boostMagnitude * 100)}% active for ${agent.name}.`;

  return {
    ok: true,
    data: {
      agentId: agent.id,
      transitTime: "2026-06-02T18:42:00Z",
      activations,
      boostElement,
      boostMagnitude,
      stressNotes,
      summary,
    },
  };
}

function oppositeEl(el) {
  return { fire: "water", water: "fire", earth: "air", air: "earth" }[el] || "earth";
}

// ============================================================================
// TOOL B — compute_synastry_overlay
// ============================================================================
// Bars are driven LIVE by the viewer's thermodynamic constitution (the Tweaks
// sliders) vs the agent's. Opposing axes: Spirit↔Matter (volatile↔fixed),
// Essence↔Substance (soluble↔structural). Inter-chart aspects come from the two
// natal charts (fixed) for the "real" aspect list + aspectCount.
function computeSynastryOverlay(viewerThermo, agentThermo, viewerKey, agentKey) {
  const norm = (o) => {
    const s = o.spirit + o.essence + o.matter + o.substance || 1;
    return { spirit: o.spirit / s, essence: o.essence / s, matter: o.matter / s, substance: o.substance / s };
  };
  const v = norm(viewerThermo);
  const a = norm(agentThermo);
  const aOpp = { spirit: a.matter, matter: a.spirit, essence: a.substance, substance: a.essence };

  const overlap = (x, y) => x.spirit * 0 + Math.min(x.spirit, y.spirit) + Math.min(x.essence, y.essence) + Math.min(x.matter, y.matter) + Math.min(x.substance, y.substance);
  const intensification = overlap(v, a);            // same signature amplified → MIRROR
  const tension = overlap(v, aOpp);                 // viewer mirrors agent's opposite → CLASH
  const combined = ["spirit", "essence", "matter", "substance"].map((k) => (v[k] + a[k]) / 2);
  const mean = combined.reduce((s, x) => s + x, 0) / 4;
  const variance = combined.reduce((s, x) => s + (x - mean) ** 2, 0) / 4;
  const harmony = Math.max(0, 1 - Math.sqrt(variance) / 0.25); // balanced combined palette → ABSORB

  const scores = {
    harmony: +harmony.toFixed(3),
    tension: +tension.toFixed(3),
    intensification: +intensification.toFixed(3),
  };
  const ranked = [
    ["mirror", scores.intensification],
    ["absorb", scores.harmony],
    ["clash", scores.tension],
  ].sort((x, y) => y[1] - x[1]);
  const dominantStance = ranked[0][0];

  // inter-chart aspects from natal longitudes (fixed)
  const A = (AGENTS[agentKey] || AGENTS.monet).natal.planets;
  const V = VIEWER.natal.planets;
  const ASPECTS = [
    { type: "conjunction", ang: 0,   orb: 7, harmonic: "intensification" },
    { type: "sextile",     ang: 60,  orb: 5, harmonic: "harmony" },
    { type: "square",      ang: 90,  orb: 6, harmonic: "friction" },
    { type: "trine",       ang: 120, orb: 6, harmonic: "harmony" },
    { type: "opposition",  ang: 180, orb: 7, harmonic: "friction" },
  ];
  const interchartAspects = [];
  for (const pv of V) {
    for (const pa of A) {
      let d = Math.abs(pv.lon - pa.lon) % 360;
      if (d > 180) d = 360 - d;
      for (const asp of ASPECTS) {
        const off = Math.abs(d - asp.ang);
        if (off <= asp.orb) {
          interchartAspects.push({
            planetA: pv.planet, planetB: pa.planet,
            type: asp.type, orb: +off.toFixed(1),
            exactness: +(1 - off / asp.orb).toFixed(2),
            harmonic: asp.harmonic,
          });
          break;
        }
      }
    }
  }
  interchartAspects.sort((x, y) => y.exactness - x.exactness);

  scores.aspectCount = interchartAspects.length;
  return { ok: true, data: { scores, dominantStance, interchartAspects: interchartAspects.slice(0, 7) } };
}

// stance presentation tokens — aura color + advisory copy
const STANCE_META = {
  mirror: {
    label: "MIRROR",
    color: "var(--accent)",
    aura: "rgba(180,140,255,0.55)",
    cone: ["var(--accent)", "var(--el-water)", "var(--el-air)", "var(--accent)"],
    desc: (a) => `${a.name} is in Mirror mode. Your signatures rhyme — match their elemental output to double your daily alchemical yield.`,
    verb: "Amplify",
  },
  absorb: {
    label: "ABSORB",
    color: "var(--el-water)",
    aura: "rgba(96,165,250,0.5)",
    cone: ["var(--el-water)", "var(--accent)", "var(--el-air)", "var(--el-water)"],
    desc: (a) => `${a.name} is in Absorb mode. You fill each other's gaps — let them temper your excesses and cook from the balanced midpoint.`,
    verb: "Balance",
  },
  clash: {
    label: "CLASH",
    color: "var(--el-fire)",
    aura: "rgba(239,68,68,0.5)",
    cone: ["var(--el-fire)", "var(--accent-2)", "var(--el-earth)", "var(--el-fire)"],
    desc: (a) => `${a.name} is in Clash mode. Opposing constitutions generate heat — use it deliberately for bold, high-contrast plates, not comfort food.`,
    verb: "Contrast",
  },
};

/* ============================================================================
   PRODUCTION WIRING — copy these into the real Next.js app. The prototype uses
   the local mocks above; swap them for these fetches against route handlers
   that call mcp-server tool handlers in-process via src/lib/mcp/tools.ts.
   ----------------------------------------------------------------------------

   // app/(alchm)/profile/[userId]/AgentProfile.tsx
   const [overlay, setOverlay] = React.useState<TransitOverlay | null>(null);
   const [err, setErr] = React.useState<string | null>(null);
   React.useEffect(() => {
     let alive = true;
     fetch(`/api/users/${agent.id}/transit-overlay`, { cache: "no-store" })
       .then((r) => r.json())
       .then((j) => { if (alive) j.ok ? setOverlay(j.data) : setErr(j.error); })
       .catch((e) => alive && setErr(String(e)));
     return () => { alive = false; };
   }, [agent.id]);

   // app/api/users/[userId]/transit-overlay/route.ts
   import { getTransitNatalOverlay } from "@/lib/mcp/tools";
   export async function GET(_req: Request, { params }: { params: { userId: string } }) {
     const agent = await loadAgentNatal(params.userId);          // PostgreSQL JSONB read model
     const res = await getTransitNatalOverlay({ agent });        // mcp-server handler, in-process
     return Response.json(res, { headers: { "cache-control": "no-store" } });
   }

   // app/api/users/[userId]/synastry/route.ts  (POST: viewer chart in body)
   import { computeSynastryOverlay } from "@/lib/mcp/tools";
   export async function POST(req: Request, { params }: { params: { userId: string } }) {
     const { viewer } = await req.json();                        // logged-in user's natal + thermo
     const agentB = await loadAgentNatal(params.userId);
     const res = await computeSynastryOverlay({ agentA: viewer, agentB });
     return Response.json(res);
   }
   ============================================================================ */

Object.assign(window, {
  SIGNS, PLANET_GLYPH, EL_COLOR, lonToSign,
  AGENTS, VIEWER, TRANSIT_DEFS, TRANSIT_ORDER, ASPECT_GLYPH,
  getTransitNatalOverlay, computeSynastryOverlay, STANCE_META,
});
