import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import MainPageLayout from '@/components/layout/MainPageLayout';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useNavigationState, useScrollPreservation, useAutoStateCleanup } from '@/hooks/useStatePreservation';

// Mock all dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn()
  })
}));

jest.mock('@/contexts/AlchemicalContext/hooks');
jest.mock('@/hooks/useStatePreservation');
jest.mock('@/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock components with realistic behavior
jest.mock('@/components/CuisineRecommender', () => {
  return function MockCuisineRecommender() {
    const [selectedCuisine, setSelectedCuisine] = React.useState<string | null>(null);
    
    return (
      <div data-testid="cuisine-recommender">
        <h3>Cuisine Recommendations</h3>
        <div className="cuisine-list">
          {['Italian', 'Chinese', 'Mexican', 'Indian'].map(cuisine => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={selectedCuisine === cuisine ? 'selected' : ''}
              data-testid={`cuisine-${cuisine.toLowerCase()}`}
            >
              {cuisine}
            </button>
          ))}
        </div>
        {selectedCuisine && (
          <div data-testid="selected-cuisine">
            Selected: {selectedCuisine}
          </div>
        )}
      </div>
    );
  };
});

jest.mock('@/components/IngredientRecommender', () => {
  return function MockIngredientRecommender({ maxDisplayed = 8 }: { maxDisplayed?: number }) {
    const [selectedIngredients, setSelectedIngredients] = React.useState<string[]>([]);
    
    const ingredients = ['Tomatoes', 'Onions', 'Garlic', 'Basil', 'Olive Oil', 'Cheese', 'Pasta', 'Chicken'];
    const displayedIngredients = ingredients.slice(0, maxDisplayed);
    
    const toggleIngredient = (ingredient: string) => {
      setSelectedIngredients(prev => 
        prev.includes(ingredient) 
          ? prev.filter(i => i !== ingredient)
          : [...prev, ingredient]
      );
    };
    
    return (
      <div data-testid="ingredient-recommender">
        <h3>Ingredient Recommendations</h3>
        <div className="ingredient-list">
          {displayedIngredients.map(ingredient => (
            <button
              key={ingredient}
              onClick={() => toggleIngredient(ingredient)}
              className={selectedIngredients.includes(ingredient) ? 'selected' : ''}
              data-testid={`ingredient-${ingredient.toLowerCase()}`}
            >
              {ingredient}
            </button>
          ))}
        </div>
        <div data-testid="selected-ingredients">
          Selected: {selectedIngredients.join(', ')}
        </div>
      </div>
    );
  };
});

jest.mock('@/components/CookingMethodsSection', () => {
  return function MockCookingMethodsSection({ 
    maxDisplayed = 6, 
    onViewMore 
  }: { 
    maxDisplayed?: number;
    onViewMore?: () => void;
  }) {
    const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);
    
    const methods = ['Sauté', 'Roast', 'Grill', 'Steam', 'Braise', 'Stir-fry', 'Bake', 'Poach'];
    const displayedMethods = methods.slice(0, maxDisplayed);
    
    return (
      <div data-testid="cooking-methods">
        <h3>Cooking Methods</h3>
        <div className="methods-list">
          {displayedMethods.map(method => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={selectedMethod === method ? 'selected' : ''}
              data-testid={`method-${method.toLowerCase()}`}
            >
              {method}
            </button>
          ))}
        </div>
        {selectedMethod && (
          <div data-testid="selected-method">
            Selected: {selectedMethod}
          </div>
        )}
        <button onClick={onViewMore} data-testid="view-more-methods">
          View More Methods
        </button>
      </div>
    );
  };
});

