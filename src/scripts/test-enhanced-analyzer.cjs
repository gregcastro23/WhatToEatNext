#!/usr/bin/env node

/**
 * Test the enhanced unused variable analyzer with astrological domain detection
 */

const UnusedVariableAnalyzer = require("./unused-variable-analyzer.cjs");

console.log("🧪 Testing Enhanced Unused Variable Analyzer...\n");

const analyzer = new UnusedVariableAnalyzer();

// Test astrological domain detection
console.log("Testing astrological domain variables...");

const testVariables = [
  {
    variableName: "mercury",
    filePath: "/src/calculations/planetary.ts",
    message: "'mercury' is defined but never used",
  },
  {
    variableName: "fireElement",
    filePath: "/src/calculations/elemental.ts",
    message: "'fireElement' is defined but never used",
  },
  {
    variableName: "planetaryPositions",
    filePath: "/src/utils/astronomy.ts",
    message: "'planetaryPositions' is defined but never used",
  },
  {
    variableName: "retrograde",
    filePath: "/src/calculations/aspects.ts",
    message: "'retrograde' is defined but never used",
  },
  {
    variableName: "data",
    filePath: "/src/utils/generic.ts",
    message: "'data' is defined but never used",
  },
];

testVariables.forEach((testVar, index) => {
  console.log(`\n${index + 1}. Testing variable: ${testVar.variableName}`);

  const result = analyzer.analyzeVariable({
    filePath: testVar.filePath,
    line: 10,
    column: 5,
    message: testVar.message,
    ruleId: "@typescript-eslint/no-unused-vars",
    severity: 2,
  });

  console.log(`   File: ${result.relativePath}`);
  console.log(`   Variable: ${result.variableName}`);
  console.log(`   Should Preserve: ${result.preservation.shouldPreserve}`);
  console.log(`   Domain: ${result.preservation.domain}`);
  console.log(`   Category: ${result.preservation.category || "N/A"}`);
  console.log(`   Confidence: ${result.preservation.confidence}`);
  console.log(`   Reason: ${result.preservation.reason}`);
  console.log(`   Detector: ${result.preservation.detector || "N/A"}`);
  console.log(`   Elimination Strategy: ${result.eliminationStrategy.method}`);
});

// Add campaign system variables to test
const campaignVariables = [
  {
    variableName: "campaign",
    filePath: "/src/services/campaign/controller.ts",
    message: "'campaign' is defined but never used",
  },
  {
    variableName: "metrics",
    filePath: "/src/services/campaign/metrics.ts",
    message: "'metrics' is defined but never used",
  },
  {
    variableName: "progress",
    filePath: "/src/services/campaign/progress.ts",
    message: "'progress' is defined but never used",
  },
];

// Add test file variables to test
const testFileVariables = [
  {
    variableName: "describe",
    filePath: "/src/components/__tests__/Button.test.ts",
    message: "'describe' is defined but never used",
  },
  {
    variableName: "mock",
    filePath: "/src/services/__tests__/api.test.ts",
    message: "'mock' is defined but never used",
  },
  {
    variableName: "recipe",
    filePath: "/src/data/__tests__/recipes.test.ts",
    message: "'recipe' is defined but never used",
  },
];

console.log("\n🔬 Testing campaign system variables...");
campaignVariables.forEach((testVar, index) => {
  console.log(
    `\n${testVariables.length + index + 1}. Testing variable: ${testVar.variableName}`,
  );

  const result = analyzer.analyzeVariable({
    filePath: testVar.filePath,
    line: 10,
    column: 5,
    message: testVar.message,
    ruleId: "@typescript-eslint/no-unused-vars",
    severity: 2,
  });

  console.log(`   File: ${result.relativePath}`);
  console.log(`   Variable: ${result.variableName}`);
  console.log(`   Should Preserve: ${result.preservation.shouldPreserve}`);
  console.log(`   Domain: ${result.preservation.domain}`);
  console.log(`   Category: ${result.preservation.category || "N/A"}`);
  console.log(`   Confidence: ${result.preservation.confidence}`);
  console.log(`   Reason: ${result.preservation.reason}`);
  console.log(`   Detector: ${result.preservation.detector || "N/A"}`);
  console.log(`   Elimination Strategy: ${result.eliminationStrategy.method}`);
});

console.log("\n🧪 Testing test file variables...");
testFileVariables.forEach((testVar, index) => {
  console.log(
    `\n${testVariables.length + campaignVariables.length + index + 1}. Testing variable: ${testVar.variableName}`,
  );

  const result = analyzer.analyzeVariable({
    filePath: testVar.filePath,
    line: 10,
    column: 5,
    message: testVar.message,
    ruleId: "@typescript-eslint/no-unused-vars",
    severity: 2,
  });

  console.log(`   File: ${result.relativePath}`);
  console.log(`   Variable: ${result.variableName}`);
  console.log(`   Should Preserve: ${result.preservation.shouldPreserve}`);
  console.log(`   Domain: ${result.preservation.domain}`);
  console.log(`   Category: ${result.preservation.category || "N/A"}`);
  console.log(`   Confidence: ${result.preservation.confidence}`);
  console.log(`   Reason: ${result.preservation.reason}`);
  console.log(`   Detector: ${result.preservation.detector || "N/A"}`);
  console.log(`   Elimination Strategy: ${result.eliminationStrategy.method}`);
});

console.log("\n📊 Summary:");
const allTestVariables = [
  ...testVariables,
  ...campaignVariables,
  ...testFileVariables,
];
const preserved = allTestVariables.filter((testVar, i) => {
  const result = analyzer.analyzeVariable({
    filePath: testVar.filePath,
    line: 10,
    column: 5,
    message: testVar.message,
    ruleId: "@typescript-eslint/no-unused-vars",
    severity: 2,
  });
  return result.preservation.shouldPreserve;
});

console.log(`   Total variables tested: ${allTestVariables.length}`);
console.log(`   Variables preserved: ${preserved.length}`);
console.log(
  `   Variables for elimination: ${allTestVariables.length - preserved.length}`,
);

console.log("\n🎉 Enhanced analyzer test completed!");
