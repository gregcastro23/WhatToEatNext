#!/usr/bin/env node

/**
 * Test Error Handler Fixes
 *
 * This script tests if the errorHandler fixes are working properly
 */

// Use CommonJS format instead of ESM
const { errorHandler } = require("./src/services/errorHandler");

console.log("🧪 Testing Error Handler Fixes");
console.log("=".repeat(50));

// Test logError method
try {
  console.log("\n1. Testing logError method...");
  const result = errorHandler.logError(new Error("Test error"), {
    context: "TestScript",
    data: { test: true },
  });

  if (result && result.handled) {
    console.log("✅ logError method works!");
  } else {
    console.log("❌ logError method failed");
  }
} catch (error) {
  console.log(`❌ logError test failed with error: ${error.message}`);
}

// Test warnNullValue method
try {
  console.log("\n2. Testing warnNullValue method...");
  errorHandler.warnNullValue("testVariable", "TestScript", null);
  console.log("✅ warnNullValue method works!");
} catch (error) {
  console.log(`❌ warnNullValue test failed with error: ${error.message}`);
}

// Test handlePropertyAccessError method
try {
  console.log("\n3. Testing handlePropertyAccessError method...");
  errorHandler.handlePropertyAccessError(
    new TypeError("Cannot read properties of undefined (reading 'prop')"),
    "obj.prop",
    "TestScript",
  );
  console.log("✅ handlePropertyAccessError method works!");
} catch (error) {
  console.log(
    `❌ handlePropertyAccessError test failed with error: ${error.message}`,
  );
}

console.log("\n✅ All tests completed!");
