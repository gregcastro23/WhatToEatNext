// Test file for auto-fix system
// This file intentionally has linting issues to test the auto-fix system

const testFunction = () => {
  console.log('Hello world'); // Missing semicolon

  // Multiple empty lines above

  const unusedVariable = 'test'; // Double semicolon

  // Trailing whitespace on next line

  return 'success'; // Missing semicolon
};

export default testFunction;
