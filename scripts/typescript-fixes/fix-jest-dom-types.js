#!/usr/bin/env node

/**
 * Jest-Dom TypeScript Fix Script
 * 
 * This script verifies the Jest-Dom type setup and fixes common issues
 * related to testing-library/jest-dom TypeScript errors.
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
log('🧪 Jest-Dom TypeScript Fix Script', colors.cyan);
log('===============================', colors.cyan);

// Verify package dependencies
log('\n📦 Verifying dependencies...', colors.blue);

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  log('✅ Found package.json', colors.green);
} catch (error) {
  log(`❌ Error reading package.json: ${error.message}`, colors.red);
  process.exit(1);
}

// Check for required packages
const requiredPackages = {
  '@testing-library/jest-dom': 'devDependencies',
  '@types/testing-library__jest-dom': 'devDependencies',
};

let missingPackages = [];

for (const [pkg, depType] of Object.entries(requiredPackages)) {
  if (!packageJson[depType] || !packageJson[depType][pkg]) {
    missingPackages.push(pkg);
    log(`❌ Missing package: ${pkg} in ${depType}`, colors.red);
  } else {
    log(`✅ Found ${pkg} v${packageJson[depType][pkg]}`, colors.green);
  }
}

if (missingPackages.length > 0) {
  log(`\n⚠️ Missing packages. Running yarn add -D ${missingPackages.join(' ')}...`, colors.yellow);
  try {
    execSync(`yarn add -D ${missingPackages.join(' ')}`, { stdio: 'inherit' });
    log('✅ Packages installed successfully', colors.green);
  } catch (error) {
    log(`❌ Error installing packages: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Verify type declaration files
log('\n📄 Verifying type declaration files...', colors.blue);

const typeFiles = [
  { 
    path: 'src/types/testing-library__jest-dom/index.d.ts',
    required: true,
    content: `import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      // DOM node matchers
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
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveAccessibleDescription(text: string | RegExp): R;
      toHaveAccessibleName(text: string | RegExp): R;
      toHaveErrorMessage(text: string | RegExp): R;
    }
  }
}

export {};`
  }
];

for (const file of typeFiles) {
  const filePath = path.resolve(process.cwd(), file.path);
  const dirPath = path.dirname(filePath);
  
  if (!fs.existsSync(dirPath)) {
    log(`📁 Creating directory: ${dirPath}`, colors.yellow);
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    if (file.required) {
      log(`📝 Creating required file: ${file.path}`, colors.yellow);
      fs.writeFileSync(filePath, file.content);
      log(`✅ Created ${file.path}`, colors.green);
    } else {
      log(`⚠️ Optional file not found: ${file.path}`, colors.yellow);
    }
  } else {
    log(`✅ Found ${file.path}`, colors.green);
  }
}

// Update tsconfig.json
log('\n⚙️ Updating tsconfig.json...', colors.blue);

const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
let tsconfig;

try {
  tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  log('✅ Found tsconfig.json', colors.green);
} catch (error) {
  log(`❌ Error reading tsconfig.json: ${error.message}`, colors.red);
  process.exit(1);
}

// Update types array
if (!tsconfig.compilerOptions.types) {
  tsconfig.compilerOptions.types = [];
}

if (!tsconfig.compilerOptions.types.includes('@testing-library/jest-dom')) {
  tsconfig.compilerOptions.types.push('@testing-library/jest-dom');
  log('📝 Added @testing-library/jest-dom to compilerOptions.types', colors.yellow);
} else {
  log('✅ @testing-library/jest-dom already in compilerOptions.types', colors.green);
}

// Update include array
if (!tsconfig.include) {
  tsconfig.include = [];
}

const typePath = 'src/types/testing-library__jest-dom/index.d.ts';
if (!tsconfig.include.includes(typePath)) {
  tsconfig.include.push(typePath);
  log(`📝 Added ${typePath} to include array`, colors.yellow);
} else {
  log(`✅ ${typePath} already in include array`, colors.green);
}

// Write updated tsconfig
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
log('✅ Updated tsconfig.json', colors.green);

// Check jest.setup.js
log('\n🧪 Checking jest.setup.js...', colors.blue);

const jestSetupPath = path.resolve(process.cwd(), 'jest.setup.js');

if (fs.existsSync(jestSetupPath)) {
  const jestSetupContent = fs.readFileSync(jestSetupPath, 'utf8');
  
  if (!jestSetupContent.includes("import '@testing-library/jest-dom'")) {
    log('⚠️ jest.setup.js doesn\'t import @testing-library/jest-dom', colors.yellow);
    
    // Add import at the beginning of the file
    const updatedContent = `import '@testing-library/jest-dom';\n${jestSetupContent}`;
    fs.writeFileSync(jestSetupPath, updatedContent);
    log('✅ Updated jest.setup.js with missing import', colors.green);
  } else {
    log('✅ jest.setup.js correctly imports @testing-library/jest-dom', colors.green);
  }
} else {
  log('⚠️ jest.setup.js not found. Consider creating it.', colors.yellow);
}

// Run type check to verify the fix
log('\n🔍 Running type check to verify the fix...', colors.blue);

try {
  execSync('yarn tsc --noEmit', { stdio: 'inherit' });
  log('✅ TypeScript compilation successful!', colors.green);
} catch (error) {
  log('⚠️ TypeScript still has some errors, but jest-dom types should now be fixed', colors.yellow);
}

log('\n🎉 Jest-Dom TypeScript fix script completed!', colors.cyan);
log('You may still need to address other TypeScript errors in your codebase.', colors.cyan); 