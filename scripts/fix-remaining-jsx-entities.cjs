#!/usr/bin/env node

/**
 * Fix remaining JSX entity issues in specific files
 */

const fs = require('fs');

const filesToFix = [
  'src/app/[...not-found]/error.tsx',
  'src/app/not-found.tsx'
];

function fixJSXEntitiesInFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;

    // Fix unescaped apostrophes in JSX text
    const apostrophePattern = /(\>[\s\S]*?)([^&])'([^s])/g;
    content = content.replace(apostrophePattern, (match, before, char, after) => {
      if (!before.includes('<') || before.lastIndexOf('>') > before.lastIndexOf('<')) {
        fixCount++;
        modified = true;
        return before + char + '&apos;' + after;
      }
      return match;
    });

    // Fix specific patterns
    const patterns = [
      { from: "you're", to: "you&apos;re" },
      { from: "doesn't", to: "doesn&apos;t" },
      { from: "don't", to: "don&apos;t" },
      { from: "can't", to: "can&apos;t" },
      { from: "won't", to: "won&apos;t" },
      { from: "isn't", to: "isn&apos;t" },
      { from: "aren't", to: "aren&apos;t" },
      { from: "wasn't", to: "wasn&apos;t" },
      { from: "weren't", to: "weren&apos;t" },
      { from: "haven't", to: "haven&apos;t" },
      { from: "hasn't", to: "hasn&apos;t" },
      { from: "hadn't", to: "hadn&apos;t" },
      { from: "shouldn't", to: "shouldn&apos;t" },
      { from: "wouldn't", to: "wouldn&apos;t" },
      { from: "couldn't", to: "couldn&apos;t" },
    ];

    for (const pattern of patterns) {
      const regex = new RegExp(`(>[^<]*?)${pattern.from.replace(/'/g, "'")}([^<]*?<)`, 'g');
      const newContent = content.replace(regex, (match, before, after) => {
        fixCount++;
        modified = true;
        return before + pattern.to + after;
      });
      if (newContent !== content) {
        content = newContent;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${fixCount} JSX entities in ${filePath}`);
    } else {
      console.log(`No JSX entities found in ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing remaining JSX entity issues...');

for (const filePath of filesToFix) {
  fixJSXEntitiesInFile(filePath);
}

console.log('✅ Remaining JSX entity fixes completed!');
