#!/usr/bin/env python3
"""
Data Migration Script - Phase 2 Migration
Migrate existing TypeScript/JSON data to PostgreSQL database
Created: September 26, 2025
"""

import sys
import os
import json
import uuid
import time
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, field
from datetime import datetime

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from database import get_db_session, config
from sqlalchemy import text
from database.models import (
    Ingredient, Recipe, ElementalProperties, PlanetaryInfluence,
    ZodiacAffinity, SeasonalAssociation, RecipeIngredient,
    RecipeContext
)

project_root = backend_dir.parent


@dataclass
class MigrationStats:
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
        rate = (self.successful / self.duration) if self.duration > 0 else 0
        return f"""
Migration Summary:
- Total Processed: {self.total_processed}
- Successful: {self.successful}
- Failed: {self.failed}
- Skipped: {self.skipped}
- Duration: {self.duration:.2f}s
- Throughput: {rate:.1f} records/sec
- Success Rate: {(self.successful / self.total_processed * 100) if self.total_processed > 0 else 0:.1f}%
"""


class DataMigrationError(Exception):
    pass


def normalize_seasons(seasons_list):
    if not seasons_list:
        return []
    res = []
    mapping = {
        'spring': 'Spring',
        'summer': 'Summer',
        'autumn': 'Autumn',
        'winter': 'Winter'
    }
    for s in seasons_list:
        if not s:
            continue
        s_lower = str(s).lower().strip()
        if s_lower == 'all':
            return ['Spring', 'Summer', 'Autumn', 'Winter']
        mapped = mapping.get(s_lower)
        if mapped:
            res.append(mapped)
        else:
            res.append(str(s).title())
    return list(set(res))


def normalize_moon_phases(phases_list):
    if not phases_list:
        return []
    res = []
    mapping = {
        'new moon': 'New Moon',
        'waxing crescent': 'Waxing Crescent',
        'first quarter': 'First Quarter',
        'waxing gibbous': 'Waxing Gibbous',
        'full moon': 'Full Moon',
        'waning gibbous': 'Waning Gibbous',
        'last quarter': 'Last Quarter',
        'waning crescent': 'Waning Crescent',
        'third quarter': 'Last Quarter'
    }
    for p in phases_list:
        if not p:
            continue
        p_lower = str(p).lower().strip()
        mapped = mapping.get(p_lower)
        if mapped:
            res.append(mapped)
        else:
            res.append(str(p).title())
    return list(set(res))


