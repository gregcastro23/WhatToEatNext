import { Suspense } from "react";
import DynamicCuisineRecommender from "@/components/home/DynamicCuisineRecommender";
import { HeroSection } from "@/components/home/HeroSection";
import EnhancedSauceRecommender from "@/components/recommendations/EnhancedSauceRecommender";
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

        <section id="cuisines">
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
        </section>

        <section id="ingredients">
          <Suspense fallback={<SectionLoader />}>
            <EnhancedIngredientRecommender />
          </Suspense>
        </section>

        <Suspense fallback={<SectionLoader />}>
          <EnhancedCookingMethodRecommender />
        </Suspense>
      </div>
    </main>
  );
}
