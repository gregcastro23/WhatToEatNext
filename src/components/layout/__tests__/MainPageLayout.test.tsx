import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';


import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useNavigationState, useScrollPreservation, useAutoStateCleanup } from '@/hooks/useStatePreservation';

import MainPageLayout, { useMainPageContext } from '../MainPageLayout';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AlchemicalContext/hooks', () => ({
  useAlchemical: jest.fn()
}));

jest.mock('@/hooks/useStatePreservation', () => ({
  useNavigationState: jest.fn(),
  useScrollPreservation: jest.fn(),
  useAutoStateCleanup: jest.fn()
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock lazy-loaded components
jest.mock('@/components/debug/ConsolidatedDebugInfo', () => {
  return function MockConsolidatedDebugInfo() {
    return <div data-testid="debug-info">Debug Info</div>;
  };
});

jest.mock('@/components/CuisineRecommender', () => {
  return function MockCuisineRecommender() {
    return <div data-testid="cuisine-recommender">Cuisine Recommender</div>;
  };
});

jest.mock('@/components/IngredientRecommender', () => {
  return function MockIngredientRecommender() {
    return <div data-testid="ingredient-recommender">Ingredient Recommender</div>;
  };
});

jest.mock('@/components/CookingMethodsSection', () => {
  return function MockCookingMethodsSection() {
    return <div data-testid="cooking-methods">Cooking Methods</div>;
  };
});

jest.mock('@/components/recipes/RecipeBuilderSimple', () => {
  return function MockRecipeBuilderSimple() {
    return <div data-testid="recipe-builder">Recipe Builder</div>;
  };
});

// Test component that uses the context
function TestContextConsumer() {
  const context = useMainPageContext();
  
  return (
    <div>
      <div data-testid="selected-ingredients">
        {context.selectedIngredients.join(', ')}
      </div>
      <div data-testid="selected-cuisine">
        {context.selectedCuisine || 'None'}
      </div>
      <button 
        onClick={() => context.updateSelectedIngredients(['tomato', 'basil'])}
        data-testid="update-ingredients"
      >
        Update Ingredients
      </button>
      <button 
        onClick={() => context.updateSelectedCuisine('italian')}
        data-testid="update-cuisine"
      >
        Update Cuisine
      </button>
    </div>
  );
}

describe('MainPageLayout', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn()
  };

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
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAlchemical as jest.Mock).mockReturnValue(mockAlchemicalContext);
    (useNavigationState as jest.Mock).mockReturnValue(mockNavigationState);
    (useScrollPreservation as jest.Mock).mockReturnValue(mockScrollPreservation);
    (useAutoStateCleanup as jest.Mock).mockReturnValue(undefined);

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true
    });
  });

  it('renders without crashing', async () => {
    act(async () => {
      render(<MainPageLayout />);
    });

    expect(screen.getByText('What to Eat Next')).toBeInTheDocument();
    expect(screen.getByText('Food recommendations based on the current celestial energies')).toBeInTheDocument();
  });

  it('displays loading state correctly', async () => {
    act(async () => {
      render(<MainPageLayout loading={true} />);
    });

    expect(screen.getByText('Loading astrological data...')).toBeInTheDocument();
  });

  it('displays connected state when not loading', async () => {
    act(async () => {
      render(<MainPageLayout loading={false} />);
    });

    expect(screen.getByText(/Connected • Day • aries/)).toBeInTheDocument();
  });

  it('renders navigation buttons', async () => {
    act(async () => {
      render(<MainPageLayout />);
    });

    expect(screen.getByText('Cuisine Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Ingredient Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Cooking Methods')).toBeInTheDocument();
    expect(screen.getByText('Recipe Builder')).toBeInTheDocument();
  });

  it('handles section navigation', async () => {
    const mockOnSectionNavigate = jest.fn();
    
    // Mock getElementById
    const mockElement = {
      scrollIntoView: jest.fn(),
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    };
    
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    act(async () => {
      render(<MainPageLayout onSectionNavigate={mockOnSectionNavigate} />);
    });

    const cuisineButton = screen.getByText('Cuisine Recommendations');
    
    act(async () => {
      fireEvent.click(cuisineButton);
    });

    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
    expect(mockOnSectionNavigate).toHaveBeenCalledWith('cuisine');
  });

  it('renders debug panel in development mode', async () => {
    act(async () => {
      render(<MainPageLayout debugMode={true} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('debug-info')).toBeInTheDocument();
    });
  });

  it('does not render debug panel when debugMode is false', async () => {
    act(async () => {
      render(<MainPageLayout debugMode={false} />);
    });

    expect(screen.queryByTestId('debug-info')).not.toBeInTheDocument();
  });

  it('provides context to child components', async () => {
    act(async () => {
      render(
        <MainPageLayout>
          <TestContextConsumer />
        </MainPageLayout>
      );
    });

    expect(screen.getByTestId('selected-ingredients')).toHaveTextContent('');
    expect(screen.getByTestId('selected-cuisine')).toHaveTextContent('None');
  });

  it('updates context state correctly', async () => {
    act(async () => {
      render(
        <MainPageLayout>
          <TestContextConsumer />
        </MainPageLayout>
      );
    });

    const updateIngredientsButton = screen.getByTestId('update-ingredients');
    const updateCuisineButton = screen.getByTestId('update-cuisine');

    act(async () => {
      fireEvent.click(updateIngredientsButton);
    });

    expect(screen.getByTestId('selected-ingredients')).toHaveTextContent('tomato, basil');

    act(async () => {
      fireEvent.click(updateCuisineButton);
    });

    expect(screen.getByTestId('selected-cuisine')).toHaveTextContent('italian');
  });

  it('saves navigation state when context changes', async () => {
    act(async () => {
      render(
        <MainPageLayout>
          <TestContextConsumer />
        </MainPageLayout>
      );
    });

    const updateIngredientsButton = screen.getByTestId('update-ingredients');

    act(async () => {
      fireEvent.click(updateIngredientsButton);
    });

    // Wait for the effect to run
    await waitFor(() => {
      expect(mockNavigationState.saveState).toHaveBeenCalled();
    });
  });

  it('restores scroll position on mount', async () => {
    act(async () => {
      render(<MainPageLayout />);
    });

    // Wait for the effect to run
    await waitFor(() => {
      expect(mockScrollPreservation.restoreScrollPosition).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('handles component loading states', async () => {
    act(async () => {
      render(<MainPageLayout />);
    });

    // Check that loading fallbacks are rendered initially
    await waitFor(() => {
      expect(screen.getByText('Loading Cuisine Recommender...')).toBeInTheDocument();
    });
  });

  it('renders all main sections', async () => {
    act(async () => {
      render(<MainPageLayout />);
    });

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByTestId('cuisine-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('ingredient-recommender')).toBeInTheDocument();
      expect(screen.getByTestId('cooking-methods')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });
  });

  it('handles error boundaries correctly', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create a component that throws an error
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    act(async () => {
      render(
        <MainPageLayout>
          <ErrorComponent />
        </MainPageLayout>
      );
    });

    // The error should be caught and the page should still render
    expect(screen.getByText('What to Eat Next')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('throws error when useMainPageContext is used outside provider', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestContextConsumer />);
    }).toThrow('useMainPageContext must be used within MainPageLayout');

    consoleSpy.mockRestore();
  });
});

describe('MainPageLayout Performance', () => {
  it('memoizes context value to prevent unnecessary re-renders', async () => {
    const TestComponent = () => {
      const context = useMainPageContext();
      const renderCount = React.useRef(0);
      renderCount.current++;
      
      return <div data-testid="render-count">{renderCount.current}</div>;
    };

    const { rerender } = render(
      <MainPageLayout>
        <TestComponent />
      </MainPageLayout>
    );

    await waitFor(() => {
      expect(screen.getByTestId('render-count')).toHaveTextContent('1');
    });

    // Re-render with same props should not cause child to re-render
    rerender(
      <MainPageLayout>
        <TestComponent />
      </MainPageLayout>
    );

    await waitFor(() => {
      expect(screen.getByTestId('render-count')).toHaveTextContent('1');
    });
  });
});