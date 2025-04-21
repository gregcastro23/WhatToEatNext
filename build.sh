#!/bin/bash

# Color variables
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting build process...${NC}"

# Step 1: Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  yarn install
fi

# Step 2: Run TypeScript type checking
echo -e "${YELLOW}Running TypeScript type checking...${NC}"
yarn tsc --noEmit

# Check if TypeScript failed
TS_EXIT_CODE=$?
if [ $TS_EXIT_CODE -ne 0 ]; then
  echo -e "${RED}TypeScript check failed.${NC}"
  echo -e "${YELLOW}See typescript-fixes.md for progress on fixing TypeScript errors.${NC}"
  echo -e "${YELLOW}Continue with build anyway? (y/n)${NC}"
  read CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    echo -e "${RED}Build aborted.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}TypeScript check passed.${NC}"
fi

# Step 3: Run linting
echo -e "${YELLOW}Running linting...${NC}"
yarn lint

# Check if linting failed
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  echo -e "${RED}Linting failed.${NC}"
  echo -e "${YELLOW}Continue with build anyway? (y/n)${NC}"
  read CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    echo -e "${RED}Build aborted.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}Linting passed.${NC}"
fi

# Step 4: Run tests if appropriate
# echo -e "${YELLOW}Running tests...${NC}"
# yarn test

# Step 5: Build the project
echo -e "${YELLOW}Building the project...${NC}"
yarn build

# Check if build failed
BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo -e "${RED}Build failed.${NC}"
  exit 1
else
  echo -e "${GREEN}Build completed successfully.${NC}"
fi

# Done!
echo -e "${GREEN}Build process completed.${NC}"
exit 0 