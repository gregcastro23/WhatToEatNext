#!/usr/bin/env node

/**
 * Comprehensive fix for all syntax errors introduced by cleanup script
 */

const fs = require('fs');

const fixes = [
  {
    file: 'src/app/alchm-kitchen/SignVectorPanel.tsx',
    replacements: [
      {
        from: 'const minimal = Object.fromEntries(;\n          Object.entries(positions).map(([kv]) => [k, { sign: (v as any).sign, degree: (v as any).degree }]),',
        to: 'const minimal = Object.fromEntries(\n          Object.entries(positions).map(([k, v]) => [k, { sign: (v as any).sign, degree: (v as any).degree }]),'
      }
    ]
  },
  {
    file: 'src/context/AstrologicalContext.tsx',
    replacements: [
      {
        from: 'Air: zodiac === \'gemini\' || zodiac === \'libra\' || zodiac === \'aquarius\' ? 0.7 : 0.2;',
        to: 'Air: zodiac === \'gemini\' || zodiac === \'libra\' || zodiac === \'aquarius\' ? 0.7 : 0.2'
      }
    ]
  },
  {
    file: 'src/contexts/AlchemicalContext/provider.tsx',
    replacements: [
      {
        from: 'Object.keys(state.astrologicalState.alchemicalValues).length === 4;',
        to: 'Object.keys(state.astrologicalState.alchemicalValues).length === 4'
      }
    ]
  },
  {
    file: 'src/utils/logger.ts',
    replacements: [
      {
        from: 'export const _debugLog = (message: string, ...args: unknown[]): void =>;\n  logger.debug(message, ...args);',
        to: 'export const _debugLog = (message: string, ...args: unknown[]): void =>\n  logger.debug(message, ...args);'
      }
    ]
  },
  {
    file: 'src/utils/signVectors.ts',
    replacements: [
      {
        from: 'const weights = [0.30.2].slice(0, parts.length);',
        to: 'const weights = [0.3, 0.2].slice(0, parts.length);'
      }
    ]
  }
];

console.log('🔧 Applying comprehensive syntax fixes...\n');

let totalFixes = 0;

for (const fix of fixes) {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    let fileFixes = 0;

    for (const replacement of fix.replacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(replacement.from, replacement.to);
        fileFixes++;
        totalFixes++;
      }
    }

    if (fileFixes > 0) {
      fs.writeFileSync(fix.file, content);
      console.log(`📝 Fixed ${fileFixes} syntax errors in ${fix.file}`);
    }
  }
}

console.log(`\n✅ Applied ${totalFixes} syntax fixes total`);
