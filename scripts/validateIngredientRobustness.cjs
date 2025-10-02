#!/usr/bin/env node

/**
 * Ingredient Robustness Validation Script
 *
 * This script ensures ALL ingredient files are properly robust for downstream calculations:
 * 1. Elemental properties exist and sum to exactly 1.0
 * 2. All required fields are present (name, elementalProperties)
 * 3. Data types match type definitions
 * 4. No undefined or null values in critical fields
 * 5. Optional recommended fields for complete calculations
 *
 * Usage: node scripts/validateIngredientRobustness.cjs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const INGREDIENTS_DIR = path.join(__dirname, '..', 'src', 'data', 'ingredients');
const TOLERANCE = 0.001;

// Validation results
const results = {
  totalFiles: 0,
  totalIngredients: 0,
  validIngredients: 0,
  invalidIngredients: 0,
  incompleteIngredients: 0,
  issues: [],
  summary: {
    missingElementals: 0,
    invalidElementalSum: 0,
    missingRequiredFields: 0,
    invalidDataTypes: 0,
    incompleteProperties: 0,
    missingRecommendedFields: 0
  }
};

/**
 * Required fields for basic functionality (IngredientMapping interface)
 */
const REQUIRED_FIELDS = ['name', 'elementalProperties'];

/**
 * Recommended fields for robust calculations
 */
const RECOMMENDED_FIELDS = [
  'qualities',
  'category',
  'astrologicalProfile'
];

/**
 * Validate elemental properties
 */
function validateElementalProperties(ingredient, ingredientKey, fileName) {
  const issues = [];
  const elementals = ingredient.elementalProperties;

  // Check existence
  if (!elementals) {
    issues.push({
      severity: 'CRITICAL',
      type: 'MISSING_ELEMENTALS',
      ingredient: ingredientKey,
      file: fileName,
      message: 'Missing elementalProperties'
    });
    results.summary.missingElementals++;
    return issues;
  }

  // Check all four elements exist
  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
  let hasAllElements = true;

  for (const element of requiredElements) {
    if (typeof elementals[element] !== 'number') {
      issues.push({
        severity: 'CRITICAL',
        type: 'INVALID_ELEMENTAL',
        ingredient: ingredientKey,
        file: fileName,
        message: `Missing or invalid ${element} property`,
        details: `Expected number, got ${typeof elementals[element]}`
      });
      hasAllElements = false;
    }
  }

  if (!hasAllElements) return issues;

  // Check sum equals 1.0
  const sum = elementals.Fire + elementals.Water + elementals.Earth + elementals.Air;
  if (Math.abs(sum - 1.0) > TOLERANCE) {
    issues.push({
      severity: 'ERROR',
      type: 'INVALID_SUM',
      ingredient: ingredientKey,
      file: fileName,
      message: `Elemental properties sum to ${sum.toFixed(3)}, expected 1.000`,
      details: `Fire: ${elementals.Fire}, Water: ${elementals.Water}, Earth: ${elementals.Earth}, Air: ${elementals.Air}`
    });
    results.summary.invalidElementalSum++;
  }

  // Check all values are between 0 and 1
  for (const element of requiredElements) {
    const value = elementals[element];
    if (typeof value === 'number' && (value < 0 || value > 1)) {
      issues.push({
        severity: 'ERROR',
        type: 'OUT_OF_RANGE',
        ingredient: ingredientKey,
        file: fileName,
        message: `${element} value ${value} is out of range [0, 1]`
      });
    }
  }

  return issues;
}

/**
 * Validate required fields exist
 */
function validateRequiredFields(ingredient, ingredientKey, fileName) {
  const issues = [];

  for (const field of REQUIRED_FIELDS) {
    if (!(field in ingredient) || ingredient[field] === undefined || ingredient[field] === null) {
      issues.push({
        severity: 'CRITICAL',
        type: 'MISSING_REQUIRED',
        ingredient: ingredientKey,
        file: fileName,
        message: `Missing required field: ${field}`
      });
      results.summary.missingRequiredFields++;
    }
  }

  // Check name is non-empty string
  if (ingredient.name && typeof ingredient.name === 'string' && ingredient.name.trim() === '') {
    issues.push({
      severity: 'ERROR',
      type: 'INVALID_VALUE',
      ingredient: ingredientKey,
      file: fileName,
      message: 'Ingredient name is empty'
    });
  }

  return issues;
}

