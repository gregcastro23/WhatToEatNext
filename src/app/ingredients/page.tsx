"use client";

/**
 * Alchemical Pantry — dedicated ingredient discovery & Amazon sourcing page.
 *
 * Pulls from the static `allIngredients` collection (already standardized via
 * processIngredientCollection in src/data/ingredients/index.ts). Every result
 * is paired with a verified ASIN (when available) or an affiliate-tagged
 * search fallback through getAmazonLink, so every click preserves attribution.
 */

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { resolveAsin } from "@/data/amazon/ingredientAsins";
import { allIngredients } from "@/data/ingredients";
import { useAlchemical } from "@/hooks/useAlchemical";
import { getAmazonLink, getAmazonButtonText } from "@/lib/amazonUrl";
import type { Ingredient } from "@/types";
import { normalizeForDisplay } from "@/utils/elemental/normalization";

type ElementKey = "Fire" | "Water" | "Earth" | "Air";

const ELEMENT_META: Record<
  ElementKey,
  { icon: string; gradient: string; chip: string }
> = {
  Fire: {
    icon: "🔥",
    gradient: "from-red-400 to-orange-500",
    chip: "bg-orange-500/15 text-orange-200 border-orange-400/30",
  },
  Water: {
    icon: "💧",
    gradient: "from-blue-400 to-cyan-500",
    chip: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
  },
  Earth: {
    icon: "🌍",
    gradient: "from-emerald-500 to-green-600",
    chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  },
  Air: {
    icon: "💨",
    gradient: "from-indigo-400 to-purple-500",
    chip: "bg-purple-500/15 text-purple-200 border-purple-400/30",
  },
};

const CATEGORY_CHOICES: Array<{
  id: string;
  label: string;
  icon: string;
  match: (ing: Ingredient) => boolean;
}> = [
  { id: "all", label: "All", icon: "✨", match: () => true },
  {
    id: "spice",
    label: "Spices",
    icon: "🌶️",
    match: (i) => i.category === "spice",
  },
  {
    id: "culinary_herb",
    label: "Herbs",
    icon: "🌿",
    match: (i) =>
      i.category === "culinary_herb" || i.category === "medicinal_herb",
  },
  {
    id: "vegetable",
    label: "Vegetables",
    icon: "🥬",
    match: (i) => i.category === "vegetable",
  },
  {
    id: "protein",
    label: "Proteins",
    icon: "🍗",
    match: (i) => i.category === "protein",
  },
  {
    id: "fruit",
    label: "Fruits",
    icon: "🍎",
    match: (i) => i.category === "fruit",
  },
  {
    id: "grain",
    label: "Grains",
    icon: "🌾",
    match: (i) => i.category === "grain",
  },
  {
    id: "oil",
    label: "Oils",
    icon: "🫒",
    match: (i) => i.category === "oil" || i.category === "vinegar",
  },
];

const SEASON_CHOICES = ["all", "spring", "summer", "autumn", "winter"] as const;

const PLANET_ELEMENT: Record<string, ElementKey> = {
  Sun: "Fire",
  Mars: "Fire",
  Jupiter: "Fire",
  Moon: "Water",
  Venus: "Water",
  Neptune: "Water",
  Mercury: "Air",
  Uranus: "Air",
  Saturn: "Earth",
  Pluto: "Earth",
};

const SIGN_ELEMENT: Record<string, ElementKey> = {
  aries: "Fire",
  leo: "Fire",
  sagittarius: "Fire",
  taurus: "Earth",
  virgo: "Earth",
  capricorn: "Earth",
  gemini: "Air",
  libra: "Air",
  aquarius: "Air",
  cancer: "Water",
  scorpio: "Water",
  pisces: "Water",
};

function dominantElement(props: Ingredient["elementalProperties"]): ElementKey {
  const entries = (Object.entries(props || {}) as Array<[ElementKey, number]>)
    .filter(([k]) => k in ELEMENT_META)
    .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
  return (entries[0]?.[0]) || "Earth";
}

