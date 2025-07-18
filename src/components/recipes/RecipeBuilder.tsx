import React, { useState, useEffect, useCallback } from 'react';
import type { 
  ElementalProperties, 
  Element, 
  Recipe,
  Ingredient,
  CookingMethod,
  CustomRecipe,
  RecipeIngredient
} from '@/types/alchemy';

import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Alert, 
  Chip,
  Divider,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Restaurant as RestaurantIcon,
  Timer as TimerIcon,
  Save as SaveIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// Data and Utils
import { getAllIngredients } from '@/utils/foodRecommender';
import { getAllEnhancedCookingMethods, type EnhancedCookingMethod } from '@/constants/alchemicalPillars';

// Recipe Builder specific interfaces
interface RecipeBuilderProps {
  initialIngredients?: string[];
  initialMethods?: string[];
  onRecipeComplete?: (recipe: CustomRecipe) => void;
  onSave?: (recipe: CustomRecipe) => void;
}

interface RecipeTiming {
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
}

interface AstrologicalTiming {
  optimalTime: string;
  planetaryHour: string;
  lunarPhase: string;
  seasonalAlignment: string;
}

// Helper Functions
const generateRecipeId = (): string => {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateTotalTime = (prepTime: number, cookTime: number): number => {
  return prepTime + cookTime;
};

const getDominantElement = (elements: ElementalProperties): Element => {
  let max = 0;
  let dominant: Element = 'Fire';
  
  Object.entries(elements).forEach(([element, value]) => {
    if (value > max) {
      max = value;
      dominant = element as Element;
    }
  });
  
  return dominant;
};

const calculateElementalProperties = (ingredients: RecipeIngredient[]): ElementalProperties => {
  const totalElements = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let totalWeight = 0;

  ingredients.forEach(ingredient => {
    if (ingredient.elementalProperties) {
      const weight = parseFloat(ingredient.quantity) || 1;
      totalWeight += weight;
      
      Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
        totalElements[element as keyof ElementalProperties] += value * weight;
      });
    }
  });

  // Normalize by total weight
  if (totalWeight > 0) {
    Object.keys(totalElements).forEach(element => {
      totalElements[element as keyof ElementalProperties] /= totalWeight;
    });
  }

  return totalElements;
};

// Recipe formatting functions
const formatRecipeAsText = (recipe: CustomRecipe): string => {
  let text = `${recipe.name}\n`;
  text += `${'='.repeat(recipe.name.length)}\n\n`;
  
  text += `Servings: ${recipe.servings}\n`;
  text += `Prep Time: ${recipe.timing.prepTime} minutes\n`;
  text += `Cook Time: ${recipe.timing.cookTime} minutes\n`;
  text += `Total Time: ${recipe.timing.totalTime} minutes\n\n`;
  
  text += `INGREDIENTS:\n`;
  text += `-----------\n`;
  recipe.ingredients.forEach(ingredient => {
    text += `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}\n`;
  });
  
  text += `\nCOOKING METHODS:\n`;
  text += `---------------\n`;
  recipe.methods.forEach(method => {
    text += `• ${method.name}\n`;
  });
  
  text += `\nINSTRUCTIONS:\n`;
  text += `------------\n`;
  recipe.instructions.forEach((instruction, index) => {
    text += `${index + 1}. ${instruction}\n`;
  });
  
  if (recipe.elementalProperties) {
    text += `\nELEMENTAL BALANCE:\n`;
    text += `-----------------\n`;
    Object.entries(recipe.elementalProperties).forEach(([element, value]) => {
      text += `${element}: ${Math.round(value * 100)}%\n`;
    });
  }
  
  return text;
};

const formatRecipeAsMarkdown = (recipe: CustomRecipe): string => {
  let md = `# ${recipe.name}\n\n`;
  
  md += `**Servings:** ${recipe.servings}  \n`;
  md += `**Prep Time:** ${recipe.timing.prepTime} minutes  \n`;
  md += `**Cook Time:** ${recipe.timing.cookTime} minutes  \n`;
  md += `**Total Time:** ${recipe.timing.totalTime} minutes  \n\n`;
  
  md += `## Ingredients\n\n`;
  recipe.ingredients.forEach(ingredient => {
    md += `- ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}\n`;
  });
  
  md += `\n## Cooking Methods\n\n`;
  recipe.methods.forEach(method => {
    md += `- ${method.name}\n`;
  });
  
  md += `\n## Instructions\n\n`;
  recipe.instructions.forEach((instruction, index) => {
    md += `${index + 1}. ${instruction}\n`;
  });
  
  if (recipe.elementalProperties) {
    md += `\n## Elemental Balance\n\n`;
    Object.entries(recipe.elementalProperties).forEach(([element, value]) => {
      md += `- **${element}:** ${Math.round(value * 100)}%\n`;
    });
  }
  
  return md;
};

