"""The lunar modifier boosts a matched ingredient category and leaves every other one alone.

`get_lunar_modifier` multiplied the WHOLE modifier by the ruling planet's mass scale (0.5 for
Pluto up to 1.0 for the Sun), so only the Sun could return 1.0 or more. With the Moon, the planet
the route's one call site passes, a boosted category got 0.6548 and every other one 0.5457, so
asking for lunar data cut every ingredient's score by 35 to 45 percent (2 to 50 percent across
all planets), against the function's own docstring (">= 1.0 when phase boosts the category").
The planet now scales the BOOST: `1 + (base - 1) * mass_scale`.

And `ingredients.category` is free text whose production values are lowercase and mostly singular
('fruit', 'vegetable'), while the table of boosted groups names capitalized plural ones
('Fruits'): not one of the 401 production ingredients matched any phase.
INGREDIENT_CATEGORY_TO_LUNAR bridges the names that have a counterpart.

test_by_chart_handler.py computes its expected modifiers by calling the function, so it holds
under any formula; the numbers are pinned here. Stdlib and pytest only: the module under test
needs nothing else.
"""
import pytest

from backend.utils.lunar_engine import (
    INGREDIENT_CATEGORY_TO_LUNAR,
    LUNAR_PHASE_BOOSTS,
    get_lunar_modifier,
    lunar_category,
)
from backend.utils.planetary_weights import PLANET_MASS_RELATIVE

PHASES = list(LUNAR_PHASE_BOOSTS)
PLANETS = list(PLANET_MASS_RELATIVE)
TABLE_CATEGORIES = sorted({category for categories in LUNAR_PHASE_BOOSTS.values() for category in categories})
BOOSTED_PAIRS = [(phase, category) for phase, categories in LUNAR_PHASE_BOOSTS.items() for category in sorted(categories)]
LEGACY = ["Root/Grounding", "High-Water/Cooling", "Detoxifying"]

# SELECT category, count(*) FROM ingredients GROUP BY 1, in production, 2026-11-03 (401 rows).
PRODUCTION_CATEGORIES = {
    "fruit": 90, "vegetable": 64, "grain": 49, "oil": 48, "culinary_herb": 46, "spice": 43, "protein": 37,
    "vinegars": 14, "seasoning": 6, "meats": 1, "medicinal herb": 1, "mineral salt": 1, "salt": 1,
}
# The phases that boost each production category that has a counterpart, read off the table by
# the names alone (fruit -> Fruits -> Waxing Gibbous). The rest are boosted by no phase.
BOOSTED_IN = {
    "fruit": {"Waxing Gibbous"}, "vegetable": {"First Quarter"}, "grain": {"Full Moon"},
    "spice": {"Waning Crescent"}, "culinary_herb": {"Waning Crescent"}, "medicinal herb": {"Waning Crescent"},
}


# --- the formula --------------------------------------------------------------------------------

# 1 + 0.20 * (0.5 + 0.5 * w), where w is the planet's log10 mass between Pluto (0) and the Sun (1).
# The Moon's w is log10(0.0123 / 0.0022) / log10(333054 / 0.0022) = 0.0914, so 1 + 0.2 * 0.5457.
@pytest.mark.parametrize("planet, expected", [
    ("Sun", 1.2), ("Jupiter", 1.1631), ("Moon", 1.1091), ("Mercury", 1.1171), ("Pluto", 1.1),
])
def test_a_matched_category_gets_the_twenty_percent_boost_scaled_by_the_planets_mass(planet, expected):
    assert get_lunar_modifier("Full Moon", "Grains", planet) == expected


def test_the_planet_scales_the_boost_not_the_whole_modifier():
    # The old form returned 0.6548 here, and 0.5457 for a category nothing boosts.
    assert get_lunar_modifier("Full Moon", "Grains", "Moon") > 1.0
    assert get_lunar_modifier("Full Moon", "Fruits", "Moon") == 1.0


