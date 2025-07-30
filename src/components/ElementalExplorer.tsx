import { useState } from 'react';

import type { Modality } from '@/data/ingredients/types';
import { determineIngredientModality } from '@/utils/ingredientUtils';

export default function ElementalExplorer() {
  const [qualities, setQualities] = useState<string[]>([]);
  
  // Calculate modality based on qualities
  const modality = determineIngredientModality(qualities);
  
  // Handle quality toggle
  const toggleQuality = (quality: string) => {
    if (qualities.includes(quality)) {
      setQualities(qualities.filter(q => q !== quality));
    } else {
      setQualities([...qualities, quality]);
    }
  };
  
  return (
    <div>
      <h2>Elemental Explorer</h2>
      <div>
        <h3>Qualities</h3>
        <div>
          <button onClick={() => toggleQuality('initiating&apos;)}>Initiating</button>
          <button onClick={() => toggleQuality('grounding&apos;)}>Grounding</button>
          <button onClick={() => toggleQuality('adaptable&apos;)}>Adaptable</button>
          <button onClick={() => toggleQuality('spicy&apos;)}>Spicy</button>
          <button onClick={() => toggleQuality('stabilizing&apos;)}>Stabilizing</button>
          <button onClick={() => toggleQuality('flexible&apos;)}>Flexible</button>
        </div>
      </div>
      <div>
        <h3>Current Modality: {modality}</h3>
        <p>Selected Qualities: {qualities.join(', ')}</p>
      </div>
    </div>
  );
} 