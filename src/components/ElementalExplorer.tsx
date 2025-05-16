import { useState } from 'react';
import @/data  from 'ingredients ';
import @/utils  from 'ingredientUtils ';

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
          <button onClick={() => toggleQuality('initiating')}>Initiating</button>
          <button onClick={() => toggleQuality('grounding')}>Grounding</button>
          <button onClick={() => toggleQuality('adaptable')}>Adaptable</button>
          <button onClick={() => toggleQuality('spicy')}>Spicy</button>
          <button onClick={() => toggleQuality('stabilizing')}>Stabilizing</button>
          <button onClick={() => toggleQuality('flexible')}>Flexible</button>
        </div>
      </div>
      <div>
        <h3>Current Modality: {modality}</h3>
        <p>Selected Qualities: {qualities.join(', ')}</p>
      </div>
    </div>
  );
} 