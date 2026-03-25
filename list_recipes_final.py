
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
            
            # Look for objects that have name, description and cuisine
            # These are almost certainly recipes
            # We want to catch names within the dishes block
            
            # Find all dish objects
            # A dish object usually looks like: { name: "...", description: "...", cuisine: "...", ... }
            # Let's search for name then cuisine within a reasonable distance
            matches = re.findall(r'name:\s*["\']([^"\']+)["\'][\s\S]{1,200}cuisine:\s*["\']([^"\']+)["\']', content)
            
            recipes = []
            for name, cuisine in matches:
                if cuisine == main_cuisine_name and name != main_cuisine_name:
                    recipes.append(name)
            
            if recipes:
                cuisine_recipes[main_cuisine_name] = sorted(list(set(recipes)))

for cuisine in sorted(cuisine_recipes.keys()):
    print(f"\n### {cuisine}")
    for recipe in cuisine_recipes[cuisine]:
        print(f"- {recipe}")
