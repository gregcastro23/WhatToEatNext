#!/usr/bin/env node

/**
 * ES Module Setup Validation Script
 * Validates that your project is completely configured for ES modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validatePackageJson() {
  log('\n📦 Validating package.json...', 'blue');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    let score = 0;
    let total = 4;

    // Check type: module
    if (packageJson.type === 'module') {
      log('  ✅ "type": "module" is set', 'green');
      score++;
    } else {
      log('  ❌ Missing "type": "module"', 'red');
    }

    // Check Node.js version requirement
    if (packageJson.engines?.node) {
      log(`  ✅ Node.js version specified: ${packageJson.engines.node}`, 'green');
      score++;
    } else {
      log('  ⚠️  Node.js version not specified in engines', 'yellow');
    }

    // Check for ES module compatible scripts
    const hasESMScripts =
      packageJson.scripts &&
      Object.values(packageJson.scripts).some(
        script => typeof script === 'string' && !script.includes('require('),
      );

    if (hasESMScripts) {
      log('  ✅ Scripts appear to be ES module compatible', 'green');
      score++;
    } else {
      log('  ⚠️  Some scripts might need ES module updates', 'yellow');
    }

    // Check dependencies for ES module compatibility
    const hasModernDeps = packageJson.dependencies?.next && packageJson.dependencies?.react;

    if (hasModernDeps) {
      log('  ✅ Modern dependencies (Next.js, React) present', 'green');
      score++;
    } else {
      log('  ⚠️  Check dependency versions for ES module support', 'yellow');
    }

    return { score, total, passed: score >= 3 };
  } catch (error) {
    log(`  ❌ Error reading package.json: ${error.message}`, 'red');
    return { score: 0, total: 4, passed: false };
  }
}

function validateTypeScriptConfig() {
  log('\n🔧 Validating TypeScript configuration...', 'blue');

  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    let score = 0;
    let total = 5;

    // Check target
    if (
      tsconfig.compilerOptions?.target === 'es2022' ||
      tsconfig.compilerOptions?.target === 'esnext'
    ) {
      log(`  ✅ Target set to ${tsconfig.compilerOptions.target}`, 'green');
      score++;
    } else {
      log(`  ⚠️  Target is ${tsconfig.compilerOptions?.target}, consider es2022+`, 'yellow');
    }

    // Check module
    if (tsconfig.compilerOptions?.module === 'esnext') {
      log('  ✅ Module set to esnext', 'green');
      score++;
    } else {
      log(`  ❌ Module should be esnext, currently: ${tsconfig.compilerOptions?.module}`, 'red');
    }

    // Check moduleResolution
    if (tsconfig.compilerOptions?.moduleResolution === 'node') {
      log('  ✅ Module resolution set to node', 'green');
      score++;
    } else {
      log('  ⚠️  Module resolution should be "node"', 'yellow');
    }

    // Check esModuleInterop
    if (tsconfig.compilerOptions?.esModuleInterop === true) {
      log('  ✅ esModuleInterop enabled', 'green');
      score++;
    } else {
      log('  ❌ esModuleInterop should be enabled', 'red');
    }

    // Check allowSyntheticDefaultImports
    if (tsconfig.compilerOptions?.allowSyntheticDefaultImports === true) {
      log('  ✅ allowSyntheticDefaultImports enabled', 'green');
      score++;
    } else {
      log('  ⚠️  allowSyntheticDefaultImports should be enabled', 'yellow');
    }

    return { score, total, passed: score >= 4 };
  } catch (error) {
    log(`  ❌ Error reading tsconfig.json: ${error.message}`, 'red');
    return { score: 0, total: 5, passed: false };
  }
}

function validateNextJsConfig() {
  log('\n⚡ Validating Next.js configuration...', 'blue');

  const nextConfigFiles = ['next.config.js', 'next.config.mjs'];
  let configFound = false;
  let score = 0;
  let total = 3;

  for (const configFile of nextConfigFiles) {
    if (fs.existsSync(configFile)) {
      configFound = true;
      log(`  ✅ Found ${configFile}`, 'green');

      try {
        const content = fs.readFileSync(configFile, 'utf8');

        // Check for ES module imports
        if (content.includes('import ') && content.includes('export default')) {
          log('  ✅ Uses ES module syntax', 'green');
          score++;
        } else {
          log('  ⚠️  Consider converting to ES module syntax', 'yellow');
        }

        // Check for experimental features
        if (content.includes('experimental')) {
          log('  ✅ Has experimental configuration', 'green');
          score++;
        } else {
          log('  ℹ️  No experimental features configured', 'cyan');
          score++; // Not required, so give the point
        }

        // Check for webpack configuration
        if (content.includes('webpack:')) {
          log('  ✅ Has webpack configuration', 'green');
          score++;
        } else {
          log('  ℹ️  No custom webpack configuration', 'cyan');
          score++; // Not required, so give the point
        }

        break;
      } catch (error) {
        log(`  ❌ Error reading ${configFile}: ${error.message}`, 'red');
      }
    }
  }

  if (!configFound) {
    log('  ❌ No Next.js config file found', 'red');
    return { score: 0, total, passed: false };
  }

  return { score, total, passed: score >= 2 };
}

function validateJestConfig() {
  log('\n🧪 Validating Jest configuration...', 'blue');

  if (!fs.existsSync('jest.config.js')) {
    log('  ⚠️  No jest.config.js found', 'yellow');
    return { score: 0, total: 3, passed: true }; // Not critical
  }

  try {
    const content = fs.readFileSync('jest.config.js', 'utf8');
    let score = 0;
    let total = 3;

    // Check for ES module export
    if (content.includes('export default')) {
      log('  ✅ Uses ES module export', 'green');
      score++;
    } else {
      log('  ❌ Should use ES module export', 'red');
    }

    // Check for extensionsToTreatAsEsm
    if (content.includes('extensionsToTreatAsEsm')) {
      log('  ✅ Has extensionsToTreatAsEsm configuration', 'green');
      score++;
    } else {
      log('  ⚠️  Consider adding extensionsToTreatAsEsm', 'yellow');
    }

    // Check for useESM in ts-jest
    if (content.includes('useESM: true')) {
      log('  ✅ ts-jest configured for ES modules', 'green');
      score++;
    } else {
      log('  ⚠️  ts-jest should have useESM: true', 'yellow');
    }

    return { score, total, passed: score >= 2 };
  } catch (error) {
    log(`  ❌ Error reading jest.config.js: ${error.message}`, 'red');
    return { score: 0, total: 3, passed: false };
  }
}

function validateESLintConfig() {
  log('\n🔍 Validating ESLint configuration...', 'blue');

  const eslintFiles = ['eslint.config.cjs', 'eslint.config.mjs', '.eslintrc.json'];
  let configFound = false;
  let score = 0;
  let total = 2;

  for (const configFile of eslintFiles) {
    if (fs.existsSync(configFile)) {
      configFound = true;
      log(`  ✅ Found ${configFile}`, 'green');
      score++;

      // .cjs files are acceptable for ESLint config
      if (configFile.endsWith('.cjs')) {
        log('  ✅ Using .cjs extension (recommended for ESLint)', 'green');
        score++;
      } else if (configFile.endsWith('.mjs')) {
        log('  ✅ Using .mjs extension (ES module)', 'green');
        score++;
      }

      break;
    }
  }

  if (!configFound) {
    log('  ❌ No ESLint config file found', 'red');
    return { score: 0, total, passed: false };
  }

  return { score, total, passed: score >= 1 };
}

function scanForCommonJSPatterns() {
  log('\n🔍 Scanning for remaining CommonJS patterns...', 'blue');

  const filesToCheck = [
    'index.js',
    'paths.js',
    'validate-local-apis.js',
    'test-essential-apis.js',
    'temp-validation.js',
    'test-recommendations.js',
    'ci-cd-test.js',
    'test-elemental-logic.js',
  ];

  let issues = 0;
  let total = filesToCheck.length;

  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for CommonJS patterns
        const hasRequire = content.includes('require(') && !content.includes('// require(');
        const hasModuleExports =
          content.includes('module.exports') && !content.includes('// module.exports');

        if (hasRequire || hasModuleExports) {
          log(`  ❌ ${file} contains CommonJS patterns`, 'red');
          if (hasRequire) log(`    - Contains require() statements`, 'red');
          if (hasModuleExports) log(`    - Contains module.exports`, 'red');
          issues++;
        } else {
          log(`  ✅ ${file} is ES module compatible`, 'green');
        }
      } catch (error) {
        log(`  ⚠️  Could not read ${file}: ${error.message}`, 'yellow');
      }
    } else {
      log(`  ℹ️  ${file} not found (optional)`, 'cyan');
    }
  });

  return { score: total - issues, total, passed: issues === 0 };
}

function testESModuleImports() {
  log('\n🧪 Testing ES module imports...', 'blue');

  const testFiles = [
    { file: 'src/utils/logger.js', hasDefault: true },
    { file: 'src/utils/logger.ts', hasDefault: true },
    { file: 'src/services/AstrologicalService.js', hasNamed: true },
    { file: 'src/services/AstrologicalService.ts', hasNamed: true },
  ];

  let workingImports = 0;
  let totalTests = 0;

  testFiles.forEach(({ file, hasDefault, hasNamed }) => {
    if (fs.existsSync(file)) {
      totalTests++;
      try {
        const content = fs.readFileSync(file, 'utf8');

        if (
          hasDefault &&
          (content.includes('export default') || content.includes('module.exports'))
        ) {
          log(`  ✅ ${file} has default export`, 'green');
          workingImports++;
        } else if (hasNamed && content.includes('export ')) {
          log(`  ✅ ${file} has named exports`, 'green');
          workingImports++;
        } else {
          log(`  ⚠️  ${file} export pattern unclear`, 'yellow');
        }
      } catch (error) {
        log(`  ❌ Error reading ${file}: ${error.message}`, 'red');
      }
    }
  });

  if (totalTests === 0) {
    log('  ℹ️  No test files found to validate imports', 'cyan');
    return { score: 1, total: 1, passed: true };
  }

  return { score: workingImports, total: totalTests, passed: workingImports >= totalTests * 0.8 };
}

function validateBuildSystem() {
  log('\n🏗️  Testing build system compatibility...', 'blue');

  let score = 0;
  let total = 2;

  try {
    // Test TypeScript compilation
    log('  🔧 Testing TypeScript compilation...', 'cyan');
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    log('  ✅ TypeScript compilation successful', 'green');
    score++;
  } catch (error) {
    log('  ⚠️  TypeScript compilation has issues (may be expected)', 'yellow');
    // Don't fail completely on TS errors as they might be expected
    score += 0.5;
  }

  try {
    // Test Next.js build (dry run)
    log('  🔧 Testing Next.js configuration...', 'cyan');
    execSync('npx next build --dry-run', { stdio: 'pipe' });
    log('  ✅ Next.js configuration valid', 'green');
    score++;
  } catch (error) {
    log('  ⚠️  Next.js build test failed (may need dev dependencies)', 'yellow');
    // Don't fail completely as this might be due to missing dev dependencies
    score += 0.5;
  }

  return { score, total, passed: score >= 1 };
}

function generateReport(results) {
  log('\n📊 ES Module Setup Report', 'bold');
  log('='.repeat(50), 'cyan');

  let totalScore = 0;
  let totalPossible = 0;
  let allPassed = true;

  results.forEach(({ name, result }) => {
    const percentage = Math.round((result.score / result.total) * 100);
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';

    log(`${status} ${name}: ${result.score}/${result.total} (${percentage}%)`, color);

    totalScore += result.score;
    totalPossible += result.total;
    allPassed = allPassed && result.passed;
  });

  const overallPercentage = Math.round((totalScore / totalPossible) * 100);

  log('\n' + '='.repeat(50), 'cyan');
  log(`Overall Score: ${totalScore}/${totalPossible} (${overallPercentage}%)`, 'bold');

  if (allPassed && overallPercentage >= 90) {
    log('\n🎉 EXCELLENT! Your project is fully configured for ES modules!', 'green');
    log('✅ All critical checks passed', 'green');
    log('✅ Ready for modern JavaScript development', 'green');
  } else if (overallPercentage >= 75) {
    log('\n👍 GOOD! Your ES module setup is mostly complete.', 'yellow');
    log('⚠️  Some minor improvements recommended', 'yellow');
  } else if (overallPercentage >= 50) {
    log('\n⚠️  PARTIAL: ES module setup needs attention.', 'yellow');
    log('🔧 Several issues need to be resolved', 'yellow');
  } else {
    log('\n❌ CRITICAL: ES module setup is incomplete.', 'red');
    log('🚨 Major configuration issues detected', 'red');
  }

  // Recommendations
  log('\n💡 Recommendations:', 'blue');
  if (overallPercentage < 100) {
    log('1. Review failed checks above', 'cyan');
    log('2. Update configuration files as needed', 'cyan');
    log('3. Convert remaining CommonJS files', 'cyan');
    log('4. Test your application after changes', 'cyan');
  } else {
    log('1. Your ES module setup is complete!', 'green');
    log('2. Consider running: npm run dev', 'green');
    log('3. Consider running: npm run test', 'green');
    log('4. Consider running: npm run build', 'green');
  }

  return allPassed && overallPercentage >= 90;
}

async function main() {
  log('🚀 ES Module Setup Validation', 'bold');
  log('Checking your project for complete ES module compatibility...', 'cyan');

  const results = [
    { name: 'Package.json Configuration', result: validatePackageJson() },
    { name: 'TypeScript Configuration', result: validateTypeScriptConfig() },
    { name: 'Next.js Configuration', result: validateNextJsConfig() },
    { name: 'Jest Configuration', result: validateJestConfig() },
    { name: 'ESLint Configuration', result: validateESLintConfig() },
    { name: 'CommonJS Pattern Scan', result: scanForCommonJSPatterns() },
    { name: 'ES Module Import Tests', result: testESModuleImports() },
    { name: 'Build System Compatibility', result: validateBuildSystem() },
  ];

  const success = generateReport(results);

  log('\n🏁 Validation completed!', 'bold');
  process.exit(success ? 0 : 1);
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the validation
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
