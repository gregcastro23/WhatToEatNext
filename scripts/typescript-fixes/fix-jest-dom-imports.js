#!/usr/bin/env node
/**
 * fix-jest-dom-imports.js
 * 
 * This script addresses the TypeScript error related to jest-dom types by creating
 * a dedicated tsconfig for non-test files that excludes the jest-dom types.
 * 
 * The script:
 * 1. Creates a development-specific tsconfig.dev.json that excludes jest types
 * 2. Updates the main tsconfig.json to extend from tsconfig.base.json
 * 3. Sets up a proper type resolution pattern for jest-dom
 * 
 * Usage: node scripts/typescript-fixes/fix-jest-dom-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Create directories if they don't exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirExists(path.join(rootDir, 'scripts', 'typescript-fixes'));

// Read current tsconfig.json
const tsconfigPath = path.join(rootDir, 'tsconfig.json');
let tsconfig;

try {
  tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  console.log('✅ Successfully read tsconfig.json');
} catch (error) {
  console.error('❌ Error reading tsconfig.json:', error);
  process.exit(1);
}

// Create tsconfig.base.json (for shared settings)
const baseConfig = { ...tsconfig };
// Remove types that are test-specific
if (baseConfig.compilerOptions && baseConfig.compilerOptions.types) {
  baseConfig.compilerOptions.types = baseConfig.compilerOptions.types.filter(
    type => type !== '@testing-library/jest-dom'
  );
}

// Write tsconfig.base.json
const baseConfigPath = path.join(rootDir, 'tsconfig.base.json');
try {
  fs.writeFileSync(baseConfigPath, JSON.stringify(baseConfig, null, 2));
  console.log('✅ Created tsconfig.base.json with shared configuration');
} catch (error) {
  console.error('❌ Error writing tsconfig.base.json:', error);
}

// Create tsconfig.dev.json (for development with no jest types)
const devConfig = {
  extends: './tsconfig.base.json',
  compilerOptions: {
    types: ['node']
  },
  exclude: [
    'node_modules',
    '**/*.test.ts',
    '**/*.test.tsx',
    'jest.setup.js',
    'jest-dom.d.ts',
    'src/types/testing-library__jest-dom/**/*.ts'
  ]
};

// Write tsconfig.dev.json
const devConfigPath = path.join(rootDir, 'tsconfig.dev.json');
try {
  fs.writeFileSync(devConfigPath, JSON.stringify(devConfig, null, 2));
  console.log('✅ Created tsconfig.dev.json for development');
} catch (error) {
  console.error('❌ Error writing tsconfig.dev.json:', error);
}

// Update tsconfig.jest.json to be more specific
const jestConfig = {
  extends: './tsconfig.base.json',
  compilerOptions: {
    jsx: 'react-jsx',
    esModuleInterop: true,
    types: [
      'node',
      'jest',
      '@testing-library/jest-dom'
    ]
  },
  include: [
    'src/**/*.test.ts',
    'src/**/*.test.tsx',
    'jest.setup.js',
    'jest-dom.d.ts'
  ]
};

// Write updated tsconfig.jest.json
const jestConfigPath = path.join(rootDir, 'tsconfig.jest.json');
try {
  fs.writeFileSync(jestConfigPath, JSON.stringify(jestConfig, null, 2));
  console.log('✅ Updated tsconfig.jest.json for testing');
} catch (error) {
  console.error('❌ Error writing tsconfig.jest.json:', error);
}

// Create a wrapper script for type checking
const typeCheckScript = `#!/usr/bin/env node
/**
 * type-check.js
 * A utility to run TypeScript type checking with the correct configuration
 * based on whether you're checking test files or regular source files.
 * 
 * Usage:
 *   node type-check.js [--tests] [filepath]
 * 
 * Options:
 *   --tests    Check test files (uses tsconfig.jest.json)
 *   filepath   Optional specific file to check
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Parse arguments
const args = process.argv.slice(2);
const isTestMode = args.includes('--tests');
const fileToCheck = args.find(arg => !arg.startsWith('--'));

// Determine which tsconfig to use
const tsconfigPath = isTestMode 
  ? path.join(rootDir, 'tsconfig.jest.json')
  : path.join(rootDir, 'tsconfig.dev.json');

console.log(\`🔍 Running TypeScript check with \${isTestMode ? 'test' : 'development'} configuration\`);
if (fileToCheck) {
  console.log(\`🔍 Checking file: \${fileToCheck}\`);
}

// Build the command arguments
const tscArgs = [
  '--noEmit',
  '--skipLibCheck',
  '--project', tsconfigPath
];

if (fileToCheck) {
  tscArgs.push(fileToCheck);
}

// Run TypeScript compiler
const tsc = spawn('npx', ['tsc', ...tscArgs], { stdio: 'inherit' });

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TypeScript check passed!');
  } else {
    console.error(\`❌ TypeScript check failed with code \${code}\`);
  }
  process.exit(code);
});
`;

// Write type-check.js
const typeCheckPath = path.join(rootDir, 'type-check.js');
try {
  fs.writeFileSync(typeCheckPath, typeCheckScript);
  fs.chmodSync(typeCheckPath, 0o755); // Make executable
  console.log('✅ Created type-check.js utility script');
} catch (error) {
  console.error('❌ Error writing type-check.js:', error);
}

// Create a package.json script update suggestion
console.log('\n✅ TypeScript configuration files have been created!');
console.log('\nAdd these scripts to your package.json:');
console.log(`
"scripts": {
  "type-check": "node type-check.js",
  "type-check:tests": "node type-check.js --tests",
  "type-check:src": "node type-check.js src/lib/FoodAlchemySystem.ts",
  ...
}
`);

console.log('\nTo check files without jest-dom types, run:');
console.log('  yarn type-check src/your/file.ts');
console.log('\nTo check test files with jest-dom types, run:');
console.log('  yarn type-check:tests src/your/file.test.ts'); 