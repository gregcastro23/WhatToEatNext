#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing remaining cookingMethodRecommender.ts errors');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const filePath = path.join(ROOT_DIR, 'src/utils/cookingMethodRecommender.ts');

if (!fs.existsSync(filePath)) {
  console.log('⚠️  File not found: src/utils/cookingMethodRecommender.ts');
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

const fixes = [
  {
    description: 'Fix missing closing parenthesis in trim function',
    search: `return methodName
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();`,
    replace: `return methodName
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();`
  },
  {
    description: 'Fix missing closing parentheses in function calls',
    search: `const normalized1 = normalizeMethodName(method1
const normalized2 = normalizeMethodName(method2`,
    replace: `const normalized1 = normalizeMethodName(method1);
const normalized2 = normalizeMethodName(method2);`
  },
  {
    description: 'Fix malformed array filter syntax',
    search: `const commonWords = normalized1?.split(' ')?.filter(word => (word?.length || 0) > 3 && (Array.isArray(normalized2) ? normalized2.includes(word) : normalized2 === word)`,
    replace: `const commonWords = normalized1?.split(' ')?.filter(word => (word?.length || 0) > 3 && normalized2?.includes(word));`
  },
  {
    description: 'Fix missing closing parenthesis in compatibility function',
    search: `return Math.min(1, compatibilityScore / 2.5`,
    replace: `return Math.min(1, compatibilityScore / 2.5);`
  },
  {
    description: 'Fix missing closing parenthesis in planetary influence function',
    search: `if (method.astrologicalInfluences?.dominantPlanets?.includes(18042)) {
    elementalScore = Math.min(1.0, elementalScore + 0.3`,
    replace: `if (method.astrologicalInfluences?.dominantPlanets?.includes('planetaryDay')) {
    elementalScore = Math.min(1.0, elementalScore + 0.3);`
  },
  {
    description: 'Fix missing closing parenthesis in planetary hour function',
    search: `if (method.astrologicalInfluences?.dominantPlanets?.includes(19576)) {
    elementalScore = Math.min(1.0, elementalScore + 0.3`,
    replace: `if (method.astrologicalInfluences?.dominantPlanets?.includes('planetaryHour')) {
    elementalScore = Math.min(1.0, elementalScore + 0.3);`
  },
  {
    description: 'Fix missing closing parenthesis in isDaytime function',
    search: `const hour = date.getHours(
return hour >= 6 && hour < 18;`,
    replace: `const hour = date.getHours();
return hour >= 6 && hour < 18;`
  },
  {
    description: 'Fix missing closing parenthesis in filter method',
    search: `.filter(method => !method.relatedToMainMethod`,
    replace: `.filter(method => !method.relatedToMainMethod);`
  },
  {
    description: 'Fix complex malformed conditional statements',
    search: `if (method.Array.isArray($1.$3) ? $1.$3.includes($5) : $1.$3 === $5) {
        astrologicalScore += 0.25;
      } else if (method.Array.isArray($1.$3) ? $1.$3.includes($5) : $1.$3 === $5) {
        astrologicalScore -= 0.2;
      }`,
    replace: `if (method.astrologicalInfluences?.favorableZodiac?.includes(currentZodiac)) {
        astrologicalScore += 0.25;
      } else if (method.astrologicalInfluences?.unfavorableZodiac?.includes(currentZodiac)) {
        astrologicalScore -= 0.2;
      }`
  },
  {
    description: 'Fix malformed Date constructor calls',
    search: `const dayOfWeek = new Date()?.getDay(`,
    replace: `const dayOfWeek = new Date().getDay();`
  },
  {
    description: 'Fix more Date constructor calls',
    search: `const now = new Date(
const dayOfWeek = now.getDay(
const hour = now.getHours(`,
    replace: `const now = new Date();
const dayOfWeek = now.getDay();
const hour = now.getHours();`
  },
  {
    description: 'Fix malformed indexOf call',
    search: `const startingPosition = planetaryOrder.indexOf(startingPlanet`,
    replace: `const startingPosition = planetaryOrder.indexOf(startingPlanet);`
  },
  {
    description: 'Fix malformed ternary operations',
    search: `const hourPosition = daytime ? (hour - 6) : (hour < 6 ? hour + 18 : hour - 6`,
    replace: `const hourPosition = daytime ? (hour - 6) : (hour < 6 ? hour + 18 : hour - 6);`
  },
  {
    description: 'Fix malformed seasonal preference array check',
    search: `if (method.seasonalPreference && Array.isArray($1.$3) ? $1.$3.includes($5) : $1.$3 === $5) {`,
    replace: `if (method.seasonalPreference && method.seasonalPreference.includes(season)) {`
  },
  {
    description: 'Fix malformed array access in filter',
    search: `const availableRequiredTools = (requiredTools || []).filter(tool => (availableTools || []).some(available => available?.toLowerCase()?.includes(tool?.toLowerCase()))`,
    replace: `const availableRequiredTools = (requiredTools || []).filter(tool => (availableTools || []).some(available => available?.toLowerCase()?.includes(tool?.toLowerCase())));`
  },
  {
    description: 'Fix malformed suitable_for array check',
    search: `if (method.suitable_for || [].some(suitable => suitable?.toLowerCase()?.includes(pref?.toLowerCase())`,
    replace: `if ((method.suitable_for || []).some(suitable => suitable?.toLowerCase()?.includes(pref?.toLowerCase()))`
  },
  {
    description: 'Fix malformed dietary score calculation',
    search: `dietaryScore = Math.min(0.1, matchStrength / (dietaryPreferences || []).length * 0.1`,
    replace: `dietaryScore = Math.min(0.1, matchStrength / (dietaryPreferences || []).length * 0.1);`
  },
  {
    description: 'Fix malformed lunar phase calculation',
    search: `const lunarPhase = calculateLunarPhase(new Date()`,
    replace: `const lunarPhase = calculateLunarPhase(new Date());`
  },
  {
    description: 'Fix malformed method name normalization',
    search: `const methodNameNorm = normalizeMethodName(method.name`,
    replace: `const methodNameNorm = normalizeMethodName(method.name);`
  },
  {
    description: 'Fix malformed areSimilarMethods call',
    search: `if (Object.keys(recommendationsMap || {}).some(existingMethod => areSimilarMethods(existingMethod, methodNameNorm)`,
    replace: `if (Object.keys(recommendationsMap || {}).some(existingMethod => areSimilarMethods(existingMethod, methodNameNorm))`
  },
  {
    description: 'Fix malformed elemental compatibility call',
    search: `elementalScore = calculateEnhancedElementalCompatibility(elementalProps, elementalComposition`,
    replace: `elementalScore = calculateEnhancedElementalCompatibility(elementalProps, elementalComposition);`
  },
  {
    description: 'Fix malformed planetary day influence call',
    search: `planetaryDayScore = calculatePlanetaryDayInfluence(method, planetaryDay`,
    replace: `planetaryDayScore = calculatePlanetaryDayInfluence(method, planetaryDay);`
  },
  {
    description: 'Fix malformed planetary hour influence call',
    search: `planetaryHourScore = calculatePlanetaryHourInfluence(method, planetaryHour, daytime`,
    replace: `planetaryHourScore = calculatePlanetaryHourInfluence(method, planetaryHour, daytime);`
  },
  {
    description: 'Fix malformed Venus temperament toLowerCase call',
    search: `const lowerSign = currentZodiac?.toLowerCase(`,
    replace: `const lowerSign = currentZodiac?.toLowerCase();`
  }
];

function applyFixes() {
  let changes = 0;

  fixes.forEach(({ description, search, replace }) => {
    if (content.includes(search)) {
      if (DRY_RUN) {
        console.log(`  Would fix: ${description}`);
      } else {
        content = content.replace(search, replace);
        changes++;
      }
    }
  });

  if (changes > 0 && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${changes} issues in cookingMethodRecommender.ts`);
  } else if (DRY_RUN) {
    console.log(`🏃 DRY RUN: Would fix ${fixes.length} potential issues`);
  } else {
    console.log('No matching issues found to fix');
  }
}

applyFixes(); 