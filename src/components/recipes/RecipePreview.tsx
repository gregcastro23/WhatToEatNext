// src/components/recipes/RecipePreview.tsx
import React, { useState } from 'react';
import { useRealtimePlanetaryPositions } from '@/hooks/useRealtimePlanetaryPositions';
import { generateMonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RecipePreview() {
  const { positions, loading, error } = useRealtimePlanetaryPositions({ autoStart: true });
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Italian');
  const [selectedElement, setSelectedElement] = useState<string>('Fire');
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const criteria = {
        cuisine: selectedCuisine,
        elementalPreference: { [selectedElement]: 0.5 },
        planetaryHour: positions?.Sun?.position, // Example planetary data
        lunarPhase: 'full' as const, // Would calculate properly
        currentZodiacSign: 'leo' as const // From positions
      };
      const result = await generateMonicaOptimizedRecipe(criteria);
      setGeneratedRecipe(result.recipe);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div>Loading planetary data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="p-4">
      <h3>Quick Recipe Preview</h3>
      <p>Current Planetary Hour: {positions?.Sun?.position || 'Unknown'}</p>
      
      <div>
        <Button onClick={() => setSelectedCuisine('Italian')}>Italian</Button>
        <Button onClick={() => setSelectedCuisine('Mexican')}>Mexican</Button>
        {/* Add more cuisine buttons */}
      </div>
      
      <div>
        <Button onClick={() => setSelectedElement('Fire')}>Fire</Button>
        <Button onClick={() => setSelectedElement('Water')}>Water</Button>
        {/* Add element buttons */}
      </div>
      
      <Button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Preview'}
      </Button>
      
      {generatedRecipe && (
        <div>
          <h4>{generatedRecipe.name}</h4>
          <p>{generatedRecipe.description}</p>
          {/* Display simple recipe card */}
        </div>
      )}
    </Card>
  );
} 