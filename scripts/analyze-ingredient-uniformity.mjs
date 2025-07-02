#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import recast from 'recast';
import { builders as b, visit } from 'ast-types';
import { parse as tsParser } from 'recast/parsers/typescript.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_PREFIX = '🌿';

// --- CONFIGURATION ---

const REQUIRED_FIELDS = [
  'name', 'category', 'subCategory', 'sensoryProfile', 'culinaryProfile', 
  'origin', 'season', 'preparation', 'nutritionalProfile', 'storage', 
  'varieties', 'astrologicalProfile', 'elementalProperties', 'qualities'
];

const CORRUPTION_PATTERNS = [
  /\$\d+/g, /,;,;,;/g, /\{\s*\}/g, 
  /undefined\s*:/g, /\[\s*\]/g,
];

const SAFE_ENHANCEMENT_TEMPLATES = {
  sensoryProfile: (name) => ({ taste: ['Mild'], aroma: ['Fresh'], texture: ['Standard'], notes: `Characteristic ${name} profile` }),
  season: () => ['Year-round'],
  preparation: (name) => ({ methods: ['Standard'], timing: 'As needed', notes: `Standard prep for ${name}` }),
  storage: () => ({ temperature: 'Cool, dry place', duration: '6-12 months', container: 'Airtight' }),
  culinaryProfile: (name) => ({ flavorProfile: { primary: ['balanced'] }, cookingMethods: ['versatile'], cuisineAffinity: ['Global'] }),
  nutritionalProfile: () => ({ macronutrients: {}, micronutrients: {}, healthBenefits: ['Nutritious'] }),
  astrologicalProfile: () => ({ rulingPlanets: [], favorableZodiac: [] }),
  elementalProperties: () => ({ Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 }),
  qualities: () => ['Versatile'],
  origin: () => ['Unknown'],
  varieties: () => ({}),
  category: () => 'Uncategorized',
  subCategory: () => 'Uncategorized',
  name: (name) => name,
};

// --- SAFETY & AST ---

class SafetyScorer {
  static calculateFileSafety(content) {
    let score = 100;
    CORRUPTION_PATTERNS.forEach(p => score -= (content.match(p) || []).length * 10);
    if (Buffer.byteLength(content, 'utf8') > 100 * 1024) score -= 15;
    if (Math.abs((content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length) > 0) score -= 20;
    return { score: Math.max(0, score), safe: score >= 70 };
  }

  static calculateEnhancementSafety(missingFields, content, ingredientName) {
    let score = 100;
    if (missingFields.length > 8) score -= 20;
    
    const ingredientPattern = new RegExp(`['"\`]${ingredientName}['"\`]\\s*:\\s*\\{`);
    if (!ingredientPattern.test(content)) score -= 30;

    return { score: Math.max(0, score), safe: score >= 80 };
  }
}

const ASTProcessor = {
  parse(content) {
    try {
      return recast.parse(content, { parser: { parse: tsParser } });
    } catch (e) {
      console.error(`${LOG_PREFIX} AST parsing failed:`, e.message);
      return null;
    }
  },

  findTopLevelObject(ast) {
    let topLevelObject = null;
    let maxProperties = 0;
    visit(ast, {
      visitVariableDeclaration(path) {
        path.node.declarations.forEach(dec => {
          if (dec.init && dec.init.type === 'ObjectExpression') {
            const numProps = dec.init.properties.length;
            if (numProps > maxProperties) {
              maxProperties = numProps;
              topLevelObject = dec.init;
            }
          }
        });
        return false;
      }
    });
    return topLevelObject;
  },

  analyzeIngredient(node) {
    const properties = new Set((node.properties || []).filter(p => p.key).map(p => p.key.name || p.key.value));
    return REQUIRED_FIELDS.filter(f => !properties.has(f));
  },

  buildAstNode(value) {
    if (Array.isArray(value)) return b.arrayExpression(value.map(v => this.buildAstNode(v)));
    if (typeof value === 'object' && value !== null) {
      return b.objectExpression(Object.entries(value).map(([k, v]) => b.property('init', b.identifier(k), this.buildAstNode(v))));
    }
    return b.literal(value);
  },
  
  enhanceIngredient(node, missing, name) {
    missing.forEach(field => {
      if (SAFE_ENHANCEMENT_TEMPLATES[field]) {
        const template = SAFE_ENHANCEMENT_TEMPLATES[field](name);
        node.properties.push(b.property('init', b.identifier(field), this.buildAstNode(template)));
      }
    });
  }
};

// --- FILE OPERATIONS ---

function getAllFiles(dirPath, allFiles = []) {
  fs.readdirSync(dirPath).forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, allFiles);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      allFiles.push(fullPath);
    }
  });
  return allFiles;
}

