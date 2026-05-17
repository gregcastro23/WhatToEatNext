"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { PremiumGate } from "@/components/PremiumGate";
import type { Variants } from "framer-motion";

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500/50" />
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

const CuisineRestaurantFinder = dynamic(
  () => import("@/components/RestaurantDiscovery/CuisineRestaurantFinder"),
  { loading: () => <SectionLoader /> },
);

const CuisineBrowseGrid = dynamic(
  () => import("@/components/RestaurantDiscovery/CuisineBrowseGrid"),
  { loading: () => <SectionLoader /> },
);

const LocalCuisineGroups = dynamic(
  () => import("@/components/RestaurantDiscovery/LocalCuisineGroups"),
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

export default function CuisinesPage() {
  return (
    <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <motion.div 
        className="max-w-4xl mx-auto space-y-8 pb-16"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.header variants={fadeInItem} className="mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span className="text-xl">✨</span> Premium Alchemical Feature
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 leading-tight pb-2">
            Cosmic Cuisines
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl leading-relaxed">
            Discover the culinary traditions that resonate most powerfully with the current astrological climate. Explore culturally authentic dishes and perfectly paired sauces aligned with the moment.
          </p>
        </motion.header>

        <motion.section variants={fadeInItem}>
          <CuisineBrowseGrid />
        </motion.section>

        <motion.section
          variants={fadeInItem}
        >
          <div className="glass-card-premium rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl shadow-purple-900/20 relative overflow-hidden bg-[#0c0c14]/80 backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />

            <div className="relative z-10">
              {/* Cuisine recommender is shown to everyone (also on the home page
                  as a marketing preview). The premium-only piece is the sauce
                  recommender below. */}
              <DynamicCuisineRecommender />
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeInItem}>
          <LocalCuisineGroups />
        </motion.section>

        <motion.section variants={fadeInItem}>
          <CuisineRestaurantFinder />
        </motion.section>

        <motion.section
          variants={fadeInItem}
          className="mt-12"
        >
          <div className="glass-card-premium rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl shadow-orange-900/20 relative overflow-hidden bg-[#0c0c14]/80 backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 w-full h-full bg-amber-600/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10">
              <PremiumGate feature="sauceRecommender" showPreview>
                <EnhancedSauceRecommender />
              </PremiumGate>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </main>
  );
}
