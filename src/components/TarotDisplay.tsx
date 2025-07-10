"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { Recipe } from '@/types/recipe';
import { getTarotCardsForDate } from '../lib/tarotCalculations';
import { SUIT_TO_ELEMENT, SUIT_TO_TOKEN } from '../utils/tarotMappings';
import { Flame, Droplets, Mountain, Wind, Sparkles, Clock, Calendar } from 'lucide-react';
import { useAstrologicalState } from '../hooks/useAstrologicalState';
import type { PlanetaryPosition } from '@/types/alchemy';

import { _Element } from "@/types/alchemy";
import { PlanetaryAlignment , AstrologicalState } from "@/types/celestial";

export interface AlchemicalValues {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

interface TarotCards {
  minorCard: {
    name: string;
    suit: string;
    number: number;
    keywords: string[];
    element?: string;
    quantum?: number;
    associatedRecipes?: string[];
  };
  majorCard: {
    name: string;
    planet: string;
    keywords: string[];
    element?: string;
  };
}

export interface TarotDisplayProps {
  mode?: 'simple' | 'food'; // simple for basic card display, food for food integration
  onTarotLoaded?: (data: { 
    minorCard: unknown; 
    majorCard: unknown; 
    planetaryCards?: { [key: string]: any };
    alchemicalValues?: AlchemicalValues;
  
  mode: Record<string, unknown>;}) => void;
}

export default function TarotDisplay({ mode = 'food', onTarotLoaded }: TarotDisplayProps) {
  const [tarotCards, setTarotCards] = useState<TarotCards | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const onTarotLoadedRef = useRef(onTarotLoaded);
  
  // Get astrological state which includes Sun position
  const { currentPlanetaryAlignment, loading: astroLoading } = useAstrologicalState();

  // Type guard to check if currentPlanetaryAlignment has Sun property with the right shape
  const hasSunPosition = (alignment: { [key: string]: any }): alignment is { Sun: PlanetaryPosition } => {
    return alignment && 
           typeof alignment === 'object' && 
           'Sun' in alignment && 
           alignment.Sun && 
           typeof alignment.Sun === 'object' &&
           'sign' in alignment.Sun;
  };

  // Update the ref when onTarotLoaded changes
  useEffect(() => {
    onTarotLoadedRef.current = onTarotLoaded;
  }, [onTarotLoaded]);

  const loadTarotCards = useCallback(async () => {
    try {
      const _currentDate = new Date();
      
      if (mode === 'food') {
        // Calculate biweekly period (1-26) for food mode
        const currentDateObj = new Date(currentDate);
        const startOfYear = new Date(currentDateObj.getFullYear(), 0, 0);
        const diff = currentDateObj.getTime() - startOfYear.getTime();
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weekOfYear = Math.floor(dayOfYear / 7);
        const biWeeklyPeriod = Math.floor(weekOfYear / 2) + 1;
        
        // Format the date range for this period
        const periodStart = new Date(currentDateObj.getFullYear(), 0, biWeeklyPeriod * 14 - 13);
        const periodEnd = new Date(currentDateObj.getFullYear(), 0, biWeeklyPeriod * 14);
        const formatDate = (date: Date) => {
          const month = date.toLocaleString('default', { month: 'short' });
          return `${month} ${date.getDate()}`;
        };
        setCurrentPeriod(`${formatDate(periodStart)} - ${formatDate(periodEnd)}`);
      }
      
      // Get Sun position from planetary alignment if available
      let sunPosition;
      if (hasSunPosition(currentPlanetaryAlignment)) {
        sunPosition = {
          sign: currentPlanetaryAlignment.Sun.sign,
          degree: currentPlanetaryAlignment.Sun.degree || 0
        };
      }
      
      // Get the cards with Sun position
      const cards = getTarotCardsForDate(currentDate, sunPosition);
      
      // Only update state if cards have changed
      setTarotCards(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(cards)) {
          return cards as TarotCards;
        }
        return prev;
      });
      
      // Use ref for callback to prevent re-renders
      if (onTarotLoadedRef.current && cards) {
        // Calculate alchemical values
        const alchemicalValues = getAlchemicalValues(cards.minorCard);
        
        // Add values to the callback data - Pattern XXX: Component Props Interface Resolution
        onTarotLoadedRef.current({
          ...cards,
          alchemicalValues,
          planetaryCards: {}, // Will be populated by the parent component
          mode: mode as any // Add missing required property
        });
      }
    } catch (err) {
      setError('Failed to load tarot cards');
      // console.error(err);
    }
  }, [currentPlanetaryAlignment, mode]);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      loadTarotCards();
    }

    return () => {
      isMounted = false;
    };
  }, [loadTarotCards]);

  // Function to compute alchemical values from tarot card
  const getAlchemicalValues = (card: unknown): AlchemicalValues => {
    if (!card) return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    
    const suit = (card as Record<string, any>).name?.split(' of ')[1] || (card as Record<string, any>).suit;
    const number = (card as Record<string, any>).number || 0;
    
    // Create base object with all values at 0
    const values = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    
    // Map suit to alchemical value
    if (suit === 'Wands') values.Spirit = number;
    else if (suit === 'Cups') values.Essence = number;
    else if (suit === 'Pentacles') values.Matter = number;
    else if (suit === 'Swords') values.Substance = number;
    
    return values;
  };

  const getElementIcon = (element: Element) => {
    switch (String(element).toLowerCase()) {
      case 'Fire': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Water': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'Earth': return <Mountain className="w-4 h-4 text-green-400" />;
      case 'Air': return <Wind className="w-4 h-4 text-purple-400" />;
      default: return null;
    }
  };

  const getElementColor = (element: Element) => {
    switch (String(element).toLowerCase()) {
      case 'Fire': return 'bg-gradient-to-br from-orange-800 to-red-900 text-white';
      case 'Water': return 'bg-gradient-to-br from-blue-800 to-indigo-900 text-white';
      case 'Earth': return 'bg-gradient-to-br from-green-800 to-emerald-900 text-white';
      case 'Air': return 'bg-gradient-to-br from-purple-800 to-violet-900 text-white';
      default: return 'bg-gradient-to-br from-gray-800 to-slate-900 text-white';
    }
  };

  if (error) return <div className="text-red-400 mb-4">Tarot unavailable: {error}</div>;
  if (!tarotCards) return <div className="text-purple-300 mb-4">Divining celestial cards...</div>;

  // Simple mode - basic card display
  if (mode === 'simple') {
    const tokenValues = getAlchemicalValues(tarotCards.minorCard);
    
    return (
      <div className="bg-gray-900 bg-opacity-75 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Daily Tarot Correspondence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-bold text-white mb-2">Decan Card</h4>
            <h5 className="text-lg text-purple-300 mb-3">{tarotCards.minorCard.name}</h5>
            <div className="space-y-2">
              {Object.entries(tokenValues || {}).map(([token, value]) => (
                <div key={token} className="flex justify-between">
                  <span className="text-gray-300">{token}:</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-400">
              Keywords: {tarotCards?.minorCard?.keywords?.join(', ')}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-bold text-white mb-2">Ruling Planet</h4>
            <h5 className="text-lg text-yellow-300 mb-3">{tarotCards.majorCard.planet}</h5>
            <div className="text-purple-300 mb-3">{tarotCards.majorCard.name}</div>
            <div className="text-sm text-gray-400">
              Planetary Influence: {tarotCards?.majorCard?.keywords?.join(', ')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Food mode - comprehensive display with food integration
  const suit = tarotCards.minorCard?.name?.split(' ')[2] || tarotCards.minorCard?.suit;
  const element = suit ? (SUIT_TO_ELEMENT[suit as keyof typeof SUIT_TO_ELEMENT] || 'Unknown') : 'Unknown';
  const token = suit ? (SUIT_TO_TOKEN[suit as keyof typeof SUIT_TO_TOKEN] || 'Quantum') : 'Quantum';
  const value = tarotCards.minorCard?.number || 0;

  return (
    <div className="mb-6 mt-2">
      <h3 className="text-lg font-semibold mb-3">Tarot Correspondence for Today</h3>
      
      <div className="flex items-center mb-3 text-xs text-purple-300">
        <Calendar className="w-3 h-3 mr-1" />
        <span>Biweekly Period: {currentPeriod}</span>
        <Clock className="w-3 h-3 ml-3 mr-1" />
        <span>Updated daily with planetary positions</span>
        {hasSunPosition(currentPlanetaryAlignment) && (
          <span className="ml-3">
            • Sun: {currentPlanetaryAlignment.Sun.sign} {Math.floor(currentPlanetaryAlignment.Sun.degree || 0)}°
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className={`rounded-lg p-4 bg-opacity-10 ${getElementColor(element as unknown)}`}> {/* Pattern XXX: Component Props Interface Resolution */}
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-white text-lg drop-shadow-md">{tarotCards.minorCard?.name || 'Minor Arcana'}</h4>
              <div className="flex items-center mt-1 bg-black bg-opacity-20 rounded px-2 py-1 inline-block">
                {getElementIcon(element as unknown)} {/* Pattern XXX: Component Props Interface Resolution */}
                <span className="ml-1 text-sm font-medium">{element}</span>
              </div>
            </div>
            <div className="flex items-center bg-black bg-opacity-50 px-3 py-1.5 rounded-full shadow">
              <Sparkles className="w-4 h-4 mr-1.5 text-yellow-300" />
              <span className="text-sm text-white font-medium">{token}: {value}</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            <div className="italic font-medium text-white bg-black bg-opacity-30 p-2 rounded-md">
              {tarotCards.minorCard?.keywords?.join(' • ') || 'Mystical energies'}
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 bg-gradient-to-br from-indigo-800 to-purple-900 text-white bg-opacity-10">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-white text-lg drop-shadow-md">{tarotCards.majorCard?.name || 'Major Arcana'}</h4>
              <div className="flex items-center mt-1 bg-black bg-opacity-20 rounded px-2 py-1 inline-block">
                <span className="text-sm font-medium">Planet: {tarotCards.majorCard?.planet}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            <div className="italic font-medium text-white bg-black bg-opacity-30 p-2 rounded-md">
              {tarotCards.majorCard?.keywords?.join(' • ') || 'Planetary wisdom'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export legacy components for backward compatibility
export const TarotCardDisplay = (props: Omit<TarotDisplayProps, 'mode'>) => 
  <TarotDisplay {...props} mode="simple" />;

export const TarotFoodDisplay = (props: TarotDisplayProps) => 
  <TarotDisplay {...props} mode="food" />; 