"""The engines the by-chart recommender calls, on the data it hands them.

Needs pydantic (the potency and quantity engines return pydantic models) and pyswisseph, both
pinned in backend/requirements.txt; the CI step installs them next to pytest.

Three things that were wrong and are pinned here:
- a recipe's elements, as recipes.read_model stores them (lowercase), were invisible to the
  potency and quantity engines (they look for "Fire", "Water", "Earth", "Air"), so every recipe
  scored the same whatever its elements;
- `get_optimal_cooking_windows` passed the minute to `swe.julday` as its calendar flag, so it
  raised at almost every minute of the hour;
- `get_transit_details` called `calculate_current_elemental_balance`, defined nowhere.
"""
import datetime
import types

import pytest

import backend.utils.lunar_oracle as lunar_oracle
import backend.utils.transit_engine as transit_engine
from backend.utils.alchemical_quantities import calculate_alchemical_quantities
from backend.utils.by_chart_recommendations import recipe_from_read_model
from backend.utils.transit_engine import calculate_total_potency_score

# One real-shaped read model per dominant element (lowercase keys, as stored).
STORED = {
    "Fire": {"fire": 0.7, "water": 0.1, "earth": 0.1, "air": 0.1},
    "Water": {"fire": 0.1, "water": 0.6, "earth": 0.2, "air": 0.1},
    "Earth": {"fire": 0.1, "water": 0.1, "earth": 0.6, "air": 0.2},
    "Air": {"fire": 0.1, "water": 0.1, "earth": 0.2, "air": 0.6},
}


def recipe(element):
    return recipe_from_read_model({"id": element, "elemental_properties": STORED[element], "nutritional_profile": None})


def potency(element, sun_element="Water"):
    return calculate_total_potency_score(recipe(element), None, sun_element, None).total_potency_score


# --- the engines read the recipe's own elements ---------------------------------------------


def test_potency_follows_the_recipes_dominant_element():
    # No dominant transit (alignment 0.5 -> 0.2), no planetary hour. Elemental match is 1.0 for
    # the recipe whose element is the Sun's (here Water), else 0.5; thermodynamic parity is
    # Fire 1.0, Air 0.7, Earth 0.5, Water 0.3.
    assert potency("Fire") == pytest.approx(0.2 + 0.3 * 0.5 + 0.3 * 1.0)
    assert potency("Water") == pytest.approx(0.2 + 0.3 * 1.0 + 0.3 * 0.3)
    assert potency("Earth") == pytest.approx(0.2 + 0.3 * 0.5 + 0.3 * 0.5)
    assert potency("Air") == pytest.approx(0.2 + 0.3 * 0.5 + 0.3 * 0.7)


def test_the_recipe_matching_the_suns_element_gains_the_match_bonus_whichever_element_that_is():
    for sun in STORED:
        others = [potency(e, sun) for e in STORED if e != sun]
        own_parity = {"Fire": 1.0, "Air": 0.7, "Earth": 0.5, "Water": 0.3}[sun]
        assert potency(sun, sun) == pytest.approx(0.2 + 0.3 * 1.0 + 0.3 * own_parity)
        assert len({round(p, 6) for p in others + [potency(sun, sun)]}) >= 3


def test_control_the_stored_lowercase_dict_handed_straight_to_the_engine_scores_every_recipe_alike():
    # This is what the handler did before: the lowercase keys never match "Water", "Fire", ..
    scores = {
        element: calculate_total_potency_score(
            types.SimpleNamespace(elementalProperties=STORED[element]), None, "Water", None
        ).total_potency_score
        for element in STORED
    }
    assert len(set(scores.values())) == 1


def test_the_quantities_use_the_recipes_own_elements_not_the_uniform_default():
    result = calculate_alchemical_quantities(recipe("Water"), 0.0, None, 0.0)
    assert result.essence_score == pytest.approx(0.6 * 0.7)          # water * 0.7
    assert result.matter_score == pytest.approx(0.5 * 0.6 + 0.2 * 0.4)  # default density 0.5, earth 0.2
    assert result.spirit_score == pytest.approx(0.1 * 0.25 + 0.1 * 0.25)  # air and fire 0.1
    lowercase = calculate_alchemical_quantities(types.SimpleNamespace(elementalProperties=STORED["Water"]), 0.0, None, 0.0)
    assert lowercase.essence_score == pytest.approx(0.25 * 0.7)      # the control: the default, not 0.6


def test_a_recipe_without_elements_is_scored_neutrally_not_as_fire():
    bare = recipe_from_read_model({"id": "bare"})
    score = calculate_total_potency_score(bare, None, "Fire", None)
    assert score.total_potency_score == pytest.approx(0.2 + 0.3 * 0.5 + 0.3 * 0.5)
    assert score.thermo_rating == 0.5
    assert calculate_alchemical_quantities(bare, 0.0, None, 0.5).essence_score == pytest.approx(0.25 * 0.7)


