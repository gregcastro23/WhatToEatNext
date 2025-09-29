#!/usr/bin/env python3
"""
Sample Data Creation Script
Create sample data for database migration testing
Created: September 26, 2025
"""

import sys
import json
from pathlib import Path
from typing import Dict, List, Any

# Project root
project_root = Path(__file__).parent.parent.parent

def create_sample_ingredients() -> List[Dict[str, Any]]:
    """Create sample ingredient data."""
    return [
        {
            "name": "Garlic",
            "common_name": "Garlic",
            "scientific_name": "Allium sativum",
            "category": "vegetables",
            "subcategory": "allium",
            "description": "Aromatic bulb used in cooking worldwide",
            "calories": 149,
            "protein": 6.4,
            "carbohydrates": 33.1,
            "fat": 0.5,
            "fiber": 2.1,
            "sugar": 1.0,
            "flavor_profile": {
                "pungent": 0.9,
                "savory": 0.8,
                "bitter": 0.2
            },
            "preparation_methods": ["minced", "crushed", "roasted", "fried"],
            "is_active": True,
            "confidence_score": 0.95,
            "elemental_properties": {
                "fire": 0.7,
                "water": 0.1,
                "earth": 0.1,
                "air": 0.1
            },
            "astrological_profile": {
                "ruling_planets": ["Mars"],
                "favorable_zodiac": ["aries", "scorpio"],
                "elemental_affinity": {
                    "base": "Fire"
                }
            },
            "season": ["all"],
            "cuisine_affinities": ["Italian", "Chinese", "Indian", "French"]
        },
        {
            "name": "Lemon",
            "common_name": "Lemon",
            "scientific_name": "Citrus limon",
            "category": "fruits",
            "subcategory": "citrus",
            "description": "Citrus fruit known for its sour taste and cleansing properties",
            "calories": 29,
            "protein": 1.1,
            "carbohydrates": 9.3,
            "fat": 0.3,
            "fiber": 2.8,
            "sugar": 2.5,
            "flavor_profile": {
                "sour": 0.95,
                "citrus": 0.9,
                "fresh": 0.8
            },
            "preparation_methods": ["juiced", "zested", "sliced", "preserved"],
            "is_active": True,
            "confidence_score": 0.92,
            "elemental_properties": {
                "fire": 0.2,
                "water": 0.4,
                "earth": 0.1,
                "air": 0.3
            },
            "astrological_profile": {
                "ruling_planets": ["Moon"],
                "favorable_zodiac": ["cancer"],
                "elemental_affinity": {
                    "base": "Water"
                }
            },
            "season": ["winter", "spring"],
            "cuisine_affinities": ["Mediterranean", "Middle Eastern", "American"]
        },
        {
            "name": "Chicken Breast",
            "common_name": "Chicken Breast",
            "scientific_name": "Gallus gallus domesticus",
            "category": "proteins",
            "subcategory": "poultry",
            "description": "Lean poultry meat, versatile protein source",
            "calories": 165,
            "protein": 31.0,
            "carbohydrates": 0.0,
            "fat": 3.6,
            "fiber": 0.0,
            "sugar": 0.0,
            "flavor_profile": {
                "savory": 0.7,
                "mild": 0.8,
                "meaty": 0.9
            },
            "preparation_methods": ["grilled", "baked", "pan-fried", "poached"],
            "is_active": True,
            "confidence_score": 0.88,
            "elemental_properties": {
                "fire": 0.3,
                "water": 0.3,
                "earth": 0.3,
                "air": 0.1
            },
            "astrological_profile": {
                "ruling_planets": ["Venus"],
                "favorable_zodiac": ["taurus", "libra"],
                "elemental_affinity": {
                    "base": "Earth"
                }
            },
            "season": ["all"],
            "cuisine_affinities": ["American", "Italian", "Chinese", "Mexican"]
        }
    ]

