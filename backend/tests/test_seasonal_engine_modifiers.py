"""`get_seasonal_modifiers()` must return, not raise.

backend/utils/seasonal_engine.py called `get_planet_weight(...)` without importing it,
so every call raised `NameError: name 'get_planet_weight' is not defined`. Its callers
are `POST /api/astrological/recipe-recommendations-by-chart` (backend/alchm_kitchen/main.py),
the transmutation oracle and an audit script. Nothing exercised the plural function:
backend/utils/test_planetary_weights.py covers `get_seasonal_modifier` (singular) only,
and CI does not collect backend/utils.

seasonal_engine.py and planetary_weights.py import nothing but the standard library, so
this runs on a bare Python with pytest alone, like the other deployed-server tests here.
"""
import ast
import datetime
import subprocess
import sys
from pathlib import Path

from backend.utils.planetary_weights import PLANET_MASS_NORMALIZED
from backend.utils.seasonal_engine import ELEMENTAL_INGREDIENTS, get_seasonal_modifiers

BACKEND = Path(__file__).resolve().parents[1]
CALLERS = (
    BACKEND / "alchm_kitchen" / "main.py",
    BACKEND / "utils" / "transmutation_oracle.py",
    BACKEND / "scripts" / "modifier_weighting_audit.py",
)
SIGNS = {
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
}
LEO_DAY = datetime.date(2024, 8, 10)


def keys_read_from(path: Path) -> set:
    """The string keys `path` reads off a name it assigned from `get_seasonal_modifiers(...)`."""
    tree = ast.parse(path.read_text(encoding="utf-8"))
    names = set()
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Assign)
            and isinstance(node.value, ast.Call)
            and isinstance(node.value.func, ast.Name)
            and node.value.func.id == "get_seasonal_modifiers"
        ):
            names.update(t.id for t in node.targets if isinstance(t, ast.Name))
    keys = set()
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Subscript)
            and isinstance(node.value, ast.Name)
            and node.value.id in names
            and isinstance(node.slice, ast.Constant)
            and isinstance(node.slice.value, str)
        ):
            keys.add(node.slice.value)
        elif (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "get"
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id in names
            and node.args
            and isinstance(node.args[0], ast.Constant)
            and isinstance(node.args[0].value, str)
        ):
            keys.add(node.args[0].value)
    return keys


def test_the_modifiers_are_returned_for_a_date():
    modifiers = get_seasonal_modifiers(LEO_DAY)

    assert modifiers["current_zodiac"] == "Leo"
    assert modifiers["fire"] == ELEMENTAL_INGREDIENTS["Thermogenic"]
    assert modifiers["earth"] == modifiers["air"] == modifiers["water"] == []


def test_the_call_the_by_chart_handler_makes_returns_a_sign():
    # main.py calls it with no arguments.
    assert get_seasonal_modifiers()["current_zodiac"] in SIGNS


def test_the_planet_weight_is_the_planets_normalized_mass():
    assert get_seasonal_modifiers(LEO_DAY)["planet"] == "Sun"  # the default planet
    planets = ("Sun", "Jupiter", "Moon", "Pluto")
    weights = {p: get_seasonal_modifiers(LEO_DAY, planet=p)["planet_weight"] for p in planets}

    assert weights == {p: PLANET_MASS_NORMALIZED[p] for p in planets}
    assert len(set(weights.values())) == len(planets)  # not one constant for every planet
    assert weights["Sun"] == 1.0 and weights["Pluto"] == 0.0  # the ends of the 0-1 scale


def test_a_planet_with_no_recorded_mass_gets_the_helpers_documented_fallback():
    # planetary_weights.get_planet_weight: "Falls back to 0.5 (normalized)".
    assert get_seasonal_modifiers(LEO_DAY, planet="Chiron")["planet_weight"] == 0.5


def test_the_module_runs_as_a_script_through_its_fallback_import(tmp_path):
    # The module imports the weights twice: `try` as a package, `except ImportError` when it is
    # run directly. The tests above only ever take the first. `-I` leaves the repo root off
    # sys.path (no script directory, no PYTHONPATH), so `backend` fails to import and the
    # fallback branch has to supply every name the module uses.
    script = BACKEND / "utils" / "seasonal_engine.py"
    run = subprocess.run(
        [sys.executable, "-I", str(script)], capture_output=True, text=True, cwd=tmp_path, check=False
    )

    assert run.returncode == 0, run.stderr
    assert "Seasonal modifiers for today" in run.stdout


def test_every_key_a_caller_reads_is_returned():
    returned = set(get_seasonal_modifiers(LEO_DAY))
    read_by_the_handler = keys_read_from(CALLERS[0])

    # The scan must have found the handler's reads, or the check below proves nothing.
    assert read_by_the_handler >= {"current_zodiac", "fire", "earth", "air", "water"}
    for caller in CALLERS:
        keys = keys_read_from(caller)
        assert keys, f"found no read of get_seasonal_modifiers() in {caller.name}"
        assert keys <= returned, f"{caller.name} reads {sorted(keys - returned)}, which is not returned"
