"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import type { Variants } from "framer-motion";

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-white/60">Loading...</div>
    </div>
  );
}

const EnhancedIngredientRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedIngredientRecommender"),
  { loading: () => <SectionLoader /> },
);

const EnhancedCookingMethodRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedCookingMethodRecommender"),
  { loading: () => <SectionLoader /> },
);

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeInItem: Variants = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <motion.div 
        className="max-w-4xl mx-auto space-y-8"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInItem}>
          <HeroSection />
        </motion.div>

        {/* Premium Cuisines Feature CTA */}
        <motion.section 
          variants={fadeInItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="my-10"
        >
          <Link href="/cuisines" className="block group">
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0c0c14]/80 p-8 md:p-10 shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:border-purple-400/50 backdrop-blur-xl group-hover:scale-[1.02]">
              {/* Background glows */}
              <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px] transition-all duration-700 group-hover:bg-purple-500/30" />
              <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-rose-600/20 blur-[80px] transition-all duration-700 group-hover:bg-rose-500/30" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold mb-4 uppercase tracking-wider">
                    <span aria-hidden>✨</span> Premium Feature
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 mb-3">
                    Explore Cosmic Cuisines
                  </h2>
                  <p className="text-white/60 text-base md:text-lg max-w-lg leading-relaxed">
                    Discover culinary traditions and perfect sauces dynamically ranked by their resonance with the current astrological moment.
                  </p>
                </div>
                
                <div className="shrink-0">
                  <div className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-sm font-bold text-white shadow-lg transition-all duration-300 group-hover:from-purple-500 group-hover:to-pink-500 group-hover:shadow-purple-500/25">
                    Launch Recommender →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

        <motion.section
          id="ingredients"
          variants={fadeInItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mx-6 mb-3 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Tap{" "}
              <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-semibold px-2 py-0.5 rounded">
                + Pantry
              </span>{" "}
              on any card to track it in your kitchen.
            </p>
            <Link
              href="/pantry"
              className="text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline"
            >
              View my pantry →
            </Link>
          </div>
          <EnhancedIngredientRecommender />
        </motion.section>

        <motion.div 
          variants={fadeInItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <EnhancedCookingMethodRecommender />
        </motion.div>
      </motion.div>
    </main>
  );
}
