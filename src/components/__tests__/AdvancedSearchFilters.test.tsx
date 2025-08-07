import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';
import AdvancedSearchFilters, { SearchFilters } from '../AdvancedSearchFilters';

describe('AdvancedSearchFilters', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnSearch = jest.fn();
  
  const defaultProps = {
    onFiltersChange: mockOnFiltersChange,
    onSearch: mockOnSearch,
    availableCuisines: ['italian', 'chinese', 'japanese']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search cuisines, recipes, or ingredients/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onFiltersChange when search query changes', async () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search cuisines, recipes, or ingredients/i);
    fireEvent.change(searchInput, { target: { value: 'pasta' } });
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'pasta'
        })
      );
    });
  });

  it('expands filter options when filter button is clicked', () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    const filterButton = screen.getByRole('button', { name: /toggle filters/i });
    fireEvent.click(filterButton);
    
    expect(screen.getByText(/dietary restrictions/i)).toBeInTheDocument();
    expect(screen.getByText(/difficulty level/i)).toBeInTheDocument();
  });

  it('adds dietary restriction filters correctly', async () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    // Expand filters
    const filterButton = screen.getByRole('button', { name: /toggle filters/i });
    fireEvent.click(filterButton);
    
    // Click vegetarian filter
    const vegetarianButton = screen.getByText(/vegetarian/i);
    fireEvent.click(vegetarianButton);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dietaryRestrictions: ['vegetarian']
        })
      );
    });
  });

  it('displays active filter chips', async () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    // Expand filters and add a dietary restriction
    const filterButton = screen.getByRole('button', { name: /toggle filters/i });
    fireEvent.click(filterButton);
    
    const vegetarianButton = screen.getByText(/vegetarian/i);
    fireEvent.click(vegetarianButton);
    
    await waitFor(() => {
      expect(screen.getByText(/active filters/i)).toBeInTheDocument();
      expect(screen.getByText(/dietary:/i)).toBeInTheDocument();
    });
  });

  it('removes filter chips when X is clicked', async () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    // Add a filter first
    const filterButton = screen.getByRole('button', { name: /toggle filters/i });
    fireEvent.click(filterButton);
    
    const vegetarianButton = screen.getByText(/vegetarian/i);
    fireEvent.click(vegetarianButton);
    
    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(btn => btn.querySelector('svg'));
      if (removeButton) {
        fireEvent.click(removeButton);
      }
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dietaryRestrictions: []
        })
      );
    });
  });

  it('clears all filters when clear all is clicked', async () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    // Add filters first
    const filterButton = screen.getByRole('button', { name: /toggle filters/i });
    fireEvent.click(filterButton);
    
    const vegetarianButton = screen.getByText(/vegetarian/i);
    fireEvent.click(vegetarianButton);
    
    await waitFor(() => {
      const clearAllButton = screen.getByText(/clear all/i);
      fireEvent.click(clearAllButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '',
          dietaryRestrictions: [],
          difficultyLevel: [],
          cuisineTypes: [],
          mealTypes: [],
          spiciness: []
        })
      );
    });
  });

  it('handles cooking time range selection', async () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    // Expand filters
    const filterButton = screen.getByRole('button', { name: /toggle filters/i });
    fireEvent.click(filterButton);
    
    // Click quick cooking time
    const quickTimeButton = screen.getByText(/quick \(< 30 min\)/i);
    fireEvent.click(quickTimeButton);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          cookingTime: { min: 0, max: 30 }
        })
      );
    });
  });

  it('calls onSearch when form is submitted', () => {
    render(<AdvancedSearchFilters {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search cuisines, recipes, or ingredients/i);
    fireEvent.change(searchInput, { target: { value: 'italian pasta' } });
    fireEvent.submit(searchInput.closest('form')!);
    
    expect(mockOnSearch).toHaveBeenCalledWith('italian pasta');
  });
});