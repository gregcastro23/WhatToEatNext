#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Fixing MainPageWorkflows.test.tsx parsing errors...');

const filePath = 'src/__tests__/e2e/MainPageWorkflows.test.tsx';

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Fix void jest.mock calls
content = content.replace(/void jest\.mock\(/g, 'jest.mock(');

// Fix malformed type annotations
content = content.replace(/recipe, s: string\[\]/g, 'recipes: string[]');

// Fix malformed object properties in jest.mock
content = content.replace(/push: jest\.fn\(\),\s*back:/g, 'push: jest.fn(), back:');
content = content.replace(/debug: jest\.fn\(\),\s*info:/g, 'debug: jest.fn(), info:');

// Fix any remaining comma issues in object literals
content = content.replace(/,\s*,/g, ',');

// Fix malformed function signatures
content = content.replace(/\(\): any \{/g, '(): any {');

// Fix any malformed template literals or expressions
content = content.replace(/\$\{([^}]*),([^}]*)\}/g, '${$1$2}');

// Write the fixed content back
fs.writeFileSync(filePath, content);

console.log('✅ Fixed MainPageWorkflows.test.tsx');

// Check if there are still parsing errors in this file
const { execSync } = require('child_process');
try {
  const result = execSync(`yarn lint ${filePath} 2>&1 | grep -c "Parsing error" || echo "0"`, { encoding: 'utf8' });
  const errorCount = parseInt(result.trim());
  console.log(`📊 Remaining parsing errors in this file: ${errorCount}`);
} catch (error) {
  console.log('Could not check remaining errors');
}
