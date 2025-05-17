'use client';

import React from 'react';
import @/contexts  from 'AlchemicalContext ';
import AlchemicalPropertiesDisplay from './AlchemicalPropertiesDisplay';
import { ElementalProperties } from '@/types/alchemy';
import { Flame, Droplet, Wind, Mountain } from 'lucide-react';
import { getElementBackgroundColor, getElementTextColor } from '@/utils/elementalUtils';

interface ElementalDisplayProps {
  elementalProperties: ElementalProperties;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
  showLabels?: boolean;
  showPercentages?: boolean;
  variant?: 'pill' | 'bar' | 'circle' | 'compact';
  highlightDominant?: boolean;
  className?: string;
}

const ElementalDisplay: React.FC<ElementalDisplayProps> = ({
  elementalProperties,
  size = 'md',
  showIcons = true,
  showLabels = true,
  showPercentages = true,
  variant = 'pill',
  highlightDominant = true,
  className = '',
}) => {
  const elements: Array<keyof ElementalProperties> = ['Fire', 'Water', 'Earth', 'Air'];
  
  // Find dominant element
  const dominantElement = Object.entries(elementalProperties)
    .sort(([, a], [, b]) => b - a)[0][0] as keyof ElementalProperties;
  
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'text-xs',
      icon: 'w-3 h-3',
      pill: 'px-1.5 py-0.5 rounded',
      circle: 'w-6 h-6',
    },
    md: {
      container: 'text-sm',
      icon: 'w-4 h-4',
      pill: 'px-2 py-1 rounded-md',
      circle: 'w-8 h-8',
    },
    lg: {
      container: 'text-base',
      icon: 'w-5 h-5',
      pill: 'px-3 py-1.5 rounded-lg',
      circle: 'w-10 h-10',
    },
  };

  // Get the icon for an element
  const getElementIcon = (element: keyof ElementalProperties) => {
    switch (element) {
      case 'Fire':
        return <Flame className={`${sizeClasses[size].icon} ${element === dominantElement ? 'text-red-500' : 'text-gray-400'}`} />;
      case 'Water':
        return <Droplet className={`${sizeClasses[size].icon} ${element === dominantElement ? 'text-blue-500' : 'text-gray-400'}`} />;
      case 'Air':
        return <Wind className={`${sizeClasses[size].icon} ${element === dominantElement ? 'text-purple-500' : 'text-gray-400'}`} />;
      case 'Earth':
        return <Mountain className={`${sizeClasses[size].icon} ${element === dominantElement ? 'text-green-500' : 'text-gray-400'}`} />;
      default:
        return null;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${sizeClasses[size].container} ${className}`}>
        {showIcons && elements.map(element => (
          <span key={element} className="mr-1">
            {getElementIcon(element)}
          </span>
        ))}
        {showLabels && (
          <span className="text-gray-600">
            {dominantElement} dominant
          </span>
        )}
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex h-2 rounded-full overflow-hidden">
          {elements.map(element => (
            <div
              key={element}
              style={{
                width: `${Math.max(elementalProperties[element] * 100, 2)}%`,
                backgroundColor: getElementBackgroundColor(element, 1)
              }}
            />
          ))}
        </div>
        {showLabels && (
          <div className="flex justify-between text-xs mt-1">
            {elements.map(element => (
              <div 
                key={element}
                className="flex items-center"
                style={{ color: getElementTextColor(element) }}
              >
                {showIcons && getElementIcon(element)}
                <span className="ml-1">
                  {element}
                  {showPercentages && ` ${Math.round(elementalProperties[element] * 100)}%`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={`grid grid-cols-4 gap-1 ${className}`}>
        {elements.map(element => (
          <div key={element} className="text-center">
            <div 
              className={`${sizeClasses[size].circle} flex items-center justify-center mx-auto rounded-full`}
              style={{ 
                backgroundColor: getElementBackgroundColor(element),
                color: getElementTextColor(element)
              }}
            >
              {showPercentages && Math.round(elementalProperties[element] * 100)}
              {!showPercentages && showIcons && getElementIcon(element)}
            </div>
            {showLabels && (
              <div className="text-xs text-gray-600 mt-1">{element}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default: pill variant
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {elements.map(element => (
        <div
          key={element}
          className={`
            ${sizeClasses[size].container} 
            ${sizeClasses[size].pill} 
            flex items-center 
            ${element === dominantElement && highlightDominant ? 'font-medium' : ''}
          `}
          style={{
            backgroundColor: getElementBackgroundColor(element),
            color: getElementTextColor(element)
          }}
        >
          {showIcons && <span className="mr-1">{getElementIcon(element)}</span>}
          {showLabels && <span>{element}</span>}
          {showPercentages && (
            <span className="ml-1">{Math.round(elementalProperties[element] * 100)}%</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ElementalDisplay; 