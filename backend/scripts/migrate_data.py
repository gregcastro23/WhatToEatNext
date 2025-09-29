#!/usr/bin/env python3
"""
Data Migration Script - Phase 2 Migration
Migrate existing TypeScript/JSON data to PostgreSQL database
Created: September 26, 2025
"""

import sys
import os
import json
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Import database modules
from database import get_db_session, config
from database.models import (
    Ingredient, Recipe, ElementalProperties, PlanetaryInfluence,
    ZodiacAffinity, SeasonalAssociation, RecipeIngredient,
    RecipeContext
)

# Project root for data access
project_root = backend_dir.parent

@dataclass
class MigrationStats:
    """Track migration statistics."""
    total_processed: int = 0
    successful: int = 0
    failed: int = 0
    skipped: int = 0
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    @property
    def duration(self) -> float:
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return 0.0

    def summary(self) -> str:
        return f"""
Migration Summary:
- Total Processed: {self.total_processed}
- Successful: {self.successful}
- Failed: {self.failed}
- Skipped: {self.skipped}
- Duration: {self.duration:.2f}s
- Success Rate: {(self.successful / self.total_processed * 100):.1f}% if self.total_processed > 0 else 0
"""

class DataMigrationError(Exception):
    """Custom exception for data migration errors."""
    pass

