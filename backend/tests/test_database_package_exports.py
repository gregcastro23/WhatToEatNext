"""`backend.database` re-exports every ORM model by name.

`from .models import *` used to do it implicitly, and the undefined-name gate cannot see through a
star import, so it was replaced with an explicit list. An explicit list can silently omit a model
added later; this fails when `__init__.py` does not import and list each class `models.py` defines.
Standard library + pytest only (read with `ast`, nothing imported).
"""
import ast
from pathlib import Path

DATABASE = Path(__file__).resolve().parents[1] / "database"


def model_classes():
    tree = ast.parse((DATABASE / "models.py").read_text(encoding="utf-8"))
    return sorted(
        node.name for node in tree.body
        if isinstance(node, ast.ClassDef) and any(isinstance(b, ast.Name) and b.id == "Base" for b in node.bases)
    )


def package_tree():
    return ast.parse((DATABASE / "__init__.py").read_text(encoding="utf-8"))


def imported_from_models():
    return sorted(
        alias.name
        for node in package_tree().body
        if isinstance(node, ast.ImportFrom) and node.module == "models" and node.level == 1
        for alias in node.names
    )


def exported_names():
    for node in package_tree().body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "__all__" for t in node.targets):
            return sorted(e.value for e in node.value.elts if isinstance(e, ast.Constant))
    raise AssertionError("backend/database/__init__.py has no __all__")


def test_there_are_models_to_export():
    assert len(model_classes()) >= 19


def test_the_package_imports_each_model_by_name_and_never_with_a_star():
    assert imported_from_models() == model_classes()
    star = [a for n in package_tree().body if isinstance(n, ast.ImportFrom) for a in n.names if a.name == "*"]
    assert star == []


def test_the_package_lists_each_model_in___all__():
    assert set(model_classes()) <= set(exported_names())
