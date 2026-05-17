"use client";

/**
 * CuisineBrowseGrid — clickable card grid for the 14 primary cuisines.
 *
 * Each card surfaces the cuisine's dominant element and links to the
 * cuisine deep page at /cuisines/[slug].
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { CUISINES_METADATA } from "@/data/cuisines/index";
import { cuisineToSlug } from "@/utils/cuisineSlug";
import type { Variants } from "framer-motion";

type ElementName = "Fire" | "Water" | "Earth" | "Air";

interface ElementMeta {
  emoji: string;
  label: ElementName;
  ring: string;
  glow: string;
  chip: string;
}

const ELEMENT_META: Record<ElementName, ElementMeta> = {
  Fire: {
    emoji: "🔥",
    label: "Fire",
    ring: "border-rose-400/30 hover:border-rose-300/60",
    glow: "from-rose-500/20 to-orange-500/10",
    chip: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  },
  Water: {
    emoji: "💧",
    label: "Water",
    ring: "border-blue-400/30 hover:border-blue-300/60",
    glow: "from-blue-500/20 to-cyan-500/10",
    chip: "bg-blue-500/15 text-blue-200 border-blue-400/30",
  },
  Earth: {
    emoji: "🌿",
    label: "Earth",
    ring: "border-emerald-400/30 hover:border-emerald-300/60",
    glow: "from-emerald-500/20 to-lime-500/10",
    chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  },
  Air: {
    emoji: "💨",
    label: "Air",
    ring: "border-sky-400/30 hover:border-sky-300/60",
    glow: "from-sky-500/20 to-indigo-500/10",
    chip: "bg-sky-500/15 text-sky-200 border-sky-400/30",
  },
};

function dominantElement(props: Partial<Record<ElementName, number>> | undefined): ElementName {
  if (!props) return "Earth";
  let max: ElementName = "Earth";
  let maxValue = -Infinity;
  (Object.keys(ELEMENT_META) as ElementName[]).forEach((el) => {
    const v = props[el] ?? 0;
    if (v > maxValue) {
      maxValue = v;
      max = el;
    }
  });
  return max;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const cardVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 18 } },
};

export function CuisineBrowseGrid() {
  const entries = Object.entries(CUISINES_METADATA);

  return (
    <section aria-label="Browse cuisines" className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Browse Cuisines
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Explore the elemental signature of each tradition.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300/60">
          {entries.length} cuisines
        </span>
      </div>

      <motion.ul
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {entries.map(([key, meta]) => {
          const displayName = meta.name ?? key;
          const slug = cuisineToSlug(displayName);
          const element = dominantElement(meta.elementalProperties);
          const decoration = ELEMENT_META[element];

          return (
            <motion.li key={key} variants={cardVariants}>
              <Link
                href={`/cuisines/${slug}`}
                className={`group relative block overflow-hidden rounded-2xl border bg-black/40 p-4 backdrop-blur-sm transition-all hover:bg-black/60 ${decoration.ring}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100 ${decoration.glow}`}
                  aria-hidden
                />
                <div className="relative z-10">
                  <div className="text-2xl mb-2" aria-hidden>
                    {decoration.emoji}
                  </div>
                  <div className="text-sm font-extrabold text-white leading-tight">
                    {displayName}
                  </div>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${decoration.chip}`}
                  >
                    {decoration.label}
                  </span>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}

export default CuisineBrowseGrid;
