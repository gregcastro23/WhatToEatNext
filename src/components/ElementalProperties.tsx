import React from 'react';
import { _Element } from '../utils/elemental/elementCompatibility';
import { _ElementalProperties } from "@/types/alchemy";

interface ElementalPropertiesProps {
  properties: _ElementalProperties | Record<string, number>;
  showPercentages?: boolean;
  className?: string;
}

/**
 * ElementalProperties Component
 * 
 * Displays the elemental properties according to the Elemental Logic Principles:
 * - Each element is individually valuable
 * - No opposing elements
 * - All elements displayed with their own values
 */
const ElementalProperties: React.FC<ElementalPropertiesProps> = ({ properties,
  showPercentages = true,
  className = '' }) => {
  // Format values as percentages if needed
  const formatValue = (value: number) => {
    if (showPercentages) {
      return `${Math.round(value * 100)}%`;
    }
    return value.toFixed(2);
  };

  return (
    <div className={`elemental-properties ${className}`}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="element Fire p-2 rounded-md bg-red-100">
          <div className="element-name font-semibold">Fire</div>
          <div className="element-value">{formatValue(properties?.Fire || (properties as Record<string, number>)?.Fire)}</div>
        </div>
        
        <div className="element Water p-2 rounded-md bg-blue-100">
          <div className="element-name font-semibold">Water</div>
          <div className="element-value">{formatValue(properties?.Water || (properties as Record<string, number>)?.Water)}</div>
        </div>
        
        <div className="element Earth p-2 rounded-md bg-green-100">
          <div className="element-name font-semibold">Earth</div>
          <div className="element-value">{formatValue(properties?.Earth || (properties as Record<string, number>)?.Earth)}</div>
        </div>
        
        <div className="element Air p-2 rounded-md bg-purple-100">
          <div className="element-name font-semibold">Air</div>
          <div className="element-value">{formatValue(properties?.Air || (properties as Record<string, number>)?.Air)}</div>
        </div>
      </div>
    </div>
  );
};

export default ElementalProperties; 