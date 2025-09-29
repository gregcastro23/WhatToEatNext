#!/usr/bin/env python3
"""
TypeScript Data Extraction Script
Extract data from TypeScript files for database migration
Created: September 26, 2025
"""

import sys
import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import subprocess

# Project root
project_root = Path(__file__).parent.parent.parent

class TypeScriptDataExtractor:
    """Extract data from TypeScript files using Node.js evaluation."""

    def __init__(self):
        self.temp_dir = Path("/tmp/ts_data_extraction")
        self.temp_dir.mkdir(exist_ok=True)

    def extract_data_from_file(self, file_path: str) -> Dict[str, Any]:
        """Extract data from a TypeScript file using Node.js."""
        try:
            # Create a temporary extraction script
            extraction_script = self._create_extraction_script(file_path)

            # Run the extraction script
            result = subprocess.run(
                ['node', str(extraction_script)],
                capture_output=True,
                text=True,
                cwd=str(project_root),
                timeout=30
            )

            if result.returncode != 0:
                print(f"Extraction failed for {file_path}: {result.stderr}")
                return {}

            # Parse the JSON output
            return json.loads(result.stdout.strip())

        except Exception as e:
            print(f"Error extracting data from {file_path}: {e}")
            return {}

    def _create_extraction_script(self, file_path: str) -> Path:
        """Create a Node.js script to extract data from TypeScript file."""
        script_path = self.temp_dir / f"extract_{hash(file_path)}.js"

        # Convert relative path to absolute
        abs_file_path = project_root / file_path

        script_content = f'''
// Temporary extraction script for {file_path}
const fs = require('fs');
const path = require('path');

// Target file
const targetFile = "{abs_file_path}";

try {{
    // Read the file
    const content = fs.readFileSync(targetFile, 'utf8');

    // Remove problematic imports and exports
    let processed = content
        .replace(/import.*?from.*?['"];\\s*/g, '')
        .replace(/export\\s+/g, '')
        .replace(/const\\s+/g, 'var ')
        .replace(/type\\s+.*?=/g, 'var $1 =')
        .replace(/interface\\s+.*?{{/g, 'var $1 = {')
        .replace(/}}/g, '};')
        .replace(/;/g, ';\\n');

    // Add module wrapper
    const wrapped = `
        try {{
            ${{processed}}
            console.log(JSON.stringify(module.exports || {{}}, null, 2));
        }} catch (e) {{
            console.error("Extraction error:", e.message);
            console.log("{{\\"error\\": \\"${{e.message}}\\"}}");
        }}
    `;

    // Execute the code
    eval(wrapped);

}} catch (error) {{
    console.error("File reading error:", error.message);
    console.log("{{\\"error\\": \\"${{error.message}}\\"}}");
}}
'''

        script_path.write_text(script_content)
        return script_path

    def extract_ingredient_data(self) -> Dict[str, Any]:
        """Extract all ingredient data."""
        print("Extracting ingredient data...")

        ingredient_data = {}

        # Ingredient category files
        categories = {
            'fruits': 'src/data/ingredients/fruits/index.ts',
            'vegetables': 'src/data/ingredients/vegetables/index.ts',
            'proteins': 'src/data/ingredients/proteins/index.ts',
            'herbs': 'src/data/ingredients/herbs/index.ts',
            'spices': 'src/data/ingredients/spices/index.ts',
            'grains': 'src/data/ingredients/grains/index.ts',
            'oils': 'src/data/ingredients/oils/index.ts',
            'seasonings': 'src/data/ingredients/seasonings/index.ts'
        }

        for category, file_path in categories.items():
            if (project_root / file_path).exists():
                print(f"Extracting {category}...")
                data = self.extract_data_from_file(file_path)
                if data and not data.get('error'):
                    ingredient_data.update(data)
                else:
                    print(f"Failed to extract {category} data")

        return ingredient_data

    def extract_recipe_data(self) -> Dict[str, Any]:
        """Extract all recipe data."""
        print("Extracting recipe data...")

        recipe_data = {}

        # Recipe files
        recipe_files = [
            'src/data/recipes.ts',
            'src/data/unified/recipes.ts'
        ]

        for file_path in recipe_files:
            if (project_root / file_path).exists():
                print(f"Extracting recipes from {file_path}...")
                data = self.extract_data_from_file(file_path)
                if data and not data.get('error'):
                    recipe_data.update(data)
                else:
                    print(f"Failed to extract recipe data from {file_path}")

        return recipe_data

    def extract_elemental_data(self) -> Dict[str, Any]:
        """Extract elemental properties data."""
        print("Extracting elemental properties...")

        elemental_files = [
            'src/data/ingredients/elementalProperties.ts',
            'src/data/elementalProperties.ts'
        ]

        elemental_data = {}

        for file_path in elemental_files:
            if (project_root / file_path).exists():
                data = self.extract_data_from_file(file_path)
                if data and not data.get('error'):
                    elemental_data.update(data)

        return elemental_data

def main():
    """Main extraction function."""
    extractor = TypeScriptDataExtractor()

    # Extract all data
    ingredients = extractor.extract_ingredient_data()
    recipes = extractor.extract_recipe_data()
    elemental = extractor.extract_elemental_data()

    # Save extracted data as JSON for migration
    output_dir = project_root / "backend" / "data" / "extracted"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save ingredients
    with open(output_dir / "ingredients.json", 'w') as f:
        json.dump(ingredients, f, indent=2, default=str)

    # Save recipes
    with open(output_dir / "recipes.json", 'w') as f:
        json.dump(recipes, f, indent=2, default=str)

    # Save elemental data
    with open(output_dir / "elemental.json", 'w') as f:
        json.dump(elemental, f, indent=2, default=str)

    print(f"Data extraction completed. Files saved to {output_dir}")

if __name__ == "__main__":
    main()
