#!/bin/bash

# Script to find potentially unused files in the project
# This script checks for files that aren't imported anywhere else in the codebase

echo "Starting unused file detection..."
echo "This will search for files that might not be used or imported elsewhere"
echo "NOTE: This is a heuristic approach and may show false positives"
echo "Press Enter to continue or Ctrl+C to abort"
read

# Create a temporary file to store results
TEMP_FILE=$(mktemp)

# Find all TypeScript and JavaScript files excluding node_modules, .git, etc.
echo "Scanning source files..."
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next*/*" > "$TEMP_FILE"

# Function to check if a file is imported anywhere
check_file_usage() {
  local file=$1
  
  # Get filename without path or extension
  local filename=$(basename "$file" | sed 's/\.[^.]*$//')
  
  # Skip known entry points and special files
  if [[ "$filename" == "index" || "$filename" == "app" || "$filename" == "layout" || "$filename" == "page" || "$filename" == "types" ]]; then
    return 0
  fi
  
  # Skip files in type directories
  if [[ "$file" == *"/types/"* || "$file" == *"/interfaces/"* ]]; then
    return 0
  fi
  
  # Check if file is imported anywhere
  grep -r --include="*.{ts,tsx,js,jsx}" "from ['\"].*$filename['\"]" ./src > /dev/null 2>&1 || \
  grep -r --include="*.{ts,tsx,js,jsx}" "import.*$filename" ./src > /dev/null 2>&1 || \
  grep -r --include="*.{ts,tsx,js,jsx}" "require.*$filename" ./src > /dev/null 2>&1
  
  return $?
}

echo "Identifying potentially unused files (this may take a moment)..."
echo "Potentially unused files:" > unused_files.txt

# Process each file
total_files=$(wc -l < "$TEMP_FILE")
counter=0

while IFS= read -r file; do
  ((counter++))
  echo -ne "Checking file $counter of $total_files: $file\r"
  
  if ! check_file_usage "$file"; then
    echo "$file" >> unused_files.txt
  fi
done < "$TEMP_FILE"

echo -e "\nAnalysis complete!"
echo "$(wc -l < unused_files.txt) potentially unused files found and listed in 'unused_files.txt'"
echo "Please review this list carefully before taking any action, as some files might be entry points, used dynamically, or needed at runtime."

# Clean up
rm "$TEMP_FILE" 