async function analyzeAllFiles() {
  const ingredientsDir = path.join(__dirname, '../src/data/ingredients');
  const allFiles = getAllFiles(ingredientsDir);
  const results = [];

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const file = path.relative(path.join(__dirname, '..'), filePath);
    const { score, safe } = SafetyScorer.calculateFileSafety(content);
    
    const ast = await ASTProcessor.parse(content);
    if (!ast) continue;
    const topLevelObject = ASTProcessor.findTopLevelObject(ast);
    if (!topLevelObject) continue;
    
    let totalMissing = 0;
    const ingredients = topLevelObject.properties.filter(p => p.value && p.value.type === 'ObjectExpression');
    const totalIngredients = ingredients.length;

    if (totalIngredients === 0) continue;

    const missingFieldCounts = {};
    ingredients.forEach(prop => {
      const missing = ASTProcessor.analyzeIngredient(prop.value);
      totalMissing += missing.length;
      missing.forEach(f => missingFieldCounts[f] = (missingFieldCounts[f] || 0) + 1);
    });
    
    const priority = totalMissing * totalIngredients;
    const coverage = Math.max(0, 100 - ( (totalMissing / totalIngredients) / REQUIRED_FIELDS.length * 100));

    results.push({
      file, priority, safe, safetyScore: score, totalMissing, totalIngredients,
      coverage: Math.round(coverage),
      topMissing: Object.keys(missingFieldCounts).sort((a,b) => missingFieldCounts[b] - missingFieldCounts[a]),
    });
  }
  return results.sort((a, b) => b.priority - a.priority);
}

async function enhanceFile(filePath, dryRun) {
  console.log(`\n${LOG_PREFIX} Processing: ${path.basename(filePath)}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileSafety = SafetyScorer.calculateFileSafety(content);

  console.log(`  🛡️  File Safety: ${fileSafety.score}/100 ${fileSafety.safe ? '✅' : '❌'}`);
  if (!fileSafety.safe) {
    console.log('    Skipping due to file safety concerns.');
    return;
  }

  const ast = await ASTProcessor.parse(content);
  if (!ast) return;
  const topLevelObject = ASTProcessor.findTopLevelObject(ast);
  if (!topLevelObject) {
    console.warn(`    ⚠️  No top-level object found. Cannot enhance.`);
    return;
  }
  
  let enhancedCount = 0;
  topLevelObject.properties.forEach(prop => {
    if (prop.value.type !== 'ObjectExpression') return;
    
    const name = prop.key.name || prop.key.value;
    const missing = ASTProcessor.analyzeIngredient(prop.value);
    
    if (missing.length === 0) return;
    if ((REQUIRED_FIELDS.length - missing.length) > 15) {
        console.log(`    ℹ️  Skipping complex ingredient: ${name}`);
        return;
    }

    const { score, safe } = SafetyScorer.calculateEnhancementSafety(missing, content, name);
    console.log(`    🛡️  ${name}: Safety ${score}/100 (${missing.length} missing)`);

    if (safe) {
      ASTProcessor.enhanceIngredient(prop.value, missing, name);
      console.log(`      ✅ Enhanced ${name} with ${missing.length} fields`);
      enhancedCount++;
    }
  });

  if (enhancedCount > 0) {
    if (dryRun) {
      console.log(`\n✅ Dry Run: Would have enhanced ${enhancedCount} ingredients in ${path.basename(filePath)}.`);
    } else {
      const newCode = recast.print(ast, { tabWidth: 2, quote: 'single' }).code;
      fs.writeFileSync(filePath, newCode, 'utf-8');
      console.log(`\n💾 Saved ${enhancedCount} enhancements to ${path.basename(filePath)}.`);
    }
  } else {
    console.log(`\nℹ️  No ingredients needed enhancement in ${path.basename(filePath)}.`);
  }
}

// --- MAIN EXECUTION ---

async function main() {
  const args = process.argv.slice(2);
  const isEnhance = args.includes('--enhance');
  const isDryRun = args.includes('--dry-run') || !args.includes('--force');
  const specificFiles = args.filter(arg => arg.endsWith('.ts'));

  console.log('🌿 ENHANCED INGREDIENT COVERAGE ANALYZER & SAFE MASS ENHANCER');
  console.log('==============================================================\n');

  if (isEnhance) {
    console.log('🚀 SAFE MASS INGREDIENT ENHANCEMENT MODE');
    if (isDryRun) console.log('   (DRY RUN - no files will be modified)');
    
    const filesToEnhance = specificFiles.length > 0
      ? specificFiles.map(f => path.join(__dirname, '..', f))
      : (await analyzeAllFiles()).filter(f => f.safe).slice(0, 5).map(f => path.join(__dirname, '..', f.file));

    for (const filePath of filesToEnhance) {
      await enhanceFile(filePath, isDryRun);
    }
    console.log('\n\n🎊 Enhancement run complete! 🎊');

  } else {
    console.log('📊 ANALYZING INGREDIENT COVERAGE...\n');
    const results = await analyzeAllFiles();
    const safeFiles = results.filter(r => r.safe);
    const unsafeFiles = results.filter(r => !r.safe);

    console.log('🎯 TOP PRIORITY SAFE FILES FOR ENHANCEMENT:');
    safeFiles.slice(0, 10).forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.file}`);
      console.log(`   📊 Coverage: ${r.coverage}% | Ingredients: ${r.totalIngredients} | Missing: ${r.totalMissing}`);
      console.log(`   🛡️  Safety Score: ${r.safetyScore}/100 ✅`);
      console.log(`   🎯 Priority Score: ${r.priority}`);
      console.log(`   📋 Top Missing: ${r.topMissing.slice(0, 3).join(', ')}`);
    });

    if (unsafeFiles.length > 0) {
      console.log('\n\n⚠️  UNSAFE FILES (require manual review):');
      unsafeFiles.slice(0, 5).forEach(r => {
        console.log(`\n- ${r.file} (Safety: ${r.safetyScore}/100 ❌)`);
      });
    }
    console.log('\n\n🎊 ANALYSIS COMPLETE! 🎊');
  }
}

main().catch(console.error);