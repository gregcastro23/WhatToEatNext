"""The database URL as SQLAlchemy should read it: with the driver named.

A bare ``postgresql://`` URL leaves the choice of driver to SQLAlchemy, and the
choice changed between releases: 2.0 picks psycopg2, 2.1 picks psycopg (v3).
This service installs psycopg2 and nothing else (backend/requirements.txt). Once
an image build resolved SQLAlchemy 2.1, ``create_engine`` raised
``No module named 'psycopg'`` and every route that takes a database session
answered 500.

Naming the driver makes the URL mean the same thing under every SQLAlchemy
release. A URL that already names one (``postgresql+asyncpg://``) is the
caller's choice and is left alone.

No framework imports, on purpose: backend/tests/test_sqlalchemy_url.py loads
this file on a bare Python.
"""
import re

DRIVER = "psycopg2"

# `postgres://` is the alias some platforms hand out; `postgresql://` is the
# canonical scheme. Neither names a driver, so both get one.
_UNQUALIFIED_POSTGRES = re.compile(r"^postgres(?:ql)?://")


def with_psycopg2_driver(url: str) -> str:
    """`url` with the psycopg2 driver named, when it names none.

    Only the scheme changes: credentials, host, path and query string are
    returned exactly as given. Anything that is not a plain PostgreSQL URL
    (``sqlite:///``, ``postgresql+asyncpg://``, an empty string) is returned
    unchanged.
    """
    return _UNQUALIFIED_POSTGRES.sub(f"postgresql+{DRIVER}://", url, count=1)
