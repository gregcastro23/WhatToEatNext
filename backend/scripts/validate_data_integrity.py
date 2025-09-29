#!/usr/bin/env python3
"""
Data Integrity Validation Script
Phase 4: Validate migrated data integrity and consistency
"""

import sys
import json
from pathlib import Path
from typing import Dict, List, Any, Tuple

# Project paths
backend_dir = Path(__file__).parent.parent
project_root = backend_dir.parent

class DataValidator:
    """Comprehensive data integrity validator."""

    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.stats: Dict[str, Any] = {}

    def log_error(self, message: str):
        """Log an error."""
        self.errors.append(message)
        print(f"❌ ERROR: {message}")

    def log_warning(self, message: str):
        """Log a warning."""
        self.warnings.append(message)
        print(f"⚠️  WARNING: {message}")

    def log_success(self, message: str):
        """Log a success."""
        print(f"✅ {message}")

    def validate_ingredients(self) -> bool:
        """Validate ingredient data integrity."""
        print("\n🔍 Validating Ingredients...")

        success = True

        # Check ingredient counts
        ingredient_count = self.query_count("SELECT COUNT(*) FROM ingredients;")
        self.stats['ingredients'] = ingredient_count

        if ingredient_count == 0:
            self.log_error("No ingredients found in database")
            return False

        self.log_success(f"Found {ingredient_count} ingredients")

        # Validate required fields
        missing_names = self.query_count("SELECT COUNT(*) FROM ingredients WHERE name IS NULL OR name = '';")
        if missing_names > 0:
            self.log_error(f"{missing_names} ingredients missing names")
            success = False

        # Validate category distribution
        category_counts = self.query_all("SELECT category, COUNT(*) FROM ingredients GROUP BY category ORDER BY category;")
        print(f"   Debug - category_counts: {category_counts}")
        self.stats['ingredient_categories'] = {row[0]: int(row[1]) for row in category_counts if len(row) >= 2}
        print(f"   Category distribution: {self.stats['ingredient_categories']}")

        # Validate elemental properties relationships
        orphaned_elements = self.query_count("""
            SELECT COUNT(*) FROM elemental_properties ep
            LEFT JOIN ingredients i ON ep.entity_id = i.id AND ep.entity_type = 'ingredient'
            WHERE i.id IS NULL AND ep.entity_type = 'ingredient';
        """)

        if orphaned_elements > 0:
            self.log_error(f"{orphaned_elements} elemental properties reference non-existent ingredients")
            success = False

        # Validate that all ingredients have elemental properties
        ingredients_without_elements = self.query_count("""
            SELECT COUNT(*) FROM ingredients i
            LEFT JOIN elemental_properties ep ON i.id = ep.entity_id AND ep.entity_type = 'ingredient'
            WHERE ep.id IS NULL;
        """)

        if ingredients_without_elements > 0:
            self.log_warning(f"{ingredients_without_elements} ingredients missing elemental properties")

        return success

    def validate_recipes(self) -> bool:
        """Validate recipe data integrity."""
        print("\n🔍 Validating Recipes...")

        success = True

        # Check recipe counts
        recipe_count = self.query_count("SELECT COUNT(*) FROM recipes;")
        self.stats['recipes'] = recipe_count

        if recipe_count == 0:
            self.log_error("No recipes found in database")
            return False

        self.log_success(f"Found {recipe_count} recipes")

        # Validate required fields
        missing_names = self.query_count("SELECT COUNT(*) FROM recipes WHERE name IS NULL OR name = '';")
        if missing_names > 0:
            self.log_error(f"{missing_names} recipes missing names")
            success = False

        # Validate cuisine distribution
        cuisine_counts = self.query_all("SELECT cuisine, COUNT(*) FROM recipes GROUP BY cuisine ORDER BY cuisine;")
        self.stats['recipe_cuisines'] = {row[0]: int(row[1]) for row in cuisine_counts}
        print(f"   Cuisine distribution: {self.stats['recipe_cuisines']}")

        # Validate recipe ingredients relationships
        orphaned_recipe_ingredients = self.query_count("""
            SELECT COUNT(*) FROM recipe_ingredients ri
            LEFT JOIN recipes r ON ri.recipe_id = r.id
            WHERE r.id IS NULL;
        """)

        if orphaned_recipe_ingredients > 0:
            self.log_error(f"{orphaned_recipe_ingredients} recipe ingredients reference non-existent recipes")
            success = False

        orphaned_ingredient_refs = self.query_count("""
            SELECT COUNT(*) FROM recipe_ingredients ri
            LEFT JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE i.id IS NULL;
        """)

        if orphaned_ingredient_refs > 0:
            self.log_error(f"{orphaned_ingredient_refs} recipe ingredients reference non-existent ingredients")
            success = False

        return success

    def validate_zodiac_affinities(self) -> bool:
        """Validate zodiac affinity data integrity."""
        print("\n🔍 Validating Zodiac Affinities...")

        success = True

        zodiac_count = self.query_count("SELECT COUNT(*) FROM zodiac_affinities;")
        self.stats['zodiac_affinities'] = zodiac_count
        self.log_success(f"Found {zodiac_count} zodiac affinities")

        # Validate entity references
        orphaned_zodiac = self.query_count("""
            SELECT COUNT(*) FROM zodiac_affinities za
            WHERE NOT EXISTS (
                SELECT 1 FROM ingredients i WHERE za.entity_id = i.id AND za.entity_type = 'ingredient'
                UNION ALL
                SELECT 1 FROM recipes r WHERE za.entity_id = r.id AND za.entity_type = 'recipe'
            );
        """)

        if orphaned_zodiac > 0:
            self.log_error(f"{orphaned_zodiac} zodiac affinities reference non-existent entities")
            success = False

        # Validate affinity strength range
        invalid_strengths = self.query_count("""
            SELECT COUNT(*) FROM zodiac_affinities
            WHERE affinity_strength < 0 OR affinity_strength > 1;
        """)

        if invalid_strengths > 0:
            self.log_error(f"{invalid_strengths} zodiac affinities have invalid strength values")
            success = False

        # Check zodiac sign distribution
        zodiac_dist = self.query_all("SELECT zodiac_sign, COUNT(*) FROM zodiac_affinities GROUP BY zodiac_sign ORDER BY zodiac_sign;")
        zodiac_dict = {row[0]: int(row[1]) for row in zodiac_dist}
        print(f"   Zodiac distribution: {zodiac_dict}")

        return success

    def validate_seasonal_associations(self) -> bool:
        """Validate seasonal association data integrity."""
        print("\n🔍 Validating Seasonal Associations...")

        success = True

        seasonal_count = self.query_count("SELECT COUNT(*) FROM seasonal_associations;")
        self.stats['seasonal_associations'] = seasonal_count
        self.log_success(f"Found {seasonal_count} seasonal associations")

        # Validate entity references
        orphaned_seasonal = self.query_count("""
            SELECT COUNT(*) FROM seasonal_associations sa
            WHERE NOT EXISTS (
                SELECT 1 FROM ingredients i WHERE sa.entity_id = i.id AND sa.entity_type = 'ingredient'
                UNION ALL
                SELECT 1 FROM recipes r WHERE sa.entity_id = r.id AND sa.entity_type = 'recipe'
            );
        """)

        if orphaned_seasonal > 0:
            self.log_error(f"{orphaned_seasonal} seasonal associations reference non-existent entities")
            success = False

        # Validate strength range
        invalid_strengths = self.query_count("""
            SELECT COUNT(*) FROM seasonal_associations
            WHERE strength < 0 OR strength > 1;
        """)

        if invalid_strengths > 0:
            self.log_error(f"{invalid_strengths} seasonal associations have invalid strength values")
            success = False

        # Check seasonal distribution
        seasonal_dist = self.query_all("SELECT season, COUNT(*) FROM seasonal_associations GROUP BY season ORDER BY season;")
        seasonal_dict = {row[0]: int(row[1]) for row in seasonal_dist}
        print(f"   Seasonal distribution: {seasonal_dict}")

        return success

    def validate_cross_references(self) -> bool:
        """Validate cross-references between tables."""
        print("\n🔍 Validating Cross-References...")

        success = True

        # Check that all ingredients in recipes exist
        missing_ingredients = self.query_all("""
            SELECT DISTINCT ri.ingredient_id
            FROM recipe_ingredients ri
            LEFT JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE i.id IS NULL;
        """)

        if missing_ingredients:
            self.log_error(f"Found {len(missing_ingredients)} recipe ingredients referencing non-existent ingredients")
            success = False

        # Check calculation cache integrity
        cache_count = self.query_count("SELECT COUNT(*) FROM calculation_cache;")
        self.stats['calculation_cache'] = cache_count
        print(f"   Calculation cache entries: {cache_count}")

        # Check system metrics
        metrics_count = self.query_count("SELECT COUNT(*) FROM system_metrics;")
        self.stats['system_metrics'] = metrics_count
        print(f"   System metrics entries: {metrics_count}")

        return success

    def generate_report(self) -> Dict[str, Any]:
        """Generate validation report."""
        return {
            'timestamp': '2025-09-26T15:20:00Z',
            'phase': 'Phase 4 - Data Validation',
            'stats': self.stats,
            'errors': self.errors,
            'warnings': self.warnings,
            'total_errors': len(self.errors),
            'total_warnings': len(self.warnings),
            'validation_passed': len(self.errors) == 0
        }

    def query_count(self, sql: str) -> int:
        """Execute a count query."""
        result = self.execute_query(sql)
        if result and len(result) > 0 and len(result[0]) > 0:
            try:
                return int(result[0][0])
            except (ValueError, TypeError):
                return 0
        return 0

    def query_all(self, sql: str) -> List[Tuple]:
        """Execute a query and return all results."""
        return self.execute_query(sql)

    def execute_query(self, sql: str) -> List[Tuple]:
        """Execute SQL query in container."""
        import subprocess

        # Use default psql output format (with -t for tuples-only)
        cmd = f"cd {backend_dir} && docker-compose exec -T postgres psql -U user -d alchm_kitchen -t -c \"{sql}\""
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Query failed: {result.stderr}")
            return []

        # Parse the output (pipe-separated by default)
        lines = result.stdout.strip().split('\n')
        data = []
        for line in lines:
            if line.strip():
                parts = [part.strip() for part in line.split('|')]
                data.append(tuple(parts))

        return data