def create_sample_recipes() -> List[Dict[str, Any]]:
    """Create sample recipe data."""
    return [
        {
            "name": "Lemon Garlic Chicken",
            "description": "Simple and flavorful chicken dish with lemon and garlic",
            "cuisine": "Mediterranean",
            "category": "main",
            "instructions": {
                "steps": [
                    "Marinate chicken in lemon juice, garlic, and olive oil",
                    "Season with salt and pepper",
                    "Grill or bake until cooked through",
                    "Serve with fresh herbs"
                ]
            },
            "prep_time_minutes": 15,
            "cook_time_minutes": 25,
            "servings": 4,
            "difficulty_level": 2,
            "dietary_tags": ["Gluten Free"],
            "allergens": [],
            "is_public": True,
            "is_verified": True,
            "ingredients": [
                {"name": "Chicken Breast", "amount": 4, "unit": "pieces"},
                {"name": "Lemon", "amount": 2, "unit": "whole"},
                {"name": "Garlic", "amount": 4, "unit": "cloves"}
            ],
            "lunar": ["Full Moon", "Waxing Gibbous"],
            "seasonal": ["Spring", "Summer"],
            "time_of_day": ["dinner"],
            "occasion": ["everyday", "celebration"],
            "energy_intention": "balancing"
        },
        {
            "name": "Garlic Roasted Vegetables",
            "description": "Healthy roasted vegetables with garlic",
            "cuisine": "Mediterranean",
            "category": "side",
            "instructions": {
                "steps": [
                    "Preheat oven to 400°F",
                    "Chop vegetables and toss with olive oil and minced garlic",
                    "Season with salt and herbs",
                    "Roast for 25-30 minutes until tender"
                ]
            },
            "prep_time_minutes": 10,
            "cook_time_minutes": 30,
            "servings": 4,
            "difficulty_level": 1,
            "dietary_tags": ["Vegan", "Gluten Free"],
            "allergens": [],
            "is_public": True,
            "is_verified": True,
            "ingredients": [
                {"name": "Garlic", "amount": 6, "unit": "cloves"}
            ],
            "lunar": ["New Moon", "Waning Crescent"],
            "seasonal": ["Autumn", "Winter"],
            "time_of_day": ["dinner"],
            "occasion": ["everyday"],
            "energy_intention": "grounding"
        }
    ]

def create_sample_elemental_properties() -> List[Dict[str, Any]]:
    """Create sample elemental properties data."""
    return [
        {
            "entity_type": "ingredient",
            "entity_name": "Garlic",
            "fire": 0.7,
            "water": 0.1,
            "earth": 0.1,
            "air": 0.1,
            "calculation_method": "traditional",
            "confidence_score": 0.95
        },
        {
            "entity_type": "ingredient",
            "entity_name": "Lemon",
            "fire": 0.2,
            "water": 0.4,
            "earth": 0.1,
            "air": 0.3,
            "calculation_method": "traditional",
            "confidence_score": 0.92
        },
        {
            "entity_type": "recipe",
            "entity_name": "Lemon Garlic Chicken",
            "fire": 0.4,
            "water": 0.3,
            "earth": 0.2,
            "air": 0.1,
            "calculation_method": "calculated",
            "confidence_score": 0.85
        }
    ]

def main():
    """Create and save sample data files."""
    print("Creating sample data for migration testing...")

    # Create output directory
    output_dir = project_root / "backend" / "data" / "sample"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Create sample data
    ingredients = create_sample_ingredients()
    recipes = create_sample_recipes()
    elemental = create_sample_elemental_properties()

    # Save to JSON files
    with open(output_dir / "ingredients.json", 'w') as f:
        json.dump(ingredients, f, indent=2)

    with open(output_dir / "recipes.json", 'w') as f:
        json.dump(recipes, f, indent=2)

    with open(output_dir / "elemental_properties.json", 'w') as f:
        json.dump(elemental, f, indent=2)

    print(f"Sample data created in {output_dir}")
    print(f"- Ingredients: {len(ingredients)} items")
    print(f"- Recipes: {len(recipes)} items")
    print(f"- Elemental Properties: {len(elemental)} items")

if __name__ == "__main__":
    main()
