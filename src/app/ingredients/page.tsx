"use client";

/**
 * Alchemical Pantry — dedicated ingredient discovery & Amazon sourcing page.
 *
 * Pulls from the static `allIngredients` collection, maps each item through the
 * Amazon Fresh NYC resolver, and enriches visible results with live ASIN lookup
 * when catalog credentials are available.
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeDollarSign,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ImageIcon,
  Loader2,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Shuffle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AMAZON_FRESH_CATEGORIES,
  CHAKRA_ALIGNMENTS,
  getAmazonFreshAlternateSearchString,
  getAmazonFreshMapping,
  normalizeAmazonIngredientKey,
} from "@/data/amazon";
import type { AmazonFreshIngredientMapping } from "@/data/amazon";
import { resolveAsin } from "@/data/amazon/ingredientAsins";
import { allIngredients } from "@/data/ingredients";
import { useAlchemical } from "@/hooks/useAlchemical";
import { usePantry } from "@/hooks/usePantry";
import { preflightAndSubmitAmazonCart } from "@/lib/amazonCartHandoff";
import { getAmazonLink, getAmazonButtonText } from "@/lib/amazonUrl";
import type { Ingredient } from "@/types";
import type {
  AmazonMatchConfidence,
  AmazonSearchResult,
} from "@/types/amazon";
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
const AMAZON_CATEGORY_CHOICES = ["all", ...AMAZON_FRESH_CATEGORIES] as const;
const CHAKRA_CHOICES = ["all", ...CHAKRA_ALIGNMENTS] as const;

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
  asinSource?: AmazonSearchResult["source"];
  amazon: AmazonFreshIngredientMapping;
  lookup?: AmazonSearchResult;
  score: number;
  seasons: string[];
  lookupPending: boolean;
}

export default function IngredientsPage() {
  const { planetaryPositions, isLoading: alchemyLoading } = useAlchemical();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [amazonCategory, setAmazonCategory] =
    useState<(typeof AMAZON_CATEGORY_CHOICES)[number]>("all");
  const [chakra, setChakra] =
    useState<(typeof CHAKRA_CHOICES)[number]>("all");
  const [element, setElement] = useState<"all" | ElementKey>("all");
  const [season, setSeason] = useState<(typeof SEASON_CHOICES)[number]>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeName, setActiveName] = useState<string | null>(null);
  const [amazonLookups, setAmazonLookups] = useState<Record<string, AmazonSearchResult>>({});
  const [lookupStatus, setLookupStatus] =
    useState<"idle" | "loading" | "rate_limited" | "error">("idle");
  const requestedLookups = useRef<Set<string>>(new Set());

  const { hasItem, addItem, removeItem, items } = usePantry();

  const pantryToggle = useCallback(
    (ing: Ingredient) => {
      const existing = items.find(
        (i) => i.name.toLowerCase() === ing.name.toLowerCase(),
      );
      if (existing) {
        removeItem(existing.id);
      } else {
        addItem({
          name: ing.name,
          quantity: 1,
          unit: "unit",
          category: ing.category || "other",
        });
      }
    },
    [items, addItem, removeItem],
  );

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
      const lookupKey = normalizeAmazonIngredientKey(ing.name || "");
      const staticAsin = resolveAsin(ing.name || "");
      const liveLookup = amazonLookups[lookupKey];
      const asin = staticAsin ?? liveLookup?.asin ?? null;
      const amazon = getAmazonFreshMapping(ing, asin);
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
        asin,
        asinSource: staticAsin ? "verified_static_asin_map" : liveLookup?.source,
        amazon,
        lookup: liveLookup,
        score,
        seasons: seasonsOf(ing),
        lookupPending: lookupStatus === "loading" && !staticAsin && !liveLookup,
      };
    });
  }, [amazonLookups, lookupStatus, resonance]);

  const filteredCandidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cat = CATEGORY_CHOICES.find((c) => c.id === category) ?? CATEGORY_CHOICES[0];
    return derived
      .filter(({ ingredient, dominant, amazon, seasons: s }) => {
        if (!cat.match(ingredient)) return false;
        if (amazonCategory !== "all" && amazon.categoryNode !== amazonCategory) return false;
        if (chakra !== "all" && amazon.chakraAlignment !== chakra) return false;
        if (element !== "all" && dominant !== element) return false;
        if (season !== "all" && !s.includes(season)) return false;
        if (q) {
          const hay = `${ingredient.name} ${ingredient.category} ${
            ingredient.description || ""
          } ${amazon.optimizedSearchString} ${amazon.primaryBrand} ${
            amazon.categoryNode
          } ${amazon.chakraAlignment
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (Boolean(a.asin) !== Boolean(b.asin)) return a.asin ? -1 : 1;
        return b.score - a.score;
      });
  }, [amazonCategory, chakra, derived, search, category, element, season]);

  useEffect(() => {
    const candidates = filteredCandidates
      .slice(0, 96)
      .filter((d) => !d.asin)
      .map((d) => d.ingredient.name)
      .filter(Boolean)
      .filter((name) => {
        const key = normalizeAmazonIngredientKey(name);
        return !amazonLookups[key] && !requestedLookups.current.has(key);
      })
      .slice(0, 50);

    if (candidates.length === 0) return;

    let cancelled = false;
    candidates.forEach((name) => requestedLookups.current.add(normalizeAmazonIngredientKey(name)));
    setLookupStatus("loading");

    fetch("/api/amazon/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: candidates }),
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as {
          results?: AmazonSearchResult[];
        };
        if (!res.ok) {
          if (res.status === 503) setLookupStatus("rate_limited");
          else setLookupStatus("error");
          return;
        }
        if (cancelled || !Array.isArray(body.results)) return;
        setAmazonLookups((prev) => {
          const next = { ...prev };
          body.results?.forEach((result) => {
            next[normalizeAmazonIngredientKey(result.ingredient)] = result;
          });
          return next;
        });
        setLookupStatus("idle");
      })
      .catch(() => {
        if (!cancelled) setLookupStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [amazonLookups, filteredCandidates]);

  const filtered = useMemo(() => {
    return verifiedOnly
      ? filteredCandidates.filter(({ asin }) => Boolean(asin))
      : filteredCandidates;
  }, [filteredCandidates, verifiedOnly]);

  const verifiedCount = derived.filter((d) => d.asin).length;
  const optimizedCount = derived.length;
  const visibleCount = filtered.length;
  const visibleCards = useMemo(() => filtered.slice(0, 96), [filtered]);
  const cartReadyItems = useMemo(
    () =>
      visibleCards
        .filter((d): d is DerivedIngredient & { asin: string } => Boolean(d.asin))
        .map((d) => ({
          asin: d.asin,
          name: d.ingredient.name,
          price: d.lookup?.price,
          chakra: d.amazon.chakraAlignment,
          category: d.amazon.categoryNode,
        })),
    [visibleCards],
  );
  const pricedCartItems = useMemo(
    () =>
      cartReadyItems
        .map((item) => parseAmazonPrice(item.price))
        .filter((price): price is number => price !== null),
    [cartReadyItems],
  );
  const estimatedCartTotal = pricedCartItems.reduce((sum, price) => sum + price, 0);

  const sendVisibleToFreshCart = useCallback(() => {
    void preflightAndSubmitAmazonCart({
      source: "ingredients_storefront",
      items: cartReadyItems.map((item) => ({
        asin: item.asin,
        qty: 1,
        name: item.name,
        chakra: item.chakra,
        category: item.category,
        price: item.price,
      })),
      metadata: {
        visibleCount,
        filteredCount: filtered.length,
        estimatedCartTotal,
      },
    }).catch((error) => {
      console.error("[ingredients] Fresh cart preflight failed:", error);
    });
  }, [cartReadyItems, estimatedCartTotal, filtered.length, visibleCount]);

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      {/* Quiet texture field */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12101d] via-[#08080e] to-[#07110d]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10 pb-44">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-5">
            <MapPin className="h-3.5 w-3.5" /> NYC 10001 Amazon Fresh Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight pb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-emerald-300">
            Source by Fresh Aisle
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/60 max-w-2xl leading-relaxed">
            Ingredient discovery now translates elemental and chakra intent into
            Amazon Fresh and Whole Foods search strings tuned for New York
            fulfillment, regional brands, and grocery category routing.
          </p>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatTile label="Ingredients" value={Object.keys(allIngredients).length} accent="purple" />
            <StatTile label="Visible" value={visibleCount} accent="amber" />
            <StatTile label="Fresh Optimized" value={optimizedCount} accent="emerald" />
            <StatTile
              label="Verified ASINs"
              value={lookupStatus === "loading" ? `${verifiedCount}+` : verifiedCount}
              accent="emerald"
            />
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
                placeholder="Search ingredient, brand, Fresh aisle, chakra..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/40 transition"
              />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </label>
            <label className="inline-flex items-center gap-2 select-none cursor-pointer text-sm text-white/70">
              <input
                type="checkbox"
                className="accent-emerald-500 w-4 h-4"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              Verified ASIN only
            </label>
          </div>
          {lookupStatus !== "idle" && (
            <div className="mt-3 text-xs text-white/45">
              {lookupStatus === "loading" && "Resolving visible ingredients against the Amazon catalog..."}
              {lookupStatus === "rate_limited" && "Amazon catalog lookup is rate-limited. Optimized Fresh links remain available."}
              {lookupStatus === "error" && "Amazon catalog lookup failed. Optimized Fresh links remain available."}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <FilterRow label="Type">
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

            <FilterRow label="Aisle">
              {AMAZON_CATEGORY_CHOICES.map((c) => (
                <Pill
                  key={c}
                  active={amazonCategory === c}
                  onClick={() => setAmazonCategory(c)}
                >
                  {c === "all" ? "All Fresh" : c}
                </Pill>
              ))}
            </FilterRow>

            <FilterRow label="Chakra">
              {CHAKRA_CHOICES.map((c) => (
                <Pill
                  key={c}
                  active={chakra === c}
                  onClick={() => setChakra(c)}
                >
                  {c === "all" ? "All Chakras" : c.replace("/", " / ")}
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
          <Suspense fallback={<IngredientGridSkeleton />}>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {visibleCards.map((d, index) => (
                  <IngredientCard
                    key={`${d.ingredient.id ?? d.ingredient.name}-${index}`}
                    data={d}
                    expanded={activeName === d.ingredient.name}
                    onToggle={() =>
                      setActiveName((prev) =>
                        prev === d.ingredient.name ? null : d.ingredient.name,
                      )
                    }
                    inPantry={hasItem(d.ingredient.name)}
                    onPantryToggle={() => pantryToggle(d.ingredient)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </Suspense>
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
      <ChakraCartBar
        itemCount={cartReadyItems.length}
        pricedCount={pricedCartItems.length}
        estimatedTotal={estimatedCartTotal}
        loading={lookupStatus === "loading"}
        onCheckout={sendVisibleToFreshCart}
      />
    </main>
  );
}

function parseAmazonPrice(price?: string | number): number | null {
  if (typeof price === "number") return Number.isFinite(price) ? price : null;
  if (!price) return null;
  const match = price.replace(/,/g, "").match(/\d+(\.\d{1,2})?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getCardAmazonState(data: DerivedIngredient): {
  brand: string;
  searchString: string;
  substituted: boolean;
  substitutedBrand?: string;
  confidence: AmazonMatchConfidence;
  productTitle?: string;
  productImageUrl?: string;
  price?: string | number;
  inStock?: boolean;
} {
  const fallbackBrand = data.amazon.alternateBrands?.[0];
  const suggestFallbackBrand = Boolean(data.lookup && !data.asin && fallbackBrand);
  const substitutedBrand =
    data.lookup?.substitutedBrand ??
    (suggestFallbackBrand ? fallbackBrand : undefined);
  const searchString =
    data.lookup?.amazonOptimizedSearchString ??
    (substitutedBrand
      ? getAmazonFreshAlternateSearchString(data.amazon, substitutedBrand)
      : data.amazon.optimizedSearchString);

  return {
    brand: substitutedBrand ?? data.lookup?.primaryBrandSelected ?? data.amazon.primaryBrand,
    searchString,
    substituted: Boolean(data.lookup?.substituted || suggestFallbackBrand),
    substitutedBrand,
    confidence:
      data.asinSource === "verified_static_asin_map"
        ? "high"
        : data.lookup?.matchConfidence ?? "low",
    productTitle: data.lookup?.title,
    productImageUrl: data.lookup?.imageUrl,
    price: data.lookup?.price,
    inStock: data.lookup?.inStock,
  };
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

function IngredientGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/10 bg-[#0c0c14]/70 overflow-hidden"
        >
          <div className="aspect-[4/3] bg-white/[0.04] animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-2/3 rounded bg-white/[0.07] animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-white/[0.05] animate-pulse" />
            <div className="h-9 rounded-lg bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChakraCartBar({
  itemCount,
  pricedCount,
  estimatedTotal,
  loading,
  onCheckout,
}: {
  itemCount: number;
  pricedCount: number;
  estimatedTotal: number;
  loading: boolean;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#07070c]/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              1-Click Chakra Cart
            </div>
            <div className="text-xs text-white/45">
              {itemCount} visible ASIN{itemCount === 1 ? "" : "s"} ready
              {pricedCount > 0
                ? ` · ${pricedCount} priced`
                : " · pricing resolves from PA-API"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="min-w-32 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/35">
              Estimated Total
            </div>
            <div className="text-lg font-bold text-emerald-100">
              {pricedCount > 0 ? formatCurrency(estimatedTotal) : "Pending"}
            </div>
          </div>
          <button
            type="button"
            disabled={itemCount === 0}
            onClick={onCheckout}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart className="h-4 w-4" />
            Send {itemCount} item{itemCount === 1 ? "" : "s"} to Fresh Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfidenceBadge({
  confidence,
  pending,
}: {
  confidence: AmazonMatchConfidence;
  pending: boolean;
}) {
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
        <Loader2 className="h-3 w-3 animate-spin" />
        Resolving
      </span>
    );
  }

  const label =
    confidence === "high"
      ? "High Match"
      : confidence === "medium"
        ? "Medium Match"
        : "Fresh Search";
  const tone =
    confidence === "high"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : confidence === "medium"
        ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-100"
        : "border-amber-400/25 bg-amber-500/10 text-amber-100";
  const Icon =
    confidence === "high"
      ? ShieldCheck
      : confidence === "medium"
        ? PackageCheck
        : ExternalLink;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function IngredientCard({
  data,
  expanded,
  onToggle,
  inPantry,
  onPantryToggle,
}: {
  data: DerivedIngredient;
  expanded: boolean;
  onToggle: () => void;
  inPantry: boolean;
  onPantryToggle: () => void;
}) {
  const { ingredient, dominant, asin, asinSource, amazon, seasons } = data;
  const meta = ELEMENT_META[dominant];
  const culinary = getCulinaryDetails(ingredient);
  const cardAmazon = getCardAmazonState(data);
  const cardPrice = parseAmazonPrice(cardAmazon.price);
  let ingredientImageUrl =
    typeof (ingredient as { image_url?: unknown }).image_url === "string"
      ? (ingredient as { image_url: string }).image_url
      : typeof (ingredient as { imageUrl?: unknown }).imageUrl === "string"
        ? (ingredient as { imageUrl: string }).imageUrl
        : undefined;
        
  if (typeof ingredientImageUrl === "string" && ingredientImageUrl.startsWith("ingredients/")) {
    ingredientImageUrl = `https://alchm.kitchen/${ingredientImageUrl}`;
  }
  const displayImageUrl = ingredientImageUrl || cardAmazon.productImageUrl;
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
      className="group relative rounded-2xl border border-white/10 bg-[#0c0c14]/75 backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-900/20"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${meta.gradient} opacity-60`} />

      <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),rgba(255,255,255,0.02)_48%,rgba(0,0,0,0.22))]">
        {displayImageUrl ? (
          <Image
            src={displayImageUrl}
            alt={cardAmazon.productTitle ?? ingredient.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={`transition-transform duration-500 group-hover:scale-105 ${
              ingredientImageUrl ? "object-cover" : "object-contain p-5"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white/90 shadow-lg shadow-black/20`}
            >
              <ImageIcon className="h-9 w-9" />
            </div>
          </div>
        )}
        {data.lookupPending && (
          <div className="absolute inset-0 bg-white/[0.03]">
            <div className="absolute inset-x-6 bottom-6 h-3 rounded bg-white/[0.08] animate-pulse" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <ConfidenceBadge
            confidence={cardAmazon.confidence}
            pending={data.lookupPending}
          />
          {cardAmazon.substituted && (
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-300/25 bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-100">
              <Shuffle className="h-3 w-3" />
              Substituted
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="min-h-[8.5rem]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white capitalize line-clamp-1">
                {ingredient.name}
              </h3>
              <div className="mt-1 text-[11px] text-white/40">
                {amazon.categoryNode}
                <span className="mx-1 text-white/25">/</span>
                {cardAmazon.brand}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/15 bg-emerald-500/10 px-2 py-1 text-sm font-bold text-emerald-100">
                <BadgeDollarSign className="h-3.5 w-3.5" />
                {cardPrice !== null
                  ? formatCurrency(cardPrice)
                  : data.lookupPending
                    ? "..."
                    : "Fresh"}
              </div>
            </div>
          </div>

          <p className="mt-2 min-h-10 text-sm leading-snug text-white/68 line-clamp-2">
            {cardAmazon.productTitle ?? culinary.flavorNotes ?? cardAmazon.searchString}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {asin && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Cart ASIN
              </span>
            )}
            {cardAmazon.inStock === false && (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                Offer unavailable
              </span>
            )}
            {seasons.slice(0, 2).map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] capitalize text-white/45"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {culinary.flavorTags.length > 0 && (
          <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
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

        <div className="mt-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/35">
              Amazon Fresh Query
            </span>
            <span className="text-[10px] text-purple-200/70">
              {amazon.chakraAlignment}
            </span>
          </div>
          <div className="mt-1 min-h-4 text-xs text-white/70 line-clamp-1">
            {cardAmazon.searchString}
          </div>
          {cardAmazon.substitutedBrand && (
            <div className="mt-1 text-[10px] text-purple-200/70">
              Showing alternate brand: {cardAmazon.substitutedBrand}
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={onPantryToggle}
            className={`min-h-10 rounded-xl border px-3 text-xs font-bold transition-all ${
              inPantry
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400/30"
                : "bg-white/5 text-white/55 border-white/10 hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-400/30"
            }`}
            title={inPantry ? "Remove from pantry" : "Add to pantry"}
          >
            {inPantry ? "In Pantry" : "Add Pantry"}
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="min-h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/65 transition hover:border-white/25 hover:text-white"
          >
            Details
          </button>
        </div>

        <a
          href={getAmazonLink(cardAmazon.searchString, asin, {
            searchIndex: "amazonfresh",
          })}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all bg-gradient-to-r ${
            asin
              ? "from-amber-500 to-orange-500 text-black hover:brightness-110 shadow-md shadow-amber-500/20"
              : "from-white/10 to-white/5 text-white/80 hover:text-white border border-white/10"
          }`}
        >
          {asin ? <ShoppingCart className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          {getAmazonButtonText(asin)}
        </a>
      </div>

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
              {culinary.cookingMethods.length > 0 && (
                <CulinarySection icon="Method" label="Cooking Methods">
                  {culinary.cookingMethods.slice(0, 6).map((method, i) => (
                    <Tag key={i} tone="purple">
                      {method}
                    </Tag>
                  ))}
                </CulinarySection>
              )}

              {culinary.commonUses.length > 0 && (
                <CulinarySection icon="Use" label="Common Uses">
                  {culinary.commonUses.slice(0, 8).map((u, i) => (
                    <Tag key={i} tone="amber">
                      {u}
                    </Tag>
                  ))}
                </CulinarySection>
              )}

              {culinary.cuisines.length > 0 && (
                <CulinarySection icon="Cuisine" label="Cuisine Affinity">
                  {culinary.cuisines.slice(0, 6).map((c, i) => (
                    <Tag key={i} tone="rose">
                      {c}
                    </Tag>
                  ))}
                </CulinarySection>
              )}

              {culinary.pairings.length > 0 && (
                <CulinarySection icon="Pairs" label="Pairs With">
                  {culinary.pairings.slice(0, 8).map((p, i) => (
                    <Tag key={i} tone="emerald">
                      {p}
                    </Tag>
                  ))}
                </CulinarySection>
              )}

              {culinary.prepTips.length > 0 && (
                <div>
                  <SectionLabel icon="Prep" label="Preparation" />
                  <ul className="space-y-1">
                    {culinary.prepTips.slice(0, 4).map((tip, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-white/65 leading-snug flex gap-2"
                      >
                        <span className="text-white/30 shrink-0">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-400/10 px-3 py-3">
                <SectionLabel icon="Fresh" label="Fulfillment Mapping" />
                <dl className="grid grid-cols-1 gap-2 text-[12px]">
                  <div>
                    <dt className="text-white/35">Category node</dt>
                    <dd className="text-white/70">{amazon.categoryNode}</dd>
                  </div>
                  <div>
                    <dt className="text-white/35">Selected brand</dt>
                    <dd className="text-white/70">{cardAmazon.brand}</dd>
                  </div>
                  <div>
                    <dt className="text-white/35">Fulfillment signal</dt>
                    <dd className="text-white/70">{amazon.fulfillmentSignal}</dd>
                  </div>
                  {asinSource && (
                    <div>
                      <dt className="text-white/35">Catalog source</dt>
                      <dd className="text-white/70">{asinSource.replace(/_/g, " ")}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-2 text-[11px] leading-snug text-white/45">
                  {amazon.rationale}
                </p>
              </div>

              <details className="group/detail rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
                <summary className="cursor-pointer text-[10px] uppercase tracking-wider text-white/35 hover:text-white/60 transition flex items-center justify-between">
                  <span>Alchemical Signature</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open/detail:rotate-180" />
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
