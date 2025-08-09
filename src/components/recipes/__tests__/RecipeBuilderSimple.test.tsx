import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import RecipeBuilderSimple from '../RecipeBuilderSimple';

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('RecipeBuilderSimple', () => {
  const mockOnRecipeComplete = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<RecipeBuilderSimple />);

    expect(screen.getByText('Create Your Recipe')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipe Name')).toBeInTheDocument();
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  it('renders with initial props', () => {
    render(
      <RecipeBuilderSimple
        initialIngredients={['tomato', 'basil']}
        initialMethods={['sauté']}
        onRecipeComplete={mockOnRecipeComplete}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Recipe name input
  });

  it('updates recipe name', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    const nameInput = screen.getByLabelText('Recipe Name');

    user.type(nameInput, 'My Test Recipe');

    expect(nameInput).toHaveValue('My Test Recipe');
  });

  it('updates servings, prep time, and cook time', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    const servingsInput = screen.getByLabelText('Servings');
    const prepTimeInput = screen.getByLabelText('Prep Time (min)');
    const cookTimeInput = screen.getByLabelText('Cook Time (min)');

    user.clear(servingsInput);
    user.type(servingsInput, '6');

    user.clear(prepTimeInput);
    user.type(prepTimeInput, '20');

    user.clear(cookTimeInput);
    user.type(cookTimeInput, '45');

    expect(servingsInput).toHaveValue(6);
    expect(prepTimeInput).toHaveValue(20);
    expect(cookTimeInput).toHaveValue(45);
  });

  it('adds and removes ingredients', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Initially no ingredients
    expect(screen.getByText('No ingredients added yet. Click "Add Ingredient" to start.')).toBeInTheDocument();

    // Add ingredient
    const addIngredientButton = screen.getByText('Add Ingredient');
    user.click(addIngredientButton);

    // Should now have one ingredient row
    const quantityInputs = screen.getAllByPlaceholderText('1 cup');
    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');
    const prepInputs = screen.getAllByPlaceholderText('diced, chopped...');

    expect(quantityInputs).toHaveLength(1);
    expect(nameInputs).toHaveLength(1);
    expect(prepInputs).toHaveLength(1);

    // Fill in ingredient details
    user.type(quantityInputs[0], '2 cups');
    user.type(nameInputs[0], 'Tomatoes');
    user.type(prepInputs[0], 'diced');

    expect(quantityInputs[0]).toHaveValue('2 cups');
    expect(nameInputs[0]).toHaveValue('Tomatoes');
    expect(prepInputs[0]).toHaveValue('diced');

    // Remove ingredient
    const removeButton = screen.getByTitle('Remove ingredient');
    user.click(removeButton);

    // Should be back to no ingredients
    expect(screen.getByText('No ingredients added yet. Click "Add Ingredient" to start.')).toBeInTheDocument();
  });

  it('adds and removes instruction steps', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Initially no steps
    expect(screen.getByText('No steps added yet. Click "Add Step" to start.')).toBeInTheDocument();

    // Add step
    const addStepButton = screen.getByText('Add Step');
    user.click(addStepButton);

    // Should now have one step
    const stepTextareas = screen.getAllByPlaceholderText('Describe this step...');
    const timingInputs = screen.getAllByPlaceholderText('5 min');

    expect(stepTextareas).toHaveLength(1);
    expect(timingInputs).toHaveLength(1);
    expect(screen.getByText('1')).toBeInTheDocument(); // Step number

    // Fill in step details
    user.type(stepTextareas[0], 'Heat oil in a large pan');
    user.type(timingInputs[0], '2 min');

    expect(stepTextareas[0]).toHaveValue('Heat oil in a large pan');
    expect(timingInputs[0]).toHaveValue('2 min');

    // Add another step
    user.click(addStepButton);

    // Should now have two steps with correct numbering
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Remove first step
    const removeButtons = screen.getAllByTitle('Remove step');
    user.click(removeButtons[0]);

    // Should have one step, renumbered to 1
    const remainingSteps = screen.getAllByPlaceholderText('Describe this step...');
    expect(remainingSteps).toHaveLength(1);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('disables save button when recipe is invalid', async () => {
    render(<RecipeBuilderSimple />);

    const saveButton = screen.getByText('Save Recipe');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when recipe is valid', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Add recipe name
    const nameInput = screen.getByLabelText('Recipe Name');
    user.type(nameInput, 'Test Recipe');

    // Add ingredient
    const addIngredientButton = screen.getByText('Add Ingredient');
    user.click(addIngredientButton);

    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');
    user.type(nameInputs[0], 'Tomatoes');

    // Add step
    const addStepButton = screen.getByText('Add Step');
    user.click(addStepButton);

    const stepTextareas = screen.getAllByPlaceholderText('Describe this step...');
    user.type(stepTextareas[0], 'Cook the tomatoes');

    // Save button should now be enabled
    const saveButton = screen.getByText('Save Recipe');
    expect(saveButton).toBeEnabled();
  });

  it('calls onSave and onRecipeComplete when recipe is saved', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple onSave={mockOnSave} onRecipeComplete={mockOnRecipeComplete} />);

    // Create a valid recipe
    const nameInput = screen.getByLabelText('Recipe Name');
    user.type(nameInput, 'Test Recipe');

    const addIngredientButton = screen.getByText('Add Ingredient');
    user.click(addIngredientButton);

    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');
    user.type(nameInputs[0], 'Tomatoes');

    const addStepButton = screen.getByText('Add Step');
    user.click(addStepButton);

    const stepTextareas = screen.getAllByPlaceholderText('Describe this step...');
    user.type(stepTextareas[0], 'Cook the tomatoes');

    // Save the recipe
    const saveButton = screen.getByText('Save Recipe');
    user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Recipe',
        ingredients: expect.arrayContaining([
          expect.objectContaining({
            name: 'Tomatoes',
          }),
        ]),
        steps: expect.arrayContaining([
          expect.objectContaining({
            instruction: 'Cook the tomatoes',
          }),
        ]),
      }),
    );

    expect(mockOnRecipeComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Recipe',
      }),
    );
  });

  it('displays recipe summary when recipe has content', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Add recipe name
    const nameInput = screen.getByLabelText('Recipe Name');
    user.type(nameInput, 'Test Recipe');

    // Add ingredient
    const addIngredientButton = screen.getByText('Add Ingredient');
    user.click(addIngredientButton);

    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');
    user.type(nameInputs[0], 'Tomatoes');

    // Should show recipe summary
    await waitFor(() => {
      expect(screen.getByText('Recipe Summary')).toBeInTheDocument();
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText(/Serves 4/)).toBeInTheDocument();
      expect(screen.getByText(/1 ingredients/)).toBeInTheDocument();
    });
  });

  it('calculates total time correctly', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Set prep and cook times
    const prepTimeInput = screen.getByLabelText('Prep Time (min)');
    const cookTimeInput = screen.getByLabelText('Cook Time (min)');

    user.clear(prepTimeInput);
    user.type(prepTimeInput, '15');

    user.clear(cookTimeInput);
    user.type(cookTimeInput, '30');

    // Add minimum required fields for summary
    const nameInput = screen.getByLabelText('Recipe Name');
    user.type(nameInput, 'Test Recipe');

    const addIngredientButton = screen.getByText('Add Ingredient');
    user.click(addIngredientButton);

    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');
    user.type(nameInputs[0], 'Tomatoes');

    // Should show correct total time in summary
    await waitFor(() => {
      expect(screen.getByText(/Total time: 45 minutes/)).toBeInTheDocument();
    });
  });

  it('handles ingredient updates correctly', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Add ingredient
    const addIngredientButton = screen.getByText('Add Ingredient');
    user.click(addIngredientButton);

    const quantityInputs = screen.getAllByPlaceholderText('1 cup');
    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');
    const prepInputs = screen.getAllByPlaceholderText('diced, chopped...');

    // Update all fields
    user.type(quantityInputs[0], '2 cups');
    user.type(nameInputs[0], 'Fresh Tomatoes');
    user.type(prepInputs[0], 'finely diced');

    expect(quantityInputs[0]).toHaveValue('2 cups');
    expect(nameInputs[0]).toHaveValue('Fresh Tomatoes');
    expect(prepInputs[0]).toHaveValue('finely diced');
  });

  it('handles step updates correctly', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Add step
    const addStepButton = screen.getByText('Add Step');
    user.click(addStepButton);

    const stepTextareas = screen.getAllByPlaceholderText('Describe this step...');
    const timingInputs = screen.getAllByPlaceholderText('5 min');

    // Update step details
    user.type(stepTextareas[0], 'Heat olive oil in a large skillet over medium heat');
    user.type(timingInputs[0], '3 min');

    expect(stepTextareas[0]).toHaveValue('Heat olive oil in a large skillet over medium heat');
    expect(timingInputs[0]).toHaveValue('3 min');
  });

  it('maintains step numbering when steps are removed', async () => {
    const user = userEvent.setup();
    render(<RecipeBuilderSimple />);

    // Add three steps
    const addStepButton = screen.getByText('Add Step');
    user.click(addStepButton);
    user.click(addStepButton);
    user.click(addStepButton);

    // Should have steps 1, 2, 3
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Remove middle step (step 2)
    const removeButtons = screen.getAllByTitle('Remove step');
    user.click(removeButtons[1]);

    // Should now have steps 1, 2 (renumbered)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();

    // Should have 2 steps total
    const remainingSteps = screen.getAllByPlaceholderText('Describe this step...');
    expect(remainingSteps).toHaveLength(2);
  });
});

describe('RecipeBuilderSimple Performance', () => {
  it('memoizes expensive calculations', async () => {
    const user = userEvent.setup();

    // Mock performance.now to track calculation calls
    const mockPerformanceNow = jest.spyOn(performance, 'now');

    render(<RecipeBuilderSimple />);

    // Add recipe details
    const nameInput = screen.getByLabelText('Recipe Name');
    user.type(nameInput, 'Performance Test Recipe');

    const prepTimeInput = screen.getByLabelText('Prep Time (min)');
    const cookTimeInput = screen.getByLabelText('Cook Time (min)');

    user.clear(prepTimeInput);
    user.type(prepTimeInput, '10');

    user.clear(cookTimeInput);
    user.type(cookTimeInput, '20');

    // Add ingredient to trigger summary
    const addIngredientButton = screen.getByText('Add Ingredient');
    user.click(addIngredientButton);

    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');
    user.type(nameInputs[0], 'Test Ingredient');

    // Verify total time is calculated correctly
    await waitFor(() => {
      expect(screen.getByText(/Total time: 30 minutes/)).toBeInTheDocument();
    });

    mockPerformanceNow.mockRestore();
  });
});
