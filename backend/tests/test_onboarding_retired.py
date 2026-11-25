"""AST regression check ensuring Python POST /api/user/onboarding stays retired."""
import ast
from pathlib import Path

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"


def test_python_onboarding_endpoint_is_retired():
    source = MAIN_PY.read_text(encoding="utf-8")
    tree = ast.parse(source)
    func_names = {
        node.name
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }
    assert "user_onboarding" not in func_names
    assert '"/api/user/onboarding"' not in source
