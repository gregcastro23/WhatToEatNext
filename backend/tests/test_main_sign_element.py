"""An unrecognised sign has no element.

`backend/alchm_kitchen/main.py` is the module Railway serves. It read an
unrecognised sign as "Air" in three places, mirroring
`src/services/RealAlchemizeService.ts`: the 0.6 sign weight in
`calculate_local_alchemize`, the per-planet `signElement` in
`calculate_local_philosophers_stone`, and `metadata.chartRuler`. Both runtimes
now drop the sign weight, report `signElement` as null and omit `chartRuler`.
The per-planet loop also read a MISSING sign as Aries; it now skips the planet,
as `calculate_local_alchemize` already did.
The TypeScript half is pinned behaviourally in
src/__tests__/realAlchemizeUnknownSign.test.ts.

── How this tests it without importing it ──────────────────────────────────

Importing main.py pulls in fastapi/sqlalchemy/pyswisseph and CI installs only
pytest (see test_kalchm_parity.py:21-24), so this reads main.py's SOURCE and
inspects it with `ast`. Stdlib only.
"""
import ast
from pathlib import Path

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"

ALCHEMIZE_FUNCS = ("calculate_local_alchemize", "calculate_local_philosophers_stone")

SIGNS = {
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
}


def _zodiac_element_lookups():
    """Every `ZODIAC_ELEMENTS.get(...)` call in main.py."""
    for node in ast.walk(ast.parse(MAIN_PY.read_text())):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "get"
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "ZODIAC_ELEMENTS"
        ):
            yield node


def test_scan_finds_the_sign_element_lookups():
    # Witness: an empty scan would make the next test pass vacuously.
    assert len(list(_zodiac_element_lookups())) >= 3


def test_no_element_is_invented_for_an_unrecognised_sign():
    defaulted = [
        node.lineno
        for node in _zodiac_element_lookups()
        if len(node.args) > 1 or node.keywords
    ]
    assert defaulted == [], (
        f"ZODIAC_ELEMENTS.get(sign, <default>) at main.py lines {defaulted}: "
        "an unrecognised sign has no element; look it up without a default and "
        "skip the None."
    )


def _is_sign_literal(node):
    return isinstance(node, ast.Constant) and isinstance(node.value, str) and node.value.lower() in SIGNS


def _alchemize_functions():
    return [
        node
        for node in ast.parse(MAIN_PY.read_text()).body
        if isinstance(node, ast.FunctionDef) and node.name in ALCHEMIZE_FUNCS
    ]


def test_scan_finds_the_alchemize_functions():
    # Witness: a renamed function would make the next test pass vacuously.
    assert sorted(f.name for f in _alchemize_functions()) == sorted(ALCHEMIZE_FUNCS)


def test_a_missing_sign_is_not_read_as_a_real_sign():
    """No `x.get("sign", "Aries")` and no `... or "aries"`: absence is not Aries."""
    invented = []
    for node in (n for fn in _alchemize_functions() for n in ast.walk(fn)):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "get"
            and len(node.args) == 2
            and isinstance(node.args[0], ast.Constant)
            and node.args[0].value == "sign"
            and _is_sign_literal(node.args[1])
        ):
            invented.append(node.lineno)
        if isinstance(node, ast.BoolOp) and isinstance(node.op, ast.Or):
            invented.extend(v.lineno for v in node.values[1:] if _is_sign_literal(v))
    assert invented == [], f"main.py invents a sign for a missing one at lines {invented}"
