"""The URL DatabaseConfig hands to SQLAlchemy names psycopg2, whatever the input.

`test_sqlalchemy_url.py` pins the rewrite; this pins that `DatabaseConfig` applies
it to the URLs the validator actually produces (Railway's internal host, the
`postgres://` alias, Neon, and a URL built from parts).

It needs pydantic and pydantic-settings, at the versions in requirements.txt,
and nothing else: `backend/database/__init__.py` imports SQLAlchemy, redis and
the models, so config.py is loaded under a stand-in parent package that only
points at the directory.
"""
import importlib
import sys
import types
from pathlib import Path

import pytest

DATABASE_DIR = Path(__file__).resolve().parents[1] / "database"
PACKAGE = "database_under_test"

# Anything DatabaseConfig or its validator reads from the environment.
ENVIRONMENT = (
    "DATABASE_URL", "DATABASE_PUBLIC_URL", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER",
    "DB_PASSWORD", "DB_SSL", "RAILWAY_ENVIRONMENT", "PORT",
)


@pytest.fixture
def config_module(monkeypatch):
    for name in ENVIRONMENT:
        monkeypatch.delenv(name, raising=False)
    package = types.ModuleType(PACKAGE)
    package.__path__ = [str(DATABASE_DIR)]
    monkeypatch.setitem(sys.modules, PACKAGE, package)
    try:
        yield importlib.import_module(f"{PACKAGE}.config")
    finally:
        for name in (f"{PACKAGE}.config", f"{PACKAGE}.sqlalchemy_url"):
            sys.modules.pop(name, None)


def sqlalchemy_url(config_module, **settings):
    return config_module.DatabaseConfig(**settings).get_sqlalchemy_url()


def test_railway_internal_url_names_psycopg2(config_module):
    url = sqlalchemy_url(
        config_module,
        database_url="postgresql://postgres:pw@postgres.railway.internal:5432/railway",
    )
    assert url == "postgresql+psycopg2://postgres:pw@postgres.railway.internal:5432/railway"


def test_postgres_alias_names_psycopg2(config_module):
    # The validator turns postgres:// into postgresql://; the driver is named after.
    url = sqlalchemy_url(config_module, database_url="postgres://u:p@db.example.com:5432/d")
    assert url == "postgresql+psycopg2://u:p@db.example.com:5432/d"


def test_neon_url_keeps_its_ssl_requirement(config_module):
    url = sqlalchemy_url(config_module, database_url="postgres://u:p@ep-x.neon.tech/d")
    assert url == "postgresql+psycopg2://u:p@ep-x.neon.tech/d?sslmode=require"


def test_url_built_from_parts_names_psycopg2(config_module):
    url = sqlalchemy_url(
        config_module, db_host="h", db_port=5432, db_name="d", db_user="u", db_password="p"
    )
    assert url == "postgresql+psycopg2://u:p@h:5432/d"


def test_database_url_stays_a_plain_libpq_url(config_module):
    # Scripts hand `database_url` to psycopg2.connect, which rejects "+psycopg2".
    config = config_module.DatabaseConfig(database_url="postgres://u:p@h:5432/d")
    assert config.database_url == "postgresql://u:p@h:5432/d"


def test_no_url_is_still_empty(config_module):
    config = config_module.DatabaseConfig()
    config.database_url = ""  # assignment is not validated
    assert config.get_sqlalchemy_url() == ""
