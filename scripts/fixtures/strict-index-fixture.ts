/**
 * Dedicated fixture for testing checkStrictIndex CLI --file inspection.
 * Produces a TS2375/TS2322 error under exactOptionalPropertyTypes: true
 * so the test suite never relies on live production code debt.
 */

interface ExactOptionalTarget {
  optionalProp?: string;
}

export const fixtureWithExactOptionalError: ExactOptionalTarget = {
  optionalProp: undefined,
};
