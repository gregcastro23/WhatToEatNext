import { Suspense } from "react";
import DynamicCuisineRecommender from "@/components/home/DynamicCuisineRecommender";
import { HeroSection } from "@/components/home/HeroSection";
import EnhancedCookingMethodRecommender from "@/components/recommendations/EnhancedCookingMethodRecommender";
import EnhancedIngredientRecommender from "@/components/recommendations/EnhancedIngredientRecommender";

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-slate-400">Loading...</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Suspense fallback={<SectionLoader />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <DynamicCuisineRecommender />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <EnhancedIngredientRecommender />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <EnhancedCookingMethodRecommender />
        </Suspense>
      </div>
    </main>
  );
}
