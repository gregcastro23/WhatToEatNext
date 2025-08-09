'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';

import { logger } from '@/utils/logger';

interface RecipeBuilderProps {
  initialIngredients?: string[];
  initialMethods?: string[];
  onRecipeComplete?: (recipe: any) => void;
  onSave?: (recipe: any) => void;
}

interface RecipeIngredient {
  name: string;
  quantity: string;
  preparation: string;
}

interface RecipeStep {
  step: number;
  instruction: string;
  timing?: string;
}

const RecipeBuilderSimple: React.FC<RecipeBuilderProps> = memo(function RecipeBuilderSimple({
  initialIngredients = [],
  initialMethods = [],
  onRecipeComplete,
  onSave,
}) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);

  const addIngredient = useCallback(() => {
    setIngredients(prev => [...prev, { name: '', quantity: '', preparation: '' }]);
  }, []);

  const updateIngredient = useCallback(
    (index: number, field: keyof RecipeIngredient, value: string) => {
      setIngredients(prev =>
        prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
      );
    },
    [],
  );

  const removeIngredient = useCallback((index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addStep = useCallback(() => {
    setSteps(prev => [...prev, { step: prev.length + 1, instruction: '', timing: '' }]);
  }, []);

  const updateStep = useCallback(
    (index: number, field: keyof RecipeStep, value: string | number) => {
      setSteps(prev => prev.map((step, i) => (i === index ? { ...step, [field]: value } : step)));
    },
    [],
  );

  const removeStep = useCallback((index: number) => {
    setSteps(prev =>
      prev.filter((_, i) => i !== index).map((step, i) => ({ ...step, step: i + 1 })),
    );
  }, []);

  // Memoize expensive calculations
  const totalTime = useMemo(() => prepTime + cookTime, [prepTime, cookTime]);

  const isRecipeValid = useMemo(
    () => recipeName.trim() && ingredients.length > 0 && steps.length > 0,
    [recipeName, ingredients.length, steps.length],
  );

  const recipeSummary = useMemo(
    () => ({
      name: recipeName,
      servings,
      totalTime,
      ingredientCount: ingredients.length,
      stepCount: steps.length,
    }),
    [recipeName, servings, totalTime, ingredients.length, steps.length],
  );

  const saveRecipe = useCallback(() => {
    const recipe = {
      id: `recipe_${Date.now()}`,
      name: recipeName || 'Untitled Recipe',
      ingredients,
      steps,
      servings,
      prepTime,
      cookTime,
      totalTime,
      createdAt: new Date().toISOString(),
    };

    logger.info('Saving recipe:', recipe);
    onSave?.(recipe);
    onRecipeComplete?.(recipe);
  }, [
    recipeName,
    ingredients,
    steps,
    servings,
    prepTime,
    cookTime,
    totalTime,
    onSave,
    onRecipeComplete,
  ]);

  return (
    <div className='rounded-lg bg-white p-6 shadow-md'>
      <div className='mb-6'>
        <h3 className='mb-4 text-xl font-semibold text-gray-800'>Create Your Recipe</h3>

        {/* Recipe Name */}
        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>Recipe Name</label>
          <input
            type='text'
            value={recipeName}
            onChange={e => setRecipeName(e.target.value)}
            placeholder='Enter recipe name...'
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>

        {/* Recipe Details */}
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Servings</label>
            <input
              type='number'
              value={servings}
              onChange={e => setServings(parseInt(e.target.value) || 1)}
              min='1'
              max='20'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Prep Time (min)</label>
            <input
              type='number'
              value={prepTime}
              onChange={e => setPrepTime(parseInt(e.target.value) || 0)}
              min='0'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Cook Time (min)</label>
            <input
              type='number'
              value={cookTime}
              onChange={e => setCookTime(parseInt(e.target.value) || 0)}
              min='0'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className='mb-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h4 className='text-lg font-medium text-gray-800'>Ingredients</h4>
          <button
            onClick={addIngredient}
            className='rounded bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700'
          >
            Add Ingredient
          </button>
        </div>

        {ingredients.length === 0 ? (
          <p className='py-4 text-center text-gray-500'>
            No ingredients added yet. Click "Add Ingredient" to start.
          </p>
        ) : (
          <div className='space-y-3'>
            {ingredients.map((ingredient, index) => (
              <div key={index} className='flex items-center gap-3 rounded bg-gray-50 p-3'>
                <input
                  type='text'
                  value={ingredient.quantity}
                  onChange={e => updateIngredient(index, 'quantity', e.target.value)}
                  placeholder='1 cup'
                  className='w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500'
                />
                <input
                  type='text'
                  value={ingredient.name}
                  onChange={e => updateIngredient(index, 'name', e.target.value)}
                  placeholder='Ingredient name'
                  className='flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500'
                />
                <input
                  type='text'
                  value={ingredient.preparation}
                  onChange={e => updateIngredient(index, 'preparation', e.target.value)}
                  placeholder='diced, chopped...'
                  className='w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500'
                />
                <button
                  onClick={() => removeIngredient(index)}
                  className='p-1 text-red-600 hover:text-red-800'
                  title='Remove ingredient'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div className='mb-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h4 className='text-lg font-medium text-gray-800'>Instructions</h4>
          <button
            onClick={addStep}
            className='rounded bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700'
          >
            Add Step
          </button>
        </div>

        {steps.length === 0 ? (
          <p className='py-4 text-center text-gray-500'>
            No steps added yet. Click "Add Step" to start.
          </p>
        ) : (
          <div className='space-y-3'>
            {steps.map((step, index) => (
              <div key={index} className='flex items-start gap-3 rounded bg-gray-50 p-3'>
                <span className='mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white'>
                  {step.step}
                </span>
                <textarea
                  value={step.instruction}
                  onChange={e => updateStep(index, 'instruction', e.target.value)}
                  placeholder='Describe this step...'
                  rows={2}
                  className='flex-1 resize-none rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500'
                />
                <input
                  type='text'
                  value={step.timing || ''}
                  onChange={e => updateStep(index, 'timing', e.target.value)}
                  placeholder='5 min'
                  className='w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500'
                />
                <button
                  onClick={() => removeStep(index)}
                  className='p-1 text-red-600 hover:text-red-800'
                  title='Remove step'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className='flex justify-end'>
        <button
          onClick={saveRecipe}
          disabled={!isRecipeValid}
          className='rounded bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400'
        >
          Save Recipe
        </button>
      </div>

      {/* Recipe Summary */}
      {recipeSummary.name && recipeSummary.ingredientCount > 0 && (
        <div className='mt-6 rounded-lg bg-indigo-50 p-4'>
          <h5 className='mb-2 font-medium text-indigo-800'>Recipe Summary</h5>
          <div className='text-sm text-indigo-700'>
            <p>
              <strong>{recipeSummary.name}</strong>
            </p>
            <p>
              Serves {recipeSummary.servings} • Total time: {recipeSummary.totalTime} minutes
            </p>
            <p>
              {recipeSummary.ingredientCount} ingredients • {recipeSummary.stepCount} steps
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default RecipeBuilderSimple;
