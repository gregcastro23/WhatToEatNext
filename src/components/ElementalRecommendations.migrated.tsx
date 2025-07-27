'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { useServices } from '@/hooks/useServices';
import { ElementalProperties } from '@/types';
import { PlanetaryPosition } from "@/types/celestial";
import { Element } from '@/types/elemental';
interface ElementalRecommendation {
  element: Element;
  recommendation: string;
}

interface ElementalRecommendationsProps {
  targetElement?: string;
  compact?: boolean;
}

const ElementalRecommendationsMigrated: React.FC<ElementalRecommendationsProps> = ({
  targetElement,
  compact = false
}) => {
  // Replace context hooks with services hook
  const { 
    isLoading, 
    error, 
    astrologyService, 
    recommendationService
  } = useServices();

  // State for component data
  const [elementalProperties, setElementalProperties] = useState<ElementalProperties | null>(null);
  const [recommendations, setRecommendations] = useState<ElementalRecommendation[]>([]);
  const [dominantElement, setDominantElement] = useState<Element>('Fire');

  // Load astrological data and calculate recommendations when services are available
  useEffect(() => {
    if (isLoading || !astrologyService || !recommendationService) {
      return;
    }

    const loadElementalData = async () => {
      try {
        // Get current planetary positions
        const positions = await astrologyService.getCurrentPlanetaryPositions();
        
        // Get daytime status
        const isDaytime = await astrologyService.isDaytime();
        
        // Calculate elemental properties - using a simplified approach
        const properties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        setElementalProperties(properties);
        
        // Determine dominant element - using a default
        const dominant = 'Fire';
        setDominantElement(dominant);
        
        // Get recommendations based on elemental properties and optional target element
        const elementalRecommendations = await (recommendationService as any)?.getElementalRecommendations?.(
          properties,
          targetElement
        );
        
        setRecommendations(elementalRecommendations);
      } catch (err) {
        console.error('Error loading elemental data:', err);
      }
    };
    
    loadElementalData();
  }, [isLoading, astrologyService, recommendationService, targetElement]);

  // Helper function to get element color
  const getElementColor = (element: Element): string => {
    switch (element) {
      case 'Fire': return '#ff5722';
      case 'Water': return '#03a9f4';
      case 'Earth': return '#4caf50';
      case 'Air': return '#9c27b0';
      default: return '#757575';
    }
  };

  // Helper function to get element emoji
  const getElementEmoji = (element: Element): string => {
    switch (element) {
      case 'Fire': return '🔥';
      case 'Water': return '💧';
      case 'Earth': return '🌱';
      case 'Air': return '💨';
      default: return '✨';
    }
  };

  // Format element values for display
  const formattedElements = useMemo(() => {
    if (!elementalProperties) return [];

    return Object.entries(elementalProperties)
      .map(([element, value]) => ({
        element: element as Element,
        value,
        percentage: Math.round(value * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }, [elementalProperties]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Elemental Recommendations</h3>
        </div>
        <div className="space-y-2">
          <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Elemental Recommendations</h3>
        <div className="text-red-500">
          <p>Error loading recommendations: {error.message}</p>
        </div>
      </div>
    );
  }

  // Show loading state if no data
  if (!elementalProperties || (recommendations || []).length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Elemental Recommendations</h3>
        <p className="text-gray-500">Calculating elemental recommendations...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Elemental Recommendations</h3>
        {dominantElement && (
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${getElementColor(dominantElement)}20`,
              color: getElementColor(dominantElement)
            }}
          >
            {getElementEmoji(dominantElement)} Dominant: {dominantElement}
          </span>
        )}
      </div>

      {!compact && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Elemental Balance</div>
          <div className="flex h-6 rounded-full overflow-hidden">
            {(formattedElements || []).map(({ element, percentage }) => (
              <div
                key={element}
                className="h-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: getElementColor(element),
                }}
                title={`${element}: ${percentage}%`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-600">
            {(formattedElements || []).map(({ element, percentage }) => (
              <div key={element} className="flex items-center">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: getElementColor(element) }}
                />
                <span>{element}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(recommendations || []).map((rec, index) => (
          <div 
            key={index} 
            className="p-3 rounded-md" 
            style={{ backgroundColor: `${getElementColor(rec.element)}10` }}
          >
            <div className="flex items-center mb-1">
              <span className="mr-2">{getElementEmoji(rec.element)}</span>
              <span 
                className="font-medium"
                style={{ color: getElementColor(rec.element) }}
              >
                {rec.element.charAt(0).toUpperCase() + rec.element.slice(1)} Recommendation
              </span>
            </div>
            <p className="text-sm text-gray-700">{rec.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ElementalRecommendationsMigrated); 