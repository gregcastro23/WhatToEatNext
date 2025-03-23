'use client';
import dynamic from 'next/dynamic';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext';
import Loading from '@/components/ui/Loading';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { useEffect, useState } from 'react';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import ElementalEnergyDisplay from '@/components/ElementalEnergyDisplay';

// Dynamic imports with better error handling
const AstrologicalClock = dynamic(
  () => import('@/components/AstrologicalClock'),
  { loading: () => <Loading />, ssr: false }
);

const FoodRecommender = dynamic(
  () => import('@/components/FoodRecommender'),
  { loading: () => <Loading />, ssr: false }
);

export default function Home() {
  const { currentZodiac, currentPlanetaryAlignment, activePlanets } = useAstrologicalState();
  const [isLoading, setIsLoading] = useState(true);
  const [isDaytime, setIsDaytime] = useState(true);

  useEffect(() => {
    // Simulate loading time for astrological data
    const timer = setTimeout(() => setIsLoading(false), 1000);

    // Determine if it's daytime based on the time of day
    const hours = new Date().getHours();
    setIsDaytime(hours >= 6 && hours < 18);
    
    return () => clearTimeout(timer);
  }, []);

  // Create planetary positions for the alchemical recommendations
  const createPlanetaryPositions = () => {
    const positions: Record<string, number> = {};
    
    // Add active planets with higher strength
    if (activePlanets && activePlanets.length > 0) {
      activePlanets.forEach(planet => {
        positions[planet] = 0.8; // Active planets have higher influence
      });
    }
    
    // Add sun and moon positions
    if (currentPlanetaryAlignment?.sun) {
      positions[currentPlanetaryAlignment.sun.sign] = 1.0; // Sun has strongest influence
    }
    
    if (currentPlanetaryAlignment?.moon) {
      positions[currentPlanetaryAlignment.moon.sign] = 0.7; // Moon has strong influence
    }
    
    return positions;
  };

  const planetaryPositions = createPlanetaryPositions();

  return (
    <main className="flex min-h-screen flex-col px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Spirit, Essence, Matter, and Substance
        </h1>
        <p className="text-lg text-slate-300">
          Discover Ingredients, Methods and Cuisines with recipes aligned with nature's current elemental balance
        </p>
      </header>

      <main className="space-y-12">
        {/* Astrological Clock (simple version only) */}
        <section>
          <AstrologicalClock />
        </section>

        {/* Elemental Energy Display Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Celestial Energies
          </h2>
          <div className="glass-panel backdrop-blur-sm rounded-lg shadow-lg">
            <ElementalEnergyDisplay />
          </div>
        </section>

        {/* Food Recommender Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Celestial Ingredient Recommendations
          </h2>
          <div className="glass-panel backdrop-blur-sm rounded-lg shadow-lg">
            <FoodRecommender />
          </div>
        </section>

        {/* Cooking Methods Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Recommended Cooking Techniques
          </h2>
          <div className="glass-panel backdrop-blur-sm rounded-lg shadow-lg">
            <CookingMethods />
          </div>
        </section>

        {/* Cuisine Recommendations */}
        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Astrologically Aligned Cuisines
          </h2>
          <div className="glass-panel backdrop-blur-sm rounded-lg shadow-lg">
            <CuisineRecommender />
          </div>
        </section>
      </main>

      <footer className="mt-16 text-center text-sm text-slate-500">
        <p>Powered by celestial energies and astro-culinary wisdom</p>
      </footer>
    </main>
  );
}
