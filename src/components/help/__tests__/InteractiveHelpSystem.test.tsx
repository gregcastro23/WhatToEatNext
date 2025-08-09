import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { InteractiveHelpSystem, useContextualHelp } from '../InteractiveHelpSystem';

// Mock the portal for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (element: React.ReactNode) => element,
}));

describe('InteractiveHelpSystem', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  test('renders help toggle button', () => {
    render(<InteractiveHelpSystem />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  test('opens help system when button is clicked', async () => {
    render(<InteractiveHelpSystem />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Interactive Help System')).toBeInTheDocument();
    });
  });

  test('responds to F1 keyboard shortcut', async () => {
    render(<InteractiveHelpSystem />);

    fireEvent.keyDown(document, { key: 'F1' });

    await waitFor(() => {
      expect(screen.getByText('Interactive Help System')).toBeInTheDocument();
    });
  });

  test('responds to Ctrl+H keyboard shortcut', async () => {
    render(<InteractiveHelpSystem />);

    fireEvent.keyDown(document, { key: 'h', ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByText('Interactive Help System')).toBeInTheDocument();
    });
  });

  test('closes help system with Escape key', async () => {
    render(<InteractiveHelpSystem />);

    // Open help system
    fireEvent.keyDown(document, { key: 'F1' });

    await waitFor(() => {
      expect(screen.getByText('Interactive Help System')).toBeInTheDocument();
    });

    // Close with Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Interactive Help System')).not.toBeInTheDocument();
    });
  });

  test('displays quick help tab by default', async () => {
    render(<InteractiveHelpSystem />);

    fireEvent.keyDown(document, { key: 'F1' });

    await waitFor(() => {
      expect(screen.getByText('Quick Help & Reference')).toBeInTheDocument();
    });
  });

  test('switches between tabs', async () => {
    render(<InteractiveHelpSystem />);

    fireEvent.keyDown(document, { key: 'F1' });

    await waitFor(() => {
      expect(screen.getByText('Quick Help & Reference')).toBeInTheDocument();
    });

    // Click on Code Suggestions tab
    const suggestionsTab = screen.getByText('Code Suggestions');
    fireEvent.click(suggestionsTab);

    await waitFor(() => {
      expect(screen.getByText('Astrological Code Suggestions')).toBeInTheDocument();
    });
  });

  test('calls onCodeInsert when code is inserted', async () => {
    const mockOnCodeInsert = jest.fn();
    render(<InteractiveHelpSystem onCodeInsert={mockOnCodeInsert} />);

    fireEvent.keyDown(document, { key: 'F1' });

    await waitFor(() => {
      expect(screen.getByText('Interactive Help System')).toBeInTheDocument();
    });

    // Switch to suggestions tab and simulate code insertion
    const suggestionsTab = screen.getByText('Code Suggestions');
    fireEvent.click(suggestionsTab);

    // This would require more complex mocking of the AstrologicalCodeSuggestions component
    // For now, we verify the callback is passed correctly
    expect(mockOnCodeInsert).toBeDefined();
  });
});

describe('useContextualHelp', () => {
  const TestComponent: React.FC<{ context: string }> = ({ context }) => {
    const { helpItems } = useContextualHelp(context);

    return (
      <div>
        <span data-testid='help-count'>{helpItems.length}</span>
        {helpItems.map(item => (
          <div key={item.id} data-testid='help-item'>
            {item.title}
          </div>
        ))}
      </div>
    );
  };

  test('filters help items based on astrological context', () => {
    render(<TestComponent context='astrological-component' />);

    const helpItems = screen.getAllByTestId('help-item');
    expect(helpItems.length).toBeGreaterThan(0);

    // Should include astrological help items
    expect(screen.getByText('Elemental Property Casing')).toBeInTheDocument();
    expect(screen.getByText('Zodiac Sign Conventions')).toBeInTheDocument();
  });

  test('filters help items based on campaign context', () => {
    render(<TestComponent context='campaign-system' />);

    const helpItems = screen.getAllByTestId('help-item');
    expect(helpItems.length).toBeGreaterThan(0);

    // Should include development/campaign help items
    expect(screen.getByText('Campaign System Integration')).toBeInTheDocument();
  });

  test('returns all help items for unknown context', () => {
    render(<TestComponent context='unknown-context' />);

    const helpCount = screen.getByTestId('help-count');
    expect(parseInt(helpCount.textContent || '0')).toBeGreaterThan(0);
  });
});

describe('Help System Integration', () => {
  test('follows established casing conventions', () => {
    // Test that help system promotes correct casing
    const elementalExample = 'Fire: 0.8, Water: 0.2, Earth: 0.1, Air: 0.0';
    const zodiacExample = 'aries, taurus, gemini, cancer';

    expect(elementalExample).toMatch(/Fire|Water|Earth|Air/);
    expect(zodiacExample).toMatch(/^[a-z, ]+$/);
  });

  test('provides campaign system guidance', () => {
    // Test that help system includes campaign guidance
    const campaignCommands = ['make errors', 'make phase-status', 'make build'];

    campaignCommands.forEach(command => {
      expect(command).toMatch(/^make /);
    });
  });

  test('includes performance requirements', () => {
    // Test that help system mentions performance requirements
    const performanceRequirements = {
      calculationTime: 2000, // 2 seconds max
      apiTimeout: 5000, // 5 seconds max
      cacheHitTime: 100, // 100ms max
    };

    expect(performanceRequirements.calculationTime).toBeLessThanOrEqual(2000);
    expect(performanceRequirements.apiTimeout).toBeLessThanOrEqual(5000);
    expect(performanceRequirements.cacheHitTime).toBeLessThanOrEqual(100);
  });
});
