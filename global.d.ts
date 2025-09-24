// Global type definitions

// Add @testing-library/jest-dom matchers
interface JestMatchers<R> {
  toBeInTheDocument(): R;
  toBeVisible(): R;
  toBeEmpty(): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toBeInvalid(): R;
  toBeRequired(): R;
  toBeValid(): R;
  toContainElement(element: HTMLElement | null): R;
  toContainHTML(htmlText: string): R;
  toHaveAttribute(attr: string, value?: string | RegExp): R;
  toHaveClass(...classNames: string[]): R;
  toHaveFocus(): R;
  toHaveFormValues(expectedValues: Record<string, any>): R;
  toHaveStyle(css: string | Record<string, any>): R;
  toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
  toHaveValue(value?: string | string[] | number): R;
  toBeChecked(): R;
  toHaveDescription(text?: string | RegExp): R;
  toHaveAccessibleDescription(text?: string | RegExp): R;
  toHaveAccessibleName(text?: string | RegExp): R;
  toBePartiallyChecked(): R;
}

// Other global types can be added here
