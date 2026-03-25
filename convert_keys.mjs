import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/data/cuisines/**/*.ts');

const keyMap = {
  'recipe_name': 'name',
  'prep_time_minutes': 'prepTimeMinutes',
  'cook_time_minutes': 'cookTimeMinutes',
  'base_serving_size': 'baseServingSize',
  'spice_level': 'spiceLevel',
  'meal_type': 'mealType',
  'cooking_methods': 'cookingMethods',
  'elemental_properties': 'elementalProperties',
  'astrological_affinities': 'astrologicalAffinities',
  'lunar_phases': 'lunarPhases',
  'nutrition_per_serving': 'nutritionPerServing',
  'protein_g': 'proteinG',
  'carbs_g': 'carbsG',
  'fat_g': 'fatG',
  'fiber_g': 'fiberG',
  'sodium_mg': 'sodiumMg',
  'sugar_g': 'sugarG',
  'original_ingredient': 'originalIngredient',
  'substitute_options': 'substituteOptions',
  'fire': 'Fire',
  'water': 'Water',
  'earth': 'Earth',
  'air': 'Air'
};

const sourceFiles = project.getSourceFiles();

for (const sourceFile of sourceFiles) {
  let fileModified = false;
  const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
  
  for (const obj of objectLiterals) {
    const properties = obj.getProperties();
    
    for (const prop of properties) {
      if (prop.isKind(SyntaxKind.PropertyAssignment)) {
        const nameNode = prop.getNameNode();
        let name = '';
        
        if (nameNode.isKind(SyntaxKind.Identifier)) {
          name = nameNode.getText();
        } else if (nameNode.isKind(SyntaxKind.StringLiteral)) {
          name = nameNode.getLiteralValue();
        }
        
        if (keyMap[name]) {
          const newName = keyMap[name];
          console.log(`Renaming key ${name} to ${newName} in ${sourceFile.getBaseName()}`);
          
          // Use rename if it's an identifier, or just replace text if it's a string literal key
          if (nameNode.isKind(SyntaxKind.Identifier)) {
             // We don't want a full project rename, just the key in this object
             nameNode.replaceWithText(newName);
          } else if (nameNode.isKind(SyntaxKind.StringLiteral)) {
             // For JSON-like objects with quoted keys
             nameNode.replaceWithText(`"${newName}"`);
          }
          fileModified = true;
        }
      }
    }
  }
  
  if (fileModified) {
    sourceFile.saveSync();
  }
}

console.log('Conversion complete.');
