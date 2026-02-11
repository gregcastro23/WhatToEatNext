import CurrentMomentCuisineRecommendations from "../components/cuisines/CurrentMomentCuisineRecommendations";
import EnhancedIngredientRecommender from "../components/recommendations/EnhancedIngredientRecommender";
import AlchmQuantitiesDisplay from "../components/alchm-quantities-display";
import EnhancedCookingMethodRecommender from "../components/recommendations/EnhancedCookingMethodRecommender";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
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
