import os
import re
import sys

def bulk_refactor_nutrient_deviation(target_directory="src/components/"):
    """
    Globally searches and replaces 'NutrientDeviation' with 'ComplianceDeficiency'
    in .tsx, .ts, and .js files within the target_directory.
    """
    count_files_modified = 0
    count_replacements = 0

    # Ensure the target directory exists
    if not os.path.isdir(target_directory):
        print(f"Error: Target directory '{target_directory}' not found.")
        sys.exit(1)

    print(f"Starting refactor in '{target_directory}'...")

    for root, _, files in os.walk(target_directory):
        for filename in files:
            if filename.endswith(('.tsx', '.ts', '.js')):
                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Perform replacement
                    # Using re.sub to ensure all occurrences in a line are replaced
                    new_content, num_found = re.subn(r'NutrientDeviation', r'ComplianceDeficiency', content)

                    if num_found > 0:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Modified: {filepath} ({num_found} replacements)")
                        count_files_modified += 1
                        count_replacements += num_found

                except Exception as e:
                    print(f"Error processing file {filepath}: {e}")

    # Corrected f-string usage
    print(f"Refactor Complete: {count_replacements} replacements made in {count_files_modified} files.")

if __name__ == "__main__":
    # For this task, it's hardcoded to "src/components/"
    bulk_refactor_nutrient_deviation()