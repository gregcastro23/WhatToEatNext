import React, { useState, useCallback } from 'react';
import type { 
  ElementalProperties, 
  RecipeCalculatorProps,
  Element 
} from '@/types/alchemy';

const MAX_TOTAL = 1;
const MIN_ELEMENT_VALUE = 0;
const MAX_ELEMENT_VALUE = 1;

export const RecipeCalculator: React.FC<RecipeCalculatorProps> = ({ 
  onCalculate,
  initialBalance 
}) => {
  const [elements, setElements] = useState<ElementalProperties>(
    validateInitialBalance(initialBalance) || {
      Fire: 0,
      Water: 0,
      Air: 0,
      Earth: 0
    }
  );

  const [validationError, setValidationError] = useState<string>('');

  const elementLabels = {
    Fire: '🔥 Fire',
    Water: '💧 Water',
    Air: '💨 Air',
    Earth: '🌍 Earth'
  };

  // Validation functions
  const validateInitialBalance = (balance?: ElementalProperties): ElementalProperties | null => {
    if (!balance) return null;

    const total = Object.values(balance).reduce((sum, val) => sum + (val || 0), 0);
    if (total > MAX_TOTAL) {
      console.warn('Initial balance sum exceeds 1, normalizing values');
      return normalizeElements(balance);
    }

    for (const [element, value] of Object.entries(balance)) {
      if (value < MIN_ELEMENT_VALUE || value > MAX_ELEMENT_VALUE) {
        console.warn(`Invalid value for ${element}, clamping to valid range`);
        balance[element as Element] = Math.max(MIN_ELEMENT_VALUE, Math.min(value, MAX_ELEMENT_VALUE));
      }
    }

    return balance;
  };

  const normalizeElements = (elementValues: ElementalProperties): ElementalProperties => {
    const total = Object.values(elementValues).reduce((sum, val) => sum + (val || 0), 0);
    if (total === 0) return elementValues;

    return Object.entries(elementValues).reduce((acc, [key, value]) => {
      acc[key as Element] = (value || 0) / total;
      return acc;
    }, {} as ElementalProperties);
  };

  const validateElementValue = useCallback((element: string, value: number): number => {
    // Ensure value is within valid range
    value = Math.max(MIN_ELEMENT_VALUE, Math.min(value, MAX_ELEMENT_VALUE));

    // Calculate what the total would be with this new value
    const otherElementsTotal = Object.entries(elements)
      .reduce((sum, [key, val]) => 
        key !== element ? sum + (val || 0) : sum, 0);

    // If total would exceed MAX_TOTAL, adjust the new value
    if (otherElementsTotal + value > MAX_TOTAL) {
      value = MAX_TOTAL - otherElementsTotal;
      setValidationError(`Total cannot exceed ${MAX_TOTAL * 100}%`);
    } else {
      setValidationError('');
    }

    return value;
  }, [elements]);

  const handleSliderChange = (element: string, rawValue: number) => {
    const validatedValue = validateElementValue(element, rawValue);
    
    setElements(prev => ({
      ...prev,
      [element]: validatedValue
    }));
  };

  const handleCalculate = () => {
    const total = Object.values(elements).reduce((sum, val) => sum + (val || 0), 0);
    
    if (total === 0) {
      setValidationError('At least one element must have a value');
      return;
    }

    if (total > MAX_TOTAL) {
      setValidationError(`Total cannot exceed ${MAX_TOTAL * 100}%`);
      return;
    }

    const normalized = normalizeElements(elements);
    onCalculate(normalized);
    setValidationError('');
  };

  const handleReset = () => {
    setElements({ Fire: 0, Water: 0, Air: 0, Earth: 0 });
    setValidationError('');
  };

  // Calculate current total for display
  const currentTotal = Object.values(elements).reduce((sum, val) => sum + (val || 0), 0);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Recipe Calculator</h2>
      
      {/* Total Display */}
      <div className="mb-4 text-sm">
        <span className={`font-medium ${currentTotal > MAX_TOTAL ? 'text-red-500' : 'text-gray-600'}`}>
          Total: {Math.round(currentTotal * 100)}%
        </span>
      </div>

      {Object.entries(elementLabels).map(([element, label]) => (
        <div key={element} className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {label}: {elements[element as keyof ElementalProperties]}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={elements[element as keyof ElementalProperties] * 100}
            onChange={(e) => handleSliderChange(element, Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Reset
        </button>
        <button
          onClick={handleCalculate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Calculate
        </button>
      </div>

      {validationError && (
        <div className="mt-4 text-red-500">
          {validationError}
        </div>
      )}
    </div>
  );
};

export default RecipeCalculator;