jest.mock('@/components/recipes/RecipeBuilderSimple', () => {
  return function MockRecipeBuilderSimple() {
    const [recipeName, setRecipeName] = React.useState('');
    const [ingredients, setIngredients] = React.useState<string[]>([]);
    const [steps, setSteps] = React.useState<string[]>([]);
    
    const addIngredient = () => {
      setIngredients(prev => [...prev, `Ingredient ${prev.length + 1}`]);
    };
    
    const addStep = () => {
      setSteps(prev => [...prev, `Step ${prev.length + 1}`]);
    };
    
    const canSave = recipeName.trim() && ingredients.length > 0 && steps.length > 0;
    
    return (
      <div data-testid="recipe-builder">
        <h3>Recipe Builder</h3>
        <input
          type="text"
          placeholder="Recipe Name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          data-testid="recipe-name-input"
        />
        <div>
          <button onClick={addIngredient} data-testid="add-ingredient">
            Add Ingredient
          </button>
          <div data-testid="ingredients-count">
            Ingredients: {ingredients.length}
          </div>
        </div>
        <div>
          <button onClick={addStep} data-testid="add-step">
            Add Step
          </button>
          <div data-testid="steps-count">
            Steps: {steps.length}
          </div>
        </div>
        <button 
          disabled={!canSave}
          data-testid="save-recipe"
        >
          Save Recipe
        </button>
      </div>
    );
  };
});

jest.mock('@/components/debug/ConsolidatedDebugInfo', () => {
  return function MockConsolidatedDebugInfo() {
    return (
      <div data-testid="debug-info">
        <h4>Debug Panel</h4>
        <div>Performance: OK</div>
        <div>Astrological State: Active</div>
      </div>
    );
  };
});

