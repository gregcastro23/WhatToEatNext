import CosmicRecipeWidget from "../components/CosmicRecipeWidget";
import CurrentMomentCuisineRecommendations from "../components/cuisines/CurrentMomentCuisineRecommendations";
import EnhancedIngredientRecommender from "../components/recommendations/EnhancedIngredientRecommender";
import AlchmQuantitiesDisplay from "../components/alchm-quantities-display";
import EnhancedCookingMethodRecommender from "../components/recommendations/EnhancedCookingMethodRecommender";


export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-indigo-400 py-2">
          What To Eat Next
        </h1>
        <CosmicRecipeWidget />

        <section className="mt-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-300 to-blue-400 py-2">
            Cuisine Recommendations
          </h2>
          <CurrentMomentCuisineRecommendations />
        </section>

        <section className="mt-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-lime-300 to-yellow-400 py-2">
            Ingredient Recommendations
          </h2>
          <EnhancedIngredientRecommender />
        </section>

        <section className="mt-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-rose-300 to-red-400 py-2">
            Alchm Quantities Display
          </h2>
          <AlchmQuantitiesDisplay />
        </section>

        <section className="mt-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-300 to-fuchsia-400 py-2">
            Cooking Method Recommender
          </h2>
          <EnhancedCookingMethodRecommender />
        </section>
      </div>
    </main>
  );
}