/**
 * Validate recommended fields for robustness
 */
function validateRecommendedFields(ingredient, ingredientKey, fileName) {
  const issues = [];
  let missing = 0;

  for (const field of RECOMMENDED_FIELDS) {
    if (!(field in ingredient) || ingredient[field] === undefined) {
      issues.push({
        severity: 'WARNING',
        type: 'MISSING_RECOMMENDED',
        ingredient: ingredientKey,
        file: fileName,
        message: `Missing recommended field: ${field}`,
        impact: 'May limit downstream calculation accuracy and completeness'
      });
      missing++;
    }
  }

  if (missing > 0) {
    results.summary.missingRecommendedFields += missing;
    results.summary.incompleteProperties++;
  }

  return issues;
}

/**
 * Validate data types
 */
function validateDataTypes(ingredient, ingredientKey, fileName) {
  const issues = [];

  // name should be string
  if (ingredient.name && typeof ingredient.name !== 'string') {
    issues.push({
      severity: 'ERROR',
      type: 'INVALID_TYPE',
      ingredient: ingredientKey,
      file: fileName,
      message: 'name should be a string',
      details: `Got ${typeof ingredient.name}`
    });
    results.summary.invalidDataTypes++;
  }

  // qualities should be array (if present)
  if (ingredient.qualities && !Array.isArray(ingredient.qualities)) {
    issues.push({
      severity: 'ERROR',
      type: 'INVALID_TYPE',
      ingredient: ingredientKey,
      file: fileName,
      message: 'qualities should be an array',
      details: `Got ${typeof ingredient.qualities}`
    });
    results.summary.invalidDataTypes++;
  }

  // category should be string (if present)
  if (ingredient.category && typeof ingredient.category !== 'string') {
    issues.push({
      severity: 'ERROR',
      type: 'INVALID_TYPE',
      ingredient: ingredientKey,
      file: fileName,
      message: 'category should be a string',
      details: `Got ${typeof ingredient.category}`
    });
    results.summary.invalidDataTypes++;
  }

  // astrologicalProfile should be object (if present)
  if (ingredient.astrologicalProfile && typeof ingredient.astrologicalProfile !== 'object') {
    issues.push({
      severity: 'ERROR',
      type: 'INVALID_TYPE',
      ingredient: ingredientKey,
      file: fileName,
      message: 'astrologicalProfile should be an object',
      details: `Got ${typeof ingredient.astrologicalProfile}`
    });
    results.summary.invalidDataTypes++;
  }

  // origin should be array (if present)
  if (ingredient.origin && !Array.isArray(ingredient.origin)) {
    issues.push({
      severity: 'ERROR',
      type: 'INVALID_TYPE',
      ingredient: ingredientKey,
      file: fileName,
      message: 'origin should be an array',
      details: `Got ${typeof ingredient.origin}`
    });
    results.summary.invalidDataTypes++;
  }

  return issues;
}

/**
 * Validate a single ingredient
 */
function validateIngredient(ingredient, ingredientKey, fileName) {
  const issues = [];

  // Run all validation checks
  issues.push(...validateRequiredFields(ingredient, ingredientKey, fileName));
  issues.push(...validateElementalProperties(ingredient, ingredientKey, fileName));
  issues.push(...validateDataTypes(ingredient, ingredientKey, fileName));
  issues.push(...validateRecommendedFields(ingredient, ingredientKey, fileName));

  return issues;
}

/**
 * Process a single ingredient file
 */
function processFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if file has ingredient data (look for raw* variables)
    // Updated regex to handle type annotations: const rawName: Type = {
    const rawVarMatch = content.match(/const\s+(raw\w+)(?::\s*[^=]+)?\s*=\s*{/);
    if (!rawVarMatch) {
      // Skip files without raw ingredient objects
      return;
    }

    results.totalFiles++;

    // Extract the raw object content
    const rawVarName = rawVarMatch[1];
    const objStartIdx = content.indexOf(rawVarName) + rawVarName.length;

    // Find the object boundaries
    let braceCount = 0;
    let startIdx = -1;
    let endIdx = -1;

    for (let i = objStartIdx; i < content.length; i++) {
      if (content[i] === '{') {
        if (braceCount === 0) startIdx = i;
        braceCount++;
      } else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    if (startIdx === -1 || endIdx === -1) {
      results.issues.push({
        severity: 'ERROR',
        type: 'PARSE_ERROR',
        file: relativePath,
        message: 'Could not parse ingredient object boundaries'
      });
      return;
    }

    const objContent = content.substring(startIdx, endIdx);

    // Simple pattern to extract ingredient keys
    // Look for keys at the first level of indentation
    const ingredientKeyMatches = objContent.matchAll(/^\s{2}(\w+):\s*{/gm);

    let hasIngredients = false;
    for (const match of ingredientKeyMatches) {
      hasIngredients = true;
      const ingredientKey = match[1];
      results.totalIngredients++;

      // Extract this specific ingredient object
      const keyIdx = match.index;
      const ingredientObjStart = objContent.indexOf('{', keyIdx);

      let braces = 0;
      let ingredientObjEnd = -1;
      for (let i = ingredientObjStart; i < objContent.length; i++) {
        if (objContent[i] === '{') braces++;
        else if (objContent[i] === '}') {
          braces--;
          if (braces === 0) {
            ingredientObjEnd = i + 1;
            break;
          }
        }
      }

      if (ingredientObjEnd === -1) continue;

      const ingredientObjStr = objContent.substring(ingredientObjStart, ingredientObjEnd);

      // Extract key properties using regex (simpler than eval)
      const ingredient = { _key: ingredientKey };

      // Extract name
      const nameMatch = ingredientObjStr.match(/name:\s*['"](.*?)['"]/);
      if (nameMatch) ingredient.name = nameMatch[1];

      // Extract elemental properties
      const elementalsMatch = ingredientObjStr.match(/elementalProperties:\s*{([^}]+)}/);
      if (elementalsMatch) {
        const elementalStr = elementalsMatch[1];
        ingredient.elementalProperties = {};

        const fireMatch = elementalStr.match(/Fire:\s*([\d.]+)/);
        const waterMatch = elementalStr.match(/Water:\s*([\d.]+)/);
        const earthMatch = elementalStr.match(/Earth:\s*([\d.]+)/);
        const airMatch = elementalStr.match(/Air:\s*([\d.]+)/);

        if (fireMatch) ingredient.elementalProperties.Fire = parseFloat(fireMatch[1]);
        if (waterMatch) ingredient.elementalProperties.Water = parseFloat(waterMatch[1]);
        if (earthMatch) ingredient.elementalProperties.Earth = parseFloat(earthMatch[1]);
        if (airMatch) ingredient.elementalProperties.Air = parseFloat(airMatch[1]);
      }

      // Check for recommended fields (simple presence check)
      if (ingredientObjStr.includes('qualities:')) ingredient.qualities = [];
      if (ingredientObjStr.includes('category:')) ingredient.category = '';
      if (ingredientObjStr.includes('astrologicalProfile:')) ingredient.astrologicalProfile = {};
      if (ingredientObjStr.includes('origin:')) ingredient.origin = [];

      // Validate this ingredient
      const issues = validateIngredient(ingredient, ingredientKey, relativePath);

      if (issues.length > 0) {
        const criticalOrError = issues.some(i => i.severity === 'CRITICAL' || i.severity === 'ERROR');
        const hasWarnings = issues.some(i => i.severity === 'WARNING');

        if (criticalOrError) {
          results.invalidIngredients++;
        } else if (hasWarnings) {
          results.incompleteIngredients++;
        }

        results.issues.push(...issues);
      } else {
        results.validIngredients++;
      }
    }

  } catch (error) {
    results.issues.push({
      severity: 'CRITICAL',
      type: 'FILE_ERROR',
      file: relativePath,
      message: `Failed to read file: ${error.message}`
    });
  }
}

/**
 * Recursively scan directory for ingredient files
 */
function scanDirectory(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, baseDir);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && entry.name !== 'index.ts' && entry.name !== 'types.ts') {
      const relativePath = path.relative(baseDir, fullPath);
      processFile(fullPath, relativePath);
    }
  }
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('INGREDIENT ROBUSTNESS VALIDATION REPORT');
  console.log('='.repeat(80));

  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Files Scanned:           ${results.totalFiles}`);
  console.log(`Total Ingredients:             ${results.totalIngredients}`);
  console.log(`✅ Fully Valid:                ${results.validIngredients}`);
  console.log(`⚠️  Incomplete (warnings only): ${results.incompleteIngredients}`);
  console.log(`❌ Invalid (errors/critical):  ${results.invalidIngredients}`);

  console.log('\n🔍 ISSUE BREAKDOWN');
  console.log('-'.repeat(80));
  console.log(`Missing Elementals:            ${results.summary.missingElementals}`);
  console.log(`Invalid Elemental Sum:         ${results.summary.invalidElementalSum}`);
  console.log(`Missing Required Fields:       ${results.summary.missingRequiredFields}`);
  console.log(`Invalid Data Types:            ${results.summary.invalidDataTypes}`);
  console.log(`Missing Recommended Fields:    ${results.summary.missingRecommendedFields}`);

  // Group issues by severity
  const critical = results.issues.filter(i => i.severity === 'CRITICAL');
  const errors = results.issues.filter(i => i.severity === 'ERROR');
  const warnings = results.issues.filter(i => i.severity === 'WARNING');

  if (critical.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (Must Fix Immediately)');
    console.log('-'.repeat(80));
    critical.slice(0, 20).forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.type}] ${issue.file}`);
      console.log(`   Ingredient: ${issue.ingredient || 'N/A'}`);
      console.log(`   ${issue.message}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
      console.log();
    });
    if (critical.length > 20) {
      console.log(`   ... and ${critical.length - 20} more critical issues\n`);
    }
  }

  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS (Should Fix for Robustness)');
    console.log('-'.repeat(80));
    errors.slice(0, 20).forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.type}] ${issue.file}`);
      console.log(`   Ingredient: ${issue.ingredient || 'N/A'}`);
      console.log(`   ${issue.message}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
      console.log();
    });
    if (errors.length > 20) {
      console.log(`   ... and ${errors.length - 20} more errors\n`);
    }
  }

  if (warnings.length > 0) {
    console.log('\n⚡ WARNINGS (Recommended for Complete Calculations)');
    console.log('-'.repeat(80));
    console.log(`Total warnings: ${warnings.length}`);

    // Group warnings by type
    const warningsByType = {};
    warnings.forEach(w => {
      if (!warningsByType[w.type]) warningsByType[w.type] = [];
      warningsByType[w.type].push(w);
    });

    console.log('\nSummary by type:');
    Object.entries(warningsByType).forEach(([type, items]) => {
      console.log(`  ${type}: ${items.length} instances`);
    });

    console.log('\nFirst 10 warnings:');
    warnings.slice(0, 10).forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.type}] ${issue.file} - ${issue.ingredient}`);
      console.log(`   ${issue.message}`);
    });
  }

  // Overall status
  console.log('\n' + '='.repeat(80));
  const validationPassed = critical.length === 0 && errors.length === 0;

  if (validationPassed) {
    console.log('✅ VALIDATION PASSED - All Critical Checks');
    console.log(`\n${results.validIngredients} fully complete ingredients`);
    console.log(`${results.incompleteIngredients} ingredients with optional improvements available`);
    console.log(`\nAll ${results.totalIngredients} ingredients are ROBUST for downstream calculations.`);

    if (warnings.length > 0) {
      console.log(`\nNote: ${warnings.length} optional improvements identified.`);
      console.log('These are recommended for maximum calculation accuracy but not required.');
    }
  } else {
    console.log('❌ VALIDATION FAILED - Critical Issues Found');
    console.log(`\nFound ${critical.length} critical issues and ${errors.length} errors.`);
    console.log('These MUST be fixed to ensure robust downstream calculations.');
    console.log(`\n${results.invalidIngredients} ingredients require fixes`);
    console.log(`${results.validIngredients} ingredients are already valid`);
  }
  console.log('='.repeat(80) + '\n');

  return validationPassed;
}

// Run validation
console.log('🔍 Scanning ingredient files for robustness...\n');
scanDirectory(INGREDIENTS_DIR);

const passed = generateReport();

// Exit with appropriate code
process.exit(passed ? 0 : 1);
