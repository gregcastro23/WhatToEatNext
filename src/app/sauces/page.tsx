import React from "react";
import EnhancedSauceRecommender from "@/components/recommendations/EnhancedSauceRecommender";

export const metadata = {
  title: "Cosmic Sauce Recommender - Alchm Kitchen",
  description: "Discover alchemically balanced sauce pairings optimized with celestial energy.",
};

export default function SaucesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Cosmic Sauce Recommender
          </h1>
          <p className="text-slate-600">
            Find the perfect sauce to complement, contrast, or balance your culinary creations using alchemical properties and thermodynamics.
          </p>
        </header>

        <section>
          <EnhancedSauceRecommender />
        </section>
      </div>
    </div>
  );
}