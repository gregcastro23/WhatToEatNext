import React, { useEffect, useState, useCallback } from "react";
import { fetchAstrologicalRecipes } from "@/services/astrologizeApi";

interface CosmicRecipeWidgetProps {
  // Define any props the widget might need, e.g., for custom birth data
}

const CosmicRecipeWidget: React.FC<CosmicRecipeWidgetProps> = () => {
  const [recipes, setRecipes] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Set to false initially, fetch on button click
  const [error, setError] = useState<string | null>(null);

  // Initial placeholder birth data
  const initialBirthData = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 10,
    minute: 30,
    latitude: 34.0522, // Example: Los Angeles
    longitude: -118.2437,
  };

  const [birthYear, setBirthYear] = useState<number>(initialBirthData.year);
  const [birthMonth, setBirthMonth] = useState<number>(initialBirthData.month);
  const [birthDay, setBirthDay] = useState<number>(initialBirthData.day);
  const [birthHour, setBirthHour] = useState<number>(initialBirthData.hour);
  const [birthMinute, setBirthMinute] = useState<number>(
    initialBirthData.minute,
  );
  const [birthLatitude, setBirthLatitude] = useState<number>(
    initialBirthData.latitude,
  );
  const [birthLongitude, setBirthLongitude] = useState<number>(
    initialBirthData.longitude,
  );

  const currentBirthData = {
    year: birthYear,
    month: birthMonth,
    day: birthDay,
    hour: birthHour,
    minute: birthMinute,
    latitude: birthLatitude,
    longitude: birthLongitude,
  };

  const getRecipes = useCallback(async (data: typeof initialBirthData) => {
    try {
      setLoading(true);
      setError(null);
      setRecipes(null); // Clear previous recipes

      const result = await fetchAstrologicalRecipes(data);
      setRecipes(result); // Assuming result is the object { sign: recipe }
    } catch (err: any) {
      console.error("Failed to fetch astrological recipes:", err);
      setError(
        `Failed to load recipes: ${err.message}. Please try again later.`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount using initialBirthData
  useEffect(() => {
    getRecipes(initialBirthData);
  }, [getRecipes, initialBirthData]); // Dependency on getRecipes and initialBirthData

  const handleGenerateRecipes = () => {
    getRecipes(currentBirthData);
  };

  return (
    <div className="p-6 bg-indigo-950 border-4 border-amber-400 rounded-lg shadow-xl text-amber-400 font-serif">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Your Cosmic Recipes
      </h2>

      <div className="mb-8 p-4 border border-amber-400 rounded-md bg-indigo-900/60">
        <h3 className="text-2xl font-semibold mb-4 text-center">
          Enter Your Birth Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="birthYear" className="block text-sm font-medium">
              Year:
            </label>
            <input
              type="number"
              id="birthYear"
              className="mt-1 block w-full p-2 bg-indigo-800 border border-amber-600 rounded-md shadow-sm text-amber-100 focus:ring-amber-500 focus:border-amber-500"
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
              min="1900"
              max="2100"
            />
          </div>
          <div>
            <label htmlFor="birthMonth" className="block text-sm font-medium">
              Month:
            </label>
            <input
              type="number"
              id="birthMonth"
              className="mt-1 block w-full p-2 bg-indigo-800 border border-amber-600 rounded-md shadow-sm text-amber-100 focus:ring-amber-500 focus:border-amber-500"
              value={birthMonth}
              onChange={(e) => setBirthMonth(Number(e.target.value))}
              min="1"
              max="12"
            />
          </div>
          <div>
            <label htmlFor="birthDay" className="block text-sm font-medium">
              Day:
            </label>
            <input
              type="number"
              id="birthDay"
              className="mt-1 block w-full p-2 bg-indigo-800 border border-amber-600 rounded-md shadow-sm text-amber-100 focus:ring-amber-500 focus:border-amber-500"
              value={birthDay}
              onChange={(e) => setBirthDay(Number(e.target.value))}
              min="1"
              max="31"
            />
          </div>
          <div>
            <label htmlFor="birthHour" className="block text-sm font-medium">
              Hour (24h):
            </label>
            <input
              type="number"
              id="birthHour"
              className="mt-1 block w-full p-2 bg-indigo-800 border border-amber-600 rounded-md shadow-sm text-amber-100 focus:ring-amber-500 focus:border-amber-500"
              value={birthHour}
              onChange={(e) => setBirthHour(Number(e.target.value))}
              min="0"
              max="23"
            />
          </div>
          <div>
            <label htmlFor="birthMinute" className="block text-sm font-medium">
              Minute:
            </label>
            <input
              type="number"
              id="birthMinute"
              className="mt-1 block w-full p-2 bg-indigo-800 border border-amber-600 rounded-md shadow-sm text-amber-100 focus:ring-amber-500 focus:border-amber-500"
              value={birthMinute}
              onChange={(e) => setBirthMinute(Number(e.target.value))}
              min="0"
              max="59"
            />
          </div>
          <div>
            <label
              htmlFor="birthLatitude"
              className="block text-sm font-medium"
            >
              Latitude:
            </label>
            <input
              type="number"
              id="birthLatitude"
              className="mt-1 block w-full p-2 bg-indigo-800 border border-amber-600 rounded-md shadow-sm text-amber-100 focus:ring-amber-500 focus:border-amber-500"
              value={birthLatitude}
              onChange={(e) => setBirthLatitude(Number(e.target.value))}
              step="any"
            />
          </div>
          <div>
            <label
              htmlFor="birthLongitude"
              className="block text-sm font-medium"
            >
              Longitude:
            </label>
            <input
              type="number"
              id="birthLongitude"
              className="mt-1 block w-full p-2 bg-indigo-800 border border-amber-600 rounded-md shadow-sm text-amber-100 focus:ring-amber-500 focus:border-amber-500"
              value={birthLongitude}
              onChange={(e) => setBirthLongitude(Number(e.target.value))}
              step="any"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateRecipes}
          className="w-full bg-amber-600 hover:bg-amber-700 text-indigo-950 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-indigo-900 transition duration-200"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Cosmic Recipes"}
        </button>
      </div>

      {loading && (
        <p className="text-center animate-pulse">
          Loading cosmic culinary wisdom...
        </p>
      )}
      {error && <p className="text-center text-red-400">{error}</p>}
      {!loading &&
        !error &&
        (!recipes || Object.keys(recipes).length === 0) && (
          <p className="text-center">
            No cosmic recipes found for your astrological chart.
          </p>
        )}
      {!loading && !error && recipes && Object.keys(recipes).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(recipes).map(([sign, recipe]: [string, any]) => (
            <div
              key={sign}
              className="border border-amber-400 p-4 rounded-md bg-indigo-900/60"
            >
              <h3 className="text-xl font-semibold mb-2">
                {recipe.name || `Recipe for ${sign}`}
              </h3>
              <p className="text-sm italic mb-2">
                {recipe.astrological_influence || "Influenced by the cosmos"}
              </p>
              <p className="text-md">
                {recipe.description ||
                  "A delicious dish inspired by your unique celestial alignment."}
              </p>
              {/* Add more recipe details here as needed based on API response */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CosmicRecipeWidget;