describe('Main Page Integration Tests', () => {
  const mockAlchemicalContext = {
    state: {
      astrologicalState: {
        sunSign: 'aries'
      },
      elementalState: {
        Fire: 0.3,
        Water: 0.2,
        Earth: 0.3,
        Air: 0.2
      }
    },
    planetaryPositions: {
      sun: { sign: 'aries' }
    },
    isDaytime: true
  };

  const mockNavigationState = {
    saveState: jest.fn(),
    getState: jest.fn(() => ({}))
  };

  const mockScrollPreservation = {
    restoreScrollPosition: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAlchemical as jest.Mock).mockReturnValue(mockAlchemicalContext);
    (useNavigationState as jest.Mock).mockReturnValue(mockNavigationState);
    (useScrollPreservation as jest.Mock).mockReturnValue(mockScrollPreservation);
    (useAutoStateCleanup as jest.Mock).mockReturnValue(undefined);

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true
    });

    // Mock getElementById for navigation
    jest.spyOn(document, 'getElementById').mockImplementation((id) => ({
      scrollIntoView: jest.fn(),
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    } as any));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all main sections and they interact correctly', async () => {
    await act(async () => {
      render(<MainPageLayout />);
    });

    // Wait for all components to load
    await waitFor(() => {
      expect(screen.getByTestId('cuisine-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('ingredient-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('cooking-methods')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });

    // Test cuisine selection
    await const italianButton = screen.getByTestId
    await act(async () => {
      fireEvent.click(italianButton);
    });

    expect(screen.getByText('Selected: Italian')).toBeInTheDocument();

    // Test ingredient selection
    await const tomatoButton = screen.getByTestId
    await act(async () => {
      fireEvent.click(tomatoButton);
    });

    expect(screen.getByText('Selected: Tomatoes')).toBeInTheDocument();

    // Test cooking method selection
    await const sauteButton = screen.getByTestId
    await act(async () => {
      fireEvent.click(sauteButton);
    });

    expect(screen.getByText('Selected: Sauté')).toBeInTheDocument();
  });

  it('handles navigation between sections correctly', async () => {
    const mockOnSectionNavigate = jest.fn();
    
    await act(async () => {
      render(<MainPageLayout onSectionNavigate={mockOnSectionNavigate} />);
    });

    // Test navigation to cuisine section
    await const cuisineNavButton = screen.getByText
    await act(async () => {
      fireEvent.click(cuisineNavButton);
    });

    expect(mockOnSectionNavigate).toHaveBeenCalledWith('cuisine');

    // Test navigation to ingredients section
    await const ingredientsNavButton = screen.getByText
    await act(async () => {
      fireEvent.click(ingredientsNavButton);
    });

    expect(mockOnSectionNavigate).toHaveBeenCalledWith('ingredients');
  });

  it('preserves state across component interactions', async () => {
    await act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('cuisine-recommender')).toBeInTheDocument();
    });

    // Make selections in different components
    await const italianButton = screen.getByTestId
    await const tomatoButton = screen.getByTestId
    await const sauteButton = screen.getByTestId
    await act(async () => {
      fireEvent.click(italianButton);
      fireEvent.click(tomatoButton);
      fireEvent.click(sauteButton);
    });

    // Verify selections are maintained
    expect(screen.getByText('Selected: Italian')).toBeInTheDocument();
    expect(screen.getByText('Selected: Tomatoes')).toBeInTheDocument();
    expect(screen.getByText('Selected: Sauté')).toBeInTheDocument();

    // Verify state saving was called
    await waitFor(() => {
      expect(mockNavigationState.saveState).toHaveBeenCalled();
    });
  });

  it('handles recipe building workflow', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });

    // Enter recipe name
    await const recipeNameInput = screen.getByTestId
    await user.type(recipeNameInput, 'Test Recipe');

    // Add ingredients and steps
    await const addIngredientButton = screen.getByTestId
    await const addStepButton = screen.getByTestId
    await user.click(addIngredientButton);
    await user.click(addIngredientButton);
    await user.click(addStepButton);

    // Verify counts
    expect(screen.getByText('Ingredients: 2')).toBeInTheDocument();
    expect(screen.getByText('Steps: 1')).toBeInTheDocument();

    // Save button should be enabled
    const saveButton = screen.getByTestId('save-recipe');
    expect(saveButton).toBeEnabled();
  });

  it('handles error states gracefully', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create a component that throws an error
    const ErrorComponent = () => {
      throw new Error('Test integration error');
    };

    await act(async () => {
      render(
        <MainPageLayout>
          <ErrorComponent />
        </MainPageLayout>
      );
    });

    // Main page should still render despite the error
    expect(screen.getByText('What to Eat Next')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays debug information when enabled', async () => {
    await act(async () => {
      render(<MainPageLayout debugMode={true} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('debug-info')).toBeInTheDocument();
    });

    expect(screen.getByText('Debug Panel')).toBeInTheDocument();
    expect(screen.getByText('Performance: OK')).toBeInTheDocument();
    expect(screen.getByText('Astrological State: Active')).toBeInTheDocument();
  });

  it('handles component loading states', async () => {
    await act(async () => {
      render(<MainPageLayout />);
    });

    // Initially should show loading states
    expect(screen.getByText('Loading Cuisine Recommender...')).toBeInTheDocument();
    expect(screen.getByText('Loading Ingredient Recommender...')).toBeInTheDocument();
    expect(screen.getByText('Loading Cooking Methods...')).toBeInTheDocument();
    expect(screen.getByText('Loading Recipe Builder...')).toBeInTheDocument();

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByTestId('cuisine-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('ingredient-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('cooking-methods')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });
  });

  it('handles cross-component data flow', async () => {
    await act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('ingredient-recommender')).toBeInTheDocument();
    });

    // Select multiple ingredients
    await const tomatoButton = screen.getByTestId
    await const onionButton = screen.getByTestId
    await const garlicButton = screen.getByTestId
    await act(async () => {
      fireEvent.click(tomatoButton);
      fireEvent.click(onionButton);
      fireEvent.click(garlicButton);
    });

    // Verify multiple selections
    expect(screen.getByText('Selected: Tomatoes, Onions, Garlic')).toBeInTheDocument();

    // This should trigger state preservation
    await waitFor(() => {
      expect(mockNavigationState.saveState).toHaveBeenCalled();
    });
  });

  it('handles view more navigation', async () => {
    const mockRouter = {
      push: jest.fn()
    };

    // We need to mock the router for this specific test
    jest.doMock('next/navigation', () => ({
      useRouter: () => mockRouter
    }));

    await act(async () => {
      render(<MainPageLayout />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('cooking-methods')).toBeInTheDocument();
    });

    await const viewMoreButton = screen.getByTestId
    await act(async () => {
      fireEvent.click(viewMoreButton);
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/cooking-methods');
  });

  it('maintains responsive behavior', async () => {
    // Mock window.innerWidth for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    });

    await act(async () => {
      render(<MainPageLayout />);
    });

    // The layout should adapt to different screen sizes
    // This is more of a visual test, but we can verify the structure is present
    expect(screen.getByText('What to Eat Next')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});