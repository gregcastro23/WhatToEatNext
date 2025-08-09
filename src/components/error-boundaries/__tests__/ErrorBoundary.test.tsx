import { render, screen } from '@testing-library/react';

import { ComponentErrorBoundary } from '../ComponentErrorBoundary';
import { GlobalErrorBoundary } from '../GlobalErrorBoundary';
import { SafetyInfrastructureProvider } from '../SafetyInfrastructureProvider';

// Mock component that throws an error
function ErrorThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Mock component that works normally
function WorkingComponent() {
  return <div>Working component</div>;
}

describe('Error Boundaries', () => {
  // Suppress console.error for these tests since we expect errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  describe('GlobalErrorBoundary', () => {
    it('should catch and display global errors', () => {
      render(
        <GlobalErrorBoundary>
          <ErrorThrowingComponent />
        </GlobalErrorBoundary>,
      );

      expect(screen.getByText(/Application Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <GlobalErrorBoundary>
          <WorkingComponent />
        </GlobalErrorBoundary>,
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });
  });

  describe('ComponentErrorBoundary', () => {
    it('should catch and display component errors', () => {
      render(
        <ComponentErrorBoundary componentName='TestComponent'>
          <ErrorThrowingComponent />
        </ComponentErrorBoundary>,
      );

      expect(screen.getByText(/TestComponent Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ComponentErrorBoundary componentName='TestComponent'>
          <WorkingComponent />
        </ComponentErrorBoundary>,
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should show themed error for cuisine components', () => {
      render(
        <ComponentErrorBoundary componentName='CuisineRecommender' errorType='cuisine'>
          <ErrorThrowingComponent />
        </ComponentErrorBoundary>,
      );

      expect(screen.getByText(/CuisineRecommender Error/i)).toBeInTheDocument();
    });
  });

  describe('SafetyInfrastructureProvider', () => {
    it('should provide error handling infrastructure', () => {
      render(
        <SafetyInfrastructureProvider>
          <WorkingComponent />
        </SafetyInfrastructureProvider>,
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should handle errors within the infrastructure', () => {
      render(
        <SafetyInfrastructureProvider>
          <ErrorThrowingComponent />
        </SafetyInfrastructureProvider>,
      );

      // Should show the global error boundary fallback
      expect(screen.getByText(/Application Error/i)).toBeInTheDocument();
    });
  });
});
