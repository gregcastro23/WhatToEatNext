#!/bin/bash

# Phase 9 Component Import Path Migration Script
# Fixes deprecated import paths to use new consolidated utils structure

set -e  # Exit on any error

echo "🔧 Phase 9 Component Import Path Migration"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Must be run from project root directory"
    exit 1
fi

# Backup function
create_backup() {
    local backup_dir="backup-$(date +%Y%m%d-%H%M%S)"
    print_status "Creating backup in $backup_dir..."
    
    mkdir -p "$backup_dir"
    cp -r src/components "$backup_dir/"
    cp -r src/contexts "$backup_dir/"
    
    print_success "Backup created in $backup_dir"
}

# Function to check if file exists and contains the pattern
check_and_fix_imports() {
    local file="$1"
    local old_pattern="$2"
    local new_pattern="$3"
    local description="$4"
    
    if [ -f "$file" ]; then
        if grep -q "$old_pattern" "$file"; then
            print_status "Fixing $description in $file"
            sed -i.bak "s|$old_pattern|$new_pattern|g" "$file"
            rm "$file.bak"  # Remove backup file created by sed
            print_success "Updated $file"
        fi
    fi
}

# Main migration function
migrate_imports() {
    print_status "Starting import path migration..."
    
    # 1. Fix astrologyUtils imports in components
    print_status "Fixing astrologyUtils imports in components..."
    find src/components -name "*.tsx" -type f | while read -r file; do
        check_and_fix_imports "$file" "@/utils/astrologyUtils" "@/utils/astrology/core" "astrologyUtils import"
    done
    
    # 2. Fix astrologyUtils imports in contexts  
    print_status "Fixing astrologyUtils imports in contexts..."
    find src/contexts -name "*.tsx" -type f | while read -r file; do
        check_and_fix_imports "$file" "@/utils/astrologyUtils" "@/utils/astrology/core" "astrologyUtils import"
    done
    
    # 3. Fix any accurateAstronomy imports
    print_status "Checking for accurateAstronomy imports..."
    find src/components -name "*.tsx" -type f | while read -r file; do
        check_and_fix_imports "$file" "@/utils/accurateAstronomy" "@/utils/astrology/positions" "accurateAstronomy import"
    done
    
    # 4. Fix any safeAstrology imports
    print_status "Checking for safeAstrology imports..."
    find src/components -name "*.tsx" -type f | while read -r file; do
        check_and_fix_imports "$file" "@/utils/safeAstrology" "@/utils/astrology/validation" "safeAstrology import"
    done
    
    # 5. Fix any elementalUtils imports
    print_status "Checking for elementalUtils imports..."
    find src/components -name "*.tsx" -type f | while read -r file; do
        check_and_fix_imports "$file" "@/utils/elementalUtils" "@/utils/elemental/core" "elementalUtils import"
    done
    
    # 6. Fix any elementalTransformationUtils imports
    print_status "Checking for elementalTransformationUtils imports..."
    find src/components -name "*.tsx" -type f | while read -r file; do
        check_and_fix_imports "$file" "@/utils/elementalTransformationUtils" "@/utils/elemental/transformations" "elementalTransformationUtils import"
    done
    
    print_success "Import path migration completed!"
}

# Function to verify build integrity
verify_build() {
    print_status "Verifying build integrity..."
    
    if yarn build; then
        print_success "Build successful! All imports are working correctly."
        return 0
    else
        print_error "Build failed! There may be import issues."
        return 1
    fi
}

# Function to show summary of changes
show_summary() {
    print_status "Migration Summary:"
    echo "=================="
    
    # Count files that were potentially affected
    local component_files=$(find src/components -name "*.tsx" -type f | wc -l)
    local context_files=$(find src/contexts -name "*.tsx" -type f | wc -l)
    
    echo "📁 Component files checked: $component_files"
    echo "📁 Context files checked: $context_files"
    echo ""
    echo "🔄 Import path migrations applied:"
    echo "   • @/utils/astrologyUtils → @/utils/astrology/core"
    echo "   • @/utils/accurateAstronomy → @/utils/astrology/positions"
    echo "   • @/utils/safeAstrology → @/utils/astrology/validation"
    echo "   • @/utils/elementalUtils → @/utils/elemental/core"
    echo "   • @/utils/elementalTransformationUtils → @/utils/elemental/transformations"
    echo ""
}

# Main execution
main() {
    echo ""
    print_status "Starting Phase 9 Component Import Migration..."
    echo ""
    
    # Create backup
    create_backup
    echo ""
    
    # Migrate imports
    migrate_imports
    echo ""
    
    # Verify build
    if verify_build; then
        echo ""
        show_summary
        echo ""
        print_success "🎉 Phase 9 Component Import Migration completed successfully!"
        print_status "All deprecated import paths have been updated to use the new consolidated utils structure."
        print_status "Build integrity maintained with 0 errors."
    else
        echo ""
        print_error "❌ Migration completed but build verification failed."
        print_warning "Please check the build output for specific import issues."
        print_status "Backup is available for rollback if needed."
        exit 1
    fi
}

# Run the migration
main 