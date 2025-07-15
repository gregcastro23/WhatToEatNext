import fs from 'fs';
import path from 'path';

const isDryRun = process.argv.includes('--dry-run');

function fixFoodRecommenderJSX() {
    const filePath = 'src/components/Header/FoodRecommender/index.tsx';
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the conditional expression that needs closing
    const conditionalPattern = /\{\(transformedIngredients \|\| \[\]\)\.length === 0 \? \(/;
    const conditionalMatch = content.match(conditionalPattern);
    
    if (!conditionalMatch) {
        console.log('❌ Could not find the conditional expression to fix');
        return;
    }
    
    console.log('✅ Found conditional expression that needs closing brace');
    
    // Find the end of the conditional (after the second closing parenthesis)
    // Look for the pattern: </div>\n                    )}
    const endPattern = /(\s+<\/div>\s+\)\}\s+<\/>)/;
    
    if (content.match(endPattern)) {
        // Add the missing closing brace for the conditional
        content = content.replace(
            /(\s+<\/div>\s+\)\}\s+<\/>)/,
            '$1'
        );
        
        // Add the missing closing brace before the </>
        content = content.replace(
            /(\s+<\/div>\s+\)\}\s+)(<\/>)/,
            '$1}$2'
        );
        
        console.log('✅ Added missing closing brace for conditional expression');
    } else {
        console.log('❌ Could not find the pattern to fix');
        return;
    }
    
    if (isDryRun) {
        console.log('🔍 DRY RUN - Changes that would be made:');
        console.log('- Added missing closing brace for conditional expression');
        return;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed JSX structure in ${filePath}`);
}

console.log('🔧 Fixing FoodRecommender JSX structure...');
fixFoodRecommenderJSX();
console.log('✅ JSX structure fix complete'); 