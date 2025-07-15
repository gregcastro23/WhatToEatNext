import fs from 'fs';
import path from 'path';

const isDryRun = process.argv.includes('--dry-run');

const fixes = [
  {
    file: 'src/utils/ingredientRecommender.ts',
    patterns: [
      {
        // Fix: (ingredient as any).(culinaryApplications || []).some
        search: /\(ingredient as any\)\.\(culinaryApplications \|\| \[\]\)\.some/g,
        replace: '(ingredient as any).culinaryApplications?.some'
      }
    ]
  },
  {
    file: 'src/utils/recipe/recipeMatching.ts',
    patterns: [
      {
        // Fix: if (Array.isArray((normalizedQuality) ? (normalizedQuality.includes('adaptable') : (normalizedQuality === 'adaptable') ||
        search: /if \(Array\.isArray\(\(normalizedQuality\) \? \(normalizedQuality\.includes\('adaptable'\) : \(normalizedQuality === 'adaptable'\) \|\|/g,
        replace: 'if (Array.isArray(normalizedQuality) ? normalizedQuality.includes(\'adaptable\') : normalizedQuality === \'adaptable\' ||'
      }
    ]
  },
  {
    file: 'src/utils/recipeFilters.ts',
    patterns: [
      {
        // Fix: (Array.isArray((recipe as Record<string, any>)?.dietaryInfo) ? (recipe as Record<string, any>).dietaryInfo : (Array.isArray([])) ? []).includes(restriction) : []) === restriction)
        search: /\(Array\.isArray\(\(recipe as Record<string, any>\)\?\.dietaryInfo\) \? \(recipe as Record<string, any>\)\.dietaryInfo : \(Array\.isArray\(\[\]\)\) \? \[\]\)\.includes\(restriction\) : \[\]\) === restriction\)/g,
        replace: '(Array.isArray((recipe as Record<string, any>)?.dietaryInfo) ? (recipe as Record<string, any>).dietaryInfo.includes(restriction) : (recipe as Record<string, any>)?.dietaryInfo === restriction)'
      }
    ]
  },
  {
    file: 'src/utils/recipeMatching.ts',
    patterns: [
      {
        // Fix: return // elementalUtils.normalizeProperties(elements);
        search: /return \/\/ elementalUtils\.normalizeProperties\(elements\);/g,
        replace: 'return elements; // elementalUtils.normalizeProperties(elements);'
      }
    ]
  },
  {
    file: 'src/utils/recommendation/methodRecommendation.ts',
    patterns: [
      {
        // Fix: ((method as unknown as Record<string, any>)).astrologicalInfluences.(Array.isArray(favorableZodiac) ? favorableZodiac.includes(currentZodiac)  : favorableZodiac === currentZodiac);
        search: /\(\(method as unknown as Record<string, any>\)\)\.astrologicalInfluences\.\(Array\.isArray\(favorableZodiac\) \? favorableZodiac\.includes\(currentZodiac\)\s+: favorableZodiac === currentZodiac\);/g,
        replace: '(Array.isArray(((method as unknown as Record<string, any>)).astrologicalInfluences.favorableZodiac) ? ((method as unknown as Record<string, any>)).astrologicalInfluences.favorableZodiac.includes(currentZodiac) : ((method as unknown as Record<string, any>)).astrologicalInfluences.favorableZodiac === currentZodiac);'
      },
      {
        // Fix: Object.(keys(profile) || []).forEach
        search: /Object\.\(keys\(profile\) \|\| \[\]\)\.forEach/g,
        replace: 'Object.keys(profile || {}).forEach'
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
    console.log('\n🚀 Ready to test with: yarn build');
  }
}

applyFixes(); 