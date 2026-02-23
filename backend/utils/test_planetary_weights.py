"""
Unit tests for backend/utils/planetary_weights.py
and its integration with lunar_engine and seasonal_engine.
"""

import sys
import os
import math
import pytest

# Ensure the project root is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.utils.planetary_weights import (
    PLANET_MASS_KG,
    PLANET_MASS_RELATIVE,
    PLANET_MASS_NORMALIZED,
    get_planet_weight,
)
from backend.utils.lunar_engine import get_lunar_modifier, LUNAR_PHASE_BOOSTS
from backend.utils.seasonal_engine import get_seasonal_modifier


# ---------------------------------------------------------------------------
# planetary_weights tests
# ---------------------------------------------------------------------------

class TestPlanetaryWeights:
    EXPECTED_PLANETS = [
        "Sun", "Moon", "Mercury", "Venus", "Earth",
        "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    ]

    def test_all_planets_present(self):
        for planet in self.EXPECTED_PLANETS:
            assert planet in PLANET_MASS_KG, f"{planet} missing from PLANET_MASS_KG"
            assert planet in PLANET_MASS_RELATIVE, f"{planet} missing from PLANET_MASS_RELATIVE"
            assert planet in PLANET_MASS_NORMALIZED, f"{planet} missing from PLANET_MASS_NORMALIZED"

    def test_normalized_range(self):
        """All normalized weights must be in [0, 1]."""
        for planet, weight in PLANET_MASS_NORMALIZED.items():
            assert 0.0 <= weight <= 1.0, (
                f"{planet} normalized weight {weight} out of [0, 1]"
            )

    def test_sun_is_heaviest(self):
        assert PLANET_MASS_NORMALIZED["Sun"] == pytest.approx(1.0, abs=1e-4)

    def test_pluto_is_lightest(self):
        lightest = min(PLANET_MASS_NORMALIZED.values())
        assert PLANET_MASS_NORMALIZED["Pluto"] == pytest.approx(lightest, abs=1e-4)

    def test_earth_is_reference_relative(self):
        assert PLANET_MASS_RELATIVE["Earth"] == pytest.approx(1.0, rel=1e-6)

    def test_jupiter_heavier_than_saturn(self):
        assert PLANET_MASS_KG["Jupiter"] > PLANET_MASS_KG["Saturn"]
        assert PLANET_MASS_NORMALIZED["Jupiter"] > PLANET_MASS_NORMALIZED["Saturn"]

    def test_get_planet_weight_default_normalized(self):
        w = get_planet_weight("Jupiter")
        assert w == PLANET_MASS_NORMALIZED["Jupiter"]

    def test_get_planet_weight_relative(self):
        w = get_planet_weight("Earth", scale="relative")
        assert w == pytest.approx(1.0, rel=1e-6)

    def test_get_planet_weight_kg(self):
        w = get_planet_weight("Sun", scale="kg")
        assert w == pytest.approx(1.989e30, rel=1e-3)

    def test_unknown_planet_fallback(self):
        assert get_planet_weight("Vulcan") == 0.5           # normalized default
        assert get_planet_weight("Vulcan", "relative") == 1.0
        assert get_planet_weight("Vulcan", "kg") == pytest.approx(5.972e24, rel=1e-3)


# ---------------------------------------------------------------------------
# lunar_engine integration tests
# ---------------------------------------------------------------------------

class TestLunarModifier:
    def test_matching_phase_gives_boost(self):
        """Full Moon should boost Grains."""
        mod = get_lunar_modifier("Full Moon", "Grains", planet="Sun")
        # base = 1.20, Sun mass_scale = 0.5 + 0.5*1.0 = 1.0 → 1.20
        assert mod == pytest.approx(1.20, abs=0.01)

    def test_non_matching_phase_no_boost(self):
        """A non-matching phase/category pair should give base modifier of 1.0."""
        mod = get_lunar_modifier("New Moon", "Fruits", planet="Sun")
        # base = 1.0, Sun mass_scale = 1.0 → 1.0
        assert mod == pytest.approx(1.0, abs=0.01)

    def test_planet_weight_scales_modifier(self):
        """Moon-ruled modifier should be smaller than Sun-ruled for same phase/category."""
        mod_sun  = get_lunar_modifier("Full Moon", "Grains", planet="Sun")
        mod_moon = get_lunar_modifier("Full Moon", "Grains", planet="Moon")
        assert mod_sun > mod_moon

    def test_all_phases_covered(self):
        """Every phase defined in LUNAR_PHASE_BOOSTS must be reachable."""
        for phase in LUNAR_PHASE_BOOSTS:
            first_cat = next(iter(LUNAR_PHASE_BOOSTS[phase]))
            mod = get_lunar_modifier(phase, first_cat, planet="Saturn")
            assert mod > 0


# ---------------------------------------------------------------------------
# seasonal_engine integration tests
# ---------------------------------------------------------------------------

class TestSeasonalModifier:
    def test_matching_element_gives_boost(self):
        """Leo (Fire) + Thermogenic ingredient → 1.2 base boost."""
        mod = get_seasonal_modifier("Leo", "Thermogenic", planet="Sun")
        # base = 1.2, Sun mass_scale = 1.0 → 1.2
        assert mod == pytest.approx(1.2, abs=0.01)

    def test_mismatch_gives_penalty(self):
        """Leo (Fire) + Hydrating ingredient → 0.9 base penalty."""
        mod = get_seasonal_modifier("Leo", "Hydrating", planet="Sun")
        assert mod == pytest.approx(0.9, abs=0.01)

    def test_planet_weight_scales_seasonal_modifier(self):
        """Heavier planet should give higher seasonal modifier for matching element."""
        mod_jupiter = get_seasonal_modifier("Leo", "Thermogenic", planet="Jupiter")
        mod_mercury = get_seasonal_modifier("Leo", "Thermogenic", planet="Mercury")
        assert mod_jupiter > mod_mercury

    def test_earth_sign_boosts_rooted(self):
        """Taurus (Earth) should boost Rooted more than a mismatching type."""
        mod_match    = get_seasonal_modifier("Taurus", "Rooted",     planet="Saturn")
        mod_mismatch = get_seasonal_modifier("Taurus", "Thermogenic", planet="Saturn")
        assert mod_match > mod_mismatch

    def test_water_sign_boosts_hydrating(self):
        """Cancer (Water) should boost Hydrating more than a mismatching type."""
        mod_match    = get_seasonal_modifier("Cancer", "Hydrating",   planet="Moon")
        mod_mismatch = get_seasonal_modifier("Cancer", "Thermogenic", planet="Moon")
        assert mod_match > mod_mismatch

    def test_air_sign_boosts_light_sprouted(self):
        """Gemini (Air) should boost Light/Sprouted more than a mismatching type."""
        mod_match    = get_seasonal_modifier("Gemini", "Light/Sprouted", planet="Mercury")
        mod_mismatch = get_seasonal_modifier("Gemini", "Rooted",         planet="Mercury")
        assert mod_match > mod_mismatch