class DataMigrator:
    INGREDIENT_BATCH = 500
    RECIPE_BATCH = 200

    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.stats = MigrationStats()
        self.errors: List[str] = []

    def log(self, message: str, level: str = "INFO") -> None:
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def load_json_data(self, file_path: str) -> Any:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            raise DataMigrationError(f"Failed to load {file_path}: {e}")

    # ------------------------------------------------------------------ #
    #  Ingredients                                                         #
    # ------------------------------------------------------------------ #

    def migrate_ingredients(self) -> None:
        self.log("Starting ingredient migration...")
        sample_data_path = backend_dir / "alchm_kitchen" / "data" / "json" / "ingredients.json"

        if not sample_data_path.exists():
            self.log("Sample ingredient data not found. Run create_sample_data.py first.", "ERROR")
            return

        try:
            ingredients_data = self.load_json_data(str(sample_data_path))
            items = list(ingredients_data.values()) if isinstance(ingredients_data, dict) else list(ingredients_data)

            with get_db_session() as session:
                # Pre-fetch all existing names in one query to avoid per-row checks
                existing_names: Set[str] = {
                    row[0] for row in session.execute(
                        "SELECT name FROM ingredients"
                    ).fetchall()
                }
                self.log(f"Found {len(existing_names)} existing ingredients — will skip duplicates.")

                ingredient_rows: List[Dict] = []
                elemental_rows: List[Dict] = []
                planetary_rows: List[Dict] = []

                for item in items:
                    name = item.get('name')
                    if not name:
                        continue

                    self.stats.total_processed += 1

                    if name in existing_names:
                        self.stats.skipped += 1
                        continue

                    ing_id = str(uuid.uuid4())

                    ingredient_rows.append({
                        'id': ing_id,
                        'name': name,
                        'common_name': item.get('common_name'),
                        'scientific_name': item.get('scientific_name'),
                        'category': item.get('category', 'unknown'),
                        'subcategory': item.get('subcategory'),
                        'description': item.get('description'),
                        'calories': item.get('calories'),
                        'protein': item.get('protein'),
                        'carbohydrates': item.get('carbohydrates'),
                        'fat': item.get('fat'),
                        'fiber': item.get('fiber'),
                        'sugar': item.get('sugar'),
                        'flavor_profile': json.dumps(item.get('flavor_profile', {})),
                        'preparation_methods': json.dumps(item.get('preparation_methods', [])),
                        'is_active': item.get('is_active', True),
                        'confidence_score': item.get('confidence_score', 0.8),
                    })

                    ep = item.get('elemental_properties', {})
                    if ep:
                        elemental_rows.append({
                            'id': str(uuid.uuid4()),
                            'entity_type': 'ingredient',
                            'entity_id': ing_id,
                            'fire': ep.get('fire', 0.25),
                            'water': ep.get('water', 0.25),
                            'earth': ep.get('earth', 0.25),
                            'air': ep.get('air', 0.25),
                            'calculation_method': 'imported',
                        })

                    ap = item.get('astrological_profile', {})
                    for planet in ap.get('rulingPlanets', []):
                        planetary_rows.append({
                            'id': str(uuid.uuid4()),
                            'entity_type': 'ingredient',
                            'entity_id': ing_id,
                            'planet': planet,
                            'influence_strength': 0.8,
                            'is_primary': (ap['rulingPlanets'].index(planet) == 0),
                        })

                    self.stats.successful += 1

                if not self.dry_run:
                    self._bulk_insert(session, Ingredient, ingredient_rows, self.INGREDIENT_BATCH)
                    self._bulk_insert(session, ElementalProperties, elemental_rows, self.INGREDIENT_BATCH)
                    self._bulk_insert(session, PlanetaryInfluence, planetary_rows, self.INGREDIENT_BATCH)
                    session.commit()
                    self.log(f"Inserted {len(ingredient_rows)} ingredients, "
                             f"{len(elemental_rows)} elemental, "
                             f"{len(planetary_rows)} planetary rows.")

        except Exception as e:
            self.errors.append(f"Failed to migrate ingredients: {e}")
            self.stats.failed += 1

    # ------------------------------------------------------------------ #
    #  Recipes                                                             #
    # ------------------------------------------------------------------ #

    CUISINE_MAP = {
        'african': 'African', 'american': 'American', 'chinese': 'Chinese',
        'french': 'French', 'greek': 'Greek', 'indian': 'Indian',
        'italian': 'Italian', 'japanese': 'Japanese', 'korean': 'Korean',
        'mexican': 'Mexican', 'middle-eastern': 'Middle Eastern',
        'middle eastern': 'Middle Eastern', 'russian': 'Russian',
        'thai': 'Thai', 'vietnamese': 'Vietnamese',
    }

    DIETARY_MAP = {
        'vegetarian': 'Vegetarian', 'vegan': 'Vegan',
        'glutenfree': 'Gluten Free', 'dairyfree': 'Dairy Free',
        'dairy-free': 'Dairy Free', 'gluten-free': 'Gluten Free',
        'lowcarb': 'Low Carb', 'low-carb': 'Low Carb',
        'paleo': 'Paleo', 'keto': 'Keto', 'halal': 'Halal', 'kosher': 'Kosher',
    }

    def migrate_recipes(self) -> None:
        self.log("Starting recipe migration...")
        sample_data_path = backend_dir / "alchm_kitchen" / "data" / "json" / "recipes.json"

        if not sample_data_path.exists():
            self.log("Sample recipe data not found. Run create_sample_data.py first.", "ERROR")
            return

        try:
            recipes_data = self.load_json_data(str(sample_data_path))
            items = list(recipes_data.values()) if isinstance(recipes_data, dict) else list(recipes_data)

            with get_db_session() as session:
                # Pre-fetch all existing recipe names in one query
                existing_names: Set[str] = {
                    row[0] for row in session.execute(
                        text("SELECT name FROM recipes")
                    ).fetchall()
                }
                self.log(f"Found {len(existing_names)} existing recipes — will skip duplicates.")

                # Also pre-fetch all ingredient name→id mappings for FK lookups
                ingredient_id_map: Dict[str, str] = {
                    row[0].lower(): str(row[1])
                    for row in session.execute(
                        text("SELECT name, id FROM ingredients")
                    ).fetchall()
                }

                recipe_rows: List[Dict] = []
                recipe_ingredient_rows: List[Dict] = []
                recipe_context_rows: List[Dict] = []

                for data in items:
                    name = data.get('name')
                    if not name:
                        continue

                    self.stats.total_processed += 1

                    if name in existing_names:
                        self.stats.skipped += 1
                        continue

                    recipe_id = str(uuid.uuid4())

                    cuisine_raw = data.get('cuisine', 'General')
                    cuisine = self.CUISINE_MAP.get(cuisine_raw.lower(), cuisine_raw.title())

                    dietary_tags = [
                        self.DIETARY_MAP.get(t.lower(), t.title())
                        for t in data.get('dietary_tags', [])
                    ]

                    # Resolve moon phases and seasons with fallback mappings
                    raw_lunar = data.get('lunar', []) or data.get('astrologicalAffinities', {}).get('lunarPhases', [])
                    raw_seasons = data.get('seasonal', []) or data.get('season', [])

                    # Denormalized read_model built up-front (no flush needed)
                    read_model = {
                        "id": recipe_id,
                        "name": name,
                        "description": data.get('description'),
                        "cuisine": cuisine,
                        "category": data.get('category', 'main'),
                        "instructions": data.get('instructions', {}),
                        "prep_time_minutes": data.get('prep_time_minutes', 30),
                        "cook_time_minutes": data.get('cook_time_minutes', 30),
                        "servings": data.get('servings', 4),
                        "dietary_tags": dietary_tags,
                        "allergens": data.get('allergens', []),
                        "nutritional_profile": data.get('nutritional_profile'),
                        "ingredients": [
                            {
                                "name": ing.get("name"),
                                "amount": ing.get("amount", ing.get("quantity")),
                                "unit": ing.get("unit"),
                                "notes": ing.get("notes", ing.get("preparation")),
                                "optional": ing.get("optional", False),
                            }
                            for ing in data.get("ingredients", [])
                        ],
                        "contexts": [
                            {
                                "lunar": raw_lunar,
                                "seasonal": raw_seasons,
                                "timeOfDay": data.get('timeOfDay', []),
                            }
                        ] if (any(k in data for k in ('lunar', 'seasonal', 'season', 'timeOfDay')) or raw_lunar or raw_seasons) else [],
                    }

                    recipe_rows.append({
                        'id': recipe_id,
                        'name': name,
                        'description': data.get('description'),
                        'cuisine': cuisine,
                        'category': data.get('category', 'main'),
                        'instructions': json.dumps(data.get('instructions', {})),
                        'prep_time_minutes': data.get('prep_time_minutes', 30),
                        'cook_time_minutes': data.get('cook_time_minutes', 30),
                        'servings': data.get('servings', 4),
                        'difficulty_level': data.get('difficulty_level', 2),
                        'dietary_tags': dietary_tags,
                        'allergens': data.get('allergens', []),
                        'is_public': data.get('is_public', True),
                        'is_verified': data.get('is_verified', False),
                        'read_model': json.dumps(read_model),
                    })

                    # Recipe ingredients — resolve FK via pre-loaded map
                    for i, ing in enumerate(data.get('ingredients', [])):
                        ing_name = ing.get('name', '').lower()
                        ing_id = ingredient_id_map.get(ing_name)
                        if not ing_id:
                            continue
                        recipe_ingredient_rows.append({
                            'id': str(uuid.uuid4()),
                            'recipe_id': recipe_id,
                            'ingredient_id': ing_id,
                            'quantity': ing.get('amount', 1),
                            'unit': ing.get('unit', 'piece'),
                            'preparation_notes': ing.get('preparation'),
                            'is_optional': ing.get('optional', False),
                            'order_index': i,
                        })

                    # Recipe context
                    if any(k in data for k in ('lunar', 'seasonal', 'season', 'timeOfDay', 'occasion', 'energyIntention')) or raw_lunar or raw_seasons:
                        recipe_context_rows.append({
                            'id': str(uuid.uuid4()),
                            'recipe_id': recipe_id,
                            'recommended_moon_phases': normalize_moon_phases(raw_lunar),
                            'recommended_seasons': normalize_seasons(raw_seasons),
                            'time_of_day': data.get('timeOfDay', []),
                            'occasion': data.get('occasion', []),
                            'energy_intention': data.get('energyIntention'),
                        })

                    self.stats.successful += 1

                if not self.dry_run:
                    self._bulk_insert(session, Recipe, recipe_rows, self.RECIPE_BATCH)
                    self._bulk_insert(session, RecipeIngredient, recipe_ingredient_rows, self.RECIPE_BATCH)
                    self._bulk_insert(session, RecipeContext, recipe_context_rows, self.RECIPE_BATCH)
                    session.commit()
                    self.log(f"Inserted {len(recipe_rows)} recipes, "
                             f"{len(recipe_ingredient_rows)} recipe-ingredients, "
                             f"{len(recipe_context_rows)} context rows.")

        except Exception as e:
            self.errors.append(f"Failed to migrate recipes: {e}")
            self.stats.failed += 1

    # ------------------------------------------------------------------ #
    #  Shared helpers                                                      #
    # ------------------------------------------------------------------ #

    def _bulk_insert(
        self,
        session,
        model,
        rows: List[Dict],
        batch_size: int,
    ) -> None:
        """Bulk-insert rows in batched transactions using SQLAlchemy bulk_insert_mappings."""
        if not rows:
            return
        for start in range(0, len(rows), batch_size):
            batch = rows[start: start + batch_size]
            session.bulk_insert_mappings(model, batch)
            session.flush()

    def run_migration(self, components: List[str] = None) -> MigrationStats:
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
            self.log("Migration completed!")
            print(self.stats.summary())

            if self.errors:
                self.log("Errors encountered:", "ERROR")
                for error in self.errors[:10]:
                    print(f"  - {error}")
                if len(self.errors) > 10:
                    print(f"  ... and {len(self.errors) - 10} more errors")

            return self.stats

        except Exception as e:
            self.stats.end_time = datetime.now()
            self.log(f"Migration failed with error: {e}", "ERROR")
            raise


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Phase 2 Data Migration")
    parser.add_argument('--dry-run', action='store_true', help='Run in dry-run mode')
    parser.add_argument('--components', nargs='+', choices=['ingredients', 'recipes'],
                        default=['ingredients', 'recipes'], help='Components to migrate')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    args = parser.parse_args()

    if args.verbose:
        print("Verbose mode enabled")

    try:
        migrator = DataMigrator(dry_run=args.dry_run)
        stats = migrator.run_migration(args.components)
        if stats.failed > 0:
            sys.exit(1)
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
