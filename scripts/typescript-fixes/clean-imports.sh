#!/bin/bash

# clean-imports.sh - Bash wrapper for Enhanced Unused Import Cleaner v2.1
#
# This bash script provides easy access to the JavaScript import cleaner
# with proper error handling, environment setup, and team-friendly workflows.
#
# Usage:
#   ./scripts/typescript-fixes/clean-imports.sh                    # Interactive mode
#   ./scripts/typescript-fixes/clean-imports.sh --dry-run          # Preview changes
#   ./scripts/typescript-fixes/clean-imports.sh --auto-fix         # Auto-fix mode
#   ./scripts/typescript-fixes/clean-imports.sh --batch 10         # Custom batch size
#   ./scripts/typescript-fixes/clean-imports.sh --metrics          # Show safety metrics
#   ./scripts/typescript-fixes/clean-imports.sh --validate         # Validate safety
#   ./scripts/typescript-fixes/clean-imports.sh --help             # Show help

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMPORT_CLEANER="$SCRIPT_DIR/fix-unused-imports-interactive.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print usage information
print_usage() {
    cat << EOF
$(print_color "$BOLD" "Enhanced Unused Import Cleaner v2.1 - Bash Wrapper")
$(print_color "$CYAN" "=================================================")

$(print_color "$BOLD" "DESCRIPTION:")
  Systematically removes unused imports from TypeScript/JavaScript files
  with AST-based parsing, safety validation, and intelligent batch sizing.

$(print_color "$BOLD" "USAGE:")
  $0 [OPTIONS]

$(print_color "$BOLD" "OPTIONS:")
  $(print_color "$GREEN" "--dry-run")              Preview changes without applying them
  $(print_color "$GREEN" "--interactive")          Interactive mode with prompts (default)
  $(print_color "$GREEN" "--auto-fix")             Apply changes automatically
  $(print_color "$GREEN" "--batch N")              Set custom batch size (default: auto-detected)
  $(print_color "$GREEN" "--json")                 JSON output for automation
  $(print_color "$GREEN" "--silent")               Silent mode for CI/CD
  $(print_color "$GREEN" "--metrics")              Show safety metrics and history
  $(print_color "$GREEN" "--validate")             Validate safety without processing
  $(print_color "$GREEN" "--check-git")            Check git status only
  $(print_color "$GREEN" "--help, -h")             Show this help message

$(print_color "$BOLD" "EXAMPLES:")
  # Start with dry-run to preview changes
  $0 --dry-run

  # Run interactively (recommended)
  $0

  # Auto-fix with custom batch size
  $0 --auto-fix --batch 10

  # Check safety metrics
  $0 --metrics

  # Validate safety before running
  $0 --validate

$(print_color "$BOLD" "SAFETY FEATURES:")
  • Git stash integration for easy rollback
  • AST-based parsing for accurate import detection
  • Automatic batch size optimization based on success rate
  • Comprehensive syntax validation before changes
  • Real-time safety monitoring and error recovery

$(print_color "$BOLD" "BATCH SIZE SCALING:")
  The script automatically adjusts batch sizes based on safety metrics:
  • Fresh installation: 5 files per run
  • Good safety record: Up to 10 files per run
  • Excellent safety record: Up to 15-20 files per run

$(print_color "$BOLD" "EXIT CODES:")
  0 - Success
  1 - Error or user cancellation
  2 - Partial success (some files processed, some failed)

$(print_color "$BOLD" "FILES:")
  Configuration: .import-cleaner-metrics.json (auto-generated)
  Documentation: scripts/typescript-fixes/IMPORT_CLEANER_GUIDE.md

EOF
}

# Function to check prerequisites
check_prerequisites() {
    local errors=0
    
    print_color "$BLUE" "🔍 Checking prerequisites..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        print_color "$RED" "❌ Node.js is not installed or not in PATH"
        errors=$((errors + 1))
    else
        local node_version=$(node --version)
        print_color "$GREEN" "✅ Node.js found: $node_version"
    fi
    
    # Check if we're in the project root
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        print_color "$RED" "❌ package.json not found. Are you in the project root?"
        errors=$((errors + 1))
    else
        print_color "$GREEN" "✅ Project root detected"
    fi
    
    # Check if the import cleaner script exists
    if [[ ! -f "$IMPORT_CLEANER" ]]; then
        print_color "$RED" "❌ Import cleaner script not found at: $IMPORT_CLEANER"
        errors=$((errors + 1))
    else
        print_color "$GREEN" "✅ Import cleaner script found"
    fi
    
    # Check if make lint works
    if ! make lint &> /dev/null; then
        print_color "$YELLOW" "⚠️  'make lint' command failed - this may cause issues"
        print_color "$YELLOW" "   Ensure your project has a working Makefile with lint target"
    else
        print_color "$GREEN" "✅ 'make lint' command works"
    fi
    
    # Check for @babel/parser (optional but recommended)
    if [[ -f "$PROJECT_ROOT/package.json" ]] && grep -q "@babel/parser" "$PROJECT_ROOT/package.json"; then
        print_color "$GREEN" "✅ @babel/parser found in package.json"
    else
        print_color "$YELLOW" "⚠️  @babel/parser not found - install for better AST parsing:"
        print_color "$YELLOW" "   npm install --save-dev @babel/parser"
    fi
    
    if [[ $errors -gt 0 ]]; then
        print_color "$RED" "❌ $errors prerequisite check(s) failed"
        return 1
    fi
    
    print_color "$GREEN" "✅ All prerequisite checks passed"
    return 0
}

