"use client";

import { Suspense } from "react";
import { motion, Variants } from "framer-motion";
import DynamicCuisineRecommender from "@/components/home/DynamicCuisineRecommender";
import { HeroSection } from "@/components/home/HeroSection";
import EnhancedCookingMethodRecommender from "@/components/recommendations/EnhancedCookingMethodRecommender";
import EnhancedIngredientRecommender from "@/components/recommendations/EnhancedIngredientRecommender";
import EnhancedSauceRecommender from "@/components/recommendations/EnhancedSauceRecommender";

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-slate-400">Loading...</div>
    </div>
  );
}

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
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <motion.div 
        className="max-w-4xl mx-auto space-y-8"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInItem}>
          <Suspense fallback={<SectionLoader />}>
            <HeroSection />
          </Suspense>
        </motion.div>

        <motion.section 
          id="cuisines" 
          variants={fadeInItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Suspense fallback={<SectionLoader />}>
            <div className="min-h-[400px]">
              <DynamicCuisineRecommender />
            </div>
          </Suspense>
          <div className="mt-8">
            <Suspense fallback={<SectionLoader />}>
              <EnhancedSauceRecommender />
            </Suspense>
          </div>
        </motion.section>

        <motion.section 
          id="ingredients"
          variants={fadeInItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Suspense fallback={<SectionLoader />}>
            <EnhancedIngredientRecommender />
          </Suspense>
        </motion.section>

        <motion.div 
          variants={fadeInItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Suspense fallback={<SectionLoader />}>
            <EnhancedCookingMethodRecommender />
          </Suspense>
        </motion.div>
      </motion.div>
    </main>
  );
}