function seasonsOf(ing: Ingredient): string[] {
  const raw = (ing as unknown as { seasonality?: unknown }).seasonality;
  if (Array.isArray(raw)) return raw.map((s) => String(s).toLowerCase());
  if (typeof raw === "string")
    return raw
      .toLowerCase()
      .split(/[,/]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

interface CulinaryDetails {
  flavorTags: string[];        // Primary descriptors (e.g. "warm", "earthy")
  flavorNotes?: string;        // Sentence-level guidance
  commonUses: string[];        // Dishes / applications
  cookingMethods: string[];    // bloom, sauté, infuse, etc.
  cuisines: string[];          // Cuisine affinity
  pairings: string[];          // Complementary ingredients
  prepTips: string[];          // Quick technique notes
}

/**
 * Pull culinary detail from every shape we see in the static data:
 * - top-level: flavorProfile (string or object), culinaryUses, pairings, cookingMethods
 * - culinaryProfile: { flavorProfile: { primary, secondary, notes }, cookingMethods, cuisineAffinity, preparationTips }
 * - culinaryApplications: { commonUses, pairingRecommendations: { complementary }, ... }
 */
function getCulinaryDetails(ing: Ingredient): CulinaryDetails {
  const root = ing as unknown as Record<string, unknown>;
  const profile = asObject(root.culinaryProfile);
  const apps = asObject(root.culinaryApplications);

  const flavorObj =
    asObject(profile?.flavorProfile) ?? asObject(root.flavorProfile);
  const flavorString =
    typeof root.flavorProfile === "string" ? root.flavorProfile : null;

  const flavorTags = (() => {
    if (flavorObj) {
      const primary = asStringArray(flavorObj.primary);
      const secondary = asStringArray(flavorObj.secondary);
      const merged = [...primary, ...secondary];
      if (merged.length) return Array.from(new Set(merged));
      // Numeric flavor maps (sweet/sour/etc.) — pick the strongest dimensions.
      const numeric = Object.entries(flavorObj)
        .map(([k, v]) => [k, Number(v)] as const)
        .filter(([, v]) => Number.isFinite(v) && v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);
      return numeric;
    }
    if (flavorString) {
      return flavorString
        .split(/[,;·]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);
    }
    return [];
  })();

  const flavorNotes =
    (flavorObj && typeof flavorObj.notes === "string"
      ? flavorObj.notes
      : undefined) ??
    (typeof root.notes === "string" ? root.notes : undefined);

  const commonUses = (() => {
    if (apps?.commonUses) return asStringArray(apps.commonUses);
    const direct =
      asStringArray(root.culinaryUses).length > 0
        ? asStringArray(root.culinaryUses)
        : asStringArray(root.uses);
    return direct;
  })();

  const cookingMethods = (() => {
    const fromProfile = asStringArray(profile?.cookingMethods);
    if (fromProfile.length) return fromProfile;
    const fromRoot = asStringArray(root.cookingMethods);
    if (fromRoot.length) return fromRoot;
    if (apps?.techniques && typeof apps.techniques === "object") {
      return Object.keys(apps.techniques);
    }
    return [];
  })();

  const cuisines = (() => {
    const fromProfile = asStringArray(profile?.cuisineAffinity);
    if (fromProfile.length) return fromProfile;
    return asStringArray(root.cuisineAffinity);
  })();

  const pairings = (() => {
    const pairingsObj = asObject(apps?.pairingRecommendations);
    const complementary = asStringArray(pairingsObj?.complementary);
    if (complementary.length) return complementary;
    const direct =
      asStringArray(root.pairings).length > 0
        ? asStringArray(root.pairings)
        : asStringArray(root.pairingRecommendations);
    if (direct.length) return direct;
    return asStringArray(root.affinities);
  })();

  const prepTips = (() => {
    const fromProfile = asStringArray(profile?.preparationTips);
    if (fromProfile.length) return fromProfile;
    return asStringArray(root.preparationTips);
  })();

  return { flavorTags, flavorNotes, commonUses, cookingMethods, cuisines, pairings, prepTips };
}

interface DerivedIngredient {
  ingredient: Ingredient;
  dominant: ElementKey;
  asin: string | null;
  score: number;
  seasons: string[];
}

export default function IngredientsPage() {
  const { planetaryPositions, isLoading: alchemyLoading } = useAlchemical();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [element, setElement] = useState<"all" | ElementKey>("all");
  const [season, setSeason] = useState<(typeof SEASON_CHOICES)[number]>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeName, setActiveName] = useState<string | null>(null);

  // Compute the user's "alchemical resonance" — a weight per element derived
  // from the live planetary positions. Used to personalize ranking.
  const resonance = useMemo<Record<ElementKey, number>>(() => {
    const weights: Record<ElementKey, number> = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    };
    for (const [planet, pos] of Object.entries(planetaryPositions || {})) {
      const planetEl = PLANET_ELEMENT[planet];
      if (planetEl) weights[planetEl] += 0.4;
      const sign = (pos as { sign?: string } | undefined)?.sign;
      if (sign) {
        const signEl = SIGN_ELEMENT[String(sign).toLowerCase()];
        if (signEl) weights[signEl] += 0.6;
      }
    }
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (sum <= 0) return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    (Object.keys(weights) as ElementKey[]).forEach((k) => {
      weights[k] = weights[k] / sum;
    });
    return weights;
  }, [planetaryPositions]);

  const dominantTransitElement = useMemo<ElementKey>(() => {
    return (Object.entries(resonance) as Array<[ElementKey, number]>).sort(
      (a, b) => b[1] - a[1],
    )[0][0];
  }, [resonance]);

  const derived = useMemo<DerivedIngredient[]>(() => {
    return Object.values(allIngredients).map((ing) => {
      const props = ing.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };
      const dom = dominantElement(props);
      // Personalization score: dot product with current resonance weights.
      const score =
        (Number(props.Fire) || 0) * resonance.Fire +
        (Number(props.Water) || 0) * resonance.Water +
        (Number(props.Earth) || 0) * resonance.Earth +
        (Number(props.Air) || 0) * resonance.Air;
      return {
        ingredient: ing,
        dominant: dom,
        asin: resolveAsin(ing.name || ""),
        score,
        seasons: seasonsOf(ing),
      };
    });
  }, [resonance]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cat = CATEGORY_CHOICES.find((c) => c.id === category) ?? CATEGORY_CHOICES[0];
    return derived
      .filter(({ ingredient, dominant, asin, seasons: s }) => {
        if (!cat.match(ingredient)) return false;
        if (element !== "all" && dominant !== element) return false;
        if (season !== "all" && !s.includes(season)) return false;
        if (verifiedOnly && !asin) return false;
        if (q) {
          const hay = `${ingredient.name} ${ingredient.category} ${
            ingredient.description || ""
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [derived, search, category, element, season, verifiedOnly]);

  const verifiedCount = derived.filter((d) => d.asin).length;
  const visibleCount = filtered.length;

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      {/* Ambient gradient field */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[36rem] h-[36rem] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 pb-24">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-200 text-xs font-semibold mb-5">
            <span>⚗️</span> Shop the Alchemical Pantry
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight pb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-emerald-300">
            Source by Element
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/60 max-w-2xl leading-relaxed">
            Every ingredient in the Alchm.kitchen library, ranked by resonance
            with the current sky. Click through to Amazon — your affiliate
            cookie travels with you.
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="Ingredients" value={Object.keys(allIngredients).length} accent="purple" />
            <StatTile label="Visible" value={visibleCount} accent="amber" />
            <StatTile label="Amazon Verified" value={verifiedCount} accent="emerald" />
            <StatTile
              label="Transit Element"
              value={`${ELEMENT_META[dominantTransitElement].icon} ${dominantTransitElement}`}
              accent="purple"
              loading={alchemyLoading}
            />
          </div>
        </motion.header>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-[#0c0c14]/70 backdrop-blur-xl p-5 md:p-6 shadow-2xl shadow-purple-900/10 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="flex-1 relative">
              <span className="sr-only">Search ingredients</span>
              <input
                type="search"
                placeholder="Search the pantry — saffron, miso, juniper…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/40 transition"
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                🔍
              </span>
            </label>
            <label className="inline-flex items-center gap-2 select-none cursor-pointer text-sm text-white/70">
              <input
                type="checkbox"
                className="accent-emerald-500 w-4 h-4"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              Amazon Verified only
            </label>
          </div>

          <div className="mt-5 space-y-4">
            <FilterRow label="Category">
              {CATEGORY_CHOICES.map((c) => (
                <Pill
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  <span className="mr-1.5">{c.icon}</span>
                  {c.label}
                </Pill>
              ))}
            </FilterRow>

            <FilterRow label="Element">
              <Pill active={element === "all"} onClick={() => setElement("all")}>
                ✨ All
              </Pill>
              {(Object.keys(ELEMENT_META) as ElementKey[]).map((el) => (
                <Pill
                  key={el}
                  active={element === el}
                  onClick={() => setElement(el)}
                >
                  <span className="mr-1.5">{ELEMENT_META[el].icon}</span>
                  {el}
                </Pill>
              ))}
            </FilterRow>

            <FilterRow label="Season">
              {SEASON_CHOICES.map((s) => (
                <Pill key={s} active={season === s} onClick={() => setSeason(s)}>
                  {s === "all" ? "🗓️ Any" : s.charAt(0).toUpperCase() + s.slice(1)}
                </Pill>
              ))}
            </FilterRow>
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
            <div className="text-5xl mb-4">🥄</div>
            <p className="text-lg font-semibold text-white/80">Nothing matches that combination</p>
            <p className="text-sm text-white/50 mt-1">
              Loosen a filter or try a different element.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.slice(0, 96).map((d) => (
                <IngredientCard
                  key={d.ingredient.id ?? d.ingredient.name}
                  data={d}
                  expanded={activeName === d.ingredient.name}
                  onToggle={() =>
                    setActiveName((prev) =>
                      prev === d.ingredient.name ? null : d.ingredient.name,
                    )
                  }
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filtered.length > 96 && (
          <p className="mt-6 text-center text-sm text-white/40">
            Showing the top 96 of {filtered.length} matches — narrow filters to refine.
          </p>
        )}

        <div className="mt-12 text-center text-xs text-white/30">
          Amazon links use our affiliate tag — using them supports the project at no cost to you.{" "}
          <Link href="/pantry" className="text-emerald-300/70 hover:text-emerald-200 underline">
            Visit your pantry →
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ----------------------------- Subcomponents ----------------------------- */

const TAG_TONES: Record<string, string> = {
  amber: "bg-amber-500/10 text-amber-100 border-amber-400/20",
  rose: "bg-rose-500/10 text-rose-100 border-rose-400/20",
  emerald: "bg-emerald-500/10 text-emerald-100 border-emerald-400/20",
  purple: "bg-purple-500/10 text-purple-100 border-purple-400/20",
};

function Tag({
  tone,
  children,
}: {
  tone: keyof typeof TAG_TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-md border capitalize ${TAG_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-white/45 mb-1.5 flex items-center gap-1.5">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function CulinarySection({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SectionLabel icon={icon} label={label} />
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-white/40 sm:w-20 shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
        active
          ? "bg-gradient-to-r from-purple-500/30 via-amber-500/20 to-emerald-500/30 border-amber-300/40 text-white shadow-md shadow-amber-500/10"
          : "border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-white/[0.02]"
      }`}
    >
      {children}
    </button>
  );
}

function StatTile({
  label,
  value,
  accent,
  loading,
}: {
  label: string;
  value: string | number;
  accent: "purple" | "amber" | "emerald";
  loading?: boolean;
}) {
  const accents: Record<string, string> = {
    purple: "from-purple-500/20 to-purple-700/10 border-purple-400/20",
    amber: "from-amber-500/20 to-orange-700/10 border-amber-400/20",
    emerald: "from-emerald-500/20 to-emerald-700/10 border-emerald-400/20",
  };
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${accents[accent]} backdrop-blur-sm p-4`}
    >
      <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">
        {loading ? <span className="opacity-50">…</span> : value}
      </div>
    </div>
  );
}

function IngredientCard({
  data,
  expanded,
  onToggle,
}: {
  data: DerivedIngredient;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { ingredient, dominant, asin, seasons } = data;
  const meta = ELEMENT_META[dominant];
  const culinary = getCulinaryDetails(ingredient);
  const normalized = normalizeForDisplay(
    ingredient.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    },
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl border border-white/10 bg-[#0c0c14]/70 backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-900/20"
    >
      {/* Subtle elemental side accent — present but quiet */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${meta.gradient} opacity-60`} />

      <button
        onClick={onToggle}
        className="w-full text-left p-4 focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white capitalize truncate">
                {ingredient.name}
              </h3>
              {asin && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11px] text-white/40 capitalize">
              {ingredient.category?.replace(/_/g, " ") || "ingredient"}
              {seasons.length > 0 && (
                <span className="ml-1.5 text-white/30">
                  · {seasons.slice(0, 2).join(" / ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Flavor tags lead the card */}
        {culinary.flavorTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {culinary.flavorTags.slice(0, 5).map((t, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-100 border border-amber-400/20 capitalize"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Cooking methods — second culinary signal */}
        {culinary.cookingMethods.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/55">
            <span className="text-white/30">👨‍🍳</span>
            <span className="capitalize truncate">
              {culinary.cookingMethods.slice(0, 4).join(" · ")}
            </span>
          </div>
        )}

        {/* Flavor notes — short culinary guidance */}
        {culinary.flavorNotes && (
          <p className="mt-2 text-xs text-white/55 line-clamp-2 leading-snug">
            {culinary.flavorNotes}
          </p>
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 space-y-4">
              {culinary.commonUses.length > 0 && (
                <CulinarySection icon="🍽️" label="Common Uses">
                  {culinary.commonUses.slice(0, 8).map((u, i) => (
                    <Tag key={i} tone="amber">
                      {u}
                    </Tag>
                  ))}
                </CulinarySection>
              )}

              {culinary.cuisines.length > 0 && (
                <CulinarySection icon="🌐" label="Cuisine Affinity">
                  {culinary.cuisines.slice(0, 6).map((c, i) => (
                    <Tag key={i} tone="rose">
                      {c}
                    </Tag>
                  ))}
                </CulinarySection>
              )}

              {culinary.pairings.length > 0 && (
                <CulinarySection icon="🤝" label="Pairs With">
                  {culinary.pairings.slice(0, 8).map((p, i) => (
                    <Tag key={i} tone="emerald">
                      {p}
                    </Tag>
                  ))}
                </CulinarySection>
              )}

              {culinary.prepTips.length > 0 && (
                <div>
                  <SectionLabel icon="📝" label="Preparation" />
                  <ul className="space-y-1">
                    {culinary.prepTips.slice(0, 4).map((tip, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-white/65 leading-snug flex gap-2"
                      >
                        <span className="text-white/30 shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Elemental snapshot — demoted to a compact secondary strip */}
              <details className="group/detail rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
                <summary className="cursor-pointer text-[10px] uppercase tracking-wider text-white/35 hover:text-white/60 transition flex items-center justify-between">
                  <span>Alchemical Signature</span>
                  <span className="group-open/detail:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {(Object.entries(normalized) as Array<[ElementKey, number]>)
                    .sort((a, b) => b[1] - a[1])
                    .map(([el, val]) => (
                      <div key={el} className="text-center">
                        <div className="text-xs">{ELEMENT_META[el].icon}</div>
                        <div className="text-[10px] text-white/40">
                          {(val * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                </div>
              </details>

              <AsinFeedback ingredientName={ingredient.name} hasAsin={Boolean(asin)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Amazon CTA */}
      <div className="border-t border-white/5 p-3">
        <a
          href={getAmazonLink(ingredient.name, asin)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`block w-full text-center text-sm font-semibold rounded-xl px-3 py-2.5 transition-all bg-gradient-to-r ${
            asin
              ? "from-amber-500 to-orange-500 text-black hover:brightness-110 shadow-md shadow-amber-500/20"
              : "from-white/10 to-white/5 text-white/80 hover:text-white border border-white/10"
          }`}
        >
          {asin ? "🛒 " : "🔎 "}
          {getAmazonButtonText(asin)}
        </a>
      </div>
    </motion.div>
  );
}

function AsinFeedback({
  ingredientName,
  hasAsin,
}: {
  ingredientName: string;
  hasAsin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [asin, setAsin] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (hasAsin && !open) {
    return null;
  }

  async function submit() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/amazon/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientName, asin: asin.trim().toUpperCase() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setStatus("ok");
      setMessage("Thanks — ASIN submitted for review.");
      setAsin("");
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Could not submit.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] text-purple-300/80 hover:text-purple-200 underline"
      >
        Suggest an ASIN for this ingredient
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-3 space-y-2">
      <div className="text-[11px] text-purple-200/80">
        Found a good Amazon match? Paste the 10-character ASIN.
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={asin}
          onChange={(e) => setAsin(e.target.value)}
          placeholder="B0XXXXXXXX"
          maxLength={10}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-400/40"
        />
        <button
          onClick={() => { void submit(); }}
          disabled={status === "saving" || asin.trim().length !== 10}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/30 border border-purple-400/40 text-white hover:bg-purple-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "saving" ? "…" : "Submit"}
        </button>
      </div>
      {message && (
        <div
          className={`text-[11px] ${
            status === "ok" ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