# Function to run with automatic retry on certain failures
run_with_retry() {
    local max_retries=2
    local retry_count=0
    local exit_code
    
    while [[ $retry_count -le $max_retries ]]; do
        if [[ $retry_count -gt 0 ]]; then
            print_color "$YELLOW" "🔄 Retry attempt $retry_count/$max_retries..."
            sleep 1
        fi
        
        # Run the import cleaner
        node "$IMPORT_CLEANER" "$@"
        exit_code=$?
        
        # Handle different exit codes
        case $exit_code in
            0)
                print_color "$GREEN" "✅ Import cleanup completed successfully!"
                return 0
                ;;
            1)
                print_color "$RED" "❌ Import cleanup failed with errors"
                return 1
                ;;
            2)
                print_color "$YELLOW" "⚠️  Import cleanup completed with some failures"
                return 2
                ;;
            *)
                print_color "$RED" "❌ Import cleanup failed with unexpected exit code: $exit_code"
                retry_count=$((retry_count + 1))
                ;;
        esac
    done
    
    print_color "$RED" "❌ Import cleanup failed after $max_retries retries"
    return $exit_code
}

# Function to show safety summary
show_safety_summary() {
    print_color "$BLUE" "🛡️ Checking safety metrics..."
    
    if node "$IMPORT_CLEANER" --show-metrics --json 2>/dev/null | jq -e '.safetyMetrics' &> /dev/null; then
        local safety_data=$(node "$IMPORT_CLEANER" --show-metrics --json 2>/dev/null)
        local safety_score=$(echo "$safety_data" | jq -r '.safetyMetrics.safetyScore // 0')
        local total_runs=$(echo "$safety_data" | jq -r '.safetyMetrics.totalRuns // 0')
        local recommended_batch=$(echo "$safety_data" | jq -r '.safetyMetrics.recommendedBatchSize // 5')
        
        local safety_percent=$(echo "$safety_score * 100" | bc -l 2>/dev/null || echo "0")
        safety_percent=$(printf "%.1f" "$safety_percent")
        
        print_color "$CYAN" "📊 Safety Score: ${safety_percent}% | Total Runs: $total_runs | Recommended Batch Size: $recommended_batch"
        
        if (( $(echo "$safety_score >= 0.8" | bc -l 2>/dev/null || echo "0") )); then
            print_color "$GREEN" "🎯 Excellent safety record - larger batch sizes available"
        elif (( $(echo "$safety_score >= 0.5" | bc -l 2>/dev/null || echo "0") )); then
            print_color "$YELLOW" "⚡ Good safety record - moderate batch sizes recommended"
        else
            print_color "$YELLOW" "🐌 Building safety record - conservative batch sizes recommended"
        fi
    else
        print_color "$CYAN" "📊 No safety metrics available yet - will start with conservative batch size"
    fi
}

# Function to handle workflow recommendations
show_workflow_recommendations() {
    print_color "$BOLD" "💡 WORKFLOW RECOMMENDATIONS:"
    print_color "$CYAN" "  1. Start with: $0 --dry-run"
    print_color "$CYAN" "  2. Review the proposed changes carefully"
    print_color "$CYAN" "  3. Run interactively: $0"
    print_color "$CYAN" "  4. Check git diff after completion"
    print_color "$CYAN" "  5. Use git stash commands for rollback if needed"
    print_color "$CYAN" "  6. As safety score improves, larger batches will be used automatically"
}

