"""A bare postgresql:// URL must reach SQLAlchemy with its driver named.

SQLAlchemy 2.1 changed the driver a bare `postgresql://` URL selects, from
psycopg2 to psycopg (v3). The service installs psycopg2 only, so once an image
build resolved 2.1 `create_engine` raised "No module named 'psycopg'", every
route that takes a database session answered 500, and /health still answered
200 (it reports the database as "offline" in a body nobody reads).

`backend/database/sqlalchemy_url.py` imports nothing but `re`, so this runs on a
bare Python with pytest alone, like the other deployed-server tests here.
"""
import importlib.util
import re
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parents[1]


def _load():
    path = BACKEND / "database" / "sqlalchemy_url.py"
    spec = importlib.util.spec_from_file_location("sqlalchemy_url_under_test", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_module = _load()
with_psycopg2_driver = _module.with_psycopg2_driver


@pytest.mark.parametrize(
    "given, expected",
    [
        # The canonical scheme, as Railway's DATABASE_URL arrives.
        (
            "postgresql://postgres:pw@postgres.railway.internal:5432/railway",
            "postgresql+psycopg2://postgres:pw@postgres.railway.internal:5432/railway",
        ),
        # The alias some platforms hand out.
        ("postgres://u:p@h:5432/d", "postgresql+psycopg2://u:p@h:5432/d"),
        # Credentials and query string are carried untouched.
        (
            "postgresql://u:p%40ss@h:5432/d?sslmode=require&application_name=a",
            "postgresql+psycopg2://u:p%40ss@h:5432/d?sslmode=require&application_name=a",
        ),
    ],
)
def test_a_bare_postgres_url_names_psycopg2(given, expected):
    assert with_psycopg2_driver(given) == expected


@pytest.mark.parametrize(
    "url",
    [
        "postgresql+psycopg2://u:p@h/d",  # already says so
        "postgresql+asyncpg://u:p@h/d",  # a caller's other choice stands
        "postgresql+psycopg://u:p@h/d",
        "sqlite:///:memory:",  # not PostgreSQL
        "",  # nothing configured
    ],
)
def test_a_url_that_names_a_driver_or_is_not_postgres_is_unchanged(url):
    assert with_psycopg2_driver(url) == url


def test_only_the_scheme_is_rewritten():
    url = "postgresql://u:p@h/d?options=postgresql://other"
    assert with_psycopg2_driver(url) == "postgresql+psycopg2://u:p@h/d?options=postgresql://other"


def test_the_driver_it_names_is_a_declared_dependency():
    """The URL names psycopg2, so the image has to install it."""
    declared = set()
    for line in (BACKEND / "requirements.txt").read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            declared.add(re.split(r"[\[<>=!~ ;]", line, maxsplit=1)[0].lower().replace("_", "-"))
    driver = _module.DRIVER
    assert driver in declared or f"{driver}-binary" in declared