@pytest.mark.parametrize("planet", PLANETS)
def test_a_boosted_category_gets_at_least_half_the_boost_and_at_most_all_of_it(planet):
    for phase, category in BOOSTED_PAIRS:
        assert 1.10 <= get_lunar_modifier(phase, category, planet) <= 1.20, (phase, category)


@pytest.mark.parametrize("planet", PLANETS)
def test_a_category_the_phase_does_not_boost_is_left_alone(planet):
    checked = 0
    for phase in PHASES:
        for category in [*TABLE_CATEGORIES, "oil", "protein", "no such category", ""]:
            if category in LUNAR_PHASE_BOOSTS[phase]:
                continue
            assert get_lunar_modifier(phase, category, planet) == 1.0, (phase, category)
            checked += 1
    assert checked > len(PHASES)  # the loop ran, and over more than one category per phase


@pytest.mark.parametrize("planet", PLANETS)
def test_the_modifier_is_never_a_penalty(planet):
    # The docstring's contract: >= 1.0 whatever the planet, phase or category.
    for phase in PHASES:
        for category in [*TABLE_CATEGORIES, *LEGACY, *PRODUCTION_CATEGORIES, "no such category"]:
            assert get_lunar_modifier(phase, category, planet) >= 1.0, (phase, category)


def test_a_heavier_planet_boosts_more_and_the_sun_most():
    by_mass = sorted(PLANETS, key=lambda planet: PLANET_MASS_RELATIVE[planet])
    boosts = [get_lunar_modifier("Full Moon", "Grains", planet) for planet in by_mass]
    assert boosts == sorted(boosts) and boosts[0] < boosts[-1]
    assert by_mass[-1] == "Sun" and boosts[-1] == 1.2
    # the docstring's own example
    assert get_lunar_modifier("Full Moon", "Grains", "Sun") > get_lunar_modifier("Full Moon", "Grains", "Mercury")


def test_the_planet_defaults_to_the_moon_which_is_what_the_route_uses():
    # main.py calls get_lunar_modifier(phase_name, ingredient_category) with no planet.
    assert get_lunar_modifier("Full Moon", "Grains") == get_lunar_modifier("Full Moon", "Grains", "Moon") == 1.1091


def test_an_unknown_planet_counts_as_one_earth_mass():
    assert get_lunar_modifier("Full Moon", "Grains", "Vulcan") == get_lunar_modifier("Full Moon", "Grains", "Earth") == 1.1325


@pytest.mark.parametrize("phase", ["Blue Moon", "full moon", "FULL MOON", " Full Moon", ""])
def test_a_phase_that_is_not_one_of_the_eight_names_boosts_nothing(phase):
    # The route passes get_current_lunar_phase()'s names as they are, and they are matched exactly.
    assert get_lunar_modifier(phase, "Grains", "Sun") == 1.0


# --- the legacy categories ----------------------------------------------------------------------

@pytest.mark.parametrize("phase, category, sun, moon", [
    ("New Moon", "Root/Grounding", 1.2, 1.1091),
    ("Full Moon", "High-Water/Cooling", 1.2, 1.1091),
    ("Waning Gibbous", "Detoxifying", 1.1, 1.0546),    # 1 + 0.10 * 0.5457
    ("Waning Crescent", "Detoxifying", 1.1, 1.0546),
])
def test_the_legacy_categories_keep_their_boosts_in_their_phases(phase, category, sun, moon):
    assert get_lunar_modifier(phase, category, "Sun") == sun
    assert get_lunar_modifier(phase, category, "Moon") == moon


@pytest.mark.parametrize("phase, category", [
    ("Full Moon", "Root/Grounding"), ("New Moon", "High-Water/Cooling"), ("Waxing Gibbous", "Detoxifying"),
    ("New Moon", "Detoxifying"), ("Last Quarter", "Detoxifying"),   # "Waning" is matched in the phase's name
])
def test_a_legacy_category_outside_its_phase_is_left_alone(phase, category):
    assert get_lunar_modifier(phase, category, "Sun") == get_lunar_modifier(phase, category, "Moon") == 1.0


# --- production's category names ----------------------------------------------------------------

