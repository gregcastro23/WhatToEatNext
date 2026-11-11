"""planetary_hour_at reproduces the golden vectors the TypeScript PlanetaryHourCalculator is held to.

backend/tests/planetary_hour_golden_vectors.json is the contract between the two engines (the TypeScript half is
src/lib/__tests__/planetaryHourGoldenVectors.test.ts; backend/tests/test_planetary_hour_golden_vectors.py holds the
file to the classical table without calling either engine). The values in it were written by planetary_hour_at, so
this is the check that the file and the engine still agree: if the engine changes, this fails until the vectors are
regenerated (scripts/gen_planetary_hour_golden_vectors.py) AND the TypeScript half passes against the new file.

Needs pyswisseph (the CI step "Swiss Ephemeris engines (Python)" installs it), so it sits beside test_planetary_hours.py.
"""
import datetime
import json
import os

import pytest

from backend.utils.planetary_hours import planetary_hour_at

UTC = datetime.timezone.utc
_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "planetary_hour_golden_vectors.json"), encoding="utf-8") as fh:
    GOLDEN = json.load(fh)

DAYS = GOLDEN["days"]
PLACES = GOLDEN["places"]


def parse(instant):
    return datetime.datetime.strptime(instant, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=UTC)


def test_golden_vector_file_is_populated():
    """CONTROL. A parametrised test over an empty list PASSES."""
    assert len(DAYS) == 56 and all(len(day["hours"]) == 24 for day in DAYS)


@pytest.mark.parametrize("day", DAYS, ids=lambda day: f"{day['place']} {day['localDate']}")
def test_planetary_hour_at_gives_every_vector_its_ruler_hour_and_day(day):
    place = PLACES[day["place"]]
    wrong = []
    for index, (instant, ruler) in enumerate(day["hours"]):
        h = planetary_hour_at(parse(instant), place["latitude"], place["longitude"])
        got = (h.ruler, h.hour, h.is_daytime, h.day_ruler)
        if got != (ruler, index, index < 12, day["dayRuler"]):
            wrong.append((index, instant, got))
    assert wrong == []


@pytest.mark.parametrize("day", DAYS, ids=lambda day: f"{day['place']} {day['localDate']}")
def test_the_recorded_sun_events_are_the_ones_planetary_hour_at_finds(day):
    place = PLACES[day["place"]]
    h = planetary_hour_at(parse(day["hours"][0][0]), place["latitude"], place["longitude"])
    # The file stores whole seconds.
    for found, recorded in ((h.sunrise, day["sunrise"]), (h.sunset, day["sunset"]), (h.next_sunrise, day["nextSunrise"])):
        assert abs(found - parse(recorded)) <= datetime.timedelta(seconds=1)
