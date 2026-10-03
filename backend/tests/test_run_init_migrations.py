"""The deploy-time migration runner must apply a no-transaction migration that
comes first in the pending list.

`backend/scripts/run_init_migrations.py` runs before uvicorn on every Railway
deploy. It reads the `_migrations` ledger with a SELECT, which in psycopg2
opens a transaction, and did not end it. When the first pending file was a
`-- migrate:no-transaction` migration, switching the connection to autocommit
inside that open transaction raised "set_session cannot be used inside a
transaction". The container never became healthy: that is how migration 88
(`ALTER TYPE notification_type ADD VALUE`) failed the deploy of bbc5aab7.

CI installs only pytest, so psycopg2 is replaced by a fake connection that
enforces the same rule: autocommit can't change inside an open transaction.
"""
import importlib.util
import sys
import types
from pathlib import Path

import pytest

RUNNER = Path(__file__).resolve().parents[1] / "scripts" / "run_init_migrations.py"


class _ProgrammingError(Exception):
    pass


class _Cursor:
    def __init__(self, conn):
        self.conn = conn

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        return False

    def execute(self, sql, params=None):
        if not self.conn._autocommit:
            self.conn.in_transaction = True  # psycopg2 begins implicitly
        self.conn.log.append((" ".join(sql.split()), self.conn._autocommit))
        if params and "INSERT INTO _migrations" in sql:
            self.conn.applied.add(params[0])

    def fetchall(self):
        return [(name,) for name in sorted(self.conn.applied)]


class _Connection:
    def __init__(self, applied):
        self.applied = set(applied)
        self.in_transaction = False
        self._autocommit = False
        self.log = []

    @property
    def autocommit(self):
        return self._autocommit

    @autocommit.setter
    def autocommit(self, value):
        if self.in_transaction:
            raise _ProgrammingError("set_session cannot be used inside a transaction")
        self._autocommit = value

    def cursor(self):
        return _Cursor(self)

    def commit(self):
        self.in_transaction = False

    def rollback(self):
        self.in_transaction = False

    def close(self):
        pass


def _runner(monkeypatch, tmp_path, files, applied=()):
    """Load the runner against a fake psycopg2 and a migration dir of `files`."""
    conn = _Connection(applied)
    fake = types.ModuleType("psycopg2")
    fake.connect = lambda _url: conn
    monkeypatch.setitem(sys.modules, "psycopg2", fake)
    spec = importlib.util.spec_from_file_location("run_init_migrations_under_test", RUNNER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    for name, sql in files.items():
        (tmp_path / name).write_text(sql)
    monkeypatch.setattr(module, "INIT_DIR", tmp_path)
    monkeypatch.setenv("DATABASE_URL", "postgresql://fake")
    monkeypatch.setattr(sys, "argv", ["run_init_migrations"])
    return module, conn


NO_TXN = "-- migrate:no-transaction\nALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'agent_broadcast';\n"
TXN = "CREATE TABLE IF NOT EXISTS t (id int);\n"


def test_a_no_transaction_migration_first_in_line_is_applied(monkeypatch, tmp_path):
    # Migration 88's situation: everything before it applied, it alone pending.
    runner, conn = _runner(monkeypatch, tmp_path, {"88-enum.sql": NO_TXN}, applied={"87-x.sql"})
    assert runner.main() == 0
    assert "88-enum.sql" in conn.applied
    alter = [autocommit for sql, autocommit in conn.log if "ALTER TYPE" in sql]
    assert alter == [True]  # ran outside a transaction


def test_control_a_no_transaction_migration_after_a_transactional_one(monkeypatch, tmp_path):
    # The order that already worked: the transactional file's commit ends the read.
    files = {"01-table.sql": TXN, "02-enum.sql": NO_TXN}
    runner, conn = _runner(monkeypatch, tmp_path, files)
    assert runner.main() == 0
    assert {"01-table.sql", "02-enum.sql"} <= conn.applied


def test_control_nothing_pending(monkeypatch, tmp_path):
    runner, conn = _runner(monkeypatch, tmp_path, {"01-table.sql": TXN}, applied={"01-table.sql"})
    assert runner.main() == 0
    assert not any(sql.startswith("CREATE TABLE IF NOT EXISTS t") for sql, _ in conn.log)


def test_control_the_fake_enforces_psycopg2s_rule():
    # Witness: without this the first test could pass on a fake that allows anything.
    conn = _Connection(())
    conn.cursor().execute("SELECT 1")
    with pytest.raises(_ProgrammingError):
        conn.autocommit = True
