
import os
import re

directory = 'src/data/cuisines'
recipe_names = []

for filename in os.listdir(directory):
    if filename.endswith('.ts') and filename != 'index.ts' and filename != 'template.ts' and filename != 'culinaryTraditions.ts':
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()
            # Find name: "Recipe Name" or name: 'Recipe Name'
            # We want names within dishes blocks
            # A simple regex might get some false positives but should be mostly correct
            matches = re.findall(r'name:\s*["\']([^"\']+)["\']', content)
            # The first match is usually the cuisine name (e.g., name: "Italian")
            if matches:
                cuisine_name = matches[0]
                recipes = matches[1:]
                recipe_names.append((cuisine_name, recipes))

for cuisine, recipes in sorted(recipe_names):
    print(f"\n### {cuisine}")
    for recipe in sorted(set(recipes)):
        print(f"- {recipe}")
