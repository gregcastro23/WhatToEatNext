#!/bin/bash

# Cleanup script for removing duplicate files in the root directory
# This script will identify files with " 2" in their name and remove them
# The script will preserve important configuration files if they differ from originals

echo "Starting root directory cleanup process..."
echo "This will remove duplicate files in the root directory that have ' 2' in their name"
echo "Press Enter to continue or Ctrl+C to abort"
read

# Compare and clean up configuration files
echo "Checking and cleaning configuration files..."

# Clean up .npmrc files
if diff -q .npmrc ".npmrc 2" >/dev/null 2>&1; then
  echo "Removing duplicate .npmrc 2 (identical to .npmrc)"
  rm -v ".npmrc 2"
else
  echo "WARNING: .npmrc and .npmrc 2 are different."
  echo "Merging .npmrc 2 into .npmrc..."
  cat ".npmrc 2" >> .npmrc
  rm -v ".npmrc 2"
fi

# Clean up .yarnrc files
if diff -q .yarnrc ".yarnrc 2" >/dev/null 2>&1; then
  echo "Removing duplicate .yarnrc 2 (identical to .yarnrc)"
  rm -v ".yarnrc 2"
else
  echo "WARNING: .yarnrc and .yarnrc 2 are different."
  echo "Merging .yarnrc 2 into .yarnrc..."
  cat ".yarnrc 2" >> .yarnrc
  rm -v ".yarnrc 2"
fi

# Clean up package.json files
if diff -q package.json "package 2.json" >/dev/null 2>&1; then
  echo "Removing duplicate package 2.json (identical to package.json)"
  rm -v "package 2.json"
else
  echo "WARNING: package.json and package 2.json are different."
  echo "Please manually check these files to merge any differences."
  echo "For now, we'll keep both files."
fi

# Clean up eslint config files
if [ -f ".eslintrc.js" ] && [ -f ".eslintrc 2.js" ]; then
  if diff -q .eslintrc.js ".eslintrc 2.js" >/dev/null 2>&1; then
    echo "Removing duplicate .eslintrc 2.js (identical to .eslintrc.js)"
    rm -v ".eslintrc 2.js"
  else
    echo "WARNING: .eslintrc.js and .eslintrc 2.js are different."
    echo "Please manually check these files to merge any differences."
    echo "For now, we'll keep both files."
  fi
fi

# Clean up next.config files
if diff -q next.config.mjs "next.config 2.mjs" >/dev/null 2>&1; then
  echo "Removing duplicate next.config 2.mjs (identical to next.config.mjs)"
  rm -v "next.config 2.mjs"
else
  echo "WARNING: next.config.mjs and next.config 2.mjs are different."
  echo "Please manually check these files to merge any differences."
  echo "For now, we'll keep both files."
fi

# Remove empty files
echo "Removing empty files with '2' in their name..."
find . -maxdepth 1 -name "* 2*" -type f -size 0 -exec rm -v {} \;

# Clean up yarn lock files - keep only the most recent yarn.lock
echo "Cleaning up yarn lock files..."
rm -v "yarn 2.lock" "yarn 3.lock" "yarn 4.lock" "yarn 5.lock" "yarn 6.lock" "yarn 7.lock" "yarn 8.lock"

# Clean up package-lock files
echo "Cleaning up package-lock files..."
rm -v "package-lock 2.json" "package-lock 3.json"

# Clean up identical files
echo "Checking for other identical duplicates..."
for file in *\ 2*; do
  if [ -f "$file" ]; then
    # Extract the original filename by removing the " 2" portion
    orig_file=$(echo "$file" | sed 's/ 2\([^\/]*\)$/\1/')
    
    # Check if original file exists
    if [ -f "$orig_file" ]; then
      # Compare the files
      if diff -q "$orig_file" "$file" >/dev/null 2>&1; then
        echo "Removing duplicate $file (identical to $orig_file)"
        rm -v "$file"
      else
        echo "WARNING: $orig_file and $file are different. Keeping both for now."
      fi
    fi
  fi
done

echo "Root directory cleanup complete!" 