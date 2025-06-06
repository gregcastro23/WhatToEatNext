#!/bin/bash

echo "Pushing changes to GitHub..."
echo "----------------------------------------"

echo "1. First pushing to main branch..."
git checkout main
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to main branch!"
else
    echo "❌ Failed to push to main branch. Please check your GitHub credentials."
    echo "You may need to generate a personal access token and use it instead of your password."
    echo "Visit: https://github.com/settings/tokens to create a token."
    exit 1
fi

echo "----------------------------------------"
echo "2. Now pushing to master branch..."
git checkout master
git push origin master
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to master branch!"
else
    echo "❌ Failed to push to master branch."
    exit 1
fi

echo "----------------------------------------"
echo "✅ All changes have been successfully pushed to GitHub!"
echo "Current branch: $(git branch --show-current)" 