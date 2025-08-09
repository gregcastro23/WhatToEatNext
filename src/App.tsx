import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

import AstrologicalClock from '@/components/AstrologicalClock';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import ElementalEnergyDisplay from '@/components/ElementalEnergyDisplay';
import ErrorFallback from '@/components/errors/ErrorFallback';
import GlobalErrorBoundary from '@/components/errors/GlobalErrorBoundary';
import MoonDisplay from '@/components/MoonDisplay';
import PlanetaryPositionInitializer from '@/components/PlanetaryPositionInitializer';
import SunDisplay from '@/components/SunDisplay';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import ErrorHandler from '@/services/errorHandler';
import { initializeAlchemicalEngine } from '@/utils/alchemyInitializer';
import './styles/expandable.css'; // Import our expandable component styles

// Dynamically import FoodRecommender with loading state
const FoodRecommender = dynamic(() => import('@/components/FoodRecommender'), {
  loading: () => <div className='loading'>Loading recommendations...</div>,
  ssr: false,
});

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
type ComponentName =
  | 'foodRecommender'
  | 'elementalEnergy'
  | 'moonDisplay'
  | 'sunDisplay'
  | 'astrologicalClock'
  | 'cuisineRecommender'
  | 'cookingMethods';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [activeComponent, setActiveComponent] = useState<ComponentName>('foodRecommender');

  // Handle errors that occur during setup
  const handleSetupError = (error: Error) => {
    ErrorHandler.log(error, {
      context: 'App:setup',
      isFatal: true,
    });
  };

  // Initialize the alchemical engine on mount
  useEffect(() => {
    try {
      // Initialize the alchemical engine
      initializeAlchemicalEngine();

      // Get user's location if possible
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            });
          },
          error => {
            ErrorHandler.log(error, {
              context: 'App:geolocation',
              isFatal: false,
            });
          },
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
    { name: 'Astrological Clock', id: 'astrologicalClock' },
  ];

  // Show loading state until the app is initialized
  if (!isInitialized) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-xl'>Initializing What To Eat Next...</h2>
          <p>Loading astrological data and ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary
      context='AppRoot'
      fallback={({ error, resetErrorBoundary, context }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          context={context || 'AppRoot'}
        />
      )}
    >
      <AlchemicalProvider>
        <div className='w-full px-4 py-4'>
          <h1 className='mb-4 text-center text-3xl font-bold'>What To Eat Next</h1>

          {/* Display user location if available */}
          {userLocation && (
            <div className='mb-2 text-center text-xs text-gray-500'>
              Using location: {userLocation.latitude.toFixed(2)},{' '}
              {userLocation.longitude.toFixed(2)}
            </div>
          )}

          {/* Planetary position initializer helps fetch position data */}
          <PlanetaryPositionInitializer />

          {/* Navigation bar for mobile */}
          <div className='mb-4 w-full overflow-x-auto'>
            <div className='flex flex-row flex-nowrap space-x-2 pb-2'>
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveComponent(item.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
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
          <div className='w-full'>
            {/* Food Recommender */}
            {activeComponent === 'foodRecommender' && (
              <GlobalErrorBoundary context='FoodRecommender'>
                <div className='mb-6'>
                  <FoodRecommender />
                </div>
              </GlobalErrorBoundary>
            )}

            {/* Elemental Energy Display */}
            {activeComponent === 'elementalEnergy' && (
              <GlobalErrorBoundary context='ElementalEnergy'>
                <div className='mb-6'>
                  <ElementalEnergyDisplay />
                </div>
              </GlobalErrorBoundary>
            )}

            {/* Moon Display */}
            {activeComponent === 'moonDisplay' && (
              <GlobalErrorBoundary context='MoonDisplay'>
                <div className='mb-6'>
                  <MoonDisplay />
                </div>
              </GlobalErrorBoundary>
            )}

            {/* Sun Display */}
            {activeComponent === 'sunDisplay' && (
              <GlobalErrorBoundary context='SunDisplay'>
                <div className='mb-6'>
                  <SunDisplay />
                </div>
              </GlobalErrorBoundary>
            )}

            {/* Astrological Clock */}
            {activeComponent === 'astrologicalClock' && (
              <GlobalErrorBoundary context='AstrologicalClock'>
                <div className='mb-6'>
                  <AstrologicalClock />
                </div>
              </GlobalErrorBoundary>
            )}

            {/* Cuisine Recommender */}
            {activeComponent === 'cuisineRecommender' && (
              <GlobalErrorBoundary context='CuisineRecommender'>
                <div className='mb-6'>
                  <CuisineRecommender />
                </div>
              </GlobalErrorBoundary>
            )}

            {/* Cooking Methods */}
            {activeComponent === 'cookingMethods' && (
              <GlobalErrorBoundary context='CookingMethods'>
                <div className='mb-6'>
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
