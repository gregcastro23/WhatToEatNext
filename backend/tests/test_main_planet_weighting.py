"""The weighting the DEPLOYED FastAPI server actually uses.

`backend/alchm_kitchen/main.py` is the module Railway serves (Procfile:
`uvicorn backend.alchm_kitchen.main:app`). It carries its own INLINE copy of the
orbital-period weight table — the same table PR #697 deleted from
`backend/utils/planetary_alchemy.py` — and until this file existed, **nothing
tested it**. `test_kalchm_parity.py:21-24` explains why: importing
`backend.alchm_kitchen.main` pulls in fastapi/sqlalchemy/pyswisseph, and CI
installs only pytest, so a suite that imports it could not be COLLECTED at all.

That left the riskiest surface in the physics stack with the opposite failure
mode from everything around it: nothing would break when it moved, and nothing
would say it had moved.

── How this tests it without importing it ──────────────────────────────────

The weighting is a pure table plus a pure function with no imports beyond
`math`. So instead of importing the app, this reads main.py's SOURCE, pulls out
exactly those definitions with `ast`, and executes them in an isolated
namespace. That is the real source, not a transcription — a copy here is
precisely how `main.py` and `planetary_alchemy.py` drifted apart in the first
place. Requires only the stdlib, so it runs under CI's pytest-only install.

── What this pins, and why the numbers look "wrong" ────────────────────────

It pins the period scale **as it is deployed today**, including the parts
ADR-009 rules to be defects (Pluto heaviest, Sun at half of Pluto). That is
deliberate and is the same device as the `normalizePlanetWeight` positive
controls in `esmsConformance.test.ts`: pinning the current, wrong behaviour is
what makes changing it VISIBLE instead of silent.

**ADR-009 decision 4 will make this file fail.** That is the intended signal,
not a regression. The migration PR flips `EXPECTED_SCALE` to "inertial" and the
assertions follow. If you are reading this because CI went red on a scale
change: good — that is the gate doing the one job it was written for.
"""
import ast
import math
from pathlib import Path

import pytest

from backend.utils.planetary_alchemy import get_inertial_mass_weight

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"

# Flip to "inertial" in the ADR-009 decision-4 PR, together with main.py itself.
EXPECTED_SCALE = "period"

WEIGHTING_NAMES = {"PLANET_ALCHM_PERIODS", "PERIOD_LOG_MIN", "PERIOD_LOG_MAX"}
WEIGHTING_FUNCS = {"normalize_alchm_weight"}


def _extract_weighting():
    """Execute ONLY the weighting definitions out of main.py's real source."""
    tree = ast.parse(MAIN_PY.read_text())
    wanted = []
    for node in tree.body:
        if isinstance(node, ast.Assign):
            names = {t.id for t in node.targets if isinstance(t, ast.Name)}
            if names & WEIGHTING_NAMES:
                wanted.append(node)
        elif isinstance(node, ast.FunctionDef) and node.name in WEIGHTING_FUNCS:
            wanted.append(node)
    ns = {"math": math}
    exec(compile(ast.Module(body=wanted, type_ignores=[]), str(MAIN_PY), "exec"), ns)
    return ns


@pytest.fixture(scope="module")
def weighting():
    return _extract_weighting()


def test_the_weighting_definitions_are_still_where_we_think(weighting):
    """POSITIVE CONTROL on the extractor itself.

    Everything below reads whatever this pulled out of main.py. If a rename or a
    move made the extractor find nothing, every other assertion would vacuously
    pass against an empty namespace — a green suite proving nothing, which is the
    exact failure this file was written to end.
    """
    for name in WEIGHTING_NAMES | WEIGHTING_FUNCS:
        assert name in weighting, f"{name} not found in {MAIN_PY.name} — extractor is stale"
    assert len(weighting["PLANET_ALCHM_PERIODS"]) == 11


def test_the_extracted_weighting_is_actually_called_by_the_server(weighting):
    """A definition nobody calls would pin nothing. Prove the call sites exist."""
    tree = ast.parse(MAIN_PY.read_text())
    calls = [
        n
        for n in ast.walk(tree)
        if isinstance(n, ast.Call)
        and isinstance(n.func, ast.Name)
        and n.func.id == "normalize_alchm_weight"
    ]
    # calculate_local_alchemize and calculate_local_philosophers_stone.
    assert len(calls) >= 2, f"expected >=2 live call sites, found {len(calls)}"


@pytest.mark.skipif(EXPECTED_SCALE != "period", reason="migrated to the inertial scale")
def test_deployed_server_still_runs_the_orbital_period_scale(weighting):
    """The divergence ADR-009 exists to remove, pinned so it cannot move quietly.

    MEASURED against production 2026-08-01 at deployed SHA a2425ca6: the live
    /api/philosophers-stone/positions response returns exactly these values in
    its per-planet `alchmWeight` field.
    """
    w = lambda p: weighting["normalize_alchm_weight"](weighting["PLANET_ALCHM_PERIODS"][p])

    assert w("Pluto") == pytest.approx(1.0, abs=1e-12)
    assert w("Sun") == pytest.approx(0.5130695808579581, abs=1e-12)
    assert w("Moon") == pytest.approx(0.2842944773527886, abs=1e-9)

    # Pluto is the HEAVIEST body on this scale and the Sun barely half of it.
    # Inverted against every other engine in the repo; that is the defect.
    assert w("Pluto") > w("Sun")
    assert w("Sun") / w("Pluto") == pytest.approx(0.513, abs=1e-3)


@pytest.mark.skipif(EXPECTED_SCALE != "period", reason="migrated to the inertial scale")
def test_the_two_python_scales_disagree_and_by_how_much(weighting):
    """Both scales live in the same deployed process, split by endpoint.

    /alchemize and /philosophers-stone use the inline period table; /api/user/
    onboarding imports the inertial one. This pins the size of the gap so the
    migration's effect is a known quantity rather than a surprise.
    """
    w = lambda p: weighting["normalize_alchm_weight"](weighting["PLANET_ALCHM_PERIODS"][p])

    period_ratio = w("Sun") / w("Pluto")
    inertial_ratio = get_inertial_mass_weight("Sun") / get_inertial_mass_weight("Pluto")

    assert period_ratio == pytest.approx(0.513, abs=1e-3)
    assert inertial_ratio == pytest.approx(9.180, abs=1e-3)
    # ~17.9x apart, and rank-inverted: the scales disagree about which body in
    # the chart is heaviest, not merely by how much.
    assert inertial_ratio / period_ratio == pytest.approx(17.9, abs=0.1)


@pytest.mark.skipif(EXPECTED_SCALE != "inertial", reason="still on the period scale")
def test_deployed_server_runs_the_inertial_scale(weighting):
    """Post-migration shape. Inert until EXPECTED_SCALE flips, by design.

    Written now, with decision 4, so the migration PR has a green target to aim
    at rather than inventing its own assertions after the fact.
    """
    for body in ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
                 "Uranus", "Neptune", "Pluto"):
        assert weighting["weight_for"](body) == pytest.approx(
            get_inertial_mass_weight(body), abs=1e-12
        ), f"{body} does not match the canonical inertial scale"
    assert weighting["weight_for"]("Sun") == 1.0
    assert weighting["weight_for"]("Pluto") > 0.1  # no body is annihilated
