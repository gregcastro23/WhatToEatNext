'use client';

import React, { useState, useEffect } from 'react';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';
import { useUser } from '../contexts/UserContext';
import { Moon, sun, Menu, X, Users, ChefHat, Clock, CalendarDays, UserCircle } from 'lucide-react';
import { logger } from '../utils/logger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentCelestialPositions } from '../services/astrologyApi';
import { AlchemicalContextType } from '../contexts/AlchemicalContext/types';

interface HeaderProps {
  onServingsChange?: (servings: number) => void;
  setNumberOfPeople?: (num: number) => void;
}

// Define interface for planetary position data
interface PlanetaryPosition {
  sign: string;
  degree: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
}

export default function CombinedHeader({ onServingsChange, setNumberOfPeople }: HeaderProps) {
  const { state, planetaryPositions } = useAlchemical() as AlchemicalContextType;
  
  const { currentUser, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servings, setServings] = useState(2);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle servings change
  const handleServingsChange = (newServings: number) => {
    try {
      if (newServings < 1) newServings = 1;
      if (newServings > 12) newServings = 12;
      
      setServings(newServings);
      onServingsChange?.(newServings);
    } catch (error) {
      logger.error('Error updating servings:', error);
    }
  };

  // Handle people count update
  const handlePeopleUpdate = (count: number) => {
    setPeopleCount(count);
    setNumberOfPeople?.(count);
  };

  // Navigate to profile page
  const handleProfileClick = () => {
    router.push('/profile');
    setIsMenuOpen(false);
  };

  // Fetch celestial data
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

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm">
        <div className="h-16 animate-pulse bg-gray-100" />
      </header>
    );
  }

  // Safe accessor for planetaryPositions
  const getSafeSign = (planet: unknown): string => {
    if (!planet) return '';
    return (planet as PlanetaryPosition).sign || '';
  };

  return (
    <header className="bg-gradient-to-r from-violet-500 to-indigo-500 shadow-md text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 space-y-4 md:space-y-0">
          {/* Left Section - Logo and Time of Day */}
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
                    <sun className="h-5 w-5 text-yellow-300" />
                    <span className="font-medium">sun</span>
                  </div>
                  <div className="text-lg font-semibold capitalize">
                    {astroData.sun.sign || getSafeSign(planetaryPositions.sun)}
                  </div>
                  <div className="text-sm opacity-90">
                    {formatDegrees(astroData.sun.degree, astroData.sun.minutes)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Moon className="h-5 w-5 text-blue-200" />
                    <span className="font-medium">Moon</span>
                  </div>
                  <div className="text-lg font-semibold capitalize">
                    {astroData.moon.sign || getSafeSign(planetaryPositions.moon)}
                  </div>
                  <div className="text-sm opacity-90">
                    {formatDegrees(astroData.moon.degree, astroData.moon.minutes)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - User Controls */}
          <div className="flex items-center space-x-4">
            {/* Servings Control */}
            <div className="flex items-center space-x-2">
              <label htmlFor="servings" className="text-sm text-white">
                Servings:
              </label>
              <input
                id="servings"
                type="number"
                min="1"
                max="12"
                value={servings}
                onChange={(e) => handleServingsChange(parseInt(e.target.value, 10))}
                className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* People Controls */}
            <div className="flex items-center space-x-2">
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
            </div>

            {/* Season Display */}
            <div className="hidden md:flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm">{state.currentSeason}</span>
            </div>
            
            {/* User Profile Button */}
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-sm hidden md:inline">
                {isUserLoading ? "Loading..." : 
                 currentUser ? currentUser.name : "Profile"}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-4">
              {planetaryPositions?.sun && (
                <div className="flex items-center">
                  <sun className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    sun in {getSafeSign(planetaryPositions.sun)}
                  </span>
                </div>
              )}
              {planetaryPositions?.moon && (
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Moon in {getSafeSign(planetaryPositions.moon)}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                <span className="text-sm">{state.currentSeason}</span>
              </div>
              <button 
                onClick={handleProfileClick}
                className="flex w-full items-center py-2 px-1 hover:bg-white/10 rounded"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {isUserLoading ? "Loading..." : 
                   currentUser ? currentUser.name : "Profile"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function getCurrentTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
} 