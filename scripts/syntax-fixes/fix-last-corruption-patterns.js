import fs from 'fs';
import path from 'path';

const isDryRun = process.argv.includes('--dry-run');

const fixes = [
  {
    file: 'src/utils/ingredientRecommender.ts',
    patterns: [
      {
        // Fix: Array.isArray(name) ? name.includes(food?.toLowerCase() : name === food?.toLowerCase( ||
        search: /Array\.isArray\(name\) \? name\.includes\(food\?\.toLowerCase\(\) : name === food\?\.toLowerCase\(\( \|\|/g,
        replace: 'Array.isArray(name) ? name.includes(food?.toLowerCase()) : (name === food?.toLowerCase() ||'
      },
      {
        // Fix: Array.isArray(name) ? name.includes(herb?.toLowerCase() : name === herb?.toLowerCase( ||
        search: /Array\.isArray\(name\) \? name\.includes\(herb\?\.toLowerCase\(\) : name === herb\?\.toLowerCase\(\( \|\|/g,
        replace: 'Array.isArray(name) ? name.includes(herb?.toLowerCase()) : (name === herb?.toLowerCase() ||'
      },
      {
        // Fix: Array.isArray(name) ? name.includes(transitIngredient?.toLowerCase() : name === transitIngredient?.toLowerCase( ||
        search: /Array\.isArray\(name\) \? name\.includes\(transitIngredient\?\.toLowerCase\(\) : name === transitIngredient\?\.toLowerCase\(\( \|\|/g,
        replace: 'Array.isArray(name) ? name.includes(transitIngredient?.toLowerCase()) : (name === transitIngredient?.toLowerCase() ||'
      },
      {
        // Fix: (Array.isArray(lowerIngredient) ? lowerIngredient.includes(food?.toLowerCase() : lowerIngredient === food?.toLowerCase()) ||
        search: /\(Array\.isArray\(lowerIngredient\) \? lowerIngredient\.includes\(food\?\.toLowerCase\(\) : lowerIngredient === food\?\.toLowerCase\(\)\) \|\|/g,
        replace: '(Array.isArray(lowerIngredient) ? lowerIngredient.includes(food?.toLowerCase()) : lowerIngredient === food?.toLowerCase()) ||'
      },
      {
        // Fix: (Array.isArray(lowerIngredient) ? lowerIngredient.includes(herb?.toLowerCase() : lowerIngredient === herb?.toLowerCase()) ||
        search: /\(Array\.isArray\(lowerIngredient\) \? lowerIngredient\.includes\(herb\?\.toLowerCase\(\) : lowerIngredient === herb\?\.toLowerCase\(\)\) \|\|/g,
        replace: '(Array.isArray(lowerIngredient) ? lowerIngredient.includes(herb?.toLowerCase()) : lowerIngredient === herb?.toLowerCase()) ||'
      },
      {
        // Fix: (Array.isArray(lowerIngredient) ? lowerIngredient.includes(ingredient?.toLowerCase() : lowerIngredient === ingredient?.toLowerCase()) ||
        search: /\(Array\.isArray\(lowerIngredient\) \? lowerIngredient\.includes\(ingredient\?\.toLowerCase\(\) : lowerIngredient === ingredient\?\.toLowerCase\(\)\) \|\|/g,
        replace: '(Array.isArray(lowerIngredient) ? lowerIngredient.includes(ingredient?.toLowerCase()) : lowerIngredient === ingredient?.toLowerCase()) ||'
      },
      {
        // Fix: mercuryData?.HerbalAssociations?.(Herbs || []).some
        search: /mercuryData\?\.HerbalAssociations\?\.\(Herbs \|\| \[\]\)\.some/g,
        replace: '(mercuryData?.HerbalAssociations?.Herbs || []).some'
      }
    ]
  }
];

function applyFixes() {
  let totalChanges = 0;
  
  for (const fix of fixes) {
    const filePath = path.join(process.cwd(), fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;
    
    for (const pattern of fix.patterns) {
      const matches = content.match(pattern.search);
      if (matches) {
        content = content.replace(pattern.search, pattern.replace);
        fileChanges += matches.length;
        console.log(`✅ Fixed ${matches.length} pattern(s) in ${fix.file}`);
        if (isDryRun) {
          console.log(`   Pattern: ${pattern.search}`);
          console.log(`   Replace: ${pattern.replace}`);
        }
      }
    }
    
    if (fileChanges > 0) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, content);
        console.log(`📝 Applied ${fileChanges} fixes to ${fix.file}`);
      } else {
        console.log(`🔍 Would apply ${fileChanges} fixes to ${fix.file}`);
      }
      totalChanges += fileChanges;
    } else {
      console.log(`ℹ️  No changes needed in ${fix.file}`);
    }
  }
  
  console.log(`\n${isDryRun ? '🔍 DRY RUN:' : '✅ COMPLETED:'} ${totalChanges} total syntax fixes ${isDryRun ? 'would be' : 'were'} applied`);
  
  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to apply these fixes');
  } else {
    console.log('\n🚀 Ready for final build test');
  }
}

applyFixes(); 