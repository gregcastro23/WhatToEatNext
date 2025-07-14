import React, { useState, useContext, useEffect } from 'react';
import { RecipeQueueContext } from '@/contexts/RecipeQueueContext';
import { getAllIngredients } from '@/utils/foodRecommender';
import { generateMonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import { Select, MenuItem, Chip, Autocomplete, TextField, Button, Card, Box, Grid, Typography, IconButton } from '@mui/material'; // Use MUI for better UI
import { FileCopy } from '@mui/icons-material';
import { useRealtimePlanetaryPositions } from '@/hooks/useRealtimePlanetaryPositions';

// Add planetary display component (simplified)
function PlanetaryDisplay() {
  const { positions } = useRealtimePlanetaryPositions();
  return (
    <Box>
      <Typography variant="h6">Current Planetary Influences</Typography>
      <p>Sun in: {positions?.sun?.sign}</p>
      <p>Moon Phase: {positions?.moon?.phase}</p>
    </Box>
  );
}

// Add elemental visualization
function ElementalVisualization({ ingredients }) {
  const avgProperties = ingredients.reduce((acc, ing) => {
    Object.entries(ing.elementalProperties || {}).forEach(([key, val]) => {
      acc[key] = (acc[key] || 0) + val;
    });
    return acc;
  }, {});
  
  const count = ingredients.length;
  Object.keys(avgProperties).forEach(key => {
    avgProperties[key] = avgProperties[key] / count;
  });

  return (
    <Box>
      <Typography variant="h6">Elemental Balance</Typography>
      <Grid container spacing={1}>
        {Object.entries(avgProperties).map(([element, value]) => (
          <Grid item xs={3} key={element}>
            <Typography>{element}: {Math.round(value * 100)}%</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default function MainRecipeBuilder() {
  const { queue, setMealType, addFlavor, removeFlavor, addDietaryPreference, removeDietaryPreference, addAllergy, removeAllergy, addIngredient, removeIngredient, clearQueue } = useContext(RecipeQueueContext);
  const [ingredients, setIngredients] = useState(getAllIngredients());
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietaryInput, setDietaryInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [numRecipes, setNumRecipes] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || ing.category === categoryFilter)
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newRecipes = [];
      for (let i = 0; i < numRecipes; i++) {
        const criteria = {
          mealType: queue.mealType,
          flavors: queue.flavors,
          dietaryRestrictions: queue.dietaryPreferences,
          allergens: queue.allergies,
          requiredIngredients: queue.selectedIngredients,
          cuisine: queue.selectedCuisines[0], // Use first or handle multiple
        };
        const result = await generateMonicaOptimizedRecipe(criteria);
        newRecipes.push(result.recipe);
      }
      setGeneratedRecipes(prev => [...prev, ...newRecipes]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (recipe) => {
    navigator.clipboard.writeText(JSON.stringify(recipe));
  };

  const handleDownload = (recipe) => {
    const blob = new Blob([JSON.stringify(recipe)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Flavors options
  const flavorsOptions = ['spicy', 'sweet', 'savory'];

  return (
    <Card>
      <h2>Main Recipe Builder</h2>
      <Select value={queue.mealType || ''} onChange={(e) => setMealType(e.target.value)}>
        <MenuItem value="Breakfast">Breakfast</MenuItem>
        <MenuItem value="Lunch">Lunch</MenuItem>
        <MenuItem value="Dinner">Dinner</MenuItem>
        <MenuItem value="Snack">Snack</MenuItem>
      </Select>
      <Autocomplete
        multiple
        options={flavorsOptions}
        value={queue.flavors}
        onChange={(_, newValue) => newValue.forEach(f => addFlavor(f))}
        renderTags={(value, getTagProps) => value.map((option, index) => (
          <Chip label={option} {...getTagProps({ index })} onDelete={() => removeFlavor(option)} />
        ))}
        renderInput={(params) => <TextField {...params} label="Flavors" />}
      />
      {/* Similar for dietary and allergies using TextField and add on enter */}
      <TextField
        label="Dietary Preference"
        value={dietaryInput}
        onChange={(e) => setDietaryInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { addDietaryPreference(dietaryInput); setDietaryInput(''); } }}
      />
      <div>{queue.dietaryPreferences.map(pref => <Chip key={pref} label={pref} onDelete={() => removeDietaryPreference(pref)} />)}</div>
      {/* Allergies similar */}
      <Autocomplete
        options={getAllIngredients().map(ing => ing.name)}
        inputValue={searchTerm}
        onInputChange={(_, newInput) => setSearchTerm(newInput)}
        onChange={(_, value) => { if (value) addIngredient(value); }}
        renderInput={(params) => <TextField {...params} label="Search Ingredients" />}
      />
      <div>Selected: {queue.selectedIngredients.map(ing => <Chip key={ing} label={ing} onDelete={() => removeIngredient(ing)} />)}</div>
      {/* Similar for cuisines and methods (assume from context) */}
      <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
        <MenuItem value="all">All Categories</MenuItem>
        {/* Add categories from data */}
      </Select>
      <Button onClick={handleGenerate}>Generate Recipes</Button>
      <Select value={numRecipes} onChange={(e) => setNumRecipes(e.target.value)}>
        {[1,2,3,4,5].map(n => <MenuItem key={n} value={n}>{n} Recipes</MenuItem>)}
      </Select>
      {generatedRecipes.map((recipe, idx) => (
        <Card key={idx}>
          <h3>{recipe.name}</h3>
          {/* Display details */}
          <IconButton onClick={() => handleCopy(recipe)}><FileCopy /></IconButton>
          <Button onClick={() => handleDownload(recipe)}>Download</Button>
        </Card>
      ))}
      <PlanetaryDisplay />
      <ElementalVisualization ingredients={queue.selectedIngredients} />
    </Card>
  );
} 