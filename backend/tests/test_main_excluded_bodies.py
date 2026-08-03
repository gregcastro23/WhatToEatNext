"""Abstract geometric points must not contribute mass or element.

`backend/alchm_kitchen/main.py` is the module Railway serves. It had no
exclusion gate at all, while `src/services/RealAlchemizeService.ts` has had one
for months — so every /alchemize and /api/philosophers-stone/positions response
blended North Node, South Node and MC into its elemental totals as if they were
bodies. Same divergence class as ADR-009 decision 4: a fix landed on one runtime
and the served module on the other kept the old behaviour.

── What was actually wrong ─────────────────────────────────────────────────

NOT the mass. Their ESMS was already exactly 0.0, because PLANETARY_ALCHEMY has
no entry for them and the ESMS sum sits behind `if alchemy:`. The elemental
lines are the unguarded ones, and they are also UNWEIGHTED — a flat 0.6 + 0.4
that never reads alchm_weight. So assigning these bodies a weight of 0.0 would
have fixed nothing: the distortion does not read the weight. Only the gate does.

The 0.4 is the worse half: get_planetary_sect_element returns "Air" for unknown
bodies, so each phantom pushed 0.4 of pure Air, which is why Air moves most
(-3.51pp) when they are removed.

── How this tests it without importing it ──────────────────────────────────

Importing main.py pulls in fastapi/sqlalchemy/pyswisseph and CI installs only
pytest (see test_kalchm_parity.py:21-24), so this reads main.py's SOURCE and
inspects it with `ast`. The gate itself is pure stdlib — a frozenset and string
ops — so it is EXTRACTED AND EXECUTED for the behavioural tests below.
"""
import ast
import re
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
MAIN_PY = REPO / "backend" / "alchm_kitchen" / "main.py"
TS_SERVICE = REPO / "src" / "utils" / "planetaryAlchemyMapping.ts"

WEIGHTED_FUNCS = ("calculate_local_alchemize", "calculate_local_philosophers_stone")


def _tree():
    return ast.parse(MAIN_PY.read_text())


def _extract_gate():
    """Execute ONLY the gate definitions out of main.py's real source."""
    wanted = []
    for node in _tree().body:
        if isinstance(node, ast.Assign):
            names = {t.id for t in node.targets if isinstance(t, ast.Name)}
            if "EXCLUDED_ASPECT_BODIES" in names:
                wanted.append(node)
        elif isinstance(node, ast.FunctionDef) and node.name == "is_excluded_aspect_body":
            wanted.append(node)
    assert len(wanted) == 2, f"expected the set and the predicate, found {len(wanted)}"
    ns = {"frozenset": frozenset}
    exec(compile(ast.Module(body=wanted, type_ignores=[]), str(MAIN_PY), "exec"), ns)
    return ns


def _func(name):
    for node in _tree().body:
        if isinstance(node, ast.FunctionDef) and node.name == name:
            return node
    raise AssertionError(f"{name} not found in main.py")


def test_main_py_parses_and_the_targets_exist():
    """POSITIVE CONTROL for every assertion below — they all read this one file.

    If the path were wrong or the parse empty, the structural assertions would
    pass vacuously against nothing.
    """
    tree = _tree()
    assert len(tree.body) > 100, "main.py parsed to almost nothing — path or parse is wrong"
    for name in WEIGHTED_FUNCS:
        assert _func(name) is not None


# ── The gate's behaviour ────────────────────────────────────────────────────


def test_the_gate_matches_every_spelling_the_backend_can_emit():
    is_excluded = _extract_gate()["is_excluded_aspect_body"]
    # The Swiss-Ephemeris backend emits node keys WITH a space; other callers
    # use the squashed form. Both must match, in any case.
    for spelling in [
        "North Node", "NorthNode", "north node", "NORTHNODE",
        "South Node", "SouthNode",
        "True Node", "Mean Node", "MC", "mc",
        "Chiron", "Lilith", "Vertex", "Pars Fortune", "ParsFortune",
    ]:
        assert is_excluded(spelling), f"{spelling!r} should be excluded"


