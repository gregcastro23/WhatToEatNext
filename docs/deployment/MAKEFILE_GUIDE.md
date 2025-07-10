# 🧙‍♂️ WhatToEatNext Makefile Guide

## Quick Start

```bash
# See all available commands
make help

# Standard development workflow
make check          # Check for TypeScript errors
make build          # Build the project
make test           # Run tests
make deploy         # Full deployment pipeline
```

## 🎯 Core Commands

### Development Workflow
```bash
make dev            # Start Next.js development server
make dev-astro      # Start Astro development server
make build          # Production build with TypeScript check
make test           # Run all tests
make test-watch     # Run tests in watch mode
```

### TypeScript Error Management
```bash
make check          # Check TypeScript errors
make errors         # Analyze and count errors by type
make errors-detail  # Show last 20 errors
make quick-check    # Quick error overview
```

### Script Management
```bash
make scripts        # List available fix scripts
make fix-typescript # Run TypeScript fixes (dry-run)
make fix-syntax     # Run syntax fixes (dry-run)
make fix-elemental  # Run elemental logic fixes (dry-run)
```

## 🚀 Deployment Pipeline

### Standard Deployment
```bash
make deploy         # Full pipeline: check → test → build → deploy
```

### Manual Pipeline Steps
```bash
make deploy-check   # Pre-deployment validation only
make build          # Build after validation
```

## 🔧 Maintenance Commands

### Cleanup
```bash
make clean          # Remove build artifacts
make clean-full     # Full clean including node_modules
```

### Git Helpers
```bash
make status         # Show git status + recent commits
make commit-checkpoint  # Create timestamped commit
make backup         # Create backup branch
```

### Emergency
```bash
make emergency-restore  # Find recent clean states
make phase-status      # Check current error reduction phase
```

## 🎯 Common Workflows

### Daily Development
```bash
make check && make dev
```

### Before Committing
```bash
make workflow       # Complete check → build → test cycle
```

### Error Debugging Session
```bash
make errors         # See error breakdown
make errors-detail  # Get specific error details
make fix-typescript # Apply fixes (dry-run first)
```

### Phase Management (Your Systematic Approach)
```bash
make phase-status   # Check current phase progress
make errors         # Analyze remaining errors
make commit-checkpoint  # Save progress
```

## 📊 Understanding Error Analysis

### Error Count Tracking
```bash
make errors         # Shows total count + breakdown by type
# Example output:
# Total error count: 424
# Error breakdown by type:
#   15 TS2339
#   22 TS2322  
#   8 TS2345
```

### Detailed Error Investigation
```bash
make errors-detail  # Shows actual error messages
make quick-check    # Just the summary
```

## 🔧 Script Integration

### Dry-Run First Philosophy
All script commands run in dry-run mode by default:
```bash
make fix-typescript  # Shows what would be changed
make fix-syntax      # Shows proposed fixes
make fix-elemental   # Shows elemental logic fixes
```

### Running Actual Fixes
```bash
# After reviewing dry-run output:
node scripts/typescript-fixes/fix-duplicate-identifiers-systematic.js
```

## 🎯 Your Systematic Error Reduction Approach

### Phase Tracking
```bash
make phase-status   # Current phase progress
make errors         # Remaining error count
make commit-checkpoint  # Save phase milestone
```

### File-by-File Approach
```bash
# For each target file:
make errors-detail | grep "filename"  # Find specific errors
# Edit file manually
make check         # Validate changes
make commit-checkpoint  # Save progress
```

## 💡 Pro Tips

### 1. Always Check Before Building
```bash
make check && make build
```

### 2. Use Quick Workflow for Rapid Iteration
```bash
make quick-check    # Fast error overview
# Make changes
make quick-check    # Verify improvements
```

### 3. Safe Deployment Pattern
```bash
make backup         # Create safety branch
make deploy         # Full pipeline
# If issues: git checkout backup-branch
```

### 4. Emergency Recovery
```bash
make emergency-restore  # Find clean states
make clean-full && make install  # Nuclear option
```

## 🔄 Integration with Your Current Workflow

### Replaces These Commands
```bash
# Instead of:
yarn tsc --noEmit --skipLibCheck

# Use:
make check
```

```bash
# Instead of:
yarn build

# Use:
make build  # Includes TypeScript check + build
```

### Enhances These Patterns
```bash
# Your systematic approach:
make phase-status   # Know where you are
make errors         # Understand current state  
make commit-checkpoint  # Save progress
```

## 🎯 Customization

### Adding New Commands
Edit the Makefile and add:
```makefile
my-command:
	@echo "Description..."
	command-to-run
```

### Modifying Existing Commands
All commands are clearly labeled and easy to modify for your specific needs.

---

**🚀 Start with:** `make help` to see all available commands
**🎯 Daily use:** `make check && make dev`
**🔧 Deployment:** `make deploy` 