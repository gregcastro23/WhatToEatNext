// Custom declaration file for jest-dom to resolve TypeScript errors
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R,
      toBeVisible(): R,
      toBeDisabled(): R,
      toBeEnabled(): R,
      toBeEmpty(): R,
      toBeEmptyDOMElement(): R,
      toBeInvalid(): R,
      toBeRequired(): R,
      toBeValid(): R,
      toContainElement(_element: HTMLElement | null): R,
      toContainHTML(_htmlText: string): R,
      toHaveAccessibleDescription(description?: string | RegExp): R,
      toHaveAccessibleName(name?: string | RegExp): R
      toHaveAttribute(_attr: string, value?: unknown): R,
      toHaveClass(..._classNames: string[]): R,
      toHaveFocus(): R
      toHaveFormValues(_expectedValues: Record<string, unknown>): R
      toHaveStyle(_css: Record<string, unknown>): R
      toHaveTextContent(_text: string | RegExp, options?: { _normalizeWhitespace: boolean }): R,
      toHaveValue(value?: string | string[] | number): R,
      toBeChecked(): R,
      toBePartiallyChecked(): R,
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R,
      toBeInTheDOM(): R
    }
  }
}