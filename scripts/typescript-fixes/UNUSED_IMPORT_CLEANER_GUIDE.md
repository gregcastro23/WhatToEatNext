# 🚀 Unused Import Cleaner (v2.1) – Safe, Scalable, Production-Ready

We are using a production-grade, AST-based unused import cleaner for our TypeScript/JavaScript codebase.

## Key Features:
- AST-based, comment-preserving, alias-aware import removal (uses @babel/parser)
- Batch size scaling based on real-world safety metrics
- Git stash integration for rollback
- Syntax validation before any file is written
- CI/CD and team workflow ready (JSON output, exit codes, silent mode)
- Persistent safety metrics in `.import-cleaner-metrics.json`

## How to Run:

### Preview (Dry Run, Safe!):  
```bash
yarn clean-imports:dry
```

### Apply Fixes (after review):  
```bash
yarn clean-imports
```

### Increase Batch Size (as safety score improves):  
```bash
yarn clean-imports:dry --batch 10
```

### Check Safety Metrics:  
```bash
yarn clean-imports:metrics
```

### Advanced/CI:  
```bash
./scripts/typescript-fixes/clean-imports.sh --dry-run --json --silent
node scripts/typescript-fixes/fix-unused-imports-interactive.js --auto-fix --max-files=15
```

## Safety Protocol:
- Always start with a dry run and review output
- Monitor safety metrics before scaling up
- Use git stash/restore for rollback if needed
- Never run on uncommitted changes

## If you encounter issues:
- Check `.import-cleaner-metrics.json` for error details
- Use `git restore` or stash rollback to undo changes
- Report problems and pause further runs

This tool is now ready for safe, scalable, and team-friendly unused import cleanup!

---

## Quick Reference Commands

| Command | Purpose | Safety Level |
|---------|---------|--------------|
| `yarn clean-imports:dry` | Preview changes | ✅ Safe |
| `yarn clean-imports` | Apply fixes | ⚠️ Review first |
| `yarn clean-imports:metrics` | Check safety | ✅ Safe |
| `yarn clean-imports:dry --batch 10` | Larger batch | ⚠️ Monitor metrics |

## Team Onboarding Checklist

- [ ] Run `yarn clean-imports:dry` to see the tool in action
- [ ] Review the safety metrics with `yarn clean-imports:metrics`
- [ ] Understand the git stash rollback process
- [ ] Know how to check `.import-cleaner-metrics.json` for issues
- [ ] Practice on a test branch before using on main

## CI/CD Integration

The tool supports JSON output and proper exit codes for CI/CD pipelines:

```bash
# In CI pipeline
./scripts/typescript-fixes/clean-imports.sh --json --silent
if [ $? -eq 0 ]; then
    echo "Import cleanup successful"
else
    echo "Import cleanup failed - check logs"
    exit 1
fi
```

## Safety Metrics Explained

The tool tracks:
- **Success Rate**: Percentage of files processed without errors
- **Batch Size**: Current safe batch size for processing
- **Error Types**: Categories of issues encountered
- **Performance**: Processing time and efficiency metrics

These metrics help determine when it's safe to increase batch sizes for faster processing. 