class DataMigrator:
    """Main data migration orchestrator."""

    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.stats = MigrationStats()
        self.errors: List[str] = []

    def log(self, message: str, level: str = "INFO") -> None:
        """Log migration progress."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def load_json_data(self, file_path: str) -> Any:
        """Load JSON data file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            raise DataMigrationError(f"Failed to load {file_path}: {e}")

    def migrate_ingredients(self) -> None:
        """Migrate ingredient data."""
        self.log("Starting ingredient migration...")

        # Use sample data for now
        sample_data_path = backend_dir / "data" / "sample" / "ingredients.json"

        if not sample_data_path.exists():
            self.log("Sample ingredient data not found. Run create_sample_data.py first.", "ERROR")
            return

        try:
            # Load ingredient data
            ingredients_data = self.load_json_data(str(sample_data_path))

            with get_db_session() as session:
                # Process and insert ingredients
                for ingredient_info in ingredients_data:
                    self._migrate_single_ingredient(session, ingredient_info)

        except Exception as e:
            self.errors.append(f"Failed to migrate ingredients: {e}")
            self.stats.failed += 1

    def _migrate_single_ingredient(self, session, data: Dict[str, Any]) -> None:
        """Migrate a single ingredient."""
        try:
            name = data['name']
            self.stats.total_processed += 1

            # Check if ingredient already exists
            existing = session.query(Ingredient).filter(Ingredient.name == name).first()
            if existing:
                self.stats.skipped += 1
                return

            # Create ingredient record
            ingredient = Ingredient(
                name=name,
                common_name=data.get('common_name'),
                scientific_name=data.get('scientific_name'),
                category=data.get('category', 'unknown'),
                subcategory=data.get('subcategory'),
                description=data.get('description'),
                calories=data.get('calories'),
                protein=data.get('protein'),
                carbohydrates=data.get('carbohydrates'),
                fat=data.get('fat'),
                fiber=data.get('fiber'),
                sugar=data.get('sugar'),
                flavor_profile=data.get('flavor_profile', {}),
                preparation_methods=data.get('preparation_methods', []),
                is_active=data.get('is_active', True),
                confidence_score=data.get('confidence_score', 0.8)
            )

            if not self.dry_run:
                session.add(ingredient)
                session.flush()  # Get the ID without committing

            # Migrate elemental properties
            if 'elemental_properties' in data:
                self._migrate_elemental_properties(session, 'ingredient', str(ingredient.id), data['elemental_properties'])

            # Migrate planetary influences
            if 'astrological_profile' in data:
                self._migrate_planetary_influences(session, 'ingredient', str(ingredient.id), data['astrological_profile'])

            if not self.dry_run:
                session.commit()

            self.stats.successful += 1

        except Exception as e:
            self.errors.append(f"Failed to migrate ingredient {data.get('name', 'unknown')}: {e}")
            self.stats.failed += 1
            session.rollback()

    def _migrate_elemental_properties(self, session, entity_type: str, entity_id: str, properties: Dict[str, float]) -> None:
        """Migrate elemental properties for an entity."""
        try:
            elemental = ElementalProperties(
                entity_type=entity_type,
                entity_id=entity_id,
                fire=properties.get('fire', 0.25),
                water=properties.get('water', 0.25),
                earth=properties.get('earth', 0.25),
                air=properties.get('air', 0.25),
                calculation_method='imported'
            )

            if not self.dry_run:
                session.add(elemental)

        except Exception as e:
            self.errors.append(f"Failed to migrate elemental properties for {entity_type}:{entity_id}: {e}")

    def _migrate_planetary_influences(self, session, entity_type: str, entity_id: str, profile: Dict[str, Any]) -> None:
        """Migrate planetary influences."""
        try:
            ruling_planets = profile.get('rulingPlanets', [])
            for planet in ruling_planets:
                influence = PlanetaryInfluence(
                    entity_type=entity_type,
                    entity_id=entity_id,
                    planet=planet,
                    influence_strength=0.8,  # Default high influence
                    is_primary=(planet == ruling_planets[0])
                )
                if not self.dry_run:
                    session.add(influence)

        except Exception as e:
            self.errors.append(f"Failed to migrate planetary influences for {entity_type}:{entity_id}: {e}")

    def migrate_recipes(self) -> None:
        """Migrate recipe data."""
        self.log("Starting recipe migration...")

        # Use sample data for now
        sample_data_path = backend_dir / "data" / "sample" / "recipes.json"

        if not sample_data_path.exists():
            self.log("Sample recipe data not found. Run create_sample_data.py first.", "ERROR")
            return

        try:
            # Load recipe data
            recipes_data = self.load_json_data(str(sample_data_path))

            with get_db_session() as session:
                # Process and insert recipes
                for recipe_data in recipes_data:
                    self._migrate_single_recipe(session, recipe_data)

        except Exception as e:
            self.errors.append(f"Failed to migrate recipes: {e}")
            self.stats.failed += 1

    def _migrate_single_recipe(self, session, data: Dict[str, Any]) -> None:
        """Migrate a single recipe."""
        try:
            name = data['name']
            self.stats.total_processed += 1

            # Check if recipe exists
            existing = session.query(Recipe).filter(Recipe.name == name).first()
            if existing:
                self.stats.skipped += 1
                return

            # Create recipe record
            recipe = Recipe(
                name=name,
                description=data.get('description'),
                cuisine=data.get('cuisine', 'General'),
                category=data.get('category', 'main'),
                instructions=data.get('instructions', {}),
                prep_time_minutes=data.get('prep_time_minutes', 30),
                cook_time_minutes=data.get('cook_time_minutes', 30),
                servings=data.get('servings', 4),
                difficulty_level=data.get('difficulty_level', 2),
                dietary_tags=data.get('dietary_tags', []),
                allergens=data.get('allergens', []),
                is_public=data.get('is_public', True),
                is_verified=data.get('is_verified', False)
            )

            if not self.dry_run:
                session.add(recipe)
                session.flush()  # Get the ID without committing

            # Migrate ingredients
            if 'ingredients' in data:
                self._migrate_recipe_ingredients(session, str(recipe.id), data['ingredients'])

            # Migrate contexts
            if any(key in data for key in ['lunar', 'seasonal', 'time_of_day']):
                self._migrate_recipe_contexts(session, str(recipe.id), data)

            if not self.dry_run:
                session.commit()

            self.stats.successful += 1

        except Exception as e:
            self.errors.append(f"Failed to migrate recipe {data.get('name', 'unknown')}: {e}")
            self.stats.failed += 1
            session.rollback()

    def _migrate_recipe_ingredients(self, session, recipe_id: str, ingredients: List[Dict[str, Any]]) -> None:
        """Migrate recipe ingredients."""
        for i, ingredient_data in enumerate(ingredients):
            try:
                # Find ingredient by name
                ingredient = session.query(Ingredient).filter(
                    Ingredient.name.ilike(ingredient_data.get('name', ''))
                ).first()

                if ingredient:
                    recipe_ingredient = RecipeIngredient(
                        recipe_id=recipe_id,
                        ingredient_id=ingredient.id,
                        quantity=ingredient_data.get('amount', 1),
                        unit=ingredient_data.get('unit', 'piece'),
                        preparation_notes=ingredient_data.get('preparation'),
                        is_optional=ingredient_data.get('optional', False),
                        order_index=i
                    )

                    if not self.dry_run:
                        session.add(recipe_ingredient)

            except Exception as e:
                self.errors.append(f"Failed to migrate ingredient for recipe {recipe_id}: {e}")

    def _migrate_recipe_contexts(self, session, recipe_id: str, data: Dict[str, Any]) -> None:
        """Migrate recipe contexts."""
        try:
            context = RecipeContext(
                recipe_id=recipe_id,
                recommended_moon_phases=data.get('lunar', []),
                recommended_seasons=data.get('seasonal', []) or data.get('season', []),
                time_of_day=data.get('timeOfDay', []),
                occasion=data.get('occasion', []),
                energy_intention=data.get('energyIntention')
            )

            if not self.dry_run:
                session.add(context)

        except Exception as e:
            self.errors.append(f"Failed to migrate contexts for recipe {recipe_id}: {e}")

    def run_migration(self, components: List[str] = None) -> MigrationStats:
        """Run the complete migration."""
        self.stats.start_time = datetime.now()
        self.log(f"Starting Phase 2 Data Migration (dry_run={self.dry_run})")

        if components is None:
            components = ['ingredients', 'recipes']

        try:
            if 'ingredients' in components:
                self.migrate_ingredients()

            if 'recipes' in components:
                self.migrate_recipes()

            self.stats.end_time = datetime.now()

            # Print summary
            self.log("Migration completed!")
            print(self.stats.summary())

            if self.errors:
                self.log("Errors encountered:", "ERROR")
                for error in self.errors[:10]:  # Show first 10 errors
                    print(f"  - {error}")
                if len(self.errors) > 10:
                    print(f"  ... and {len(self.errors) - 10} more errors")

            return self.stats

        except Exception as e:
            self.stats.end_time = datetime.now()
            self.log(f"Migration failed with error: {e}", "ERROR")
            raise


def main():
    """Main migration function."""
    import argparse

    parser = argparse.ArgumentParser(description="Phase 2 Data Migration")
    parser.add_argument('--dry-run', action='store_true', help='Run migration in dry-run mode')
    parser.add_argument('--components', nargs='+', choices=['ingredients', 'recipes'],
                       default=['ingredients', 'recipes'], help='Components to migrate')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')

    args = parser.parse_args()

    # Configure logging
    if args.verbose:
        print("Verbose mode enabled")

    try:
        migrator = DataMigrator(dry_run=args.dry_run)
        stats = migrator.run_migration(args.components)

        # Exit with error code if there were failures
        if stats.failed > 0:
            sys.exit(1)

    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
