"""Cross-runtime parity for the Layer 3 aspect-ESMS effect tables.

ESMS 2.0 RULED 2026-08-03, lambda = 1: the aspect layer is ratified AS MEASURED.
A typical aspect is worth about one dignity FOLD; an exceptional one about a
full dignity STACK. No global rescale was applied, because measurement showed
the relationship already held. See the BASIS block in
`backend/utils/aspect_esms_effects.py`.

Layer 3 is a hand-authored per-planet-pair table duplicated in two runtimes.
Nothing in either type system stops one from being edited without the other,
and a one-sided edit is invisible: both runtimes keep computing, just different
physics. The only real defence is that both must reproduce the same golden file
-- backend/tests/aspect_effects_golden.json. The TypeScript half of this pair is
src/__tests__/aspectDignityCommensurability.test.ts.

DIVISION OF LABOUR, stated so nobody assumes this file checks more than it does:

  * THIS file enforces TABLE PARITY -- the values, the aspect types, and the set
    of authored pairs, plus the dignity anchors the ruling is stated against.
  * The TypeScript half additionally enforces the DISTRIBUTIONAL ruling (median
    aspect ~ one fold, p90 ~ one full stack), because that measurement needs an
    ephemeris to generate real skies and this suite deliberately imports no
    ephemeris. Table parity here plus the distribution there covers the ruling:
    identical tables through an identical accumulator cannot produce different
    distributions.

Assertions are `==` on floats, deliberately, matching test_kalchm_parity.py.
These are authored constants, not computed results -- there is no accumulated
floating-point error to tolerate, and `pytest.approx` would wave through a
table edit in the 4th decimal, which is exactly what this gate exists to catch.
"""
import json
import os

import pytest

# Imports the effect tables, NOT the FastAPI app. Importing
# backend.alchm_kitchen.main would pull in fastapi/sqlalchemy/pyswisseph and
# this suite could not be COLLECTED without them -- a parity gate that cannot
# run is worse than no gate, because its absence reads as a pass.
from backend.utils.aspect_esms_effects import (
    DEFAULT_ASPECT_EFFECTS,
    PLANET_PAIR_ASPECT_EFFECTS,
)
from backend.utils.dignity_manifest import DIGNITY_POINTS, DIGNITY_SCORE_DIVISOR

GOLDEN_PATH = os.path.join(os.path.dirname(__file__), "aspect_effects_golden.json")

with open(GOLDEN_PATH) as handle:
    GOLDEN = json.load(handle)

TABLES = GOLDEN["tables"]
AXES = GOLDEN["axes"]

#: The measured ceiling of the summed 5-fold dignity score: Mercury 0-7 deg
#: Virgo (domicile +5, exaltation +4, term +2). See DIGNITY_SCORE_DIVISOR.
FULL_STACK_POINTS = 11


def _normalize_pair(pair: str) -> str:
    return "-".join(sorted(p[:1].upper() + p[1:].lower() for p in pair.split("-")))


def _python_tables() -> dict:
    return {
        _normalize_pair(pair): {
            aspect_type: [float(x) for x in effect]
            for aspect_type, effect in by_type.items()
        }
        for pair, by_type in PLANET_PAIR_ASPECT_EFFECTS.items()
    }


def test_axis_order_matches_golden():
    """The tables are positional tuples in Python and named fields in TS.

    If the axis order ever disagrees, every value would still compare equal in
    aggregate while Spirit silently became Essence. Pin the order explicitly.
    """
    assert AXES == ["Spirit", "Essence", "Matter", "Substance"]


@pytest.mark.parametrize(
    "pair", sorted(k for k in TABLES if k != "__DEFAULT__")
)
def test_authored_pair_table_matches_golden(pair):
    tables = _python_tables()
    assert pair in tables, f"Python is missing the authored pair {pair}"
    for aspect_type, expected in TABLES[pair].items():
        assert aspect_type in tables[pair], (
            f"Python {pair} is missing aspect type {aspect_type}"
        )
        assert tables[pair][aspect_type] == expected, (
            f"{pair}/{aspect_type} drifted from the TypeScript runtime"
        )


def test_default_fallback_table_matches_golden():
    for aspect_type, expected in TABLES["__DEFAULT__"].items():
        assert aspect_type in DEFAULT_ASPECT_EFFECTS, (
            f"Python DEFAULT is missing aspect type {aspect_type}"
        )
        assert [float(x) for x in DEFAULT_ASPECT_EFFECTS[aspect_type]] == expected, (
            f"DEFAULT/{aspect_type} drifted from the TypeScript runtime"
        )


def test_authors_exactly_the_pairs_the_golden_records():
    """Catches an ADDED pair table, which the per-pair parametrization cannot see."""
    expected = sorted(k for k in TABLES if k != "__DEFAULT__")
    assert sorted(_python_tables()) == expected


def test_every_authored_pair_covers_every_default_aspect_type():
    """A pair table missing a type silently falls back to DEFAULT in TS
    (`pairEffects[aspectType]` is undefined -> DEFAULT) but raises KeyError in
    Python. Same input, different behaviour -- so require full coverage.
    """
    types = set(DEFAULT_ASPECT_EFFECTS)
    for pair, by_type in _python_tables().items():
        assert set(by_type) == types, f"{pair} does not cover every aspect type"


def test_dignity_anchors_the_ruling_is_stated_against():
    anchors = GOLDEN["dignityAnchors"]
    assert anchors["domicileFoldPoints"] == DIGNITY_POINTS["domicile"]
    assert anchors["fullStackPoints"] == FULL_STACK_POINTS
    assert anchors["dignityScoreDivisor"] == DIGNITY_SCORE_DIVISOR
