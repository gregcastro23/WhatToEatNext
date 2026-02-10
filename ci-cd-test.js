// CI/CD Pipeline Test File
// This file contains intentional linting issues that should be auto-fixed by the pipeline

var unusedVariable = "this should be const"; // prefer-const error
let testVariable = null;

function testFunction(arg1, arg2, unused) {
  // unused-vars warning
  if (testVariable != null) {
    // eqeqeq error (should be !==)
    console.log("Testing CI/CD pipeline effectiveness");
    return arg1 + arg2;
  }
  return 0;
}

// This tests the automated linting fixes in our GitHub Actions workflow
export default testFunction;
