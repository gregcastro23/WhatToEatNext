
import os
import re

directory = 'src/data/cuisines'
cuisine_recipes = {}

for filename in os.listdir(directory):
    if filename.endswith('.ts') and filename not in ['index.ts', 'template.ts', 'culinaryTraditions.ts']:
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()
            
            # Find the main cuisine name
            cuisine_match = re.search(r'name:\s*["\']([^"\']+)["\']', content)
            if not cuisine_match:
                continue
            main_cuisine_name = cuisine_match.group(1)
            
            # Extract all names that seem to be part of a dish object
            # A dish object usually has name, description, and either instructions or preparationSteps
            
            # Use a more flexible regex
            # Find all blocks that look like they could be a dish
            # They start with { and have a name and description
            
            # Actually, let's just find name: "..." and see if there is a description: "..." nearby
            # AND it's inside the dishes: { ... } block
            
            dishes_match = re.search(r'dishes:\s*\{([\s\S]+)\},\s*(?:traditionalSauces|sauceRecommender|cookingTechniques)', content)
            if not dishes_match:
                # Try another way to find the end of dishes
                dishes_match = re.search(r'dishes:\s*\{([\s\S]+?)\s*\}\s*,\s*\n\s*traditionalSauces', content)
            
            # If still not found, just use the whole content but skip the main cuisine name
            if dishes_match:
                search_content = dishes_match.group(1)
            else:
                search_content = content
            
            # Find name followed by description
            matches = re.findall(r'name:\s*["\']([^"\']+)["\'],\s+description:', search_content)
            
            recipes = []
            for name in matches:
                if name.lower() != main_cuisine_name.lower():
                    recipes.append(name)
            
            if recipes:
                cuisine_recipes[main_cuisine_name] = sorted(list(set(recipes)))

for cuisine in sorted(cuisine_recipes.keys()):
    print(f"\n### {cuisine}")
    for recipe in cuisine_recipes[cuisine]:
        print(f"- {recipe}")
