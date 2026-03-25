
import os
import re

directory = 'src/data/cuisines'
recipe_names = []

# Regex to find dishes block and then names within it
# This is a bit complex for regex, maybe better to just look for objects with id, name, description, cuisine
# Most recipes have 'cuisine' property or 'instructions' or 'ingredients'

for filename in os.listdir(directory):
    if filename.endswith('.ts') and filename not in ['index.ts', 'template.ts', 'culinaryTraditions.ts']:
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()
            
            # Find the cuisine name
            cuisine_match = re.search(r'name:\s*["\']([^"\']+)["\']', content)
            if not cuisine_match:
                continue
            cuisine_name = cuisine_match.group(1)
            
            # Find the dishes block
            dishes_match = re.search(r'dishes:\s*\{([\s\S]+?)\s*\},', content)
            if dishes_match:
                dishes_content = dishes_match.group(1)
                # Find all names within the dishes block that look like recipe names
                # They usually have an id, name, and description
                # Pattern: name: "Name",\s+description:
                recipes = re.findall(r'name:\s*["\']([^"\']+)["\'](?:,\s*description|,\s*cuisine)', dishes_content)
                if recipes:
                    recipe_names.append((cuisine_name, recipes))

for cuisine, recipes in sorted(recipe_names):
    print(f"\n### {cuisine}")
    # Remove duplicates and sort
    unique_recipes = sorted(list(set(recipes)))
    for recipe in unique_recipes:
        print(f"- {recipe}")
