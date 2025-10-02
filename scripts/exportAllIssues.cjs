#!/usr/bin/env node

/**
 * Export All Validation Issues
 * Outputs every single issue to help with batch processing
 */

const fs = require('fs');
const path = require('path');

const INGREDIENTS_DIR = path.join(__dirname, '..', 'src', 'data', 'ingredients');
const TOLERANCE = 0.001;
const REQUIRED_FIELDS = ['name', 'elementalProperties'];
const RECOMMENDED_FIELDS = ['qualities', 'category', 'astrologicalProfile'];

const results = { issues: [] };

function validateIngredient(ingredient, ingredientKey, fileName) {
  const issues = [];

  // Check for recommended fields
  for (const field of RECOMMENDED_FIELDS) {
    if (!(field in ingredient) || ingredient[field] === undefined) {
      issues.push({
        file: fileName,
        ingredient: ingredientKey,
        missingField: field
      });
    }
  }

  return issues;
}

function processFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const rawVarMatch = content.match(/const\s+(raw\w+)(?::\s*[^=]+)?\s*=\s*{/);
    if (!rawVarMatch) return;

    const rawVarName = rawVarMatch[1];
    const objStartIdx = content.indexOf(rawVarName) + rawVarName.length;

    let braceCount = 0, startIdx = -1, endIdx = -1;
    for (let i = objStartIdx; i < content.length; i++) {
      if (content[i] === '{') { if (braceCount === 0) startIdx = i; braceCount++; }
      else if (content[i] === '}') { braceCount--; if (braceCount === 0) { endIdx = i + 1; break; } }
    }

    if (startIdx === -1 || endIdx === -1) return;

    const objContent = content.substring(startIdx, endIdx);
    const ingredientKeyMatches = [...objContent.matchAll(/^\s{2}(\w+):\s*{/gm)];

    for (const match of ingredientKeyMatches) {
      const ingredientKey = match[1];
      const keyIdx = match.index + startIdx;
      const ingredientObjStart = content.indexOf('{', keyIdx);

      let braces = 0, ingredientObjEnd = -1;
      for (let i = ingredientObjStart; i < content.length; i++) {
        if (content[i] === '{') braces++;
        else if (content[i] === '}') { braces--; if (braces === 0) { ingredientObjEnd = i; break; } }
      }

      if (ingredientObjEnd === -1) continue;

      const ingredientObjStr = content.substring(ingredientObjStart, ingredientObjEnd + 1);
      const ingredient = { _key: ingredientKey };

      const nameMatch = ingredientObjStr.match(/name:\s*['"](.*?)['"]/);
      if (nameMatch) ingredient.name = nameMatch[1];

      const elementalsMatch = ingredientObjStr.match(/elementalProperties:\s*{([^}]+)}/);
      if (elementalsMatch) {
        ingredient.elementalProperties = {};
        const elementalStr = elementalsMatch[1];
        const fireMatch = elementalStr.match(/Fire:\s*([\d.]+)/);
        const waterMatch = elementalStr.match(/Water:\s*([\d.]+)/);
        const earthMatch = elementalStr.match(/Earth:\s*([\d.]+)/);
        const airMatch = elementalStr.match(/Air:\s*([\d.]+)/);
        if (fireMatch) ingredient.elementalProperties.Fire = parseFloat(fireMatch[1]);
        if (waterMatch) ingredient.elementalProperties.Water = parseFloat(waterMatch[1]);
        if (earthMatch) ingredient.elementalProperties.Earth = parseFloat(earthMatch[1]);
        if (airMatch) ingredient.elementalProperties.Air = parseFloat(airMatch[1]);
      }

      if (ingredientObjStr.includes('qualities:')) ingredient.qualities = [];
      if (ingredientObjStr.includes('category:')) ingredient.category = '';
      if (ingredientObjStr.includes('astrologicalProfile:')) ingredient.astrologicalProfile = {};

      const issues = validateIngredient(ingredient, ingredientKey, relativePath);
      results.issues.push(...issues);
    }
  } catch (error) {
    console.error(`Error processing ${relativePath}:`, error.message);
  }
}

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

scanDirectory(INGREDIENTS_DIR);

// Output as JSON for easy processing
console.log(JSON.stringify(results, null, 2));
