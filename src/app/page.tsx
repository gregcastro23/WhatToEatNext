import FoodRecommender from '@/components/FoodRecommender';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Discover Recipes From Around The World
          </h1>
          <p className="text-xl text-gray-600">
            Personalized recommendations based on the current moment
          </p>
        </div>

        <FoodRecommender />
      </div>
    </main>
  );
}
