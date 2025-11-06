/// <reference types="jest" />

/**
 * This file provides TypeScript type definitions for the @testing-library/jest-dom library.
 * It declares the custom matchers that jest-dom adds to Jest.
 * This resolves the TypeScript error: "Cannot find type definition file for 'testing-library__jest-dom'."
 */

interface JestMatchers<R> {
  /**
   * Check if an element has a specific CSS class.
   * @example expect(element).toHaveClass('active');
   */
  toHaveClass(className: string | string[]): R;

  /**
   * Check if an element has specific CSS properties.
   * @example expect(element).toHaveStyle({ color: 'red' });
   */
  toHaveStyle(css: string | Record<string, unknown>): R;

  /**
   * Check if an element has specific text content.
   * @example expect(element).toHaveTextContent('Hello World');
   */
  toHaveTextContent(text: string | RegExp): R;

  /**
   * Check if an element has a specific attribute.
   * @example expect(element).toHaveAttribute('data-test-id', 'test');
   */
  toHaveAttribute(attr: string, value?: string | RegExp): R;

  /**
   * Check if an element has specific value.
   * @example expect(element).toHaveValue('Hello World');
   */
  toHaveValue(value: string | string[] | number | null): R;

  /**
   * Check if an element is visible.
   * @example expect(element).toBeVisible();
   */
  toBeVisible(): R;

  /**
   * Check if an element is in the document.
   * @example expect(element).toBeInTheDocument();
   */
  toBeInTheDocument(): R;

  /**
   * Check if an element is disabled.
   * @example expect(element).toBeDisabled();
   */
  toBeDisabled(): R;

  /**
   * Check if an element is enabled.
   * @example expect(element).toBeEnabled();
   */
  toBeEnabled(): R;

  /**
   * Check if an element is checked.
   * @example expect(element).toBeChecked();
   */
  toBeChecked(): R;

  /**
   * Check if an element is empty.
   * @example expect(element).toBeEmpty();
   */
  toBeEmpty(): R;

  /**
   * Check if an element is required.
   * @example expect(element).toBeRequired();
   */
  toBeRequired(): R;

  /**
   * Check if an element is focused.
   * @example expect(element).toHaveFocus();
   */
  toHaveFocus(): R;

  /**
   * Check if an element has a specific form value.
   * @example expect(element).toHaveFormValues({ name: 'value' });
   */
  toHaveFormValues(expectedValues: Record<string, unknown>): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends JestMatchers<R> {}
  }
}

// This module declaration allows TypeScript to recognize the jest-dom types
declare module "@testing-library/jest-dom";
