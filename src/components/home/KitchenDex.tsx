"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ELEMENT_ORDER,
  FIRST_MEAL_QUIZ,
  scoreFirstMeal,
} from "@/components/home/kitchenDexFirstMeal";
import {
  GUEST_PALATE_EVENT,
  loadGuestPalate,
  saveGuestBirthday,
  type GuestPalate,
  type PalateElement,
} from "@/utils/guestPalate";

/**
 * The Kitchen Déx — a free-roam, arcade-style "culinary pokédex" that tours the
 * site's capabilities for first-time visitors. Each entry is a capability
 * presented as a collectable specimen card: silhouetted until clicked, playful
 * field-notes on the front, practical "field use" on the flip side. Discovery
 * progress persists in localStorage; cataloguing all entries fires a particle
 * flourish and hands off to the recipe builder.
 *
 * Copy constraint (see src/utils/planetaryAlchemyMapping.ts): quantities
 * (Spirit/Essence/Matter/Substance) come from planetary positions; elements
 * (Fire/Water/Earth/Air) come from the signs those planets occupy. They are
 * orthogonal readings of the same chart and must never be presented as the
 * same four things.
 *
 * All specimen data below is canned demo fixture data — the live recommenders
 * further down the page are the real thing, and the completion copy says so.
 */

const STORAGE_KEY = "alchm:kitchendex:v1";
const FIRST_MEAL_KEY = "alchm:kitchendex:firstmeal:v1";
const GOLD = "#fbbf24";

const ELEMENT_TINTS: Record<PalateElement, string> = {
  Fire: "#f87171",
  Earth: "#34d399",
  Air: "#c084fc",
  Water: "#60a5fa",
};

interface ElementStat {
  label: string;
  pct: number;
}

interface DexEntry {
  id: string;
  no: string;
  name: string;
  glyph: string;
  tint: string;
  hint: string;
  flavor: string;
  specimenLabel: string;
  stats: readonly ElementStat[];
  fieldUse: readonly string[];
  href: string;
  linkLabel: string;
}

const ENTRIES: readonly DexEntry[] = [
  {
    id: "sky",
    no: "001",
    name: "The Living Sky",
    glyph: "🪐",
    tint: "#c084fc",
    hint: "It changes every hour.",
    flavor:
      "The oldest instrument in any kitchen. Every reading here begins overhead: the planets contribute four alchemical quantities — Spirit, Essence, Matter and Substance — while the signs they occupy set a balance of Fire, Water, Earth and Air. Two readings, one sky.",
    specimenLabel: "Sample reading · a summer evening",
    stats: [
      { label: "Fire", pct: 34 },
      { label: "Water", pct: 28 },
      { label: "Earth", pct: 22 },
      { label: "Air", pct: 16 },
    ],
    fieldUse: [
      "Watch the live sky translated into a running elemental balance",
      "See which planets are contributing which quantities right now",
      "Every recommender on this page re-ranks as the sky moves",
    ],
    href: "/quantities",
    linkLabel: "See tonight's reading",
  },
  {
    id: "cuisines",
    no: "002",
    name: "Cuisine Matching",
    glyph: "🍜",
    tint: "#f87171",
    hint: "Tonight has a flavor.",
    flavor:
      "Cuisines behave like weather systems — each carries its own elemental signature. Sichuan burns Fire-heavy; Japanese runs cool and precise. Match a cuisine's signature against tonight's sky and dinner stops being a guess.",
    specimenLabel: "Specimen · Sichuan",
    stats: [
      { label: "Fire", pct: 62 },
      { label: "Earth", pct: 16 },
      { label: "Water", pct: 12 },
      { label: "Air", pct: 10 },
    ],
    fieldUse: [
      "Get tonight's cuisines ranked against the current sky",
      "Open any cuisine to find nearby restaurants that serve it",
      "Browse the full atlas, signature by signature",
    ],
    href: "/cuisines",
    linkLabel: "Browse the cuisine atlas",
  },
  {
    id: "ingredients",
    no: "003",
    name: "The Ingredient Index",
    glyph: "🌿",
    tint: "#34d399",
    hint: "1,000+ specimens and counting.",
    flavor:
      "Saffron: a rare solar specimen, harvested thread by thread at dawn. Every ingredient in the index carries a full alchemical reading — over a thousand catalogued so far, from pantry staples to apex spices.",
    specimenLabel: "Specimen · Saffron",
    stats: [
      { label: "Fire", pct: 55 },
      { label: "Air", pct: 25 },
      { label: "Earth", pct: 12 },
      { label: "Water", pct: 8 },
    ],
    fieldUse: [
      "See which ingredients align with the sky right now",
      "Tap Pantry on any card to track what your kitchen holds",
      "Full readings with nutrition beside the alchemy",
    ],
    href: "/ingredients",
    linkLabel: "Open the index",
  },
  {
    id: "methods",
    no: "004",
    name: "Sauce & Flame",
    glyph: "🔥",
    tint: "#fb923c",
    hint: "Technique is transformation.",
    flavor:
      "Heat is an ingredient. Searing feeds Fire; steaming answers to Water; fermentation is slow Earth-work. Sauces are the same craft in liquid form — every technique and mother sauce here carries its own signature.",
    specimenLabel: "Specimen · Searing",
    stats: [
      { label: "Fire", pct: 78 },
      { label: "Air", pct: 14 },
      { label: "Earth", pct: 6 },
      { label: "Water", pct: 2 },
    ],
    fieldUse: [
      "Tonight's recommended cooking methods, ranked by the sky",
      "Sauce pairings matched to your cuisine of the evening",
      "Deep profiles for every technique in the craft",
    ],
    href: "/cooking-methods",
    linkLabel: "Study the methods",
  },
  {
    id: "forge",
    no: "005",
    name: "The Recipe Forge",
    glyph: "🍳",
    tint: "#fbbf24",
    hint: "Dinner, assembled to order.",
    flavor:
      "Where readings become dinner. Feed the forge your pantry and tonight's sky, and it assembles a recipe you can actually cook — measured, timed, and tuned to the moment you fire the stove.",
    specimenLabel: "Forged specimen · Chorizo Bolognese",
    stats: [
      { label: "Fire", pct: 44 },
      { label: "Earth", pct: 30 },
      { label: "Water", pct: 18 },
      { label: "Air", pct: 8 },
    ],
    fieldUse: [
      "Build a recipe from what your kitchen already holds",
      "Every step measured and timed — cook it tonight",
      "Save your best builds to a personal cookbook",
    ],
    href: "/recipe-builder",
    linkLabel: "Fire the forge",
  },
  {
    id: "lab",
    no: "006",
    name: "The Laboratory",
    glyph: "⚗️",
    tint: "#60a5fa",
    hint: "Capture recipes in the wild.",
    flavor:
      "Found a recipe in the wild? Capture it. Paste the text or snap a photo, and the Laboratory extracts its alchemical signature — then files it in your lab book beside everything else you've caught.",
    specimenLabel: "Field capture · Gremolata",
    stats: [
      { label: "Air", pct: 48 },
      { label: "Fire", pct: 22 },
      { label: "Water", pct: 18 },
      { label: "Earth", pct: 12 },
    ],
    fieldUse: [
      "Paste text or a photo to extract any recipe's signature",
      "Build a lab book of everything you've captured",
      "Compare signatures across your whole collection",
    ],
    href: "/lab",
    linkLabel: "Enter the lab",
  },
  {
    id: "planner",
    no: "007",
    name: "The Week Ahead",
    glyph: "📅",
    tint: "#818cf8",
    hint: "Seven skies, one plan.",
    flavor:
      "A week is seven different skies. The planner drafts your whole week in one pass — breakfast to dinner — then folds it into a single grocery list, so the kitchen stays a step ahead of you.",
    specimenLabel: "Sample week · balanced draft",
    stats: [
      { label: "Fire", pct: 28 },
      { label: "Earth", pct: 27 },
      { label: "Water", pct: 26 },
      { label: "Air", pct: 19 },
    ],
    fieldUse: [
      "Auto-plan a full week of meals in one tap",
      "Every slot swappable, every day rebalanced",
      "One grocery list generated for the whole plan",
    ],
    href: "/menu-planner",
    linkLabel: "Plan the week",
  },
  {
    id: "wild",
    no: "008",
    name: "Food in the Wild",
    glyph: "🧭",
    tint: "#22d3ee",
    hint: "Matches beyond your kitchen.",
    flavor:
      "The guide works outdoors. Point it at your neighborhood and it surfaces real restaurants, ranked by how well each one's cuisine matches tonight's sky — field-verified, and near you.",
    specimenLabel: "Observed nearby · trattoria",
    stats: [
      { label: "Earth", pct: 38 },
      { label: "Fire", pct: 30 },
      { label: "Water", pct: 20 },
      { label: "Air", pct: 12 },
    ],
    fieldUse: [
      "Find nearby restaurants ranked by cuisine match",
      "Works from your location — no account needed",
      "Stock the pantry with Amazon Fresh ingredient links",
    ],
    href: "/restaurants",
    linkLabel: "Scout nearby",
  },
] as const;

