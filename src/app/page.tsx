"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AmazonFreshPromotion } from "@/components/home/AmazonFreshPromotion";
import { AgentsFeedThread } from "@/components/home/AgentsFeedThread";
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

const DynamicCuisineRecommender = dynamic(
  () => import("@/components/home/DynamicCuisineRecommender"),
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

        <motion.div variants={fadeInItem}>
          <AmazonFreshPromotion />
        </motion.div>

        <motion.section variants={fadeInItem} className="my-8">
          <div className="glass-card-premium rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl shadow-purple-900/20 relative overflow-hidden bg-[#0c0c14]/80 backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />
            
            <div className="relative z-10">
              <DynamicCuisineRecommender />
            </div>
          </div>
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
      <AgentsFeedThread />
    </main>
  );
}
