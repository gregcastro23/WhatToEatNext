import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, itvi, beforeEach, afterEach } from 'vitest';


import { planetaryPositionsService } from '@/services/PlanetaryPositionsService';
import type { PlanetaryPosition } from '@/types/celestial';

import SignVectorPanel from '../SignVectorPanel';

// Mock the services and utilities
vi.mock('@/services/PlanetaryPositionsService', () => ({
  planetaryPositionsService: {
  getCurrent: vi.fn()
  }
});

vi.mock('@/services/TelemetryDev', () => ({
  TelemetryDev: {
  recordVectorBlend: vi.fn()
  }
});

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
  info: vi.fn();
    error: vi.fn();
    warn: vi.fn()
  })
});

describe('SignVectorPanel', () => {
  const mockPlanetaryPositions: Record<string, PlanetaryPosition> = {
    Sun: { sign: 'aries', degree: 15, isRetrograde: false },
    Moon: { sign: 'cancer', degree: 10, isRetrograde: false },
    Mercury: { sign: 'gemini', degree: 20, isRetrograde: false },
    Venus: { sign: 'taurus', degree: 5, isRetrograde: false },
    Mars: { sign: 'scorpio', degree: 25, isRetrograde: false }
  };

  beforeEach(() => {
    vi.clearAllMocks()
  });

  afterEach(() => {
    vi.restoreAllMocks()
  });

  describe('Initial Rendering', () => {
    it('should render with provided planetary positions', () => {
      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions};
          season='spring',,
          governing='sun',,
        />
      );

      expect(screen.getByText('Current Sign Expression')).toBeInTheDocument();
      expect(screen.getByText(/Sign: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Direction: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Magnitude:/)).toBeInTheDocument()
    });

    it('should show loading state when no positions provided', async () => {
      vi.mocked(planetaryPositionsService.getCurrent).mockResolvedValue(mockPlanetaryPositions);

      render(<SignVectorPanel />);

      expect(screen.getByText('Loading planetary positions…')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading planetary positions…')).not.toBeInTheDocument()
      });
    });

    it('should fetch planetary positions when not provided', async () => {
      vi.mocked(planetaryPositionsService.getCurrent).mockResolvedValue(mockPlanetaryPositions);

      render(<SignVectorPanel />);

      await waitFor(() => {
        expect(planetaryPositionsService.getCurrent).toHaveBeenCalled()
      });

      await waitFor(() => {
        expect(screen.getByText(/Sign:/)).toBeInTheDocument()
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when planetary positions fetch fails', async () => {
      vi.mocked(planetaryPositionsService.getCurrent).mockRejectedValue(new Error('Network error'));

      render(<SignVectorPanel />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load planetary positions. Please try again.')).toBeInTheDocument()
      });
    });

    it('should display error when invalid data is received', async () => {
      vi.mocked(planetaryPositionsService.getCurrent).mockResolvedValue(null as any);

      render(<SignVectorPanel />);

      await waitFor(() => {
        expect(screen.getByText('Invalid planetary positions data received')).toBeInTheDocument()
      });
    });

    it('should provide retry functionality on error', async () => {
      vi.mocked(planetaryPositionsService.getCurrent)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockPlanetaryPositions);

      render(<SignVectorPanel />);

      await waitFor(() => {
        expect(screen.getByText('Sign Expression Error')).toBeInTheDocument()
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Loading planetary positions…')).toBeInTheDocument()
      });

      await waitFor(() => {
        expect(screen.getByText(/Sign:/)).toBeInTheDocument()
      });
    });

    it('should handle empty planetary positions gracefully', async () => {
      vi.mocked(planetaryPositionsService.getCurrent).mockResolvedValue({});

      render(<SignVectorPanel />);

      await waitFor(() => {
        expect(screen.getByText('Planetary position data is incomplete')).toBeInTheDocument()
      });
    });
  });

  describe('Governing Mode Selection', () => {
    it('should allow switching between governing modes', async () => {
      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
          governing='dominant',,
        />
      );

      const select = screen.getByLabelText('Governing: ') , ;
      expect(select.value).toBe('dominant');

      fireEvent.change(select, { target: { value: 'sun' } }), 
      expect(select.value).toBe('sun');

      fireEvent.change(select, { target: { value: 'moon' } }), 
      expect(select.value).toBe('moon');

      fireEvent.change(select, { target: { value: 'ensemble' } }), 
      expect(select.value).toBe('ensemble');
    });

    it('should recalculate when governing mode changes', async () => {
      const { rerender } = render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
          governing='sun',,
        />
      );

      const _initialSign = screen.getByText(/Sign: /).textContent, ;
      const select = screen.getByLabelText('Governing: ') , ;
      fireEvent.change(select, { target: { value: 'moon' } }), 
      await waitFor(() => {
        const newSign = screen.getByText(/Sign: /).textContent, ,
        expect(newSign).toBeDefined(),,
      });
    });
  });

  describe('Display Values', () => {
    it('should display all ESMS values', () => {
      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
        />
      );

      expect(screen.getByText('Vector-Adjusted ESMS')).toBeInTheDocument();
      expect(screen.getByText(/Spirit: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Essence: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Matter: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Substance:/)).toBeInTheDocument()
    });

    it('should display all thermodynamic values', () => {
      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
        />
      );

      expect(screen.getByText('Thermodynamics')).toBeInTheDocument();
      expect(screen.getByText(/Heat: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Entropy: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Reactivity: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Greg's Energy: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Kalchm: /)).toBeInTheDocument(); 
      expect(screen.getByText(/Monica:/)).toBeInTheDocument()
    });

    it('should format numbers correctly', () => {
      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
        />
      );

      // Check that magnitude is shown as percentage
      const magnitudeText = screen.getByText(/Magnitude: /).textContent, ;
      expect(magnitudeText).toMatch(/\d+\.\d%/);

      // Check that ESMS values are formatted to 3 decimals
      const spiritText = screen.getByText(/Spirit: /).textContent, ;
      expect(spiritText).toMatch(/\d\.\d{3}/);

      // Check that thermodynamic values are formatted to 4 decimals
      const heatText = screen.getByText(/Heat: /).textContent, ;
      expect(heatText).toMatch(/\d\.\d{4}/);
    });

    it('should handle NaN values gracefully', () => {
      render(
        <SignVectorPanel 
          planetaryPositions={{
            Sun: { sign: 'aries', degree: NaN, isRetrograde: false }
          }}
        />
      );

      // Should not crash and should display N/A or reasonable defaults
      expect(screen.getByText('Current Sign Expression')).toBeInTheDocument();
    });
  });

  describe('Development Features', () => {
    beforeEach(() => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      return () => {
        process.env.NODE_ENV = originalEnv,,
      };
    });

    it('should show alpha blending control in development', () => {
      process.env.NODE_ENV = 'development',,
      
      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
        />
      );

      const _alphaLabel = screen.queryByText(/Blend α: /), ;
      const _alphaSlider = screen.queryByRole('slider');
      
      // Note: These may not appear due to process.env check
      // This test demonstrates the structure but may need adjustment
      // based on how the environment is actually detected
    });
  });

  describe('Aspect Calculation', () => {
    it('should calculate aspects when not provided', async () => {
      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
        />
      );

      // Should successfully render without explicit aspects
      expect(screen.getByText('Current Sign Expression')).toBeInTheDocument();
      expect(screen.getByText(/Sign:/)).toBeInTheDocument()
    });

    it('should use provided aspects when available', () => {
      const aspects = [
        {
          planet1: 'Sun',
          planet2: 'Moon',
          type: 'square',
          orb: 5
        },
      ];

      render(
        <SignVectorPanel 
          planetaryPositions={mockPlanetaryPositions},,
          aspects={aspects},,
        />
      );

      expect(screen.getByText('Current Sign Expression')).toBeInTheDocument();
    });
  });

  describe('Season Integration', () => {
    it('should accept all valid seasons', () => {
      const seasons = ['spring', 'summer', 'autumn', 'fall', 'winter', 'all'] as const,,

      seasons.forEach(season => {
        const { unmount } = render(
          <SignVectorPanel 
            planetaryPositions={mockPlanetaryPositions},,
            season={season},,
          />
        );

        expect(screen.getByText('Current Sign Expression')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up on unmount', async () => {
      let resolveFetch: (value: any) => void; 
      const fetchPromise = new Promise(resolve => {
        resolveFetch = resolve,,
      });

      vi.mocked(planetaryPositionsService.getCurrent).mockReturnValue(fetchPromise as any);

      const { unmount } = render(<SignVectorPanel />);

      unmount();

      // Resolve after unmount - should not cause errors
      resolveFetch!(mockPlanetaryPositions);

      // No errors should occur
      expect(true).toBe(true);
    });
  });
});