/* ─── Particle canvas ─────────────────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
  size: number;
  color: string;
}

interface Mote {
  x: number;
  y: number;
  vy: number;
  size: number;
  phase: number;
  color: string;
}

const MOTE_COLORS = ["#c084fc", "#34d399", "#fbbf24", "#60a5fa", "#f87171"];

function useParticleCanvas(hostRef: React.RefObject<HTMLElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const motesRef = useRef<Mote[]>([]);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const reducedRef = useRef(false);
  const lastTsRef = useRef(0);

  const tick = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      rafRef.current = null;
      return;
    }
    const dt = Math.min((ts - (lastTsRef.current || ts)) / 1000, 0.05);
    lastTsRef.current = ts;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    if (!reducedRef.current && visibleRef.current) {
      for (const m of motesRef.current) {
        m.y -= m.vy * dt;
        m.phase += dt;
        if (m.y < -8) {
          m.y = h + 8;
          m.x = Math.random() * w;
        }
        ctx.globalAlpha = 0.1 + 0.1 * Math.sin(m.phase * 1.4);
        ctx.fillStyle = m.color;
        ctx.fillRect(m.x, m.y, m.size, m.size);
      }
    }

    const alive: Particle[] = [];
    for (const p of particlesRef.current) {
      p.age += dt;
      if (p.age >= p.ttl) continue;
      p.vy += 260 * dt; // gravity
      p.vx *= 1 - 1.6 * dt; // drag
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const t = 1 - p.age / p.ttl;
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      const s = p.size * (0.5 + 0.5 * t);
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      alive.push(p);
    }
    particlesRef.current = alive;
    ctx.globalAlpha = 1;

    const ambient = !reducedRef.current && visibleRef.current;
    if (alive.length > 0 || ambient) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
    }
  }, []);

  const ensureLoop = useCallback(() => {
    if (rafRef.current == null) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const sync = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motesRef.current.length === 0 && !reducedRef.current) {
        motesRef.current = Array.from({ length: 18 }, (_, i) => ({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vy: 6 + Math.random() * 10,
          size: 1.5 + Math.random() * 1.5,
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
      if (visibleRef.current) ensureLoop();
    });
    io.observe(host);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [hostRef, ensureLoop]);

  const burst = useCallback(
    (x: number, y: number, color: string, count = 26) => {
      if (reducedRef.current) return;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 90 + Math.random() * 190;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 70,
          age: 0,
          ttl: 0.55 + Math.random() * 0.5,
          size: 3 + Math.random() * 3,
          color,
        });
      }
      ensureLoop();
    },
    [ensureLoop],
  );

  const flourish = useCallback(() => {
    if (reducedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    for (let i = 0; i < 7; i++) {
      const color = MOTE_COLORS[i % MOTE_COLORS.length];
      const x = ((i + 0.5) / 7) * w;
      const y = h * (0.25 + Math.random() * 0.4);
      burst(x, y, color, 30);
    }
  }, [burst]);

  return { canvasRef, burst, flourish };
}

/* ─── Persistence ─────────────────────────────────────────────────────────── */