def test_the_gate_does_NOT_swallow_real_bodies():
    """The failure mode that would be far worse than the bug being fixed."""
    is_excluded = _extract_gate()["is_excluded_aspect_body"]
    for planet in [
        "Sun", "Moon", "Mercury", "Venus", "Mars",
        "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant",
    ]:
        assert not is_excluded(planet), f"{planet!r} must NOT be excluded"


def test_the_python_set_is_IDENTICAL_to_the_typescript_one():
    """The parity check that would have caught this divergence.

    TypeScript gated these bodies and Python did not, and nothing compared the
    two. Membership is asserted equal, not merely overlapping, so adding an
    entry on one side alone fails here.
    """
    ts_src = TS_SERVICE.read_text()
    block = re.search(
        r"EXCLUDED_ASPECT_BODIES[^=]*=\s*new Set\(\[(.*?)\]\)", ts_src, re.S
    )
    assert block, "could not find EXCLUDED_ASPECT_BODIES in planetaryAlchemyMapping.ts"
    ts_set = set(re.findall(r'"([^"]+)"', block.group(1)))
    # POSITIVE CONTROL — a regex that silently matched nothing would make the
    # comparison below trivially true against two empty sets.
    assert len(ts_set) >= 5, f"TS set parsed to {ts_set} — the regex is stale"

    py_set = set(_extract_gate()["EXCLUDED_ASPECT_BODIES"])
    assert py_set == ts_set, (
        f"runtimes disagree — only in Python: {sorted(py_set - ts_set)}; "
        f"only in TypeScript: {sorted(ts_set - py_set)}"
    )


# ── The gate's placement ────────────────────────────────────────────────────


@pytest.mark.parametrize("func_name", WEIGHTED_FUNCS)
def test_the_gate_runs_BEFORE_the_unguarded_elemental_blend(func_name):
    """Order is the whole fix.

    The ESMS sum is already guarded by `if alchemy:`, so a gate placed after the
    elemental lines would look correct, pass any ESMS assertion, and still leak
    0.4 of pure Air per phantom body into the totals. Asserted by line number
    rather than by presence.
    """
    fn = _func(func_name)

    gate_lines = [
        n.lineno
        for n in ast.walk(fn)
        if isinstance(n, ast.Call)
        and isinstance(n.func, ast.Name)
        and n.func.id == "is_excluded_aspect_body"
    ]
    assert len(gate_lines) == 1, f"{func_name}: expected exactly one gate, got {len(gate_lines)}"

    # The elemental blend: the augmented assignments adding the 0.6/0.4 split.
    blend_lines = [
        n.lineno
        for n in ast.walk(fn)
        if isinstance(n, ast.AugAssign)
        and isinstance(n.op, ast.Add)
        and isinstance(n.value, ast.Constant)
        and n.value.value in (0.6, 0.4)
    ]
    assert len(blend_lines) == 2, f"{func_name}: expected the 0.6/0.4 pair, got {blend_lines}"

    assert gate_lines[0] < min(blend_lines), (
        f"{func_name}: gate at line {gate_lines[0]} runs AFTER the elemental "
        f"blend at {min(blend_lines)} — phantom bodies still reach the totals"
    )


@pytest.mark.parametrize("func_name", WEIGHTED_FUNCS)
def test_the_gate_precedes_the_weight_lookup_too(func_name):
    """So an excluded body never even reaches get_inertial_mass_weight, whose
    unknown-body fallback silently returns Earth's mass (0.3984)."""
    fn = _func(func_name)
    gate = [
        n.lineno for n in ast.walk(fn)
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)
        and n.func.id == "is_excluded_aspect_body"
    ]
    weight = [
        n.lineno for n in ast.walk(fn)
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)
        and n.func.id == "get_inertial_mass_weight"
    ]
    assert gate and weight
    assert gate[0] < min(weight)
