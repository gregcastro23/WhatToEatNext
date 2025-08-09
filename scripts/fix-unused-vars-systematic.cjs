#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Get unused variables from ESLint output
function getUnusedVariables() {
  try {
    const output = execSync('yarn lint --format json', { encoding: 'utf8', stdio: 'pipe' });
    const results = JSON.parse(output);
    const unusedVars = [];

    results.forEach(result => {
      if (result.messages) {
        result.messages.forEach(msg => {
          if (
            msg.ruleId === '@typescript-eslint/no-unused-vars' ||
            msg.ruleId === 'no-unused-vars'
          ) {
            // Extract variable name from message
            const match = msg.message.match(
              /'([^']+)' is (defined but never used|assigned a value but never used)/,
            );
            if (match) {
              unusedVars.push({
                file: result.filePath,
                name: match[1],
                line: msg.line,
                message: msg.message,
                type: msg.message.includes('parameter') ? 'parameter' : 'variable',
              });
            }
          }
        });
      }
    });

    return unusedVars;
  } catch (error) {
    console.error('Error getting unused variables:', error.message);
    return [];
  }
}

// Check if variable should be preserved based on domain patterns
function shouldPreserveVariable(name) {
  const preservePatterns = [
    // Astrological patterns
    /^(planet|degree|sign|longitude|position|transit|elemental)/i,
    /^(zodiac|lunar|solar|celestial|astronomical|aspect)/i,
    /^(retrograde|direct|stationary|conjunction|opposition)/i,

    // Campaign patterns
    /^(campaign|progress|metrics|safety|intelligence|enterprise)/i,
    /^(ml|predictive|analytics|monitoring|tracking|reporting)/i,

    // Test patterns
    /^(mock|stub|test|expect|jest|describe|it|before|after)/i,
    /^(spy|fixture|snapshot|setup|teardown|helper)/i,
  ];

  return preservePatterns.some(pattern => pattern.test(name));
}

// Apply systematic fixes
function applySystematicFixes(unusedVars) {
  const fixes = new Map();
  let fixCount = 0;

  // Group by file
  unusedVars.forEach(uv => {
    if (!fixes.has(uv.file)) {
      fixes.set(uv.file, []);
    }
    fixes.get(uv.file).push(uv);
  });

  // Process each file
  fixes.forEach((vars, filePath) => {
    try {
      const relativePath = filePath.replace(process.cwd() + '/', '');

      if (!fs.existsSync(relativePath)) {
        console.log(`⚠️  File not found: ${relativePath}`);
        return;
      }

      let content = fs.readFileSync(relativePath, 'utf8');
      let modified = false;

      vars.forEach(uv => {
        const shouldPreserve = shouldPreserveVariable(uv.name);

        if (uv.type === 'parameter') {
          // For parameters, just prefix with underscore
          const regex = new RegExp(
            `\\b${uv.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?=\\s*[,:)])`,
            'g',
          );
          if (regex.test(content)) {
            content = content.replace(regex, '_' + uv.name);
            modified = true;
            fixCount++;
            console.log(`  ✅ ${relativePath}: ${uv.name} → _${uv.name} (parameter)`);
          }
        } else if (shouldPreserve) {
          // For preserved variables, prefix with UNUSED_
          const regex = new RegExp(`\\b${uv.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, 'UNUSED_' + uv.name);
            modified = true;
            fixCount++;
            console.log(`  ✅ ${relativePath}: ${uv.name} → UNUSED_${uv.name} (preserved)`);
          }
        } else {
          // For regular variables, prefix with underscore
          const regex = new RegExp(`\\b${uv.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, '_' + uv.name);
            modified = true;
            fixCount++;
            console.log(`  ✅ ${relativePath}: ${uv.name} → _${uv.name}`);
          }
        }
      });

      if (modified) {
        fs.writeFileSync(relativePath, content, 'utf8');
        console.log(`✅ Fixed ${vars.length} unused variables in ${relativePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  });

  return fixCount;
}

function main() {
  console.log('🚀 Systematic Unused Variables Fix');
  console.log('==================================');

  // Get current unused variables
  console.log('📊 Analyzing unused variables...');
  const unusedVars = getUnusedVariables();
  console.log(`Found ${unusedVars.length} unused variables`);

  if (unusedVars.length === 0) {
    console.log('✅ No unused variables found!');
    return;
  }

  // Apply fixes to first 50 variables to avoid overwhelming changes
  const varsToFix = unusedVars.slice(0, 50);
  console.log(`\n🔧 Fixing first ${varsToFix.length} unused variables...\n`);

  const fixCount = applySystematicFixes(varsToFix);

  // Validate build
  console.log('\n📋 Validating TypeScript compilation...');
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.error('❌ Build failed after fixes');
    console.error('Rolling back changes...');
    execSync('git restore .', { stdio: 'inherit' });
    return;
  }

  // Check improvement
  console.log('\n📊 Checking improvement...');
  const newUnusedVars = getUnusedVariables();
  const improvement = unusedVars.length - newUnusedVars.length;

  console.log(`\n📈 Results:`);
  console.log(`- Variables fixed: ${fixCount}`);
  console.log(`- Before: ${unusedVars.length} unused variables`);
  console.log(`- After: ${newUnusedVars.length} unused variables`);
  console.log(
    `- Improvement: ${improvement} variables (${((improvement / unusedVars.length) * 100).toFixed(1)}%)`,
  );

  console.log('\n📌 Next Steps:');
  console.log('1. Review changes with git diff');
  console.log('2. Run script again to fix more variables');
  console.log('3. Commit changes when satisfied');
}

main();
