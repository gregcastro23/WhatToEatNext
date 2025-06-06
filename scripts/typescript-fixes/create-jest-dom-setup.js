#!/usr/bin/env node

/**
 * Jest-Dom Setup Script
 * 
 * This script creates or updates the necessary files for proper jest-dom setup.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Log message with color
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

// Display header
log('🧪 Jest-Dom Setup Script', colors.cyan);
log('======================', colors.cyan);

// Create src/__tests__/setupTests.ts if it doesn't exist
const setupTestsDir = path.resolve(process.cwd(), 'src/__tests__');
const setupTestsPath = path.resolve(setupTestsDir, 'setupTests.ts');

if (!fs.existsSync(setupTestsDir)) {
  log(`📁 Creating directory: ${setupTestsDir}`, colors.yellow);
  fs.mkdirSync(setupTestsDir, { recursive: true });
}

if (!fs.existsSync(setupTestsPath)) {
  log(`📝 Creating setupTests.ts`, colors.yellow);
  const setupTestsContent = `// Jest setup
import '@testing-library/jest-dom';

// Add any custom matchers or global test setup here
`;
  fs.writeFileSync(setupTestsPath, setupTestsContent);
  log(`✅ Created ${setupTestsPath}`, colors.green);
} else {
  log(`✅ setupTests.ts already exists`, colors.green);
  
  // Check if it imports jest-dom
  const setupTestsContent = fs.readFileSync(setupTestsPath, 'utf8');
  if (!setupTestsContent.includes("import '@testing-library/jest-dom'")) {
    log(`📝 Updating setupTests.ts to import jest-dom`, colors.yellow);
    const updatedContent = `import '@testing-library/jest-dom';\n${setupTestsContent}`;
    fs.writeFileSync(setupTestsPath, updatedContent);
    log(`✅ Updated setupTests.ts`, colors.green);
  }
}

// Create or update tsconfig.jest.json
const tsconfigJestPath = path.resolve(process.cwd(), 'tsconfig.jest.json');
let tsconfigJest;

if (fs.existsSync(tsconfigJestPath)) {
  log(`✅ tsconfig.jest.json already exists`, colors.green);
  try {
    tsconfigJest = JSON.parse(fs.readFileSync(tsconfigJestPath, 'utf8'));
  } catch (error) {
    log(`❌ Error reading tsconfig.jest.json: ${error.message}`, colors.red);
    process.exit(1);
  }
} else {
  log(`📝 Creating tsconfig.jest.json`, colors.yellow);
  tsconfigJest = {
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "jsx": "react-jsx",
      "esModuleInterop": true,
      "types": ["node", "jest", "@testing-library/jest-dom"]
    },
    "include": [
      "src/**/*.ts",
      "src/**/*.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "jest.setup.js",
      "jest-dom.d.ts",
      "src/types/testing-library__jest-dom/index.d.ts"
    ]
  };
}

// Ensure types includes @testing-library/jest-dom
if (!tsconfigJest.compilerOptions) {
  tsconfigJest.compilerOptions = {};
}

if (!tsconfigJest.compilerOptions.types) {
  tsconfigJest.compilerOptions.types = ["node", "jest", "@testing-library/jest-dom"];
  log(`📝 Added types to tsconfig.jest.json`, colors.yellow);
} else if (!tsconfigJest.compilerOptions.types.includes("@testing-library/jest-dom")) {
  tsconfigJest.compilerOptions.types.push("@testing-library/jest-dom");
  log(`📝 Added @testing-library/jest-dom to types in tsconfig.jest.json`, colors.yellow);
}

// Ensure include contains our type definition
if (!tsconfigJest.include) {
  tsconfigJest.include = [
    "src/**/*.ts",
    "src/**/*.tsx",
    "**/*.test.ts",
    "**/*.test.tsx",
    "jest.setup.js",
    "jest-dom.d.ts",
    "src/types/testing-library__jest-dom/index.d.ts"
  ];
} else if (!tsconfigJest.include.includes("src/types/testing-library__jest-dom/index.d.ts")) {
  tsconfigJest.include.push("src/types/testing-library__jest-dom/index.d.ts");
  log(`📝 Added type definition path to include in tsconfig.jest.json`, colors.yellow);
}

// Write updated tsconfig.jest.json
fs.writeFileSync(tsconfigJestPath, JSON.stringify(tsconfigJest, null, 2));
log(`✅ Updated tsconfig.jest.json`, colors.green);

// Add a jest-dom type script to package.json scripts
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  log('✅ Found package.json', colors.green);
} catch (error) {
  log(`❌ Error reading package.json: ${error.message}`, colors.red);
  process.exit(1);
}

// Add script if it doesn't exist
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

if (!packageJson.scripts['fix:jest-dom-types']) {
  packageJson.scripts['fix:jest-dom-types'] = 'node scripts/typescript-fixes/fix-jest-dom-types.js';
  log(`📝 Added fix:jest-dom-types script to package.json`, colors.yellow);

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  log(`✅ Updated package.json`, colors.green);
} else {
  log(`✅ fix:jest-dom-types script already exists in package.json`, colors.green);
}

// Run the fix-jest-dom-types script
log('\n🔧 Running fix:jest-dom-types script...', colors.blue);
try {
  execSync('yarn fix:jest-dom-types', { stdio: 'inherit' });
  log('✅ Successfully ran fix:jest-dom-types script', colors.green);
} catch (error) {
  log(`⚠️ Fix script completed with some warnings`, colors.yellow);
}

log('\n🎉 Jest-Dom setup complete!', colors.cyan);
log('You can run tests with: yarn test', colors.cyan); 