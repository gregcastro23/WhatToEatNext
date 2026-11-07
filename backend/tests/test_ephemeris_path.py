"""The Swiss Ephemeris path is set once, in backend/utils/ephemeris.py, and nothing resets it.

`swe.set_ephe_path` is process-wide: the path set last decides which ephemeris every later
`swe.calc_ut` and `swe.rise_trans` in the process reads. `get_optimal_cooking_windows`,
`get_transit_details` and two routes in main.py called `swe.set_ephe_path('')` on every use, and the
oracle set its own path when it was imported, so in a checkout that has the tracked sweph_ephe/
directory (development, CI; Railway does not upload it) the first transit or lunar query switched every
LATER chart from the Swiss Ephemeris files to the built-in Moshier ephemeris, a few arcseconds away
(Pluto up to 6.8 in 1800-2200). What a chart said depended on what had been asked before it.

The runtime tests watch which ephemeris actually serves a date, through the flag `swe.calc_ut` returns
(FLG_SWIEPH when the files served it, FLG_MOSEPH when Moshier did; pyswisseph has no getter for the
path), before and after each call that used to reset it. The static tests read every tracked
backend/*.py. Needs pyswisseph, astral, pytz and pydantic (the CI step installs them).
"""
import ast
import importlib
import subprocess
import sys
from pathlib import Path

import pytest
import swisseph as swe

import backend.utils.ephemeris as ephemeris
import backend.utils.lunar_oracle as lunar_oracle
import backend.utils.transit_engine as transit_engine

REPO = Path(__file__).resolve().parents[2]
THE_ONE_PLACE = "backend/utils/ephemeris.py"
ORACLE = "backend.utils.transmutation_oracle"

# The tracked files cover 1200-2399 CE: 2025 is served by them, 2600 falls back to Moshier.
INSIDE_THE_FILES = swe.julday(2025, 6, 21, 12.0)
BEYOND_THE_FILES = swe.julday(2600, 6, 21, 12.0)


def served_by(julian_day):
    flags = swe.calc_ut(julian_day, swe.SUN, swe.FLG_SWIEPH)[1]
    if flags & swe.FLG_SWIEPH:
        return "files"
    if flags & swe.FLG_MOSEPH:
        return "moshier"
    return f"flags {flags}"


@pytest.fixture
def configured():
    """The process as the app leaves it after import: pointed at the tracked sweph_ephe/, whatever the environment says."""
    original = ephemeris.EPHE_PATH
    ephemeris.EPHE_PATH = ephemeris.resolve_ephe_path({})
    ephemeris.configure()
    try:
        assert served_by(INSIDE_THE_FILES) == "files", (
            "the tracked sweph_ephe/ directory does not serve 2025: is it missing, or is ephemeris.DEFAULT_EPHE_DIR wrong?"
        )
        yield
    finally:
        ephemeris.EPHE_PATH = original
        ephemeris.configure()


# --- the path -----------------------------------------------------------------------------------

DIRECTORY = "/repo/sweph_ephe"


@pytest.mark.parametrize("environ,directory_exists,expected", [
    ({"SWISSEPH_PATH": "/data/ephe"}, True, "/data/ephe"),      # the override beats the directory ...
    ({"SWISSEPH_PATH": "/data/ephe"}, False, "/data/ephe"),
    ({"SWISSEPH_PATH": ""}, True, ""),                           # ... even when it is empty (the library's default path)
    ({}, True, DIRECTORY),                                       # the tracked directory
    ({}, False, "sweph_ephe"),                                   # no directory: the relative path celestial_calculations fell back to
])
def test_resolve_ephe_path(environ, directory_exists, expected):
    assert ephemeris.resolve_ephe_path(environ, DIRECTORY, lambda path: path == DIRECTORY and directory_exists) == expected


def test_the_default_directory_is_the_tracked_sweph_ephe():
    assert Path(ephemeris.DEFAULT_EPHE_DIR).resolve() == (REPO / "sweph_ephe").resolve()
    assert (REPO / "sweph_ephe" / "sepl_18.se1").is_file()


def test_the_configured_path_serves_the_dates_the_files_cover_and_moshier_the_rest(configured):
    assert served_by(INSIDE_THE_FILES) == "files"
    assert served_by(BEYOND_THE_FILES) == "moshier"


# --- nothing resets it --------------------------------------------------------------------------

QUERIES = {
    "get_transit_details": lambda: transit_engine.get_transit_details(),
    "get_optimal_cooking_windows": lambda: lunar_oracle.get_optimal_cooking_windows(days=2),
}


@pytest.mark.parametrize("query", sorted(QUERIES))
def test_a_query_does_not_change_the_ephemeris_the_next_chart_is_served_by(configured, query):
    before = swe.calc_ut(INSIDE_THE_FILES, swe.SUN, swe.FLG_SWIEPH)
    answer = QUERIES[query]()
    assert answer and "error" not in answer
    # the same longitude to the last bit, from the same ephemeris
    assert swe.calc_ut(INSIDE_THE_FILES, swe.SUN, swe.FLG_SWIEPH) == before
    assert served_by(INSIDE_THE_FILES) == "files"


def test_importing_the_oracle_does_not_set_the_path(configured, monkeypatch):
    # It used to read $SWISSEPH_PATH when it was imported and apply it, over whatever was set.
    monkeypatch.setenv("SWISSEPH_PATH", "/nonexistent/ephemeris")
    monkeypatch.delitem(sys.modules, ORACLE, raising=False)
    importlib.import_module(ORACLE)
    assert served_by(INSIDE_THE_FILES) == "files"


