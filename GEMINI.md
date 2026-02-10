# WhatToEatNext - Phase 2: Final Integration Audit

This document serves as the source of truth for the WhatToEatNext application's alchemical recommendation engine.

## `weighted_environmental_score` Formula

The `weighted_environmental_score` is calculated for each ingredient in a recipe and then summed up to provide a total score for the recipe. The formula for a single ingredient is:

`weighted_environmental_score = base_score * lunar_modifier * seasonal_modifier`

- **`base_score`**: This is the `affinity_strength` of an ingredient with a zodiac sign present in the user's astrological chart.
- **`lunar_modifier`**: This modifier adjusts the score based on the current lunar phase and the ingredient's category.
- **`seasonal_modifier`**: This modifier adjusts the score based on the current zodiac season and the ingredient's elemental type.

## Lunar Ingredient Categories

The `lunar_modifier` is determined by the `get_lunar_modifier` function in `backend/utils/lunar_engine.py`. The logic is as follows:

- **New Moon**: Boosts "Seeds" and "Sprouts".
- **Waxing Crescent**: Boosts "Leafy Greens".
- **First Quarter**: Boosts "Vegetables".
- **Waxing Gibbous**: Boosts "Fruits".
- **Full Moon**: Boosts "Grains" and "Flowers".
- **Waning Gibbous**: Boosts "Roots".
- **Last Quarter**: Boosts "Fungi".
- **Waning Crescent**: Boosts "Herbs" and "Spices".

## Seasonal Ingredient Categories

The `seasonal_modifier` is determined by the `get_seasonal_modifiers` function in `backend/utils/seasonal_engine.py`. The logic is as follows:

- **Fire Signs (Aries, Leo, Sagittarius)**: Boosts "Thermogenic" ingredients (e.g., chili, pepper, garlic).
- **Earth Signs (Taurus, Virgo, Capricorn)**: Boosts "Rooted" ingredients (e.g., grains, potatoes, squash).
- **Air Signs (Gemini, Libra, Aquarius)**: Boosts "Light/Sprouted" ingredients (e.g., microgreens, sprouts).
- **Water Signs (Cancer, Scorpio, Pisces)**: Boosts "Hydrating" ingredients (e.g., soups, broths, melons).

If an ingredient of a certain elemental type is recommended during a matching zodiac season, its score is boosted by 20% (`* 1.2`). If there is a mismatch, its score is slightly penalized by 10% (`* 0.9`).