@pytest.mark.parametrize("category", sorted(PRODUCTION_CATEGORIES))
def test_each_production_category_is_boosted_in_exactly_the_phases_its_counterpart_is(category):
    boosted = {phase for phase in PHASES if get_lunar_modifier(phase, category, "Moon") > 1.0}
    assert boosted == BOOSTED_IN.get(category, set())


def test_four_of_the_eight_phases_boost_nothing_in_production():
    # The table's Seeds, Sprouts, Leafy Greens, Roots and Fungi have no production category, so
    # New Moon, Waxing Crescent, Waning Gibbous and Last Quarter change nothing there.
    boosting = {phase for phase in PHASES if any(get_lunar_modifier(phase, c, "Moon") > 1.0 for c in PRODUCTION_CATEGORIES)}
    assert boosting == {"First Quarter", "Waxing Gibbous", "Full Moon", "Waning Crescent"}


def test_a_production_name_gets_the_same_modifier_as_the_tables_name():
    for production, table in INGREDIENT_CATEGORY_TO_LUNAR.items():
        for phase in PHASES:
            assert get_lunar_modifier(phase, production, "Moon") == get_lunar_modifier(phase, table, "Moon"), (phase, production)


def test_the_map_is_exactly_these_six_names():
    # Pinned whole: spice -> Herbs or grain -> Flowers would be boosted in the very same phase, so
    # the per-phase checks above cannot tell them from the right ones.
    assert INGREDIENT_CATEGORY_TO_LUNAR == {
        "fruit": "Fruits", "vegetable": "Vegetables", "grain": "Grains",
        "spice": "Spices", "culinary_herb": "Herbs", "medicinal herb": "Herbs",
    }


def test_the_map_has_no_dead_entry():
    boosted_somewhere = set().union(*LUNAR_PHASE_BOOSTS.values())
    assert set(INGREDIENT_CATEGORY_TO_LUNAR) <= set(PRODUCTION_CATEGORIES)          # a category production has
    assert all(key == key.strip().lower() for key in INGREDIENT_CATEGORY_TO_LUNAR)  # in the form lunar_category looks up
    assert set(INGREDIENT_CATEGORY_TO_LUNAR.values()) <= boosted_somewhere          # a group some phase boosts
    assert not set(INGREDIENT_CATEGORY_TO_LUNAR) & boosted_somewhere               # a table name is never remapped
    assert set(INGREDIENT_CATEGORY_TO_LUNAR) == set(BOOSTED_IN)                     # and nothing here is unaccounted for


def test_the_recorded_production_vocabulary_adds_up_to_what_the_pull_request_says():
    assert sum(PRODUCTION_CATEGORIES.values()) == 401
    assert sum(PRODUCTION_CATEGORIES[category] for category in INGREDIENT_CATEGORY_TO_LUNAR) == 293  # "293 of 401"


@pytest.mark.parametrize("given, expected", [
    ("fruit", "Fruits"), ("vegetable", "Vegetables"), ("grain", "Grains"), ("spice", "Spices"),
    ("culinary_herb", "Herbs"), ("medicinal herb", "Herbs"),
    ("Fruit", "Fruits"), ("  FRUIT\n", "Fruits"),                    # a production spelling: any case, any padding
    ("Fruits", "Fruits"), ("Root/Grounding", "Root/Grounding"),      # already a table name, or a legacy one
    ("fruits", "fruits"), ("FRUITS", "FRUITS"), (" Fruits ", " Fruits "), ("Fruits ", "Fruits "),  # a table name matches exactly
    ("ſpice", "ſpice"),                                              # lower(), not casefold(): a long s is not an s
    ("oil", "oil"), ("", ""), (None, None), (7, 7),                  # no counterpart, or not a string
])
def test_lunar_category(given, expected):
    assert lunar_category(given) == expected


@pytest.mark.parametrize("planet", PLANETS)
def test_a_missing_category_is_simply_unboosted(planet):
    # Every phase: the legacy rules compare the category too (New Moon, and the Waning phases).
    for phase in PHASES:
        assert get_lunar_modifier(phase, None, planet) == 1.0, phase
