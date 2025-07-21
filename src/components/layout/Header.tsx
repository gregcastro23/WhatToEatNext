// src/components/layout/Header.tsx
"use client";

import { 
  Sun, 
  Moon, 
  Users, 
  ChefHat, 
  Clock,
  CalendarDays
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { getCurrentCelestialPositions } from '@/services/astrologyApi';

interface HeaderProps {
  setNumberOfPeople: (num: number) => void;
}

export default function Header({ setNumberOfPeople }: HeaderProps) {
  const { state } = useAlchemical();
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [astroData, setAstroData] = useState<{
    sun: { sign: string; degree: number; minutes: number };
    moon: { sign: string; degree: number; minutes: number };
    lastUpdated: string;
  }>({
    sun: { sign: '', degree: 0, minutes: 0 },
    moon: { sign: '', degree: 0, minutes: 0 },
    lastUpdated: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const handlePeopleUpdate = (count: number) => {
    setPeopleCount(count);
    setNumberOfPeople(count);
  };

  useEffect(() => {
    const fetchAstroData = async () => {
      try {
        const data = await getCurrentCelestialPositions();
        
        // Extract degrees from planetary positions if available
        const sunDegree = data.planetaryPositions?.sun?.degree || 0;
        const sunMinutes = 0; // This data might not be available in the new API
        
        const moonDegree = data.planetaryPositions?.moon?.degree || 0;
        const moonMinutes = 0; // This data might not be available in the new API
        
        setAstroData({
          sun: {
            sign: data.sunSign,
            degree: sunDegree,
            minutes: sunMinutes
          },
          moon: {
            sign: data.moonPhase, // This might be moonSign in your API
            degree: moonDegree,
            minutes: moonMinutes
          },
          lastUpdated: new Date(data.timestamp).toLocaleTimeString()
        });
      } catch (error) {
        console.error('Error fetching astro data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAstroData();
    const interval = setInterval(fetchAstroData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDegrees = (deg: number, min: number) => {
    return `${deg.toString().padStart(2, '0')}°${min.toString().padStart(2, '0')}'`;
  };

  return (
    <div className="relative">
      <header className="border-b bg-gradient-to-r from-violet-500 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 space-y-4 md:space-y-0">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <ChefHat className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">What To Eat Next</h1>
                <div className="flex items-center text-sm space-x-2 opacity-90">
                  <Clock className="h-4 w-4" />
                  <span>Good {getCurrentTimeOfDay()}</span>
                </div>
              </div>
            </div>

            {/* Center Section - Astrological Info */}
            <div className="flex items-center bg-white/10 rounded-lg p-4">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Loading celestial positions...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Sun className="h-5 w-5 text-yellow-300" />
                      <span className="font-medium">Sun</span>
                    </div>
                    <div className="text-lg font-semibold">{astroData.sun.sign}</div>
                    <div className="text-sm opacity-90">
                      {formatDegrees(astroData.sun.degree, astroData.sun.minutes)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Moon className="h-5 w-5 text-blue-200" />
                      <span className="font-medium">Moon</span>
                    </div>
                    <div className="text-lg font-semibold">{astroData.moon.sign}</div>
                    <div className="text-sm opacity-90">
                      {formatDegrees(astroData.moon.degree, astroData.moon.minutes)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handlePeopleUpdate(peopleCount > 1 ? peopleCount - 1 : 1)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Users className="h-4 w-4" />
              </button>
              <span className="min-w-[3ch] text-center">
                {peopleCount}
              </span>
              <button
                onClick={() => handlePeopleUpdate(peopleCount + 1)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Users className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <CalendarDays className="h-4 w-4" />
                <span className="text-sm">{state.currentSeason}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

function getCurrentTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Night";
}