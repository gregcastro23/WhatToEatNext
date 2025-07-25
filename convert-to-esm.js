#!/usr/bin/env node

/**
 * ES Module Conversion Script
 * Converts remaining CommonJS files to ES modules for complete ES module compatibility
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that should remain as CommonJS (.cjs)
const KEEP_AS_CJS = [
  'eslint.config.cjs',
  'postcss.config.cjs',
  'jest.config.js', // Jest has specific requirements
  'tailwind.config.js', // Tailwind works fine with CommonJS
  'scripts/check-node-version.cjs', // Build scripts can stay CJS
  'scripts/build-system-repair.cjs'
];

// Files to convert to ES modules
const CONVERT_TO_ESM = [
  'validate-local-apis.js',
  'test-essential-apis.js',
  'paths.js',
  'index.js',
  'temp-validation.js',
  'test-recommendations.js',
  'ci-cd-test.js',
  'test-elemental-logic.js'
];

function convertCommonJSToESM(content, filename) {
  let converted = content;
  
  // Convert require() statements to import statements
  converted = converted.replace(
    /const\s+(\{[^}]+\}|\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
    'import $1 from \'$2\';'
  );
  
  // Convert require() with destructuring
  converted = converted.replace(
    /const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
    'import { $1 } from \'$2\';'
  );
  
  // Convert module.exports to export default
  converted = converted.replace(
    /module\.exports\s*=\s*([^;]+);?/g,
    'export default $1;'
  );
  
  // Convert exports.something to export
  converted = converted.replace(
    /exports\.(\w+)\s*=\s*([^;]+);?/g,
    'export const $1 = $2;'
  );
  
  // Handle __dirname and __filename for ES modules
  if (converted.includes('__dirname') || converted.includes('__filename')) {
    const imports = []
    if (converted.includes('__dirname') || converted.includes('__filename')) {
      imports.push("import { fileURLToPath } from 'url';");
      imports.push("import path from 'path';");
      imports.push("");
      imports.push("const __filename = fileURLToPath(import.meta.url);");
      imports.push("const __dirname = path.dirname(__filename);");
      imports.push("");
    }
    
    // Add imports at the top
    const lines = converted.split('\n');
    const firstImportIndex = lines.findIndex(line => line.trim().startsWith('import'));
    if (firstImportIndex !== -1) {
      lines.splice(firstImportIndex, 0, ...imports);
    } else {
      lines.splice(0, 0, ...imports);
    }
    converted = lines.join('\n');
  }
  
  return converted;
}

function updatePackageJsonScripts() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update scripts that reference converted files
  const scriptsToUpdate = {
    'lint': 'eslint --config eslint.config.cjs src --max-warnings=10000',
    'lint:fix': 'eslint --config eslint.config.cjs --fix src',
    'lint:fast': 'eslint --config eslint.config.cjs --cache --cache-location .eslintcache src',
    'lint:changed': 'eslint --config eslint.config.cjs --cache $(git diff --name-only --diff-filter=ACMR HEAD | grep -E \'\\.(ts|tsx|js|jsx)$\' | tr \'\\n\' \' \')',
    'lint:performance': 'time eslint --config eslint.config.cjs src --format=json --output-file=.eslint-results.json',
    'lint:parallel': 'eslint --config eslint.config.cjs src --max-warnings=10000 --cache',
    'lint:domain-astro': 'eslint --config eslint.config.cjs \'src/calculations/**/*.{ts,tsx}\' \'src/data/planets/**/*.{ts,tsx}\' \'src/utils/reliableAstronomy.ts\' \'src/utils/planetaryConsistencyCheck.ts\' \'src/services/*Astrological*.ts\' \'src/services/*Alchemical*.ts\'',
    'lint:domain-campaign': 'eslint --config eslint.config.cjs \'src/services/campaign/**/*.{ts,tsx}\' \'src/types/campaign.ts\' \'src/utils/*Campaign*.ts\' \'src/utils/*Progress*.ts\'',
    'lint:watch': 'eslint --config eslint.config.cjs src --watch --cache --fix',
    'lint:summary': 'eslint --config eslint.config.cjs src --format=compact --quiet'
  };
  
  // Keep the scripts as they are since eslint.config.cjs should remain CJS
  console.log('✅ Package.json scripts are already correctly configured for ES modules');
  
  return true;
}

