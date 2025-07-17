# Kiro Agent Hooks

This directory contains agent hook configurations that automate routine tasks and maintain code quality through intelligent monitoring.

## Hook Types

### Planetary Data Validation Hook
- Monitors changes to planetary data files
- Validates transit dates and position consistency
- Runs astronomical tests automatically
- Configured for automatic approval with git stash rollback

### Ingredient Consistency Checker Hook
- Monitors ingredient data file modifications
- Validates elemental properties and compatibility scores
- Verifies alchemical mappings
- Configured for automatic approval with file backup rollback

### TypeScript Campaign Trigger Hook
- Monitors TypeScript error thresholds
- Analyzes error distribution patterns
- Triggers campaign system for automated fixes
- Configured for manual approval with campaign stash rollback

### Build Quality Monitoring Hook
- Monitors performance and error tracking
- Analyzes build time and memory usage
- Reports quality metrics and alerts
- Configured for automated responses to critical issues

## Hook Configuration Format

Each hook is defined as a markdown file with YAML front-matter configuration and detailed implementation instructions.

## Approval Types

- **auto**: Automatically approved and executed
- **manual**: Requires user approval before execution

## Rollback Strategies

- **git_stash**: Uses git stash for rollback
- **file_backup**: Creates file backups for rollback
- **campaign_stash**: Uses campaign system stash for rollback