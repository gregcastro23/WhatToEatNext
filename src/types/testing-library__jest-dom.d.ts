/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/**
 * Type definitions for @testing-library/jest-dom
 * _Project: https://github.com/testing-library/jest-dom
 */

// This trick makes TypeScript treat this as a module rather than a script
export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      // DOM node matchers
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeEmpty(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toContainElement(_element: HTMLElement | null): R;
      toContainHTML(_htmlText: string): R;
      toHaveAttribute(_attr: string, value?: string | RegExp): R;
      toHaveClass(..._classNames: string[]): R;
      toHaveFocus(): R;
      toHaveFormValues(_expectedValues: Record<string, unknown>): R;
      toHaveStyle(_css: string | Record<string, unknown>): R;
      toHaveTextContent(
        text: string | RegExp,
        options?: { _normalizeWhitespace: boolean },
      ): R;
      toHaveValue(value?: string | string[] | number): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveAccessibleDescription(text: string | RegExp): R;
      toHaveAccessibleName(text: string | RegExp): R;
      // ... add any other matchers that might be missing
    }
  }
}