def main():
    """Main validation function."""
    print("🛡️  Phase 4: Data Integrity Validation")
    print("=" * 50)

    validator = DataValidator()

    # Run all validations
    validations = [
        ("Ingredients", validator.validate_ingredients),
        ("Recipes", validator.validate_recipes),
        ("Zodiac Affinities", validator.validate_zodiac_affinities),
        ("Seasonal Associations", validator.validate_seasonal_associations),
        ("Cross-References", validator.validate_cross_references),
    ]

    passed = 0
    total = len(validations)

    for name, validate_func in validations:
        try:
            if validate_func():
                passed += 1
            else:
                print(f"❌ {name} validation failed")
        except Exception as e:
            validator.log_error(f"{name} validation crashed: {e}")

    print("\n" + "=" * 50)

    # Generate report
    report = validator.generate_report()

    print("📊 Validation Summary:")
    print(f"   Total validations: {total}")
    print(f"   Passed: {passed}")
    print(f"   Failed: {total - passed}")
    print(f"   Errors: {len(validator.errors)}")
    print(f"   Warnings: {len(validator.warnings)}")

    # Save report
    report_file = backend_dir / "data" / "validation_report.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)

    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)

    print(f"\n📄 Detailed report saved to: {report_file}")

    if report['validation_passed']:
        print("🎉 All data integrity checks passed!")
        return True
    else:
        print("⚠️  Data integrity issues found - review errors above")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
