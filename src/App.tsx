import React, { useState, useEffect } from 'react';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import ElementalEnergyDisplay from '@/components/ElementalEnergyDisplay';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import PlanetaryPositionInitializer from '@/components/PlanetaryPositionInitializer';
import MoonDisplay from '@/components/MoonDisplay';
import AstrologicalClock from '@/components/AstrologicalClock';
import dynamic from 'next/dynamic';
import SunDisplay from '@/components/SunDisplay';
import { initializeAlchemicalEngine } from '@/utils/alchemyInitializer';
import GlobalErrorBoundary from '@/components/errors/GlobalErrorBoundary';
import ErrorFallback from '@/components/errors/ErrorFallback';
import ErrorHandler from '@/services/errorHandler';
import { ElementalCalculator as _ElementalCalculator } from '@/services/ElementalCalculator';
import './utils/globals';  // Import global utilities to prevent undefined errors
import './styles/expandable.css';  // Import our expandable component styles

// Dynamically import FoodRecommender with loading state
const FoodRecommender = dynamic(
  () => import('@/components/FoodRecommender'),
  { loading: () => <div className="loading">Loading recommendations...</div>, ssr: false }
);

// Add this type definition at the top of the file
type GeolocationCoordinates = {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
};

// Define the available components for navigation
type ComponentName = 'foodRecommender' | 'elementalEnergy' | 'moonDisplay' | 'sunDisplay' | 'astrologicalClock' | 'cuisineRecommender' | 'cookingMethods';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [activeComponent, setActiveComponent] = useState<ComponentName>('foodRecommender');

  // Handle errors that occur during setup
  const handleSetupError = (error: Error) => {
    // Wrap error details in a plain object to satisfy `Record<string, unknown>` requirement
    ErrorHandler.log(
      { message: error.message, stack: error.stack },
      {
        context: 'App:setup',
        isFatal: true,
      }
    );
  };

  // Initialize the alchemical engine on mount
  useEffect(() => {
    try {
      // Initialize the alchemical engine
      initializeAlchemicalEngine();
      
      // Get user's location if possible
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            });
          },
          (error) => {
            // Extract only safe serialisable fields from the geolocation error
            ErrorHandler.log(
              { code: error.code, message: error.message },
              {
                context: 'App:geolocation',
                isFatal: false,
              }
            );
          }
        );
      }
      
      // Mark as initialized
      setIsInitialized(true);
    } catch (error) {
      handleSetupError(error instanceof Error ? error : new Error('Unknown setup error'));
    }
  }, []);

  // Navigation component definitions
  const navigationItems: { name: string; id: ComponentName }[] = [
    { name: 'Food Recommender', id: 'foodRecommender' },
    { name: 'Cuisine', id: 'cuisineRecommender' },
    { name: 'Cooking Methods', id: 'cookingMethods' },
    { name: 'Elemental Energy', id: 'elementalEnergy' },
    { name: 'Moon', id: 'moonDisplay' },
    { name: 'Sun', id: 'sunDisplay' },
    { name: 'Astrological Clock', id: 'astrologicalClock' }
  ];

  // Show loading state until the app is initialized
  if (!isInitialized) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-2">Initializing What To Eat Next...</h2>
          <p>Loading astrological data and ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary
      context="AppRoot"
      fallback={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} context="AppRoot" />
      )}
    >
      <AlchemicalProvider>
        <div className="w-full px-4 py-4">
          <h1 className="text-3xl font-bold mb-4 text-center">What To Eat Next</h1>
          
          {/* Display user location if available */}
          {userLocation && (
            <div className="text-xs text-gray-500 text-center mb-2">
              Using location: {userLocation.latitude.toFixed(2)}, {userLocation.longitude.toFixed(2)}
            </div>
          )}
          
          {/* Planetary position initializer helps fetch position data */}
          <PlanetaryPositionInitializer />
          
          {/* Navigation bar for mobile */}
          <div className="w-full mb-4 overflow-x-auto">
            <div className="flex flex-row flex-nowrap space-x-2 pb-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveComponent(item.id)}
                  className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap ${
                    activeComponent === item.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content area - only show active component */}
          <div className="w-full">
            {/* Food Recommender */}
            {activeComponent === 'foodRecommender' && (
              <GlobalErrorBoundary context="FoodRecommender">
                <div className="mb-6">
                  <FoodRecommender />
                </div>
              </GlobalErrorBoundary>
            )}
            
            {/* Elemental Energy Display */}
            {activeComponent === 'elementalEnergy' && (
              <GlobalErrorBoundary context="ElementalEnergy">
                <div className="mb-6">
                  <ElementalEnergyDisplay />
                </div>
              </GlobalErrorBoundary>
            )}
            
            {/* Moon Display */}
            {activeComponent === 'moonDisplay' && (
              <GlobalErrorBoundary context="MoonDisplay">
                <div className="mb-6">
                  <MoonDisplay />
                </div>
              </GlobalErrorBoundary>
            )}
            
            {/* Sun Display */}
            {activeComponent === 'sunDisplay' && (
              <GlobalErrorBoundary context="SunDisplay">
                <div className="mb-6">
                  <SunDisplay />
                </div>
              </GlobalErrorBoundary>
            )}
            
            {/* Astrological Clock */}
            {activeComponent === 'astrologicalClock' && (
              <GlobalErrorBoundary context="AstrologicalClock">
                <div className="mb-6">
                  <AstrologicalClock />
                </div>
              </GlobalErrorBoundary>
            )}
            
            {/* Cuisine Recommender */}
            {activeComponent === 'cuisineRecommender' && (
              <GlobalErrorBoundary context="CuisineRecommender">
                <div className="mb-6">
                  <CuisineRecommender />
                </div>
              </GlobalErrorBoundary>
            )}
            
            {/* Cooking Methods */}
            {activeComponent === 'cookingMethods' && (
              <GlobalErrorBoundary context="CookingMethods">
                <div className="mb-6">
                  <CookingMethods />
                </div>
              </GlobalErrorBoundary>
            )}
          </div>
        </div>
      </AlchemicalProvider>
    </GlobalErrorBoundary>
  );
}

export default App; 