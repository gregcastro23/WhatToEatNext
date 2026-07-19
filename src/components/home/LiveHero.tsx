"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FIRST_MEAL_QUIZ,
  loadSavedMealAnswers,
  saveMealAnswers,
  scoreFirstMeal,
} from "@/components/home/firstMeal";
import { useAlchemicalSafe } from "@/contexts/AlchemicalContext/hooks";
import { featuredRecipe } from "@/data/featuredRecipe";
import {
  biasQueryParam,
  useUserElementalBias,
} from "@/hooks/useUserElementalBias";
import {
  addTableMember,
  clearGuestTable,
  compositeFromVectors,
  ELEMENT_ORDER,
  ELEMENT_TAGLINES,
  MAX_TABLE_SIZE,
  removeTableMember,
  type ElementVector,
} from "@/utils/guestPalate";

/**
 * LiveHero — the homepage's consolidated top component: masthead + inline
 * personalization ("Who's eating tonight?") + a preview grid of every site
 * capability + the four-tap meal-crafting quiz, in one surface.
 *
 * Honesty rules: nothing is labeled live unless a real source feeds it (the
 * quantities endpoint's elemental balance, the client-side planetary hour,
 * one cuisine-recommend fetch, the featured hero image); example signatures
 * are labeled as samples. Birthdays give an ELEMENTAL bias only — never
 * converted to ESMS quantities (see src/utils/planetaryAlchemyMapping.ts:
 * quantities come from planets, elements from signs; the two are orthogonal
 * readings and are never presented as the same four things).
 *
 * All view transitions are pure CSS (conditional render + keyframes) — no
 * framer-motion, nothing rAF-gated except the self-nooping ambient motes.
 */

const GOLD = "#fbbf24";