def test_the_oracle_still_cannot_be_imported_without_pyswisseph(monkeypatch):
    # Its first line used to be a bare `import swisseph`; taking swe from ephemeris.py must not make that optional.
    monkeypatch.setattr(ephemeris, "swe", None)
    monkeypatch.delitem(sys.modules, ORACLE, raising=False)
    with pytest.raises(ImportError, match="pyswisseph"):
        importlib.import_module(ORACLE)


# --- no other file names it ---------------------------------------------------------------------

def mentions_set_ephe_path(source):
    """Line numbers where `source` names set_ephe_path: as an attribute (swe.set_ephe_path), a bare name or an import."""
    lines = []
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, ast.Attribute) and node.attr == "set_ephe_path":
            lines.append(node.lineno)
        elif isinstance(node, ast.Name) and node.id == "set_ephe_path":
            lines.append(node.lineno)
        elif isinstance(node, ast.ImportFrom) and any(alias.name == "set_ephe_path" for alias in node.names):
            lines.append(node.lineno)
    return sorted(lines)


def module_level_imports_of_swisseph(source):
    """Line numbers of `import swisseph` / `from swisseph import ...` outside any function or class (try and if blocks count)."""
    lines = []

    def visit(statements):
        for node in statements:
            if isinstance(node, ast.Import) and any(alias.name == "swisseph" for alias in node.names):
                lines.append(node.lineno)
            elif isinstance(node, ast.ImportFrom) and node.module == "swisseph":
                lines.append(node.lineno)
            elif isinstance(node, (ast.Try, ast.If, ast.With)):
                for field in ("body", "orelse", "finalbody"):
                    visit(getattr(node, field, []))
                for handler in getattr(node, "handlers", []):
                    visit(handler.body)

    visit(ast.parse(source).body)
    return sorted(lines)


def imports_swe_from_the_one_place(source):
    return any(
        isinstance(node, ast.ImportFrom)
        and (node.module or "").split(".")[-1] == "ephemeris"
        and any(alias.name == "swe" for alias in node.names)
        for node in ast.walk(ast.parse(source))
    )


def tracked_backend_python():
    listing = subprocess.run(["git", "ls-files", "-z", "--", "backend/*.py"], cwd=REPO, capture_output=True, check=True).stdout
    return [path for path in listing.decode().split("\0") if path]


def test_only_the_ephemeris_module_names_set_ephe_path():
    found = {}
    for relative in tracked_backend_python():
        lines = mentions_set_ephe_path((REPO / relative).read_text(encoding="utf-8"))
        if lines:
            found[relative] = lines
    # Exactly the one place, and in it exactly once (configure()): were the scan blind, the one place would be missing too.
    assert set(found) == {THE_ONE_PLACE}, found
    assert len(found[THE_ONE_PLACE]) == 1, found


@pytest.mark.parametrize("source,lines", [
    ("import swisseph as swe\ndef f():\n    swe.set_ephe_path('')\n", [3]),
    ("from swisseph import set_ephe_path\n", [1]),
    ("from swisseph import set_ephe_path as reset\nreset('')\n", [1]),
    ("import swisseph\nreset = swisseph.set_ephe_path\n", [2]),
    ("note = 'swe.set_ephe_path(x)'\n# swe.set_ephe_path('')\nswe.set_sid_mode(1)\n", []),
])
def test_the_scan_sees_what_it_is_meant_to_see(source, lines):
    assert mentions_set_ephe_path(source) == lines


ENGINES = [
    "backend/utils/celestial_calculations.py",
    "backend/utils/lunar_oracle.py",
    "backend/utils/transit_engine.py",
    "backend/utils/transmutation_oracle.py",
    "backend/alchm_kitchen/main.py",
]


@pytest.mark.parametrize("engine", ENGINES)
def test_every_engine_takes_swe_from_the_one_place(engine):
    # So that the path is set before the library is used, whichever module a process imports first.
    source = (REPO / engine).read_text(encoding="utf-8")
    assert imports_swe_from_the_one_place(source), f"{engine} does not import swe from ephemeris.py"
    assert module_level_imports_of_swisseph(source) == [], f"{engine} imports swisseph itself at module level"


@pytest.mark.parametrize("source,imports_one_place,own_imports", [
    ("from backend.utils.ephemeris import swe\n", True, []),
    ("from ..utils.ephemeris import swe, EPHE_PATH\n", True, []),
    ("try:\n    import swisseph as swe\nexcept ImportError:\n    swe = None\n", False, [2]),
    ("import swisseph as swe\n", False, [1]),
    ("from swisseph import calc_ut\n", False, [1]),
    ("def f():\n    import swisseph as swe\n", False, []),  # inside a function it cannot run before the module's own imports
    ("from backend.utils.ephemeris import EPHE_PATH\n", False, []),
])
def test_the_engine_scan_sees_what_it_is_meant_to_see(source, imports_one_place, own_imports):
    assert imports_swe_from_the_one_place(source) is imports_one_place
    assert module_level_imports_of_swisseph(source) == own_imports


def test_the_lists_the_scan_reads_are_not_empty():
    # a scan that lists nothing proves nothing
    tracked = tracked_backend_python()
    assert THE_ONE_PLACE in tracked
    assert all(engine in tracked for engine in ENGINES)
    assert len(tracked) > 30
