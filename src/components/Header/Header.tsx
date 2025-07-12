'use client';

import React, { useState, useEffect } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { logger } from '@/utils/logger';

interface HeaderProps {
  onServingsChange?: (servings: number) => void;
}

export default function Header({ onServingsChange }: HeaderProps) {
  const { state, planetaryPositions } = useAlchemical();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servings, setServings] = useState(2);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm">
        <div className="h-16 animate-pulse bg-gray-100" />
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              What to Eat Next
            </h1>
            
            {/* Celestial Indicators */}
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
              {planetaryPositions?.sun && (
                <div className="flex items-center">
                  <Sun className="w-4 h-4 mr-1" />
                  <span>{(planetaryPositions.sun as unknown as { sign?: unknown })?.sign}</span>
                </div>
              )}
              {planetaryPositions?.moon && (
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-1" />
                  <span>{(planetaryPositions.moon as unknown)?.sign}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Servings Control */}
            <div className="flex items-center space-x-2">
              <label htmlFor="servings" className="text-sm text-gray-600">
                Servings:
              </label>
              <input
                id="servings"
                type="number"
                min="1"
                max="12"
                value={servings}
                onChange={(e) => handleServingsChange(parseInt(e.target.value, 10))}
                className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {planetaryPositions?.sun && (
                <div className="flex items-center">
                  <Sun className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-500">
                    Sun in {(planetaryPositions.sun as unknown)?.sign}
                  </span>
                </div>
              )}
              {planetaryPositions?.moon && (
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-500">
                    Moon in {(planetaryPositions.moon as unknown)?.sign}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 