const ELEMENT_TINTS: Record<string, string> = {
  Fire: "#f87171",
  Earth: "#34d399",
  Air: "#c084fc",
  Water: "#60a5fa",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

// Must stay in lockstep with CelestialHeaderClock in the site header — two
// hour readouts on one page may never disagree.
const FALLBACK_RULERS = [
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
  "Saturn",
  "Jupiter",
  "Mars",
];

/** Today's date in LOCAL time (toISOString would be UTC and can block
    "today" as a birthday for users east of Greenwich). */
function localTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface ElementStat {
  label: string;
  pct: number;
}

interface HeroTile {
  id: string;
  name: string;
  stageTitle: string;
  glyph: string;
  tint: string;
  teaser: string;
  story: string;
  exampleLabel: string;
  stats: readonly ElementStat[];
  canDo: readonly string[];
  href: string;
  linkLabel: string;
}

const TILES: readonly HeroTile[] = [
  {
    id: "sky",
    name: "Living Sky",
    stageTitle: "The Living Sky",
    glyph: "🪐",
    tint: "#c084fc",
    teaser: "It changes every hour.",
    story:
      "The oldest instrument in any kitchen. Every reading here begins overhead: the planets contribute four alchemical quantities — Spirit, Essence, Matter and Substance — while the signs they occupy set a balance of Fire, Water, Earth and Air. Two readings, one sky.",
    exampleLabel: "Sample reading · a summer evening",
    stats: [
      { label: "Fire", pct: 34 },
      { label: "Water", pct: 28 },
      { label: "Earth", pct: 22 },
      { label: "Air", pct: 16 },
    ],
    canDo: [
      "Watch the live sky translated into a running elemental balance",
      "See which planets are contributing which quantities right now",
      "Every recommender on this page re-ranks as the sky moves",
    ],
    href: "/quantities",
    linkLabel: "See tonight's reading",
  },
  {
    id: "cuisines",
    name: "Cuisines",
    stageTitle: "Cuisine Matching",
    glyph: "🍜",
    tint: "#f87171",
    teaser: "Tonight has a flavor.",
    story:
      "Cuisines behave like weather systems — each carries its own elemental signature. Sichuan burns Fire-heavy; Japanese runs cool and precise. Match a cuisine's signature against tonight's sky and dinner stops being a guess.",
    exampleLabel: "Signature · Sichuan",
    stats: [
      { label: "Fire", pct: 62 },
      { label: "Earth", pct: 16 },
      { label: "Water", pct: 12 },
      { label: "Air", pct: 10 },
    ],
    canDo: [
      "Get tonight's cuisines ranked against the current sky",
      "Open any cuisine to find nearby restaurants that serve it",
      "Browse the full atlas, signature by signature",
    ],
    href: "/cuisines",
    linkLabel: "Browse the cuisine atlas",
  },
  {
    id: "ingredients",
    name: "Ingredients",
    stageTitle: "The Ingredient Index",
    glyph: "🌿",
    tint: "#34d399",
    teaser: "1,000+ readings, dawn-harvested.",
    story:
      "Saffron: harvested thread by thread at dawn. Every ingredient in the index carries a full alchemical reading — over a thousand so far, from pantry staples to apex spices.",
    exampleLabel: "Signature · Saffron",
    stats: [
      { label: "Fire", pct: 55 },
      { label: "Air", pct: 25 },
      { label: "Earth", pct: 12 },
      { label: "Water", pct: 8 },
    ],
    canDo: [
      "See which ingredients align with the sky right now",
      "Tap Pantry on any card to track what your kitchen holds",
      "Full readings with nutrition beside the alchemy",
    ],
    href: "/ingredients",
    linkLabel: "Open the index",
  },
  {
    id: "methods",
    name: "Sauces & Methods",
    stageTitle: "Sauces & Methods",
    glyph: "🔥",
    tint: "#fb923c",
    teaser: "Technique is transformation.",
    story:
      "Heat is an ingredient. Searing feeds Fire; steaming answers to Water; fermentation is slow Earth-work. Sauces are the same craft in liquid form — every technique and mother sauce here carries its own signature.",
    exampleLabel: "Signature · Searing",
    stats: [
      { label: "Fire", pct: 78 },
      { label: "Air", pct: 14 },
      { label: "Earth", pct: 6 },
      { label: "Water", pct: 2 },
    ],
    canDo: [
      "Tonight's recommended cooking methods, ranked by the sky",
      "Sauce pairings matched to your cuisine of the evening",
      "Deep profiles for every technique in the craft",
    ],
    href: "/cooking-methods",
    linkLabel: "Study the methods",
  },
  {
    id: "builder",
    name: "Recipe Builder",
    stageTitle: "Recipe Builder",
    glyph: "🍳",
    tint: "#f59e0b",
    teaser: "Dinner, assembled to order.",
    story:
      "Where readings become dinner. Feed it your pantry and tonight's sky, and it assembles a recipe you can actually cook — measured, timed, and tuned to the moment you fire the stove.",
    exampleLabel: "Sample build · Chorizo Bolognese",
    stats: [
      { label: "Fire", pct: 44 },
      { label: "Earth", pct: 30 },
      { label: "Water", pct: 18 },
      { label: "Air", pct: 8 },
    ],
    canDo: [
      "Build a recipe from what your kitchen already holds",
      "Every step measured and timed — cook it tonight",
      "Save your best builds to a personal cookbook",
    ],
    href: "/recipe-builder",
    linkLabel: "Open the builder",
  },
  {
    id: "lab",
    name: "The Lab",
    stageTitle: "The Laboratory",
    glyph: "⚗️",
    tint: "#60a5fa",
    teaser: "Paste a recipe, get its signature.",
    story:
      "Found a recipe somewhere out there? Paste the text or snap a photo, and the Lab extracts its alchemical signature — then files it in your lab book beside everything else you've saved.",
    exampleLabel: "Sample extraction · Gremolata",
    stats: [
      { label: "Air", pct: 48 },
      { label: "Fire", pct: 22 },
      { label: "Water", pct: 18 },
      { label: "Earth", pct: 12 },
    ],
    canDo: [
      "Paste text or a photo to extract any recipe's signature",
      "Build a lab book of everything you've saved",
      "Compare signatures across your whole collection",
    ],
    href: "/lab",
    linkLabel: "Enter the lab",
  },
  {
    id: "planner",
    name: "Menu Planner",
    stageTitle: "The Week Ahead",
    glyph: "📅",
    tint: "#818cf8",
    teaser: "Seven skies, one plan.",
    story:
      "A week is seven different skies. The planner drafts your whole week in one pass — breakfast to dinner — then folds it into a single grocery list, so the kitchen stays a step ahead of you.",
    exampleLabel: "Sample week · balanced draft",
    stats: [
      { label: "Fire", pct: 28 },
      { label: "Earth", pct: 27 },
      { label: "Water", pct: 26 },
      { label: "Air", pct: 19 },
    ],
    canDo: [
      "Auto-plan a full week of meals in one tap",
      "Every slot swappable, every day rebalanced",
      "One grocery list generated for the whole plan",
    ],
    href: "/menu-planner",
    linkLabel: "Plan the week",
  },
  {
    id: "restaurants",
    name: "Restaurants",
    stageTitle: "Restaurants Near You",
    glyph: "🧭",
    tint: "#22d3ee",
    teaser: "Matches beyond your kitchen.",
    story:
      "It works outdoors, too. Point it at your neighborhood and it surfaces real restaurants, ranked by how well each one's cuisine matches tonight's sky — near you, no account needed.",
    exampleLabel: "Nearby sample · trattoria",
    stats: [
      { label: "Earth", pct: 38 },
      { label: "Fire", pct: 30 },
      { label: "Water", pct: 20 },
      { label: "Air", pct: 12 },
    ],
    canDo: [
      "Find nearby restaurants ranked by cuisine match",
      "Works from your location — no account needed",
      "Stock the pantry with Amazon Fresh ingredient links",
    ],
    href: "/restaurants",
    linkLabel: "Find restaurants nearby",
  },
] as const;

/* ─── Ambient motes (garnish only — self-noops when rAF never fires) ─────── */

interface Mote {
  x: number;
  y: number;
  vy: number;
  size: number;
  phase: number;
  color: string;
}

const MOTE_COLORS = ["#c084fc", "#34d399", "#60a5fa", "#f87171"];

function useAmbientMotes(hostRef: React.RefObject<HTMLElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motesRef = useRef<Mote[]>([]);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const reducedRef = useRef(false);
  const lastTsRef = useRef(0);

  const tick = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || reducedRef.current || !visibleRef.current) {
      rafRef.current = null;
      return;
    }
    const dt = Math.min((ts - (lastTsRef.current || ts)) / 1000, 0.05);
    lastTsRef.current = ts;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    for (const m of motesRef.current) {
      m.y -= m.vy * dt;
      m.phase += dt;
      if (m.y < -8) {
        m.y = h + 8;
        m.x = Math.random() * w;
      }
      ctx.globalAlpha = 0.05 + 0.05 * Math.sin(m.phase * 1.2);
      ctx.fillStyle = m.color;
      ctx.fillRect(m.x, m.y, m.size, m.size);
    }
    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedRef.current) return;

    const sync = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motesRef.current.length === 0) {
        motesRef.current = Array.from({ length: 10 }, (_, i) => ({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vy: 4 + Math.random() * 7,
          size: 1.5 + Math.random(),
          phase: Math.random() * Math.PI * 2,
          color: MOTE_COLORS[i % MOTE_COLORS.length],
        }));
      }
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = Boolean(e?.isIntersecting);
      if (visibleRef.current && rafRef.current == null) {
        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
      }
    });
    io.observe(host);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [hostRef, tick]);

  return canvasRef;
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function LiveHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useAmbientMotes(sectionRef);
  const { status } = useSession();
  const authenticated = status === "authenticated";

  // The shared personalization seam: guest table + chart-first composite.
  const { hydrated, table, chartOn, chartSunGlyph, composite } =
    useUserElementalBias();

  const [showAdd, setShowAdd] = useState(false);
  const [bdayInput, setBdayInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const [openTileId, setOpenTileId] = useState<string | null>(null);
  // null = quiz closed; length < quiz length = mid-question; full = result.
  const [quizAnswers, setQuizAnswers] = useState<number[] | null>(null);
  const [savedMeal, setSavedMeal] = useState<number[] | null>(null);

  // Live taps — each null until (and unless) its real source answers.
  const [skyPct, setSkyPct] = useState<ElementVector | null>(null);
  const [hourPlanet, setHourPlanet] = useState<string | null>(null);
  const [topCuisine, setTopCuisine] = useState<string | null>(null);
  const [featuredThumb, setFeaturedThumb] = useState<string | null>(null);

  // Hydrate the saved meal after mount (SSR-safe); the table itself is
  // hydrated and event-synced inside useUserElementalBias.
  useEffect(() => {
    setSavedMeal(loadSavedMealAnswers());
  }, []);

  // Planetary hour — same derivation as the header's CelestialHeaderClock:
  // the AlchemicalContext value when present, else its clock-table fallback,
  // so the hero chip and the header pill always agree.
  const alch = useAlchemicalSafe();
  useEffect(() => {
    const update = () => {
      const idx = (new Date().getHours() - 6 + 14 * 7) % 7;
      setHourPlanet(FALLBACK_RULERS[idx] ?? "Sun");
    };
    update();
    const t = window.setInterval(update, 60_000);
    return () => window.clearInterval(t);
  }, []);
  const hourIsLive = Boolean(
    alch?.planetaryHour && PLANET_GLYPHS[String(alch.planetaryHour)],
  );
  const displayHour = hourIsLive ? String(alch?.planetaryHour) : hourPlanet;

  // One elemental-balance fetch — the sky tile's bars come from the
  // ELEMENTAL portion of the payload only (never recolor ESMS as elements).
  useEffect(() => {
    let active = true;
    fetch("/api/alchm-quantities", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: unknown) => {
        if (!active) return;
        const data = j as {
          success?: boolean;
          circuit?: { elementalBalance?: Record<string, number> };
        };
        const balance = data?.success ? data.circuit?.elementalBalance : null;
        if (
          balance &&
          ELEMENT_ORDER.every((el) => typeof balance[el] === "number")
        ) {
          setSkyPct(
            compositeFromVectors([balance as ElementVector])?.pct ?? null,
          );
        }
      })
      .catch(() => {
        /* tile falls back to its static teaser */
      });
    return () => {
      active = false;
    };
  }, []);

  // One cuisine fetch for the "Tonight: X ↑" teaser (route is IP-limited).
  // Waits for hydration so the request carries the table's bias; the bias
  // rides a ref because this deliberately fetches once, not per table edit.
  const teaserBiasRef = useRef<string | null>(null);
  teaserBiasRef.current = biasQueryParam(composite?.vector ?? null);
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const url = teaserBiasRef.current
      ? `/api/cuisines/recommend?bias=${encodeURIComponent(teaserBiasRef.current)}`
      : "/api/cuisines/recommend";
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: unknown) => {
        if (!active) return;
        const data = j as {
          success?: boolean;
          recommendations?: { cuisines?: unknown[] };
        };
        const first = data?.success
          ? data.recommendations?.cuisines?.[0]
          : null;
        const name =
          typeof first === "string"
            ? first
            : ((first as { name?: string } | null)?.name ?? null);
        if (name) {
          setTopCuisine(name.charAt(0).toUpperCase() + name.slice(1));
        }
      })
      .catch(() => {
        /* teaser stays static */
      });
    return () => {
      active = false;
    };
  }, [hydrated]);

  // Featured dish thumbnail (identity comes from the static module).
  useEffect(() => {
    let active = true;
    fetch("/api/recipes/featured/hero-image", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: unknown) => {
        if (!active) return;
        const url = (j as { url?: string | null })?.url;
        if (typeof url === "string") setFeaturedThumb(url);
      })
      .catch(() => {
        /* label-only fallback */
      });
    return () => {
      active = false;
    };
  }, []);

  const tableSize = table.length + (chartOn ? 1 : 0);
  const tableGlyphs = `${chartOn ? "◉" : ""}${table.map((p) => p.glyph).join("")}`;

  const tunedSuffix = useMemo(() => {
    if (tableSize === 0) return "";
    if (tableSize === 1 && table.length === 1) {
      const p = table[0];
      // "your" only when the birthday is plausibly the visitor's own — a
      // named guest ("Mom") gets the possessive of their name instead.
      const isSelf = !p.name || p.name === "You";
      return isSelf
        ? ` · tuned to your ${p.glyph} ${p.signLabel} sun`
        : ` · tuned to ${p.name}'s ${p.glyph} ${p.signLabel} sun`;
    }
    if (tableSize === 1) return " · tuned to your chart";
    return ` · tuned to your table of ${tableSize} ${tableGlyphs}`;
  }, [tableSize, table, tableGlyphs]);

  const openTile = useMemo(
    () => TILES.find((t) => t.id === openTileId) ?? null,
    [openTileId],
  );
  const bias = composite?.vector ?? null;
  const reading = useMemo(
    () =>
      quizAnswers && quizAnswers.length === FIRST_MEAL_QUIZ.length
        ? scoreFirstMeal(quizAnswers, bias)
        : null,
    [quizAnswers, bias],
  );
  const savedReading = useMemo(
    () => (savedMeal ? scoreFirstMeal(savedMeal, bias) : null),
    [savedMeal, bias],
  );

  const submitAdd = () => {
    if (!bdayInput) return;
    const added = addTableMember(bdayInput, nameInput || undefined);
    if (added) {
      setBdayInput("");
      setNameInput("");
      setShowAdd(false);
    }
  };

  const answerQuiz = (optionIndex: number) => {
    if (!quizAnswers || quizAnswers.length >= FIRST_MEAL_QUIZ.length) return;
    const next = [...quizAnswers, optionIndex];
    setQuizAnswers(next);
    if (next.length === FIRST_MEAL_QUIZ.length) {
      setSavedMeal(next);
      saveMealAnswers(next);
    }
  };

  const addRowVisible = showAdd || (table.length === 0 && !chartOn);
  const optionDot = (weights: Partial<Record<string, number>>) => {
    let best = "Fire";
    let bestW = -1;
    for (const el of ELEMENT_ORDER) {
      const w = weights[el] ?? 0;
      if (w > bestW) {
        best = el;
        bestW = w;
      }
    }
    return ELEMENT_TINTS[best];
  };

  const quizOpen = quizAnswers !== null;
  const singleGuest = tableSize === 1 && table.length === 1 ? table[0] : null;

  return (
    <section
      ref={sectionRef}
      className="alchm-lh"
      aria-labelledby="alchm-lh-title"
    >
      <style>{heroStyles}</style>
      <canvas ref={canvasRef} className="alchm-lh-canvas" aria-hidden="true" />

      {/* ── Top band: masthead + who's eating tonight ── */}
      <div className="alchm-lh-top">
        <div className="alchm-lh-masthead">
          <p className="t-tag alchm-lh-eyebrow">YOUR KITCHEN · THE LIVE SKY</p>
          <h1 id="alchm-lh-title" className="t-display alchm-lh-title">
            Know what to eat next.
          </h1>
          <p className="alchm-lh-intro">
            Turn your birth chart, pantry, and the current sky into clear
            culinary recommendations you can actually cook tonight.
          </p>
          <div className="alchm-lh-actions">
            <Link href="/recipe-builder" className="alchm-lh-cta">
              Build tonight&apos;s recipe <span aria-hidden="true">→</span>
            </Link>
            {chartOn ? (
              <Link href="/lab" className="alchm-lh-cta is-secondary">
                Open my chart
              </Link>
            ) : (
              <Link href="/onboarding" className="alchm-lh-cta is-secondary">
                Set up my chart
              </Link>
            )}
          </div>
        </div>

        <div className="alchm-lh-table" aria-label="Who's eating tonight?">
          <div className="alchm-lh-table-head">
            <span className="t-mono alchm-lh-table-label">
              WHO&apos;S EATING TONIGHT?
            </span>
            {hydrated && !addRowVisible && table.length < MAX_TABLE_SIZE && (
              <button
                type="button"
                className="t-mono alchm-lh-table-add"
                onClick={() => setShowAdd(true)}
              >
                + Add
              </button>
            )}
          </div>

          {hydrated && (chartOn || table.length > 0) && (
            <div className="alchm-lh-chips">
              {chartOn && (
                <span className="alchm-lh-chip is-chart">
                  <span aria-hidden="true">◉</span> Your chart
                  {chartSunGlyph ? ` · ${chartSunGlyph}` : ""}
                  <em className="t-mono">FULL CHART</em>
                </span>
              )}
              {table.map((p) => (
                <span
                  key={p.id}
                  className="alchm-lh-chip"
                  style={{ ["--e" as string]: ELEMENT_TINTS[p.element] }}
                >
                  <i className="alchm-lh-chip-glyph" aria-hidden="true">
                    {p.glyph}
                  </i>
                  {p.name ?? p.signLabel}
                  <button
                    type="button"
                    className="alchm-lh-chip-x"
                    aria-label={`Remove ${p.name ?? p.signLabel}`}
                    onClick={() => removeTableMember(p.id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {hydrated && addRowVisible && (
            <div className="alchm-lh-addwrap">
              {table.length === 0 && !chartOn && (
                <p className="alchm-lh-table-copy">
                  Add a birthday — tonight&apos;s readings tune to your table.
                  No account needed; it stays on this device.
                </p>
              )}
              <div className="alchm-lh-addrow">
                <input
                  type="date"
                  className="alchm-lh-input"
                  aria-label="Birthday"
                  value={bdayInput}
                  min="1900-01-01"
                  max={localTodayIso()}
                  onChange={(e) => setBdayInput(e.target.value)}
                />
                <input
                  type="text"
                  className="alchm-lh-input is-name"
                  aria-label="Name (optional)"
                  placeholder="Name"
                  maxLength={24}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitAdd();
                  }}
                />
                <button
                  type="button"
                  className="t-mono alchm-lh-addgo"
                  disabled={!bdayInput}
                  onClick={submitAdd}
                >
                  Add →
                </button>
                {(table.length > 0 || chartOn) && (
                  <button
                    type="button"
                    className="alchm-lh-chip-x is-lone"
                    aria-label="Close add row"
                    onClick={() => setShowAdd(false)}
                  >
                    ×
                  </button>
                )}
              </div>
              {!authenticated && table.length === 0 && (
                <Link href="/login" className="t-mono alchm-lh-quietlink">
                  or sign in to save
                </Link>
              )}
            </div>
          )}

          {hydrated && composite && (
            <div className="alchm-lh-composite">
              <div className="alchm-lh-composite-head">
                <span className="t-mono alchm-lh-composite-label">
                  {singleGuest
                    ? `${singleGuest.signLabel.toUpperCase()} PALATE · ${ELEMENT_TAGLINES[singleGuest.element].toUpperCase()}`
                    : tableSize === 1
                      ? `YOUR CHART · ${composite.leaning.toUpperCase()}-LEANING`
                      : `TABLE OF ${tableSize} · ${composite.leaning.toUpperCase()}-LEANING`}
                </span>
                <Link href="/onboarding" className="t-mono alchm-lh-quietlink">
                  Full-chart precision →
                </Link>
              </div>
              <div className="alchm-lh-bar" aria-hidden="true">
                {ELEMENT_ORDER.map((el) => (
                  <i
                    key={el}
                    style={{
                      width: `${composite.pct[el]}%`,
                      background: ELEMENT_TINTS[el],
                    }}
                  />
                ))}
              </div>
              <div className="alchm-lh-bar-labels t-mono" aria-hidden="true">
                {ELEMENT_ORDER.map((el) => (
                  <span key={el} style={{ color: ELEMENT_TINTS[el] }}>
                    {el} {composite.pct[el]}%
                  </span>
                ))}
              </div>
              <div className="alchm-lh-composite-foot">
                <span>
                  {chartOn
                    ? "Your chart anchors the table. Guests join by birthday."
                    : "Readings tune to this table. It stays on this device."}
                </span>
                {table.length > 0 && (
                  <button
                    type="button"
                    className="t-mono alchm-lh-clear"
                    onClick={() => clearGuestTable()}
                  >
                    Clear table
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid zone: preview tiles / stage / quiz ── */}
      <div className="alchm-lh-gridlabel">
        <span className="t-mono">THE WHOLE KITCHEN · TAP ANY TILE TO PREVIEW</span>
        <span className="alchm-lh-rule" aria-hidden="true" />
      </div>

      {quizOpen && quizAnswers.length < FIRST_MEAL_QUIZ.length ? (
        <div
          key={`quiz-${quizAnswers.length}`}
          className="alchm-lh-stage"
          style={{ ["--q" as string]: GOLD }}
        >
          <div className="alchm-lh-panel is-quiz">
            <div className="alchm-lh-quiz-head">
              <span className="t-mono alchm-lh-kicker">
                CRAFT TONIGHT&apos;S MEAL · QUESTION {quizAnswers.length + 1}{" "}
                OF {FIRST_MEAL_QUIZ.length}
              </span>
              <span className="alchm-lh-segments" aria-hidden="true">
                {FIRST_MEAL_QUIZ.map((q, i) => (
                  <i
                    key={q.id}
                    className={i < quizAnswers.length ? "is-on" : undefined}
                  />
                ))}
              </span>
              <button
                type="button"
                className="t-mono alchm-lh-ghost"
                onClick={() => setQuizAnswers(null)}
              >
                ✕ Cancel
              </button>
            </div>
            <h3 className="alchm-lh-quiz-prompt">
              {FIRST_MEAL_QUIZ[quizAnswers.length].prompt}
            </h3>
            <div className="alchm-lh-quiz-opts">
              {FIRST_MEAL_QUIZ[quizAnswers.length].options.map((o, i) => (
                <button
                  key={o.label}
                  type="button"
                  className="alchm-lh-quiz-opt"
                  style={{ ["--i" as string]: i }}
                  onClick={() => answerQuiz(i)}
                >
                  <span className="alchm-lh-quiz-opt-copy">
                    <span className="alchm-lh-quiz-opt-label">{o.label}</span>
                    <span className="alchm-lh-quiz-opt-sub">{o.sub}</span>
                  </span>
                  <i
                    className="alchm-lh-dot"
                    style={{ background: optionDot(o.weights) }}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            {tunedSuffix && (
              <p className="t-mono alchm-lh-tuned">
                TUNED{tunedSuffix.replace(" · tuned", "").toUpperCase()}
              </p>
            )}
          </div>
        </div>
      ) : quizOpen && reading ? (
        <div
          key="result"
          className="alchm-lh-stage"
          style={{ ["--q" as string]: GOLD }}
        >
          <div className="alchm-lh-panel">
            <div className="alchm-lh-stagehead">
              <span className="t-mono alchm-lh-kicker">
                TONIGHT&apos;S CRAFT
              </span>
              <span className="alchm-lh-stagehead-actions">
                <button
                  type="button"
                  className="t-mono alchm-lh-ghost"
                  onClick={() => setQuizAnswers([])}
                >
                  ⟲ Recraft
                </button>
                <button
                  type="button"
                  className="t-mono alchm-lh-ghost"
                  onClick={() => setQuizAnswers(null)}
                >
                  ← All previews
                </button>
              </span>
            </div>
            <div className="alchm-lh-cols">
              <div className="alchm-lh-col">
                <div className="alchm-lh-dish">
                  <span className="alchm-lh-dish-emoji" aria-hidden="true">
                    {reading.meal.emoji}
                  </span>
                  <div>
                    <h3 className="alchm-lh-dish-name">{reading.meal.name}</h3>
                    <p className="t-mono alchm-lh-dish-chips">
                      {reading.meal.cuisine.toUpperCase()} ·{" "}
                      {reading.meal.method.toUpperCase()}
                    </p>
                  </div>
                </div>
                <p className="alchm-lh-story">{reading.meal.blurb}</p>
                <div className="alchm-lh-stageacts">
                  <Link
                    href={`/recipes?cuisine=${reading.meal.cuisineSlug}`}
                    className="alchm-lh-cta is-small"
                  >
                    See {reading.meal.cuisine} recipes →
                  </Link>
                  <Link
                    href="/recipe-builder"
                    className="alchm-lh-cta is-secondary is-small"
                  >
                    Build it my way
                  </Link>
                </div>
              </div>
              <div className="alchm-lh-col">
                <div className="alchm-lh-example">
                  <p className="t-mono alchm-lh-example-label">
                    YOUR READING —{" "}
                    {quizAnswers
                      .map(
                        (a, i) =>
                          (FIRST_MEAL_QUIZ[i].options[a]?.label ?? "").split(
                            " — ",
                          )[0],
                      )
                      .join(" · ")
                      .toUpperCase()}
                    {tableSize > 0 ? ` · ${tableGlyphs}` : ""}
                  </p>
                  <div className="alchm-lh-stats">
                    {ELEMENT_ORDER.map((el) => (
                      <div
                        key={el}
                        className="alchm-lh-stat"
                        style={{ ["--e" as string]: ELEMENT_TINTS[el] }}
                      >
                        <span className="t-mono alchm-lh-stat-label">{el}</span>
                        <span className="alchm-lh-stat-track">
                          <span
                            className="alchm-lh-stat-bar"
                            style={{ width: `${reading.pct[el]}%` }}
                          />
                        </span>
                        <span className="t-mono alchm-lh-stat-pct">
                          {reading.pct[el]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {tableSize > 0 ? (
                  <p className="alchm-lh-note">
                    {chartOn
                      ? `Tuned to your chart${table.length > 0 ? " and your table" : ""}.`
                      : "Tuned to your table's sun signs. Want the full picture? "}
                    {!chartOn && (
                      <>
                        <Link href="/onboarding" className="alchm-lh-link">
                          Set up your chart →
                        </Link>{" "}
                        {!authenticated && (
                          <Link
                            href="/login"
                            className="alchm-lh-link is-quiet"
                          >
                            or sign in to save readings
                          </Link>
                        )}
                      </>
                    )}
                  </p>
                ) : (
                  <div className="alchm-lh-tunebox">
                    <p className="alchm-lh-note">
                      Add a birthday and this reading tunes to your table — no
                      account needed.
                    </p>
                    <span className="alchm-lh-addrow">
                      <input
                        type="date"
                        className="alchm-lh-input"
                        aria-label="Your birthday"
                        value={bdayInput}
                        min="1900-01-01"
                        max={localTodayIso()}
                        onChange={(e) => setBdayInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="t-mono alchm-lh-addgo"
                        disabled={!bdayInput}
                        onClick={() => {
                          if (addTableMember(bdayInput)) setBdayInput("");
                        }}
                      >
                        Tune it →
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : openTile ? (
        <div
          key={openTile.id}
          className="alchm-lh-stage"
          style={{ ["--q" as string]: openTile.tint }}
        >
          <div className="alchm-lh-panel">
            <div className="alchm-lh-stagehead">
              <span className="alchm-lh-stagehead-id">
                <span
                  className="alchm-lh-glyphbox is-big"
                  style={{ ["--e" as string]: openTile.tint }}
                  aria-hidden="true"
                >
                  {openTile.glyph}
                </span>
                <span>
                  <span className="t-mono alchm-lh-kicker">
                    PREVIEW · {openTile.name.toUpperCase()}
                  </span>
                  <h3 className="alchm-lh-stagetitle">{openTile.stageTitle}</h3>
                </span>
              </span>
              <button
                type="button"
                className="t-mono alchm-lh-ghost"
                onClick={() => setOpenTileId(null)}
              >
                ← All previews
              </button>
            </div>
            <div className="alchm-lh-cols">
              <div className="alchm-lh-col">
                <p className="alchm-lh-story">{openTile.story}</p>
                <div className="alchm-lh-example">
                  <p className="t-mono alchm-lh-example-label">
                    {openTile.id === "sky" && skyPct ? (
                      <>
                        <i className="alchm-lh-livedot" aria-hidden="true" />
                        TONIGHT · LIVE READING
                      </>
                    ) : (
                      openTile.exampleLabel.toUpperCase()
                    )}
                  </p>
                  <div className="alchm-lh-stats">
                    {(openTile.id === "sky" && skyPct
                      ? ELEMENT_ORDER.map((el) => ({
                          label: el,
                          pct: skyPct[el],
                        }))
                      : [...openTile.stats]
                    ).map((s) => (
                      <div
                        key={s.label}
                        className="alchm-lh-stat"
                        style={{
                          ["--e" as string]:
                            ELEMENT_TINTS[s.label] ?? openTile.tint,
                        }}
                      >
                        <span className="t-mono alchm-lh-stat-label">
                          {s.label}
                        </span>
                        <span className="alchm-lh-stat-track">
                          <span
                            className="alchm-lh-stat-bar"
                            style={{ width: `${s.pct}%` }}
                          />
                        </span>
                        <span className="t-mono alchm-lh-stat-pct">
                          {s.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="alchm-lh-col">
                <p className="t-mono alchm-lh-example-label">WHAT YOU CAN DO</p>
                <ul className="alchm-lh-cando">
                  {openTile.canDo.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
                {openTile.id === "cuisines" && topCuisine && (
                  <p className="t-mono alchm-lh-liveline">
                    <i className="alchm-lh-livedot" aria-hidden="true" />
                    TONIGHT: {topCuisine.toUpperCase()} ↑ · LIVE
                  </p>
                )}
                <div className="alchm-lh-stageacts">
                  <Link href={openTile.href} className="alchm-lh-cta is-small">
                    {openTile.linkLabel} →
                  </Link>
                  <span className="t-mono alchm-lh-realnote">
                    The real thing runs live further down this page.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alchm-lh-grid">
          {TILES.map((tile, index) => (
            <button
              key={tile.id}
              type="button"
              className={`alchm-lh-tile is-${tile.id}`}
              style={{
                ["--e" as string]: tile.tint,
                ["--i" as string]: index,
              }}
              onClick={() => setOpenTileId(tile.id)}
              aria-label={`Preview ${tile.name}`}
            >
              <span className="alchm-lh-tile-top">
                <span className="alchm-lh-glyphbox" aria-hidden="true">
                  {tile.glyph}
                </span>
                {tile.id === "sky" && hydrated && displayHour && (
                  <span className="t-mono alchm-lh-livechip">
                    {/* "LIVE" only when the authoritative context feeds the
                        hour — the clock-table fallback isn't a live claim */}
                    {hourIsLive && (
                      <>
                        <i className="alchm-lh-livedot" aria-hidden="true" />
                        LIVE ·{" "}
                      </>
                    )}
                    <span className="alchm-lh-livechip-name">
                      {displayHour.toUpperCase()} HOUR{" "}
                    </span>
                    {PLANET_GLYPHS[displayHour] ?? ""}
                  </span>
                )}
                {tile.id === "builder" && featuredThumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredThumb}
                    alt=""
                    className="alchm-lh-thumb"
                    loading="lazy"
                  />
                )}
              </span>
              <span className="alchm-lh-tile-name">{tile.name}</span>
              <span className="alchm-lh-tile-teaser">{tile.teaser}</span>
              {tile.id === "sky" && skyPct && (
                <span className="alchm-lh-minibar" aria-hidden="true">
                  {ELEMENT_ORDER.map((el) => (
                    <i
                      key={el}
                      style={{
                        width: `${skyPct[el]}%`,
                        background: ELEMENT_TINTS[el],
                      }}
                    />
                  ))}
                </span>
              )}
              {tile.id === "cuisines" && topCuisine && (
                <span className="t-mono alchm-lh-tile-live">
                  TONIGHT: {topCuisine.toUpperCase()} ↑
                </span>
              )}
              {tile.id === "builder" && (
                <span className="t-mono alchm-lh-tile-live is-featured">
                  FEATURED · {featuredRecipe.title.toUpperCase()}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Quiz bar ── */}
      {!quizOpen && (
        <button
          type="button"
          className="alchm-lh-quizbar"
          onClick={() =>
            savedMeal ? setQuizAnswers([...savedMeal]) : setQuizAnswers([])
          }
        >
          <span className="alchm-lh-quizbar-copy">
            <i className="alchm-lh-golddot" aria-hidden="true" />
            {savedReading ? (
              <span>
                {savedReading.meal.emoji} {savedReading.meal.name}
                <em> · {savedReading.meal.cuisine}</em>
              </span>
            ) : (
              <span>
                Craft tonight&apos;s meal — four taps, one dish
                {tunedSuffix && <em>{tunedSuffix}</em>}
              </span>
            )}
          </span>
          <span className="t-mono alchm-lh-quizbar-go">
            {savedMeal ? "View →" : "Start →"}
          </span>
        </button>
      )}
    </section>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */

const heroStyles = `
  .alchm-lh {
    position: relative;
    isolation: isolate;
    /* clip, not hidden: hidden boxes are still programmatically scrollable,
       and focusing inputs inside the hero can shove the whole layout sideways */
    overflow: hidden;
    overflow: clip;
    display: grid;
    gap: 16px;
    padding: clamp(20px, 3.5vw, 30px);
    border: 1px solid var(--line-hi);
    border-radius: calc(var(--radius) + 6px);
    background:
      radial-gradient(circle at 85% 8%, color-mix(in oklch, var(--accent), transparent 78%), transparent 30%),
      radial-gradient(circle at 8% 100%, color-mix(in oklch, var(--accent-2), transparent 88%), transparent 34%),
      linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
    box-shadow: 0 30px 80px rgba(0,0,0,0.28);
  }
  .alchm-lh::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 320px;
    height: 320px;
    right: -140px;
    top: -180px;
    border: 1px solid color-mix(in oklch, var(--accent), transparent 55%);
    border-radius: 50%;
    box-shadow: 0 0 0 46px rgba(255,255,255,0.018), 0 0 0 92px rgba(255,255,255,0.012);
  }
  .alchm-lh-canvas {
    position: absolute;
    inset: 0;
    /* replaced elements ignore inset-stretch and use their intrinsic
       (DPR-scaled buffer) size — pin the layout size explicitly */
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }
  .alchm-lh > :not(.alchm-lh-canvas) { position: relative; z-index: 1; }

  /* Top band */
  .alchm-lh-top {
    display: grid;
    grid-template-columns: minmax(0, 11fr) minmax(0, 9fr);
    gap: 22px;
    align-items: center;
  }
  .alchm-lh-eyebrow { margin: 0 0 10px; color: var(--accent-2); }
  .alchm-lh-title {
    margin: 0;
    color: var(--fg);
    font-size: clamp(32px, 4.2vw, 52px);
    font-weight: 500;
    line-height: 1.0;
    letter-spacing: -0.03em;
  }
  .alchm-lh-intro {
    max-width: 520px;
    margin: 12px 0 0;
    color: var(--fg-dim);
    font-size: clamp(13px, 1.4vw, 15px);
    line-height: 1.6;
  }
  .alchm-lh-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  .alchm-lh-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 42px;
    padding: 10px 16px;
    border: 1px solid color-mix(in oklch, var(--accent), white 12%);
    border-radius: 10px;
    background: var(--accent);
    color: #110d18;
    font-size: 12.5px;
    font-weight: 650;
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0 10px 28px color-mix(in oklch, var(--accent), transparent 80%);
    transition: filter 0.15s, transform 0.15s, background 0.2s;
  }
  .alchm-lh-cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .alchm-lh-cta.is-secondary {
    border-color: var(--line-hi);
    background: rgba(255,255,255,0.035);
    color: var(--fg-dim);
    box-shadow: none;
  }
  .alchm-lh-cta.is-secondary:hover { background: rgba(255,255,255,0.065); color: var(--fg); filter: none; }
  .alchm-lh-cta.is-small { min-height: 36px; padding: 8px 14px; font-size: 11.5px; }

  /* Who's eating tonight */
  .alchm-lh-table {
    display: grid;
    gap: 10px;
    align-content: start;
    padding: 14px 16px;
    border: 1px solid var(--line-hi);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008));
    backdrop-filter: blur(10px);
  }
  .alchm-lh-table-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .alchm-lh-table-label { color: var(--fg); font-size: 10px; letter-spacing: 0.16em; }
  .alchm-lh-table-add {
    padding: 4px 10px;
    border: 1px dashed var(--line-hi);
    border-radius: 999px;
    background: transparent;
    color: var(--fg-mute);
    font-size: 9.5px;
    letter-spacing: 0.1em;
    cursor: pointer;
  }
  .alchm-lh-table-add:hover { color: var(--fg); border-color: var(--fg-mute); }
  .alchm-lh-table-copy { margin: 0; color: var(--fg-mute); font-size: 11.5px; line-height: 1.5; }
  .alchm-lh-chips { display: flex; flex-wrap: wrap; gap: 7px; }
  .alchm-lh-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 10px 5px 6px;
    border: 1px solid var(--line-hi);
    border-radius: 999px;
    background: rgba(255,255,255,0.04);
    color: var(--fg);
    font-size: 11.5px;
  }
  .alchm-lh-chip-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 1px solid color-mix(in oklch, var(--e), transparent 55%);
    border-radius: 6px;
    background: color-mix(in oklch, var(--e), transparent 88%);
    color: var(--e);
    font-style: normal;
    font-size: 11px;
  }
  .alchm-lh-chip.is-chart {
    gap: 6px;
    padding: 5px 10px;
    border-color: color-mix(in oklch, var(--accent), transparent 45%);
    background: color-mix(in oklch, var(--accent), transparent 84%);
    color: var(--fg);
    font-weight: 600;
  }
  .alchm-lh-chip.is-chart em {
    padding: 2px 5px;
    border-radius: 4px;
    background: color-mix(in oklch, var(--accent), transparent 75%);
    color: var(--accent);
    font-style: normal;
    font-size: 7.5px;
    letter-spacing: 0.12em;
  }
  .alchm-lh-chip-x {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--fg-mute);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
  }
  .alchm-lh-chip-x:hover { color: var(--fg); background: rgba(255,255,255,0.08); }
  .alchm-lh-chip-x.is-lone {
    width: 26px;
    height: 26px;
    border: 1px solid var(--line-hi);
  }
  .alchm-lh-addwrap { display: grid; gap: 8px; }
  .alchm-lh-addrow { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .alchm-lh-input {
    flex: 0 1 auto;
    min-width: 0;
    padding: 7px 10px;
    border: 1px solid var(--line-hi);
    border-radius: 8px;
    background: rgba(0,0,0,0.3);
    color: var(--fg);
    font-size: 12px;
    color-scheme: dark;
  }
  .alchm-lh-input.is-name { flex: 1 1 90px; }
  .alchm-lh-input:focus {
    outline: none;
    border-color: color-mix(in oklch, var(--accent), transparent 30%);
  }
  .alchm-lh-addgo {
    padding: 8px 13px;
    border: 1px solid color-mix(in oklch, var(--accent), white 10%);
    border-radius: 8px;
    background: var(--accent);
    color: #110d18;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .alchm-lh-addgo:hover { filter: brightness(1.08); }
  .alchm-lh-addgo:disabled { opacity: 0.4; cursor: default; }
  .alchm-lh-quietlink {
    color: var(--fg-mute);
    font-size: 9.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .alchm-lh-quietlink:hover { color: var(--accent); }
  .alchm-lh-composite { display: grid; gap: 7px; }
  .alchm-lh-composite-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
  }
  .alchm-lh-composite-label { color: var(--fg-dim); font-size: 9.5px; letter-spacing: 0.14em; }
  .alchm-lh-bar {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(255,255,255,0.06);
  }
  .alchm-lh-bar i { display: block; height: 100%; transition: width 0.4s ease; }
  .alchm-lh-bar-labels {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    font-size: 8.5px;
    letter-spacing: 0.06em;
  }
  .alchm-lh-composite-foot {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    color: var(--fg-mute);
    font-size: 10.5px;
    line-height: 1.45;
  }
  .alchm-lh-clear {
    border: none;
    background: transparent;
    color: var(--fg-mute);
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .alchm-lh-clear:hover { color: #f87171; }

  /* Grid label */
  .alchm-lh-gridlabel { display: flex; align-items: center; gap: 14px; }
  .alchm-lh-gridlabel span:first-child { color: var(--fg-mute); font-size: 9.5px; letter-spacing: 0.18em; }
  .alchm-lh-rule { flex: 1; height: 1px; background: var(--line); }

  /* Tiles */
  .alchm-lh-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }
  @keyframes alchm-lh-in {
    from { opacity: 0; transform: translateY(8px); }
  }
  .alchm-lh-tile {
    animation: alchm-lh-in 0.3s ease-out backwards;
    animation-delay: calc(var(--i, 0) * 40ms);
    display: grid;
    align-content: start;
    gap: 5px;
    min-height: 108px;
    padding: 12px 13px;
    border: 1px solid var(--line-hi);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008));
    text-align: left;
    cursor: pointer;
    transition: transform 0.18s, border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .alchm-lh-tile:hover {
    transform: translateY(-2px);
    border-color: color-mix(in oklch, var(--e), transparent 45%);
    background: color-mix(in oklch, var(--e), transparent 95%);
    box-shadow: 0 12px 30px -18px color-mix(in oklch, var(--e), transparent 30%);
  }
  .alchm-lh-tile-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
  .alchm-lh-glyphbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid color-mix(in oklch, var(--e), transparent 60%);
    border-radius: 8px;
    background: color-mix(in oklch, var(--e), transparent 90%);
    font-size: 15px;
    line-height: 1;
  }
  .alchm-lh-glyphbox.is-big { width: 42px; height: 42px; font-size: 22px; border-radius: 10px; }
  .alchm-lh-livechip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border: 1px solid color-mix(in oklch, var(--e), transparent 60%);
    border-radius: 999px;
    background: color-mix(in oklch, var(--e), transparent 90%);
    color: var(--e);
    font-size: 8px;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  @keyframes alchm-lh-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .alchm-lh-livedot {
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-right: 2px;
    border-radius: 50%;
    background: currentColor;
    animation: alchm-lh-pulse 2s ease-in-out infinite;
  }
  .alchm-lh-thumb {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid var(--line-hi);
    object-fit: cover;
  }
  .alchm-lh-tile-name { color: var(--fg); font-size: 13.5px; font-weight: 650; letter-spacing: -0.01em; }
  .alchm-lh-tile-teaser { color: var(--fg-mute); font-size: 10.5px; line-height: 1.4; }
  .alchm-lh-minibar {
    display: flex;
    height: 4px;
    margin-top: 3px;
    border-radius: 2px;
    overflow: hidden;
    background: rgba(255,255,255,0.06);
  }
  .alchm-lh-minibar i { display: block; height: 100%; }
  .alchm-lh-tile-live { margin-top: 3px; color: var(--accent-2); font-size: 8.5px; letter-spacing: 0.14em; }
  .alchm-lh-tile-live.is-featured { color: var(--fg-mute); }

  /* Stage */
  @keyframes alchm-lh-stage-in {
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
  }
  .alchm-lh-stage { animation: alchm-lh-stage-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
  .alchm-lh-panel {
    display: grid;
    gap: 16px;
    padding: 18px 20px;
    border: 1px solid color-mix(in oklch, var(--q), transparent 55%);
    border-radius: 14px;
    background:
      radial-gradient(circle at 92% 0%, color-mix(in oklch, var(--q), transparent 90%), transparent 42%),
      rgba(0,0,0,0.25);
    box-shadow: 0 0 46px -18px color-mix(in oklch, var(--q), transparent 55%);
  }
  .alchm-lh-stagehead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .alchm-lh-stagehead-id { display: flex; align-items: center; gap: 12px; }
  .alchm-lh-stagehead-actions { display: flex; gap: 8px; }
  .alchm-lh-kicker { display: block; margin: 0 0 2px; color: var(--q, var(--accent)); font-size: 9px; letter-spacing: 0.18em; }
  .alchm-lh-stagetitle { margin: 0; color: var(--fg); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
  .alchm-lh-ghost {
    padding: 6px 12px;
    border: 1px solid var(--line-hi);
    border-radius: 8px;
    background: transparent;
    color: var(--fg-mute);
    font-size: 9.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .alchm-lh-ghost:hover { color: var(--fg); border-color: var(--fg-mute); }
  .alchm-lh-cols {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: start;
  }
  .alchm-lh-col { display: grid; gap: 12px; align-content: start; }
  .alchm-lh-story { margin: 0; color: var(--fg-dim); font-size: 13px; line-height: 1.6; }
  .alchm-lh-example {
    display: grid;
    gap: 9px;
    padding: 12px 14px;
    border: 1px solid var(--line-hi);
    border-radius: 10px;
    background: rgba(0,0,0,0.26);
  }
  .alchm-lh-example-label {
    display: flex;
    align-items: center;
    margin: 0;
    color: var(--fg-mute);
    font-size: 9px;
    letter-spacing: 0.15em;
    line-height: 1.5;
  }
  .alchm-lh-stats { display: grid; gap: 6px; }
  .alchm-lh-stat {
    display: grid;
    grid-template-columns: 44px 1fr 36px;
    align-items: center;
    gap: 9px;
  }
  .alchm-lh-stat-label { color: var(--fg-dim); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; }
  .alchm-lh-stat-track { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .alchm-lh-stat-bar {
    display: block;
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, color-mix(in oklch, var(--e), transparent 35%), var(--e));
    animation: alchm-lh-grow 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  @keyframes alchm-lh-grow { from { width: 0; } }
  .alchm-lh-stat-pct { color: var(--fg-mute); font-size: 9px; text-align: right; }
  .alchm-lh-cando { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
  .alchm-lh-cando li {
    position: relative;
    padding: 9px 12px 9px 30px;
    border: 1px solid var(--line-hi);
    border-radius: 10px;
    background: rgba(0,0,0,0.2);
    color: var(--fg-dim);
    font-size: 12px;
    line-height: 1.5;
  }
  .alchm-lh-cando li::before { content: "▸"; position: absolute; left: 12px; color: var(--q); }
  .alchm-lh-liveline { margin: 0; color: var(--q); font-size: 9.5px; letter-spacing: 0.14em; display: flex; align-items: center; }
  .alchm-lh-stageacts { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .alchm-lh-realnote { color: var(--fg-mute); font-size: 8.5px; letter-spacing: 0.1em; }

  /* Quiz */
  .alchm-lh-quiz-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .alchm-lh-segments { display: flex; gap: 5px; flex: 1; min-width: 90px; max-width: 160px; }
  .alchm-lh-segments i {
    flex: 1;
    height: 5px;
    border-radius: 3px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--line-hi);
  }
  .alchm-lh-segments i.is-on { background: var(--q); border-color: var(--q); }
  .alchm-lh-quiz-head .alchm-lh-ghost { margin-left: auto; }
  .alchm-lh-quiz-prompt { margin: 0; color: var(--fg); font-size: clamp(18px, 2.4vw, 23px); font-weight: 700; letter-spacing: -0.02em; }
  .alchm-lh-quiz-opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .alchm-lh-quiz-opt {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 13px 15px;
    border: 1px solid var(--line-hi);
    border-radius: 12px;
    background: rgba(0,0,0,0.22);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, background 0.15s;
    animation: alchm-lh-in 0.25s ease-out backwards;
    animation-delay: calc(var(--i, 0) * 45ms);
  }
  .alchm-lh-quiz-opt:hover {
    border-color: color-mix(in oklch, var(--q), transparent 40%);
    background: color-mix(in oklch, var(--q), transparent 95%);
  }
  .alchm-lh-quiz-opt-copy { display: grid; gap: 3px; }
  .alchm-lh-quiz-opt-label { color: var(--fg); font-size: 13px; font-weight: 650; }
  .alchm-lh-quiz-opt-sub { color: var(--fg-mute); font-size: 10.5px; }
  .alchm-lh-dot {
    flex-shrink: 0;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }
  .alchm-lh-tuned {
    margin: 0;
    padding-top: 10px;
    border-top: 1px solid var(--line);
    color: var(--fg-mute);
    font-size: 9px;
    letter-spacing: 0.14em;
    text-align: center;
  }

  /* Result */
  .alchm-lh-dish { display: flex; align-items: center; gap: 13px; }
  .alchm-lh-dish-emoji {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border: 1px solid color-mix(in oklch, var(--q), transparent 60%);
    border-radius: 12px;
    background: color-mix(in oklch, var(--q), transparent 92%);
    font-size: 24px;
  }
  .alchm-lh-dish-name { margin: 0; color: var(--fg); font-size: 19px; font-weight: 750; letter-spacing: -0.02em; }
  .alchm-lh-dish-chips { margin: 4px 0 0; color: var(--fg-mute); font-size: 9px; letter-spacing: 0.16em; }
  .alchm-lh-note { margin: 0; color: var(--fg-dim); font-size: 12px; line-height: 1.55; }
  .alchm-lh-link { color: var(--accent); text-decoration: none; font-weight: 650; }
  .alchm-lh-link:hover { text-decoration: underline; }
  .alchm-lh-link.is-quiet { color: var(--fg-mute); }
  .alchm-lh-tunebox {
    display: grid;
    gap: 10px;
    padding: 12px 14px;
    border: 1px dashed color-mix(in oklch, var(--q), transparent 45%);
    border-radius: 10px;
    background: color-mix(in oklch, var(--q), transparent 94%);
  }

  /* Quiz bar */
  .alchm-lh-quizbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    padding: 11px 16px;
    border: 1px solid rgba(251,191,36,0.25);
    border-radius: 11px;
    background: rgba(251,191,36,0.06);
    cursor: pointer;
    text-align: left;
    transition: background 0.2s, border-color 0.2s;
  }
  .alchm-lh-quizbar:hover { background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.4); }
  .alchm-lh-quizbar-copy {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: var(--fg);
    font-size: 12.5px;
    font-weight: 600;
  }
  .alchm-lh-quizbar-copy em { color: var(--fg-mute); font-style: normal; font-weight: 500; font-size: 11.5px; }
  .alchm-lh-golddot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fbbf24;
  }
  .alchm-lh-quizbar-go {
    flex-shrink: 0;
    padding: 8px 14px;
    border: 1px solid rgba(251,191,36,0.35);
    border-radius: 8px;
    background: rgba(251,191,36,0.14);
    color: #fbbf24;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  @media (prefers-reduced-motion: reduce) {
    .alchm-lh-tile, .alchm-lh-stage, .alchm-lh-quiz-opt,
    .alchm-lh-stat-bar, .alchm-lh-livedot { animation: none; }
  }
  @media (max-width: 980px) {
    .alchm-lh-top { grid-template-columns: 1fr; gap: 16px; }
  }
  @media (max-width: 900px) {
    .alchm-lh-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .alchm-lh-tile.is-builder, .alchm-lh-tile.is-restaurants { grid-column: span 2; }
  }
  @media (max-width: 760px) {
    .alchm-lh-cols { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .alchm-lh { padding: 18px 16px; }
    .alchm-lh-title { font-size: 34px; }
    .alchm-lh-actions { flex-direction: column; align-items: stretch; }
    .alchm-lh-tile { min-height: 92px; padding: 11px 12px; }
    .alchm-lh-livechip-name { display: none; }
    .alchm-lh-quiz-opts { grid-template-columns: 1fr; }
    .alchm-lh-panel { padding: 15px 14px; }
    .alchm-lh-quizbar { flex-wrap: wrap; }
  }
`;
