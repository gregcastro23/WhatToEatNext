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

const DynamicCuisineRecommender = dynamic(
  () => import("@/components/home/DynamicCuisineRecommender"),
  { loading: () => <SectionLoader /> },
);

const EnhancedSauceRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedSauceRecommender"),
  { loading: () => <SectionLoader /> },
);

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

        <motion.section 
          id="cuisines" 
          variants={fadeInItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="min-h-[400px]">
            <DynamicCuisineRecommender />
          </div>
          <div className="mt-8">
            <EnhancedSauceRecommender />
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
            <p className="text-sm text-gray-600">
              Tap{" "}
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
                + Pantry
              </span>{" "}
              on any card to track it in your kitchen.
            </p>
            <Link
              href="/pantry"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-900 underline"
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