# --- the cooking windows --------------------------------------------------------------------


def unix_julian_day(moment):
    """Julian day (UT) from the Unix epoch, independent of swisseph: valid for Gregorian dates."""
    epoch = datetime.datetime(1970, 1, 1)
    return (moment - epoch).total_seconds() / 86400.0 + 2440587.5


@pytest.mark.parametrize(
    "moment",
    [
        datetime.datetime(2026, 11, 3, 20, 19),
        datetime.datetime(2026, 11, 3, 0, 0),    # minute 0: the old call read this in the Julian calendar
        datetime.datetime(2026, 11, 3, 23, 59, 59),
        datetime.datetime(2000, 1, 1, 12, 0),
        datetime.datetime(1990, 6, 15, 7, 45, 30),
    ],
)
def test_the_julian_day_matches_an_independent_calculation(moment):
    assert lunar_oracle.swe is not None, "pyswisseph is not installed; the CI step installs it"
    assert lunar_oracle.julian_day_utc(moment) == pytest.approx(unix_julian_day(moment), abs=1e-9)


@pytest.mark.parametrize("minute", [0, 1, 19, 30, 59])
def test_the_cooking_windows_are_computed_at_every_minute_of_the_hour(minute, monkeypatch):
    assert lunar_oracle.swe is not None, "pyswisseph is not installed; the CI step installs it"

    class Clock(datetime.datetime):
        @classmethod
        def utcnow(cls):
            return cls(2026, 11, 3, 20, minute)

    monkeypatch.setattr(lunar_oracle, "datetime", types.SimpleNamespace(datetime=Clock, timedelta=datetime.timedelta))
    windows = lunar_oracle.get_optimal_cooking_windows(days=1)
    assert isinstance(windows, list) and len(windows) == 1, windows
    assert windows[0]["date"] == "2026-11-03" and windows[0]["start_time"] == f"20:{minute:02d}"
    assert {"mansion", "food_type"} <= set(windows[0])


# --- the transit details --------------------------------------------------------------------


def test_the_current_elemental_balance_counts_each_transiting_body_once():
    # Aries (Fire), Cancer (Water), Libra (Air), Capricorn (Earth)
    transits = {"Sun": 10.0, "Mars": 100.0, "Venus": 190.0, "Saturn": 280.0}
    assert transit_engine.calculate_current_elemental_balance(transits) == {
        "Fire": 0.25, "Water": 0.25, "Air": 0.25, "Earth": 0.25,
    }


def test_get_transit_details_returns_instead_of_raising():
    assert transit_engine.swe is not None, "pyswisseph is not installed; the CI step installs it"
    details = transit_engine.get_transit_details()
    assert "error" not in details, details
    assert set(details["current_elemental_balance"]) == {"Fire", "Water", "Earth", "Air"}
    assert sum(details["current_elemental_balance"].values()) == pytest.approx(1.0)
    assert details["sun_element"] in {"Fire", "Water", "Earth", "Air"}


# --- a tie has no dominant element ------------------------------------------------------------


@pytest.mark.parametrize(
    "shares,dominant",
    [
        ({"Fire": 0.1, "Water": 0.6, "Earth": 0.2, "Air": 0.1}, "Water"),
        ({"Fire": 0.3, "Water": 0.3, "Earth": 0.2, "Air": 0.2}, None),             # a tie for the top
        ({"Fire": 0.2, "Water": 0.2, "Earth": 0.2, "Air": 0.4}, "Air"),
        ({"Fire": 0.25, "Water": 0.25, "Earth": 0.25, "Air": 0.25}, None),          # uniform
        ({"Fire": 0.0}, None),                                                       # one key, nothing in it
        ({"Fire": 0.3}, "Fire"),                                                     # one key, something in it
        ({"Fire": 0.0, "Water": 0.0, "Earth": 0.0, "Air": 0.0}, None),              # nothing in it
        ({"Fire": 0.4, "Water": 0.4 + 1e-12, "Earth": 0.1, "Air": 0.1}, None),      # a tie, up to float noise
        ({"Fire": 0.4, "Water": 0.4 + 1e-6, "Earth": 0.1, "Air": 0.1}, "Water"),    # a real, if small, lead
        (None, None),
        ({}, None),
        # an unknown share has no dominant element, wherever the NaN sits (max() depends on the position)
        ({"Fire": float("nan"), "Water": 0.5, "Earth": 0.3, "Air": 0.2}, None),
        ({"Fire": 0.2, "Water": 0.5, "Earth": float("nan"), "Air": 0.3}, None),
        ({"Fire": 0.2, "Water": 0.5, "Earth": 0.3, "Air": float("nan")}, None),
        ({"Fire": 0.2, "Water": float("inf"), "Earth": 0.3, "Air": 0.1}, None),
    ],
)
def test_the_dominant_element_is_the_unique_greatest_share(shares, dominant):
    assert transit_engine.get_dominant_element(shares) == dominant


