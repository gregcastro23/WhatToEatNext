import React from "react";
import EnhancedSauceRecommender from "@/components/recommendations/EnhancedSauceRecommender";
import SauceLineageTree from "@/components/recommendations/SauceLineageTree";

export const metadata = {
  title: "Cosmic Sauce Recommender - Alchm Kitchen",
  description: "Discover alchemically balanced sauce pairings with nutritional data, batch scaling, and meal planner integration.",
};

export default function SaucesPage() {
  return (
    <div className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Cosmic Sauce Recommender
          </h1>
          <p className="text-white/60">
            Find the perfect sauce to complement, contrast, or balance your culinary creations using alchemical properties, nutritional analysis, and batch scaling.
          </p>
        </header>

        <section>
          <EnhancedSauceRecommender />
        </section>

        <section>
          <SauceLineageTree />
        </section>
      </div>
    </div>
  );
}
