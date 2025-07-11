#!/bin/bash

echo "Enhanced Push Script - Debugging Version"
echo "========================================"

# Function to try pushing with different methods
try_push() {
  local branch=$1
  local attempts=0
  local max_attempts=3
  
  echo "🔄 Attempting to push $branch (attempt 1/${max_attempts})"
  git push origin $branch
  
  if [ $? -eq 0 ]; then
    echo "✅ Push successful on first try!"
    return 0
  fi
  
  # Try with -f flag
  ((attempts++))
  echo "🔄 Attempting force push (attempt $((attempts+1))/${max_attempts})"
  git push -f origin $branch
  
  if [ $? -eq 0 ]; then
    echo "✅ Force push successful!"
    return 0
  fi
  
  # Try with verbose debugging
  ((attempts++))
  echo "🔄 Attempting push with verbose output (attempt $((attempts+1))/${max_attempts})"
  GIT_SSH_COMMAND="ssh -v" git push origin $branch
  
  return $?
}

# Make sure we have the latest from remote
echo "⬇️ Fetching latest changes from remote..."
git fetch

# Push main branch
echo "🔄 Switching to main branch"
git checkout main

echo "📊 Current status:"
git status

echo "🚀 Pushing main branch..."
try_push main
if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed to main branch!"
else
  echo "❌ Failed to push to main branch after multiple attempts."
  echo "Creating a backup patch file..."
  git format-patch -o ../main-patches origin/main
  echo "Backup created in ../main-patches/"
fi

echo "----------------------------------------"

# Push master branch
echo "🔄 Switching to master branch"
git checkout master

echo "📊 Current status:"
git status

echo "🚀 Pushing master branch..."
try_push master
if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed to master branch!"
else
  echo "❌ Failed to push to master branch after multiple attempts."
  echo "Creating a backup patch file..."
  git format-patch -o ../master-patches origin/master
  echo "Backup created in ../master-patches/"
fi

echo "----------------------------------------"
echo "🔍 Final remote branch status:"
git branch -a

echo "📊 Final local status:"
git status 