def test_a_recipe_tied_for_its_top_element_is_scored_neutrally_not_as_fire():
    # 34 of 1099 production recipes tie exactly. max() used to give them whichever tied element came
    # first in the dict, and Fire's potency is the highest of the four.
    tied = recipe_from_read_model({"id": "t", "elemental_properties": {"fire": 0.1, "water": 0.4, "earth": 0.1, "air": 0.4}})
    score = calculate_total_potency_score(tied, None, "Fire", None)
    assert score.total_potency_score == pytest.approx(0.2 + 0.3 * 0.5 + 0.3 * 0.5)
    assert score.thermo_rating == 0.5
    fire_first = recipe_from_read_model({"id": "f", "elemental_properties": {"fire": 0.4, "water": 0.4, "earth": 0.1, "air": 0.1}})
    assert calculate_total_potency_score(fire_first, None, "Water", None).total_potency_score == pytest.approx(0.5)


# --- the Julian day is exact -------------------------------------------------------------------


def test_microseconds_count():
    moment = datetime.datetime(2026, 11, 3, 20, 19, 7, 654321)
    assert lunar_oracle.julian_day_utc(moment) == pytest.approx(unix_julian_day(moment), abs=1e-9)
    assert lunar_oracle.julian_day_utc(moment) > lunar_oracle.julian_day_utc(moment.replace(microsecond=0))


@pytest.mark.parametrize("hours", [5, -8, 0, 5.5, -3.25])
def test_an_aware_datetime_is_converted_to_utc_first(hours):
    zone = datetime.timezone(datetime.timedelta(hours=hours))
    local = datetime.datetime(2026, 11, 3, 20, 19, tzinfo=zone)
    as_utc = (local - local.utcoffset()).replace(tzinfo=None)
    assert lunar_oracle.julian_day_utc(local) == pytest.approx(unix_julian_day(as_utc), abs=1e-9)
    assert lunar_oracle.julian_day_utc(local) == lunar_oracle.julian_day_utc(as_utc)


# --- the wiring of the two functions that take a clock ---------------------------------------


def test_the_cooking_windows_step_by_day_and_use_each_days_own_julian_day(monkeypatch):
    class Clock(datetime.datetime):
        @classmethod
        def utcnow(cls):
            return cls(2026, 11, 3, 20, 19)

    monkeypatch.setattr(lunar_oracle, "datetime", types.SimpleNamespace(datetime=Clock, timedelta=datetime.timedelta))
    seen = []
    longitudes = iter([5.0, 50.0, 100.0])  # Ashwini, Rohini, Pushya-ish: three different mansions

    def moon(julian_day):
        seen.append(julian_day)
        return next(longitudes)

    monkeypatch.setattr(lunar_oracle, "get_moon_longitude", moon)
    windows = lunar_oracle.get_optimal_cooking_windows(days=3)

    now = datetime.datetime(2026, 11, 3, 20, 19)
    assert [w["date"] for w in windows] == ["2026-11-03", "2026-11-04", "2026-11-05"]
    assert seen == pytest.approx([unix_julian_day(now + datetime.timedelta(days=k)) for k in range(3)], abs=1e-9)
    assert [w["mansion"] for w in windows] == [lunar_oracle.get_lunar_mansion(x)["name"] for x in (5.0, 50.0, 100.0)]
    assert len({w["mansion"] for w in windows}) == 3


def test_get_transit_details_takes_the_balance_from_the_current_transits_not_the_birth_chart(monkeypatch):
    birth_jd = transit_engine.get_julian_day(*(transit_engine.BIRTH_DATA[k] for k in ("year", "month", "day", "hour", "minute")))
    birth = {"Sun": 10.0, "Mars": 20.0, "Venus": 40.0, "Saturn": 130.0}     # Fire, Fire, Earth, Fire
    current = {"Sun": 100.0, "Mars": 190.0, "Venus": 280.0, "Saturn": 70.0}  # Water, Air, Earth, Air
    monkeypatch.setattr(transit_engine, "get_planetary_positions", lambda jd: dict(birth if jd == birth_jd else current))

    details = transit_engine.get_transit_details()

    assert details["birth_chart"] == birth and details["current_transits"] == current
    assert details["current_elemental_balance"] == {"Fire": 0.0, "Water": 0.25, "Earth": 0.25, "Air": 0.5}
    assert details["current_elemental_balance"] != transit_engine.calculate_current_elemental_balance(birth)
