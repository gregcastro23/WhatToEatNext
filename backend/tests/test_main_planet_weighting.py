"""The weighting the DEPLOYED FastAPI server actually uses.

`backend/alchm_kitchen/main.py` is the module Railway serves (Procfile:
`uvicorn backend.alchm_kitchen.main:app`). Until this file existed, **nothing
tested it**: `test_kalchm_parity.py:21-24` explains why — importing
`backend.alchm_kitchen.main` pulls in fastapi/sqlalchemy/pyswisseph, and CI
installs only pytest, so a suite that imports it could not be COLLECTED at all.

That left the riskiest surface in the physics stack with the opposite failure
mode from everything around it: nothing would break when it moved, and nothing
would say it had moved.

── How this tests it without importing it ──────────────────────────────────

It reads main.py's SOURCE and inspects it with `ast`. Under the period scale it
also EXECUTED the extracted table and normalizer in an isolated namespace, which
is how it pinned exact weights with no framework installed. After ADR-009
decision 4 there is no local weighting left to execute — that is the whole point
of the migration — so the inertial-mode tests assert the SHAPE of the wiring
instead: the table is gone, the canonical function is imported at module level,
and both call sites use it. Stdlib only either way.

── EXPECTED_SCALE ──────────────────────────────────────────────────────────

Was "period" while main.py carried its own inline orbital-period table; flipped
to "inertial" by the decision-4 PR together with main.py itself. The period-mode
tests stay in the file, skipped, because they record what the deployed server
used to do and what a regression back to it would look like.
"""
import ast
import math
from pathlib import Path

import pytest

from backend.utils.planetary_alchemy import get_inertial_mass_weight

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"

EXPECTED_SCALE = "inertial"

WEIGHTING_NAMES = {"PLANET_ALCHM_PERIODS", "PERIOD_LOG_MIN", "PERIOD_LOG_MAX"}
WEIGHTING_FUNCS = {"normalize_alchm_weight"}

period_only = pytest.mark.skipif(
    EXPECTED_SCALE != "period", reason="migrated to the inertial scale (decision 4)"
)
inertial_only = pytest.mark.skipif(
    EXPECTED_SCALE != "inertial", reason="still on the orbital-period scale"
)


def _tree():
    return ast.parse(MAIN_PY.read_text())


def _extract_weighting():
    """Execute ONLY the weighting definitions out of main.py's real source."""
    wanted = []
    for node in _tree().body:
        if isinstance(node, ast.Assign):
            names = {t.id for t in node.targets if isinstance(t, ast.Name)}
            if names & WEIGHTING_NAMES:
                wanted.append(node)
        elif isinstance(node, ast.FunctionDef) and node.name in WEIGHTING_FUNCS:
            wanted.append(node)
    ns = {"math": math}
    exec(compile(ast.Module(body=wanted, type_ignores=[]), str(MAIN_PY), "exec"), ns)
    return ns


def _calls_to(name):
    return [
        n
        for n in ast.walk(_tree())
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == name
    ]


def test_main_py_parses_and_is_substantial():
    """POSITIVE CONTROL for every AST assertion below.

    They all read this one file. If the path were wrong or the parse empty, the
    absence assertions would pass vacuously against nothing — a green suite
    proving nothing, which is the exact failure this file exists to end.
    """
    tree = _tree()
    assert len(tree.body) > 100, "main.py parsed to almost nothing — path or parse is wrong"
    assert any(
        isinstance(n, ast.FunctionDef) and n.name == "calculate_local_alchemize"
        for n in tree.body
    ), "calculate_local_alchemize not found — the weighting consumer moved"


# ── Post-migration: the inertial scale ──────────────────────────────────────


@inertial_only
def test_the_inline_period_table_is_gone():
    """The defect decision 4 removed: main.py's private copy of the table PR
    #697 deleted from backend/utils/. A re-added copy is exactly how the two
    runtimes drifted apart in the first place."""
    module_names = set()
    for node in _tree().body:
        if isinstance(node, ast.Assign):
            module_names |= {t.id for t in node.targets if isinstance(t, ast.Name)}
        elif isinstance(node, ast.FunctionDef):
            module_names.add(node.name)
    leftovers = module_names & (WEIGHTING_NAMES | WEIGHTING_FUNCS)
    assert not leftovers, f"period-scale definitions still in main.py: {sorted(leftovers)}"
    assert not _calls_to("normalize_alchm_weight")


@inertial_only
def test_the_canonical_weight_is_imported_at_MODULE_level():
    """Pinned because the nested version of this import nearly shipped.

    main.py imports `calculate_natal_alchemical_quantities` INSIDE a route
    handler. An import of get_inertial_mass_weight placed beside it would be
    invisible at the two call sites 300+ lines below, and every request to
    /alchemize and /philosophers-stone would raise NameError at runtime — while
    every source-reading test in this file still passed, because the text is
    present either way. Only the SCOPE tells them apart, so the scope is what is
    asserted: `.body`, never `ast.walk`.
    """
    module_level = [
        n
        for n in _tree().body  # module scope ONLY — ast.walk would also match nested
        if isinstance(n, ast.ImportFrom)
        and n.module == "backend.utils.planetary_alchemy"
        and any(a.name == "get_inertial_mass_weight" for a in n.names)
    ]
    assert len(module_level) == 1, "get_inertial_mass_weight must be imported at module level"


@inertial_only
def test_both_weighting_call_sites_use_the_canonical_function():
    """calculate_local_alchemize and calculate_local_philosophers_stone."""
    calls = _calls_to("get_inertial_mass_weight")
    assert len(calls) >= 2, f"expected >=2 call sites, found {len(calls)}"


@inertial_only
def test_the_served_weights_now_match_the_canonical_scale():
    """The point of the migration: both Python endpoints finally share one
    scale, and Pluto is no longer the heaviest body in every chart."""
    assert get_inertial_mass_weight("Sun") == 1.0
    assert get_inertial_mass_weight("Pluto") > 0.1  # not annihilated
    assert get_inertial_mass_weight("Sun") > get_inertial_mass_weight("Pluto")
    assert get_inertial_mass_weight("Sun") / get_inertial_mass_weight("Pluto") == pytest.approx(
        9.180, abs=1e-3
    )
    # The Ascendant is the RULED vessel weight, not an orbiting body.
    assert get_inertial_mass_weight("Ascendant") == 1.0


# ── Pre-migration: kept, skipped, as the regression record ──────────────────


@period_only
def test_the_weighting_definitions_are_still_where_we_think():
    weighting = _extract_weighting()
    for name in WEIGHTING_NAMES | WEIGHTING_FUNCS:
        assert name in weighting, f"{name} not found — extractor is stale"
    assert len(weighting["PLANET_ALCHM_PERIODS"]) == 11


@period_only
def test_deployed_server_still_runs_the_orbital_period_scale():
    """MEASURED against production 2026-08-01 at deployed SHA a2425ca6: the live
    /api/philosophers-stone/positions response returned exactly these values in
    its per-planet `alchmWeight` field."""
    weighting = _extract_weighting()
    w = lambda p: weighting["normalize_alchm_weight"](weighting["PLANET_ALCHM_PERIODS"][p])
    assert w("Pluto") == pytest.approx(1.0, abs=1e-12)
    assert w("Sun") == pytest.approx(0.5130695808579581, abs=1e-12)
    assert w("Pluto") > w("Sun")  # inverted against every other engine
    assert w("Sun") / w("Pluto") == pytest.approx(0.513, abs=1e-3)