export default function RecipeBuilder({ 
  initialIngredients = [], 
  initialMethods = [], 
  onRecipeComplete, 
  onSave 
}: RecipeBuilderProps) {
  // Core recipe state
  const [recipeName, setRecipeName] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<EnhancedCookingMethod[]>([]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [timing, setTiming] = useState<RecipeTiming>({
    prepTime: 15,
    cookTime: 30,
    totalTime: 45,
    servings: 4
  });

  // Available options
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [availableMethods, setAvailableMethods] = useState<EnhancedCookingMethod[]>([]);
  
  // UI state
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState<string>('');
  const [methodSearchTerm, setMethodSearchTerm] = useState<string>('');
  const [draggedIngredient, setDraggedIngredient] = useState<number | null>(null);
  const [showElementalBalance, setShowElementalBalance] = useState<boolean>(false);

  // Load available ingredients and methods
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const ingredients = getAllIngredients();
        setAvailableIngredients(ingredients);
      } catch (error) {
        console.error('Failed to load ingredients:', error);
      }
    };

    const loadMethods = async () => {
      try {
        const methods = getAllEnhancedCookingMethods();
        setAvailableMethods(methods);
      } catch (error) {
        console.error('Failed to load cooking methods:', error);
      }
    };

    loadIngredients();
    loadMethods();
  }, []);

  // Initialize with provided ingredients and methods
  useEffect(() => {
    if (initialIngredients.length > 0) {
      const initialRecipeIngredients = initialIngredients.map(name => ({
        name,
        quantity: '1',
        unit: 'cup',
        timing: 'middle' as const,
        elementalProperties: availableIngredients.find(ing => ing.name === name)?.elementalProperties
      }));
      setSelectedIngredients(initialRecipeIngredients);
    }
  }, [initialIngredients, availableIngredients]);

  useEffect(() => {
    if (initialMethods.length > 0) {
      const initialCookingMethods = initialMethods.map(name => 
        availableMethods.find(method => method.name === name)
      ).filter(Boolean) as EnhancedCookingMethod[];
      setSelectedMethods(initialCookingMethods);
    }
  }, [initialMethods, availableMethods]);

  // Update total time when prep/cook time changes
  useEffect(() => {
    setTiming(prev => ({
      ...prev,
      totalTime: calculateTotalTime(prev.prepTime, prev.cookTime)
    }));
  }, [timing.prepTime, timing.cookTime]);

  // Ingredient management
  const addIngredient = useCallback((ingredient: any) => {
    const newIngredient: RecipeIngredient = {
      name: ingredient.name,
      quantity: '1',
      unit: 'cup',
      timing: 'middle',
      elementalProperties: ingredient.elementalProperties
    };
    setSelectedIngredients(prev => [...prev, newIngredient]);
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof RecipeIngredient, value: any) => {
    setSelectedIngredients(prev => prev.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    ));
  }, []);

  // Cooking method management
  const addCookingMethod = useCallback((method: EnhancedCookingMethod) => {
    if (!selectedMethods.find(m => m.id === method.id)) {
      setSelectedMethods(prev => [...prev, method]);
    }
  }, [selectedMethods]);

  const removeCookingMethod = useCallback((methodId: string) => {
    setSelectedMethods(prev => prev.filter(method => method.id !== methodId));
  }, []);

  // Instruction management
  const addInstruction = useCallback(() => {
    setInstructions(prev => [...prev, '']);
  }, []);

  const updateInstruction = useCallback((index: number, value: string) => {
    setInstructions(prev => prev.map((instruction, i) => 
      i === index ? value : instruction
    ));
  }, []);

  const removeInstruction = useCallback((index: number) => {
    setInstructions(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Automatic instruction generation based on culinary school standards
  const generateInstructions = useCallback(() => {
    if (selectedIngredients.length === 0 || selectedMethods.length === 0) {
      return ['Add ingredients and cooking methods to generate instructions.'];
    }

    const generatedInstructions: string[] = [];
    
    // Step 1: Preparation phase (mise en place - culinary school standard)
    const earlyIngredients = selectedIngredients.filter(ing => ing.timing === 'early');
    const middleIngredients = selectedIngredients.filter(ing => ing.timing === 'middle');
    const lateIngredients = selectedIngredients.filter(ing => ing.timing === 'late');
    
    if (earlyIngredients.length > 0) {
      const ingredientList = earlyIngredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join(', ');
      generatedInstructions.push(`Prepare your mise en place: ${ingredientList}. Clean, chop, and measure as needed. Set aside in separate bowls.`);
    }

    // Step 2: Equipment preparation (professional kitchen standard)
    const primaryMethod = selectedMethods[0];
    if (primaryMethod) {
      let equipmentInstruction = '';
      
      switch (primaryMethod.category) {
        case 'dry':
          equipmentInstruction = `Preheat your cooking surface for ${primaryMethod.name.toLowerCase()}. Allow proper heating time for even cooking. `;
          break;
        case 'wet':
          equipmentInstruction = `Prepare your liquid for ${primaryMethod.name.toLowerCase()}. Bring to appropriate temperature and maintain consistent heat. `;
          break;
        case 'combination':
          equipmentInstruction = `Set up for ${primaryMethod.name.toLowerCase()}, combining both dry and wet heat methods. Ensure proper temperature control. `;
          break;
        default:
          equipmentInstruction = `Prepare equipment for ${primaryMethod.name.toLowerCase()}. Check temperature and readiness. `;
      }
      
      generatedInstructions.push(equipmentInstruction);
    }

    // Step 3: Initial cooking phase with professional timing
    if (middleIngredients.length > 0) {
      const mainIngredients = middleIngredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join(', ');
      const cookingInstruction = `Add main ingredients in order: ${mainIngredients}. Cook according to each ingredient's requirements, monitoring for proper doneness indicators.`;
      generatedInstructions.push(cookingInstruction);
    }

    // Step 4: Cooking process with timing calculations and professional techniques
    const cookingTime = timing.cookTime;
    if (cookingTime > 0) {
      let timingInstruction = `Cook for approximately ${cookingTime} minutes`;
      
      // Add professional doneness indicators
      const donenessIndicators = [];
      if (selectedIngredients.some(ing => ing.name.toLowerCase().includes('onion'))) {
        donenessIndicators.push('onions are translucent');
      }
      if (selectedIngredients.some(ing => ing.name.toLowerCase().includes('garlic'))) {
        donenessIndicators.push('garlic is fragrant');
      }
      if (selectedIngredients.some(ing => ing.name.toLowerCase().includes('meat') || ing.name.toLowerCase().includes('chicken'))) {
        donenessIndicators.push('protein is properly cooked through');
      }
      
      if (selectedMethods.length > 1) {
        timingInstruction += `, transitioning between ${selectedMethods.map(m => m.name.toLowerCase()).join(' and ')} as needed`;
      }
      
      if (donenessIndicators.length > 0) {
        timingInstruction += `. Look for these doneness indicators: ${donenessIndicators.join(', ')}.`;
      } else {
        timingInstruction += '. Monitor progress and adjust heat as necessary.';
      }
      
      generatedInstructions.push(timingInstruction);
    }

    // Step 5: Final additions with professional timing
    if (lateIngredients.length > 0) {
      const lateIngredientList = lateIngredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join(', ');
      generatedInstructions.push(`In the final 2-3 minutes, add finishing ingredients: ${lateIngredientList}. These require minimal cooking time to preserve their properties.`);
    }

    // Step 6: Professional finishing techniques
    generatedInstructions.push(`Remove from heat and let rest for 2-3 minutes to allow flavors to meld. Taste and adjust seasoning with salt and pepper as needed.`);
    
    // Step 7: Plating and service (culinary school standard)
    const servingInstruction = `Serve immediately while hot. This recipe yields ${timing.servings} portions. ` +
      `For best presentation, warm serving plates and garnish as desired.`;
    generatedInstructions.push(servingInstruction);

    return generatedInstructions;
  }, [selectedIngredients, selectedMethods, timing]);

  // Serving size adjustment with professional scaling
  const adjustServingSize = useCallback((newServings: number) => {
    if (newServings <= 0) return;
    
    const ratio = newServings / timing.servings;
    
    // Adjust ingredient quantities with professional scaling considerations
    const adjustedIngredients = selectedIngredients.map(ingredient => {
      let adjustedQuantity = parseFloat(ingredient.quantity) * ratio;
      
      // Professional scaling rules for different ingredient types
      if (ingredient.name.toLowerCase().includes('salt') || 
          ingredient.name.toLowerCase().includes('pepper') ||
          ingredient.name.toLowerCase().includes('spice')) {
        // Seasonings scale less aggressively
        adjustedQuantity = parseFloat(ingredient.quantity) * Math.pow(ratio, 0.8);
      } else if (ingredient.name.toLowerCase().includes('herb')) {
        // Fresh herbs scale moderately
        adjustedQuantity = parseFloat(ingredient.quantity) * Math.pow(ratio, 0.9);
      }
      
      return {
        ...ingredient,
        quantity: adjustedQuantity.toFixed(2)
      };
    });
    
    // Adjust cooking times with professional scaling
    const timeRatio = Math.pow(ratio, 0.67); // Professional time scaling formula
    const adjustedTiming = {
      ...timing,
      servings: newServings,
      prepTime: Math.round(timing.prepTime * Math.pow(ratio, 0.5)), // Prep scales less
      cookTime: Math.round(timing.cookTime * timeRatio), // Cook time scales with volume
      totalTime: 0 // Will be recalculated
    };
    adjustedTiming.totalTime = adjustedTiming.prepTime + adjustedTiming.cookTime;
    
    setSelectedIngredients(adjustedIngredients);
    setTiming(adjustedTiming);
  }, [selectedIngredients, timing]);

  // Auto-generate instructions when ingredients or methods change
  const autoGenerateInstructions = useCallback(() => {
    const generated = generateInstructions();
    setInstructions(generated);
  }, [generateInstructions]);

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIngredient(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIngredient === null) return;

    const newIngredients = [...selectedIngredients];
    const draggedItem = newIngredients[draggedIngredient];
    newIngredients.splice(draggedIngredient, 1);
    newIngredients.splice(dropIndex, 0, draggedItem);
    
    setSelectedIngredients(newIngredients);
    setDraggedIngredient(null);
  }, [draggedIngredient, selectedIngredients]);

  // Recipe generation and saving
  const generateRecipe = useCallback(() => {
    const elementalProperties = calculateElementalProperties(selectedIngredients);
    const dominantElement = getDominantElement(elementalProperties);

    // Use generated instructions if current instructions are empty or default
    const finalInstructions = instructions.length === 1 && instructions[0] === '' 
      ? generateInstructions() 
      : instructions.filter(instruction => instruction.trim() !== '');

    const recipe: CustomRecipe = {
      id: generateRecipeId(),
      name: recipeName || 'Untitled Recipe',
      ingredients: selectedIngredients,
      methods: selectedMethods,
      instructions: finalInstructions,
      timing,
      servings: timing.servings,
      elementalProperties,
      dominantElement,
      astrologicalOptimization: {
        optimalTime: 'Current planetary alignment',
        planetaryHour: 'Mercury hour for preparation',
        lunarPhase: 'Waxing moon for growth',
        seasonalAlignment: 'Spring energy for new beginnings'
      }
    };

    if (onRecipeComplete) {
      onRecipeComplete(recipe);
    }

    return recipe;
  }, [recipeName, selectedIngredients, selectedMethods, instructions, timing, generateInstructions, onRecipeComplete]);

  // Recipe saving functionality
  const saveRecipe = useCallback(() => {
    const recipe = generateRecipe();
    if (onSave) {
      onSave(recipe);
    }
    
    // Save to localStorage with enhanced error handling
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      
      // Check if recipe with same name already exists
      const existingIndex = savedRecipes.findIndex((r: CustomRecipe) => r.name === recipe.name);
      if (existingIndex >= 0) {
        // Update existing recipe
        savedRecipes[existingIndex] = recipe;
        alert(`Recipe "${recipe.name}" updated successfully!`);
      } else {
        // Add new recipe
        savedRecipes.push(recipe);
        alert(`Recipe "${recipe.name}" saved successfully!`);
      }
      
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    } catch (error) {
      console.error('Failed to save recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  }, [generateRecipe, onSave]);

  // Recipe export functionality
  const exportRecipe = useCallback((format: 'json' | 'text' | 'markdown') => {
    const recipe = generateRecipe();
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(recipe, null, 2);
        filename = `${recipe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        mimeType = 'application/json';
        break;
        
      case 'text':
        content = formatRecipeAsText(recipe);
        filename = `${recipe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        mimeType = 'text/plain';
        break;
        
      case 'markdown':
        content = formatRecipeAsMarkdown(recipe);
        filename = `${recipe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        mimeType = 'text/markdown';
        break;
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateRecipe]);

  // Recipe sharing functionality
  const shareRecipe = useCallback(async () => {
    const recipe = generateRecipe();
    const shareableText = formatRecipeAsText(recipe);
    
    if (navigator.share) {
      // Use native sharing if available
      try {
        await navigator.share({
          title: recipe.name,
          text: shareableText,
        });
      } catch (error) {
        console.log('Sharing cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareableText);
        alert('Recipe copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Final fallback: show in modal/alert
        prompt('Copy this recipe text:', shareableText);
      }
    }
  }, [generateRecipe]);

  // Load saved recipes
  const loadSavedRecipes = useCallback(() => {
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      return savedRecipes;
    } catch (error) {
      console.error('Failed to load saved recipes:', error);
      return [];
    }
  }, []);

  // Delete saved recipe
  const deleteSavedRecipe = useCallback((recipeId: string) => {
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      const filteredRecipes = savedRecipes.filter((recipe: CustomRecipe) => recipe.id !== recipeId);
      localStorage.setItem('savedRecipes', JSON.stringify(filteredRecipes));
      return true;
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      return false;
    }
  }, []);

  // Load recipe from saved data
  const loadRecipe = useCallback((recipe: CustomRecipe) => {
    setRecipeName(recipe.name);
    setSelectedIngredients(recipe.ingredients);
    setSelectedMethods(recipe.methods);
    setInstructions(recipe.instructions);
    setTiming(recipe.timing);
  }, []);

  // Filter ingredients based on search term
  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
  );

  // Filter methods based on search term
  const filteredMethods = availableMethods.filter(method =>
    method.name.toLowerCase().includes(methodSearchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestaurantIcon />
        Recipe Builder
      </Typography>

      {/* Recipe Name */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Recipe Name"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="Enter your recipe name..."
            variant="outlined"
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column - Ingredient Selection */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              
              {/* Ingredient Search */}
              <Autocomplete
                options={filteredIngredients}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search ingredients..."
                    variant="outlined"
                    fullWidth
                  />
                )}
                onChange={(_, value) => {
                  if (value) {
                    addIngredient(value);
                  }
                }}
                sx={{ mb: 2 }}
              />

              {/* Selected Ingredients with Drag & Drop */}
              <Typography variant="subtitle1" gutterBottom>
                Selected Ingredients ({selectedIngredients.length})
              </Typography>
              
              {selectedIngredients.length === 0 ? (
                <Alert severity="info">
                  No ingredients selected. Search and select ingredients above.
                </Alert>
              ) : (
                <List>
                  {selectedIngredients.map((ingredient, index) => (
                    <ListItem
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      sx={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1, 
                        mb: 1,
                        cursor: 'move',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    >
                      <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <ListItemText
                        primary={ingredient.name}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <TextField
                              size="small"
                              label="Quantity"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                              sx={{ width: 80 }}
                            />
                            <FormControl size="small" sx={{ width: 80 }}>
                              <InputLabel>Unit</InputLabel>
                              <Select
                                value={ingredient.unit}
                                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                              >
                                <MenuItem value="cup">cup</MenuItem>
                                <MenuItem value="tbsp">tbsp</MenuItem>
                                <MenuItem value="tsp">tsp</MenuItem>
                                <MenuItem value="oz">oz</MenuItem>
                                <MenuItem value="lb">lb</MenuItem>
                                <MenuItem value="g">g</MenuItem>
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="piece">piece</MenuItem>
                              </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ width: 100 }}>
                              <InputLabel>Timing</InputLabel>
                              <Select
                                value={ingredient.timing}
                                onChange={(e) => updateIngredient(index, 'timing', e.target.value)}
                              >
                                <MenuItem value="early">Early</MenuItem>
                                <MenuItem value="middle">Middle</MenuItem>
                                <MenuItem value="late">Late</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => removeIngredient(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Methods and Instructions */}
        <Grid item xs={12} md={6}>
          {/* Cooking Methods */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cooking Methods
              </Typography>
              
              <Autocomplete
                options={filteredMethods}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search cooking methods..."
                    variant="outlined"
                    fullWidth
                  />
                )}
                onChange={(_, value) => {
                  if (value) {
                    addCookingMethod(value);
                  }
                }}
                sx={{ mb: 2 }}
              />

              {selectedMethods.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Methods
                  </Typography>
                  {selectedMethods.map((method) => (
                    <Chip
                      key={method.id}
                      label={method.name}
                      onDelete={() => removeCookingMethod(method.id)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Recipe Timing */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon />
                Recipe Timing
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography gutterBottom>Prep Time: {timing.prepTime} min</Typography>
                  <Slider
                    value={timing.prepTime}
                    onChange={(_, value) => setTiming(prev => ({ ...prev, prepTime: value as number }))}
                    min={5}
                    max={120}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography gutterBottom>Cook Time: {timing.cookTime} min</Typography>
                  <Slider
                    value={timing.cookTime}
                    onChange={(_, value) => setTiming(prev => ({ ...prev, cookTime: value as number }))}
                    min={5}
                    max={240}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Total Time: {timing.totalTime} min
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Servings"
                      type="number"
                      value={timing.servings}
                      onChange={(e) => {
                        const newServings = parseInt(e.target.value) || 1;
                        adjustServingSize(newServings);
                      }}
                      inputProps={{ min: 1, max: 20 }}
                      sx={{ width: 100 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      (Auto-adjusts quantities)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              
              {/* Auto-generate instructions button */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={autoGenerateInstructions}
                  disabled={selectedIngredients.length === 0 || selectedMethods.length === 0}
                  startIcon={<RestaurantIcon />}
                  size="small"
                >
                  Auto-Generate Instructions
                </Button>
                <Button
                  variant="text"
                  onClick={() => setInstructions([''])}
                  size="small"
                >
                  Clear All
                </Button>
              </Box>
              
              {instructions.map((instruction, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`Step ${index + 1}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder="Enter cooking instruction..."
                  />
                  <IconButton 
                    onClick={() => removeInstruction(index)}
                    color="error"
                    disabled={instructions.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addInstruction}
                variant="outlined"
                fullWidth
              >
                Add Step
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Elemental Balance (Optional) */}
      {showElementalBalance && selectedIngredients.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Elemental Balance
            </Typography>
            {(() => {
              const elementalProps = calculateElementalProperties(selectedIngredients);
              return (
                <Grid container spacing={2}>
                  {Object.entries(elementalProps).map(([element, value]) => (
                    <Grid item xs={3} key={element}>
                      <Typography variant="body2">
                        {element}: {Math.round(value * 100)}%
                      </Typography>
                      <Box sx={{ width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 1 }}>
                        <Box 
                          sx={{ 
                            width: `${value * 100}%`, 
                            height: '100%', 
                            backgroundColor: element === 'Fire' ? '#ff5722' : 
                                           element === 'Water' ? '#2196f3' :
                                           element === 'Earth' ? '#4caf50' : '#9c27b0',
                            borderRadius: 1
                          }} 
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => setShowElementalBalance(!showElementalBalance)}
        >
          {showElementalBalance ? 'Hide' : 'Show'} Elemental Balance
        </Button>
        <Button
          variant="contained"
          onClick={generateRecipe}
          startIcon={<RestaurantIcon />}
          disabled={selectedIngredients.length === 0}
        >
          Generate Recipe
        </Button>
        <Button
          variant="contained"
          onClick={saveRecipe}
          startIcon={<SaveIcon />}
          disabled={selectedIngredients.length === 0}
          color="success"
        >
          Save Recipe
        </Button>
        <Button
          variant="contained"
          onClick={shareRecipe}
          startIcon={<ShareIcon />}
          disabled={selectedIngredients.length === 0}
          color="primary"
        >
          Share Recipe
        </Button>
        <Button
          variant="outlined"
          onClick={() => exportRecipe('text')}
          disabled={selectedIngredients.length === 0}
        >
          Export as Text
        </Button>
        <Button
          variant="outlined"
          onClick={() => exportRecipe('json')}
          disabled={selectedIngredients.length === 0}
        >
          Export as JSON
        </Button>
        <Button
          variant="outlined"
          onClick={() => exportRecipe('markdown')}
          disabled={selectedIngredients.length === 0}
        >
          Export as Markdown
        </Button>
      </Box>
    </Box>
  );
}