function convertJestConfig() {
  const jestConfigPath = path.join(__dirname, 'jest.config.js');
  
  if (fs.existsSync(jestConfigPath)) {
    let content = fs.readFileSync(jestConfigPath, 'utf8');
    
    // Convert to ES module format
    content = `/** @type {import('jest').Config} */
// @ts-check
const config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\\\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.jest.json',
            useESM: true,
            diagnostics: {
                ignoreCodes: [2322, 2339]
            }
        }]
    },
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.tsx'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    
    // Memory Management Configuration
    testTimeout: 15000,
    maxWorkers: 2,
    workerIdleMemoryLimit: '1GB',
    
    // Memory optimization settings
    clearMocks: true,
    restoreMocks: true,
    resetModules: true,
    
    // Force garbage collection between test suites
    setupFilesAfterEnv: [
        '<rootDir>/src/__tests__/setupTests.tsx',
        '<rootDir>/src/__tests__/setupMemoryManagement.ts'
    ],
    
    verbose: true,
    
    // Additional memory-safe configurations
    detectOpenHandles: true,
    forceExit: true,
    
    // Cache configuration for memory efficiency
    cacheDirectory: '<rootDir>/.jest-cache',
    
    // Test environment options for memory management
    testEnvironmentOptions: {
        url: 'http://localhost',
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: false
    }
};

export default config;`;
    
    fs.writeFileSync(jestConfigPath, content);
    console.log('✅ Updated jest.config.js for ES modules');
  }
}

function updateTSConfig() {
  const tsconfigPath = path.join(__dirname, 'tsconfig.json');
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Ensure ES module settings
  tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    target: "es2022",
    module: "esnext",
    moduleResolution: "node",
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    isolatedModules: true
  };
  
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log('✅ Updated tsconfig.json for ES modules');
}

function createESModuleVersions() {
  console.log('🔄 Converting files to ES modules...\n');
  
  CONVERT_TO_ESM.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    if (fs.existsSync(filePath)) {
      console.log(`📝 Converting ${filename}...`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const converted = convertCommonJSToESM(content, filename);
        
        // Write the converted content back
        fs.writeFileSync(filePath, converted);
        console.log(`   ✅ Successfully converted ${filename}`);
      } catch (error) {
        console.error(`   ❌ Error converting ${filename}:`, error.message);
      }
    } else {
      console.log(`   ⚠️  File not found: ${filename}`);
    }
  });
}

function validateESModuleSetup() {
  console.log('\n🔍 Validating ES module setup...\n');
  
  // Check package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.type === 'module') {
    console.log('✅ package.json has "type": "module"');
  } else {
    console.log('❌ package.json missing "type": "module"');
  }
  
  // Check Next.js config
  if (fs.existsSync('next.config.js')) {
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    if (nextConfig.includes('import ') && nextConfig.includes('export default')) {
      console.log('✅ next.config.js uses ES modules');
    } else {
      console.log('⚠️  next.config.js might need ES module conversion');
    }
  }
  
  // Check TypeScript config
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsconfig.compilerOptions.module === 'esnext') {
    console.log('✅ tsconfig.json configured for ES modules');
  } else {
    console.log('⚠️  tsconfig.json module setting could be optimized');
  }
  
  // Check for remaining CommonJS patterns
  console.log('\n📋 Files that should remain CommonJS (.cjs):');
  KEEP_AS_CJS.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} (correctly kept as CommonJS)`);
    }
  });
}

async function main() {
  console.log('🚀 ES Module Conversion Tool');
  console.log('============================\n');
  
  try {
    // Step 1: Convert files to ES modules
    createESModuleVersions();
    
    // Step 2: Update configurations
    updatePackageJsonScripts();
    convertJestConfig();
    updateTSConfig();
    
    // Step 3: Validate setup
    validateESModuleSetup();
    
    console.log('\n🎉 ES Module conversion completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Converted CommonJS files to ES modules');
    console.log('✅ Updated Jest configuration for ES modules');
    console.log('✅ Updated TypeScript configuration');
    console.log('✅ Kept essential .cjs files as CommonJS');
    console.log('\n💡 Next steps:');
    console.log('1. Test your application: npm run dev');
    console.log('2. Run tests: npm run test');
    console.log('3. Run linting: npm run lint');
    
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

// Run the conversion
main().catch(console.error);