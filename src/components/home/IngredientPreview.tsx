"use client";

/**
 * Ingredient Preview — homepage teaser for the Alchemical Pantry.
 *
 * Replaces the previous category-switcher with a high-impact set of cards
 * keyed off the current planetary transit. The full discovery + Amazon
 * sourcing experience lives at /ingredients.
 */

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useMemo } from "react";
import { resolveAsin } from "@/data/amazon/ingredientAsins";
import { allIngredients } from "@/data/ingredients";
import { useAlchemical } from "@/hooks/useAlchemical";
import { getAmazonLink } from "@/lib/amazonUrl";
import type { Ingredient } from "@/types";

type ElementKey = "Fire" | "Water" | "Earth" | "Air";

const ELEMENT_META: Record<
  ElementKey,
  { icon: string; gradient: string; chip: string; glow: string }
> = {
  Fire: {
    icon: "🔥",
    gradient: "from-red-500 to-orange-500",
    chip: "bg-orange-500/15 text-orange-200 border-orange-400/30",
    glow: "shadow-orange-500/20",
  },
  Water: {
    icon: "💧",
    gradient: "from-blue-500 to-cyan-500",
    chip: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
    glow: "shadow-cyan-500/20",
  },
  Earth: {
    icon: "🌍",
    gradient: "from-emerald-500 to-green-600",
    chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    glow: "shadow-emerald-500/20",
  },
  Air: {
    icon: "💨",
    gradient: "from-indigo-500 to-purple-500",
    chip: "bg-purple-500/15 text-purple-200 border-purple-400/30",
    glow: "shadow-purple-500/20",
  },
};

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

function dominantElement(props?: Ingredient["elementalProperties"]): ElementKey {
  if (!props) return "Earth";
  return (Object.entries(props) as Array<[ElementKey, number]>)
    .filter(([k]) => k in ELEMENT_META)
    .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))[0]?.[0] ?? "Earth";
}

function asObj(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asStrArr(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean)
    : [];
}

interface CulinaryTeaser {
  flavorTags: string[];
  cookingMethods: string[];
  topUse?: string;
}

function getTeaserCulinary(ing: Ingredient): CulinaryTeaser {
  const root = ing as unknown as Record<string, unknown>;
  const profile = asObj(root.culinaryProfile);
  const apps = asObj(root.culinaryApplications);
  const flavorObj =
    asObj(profile?.flavorProfile) ?? asObj(root.flavorProfile);

  const flavorTags = (() => {
    if (flavorObj) {
      const merged = [
        ...asStrArr(flavorObj.primary),
        ...asStrArr(flavorObj.secondary),
      ];
      if (merged.length) return Array.from(new Set(merged));
      return Object.entries(flavorObj)
        .map(([k, v]) => [k, Number(v)] as const)
        .filter(([, v]) => Number.isFinite(v) && v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);
    }
    if (typeof root.flavorProfile === "string") {
      return root.flavorProfile
        .split(/[,;·]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }
    return [];
  })();

  const cookingMethods =
    asStrArr(profile?.cookingMethods).length > 0
      ? asStrArr(profile?.cookingMethods)
      : asStrArr(root.cookingMethods);

  const uses =
    asStrArr(apps?.commonUses).length > 0
      ? asStrArr(apps?.commonUses)
      : asStrArr(root.culinaryUses);

  return {
    flavorTags: flavorTags.slice(0, 3),
    cookingMethods: cookingMethods.slice(0, 3),
    topUse: uses[0],
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
};

export default function IngredientPreview() {
  const { planetaryPositions, isLoading } = useAlchemical();

  const transitElement = useMemo<ElementKey>(() => {
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
    const top = (Object.entries(weights) as Array<[ElementKey, number]>).sort(
      (a, b) => b[1] - a[1],
    )[0];
    return top?.[1] > 0 ? top[0] : "Fire";
  }, [planetaryPositions]);

  const trending = useMemo(() => {
    const all = Object.values(allIngredients);
    const matched = all
      .filter((i) => dominantElement(i.elementalProperties) === transitElement)
      .map((i) => ({
        ingredient: i,
        asin: resolveAsin(i.name || ""),
        intensity: Number(i.elementalProperties?.[transitElement]) || 0,
      }))
      .sort((a, b) => {
        // Prefer verified ASINs at the top, then intensity.
        if (Boolean(a.asin) !== Boolean(b.asin)) return a.asin ? -1 : 1;
        return b.intensity - a.intensity;
      });
    return matched.slice(0, 6);
  }, [transitElement]);

  const meta = ELEMENT_META[transitElement];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-wider text-white/60 mb-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            Live Transit
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-emerald-300">
            Ingredients for the {meta.icon} {transitElement} sky
          </h3>
          <p className="mt-1 text-sm text-white/60 max-w-xl">
            Curated from your alchemical pantry to match the dominant element of
            the current planetary positions.
          </p>
        </div>
        <Link
          href="/ingredients"
          className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 transition shadow-lg shadow-amber-500/20"
        >
          Explore Full Pantry
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={transitElement}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {isLoading && trending.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
                />
              ))
            : trending.map(({ ingredient, asin }) => {
                const dom = dominantElement(ingredient.elementalProperties);
                const m = ELEMENT_META[dom];
                const culinary = getTeaserCulinary(ingredient);
                return (
                  <motion.div
                    key={ingredient.id ?? ingredient.name}
                    variants={itemVariants}
                    whileHover={{ y: -3 }}
                    className={`relative rounded-2xl border border-white/10 bg-[#0c0c14]/70 backdrop-blur-xl overflow-hidden hover:border-white/20 transition shadow-lg ${m.glow}`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${m.gradient} opacity-60`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-base font-semibold text-white capitalize truncate">
                            {ingredient.name}
                          </h4>
                          <div className="mt-0.5 text-[11px] text-white/40 capitalize">
                            {ingredient.category?.replace(/_/g, " ")}
                          </div>
                        </div>
                        {asin && (
                          <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      {culinary.flavorTags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {culinary.flavorTags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-100 border border-amber-400/20 capitalize"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {(culinary.cookingMethods.length > 0 || culinary.topUse) && (
                        <div className="mt-2 space-y-0.5 text-[11px] text-white/55 leading-snug">
                          {culinary.cookingMethods.length > 0 && (
                            <div className="capitalize truncate">
                              <span className="text-white/30">👨‍🍳 </span>
                              {culinary.cookingMethods.join(" · ")}
                            </div>
                          )}
                          {culinary.topUse && (
                            <div className="capitalize truncate">
                              <span className="text-white/30">🍽️ </span>
                              {culinary.topUse}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <a
                          href={getAmazonLink(ingredient.name, asin)}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className={`flex-1 text-center text-xs font-semibold rounded-lg px-3 py-2 transition ${
                            asin
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-110"
                              : "bg-white/5 text-white/70 border border-white/10 hover:text-white"
                          }`}
                        >
                          {asin ? "🛒 Buy on Amazon" : "🔎 Find on Amazon"}
                        </a>
                        <span
                          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${m.chip}`}
                          title={`Resonates with ${dom}`}
                        >
                          {m.icon}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Link
          href="/ingredients"
          className="text-sm text-white/50 hover:text-white/80 underline underline-offset-4"
        >
          See all {Object.keys(allIngredients).length} ingredients in the pantry →
        </Link>
      </motion.div>
    </div>
  );
}
