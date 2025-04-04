import { useState } from 'react';
import type { Modality } from '@/data/ingredients/types';
import { determineIngredientModality } from '@/utils/ingredientUtils';

export default function ElementalExplorer() {
  const [elementValues, setElementValues] = useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  });
  
  const [qualities, setQualities] = useState<string[]>([]);
  
  // Calculate modality based on current element values and qualities
  const modality = determineIngredientModality(elementValues, qualities);
  
  // Handle element slider changes
  const handleElementChange = (element: string, value: number) => {
    // Calculate remaining value to distribute
    const currentTotal = Object.values(elementValues).reduce((a, b) => a + b, 0);
    const remainingElements = Object.keys(elementValues).filter(el => el !== element);
    const adjustment = (1 - value - (currentTotal - elementValues[element as keyof typeof elementValues])) / remainingElements.length;
    
    // Create new state with adjusted values
    const newValues = { ...elementValues, [element]: value };
    remainingElements.forEach(el => {
      newValues[el as keyof typeof elementValues] += adjustment;
    });
    
    setElementValues(newValues);
  };
  
  // Handle quality toggle
  const toggleQuality = (quality: string) => {
    if (qualities.includes(quality)) {
      setQualities(qualities.filter(q => q !== quality));
    } else {
      setQualities([...qualities, quality]);
    }
  };
  
  return (
    <div className="elemental-explorer">
      <h2>Elemental Explorer</h2>
      
      <div className="element-sliders">
        {Object.entries(elementValues).map(([element, value]) => (
          <div key={element} className="element-slider">
            <label htmlFor={`${element}-slider`}>{element}</label>
            <input
              id={`${element}-slider`}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={value}
              onChange={(e) => handleElementChange(element, parseFloat(e.target.value))}
            />
            <span className="element-value">{Math.round(value * 100)}%</span>
          </div>
        ))}
      </div>
      
      <div className="quality-toggles">
        <h3>Qualities</h3>
        {['spicy', 'pungent', 'stimulating', 'grounding', 'nourishing', 'adaptable', 'versatile'].map(quality => (
          <button
            key={quality}
            className={`quality-toggle ${qualities.includes(quality) ? 'active' : ''}`}
            onClick={() => toggleQuality(quality)}
          >
            {quality}
          </button>
        ))}
      </div>
      
      <div className="result-section">
        <h3>Resulting Quality</h3>
        <div className={`modality-badge ${modality.toLowerCase()}`}>
          {modality}
        </div>
        
        <div className="modality-characteristics">
          <h4>Characteristics</h4>
          {modality === 'Cardinal' && (
            <p>Initiating, activating, stimulating, sharp, intense</p>
          )}
          {modality === 'Fixed' && (
            <p>Grounding, stabilizing, nourishing, substantial</p>
          )}
          {modality === 'Mutable' && (
            <p>Adaptable, harmonizing, versatile, blending</p>
          )}
        </div>
      </div>
    </div>
  );
} 