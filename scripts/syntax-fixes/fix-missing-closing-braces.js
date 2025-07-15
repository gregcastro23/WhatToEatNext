#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 Fix Missing Closing Braces in Elemental State Objects ${DRY_RUN ? '(DRY RUN)' : ''}`);
console.log('='.repeat(70));

// Pattern to find elemental state objects missing closing braces
const pattern = /\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25(?!\s*\})/g;

function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.next', 'dist', '.git'].includes(item)) {
      findTsFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixFiles() {
  // Find all TypeScript and TSX files
  const files = findTsFiles('src');

  let totalChanges = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      continue;
    }

    let content = fs.readFileSync(file, 'utf8');
    let fileChanges = 0;
    
    // Find matches
    const matches = content.match(pattern);
    
    if (matches) {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`\n📁 Processing: ${relativePath}`);
      console.log(`  🔍 Found ${matches.length} missing closing braces`);
      
      if (!DRY_RUN) {
        // Replace the pattern with the corrected version
        content = content.replace(pattern, '{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }');
        fileChanges = matches.length;
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`  ✅ Applied ${fileChanges} fixes`);
        totalChanges += fileChanges;
      } else {
        matches.forEach((match, index) => {
          console.log(`    ${index + 1}. Would fix: ${match.substring(0, 50)}...`);
          console.log(`       To: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }`);
        });
      }
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  if (DRY_RUN) {
    console.log('🔍 DRY RUN COMPLETE - No files were modified');
    console.log('Run without --dry-run to apply fixes');
  } else {
    console.log(`✅ COMPLETE - Applied ${totalChanges} fixes total`);
  }
}

fixFiles(); 