# Parse command line arguments
ARGS=()
SHOW_HELP=false
SHOW_METRICS=false
VALIDATE_ONLY=false
CHECK_GIT_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        --metrics)
            SHOW_METRICS=true
            shift
            ;;
        --validate)
            VALIDATE_ONLY=true
            shift
            ;;
        --check-git)
            CHECK_GIT_ONLY=true
            shift
            ;;
        --batch)
            if [[ -n "${2:-}" ]]; then
                ARGS+=("--max-files=$2")
                shift 2
            else
                print_color "$RED" "❌ --batch requires a number"
                exit 1
            fi
            ;;
        *)
            ARGS+=("$1")
            shift
            ;;
    esac
done

# Handle special modes
if [[ "$SHOW_HELP" == true ]]; then
    print_usage
    exit 0
fi

# Change to project root
cd "$PROJECT_ROOT"

# Show header
print_color "$BOLD" "🚀 Enhanced Unused Import Cleaner v2.1"
print_color "$CYAN" "========================================="

# Handle metrics display
if [[ "$SHOW_METRICS" == true ]]; then
    print_color "$BLUE" "📊 Displaying safety metrics..."
    exec node "$IMPORT_CLEANER" --show-metrics "${ARGS[@]}"
fi

# Handle validation only
if [[ "$VALIDATE_ONLY" == true ]]; then
    print_color "$BLUE" "🛡️ Validating safety..."
    exec node "$IMPORT_CLEANER" --validate-safety "${ARGS[@]}"
fi

# Handle git check only
if [[ "$CHECK_GIT_ONLY" == true ]]; then
    print_color "$BLUE" "🔍 Checking git status..."
    exec node "$IMPORT_CLEANER" --check-git-status "${ARGS[@]}"
fi

# Run prerequisite checks
if ! check_prerequisites; then
    print_color "$RED" "❌ Prerequisite checks failed. Please fix the issues above and try again."
    exit 1
fi

# Show safety summary unless in silent mode
if [[ ! " ${ARGS[*]} " =~ " --silent " ]] && [[ ! " ${ARGS[*]} " =~ " --json " ]]; then
    show_safety_summary
    echo
fi

# Provide workflow recommendations for first-time users
if [[ ! -f ".import-cleaner-metrics.json" ]] && [[ ! " ${ARGS[*]} " =~ " --silent " ]]; then
    show_workflow_recommendations
    echo
fi

# Confirm if not in dry-run or auto-fix mode
if [[ ! " ${ARGS[*]} " =~ " --dry-run " ]] && [[ ! " ${ARGS[*]} " =~ " --auto-fix " ]] && [[ ! " ${ARGS[*]} " =~ " --silent " ]]; then
    print_color "$YELLOW" "⚠️  This will modify your files. Have you:"
    print_color "$YELLOW" "   • Committed or stashed your current changes?"
    print_color "$YELLOW" "   • Reviewed the dry-run output first?"
    echo
    read -p "$(print_color "$CYAN" "Continue? [y/N] ")" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_color "$BLUE" "👍 Good choice! Run with --dry-run first to preview changes:"
        print_color "$CYAN" "   $0 --dry-run"
        exit 0
    fi
    echo
fi

# Run the import cleaner with error handling
print_color "$BLUE" "🚀 Starting import cleanup..."
if run_with_retry "${ARGS[@]}"; then
    # Success - show next steps
    if [[ ! " ${ARGS[*]} " =~ " --dry-run " ]] && [[ ! " ${ARGS[*]} " =~ " --silent " ]]; then
        echo
        print_color "$GREEN" "🎉 Import cleanup completed!"
        print_color "$CYAN" "📋 Next steps:"
        print_color "$CYAN" "   • Review changes: git diff"
        print_color "$CYAN" "   • Run tests: npm test (or your test command)"
        print_color "$CYAN" "   • Commit changes: git add . && git commit -m 'Remove unused imports'"
        print_color "$CYAN" "   • Or rollback: git stash apply stash^{/unused-imports-fix-*}"
        echo
        print_color "$CYAN" "🔄 To process more files, run the script again"
    fi
    exit 0
else
    exit_code=$?
    if [[ ! " ${ARGS[*]} " =~ " --silent " ]]; then
        echo
        print_color "$RED" "❌ Import cleanup encountered issues"
        print_color "$CYAN" "🔧 Troubleshooting:"
        print_color "$CYAN" "   • Check the error messages above"
        print_color "$CYAN" "   • Ensure 'make lint' works: make lint"
        print_color "$CYAN" "   • Try with smaller batch size: $0 --batch 3"
        print_color "$CYAN" "   • Check safety metrics: $0 --metrics"
        print_color "$CYAN" "   • See documentation: scripts/typescript-fixes/IMPORT_CLEANER_GUIDE.md"
    fi
    exit $exit_code
fi