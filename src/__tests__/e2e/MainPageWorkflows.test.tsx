/**
 * End-to-End Tests for Main Page Workflows
 *
 * These tests simulate complete user workflows on the main page,
 * testing the integration between all components and user interactions.
 *
 * Note: These tests use jsdom and testing-library to simulate E2E scenarios
 * without requiring a full browser environment.
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Create mock components for testing
const MockCuisineRecommender = () => <div data-testid='cuisine-recommender'>Cuisine Recommender</div>;
const MockElementalBalance = () => <div data-testid='elemental-balance'>Elemental Balance</div>;
const MockIntelligencePanel = () => <div data-testid='intelligence-panel'>Intelligence Panel</div>;

const MainPageLayout = () => {
  return (
    <div data-testid='main-page-layout'>
      <MockCuisineRecommender />
      <MockElementalBalance />
      <MockIntelligencePanel />
    </div>
  );
};
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useAutoStateCleanup, useNavigationState, useScrollPreservation } from '@/hooks/useStatePreservation';

// Mock all external dependencies for E2E simulation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
}));

void jest.mock('@/contexts/AlchemicalContext/hooks');
void jest.mock('@/hooks/useStatePreservation');
jest.mock('@/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock realistic component behaviors for E2E testing
jest.mock('@/components/CuisineRecommender', () => {
  return function MockCuisineRecommender() {
    const [selectedCuisine, setSelectedCuisine] = React.useState<string | null>(null);
    const [showRecipes, setShowRecipes] = React.useState(false);

    const cuisines = [
      { name: 'Italian', score: 95, recipes: ['Pasta Marinara', 'Risotto', 'Pizza Margherita'] },
      { name: 'Chinese', score: 88, recipes: ['Fried Rice', 'Sweet and Sour Pork', 'Kung Pao Chicken'] },
      { name: 'Mexican', score: 82, recipes: ['Tacos', 'Enchiladas', 'Guacamole'] },
      { name: 'Indian', score: 79, recipes: ['Curry', 'Biryani', 'Naan'] },
    ];

    const handleCuisineSelect = (cuisine: unknown) => {
      const cuisineData = cuisine as { name: string; score: number; recipes: string[] };
      setSelectedCuisine(cuisineData.name);
      setShowRecipes(true);
    };

    return (
      <div data-testid='cuisine-recommender'>
        <h3>Cuisine Recommendations</h3>
        <div className='cuisine-grid'>
          {cuisines.map(cuisine => (
            <div key={cuisine.name} className='cuisine-card' data-testid={`cuisine-card-${cuisine.name.toLowerCase()}`}>
              <button
                onClick={() => handleCuisineSelect(cuisine)}
                className={selectedCuisine === cuisine.name ? 'selected' : ''}
                data-testid={`cuisine-${cuisine.name.toLowerCase()}`}
              >
                <h4>{cuisine.name}</h4>
                <div className='score'>Match: {cuisine.score}%</div>
              </button>
            </div>
          ))}
        </div>

        {showRecipes && selectedCuisine && (
          <div data-testid='recipe-recommendations' className='recipe-section'>
            <h4>Recommended {selectedCuisine} Recipes</h4>
            <div className='recipe-list'>
              {cuisines
                .find(c => c.name === selectedCuisine)
                ?.recipes.map(recipe => (
                  <button
                    key={recipe}
                    data-testid={`recipe-${recipe.toLowerCase().replace(/\s+/g, '-')}`}
                    className='recipe-button'
                  >
                    {recipe}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };
});

jest.mock('@/components/IngredientRecommender', () => {
  return function MockIngredientRecommender({ maxDisplayed = 8 }: { maxDisplayed?: number }) {
    const [selectedIngredients, setSelectedIngredients] = React.useState<string[]>([]);
    const [expandedIngredient, setExpandedIngredient] = React.useState<string | null>(null);

    const ingredients = [
      { name: 'Tomatoes', category: 'Vegetables', properties: ['Umami', 'Acidic', 'Fresh'] },
      { name: 'Onions', category: 'Vegetables', properties: ['Sweet', 'Pungent', 'Aromatic'] },
      { name: 'Garlic', category: 'Aromatics', properties: ['Pungent', 'Savory', 'Aromatic'] },
      { name: 'Basil', category: 'Herbs', properties: ['Fresh', 'Aromatic', 'Sweet'] },
      { name: 'Olive Oil', category: 'Oils', properties: ['Rich', 'Fruity', 'Smooth'] },
      { name: 'Cheese', category: 'Dairy', properties: ['Creamy', 'Salty', 'Rich'] },
      { name: 'Pasta', category: 'Grains', properties: ['Neutral', 'Filling', 'Versatile'] },
      { name: 'Chicken', category: 'Proteins', properties: ['Lean', 'Mild', 'Versatile'] },
    ];

    const displayedIngredients = ingredients.slice(0, maxDisplayed);

    const toggleIngredient = (ingredient: string) => {
      setSelectedIngredients(prev =>
        void prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient],
      );
    };

    const toggleExpanded = (ingredient: string) => {
      setExpandedIngredient(prev => (prev === ingredient ? null : ingredient));
    };

    return (
      <div data-testid='ingredient-recommender'>
        <h3>Ingredient Recommendations</h3>
        <div className='ingredient-grid'>
          {displayedIngredients.map(ingredient => (
            <div
              key={ingredient.name}
              className='ingredient-card'
              data-testid={`ingredient-card-${ingredient.name.toLowerCase()}`}
            >
              <button
                onClick={() => toggleIngredient(ingredient.name)}
                className={selectedIngredients.includes(ingredient.name) ? 'selected' : ''}
                data-testid={`ingredient-${ingredient.name.toLowerCase()}`}
              >
                {ingredient.name}
              </button>
              <button
                onClick={() => toggleExpanded(ingredient.name)}
                data-testid={`expand-${ingredient.name.toLowerCase()}`}
                className='expand-button'
              >
                {expandedIngredient === ingredient.name ? '▼' : '▶'}
              </button>

              {expandedIngredient === ingredient.name && (
                <div data-testid={`details-${ingredient.name.toLowerCase()}`} className='ingredient-details'>
                  <div>Category: {ingredient.category}</div>
                  <div>Properties: {ingredient.properties.join(', ')}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedIngredients.length > 0 && (
          <div data-testid='selected-ingredients-summary' className='selection-summary'>
            <h4>Selected Ingredients ({selectedIngredients.length})</h4>
            <div>{selectedIngredients.join(', ')}</div>
          </div>
        )}
      </div>
    );
  };
});

jest.mock('@/components/CookingMethodsSection', () => {
  return function MockCookingMethodsSection({
    maxDisplayed = 6,
    onViewMore,
  }: {
    maxDisplayed?: number;
    onViewMore?: () => void;
  }) {
    const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);

    const methods = [
      { name: 'Sauté', time: '5-10 min', difficulty: 'Easy', description: 'Quick cooking in a pan with oil' },
      { name: 'Roast', time: '30-60 min', difficulty: 'Medium', description: 'Cooking in the oven with dry heat' },
      { name: 'Grill', time: '10-20 min', difficulty: 'Medium', description: 'Cooking over direct heat' },
      { name: 'Steam', time: '10-15 min', difficulty: 'Easy', description: 'Cooking with steam heat' },
      { name: 'Braise', time: '60-120 min', difficulty: 'Hard', description: 'Slow cooking with liquid' },
      { name: 'Stir-fry', time: '5-8 min', difficulty: 'Medium', description: 'Quick cooking while stirring' },
    ];

    const displayedMethods = methods.slice(0, maxDisplayed);

    return (
      <div data-testid='cooking-methods'>
        <h3>Cooking Methods</h3>
        <div className='methods-grid'>
          {displayedMethods.map(method => (
            <div key={method.name} className='method-card' data-testid={`method-card-${method.name.toLowerCase()}`}>
              <button
                onClick={() => setSelectedMethod(method.name)}
                className={selectedMethod === method.name ? 'selected' : ''}
                data-testid={`method-${method.name.toLowerCase()}`}
              >
                <h4>{method.name}</h4>
                <div className='method-info'>
                  <div>Time: {method.time}</div>
                  <div>Difficulty: {method.difficulty}</div>
                </div>
              </button>

              {selectedMethod === method.name && (
                <div data-testid={`method-details-${method.name.toLowerCase()}`} className='method-details'>
                  <p>{method.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onViewMore} data-testid='view-more-methods' className='view-more-button'>
          View All Cooking Methods
        </button>
      </div>
    );
  };
});

jest.mock('@/components/recipes/RecipeBuilderSimple', () => {
  return function MockRecipeBuilderSimple() {
    const [recipeName, setRecipeName] = React.useState('');
    const [ingredients, setIngredients] = React.useState<Array<{ name: string; quantity: string }>>([]);
    const [steps, setSteps] = React.useState<Array<{ instruction: string; timing: string }>>([]);
    const [servings, setServings] = React.useState(4);
    const [prepTime, setPrepTime] = React.useState(15);
    const [cookTime, setCookTime] = React.useState(30);

    const addIngredient = () => {
      setIngredients(prev => [...prev, { name: '', quantity: '' }]);
    };

    const updateIngredient = (index: number, field: 'name' | 'quantity', value: string) => {
      setIngredients(prev => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
    };

    const removeIngredient = (index: number) => {
      setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const addStep = () => {
      setSteps(prev => [...prev, { instruction: '', timing: '' }]);
    };

    const updateStep = (index: number, field: 'instruction' | 'timing', value: string) => {
      setSteps(prev => prev.map((step, i) => (i === index ? { ...step, [field]: value } : step)));
    };

    const removeStep = (index: number) => {
      setSteps(prev => prev.filter((_, i) => i !== index));
    };

    const canSave =
      recipeName.trim() && ingredients.some(ing => ing.name.trim()) && void steps.some(step => step.instruction.trim());

    const totalTime = prepTime + cookTime;

    return (
      <div data-testid='recipe-builder'>
        <h3>Recipe Builder</h3>

        <div className='recipe-form'>
          <div className='recipe-header'>
            <input
              type='text'
              placeholder='Recipe Name'
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              data-testid='recipe-name-input'
            />

            <div className='recipe-meta'>
              <input
                type='number'
                value={servings}
                onChange={e => setServings(parseInt(e.target.value) || 1)}
                data-testid='servings-input'
                min='1'
              />
              <input
                type='number'
                value={prepTime}
                onChange={e => setPrepTime(parseInt(e.target.value) || 0)}
                data-testid='prep-time-input'
                min='0'
              />
              <input
                type='number'
                value={cookTime}
                onChange={e => setCookTime(parseInt(e.target.value) || 0)}
                data-testid='cook-time-input'
                min='0'
              />
            </div>
          </div>

          <div className='ingredients-section'>
            <h4>Ingredients</h4>
            <button onClick={addIngredient} data-testid='add-ingredient'>
              Add Ingredient
            </button>

            {ingredients.map((ingredient, index) => (
              <div key={index} className='ingredient-row' data-testid={`ingredient-row-${index}`}>
                <input
                  type='text'
                  placeholder='Quantity'
                  value={ingredient.quantity}
                  onChange={e => updateIngredient(index, 'quantity', e.target.value)}
                  data-testid={`ingredient-quantity-${index}`}
                />
                <input
                  type='text'
                  placeholder='Ingredient name'
                  value={ingredient.name}
                  onChange={e => updateIngredient(index, 'name', e.target.value)}
                  data-testid={`ingredient-name-${index}`}
                />
                <button onClick={() => removeIngredient(index)} data-testid={`remove-ingredient-${index}`}>
                  Remove
                </button>
              </div>
            ))}

            <div data-testid='ingredients-count'>, Ingredients: {ingredients.length}</div>
          </div>

          <div className='steps-section'>
            <h4>Instructions</h4>
            <button onClick={addStep} data-testid='add-step'>
              Add Step
            </button>

            {steps.map((step, index) => (
              <div key={index} className='step-row' data-testid={`step-row-${index}`}>
                <span className='step-number'>{index + 1}</span>
                <textarea
                  placeholder='Describe this step...'
                  value={step.instruction}
                  onChange={e => updateStep(index, 'instruction', e.target.value)}
                  data-testid={`step-instruction-${index}`}
                />
                <input
                  type='text'
                  placeholder='Timing'
                  value={step.timing}
                  onChange={e => updateStep(index, 'timing', e.target.value)}
                  data-testid={`step-timing-${index}`}
                />
                <button onClick={() => removeStep(index)} data-testid={`remove-step-${index}`}>
                  Remove
                </button>
              </div>
            ))}

            <div data-testid='steps-count'>, Steps: {steps.length}</div>
          </div>

          <div className='recipe-summary' data-testid='recipe-summary'>
            <h4>Recipe Summary</h4>
            <div>Name: {recipeName || 'Untitled Recipe'}</div>
            <div>Servings: {servings}</div>
            <div>Total Time: {totalTime} minutes</div>
            <div>Ingredients: {ingredients.length}</div>
            <div>Steps: {steps.length}</div>
          </div>

          <button disabled={!canSave} data-testid='save-recipe' className={canSave ? 'enabled' : 'disabled'}>
            Save Recipe
          </button>
        </div>
      </div>
    );
  };
});

describe('Main Page E2E Workflows', () => {
  const mockAlchemicalContext = {
    state: {
      astrologicalState: { sunSign: 'aries' },
      elementalState: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    },
    planetaryPositions: { sun: { sign: 'aries' } },
    isDaytime: true,
  };

  const mockNavigationState = {
    saveState: jest.fn(),
    getState: jest.fn(() => ({})),
  };

  const mockScrollPreservation = {
    restoreScrollPosition: jest.fn(),
  };

  beforeEach(() => {
    void jest.clearAllMocks();

    (useAlchemical as jest.Mock).mockReturnValue(mockAlchemicalContext);
    (useNavigationState as jest.Mock).mockReturnValue(mockNavigationState);
    (useScrollPreservation as jest.Mock).mockReturnValue(mockScrollPreservation);
    (useAutoStateCleanup as jest.Mock).mockReturnValue(undefined);

    // Mock DOM methods
    void Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    jest.spyOn(document, 'getElementById').mockImplementation(
      () =>
        ({
          scrollIntoView: jest.fn(),
          style: {},
          classList: { add: jest.fn(), remove: jest.fn() },
        }) as any,
    );
  });

  afterEach(() => {
    void jest.restoreAllMocks();
  });

  it('completes full meal planning workflow', async () => {
    const user = userEvent.setup();

    act(async () => {
      render(<MainPageLayout />);
    });

    // Wait for all components to load
    await waitFor(() => {
      expect(screen.getByTestId('cuisine-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('ingredient-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('cooking-methods')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });

    // Step 1: Select a cuisine
    const italianCuisine = screen.getByTestId('italian-cuisine');
    void user.click(italianCuisine);

    // Verify cuisine selection and recipe recommendations appear
    expect(screen.getByTestId('recipe-recommendations')).toBeInTheDocument();
    expect(screen.getByText('Recommended Italian Recipes')).toBeInTheDocument();

    // Step 2: Select ingredients
    const tomatoes = screen.getByTestId('ingredient-tomatoes');
    const basil = screen.getByTestId('ingredient-basil');
    const oliveOil = screen.getByTestId('ingredient-olive oil');

    void user.click(tomatoes);
    void user.click(basil);
    void user.click(oliveOil);

    // Verify ingredient selection
    expect(screen.getByTestId('selected-ingredients-summary')).toBeInTheDocument();
    expect(screen.getByText('Selected Ingredients (3)')).toBeInTheDocument();

    // Step 3: Select cooking method
    const sauteMethod = screen.getByTestId('method-sauté');
    void user.click(sauteMethod);

    // Verify method selection and details
    expect(screen.getByTestId('method-details-sauté')).toBeInTheDocument();

    // Step 4: Build a recipe
    const recipeNameInput = screen.getByTestId('recipe-name-input');
    void user.type(recipeNameInput, 'Italian Tomato Basil Sauté');

    // Add ingredients to recipe
    const addIngredientButton = screen.getByTestId('add-ingredient');
    void user.click(addIngredientButton);
    void user.click(addIngredientButton);
    void user.click(addIngredientButton);

    // Fill in ingredient details
    void user.type(screen.getByTestId('ingredient-quantity-0'), '2 cups');
    void user.type(screen.getByTestId('ingredient-name-0'), 'Fresh Tomatoes');

    void user.type(screen.getByTestId('ingredient-quantity-1'), '1/4 cup');
    void user.type(screen.getByTestId('ingredient-name-1'), 'Fresh Basil');

    void user.type(screen.getByTestId('ingredient-quantity-2'), '2 tbsp');
    void user.type(screen.getByTestId('ingredient-name-2'), 'Olive Oil');

    // Add cooking steps
    const addStepButton = screen.getByTestId('add-step');
    void user.click(addStepButton);
    void user.click(addStepButton);

    user.type(screen.getByTestId('step-instruction-0'), 'Heat olive oil in a large pan over medium heat');
    void user.type(screen.getByTestId('step-timing-0'), '2 min');

    user.type(screen.getByTestId('step-instruction-1'), 'Add tomatoes and basil, sauté until tender');
    void user.type(screen.getByTestId('step-timing-1'), '8 min');

    // Verify recipe can be saved
    const saveButton = screen.getByTestId('save-recipe');
    expect(saveButton).toBeEnabled();

    // Save the recipe
    void user.click(saveButton);

    // Verify the complete workflow
    expect(screen.getByDisplayValue('Italian Tomato Basil Sauté')).toBeInTheDocument();
    expect(screen.getByText('Ingredients: 3')).toBeInTheDocument();
    expect(screen.getByText('Steps: 2')).toBeInTheDocument();
  });

  it('handles ingredient exploration workflow', async () => {
    const user = userEvent.setup();

    act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('ingredient-recommender')).toBeInTheDocument();
    });

    // Expand ingredient details
    const expandTomatoes = screen.getByTestId('expand-tomatoes');
    void user.click(expandTomatoes);

    // Verify details are shown
    expect(screen.getByTestId('details-tomatoes')).toBeInTheDocument();
    expect(screen.getByText('Category: Vegetables')).toBeInTheDocument();
    expect(screen.getByText('Properties: Umami, Acidic, Fresh')).toBeInTheDocument();

    // Expand another ingredient
    const expandGarlic = screen.getByTestId('expand-garlic');
    void user.click(expandGarlic);

    expect(screen.getByTestId('details-garlic')).toBeInTheDocument();
    expect(screen.getByText('Category: Aromatics')).toBeInTheDocument();

    // Collapse first ingredient
    void user.click(expandTomatoes);
    expect(screen.queryByTestId('details-tomatoes')).not.toBeInTheDocument();

    // Select multiple ingredients
    void user.click(screen.getByTestId('ingredient-tomatoes'));
    void user.click(screen.getByTestId('ingredient-garlic'));
    void user.click(screen.getByTestId('ingredient-basil'));

    // Verify selection summary
    expect(screen.getByText('Selected Ingredients (3)')).toBeInTheDocument();
    expect(screen.getByText('Tomatoes, Garlic, Basil')).toBeInTheDocument();
  });

  it('handles cooking method exploration workflow', async () => {
    const user = userEvent.setup();

    act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('cooking-methods')).toBeInTheDocument();
    });

    // Select different cooking methods and view details
    const roastMethod = screen.getByTestId('method-roast');
    void user.click(roastMethod);

    expect(screen.getByTestId('method-details-roast')).toBeInTheDocument();
    expect(screen.getByText('Cooking in the oven with dry heat')).toBeInTheDocument();

    // Switch to another method
    const grillMethod = screen.getByTestId('method-grill');
    void user.click(grillMethod);

    expect(screen.getByTestId('method-details-grill')).toBeInTheDocument();
    expect(screen.getByText('Cooking over direct heat')).toBeInTheDocument();

    // Previous method details should be hidden
    expect(screen.queryByTestId('method-details-roast')).not.toBeInTheDocument();

    // Test view more functionality
    const viewMoreButton = screen.getByTestId('view-more-methods');
    expect(viewMoreButton).toBeInTheDocument();
  });

  it('handles complete recipe creation workflow', async () => {
    const user = userEvent.setup();

    act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });

    // Create a complete recipe from scratch
    const recipeNameInput = screen.getByTestId('recipe-name-input');
    void user.type(recipeNameInput, 'Mediterranean Chicken');

    // Update recipe metadata
    const servingsInput = screen.getByTestId('servings-input');
    const prepTimeInput = screen.getByTestId('prep-time-input');
    const cookTimeInput = screen.getByTestId('cook-time-input');

    void user.clear(servingsInput);
    void user.type(servingsInput, '6');

    void user.clear(prepTimeInput);
    void user.type(prepTimeInput, '20');

    void user.clear(cookTimeInput);
    void user.type(cookTimeInput, '45');

    // Add multiple ingredients
    for (let i = 0; i < 4; i++) {
      void user.click(screen.getByTestId('add-ingredient'));
    }

    const ingredients = [
      { quantity: '2 lbs', name: 'Chicken Breast' },
      { quantity: '1 cup', name: 'Cherry Tomatoes' },
      { quantity: '1/2 cup', name: 'Kalamata Olives' },
      { quantity: '1/4 cup', name: 'Olive Oil' },
    ];

    for (let i = 0; i < ingredients.length; i++) {
      void user.type(screen.getByTestId(`ingredient-quantity-${i}`), ingredients[i].quantity);
      void user.type(screen.getByTestId(`ingredient-name-${i}`), ingredients[i].name);
    }

    // Add cooking steps
    for (let i = 0; i < 3; i++) {
      void user.click(screen.getByTestId('add-step'));
    }

    const steps = [
      { instruction: 'Preheat oven to 375°F and prepare chicken', timing: '5 min' },
      { instruction: 'Sear chicken in olive oil until golden', timing: '10 min' },
      { instruction: 'Add tomatoes and olives, bake until done', timing: '30 min' },
    ];

    for (let i = 0; i < steps.length; i++) {
      void user.type(screen.getByTestId(`step-instruction-${i}`), steps[i].instruction);
      void user.type(screen.getByTestId(`step-timing-${i}`), steps[i].timing);
    }

    // Verify recipe summary
    const summary = screen.getByTestId('recipe-summary');
    expect(summary).toHaveTextContent('Name: Mediterranean Chicken');
    expect(summary).toHaveTextContent('Servings: 6');
    expect(summary).toHaveTextContent('Total Time: 65 minutes');
    expect(summary).toHaveTextContent('Ingredients: 4');
    expect(summary).toHaveTextContent('Steps: 3');

    // Verify save button is enabled
    const saveButton = screen.getByTestId('save-recipe');
    expect(saveButton).toBeEnabled();
    expect(saveButton).toHaveClass('enabled');

    // Test ingredient removal
    void user.click(screen.getByTestId('remove-ingredient-3'));
    expect(screen.getByText('Ingredients: 3')).toBeInTheDocument();

    // Test step removal
    void user.click(screen.getByTestId('remove-step-0'));
    expect(screen.getByText('Steps: 2')).toBeInTheDocument();

    // Verify step renumbering
    expect(screen.getByDisplayValue('Sear chicken in olive oil until golden')).toBeInTheDocument();
  });

  it('handles navigation and state preservation workflow', async () => {
    const user = userEvent.setup();
    const mockOnSectionNavigate = jest.fn();

    act(async () => {
      render(<MainPageLayout onSectionNavigate={mockOnSectionNavigate} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('cuisine-recommender')).toBeInTheDocument();
    });

    // Make selections across different components
    void user.click(screen.getByTestId('cuisine-italian'));
    void user.click(screen.getByTestId('ingredient-tomatoes'));
    void user.click(screen.getByTestId('method-sauté'));

    // Navigate between sections
    const cuisineNavButton = screen.getByText('Cuisine Recommendations');
    void user.click(cuisineNavButton);
    expect(mockOnSectionNavigate).toHaveBeenCalledWith('cuisine');

    const ingredientsNavButton = screen.getByText('Ingredient Recommendations');
    void user.click(ingredientsNavButton);
    expect(mockOnSectionNavigate).toHaveBeenCalledWith('ingredients');

    // Verify state preservation was called
    await waitFor(() => {
      expect(mockNavigationState.saveState).toHaveBeenCalled();
    });

    // Verify selections are maintained after navigation
    expect(screen.getByTestId('recipe-recommendations')).toBeInTheDocument();
    expect(screen.getByText('Selected Ingredients (1)')).toBeInTheDocument();
    expect(screen.getByTestId('method-details-sauté')).toBeInTheDocument();
  });

  it('handles error recovery workflow', async () => {
    const user = userEvent.setup();

    // Mock console.error to avoid noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });

    // Simulate user creating a recipe and encountering an error
    const recipeNameInput = screen.getByTestId('recipe-name-input');
    void user.type(recipeNameInput, 'Test Recipe');

    // Add ingredient
    void user.click(screen.getByTestId('add-ingredient'));
    void user.type(screen.getByTestId('ingredient-name-0'), 'Test Ingredient');

    // Add step
    void user.click(screen.getByTestId('add-step'));
    void user.type(screen.getByTestId('step-instruction-0'), 'Test step');

    // Verify recipe is valid
    expect(screen.getByTestId('save-recipe')).toBeEnabled();

    // The main page should continue to function despite any errors
    expect(screen.getByText('What to Eat Next')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