interface DexProgress {
  found: string[];
  celebrated: boolean;
}

function loadProgress(): DexProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { found: [], celebrated: false };
    const parsed = JSON.parse(raw) as Partial<DexProgress>;
    const valid = new Set(ENTRIES.map((e) => e.id));
    return {
      found: Array.isArray(parsed.found)
        ? parsed.found.filter((id) => valid.has(id))
        : [],
      celebrated: Boolean(parsed.celebrated),
    };
  } catch {
    return { found: [], celebrated: false };
  }
}

function saveProgress(progress: DexProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* localStorage unavailable */
  }
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function KitchenDex() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { canvasRef, burst, flourish } = useParticleCanvas(sectionRef);
  const { status } = useSession();

  const [found, setFound] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [forcedOpen, setForcedOpen] = useState(false);
  // First Meal quiz: null = not open; length < quiz length = mid-question;
  // full length = result view.
  const [quizAnswers, setQuizAnswers] = useState<number[] | null>(null);
  const [savedMeal, setSavedMeal] = useState<number[] | null>(null);
  const [palate, setPalate] = useState<GuestPalate | null>(null);
  const [bdayInput, setBdayInput] = useState("");
  // Ref mirrors so rapid clicks can never act on a stale closure and drop
  // an earlier discovery.
  const foundRef = useRef<Set<string>>(new Set());
  const celebratedRef = useRef(false);

  // Hydrate persisted discovery state after mount (SSR-safe).
  useEffect(() => {
    const progress = loadProgress();
    foundRef.current = new Set(progress.found);
    celebratedRef.current = progress.celebrated;
    setFound(foundRef.current);
    try {
      const raw = window.localStorage.getItem(FIRST_MEAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { answers?: number[] };
        if (
          Array.isArray(parsed.answers) &&
          parsed.answers.length === FIRST_MEAL_QUIZ.length
        ) {
          setSavedMeal(parsed.answers);
        }
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  // Track the account-free guest palate (birthday → sun sign → element),
  // staying in sync with the BirthdayStrip via the shared window event.
  useEffect(() => {
    const sync = () => setPalate(loadGuestPalate());
    sync();
    window.addEventListener(GUEST_PALATE_EVENT, sync);
    return () => window.removeEventListener(GUEST_PALATE_EVENT, sync);
  }, []);

  const total = ENTRIES.length;
  const complete = found.size === total;
  const collapsed = status === "authenticated" && !forcedOpen;
  const openEntry = useMemo(
    () => ENTRIES.find((e) => e.id === openId) ?? null,
    [openId],
  );
  // The live quiz reading recomputes when a birthday arrives mid-flow, so
  // adding your sign on the result screen visibly re-tunes the meal.
  const reading = useMemo(
    () =>
      quizAnswers && quizAnswers.length === FIRST_MEAL_QUIZ.length
        ? scoreFirstMeal(quizAnswers, palate?.element)
        : null,
    [quizAnswers, palate],
  );
  const savedReading = useMemo(
    () => (savedMeal ? scoreFirstMeal(savedMeal, palate?.element) : null),
    [savedMeal, palate],
  );

  const discover = (entry: DexEntry, tile: HTMLElement) => {
    setOpenId(entry.id);
    setFlipped(false);
    if (foundRef.current.has(entry.id)) return;

    const next = new Set(foundRef.current);
    next.add(entry.id);
    foundRef.current = next;
    setFound(next);
    const nowComplete = next.size === total;
    saveProgress({
      found: [...next],
      celebrated: celebratedRef.current || nowComplete,
    });

    const host = sectionRef.current;
    if (host) {
      const hostRect = host.getBoundingClientRect();
      const rect = tile.getBoundingClientRect();
      burst(
        rect.left - hostRect.left + rect.width / 2,
        rect.top - hostRect.top + rect.height / 2,
        entry.tint,
      );
    }
    if (nowComplete && !celebratedRef.current) {
      celebratedRef.current = true;
      window.setTimeout(flourish, 350);
    }
  };

  const reset = () => {
    foundRef.current = new Set();
    celebratedRef.current = false;
    setFound(new Set());
    setOpenId(null);
    saveProgress({ found: [], celebrated: false });
  };

  const startQuiz = () => {
    setOpenId(null);
    setQuizAnswers([]);
  };

  const answerQuiz = (optionIndex: number, btn: HTMLElement) => {
    if (!quizAnswers || quizAnswers.length >= FIRST_MEAL_QUIZ.length) return;
    const next = [...quizAnswers, optionIndex];
    setQuizAnswers(next);
    if (next.length === FIRST_MEAL_QUIZ.length) {
      setSavedMeal(next);
      try {
        window.localStorage.setItem(
          FIRST_MEAL_KEY,
          JSON.stringify({ answers: next }),
        );
      } catch {
        /* localStorage unavailable */
      }
    }
    const host = sectionRef.current;
    if (host) {
      const hostRect = host.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      burst(
        rect.left - hostRect.left + rect.width / 2,
        rect.top - hostRect.top + rect.height / 2,
        GOLD,
        next.length === FIRST_MEAL_QUIZ.length ? 40 : 16,
      );
    }
  };

  if (collapsed) {
    return (
      <section className="alchm-dex-slim" aria-label="The Kitchen Déx">
        <style>{slimStyles}</style>
        <span className="t-mono alchm-dex-slim-tag" aria-hidden="true">
          ▣ THE KITCHEN DÉX
        </span>
        <span className="alchm-dex-slim-count t-mono">
          {found.size}/{total} catalogued
        </span>
        <button
          type="button"
          className="t-mono alchm-dex-slim-open"
          onClick={() => setForcedOpen(true)}
        >
          Open the field guide →
        </button>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="alchm-dex"
      aria-labelledby="alchm-dex-title"
    >
      <style>{dexStyles}</style>
      <canvas ref={canvasRef} className="alchm-dex-canvas" aria-hidden="true" />

      <header className="alchm-dex-head">
        <div>
          <p className="t-tag alchm-dex-eyebrow">
            FIELD GUIDE · CULINARY SPECIMENS
          </p>
          <h2 id="alchm-dex-title" className="t-display alchm-dex-title">
            The Kitchen Déx
          </h2>
          <p className="alchm-dex-intro">
            A collector&apos;s index of what this kitchen can do. Tap the
            silhouettes to catalogue each entry — the real thing runs live
            further down the page.
          </p>
        </div>
        <div className="alchm-dex-hud t-mono" aria-live="polite">
          <span className="alchm-dex-hud-label">CATALOGUED</span>
          <span className="alchm-dex-hud-count">
            {found.size}
            <span className="alchm-dex-hud-total">/{total}</span>
          </span>
          <span className="alchm-dex-hud-pips" aria-hidden="true">
            {ENTRIES.map((e) => (
              <i
                key={e.id}
                className={found.has(e.id) ? "is-on" : undefined}
                style={{ ["--q" as string]: e.tint }}
              />
            ))}
          </span>
        </div>
      </header>

      {quizAnswers !== null && quizAnswers.length < FIRST_MEAL_QUIZ.length ? (
        <div key={`quiz-${quizAnswers.length}`} className="alchm-dex-stage">
          <div className="alchm-dex-panel" style={{ ["--q" as string]: GOLD }}>
            <div className="alchm-dex-quiz-head">
              <p className="t-mono alchm-dex-card-no">
                №000 · CRAFTING — Q{quizAnswers.length + 1}/
                {FIRST_MEAL_QUIZ.length}
              </p>
              <span className="alchm-dex-quiz-pips" aria-hidden="true">
                {FIRST_MEAL_QUIZ.map((q, i) => (
                  <i
                    key={q.id}
                    className={
                      i < quizAnswers.length
                        ? "is-on"
                        : i === quizAnswers.length
                          ? "is-now"
                          : undefined
                    }
                  />
                ))}
              </span>
            </div>
            <h3 className="alchm-dex-quiz-prompt">
              {FIRST_MEAL_QUIZ[quizAnswers.length].prompt}
            </h3>
            <div className="alchm-dex-quiz-opts">
              {FIRST_MEAL_QUIZ[quizAnswers.length].options.map((o, i) => (
                <button
                  key={o.label}
                  type="button"
                  className="alchm-dex-quiz-opt"
                  style={{ ["--i" as string]: i }}
                  onClick={(e) => answerQuiz(i, e.currentTarget)}
                >
                  <span className="alchm-dex-quiz-opt-label">{o.label}</span>
                  <span className="alchm-dex-quiz-opt-sub">{o.sub}</span>
                </button>
              ))}
            </div>
            <div className="alchm-dex-card-actions">
              <button
                type="button"
                className="alchm-dex-btn is-ghost"
                onClick={() => setQuizAnswers(null)}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      ) : quizAnswers !== null && reading ? (
        <div key="first-meal-result" className="alchm-dex-stage">
          <div className="alchm-dex-panel" style={{ ["--q" as string]: GOLD }}>
            <div className="alchm-dex-card-top">
              <span className="alchm-dex-card-glyph" aria-hidden="true">
                {reading.meal.emoji}
              </span>
              <div>
                <p className="t-mono alchm-dex-card-no">
                  №000 · THE FIRST READING
                </p>
                <h3 className="alchm-dex-card-name">{reading.meal.name}</h3>
                <p className="t-mono alchm-dex-result-chips">
                  {reading.meal.cuisine.toUpperCase()} ·{" "}
                  {reading.meal.method.toUpperCase()}
                </p>
              </div>
            </div>
            <p className="alchm-dex-card-flavor">{reading.meal.blurb}</p>
            <div className="alchm-dex-specimen">
              <p className="t-mono alchm-dex-specimen-label">
                Your reading —{" "}
                {quizAnswers
                  .slice(0, 3)
                  .map((a, i) => FIRST_MEAL_QUIZ[i].options[a].label)
                  .join(" · ")}
                {palate ? ` · ${palate.glyph} ${palate.signLabel} sun` : ""}
              </p>
              <div className="alchm-dex-stats">
                {ELEMENT_ORDER.map((el) => (
                  <div
                    key={el}
                    className="alchm-dex-stat"
                    style={{ ["--q" as string]: ELEMENT_TINTS[el] }}
                  >
                    <span className="t-mono alchm-dex-stat-label">{el}</span>
                    <span className="alchm-dex-stat-track">
                      <span
                        className="alchm-dex-stat-bar"
                        style={{ width: `${reading.pct[el]}%` }}
                      />
                    </span>
                    <span className="t-mono alchm-dex-stat-pct">
                      {reading.pct[el]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {palate ? (
              <p className="alchm-dex-result-note">
                Tuned to your {palate.glyph} {palate.signLabel} sun. Want the
                full picture?{" "}
                <Link href="/onboarding" className="alchm-dex-result-link">
                  Set up your chart →
                </Link>{" "}
                <Link href="/login" className="alchm-dex-result-link is-quiet">
                  or sign in to save readings
                </Link>
              </p>
            ) : (
              <div className="alchm-dex-result-tune">
                <p className="alchm-dex-result-note">
                  Add your birthday and this reading tunes to your sun sign — no
                  account needed.
                </p>
                <span className="alchm-dex-result-tune-row">
                  <input
                    type="date"
                    className="alchm-dex-date"
                    aria-label="Your birthday"
                    value={bdayInput}
                    min="1900-01-01"
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setBdayInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="alchm-dex-btn"
                    disabled={!bdayInput}
                    onClick={() => {
                      const p = saveGuestBirthday(bdayInput);
                      if (p) setPalate(p);
                    }}
                  >
                    Tune it →
                  </button>
                </span>
              </div>
            )}
            <div className="alchm-dex-card-actions">
              <Link
                href={`/recipes?cuisine=${reading.meal.cuisineSlug}`}
                className="alchm-dex-btn is-cta"
              >
                See {reading.meal.cuisine} recipes →
              </Link>
              <Link href="/recipe-builder" className="alchm-dex-btn">
                Build it my way
              </Link>
              <button
                type="button"
                className="alchm-dex-btn is-ghost"
                onClick={() => setQuizAnswers([])}
              >
                ⟲ Recraft
              </button>
              <button
                type="button"
                className="alchm-dex-btn is-ghost"
                onClick={() => setQuizAnswers(null)}
              >
                ← Index
              </button>
            </div>
          </div>
        </div>
      ) : openEntry ? (
        <div key={openEntry.id} className="alchm-dex-stage">
          <div
            className={`alchm-dex-card${flipped ? " is-flipped" : ""}`}
            style={{ ["--q" as string]: openEntry.tint }}
          >
            {/* Front — specimen field notes */}
            <div className="alchm-dex-card-face alchm-dex-card-front">
              <div className="alchm-dex-card-top">
                <span className="alchm-dex-card-glyph" aria-hidden="true">
                  {openEntry.glyph}
                </span>
                <div>
                  <p className="t-mono alchm-dex-card-no">
                    ENTRY №{openEntry.no}
                  </p>
                  <h3 className="alchm-dex-card-name">{openEntry.name}</h3>
                </div>
              </div>
              <p className="alchm-dex-card-flavor">{openEntry.flavor}</p>
              <div className="alchm-dex-specimen">
                <p className="t-mono alchm-dex-specimen-label">
                  {openEntry.specimenLabel}
                </p>
                <div className="alchm-dex-stats">
                  {openEntry.stats.map((s) => (
                    <div key={s.label} className="alchm-dex-stat">
                      <span className="t-mono alchm-dex-stat-label">
                        {s.label}
                      </span>
                      <span className="alchm-dex-stat-track">
                        <span
                          className="alchm-dex-stat-bar"
                          style={{ width: `${s.pct}%` }}
                        />
                      </span>
                      <span className="t-mono alchm-dex-stat-pct">
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="alchm-dex-card-actions">
                <button
                  type="button"
                  className="alchm-dex-btn"
                  onClick={() => setFlipped(true)}
                >
                  Field use ⟳
                </button>
                <button
                  type="button"
                  className="alchm-dex-btn is-ghost"
                  onClick={() => setOpenId(null)}
                >
                  ← Back to index
                </button>
              </div>
            </div>

            {/* Back — practical field use */}
            <div className="alchm-dex-card-face alchm-dex-card-back">
              <div className="alchm-dex-card-top">
                <span className="alchm-dex-card-glyph" aria-hidden="true">
                  {openEntry.glyph}
                </span>
                <div>
                  <p className="t-mono alchm-dex-card-no">
                    №{openEntry.no} · FIELD USE
                  </p>
                  <h3 className="alchm-dex-card-name">{openEntry.name}</h3>
                </div>
              </div>
              <ul className="alchm-dex-uses">
                {openEntry.fieldUse.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <div className="alchm-dex-card-actions">
                <Link href={openEntry.href} className="alchm-dex-btn is-cta">
                  {openEntry.linkLabel} →
                </Link>
                <button
                  type="button"
                  className="alchm-dex-btn is-ghost"
                  onClick={() => setFlipped(false)}
                >
                  ⟲ Specimen
                </button>
                <button
                  type="button"
                  className="alchm-dex-btn is-ghost"
                  onClick={() => setOpenId(null)}
                >
                  ← Index
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={`alchm-dex-first${savedMeal ? " is-crafted" : ""}`}
            style={{ ["--q" as string]: GOLD }}
            onClick={() =>
              savedMeal ? setQuizAnswers([...savedMeal]) : startQuiz()
            }
          >
            <span className="alchm-dex-first-copy">
              <span className="t-mono alchm-dex-first-no">
                №000 · THE FIRST MEAL
              </span>
              {savedReading ? (
                <span className="alchm-dex-first-name">
                  {savedReading.meal.emoji} {savedReading.meal.name}
                  <em> · {savedReading.meal.cuisine}</em>
                </span>
              ) : (
                <span className="alchm-dex-first-name">
                  Four taps craft tonight&apos;s dish
                  {palate
                    ? ` — tuned to your ${palate.glyph} ${palate.signLabel} sun`
                    : " — what do you feel like eating?"}
                </span>
              )}
            </span>
            <span className="t-mono alchm-dex-first-start">
              {savedMeal ? "VIEW →" : "▶ PRESS START"}
            </span>
          </button>
          <div className="alchm-dex-grid">
            {ENTRIES.map((entry, index) => {
              const isFound = found.has(entry.id);
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`alchm-dex-tile${isFound ? " is-found" : ""}`}
                  style={{
                    ["--q" as string]: entry.tint,
                    ["--i" as string]: index,
                  }}
                  onClick={(e) => discover(entry, e.currentTarget)}
                  aria-label={
                    isFound
                      ? `Entry ${entry.no}: ${entry.name}`
                      : `Entry ${entry.no}: undiscovered — tap to catalogue`
                  }
                >
                  <span className="t-mono alchm-dex-tile-no">№{entry.no}</span>
                  <span className="alchm-dex-tile-glyph" aria-hidden="true">
                    {entry.glyph}
                  </span>
                  <span className="alchm-dex-tile-name">
                    {isFound ? entry.name : "???"}
                  </span>
                  <span className="alchm-dex-tile-hint">
                    {isFound ? "Catalogued ✓" : entry.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {quizAnswers !== null || openEntry ? null : complete ? (
        <div className="alchm-dex-complete">
          <div>
            <p className="t-mono alchm-dex-complete-tag">
              ★ FIELD GUIDE COMPLETE
            </p>
            <p className="alchm-dex-complete-copy">
              All eight entries catalogued. Everything below this panel is the
              real thing, reading the live sky right now.
            </p>
          </div>
          <div className="alchm-dex-complete-actions">
            <Link href="/recipe-builder" className="alchm-dex-btn is-cta">
              Build tonight&apos;s recipe →
            </Link>
            <button
              type="button"
              className="alchm-dex-btn is-ghost"
              onClick={reset}
            >
              New game +
            </button>
          </div>
        </div>
      ) : (
        <p className="alchm-dex-foot t-mono">
          ▸ Tap an entry to catalogue it. Complete the guide to unlock the
          forge.
        </p>
      )}
    </section>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */

const dexStyles = `
  .alchm-dex {
    position: relative;
    isolation: isolate;
    display: grid;
    gap: 20px;
    padding: clamp(20px, 3.5vw, 30px);
    border: 1px solid var(--line-hi);
    border-radius: var(--radius);
    background:
      repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 3px),
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.006));
    overflow: hidden;
  }
  .alchm-dex-canvas {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
  .alchm-dex-head {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }
  .alchm-dex-eyebrow { margin: 0 0 10px; color: var(--accent-2); }
  .alchm-dex-title {
    margin: 0;
    color: var(--fg);
    font-size: clamp(22px, 3vw, 30px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .alchm-dex-intro {
    max-width: 560px;
    margin: 10px 0 0;
    color: var(--fg-dim);
    font-size: 13.5px;
    line-height: 1.6;
  }
  .alchm-dex-hud {
    display: grid;
    justify-items: end;
    gap: 5px;
    padding: 10px 14px;
    border: 2px solid var(--line-hi);
    border-radius: 10px;
    background: rgba(0,0,0,0.25);
    box-shadow: 3px 3px 0 rgba(0,0,0,0.35);
  }
  .alchm-dex-hud-label { color: var(--fg-mute); font-size: 8px; letter-spacing: 0.2em; }
  .alchm-dex-hud-count { color: var(--accent); font-size: 22px; line-height: 1; }
  .alchm-dex-hud-total { color: var(--fg-mute); font-size: 13px; }
  .alchm-dex-hud-pips { display: flex; gap: 4px; }
  .alchm-dex-hud-pips i {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--line-hi);
    transition: all 0.25s;
  }
  .alchm-dex-hud-pips i.is-on {
    background: var(--q);
    border-color: var(--q);
    box-shadow: 0 0 8px color-mix(in oklch, var(--q), transparent 40%);
  }
  .alchm-dex-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }
  @keyframes alchm-dex-tile-in {
    from { opacity: 0; transform: translateY(10px); }
  }
  .alchm-dex-tile {
    animation: alchm-dex-tile-in 0.35s ease-out backwards;
    animation-delay: calc(var(--i, 0) * 45ms);
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 6px;
    min-height: 148px;
    padding: 16px 10px;
    border: 2px solid var(--line-hi);
    border-radius: 12px;
    background: rgba(0,0,0,0.22);
    box-shadow: 4px 4px 0 rgba(0,0,0,0.35);
    cursor: pointer;
    transition: transform 0.12s, box-shadow 0.12s, border-color 0.2s, background 0.2s;
  }
  .alchm-dex-tile:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 rgba(0,0,0,0.4);
    border-color: color-mix(in oklch, var(--q), transparent 35%);
  }
  .alchm-dex-tile:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 rgba(0,0,0,0.4);
  }
  .alchm-dex-tile.is-found {
    border-color: color-mix(in oklch, var(--q), transparent 45%);
    background: color-mix(in oklch, var(--q), transparent 93%);
  }
  .alchm-dex-tile-no { color: var(--fg-mute); font-size: 9px; letter-spacing: 0.16em; }
  .alchm-dex-tile-glyph {
    font-size: 34px;
    line-height: 1;
    filter: brightness(0) invert(0.28);
    transition: filter 0.3s, transform 0.3s;
  }
  .alchm-dex-tile:hover .alchm-dex-tile-glyph { transform: scale(1.12); }
  .alchm-dex-tile.is-found .alchm-dex-tile-glyph { filter: none; }
  .alchm-dex-tile-name {
    color: var(--fg);
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .alchm-dex-tile:not(.is-found) .alchm-dex-tile-name {
    color: var(--fg-mute);
    letter-spacing: 0.3em;
  }
  .alchm-dex-tile-hint { color: var(--fg-mute); font-size: 9.5px; text-align: center; line-height: 1.4; }
  .alchm-dex-tile.is-found .alchm-dex-tile-hint { color: color-mix(in oklch, var(--q), transparent 25%); }

  @keyframes alchm-dex-stage-in {
    from { opacity: 0; transform: rotateY(-55deg) scale(0.94); }
  }
  .alchm-dex-stage {
    position: relative;
    z-index: 1;
    perspective: 1200px;
    animation: alchm-dex-stage-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  .alchm-dex-card {
    position: relative;
    display: grid;
    min-height: 320px;
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.5, 1);
  }
  .alchm-dex-card.is-flipped { transform: rotateY(180deg); }
  .alchm-dex-card-face {
    grid-area: 1 / 1;
    display: grid;
    align-content: start;
    gap: 16px;
    padding: 22px;
    border: 2px solid color-mix(in oklch, var(--q), transparent 50%);
    border-radius: 14px;
    background:
      radial-gradient(circle at 90% 0%, color-mix(in oklch, var(--q), transparent 88%), transparent 45%),
      rgba(0,0,0,0.3);
    box-shadow: 5px 5px 0 rgba(0,0,0,0.35);
    backface-visibility: hidden;
  }
  .alchm-dex-card-back { transform: rotateY(180deg); }
  .alchm-dex-card-top { display: flex; align-items: center; gap: 14px; }
  .alchm-dex-card-glyph {
    font-size: 44px;
    line-height: 1;
    padding: 10px;
    border: 2px solid color-mix(in oklch, var(--q), transparent 60%);
    border-radius: 12px;
    background: color-mix(in oklch, var(--q), transparent 92%);
  }
  .alchm-dex-card-no { margin: 0 0 3px; color: var(--q); font-size: 9px; letter-spacing: 0.2em; }
  .alchm-dex-card-name { margin: 0; color: var(--fg); font-size: 20px; font-weight: 750; letter-spacing: -0.02em; }
  .alchm-dex-card-flavor {
    max-width: 640px;
    margin: 0;
    color: var(--fg-dim);
    font-size: 13.5px;
    line-height: 1.65;
  }
  .alchm-dex-specimen {
    display: grid;
    gap: 9px;
    padding: 13px 15px;
    border: 1px solid var(--line-hi);
    border-radius: 10px;
    background: rgba(0,0,0,0.28);
  }
  .alchm-dex-specimen-label { margin: 0; color: var(--fg-mute); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; }
  .alchm-dex-stats { display: grid; gap: 6px; }
  .alchm-dex-stat {
    display: grid;
    grid-template-columns: 44px 1fr 34px;
    align-items: center;
    gap: 9px;
  }
  .alchm-dex-stat-label { color: var(--fg-dim); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; }
  .alchm-dex-stat-track {
    height: 8px;
    border-radius: 4px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }
  .alchm-dex-stat-bar {
    display: block;
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, color-mix(in oklch, var(--q), transparent 35%), var(--q));
    box-shadow: 0 0 8px color-mix(in oklch, var(--q), transparent 55%);
    animation: alchm-dex-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  @keyframes alchm-dex-grow { from { width: 0; } }
  .alchm-dex-uses {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .alchm-dex-uses li {
    position: relative;
    padding: 11px 14px 11px 34px;
    border: 1px solid var(--line-hi);
    border-radius: 10px;
    background: rgba(0,0,0,0.24);
    color: var(--fg-dim);
    font-size: 12.5px;
    line-height: 1.5;
  }
  .alchm-dex-uses li::before {
    content: "▸";
    position: absolute;
    left: 13px;
    color: var(--q);
  }
  .alchm-dex-card-actions { display: flex; flex-wrap: wrap; gap: 10px; }
  .alchm-dex-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border: 2px solid var(--line-hi);
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    box-shadow: 3px 3px 0 rgba(0,0,0,0.35);
    color: var(--fg-dim);
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s, background 0.2s, color 0.2s;
  }
  .alchm-dex-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
    color: var(--fg);
  }
  .alchm-dex-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 rgba(0,0,0,0.4);
  }
  .alchm-dex-btn.is-cta {
    border-color: color-mix(in oklch, var(--accent), white 10%);
    background: var(--accent);
    color: #110d18;
  }
  .alchm-dex-btn.is-ghost { background: transparent; }
  @keyframes alchm-dex-pop {
    from { opacity: 0; transform: scale(0.96); }
  }
  .alchm-dex-complete {
    position: relative;
    z-index: 1;
    animation: alchm-dex-pop 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 16px 18px;
    border: 2px solid color-mix(in oklch, var(--accent), transparent 45%);
    border-radius: 12px;
    background: color-mix(in oklch, var(--accent), transparent 92%);
    box-shadow: 4px 4px 0 rgba(0,0,0,0.3);
  }
  .alchm-dex-complete-tag { margin: 0 0 5px; color: var(--accent); font-size: 10px; letter-spacing: 0.2em; }
  .alchm-dex-complete-copy { margin: 0; color: var(--fg-dim); font-size: 12.5px; line-height: 1.55; max-width: 520px; }
  .alchm-dex-complete-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .alchm-dex-foot {
    position: relative;
    z-index: 1;
    margin: 0;
    color: var(--fg-mute);
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .alchm-dex-first {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    padding: 15px 18px;
    border: 2px solid color-mix(in oklch, var(--q), transparent 45%);
    border-radius: 12px;
    background:
      radial-gradient(circle at 0% 50%, color-mix(in oklch, var(--q), transparent 86%), transparent 55%),
      rgba(0,0,0,0.24);
    box-shadow: 4px 4px 0 rgba(0,0,0,0.35);
    cursor: pointer;
    text-align: left;
    transition: transform 0.12s, box-shadow 0.12s;
    animation: alchm-dex-first-pulse 2.4s ease-in-out infinite;
  }
  @keyframes alchm-dex-first-pulse {
    0%, 100% { border-color: color-mix(in oklch, var(--q), transparent 45%); }
    50% { border-color: color-mix(in oklch, var(--q), transparent 10%); }
  }
  .alchm-dex-first.is-crafted { animation: none; }
  .alchm-dex-first:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 rgba(0,0,0,0.4);
  }
  .alchm-dex-first:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 rgba(0,0,0,0.4);
  }
  .alchm-dex-first-copy { display: grid; gap: 4px; min-width: 0; }
  .alchm-dex-first-no { color: var(--q); font-size: 9px; letter-spacing: 0.2em; }
  .alchm-dex-first-name { color: var(--fg); font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
  .alchm-dex-first-name em { color: var(--fg-mute); font-style: normal; font-weight: 600; font-size: 12px; }
  .alchm-dex-first-start {
    flex-shrink: 0;
    padding: 9px 16px;
    border: 2px solid color-mix(in oklch, var(--q), transparent 30%);
    border-radius: 10px;
    background: color-mix(in oklch, var(--q), transparent 88%);
    color: var(--q);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }
  .alchm-dex-panel {
    display: grid;
    align-content: start;
    gap: 16px;
    padding: 22px;
    border: 2px solid color-mix(in oklch, var(--q), transparent 50%);
    border-radius: 14px;
    background:
      radial-gradient(circle at 90% 0%, color-mix(in oklch, var(--q), transparent 88%), transparent 45%),
      rgba(0,0,0,0.3);
    box-shadow: 5px 5px 0 rgba(0,0,0,0.35);
  }
  .alchm-dex-quiz-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .alchm-dex-quiz-head p { margin: 0; }
  .alchm-dex-quiz-pips { display: flex; gap: 5px; }
  .alchm-dex-quiz-pips i {
    width: 20px;
    height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--line-hi);
  }
  .alchm-dex-quiz-pips i.is-on { background: var(--q); border-color: var(--q); }
  .alchm-dex-quiz-pips i.is-now { border-color: var(--q); }
  .alchm-dex-quiz-prompt {
    margin: 0;
    color: var(--fg);
    font-size: clamp(19px, 2.6vw, 25px);
    font-weight: 750;
    letter-spacing: -0.02em;
  }
  .alchm-dex-quiz-opts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .alchm-dex-quiz-opt {
    display: grid;
    gap: 3px;
    padding: 14px 16px;
    border: 2px solid var(--line-hi);
    border-radius: 12px;
    background: rgba(0,0,0,0.24);
    box-shadow: 3px 3px 0 rgba(0,0,0,0.35);
    cursor: pointer;
    text-align: left;
    transition: transform 0.1s, box-shadow 0.1s, border-color 0.2s;
    animation: alchm-dex-tile-in 0.3s ease-out backwards;
    animation-delay: calc(var(--i, 0) * 50ms);
  }
  .alchm-dex-quiz-opt:hover {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0 rgba(0,0,0,0.4);
    border-color: color-mix(in oklch, var(--q), transparent 35%);
  }
  .alchm-dex-quiz-opt:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 rgba(0,0,0,0.4);
  }
  .alchm-dex-quiz-opt-label { color: var(--fg); font-size: 13.5px; font-weight: 700; }
  .alchm-dex-quiz-opt-sub { color: var(--fg-mute); font-size: 11px; }
  .alchm-dex-result-chips { margin: 4px 0 0; color: var(--fg-mute); font-size: 9px; letter-spacing: 0.16em; }
  .alchm-dex-result-note { margin: 0; color: var(--fg-dim); font-size: 12px; line-height: 1.55; }
  .alchm-dex-result-link { color: var(--accent); text-decoration: none; font-weight: 650; }
  .alchm-dex-result-link:hover { text-decoration: underline; }
  .alchm-dex-result-link.is-quiet { color: var(--fg-mute); }
  .alchm-dex-result-tune {
    display: grid;
    gap: 10px;
    padding: 13px 15px;
    border: 1px dashed color-mix(in oklch, var(--q), transparent 45%);
    border-radius: 10px;
    background: color-mix(in oklch, var(--q), transparent 94%);
  }
  .alchm-dex-result-tune-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .alchm-dex-date {
    padding: 8px 10px;
    border: 1px solid var(--line-hi);
    border-radius: 8px;
    background: rgba(0,0,0,0.3);
    color: var(--fg);
    font-size: 12px;
    color-scheme: dark;
  }
  .alchm-dex-date:focus {
    outline: none;
    border-color: color-mix(in oklch, var(--q), transparent 30%);
  }
  .alchm-dex-btn:disabled { opacity: 0.4; cursor: default; }
  @media (prefers-reduced-motion: reduce) {
    .alchm-dex-tile, .alchm-dex-stage, .alchm-dex-complete,
    .alchm-dex-first, .alchm-dex-quiz-opt { animation: none; }
    .alchm-dex-card { transition: none; }
  }
  @media (max-width: 900px) {
    .alchm-dex-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .alchm-dex-tile { min-height: 128px; }
    .alchm-dex-card-face, .alchm-dex-panel { padding: 16px; }
    .alchm-dex-stat { grid-template-columns: 40px 1fr 32px; }
    .alchm-dex-quiz-opts { grid-template-columns: 1fr; }
    .alchm-dex-first { padding: 13px 14px; }
  }
`;

const slimStyles = `
  .alchm-dex-slim {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    padding: 12px 16px;
    border: 1px solid var(--line-hi);
    border-radius: var(--radius);
    background: linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.008));
  }
  .alchm-dex-slim-tag { color: var(--accent-2); font-size: 10px; letter-spacing: 0.18em; }
  .alchm-dex-slim-count { color: var(--fg-mute); font-size: 10px; letter-spacing: 0.12em; }
  .alchm-dex-slim-open {
    margin-left: auto;
    padding: 6px 12px;
    border: 1px solid color-mix(in oklch, var(--accent), transparent 55%);
    border-radius: 8px;
    background: transparent;
    color: var(--accent);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .alchm-dex-slim-open:hover { background: color-mix(in oklch, var(--accent), transparent 90%); }
`;
