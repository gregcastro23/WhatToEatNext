// End-to-end behaviour of the economy statements, against production, in a
// transaction that is ALWAYS rolled back.
//
// ── Why this exists alongside the PREPARE gate ──────────────────────────────
//
// `checkEconomySqlParses.ts` proves each statement is LEGAL. It cannot prove it
// is CORRECT. An upsert-shaped debit prepares perfectly and drives a missing
// balance to -25.0000; only running it reveals that. So: PREPARE for legality,
// this for semantics.
//
// Statements come from `src/services/tokenEconomyQueries.ts` by IMPORT, so this
// exercises exactly what ships rather than a hand copy that can drift.
//
//   railway run --service Postgres -- bun scripts/checkEconomyStatementBehaviour.mjs
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";
import {
  creditTokensSql,
  debitAllTokensSql,
  debitTokensSql,
  getBalancesSql,
  transmuteSql,
} from "../src/services/tokenEconomyQueries.ts";

const c = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

let bad = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const no = (m) => {
  console.error(`  FAIL ${m}`);
  bad++;
};

// A deliberately-failing statement (a 23505 probe) aborts the surrounding
// transaction, so every such case runs inside its own savepoint.
const attempt = async (fn) => {
  const sp = `sp_${randomUUID().replace(/-/g, "")}`;
  await c.query(`SAVEPOINT ${sp}`);
  try {
    const value = await fn();
    await c.query(`RELEASE SAVEPOINT ${sp}`);
    return { ok: true, value };
  } catch (error) {
    await c.query(`ROLLBACK TO SAVEPOINT ${sp}`);
    return { ok: false, error };
  }
};

const mkUser = async (label) => {
  const id = randomUUID();
  await c.query(
    `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, is_agent,
                        name, profile, preferences, login_count, created_at, updated_at)
     VALUES ($1,$2,'NO_LOGIN','USER'::user_role,true,true,false,$3,'{}'::jsonb,'{}'::jsonb,0,now(),now())`,
    [id, `econ-${id}@example.invalid`, label],
  );
  return id;
};

/** A funded user: every axis credited to `amount`. */
const mkFundedUser = async (label, amount = 100) => {
  const id = await mkUser(label);
  for (const tokenType of ["Spirit", "Essence", "Matter", "Substance"]) {
    const q = creditTokensSql({
      userId: id,
      tokenType,
      amount,
      sourceType: "signup_grant",
      sourceId: null,
      description: "probe funding",
      transactionGroupId: randomUUID(),
      idempotencyKey: `fund:${id}:${tokenType}`,
    });
    await c.query(q.sql, q.values);
  }
  return id;
};

const balances = async (id) => {
  const r = await c.query(
    `SELECT spirit, essence, matter, substance FROM token_balances WHERE user_id=$1`,
    [id],
  );
  if (!r.rows.length) return null;
  const b = r.rows[0];
  return {
    spirit: Number(b.spirit),
    essence: Number(b.essence),
    matter: Number(b.matter),
    substance: Number(b.substance),
  };
};
const spirit = async (id) => (await balances(id))?.spirit ?? null;
const ledgerCount = async (id) =>
  Number(
    (
      await c.query(
        `SELECT count(*) n FROM token_transactions WHERE user_id=$1`,
        [id],
      )
    ).rows[0].n,
  );
const purchaseCount = async (id) =>
  Number(
    (
      await c.query(`SELECT count(*) n FROM user_purchases WHERE user_id=$1`, [
        id,
      ])
    ).rows[0].n,
  );

const same = (a, b) =>
  a && b && ["spirit", "essence", "matter", "substance"].every((k) => a[k] === b[k]);

// The four axes' amounts for a multi-axis spend.
const COST = { spirit: 1, essence: 2, matter: 3, substance: 4 };

try {
  await c.query("BEGIN");

  // ── Control: this script can actually observe a failure ──────────────────
  // Without it, a run where every assertion silently short-circuits would print
  // PASS. Deliberately assert something false and confirm the counter moves.
  {
    const before = bad;
    no("control: this line MUST be counted as a failure");
    if (bad === before + 1) {
      bad = before;
      console.log("  ok   control: a failed assertion is counted (reset)");
    } else {
      console.error("  CONTROL BROKEN: a failure was not counted");
      process.exit(1);
    }
  }

  // ── getBalances ──────────────────────────────────────────────────────────
  console.log("\ngetBalances (single statement, insert-or-return)");
  const u = await mkUser("econ probe");
  const getBal = getBalancesSql(u);
  const first = await c.query(getBal.sql, getBal.values);
  first.rows.length === 1 && Number(first.rows[0].spirit) === 0
    ? ok("creates the row and RETURNS it (spirit 0)")
    : no(`returned ${first.rows.length} rows / spirit ${first.rows[0]?.spirit}`);
  const second = await c.query(getBal.sql, getBal.values);
  second.rows.length === 1
    ? ok("second call returns the SAME row — the DO NOTHING/RETURNING gap is closed")
    : no(`re-read returned ${second.rows.length} rows`);

  // ── single-axis credit then debit ────────────────────────────────────────
  console.log("\ncredit then debit (single axis)");
  const creditQ = creditTokensSql({
    userId: u, tokenType: "Spirit", amount: 10, sourceType: "signup_grant",
    sourceId: null, description: "probe", transactionGroupId: randomUUID(),
    idempotencyKey: `p:${u}:1`,
  });
  await c.query(creditQ.sql, creditQ.values);
  (await spirit(u)) === 10 ? ok("credit of 10 applied") : no(`balance ${await spirit(u)} after credit`);

  const debitQ = debitTokensSql({
    userId: u, tokenType: "Spirit", amount: 4, sourceType: "recipe_ingestion",
    sourceId: null, transactionGroupId: randomUUID(), description: "probe debit",
  });
  const d1 = await c.query(debitQ.sql, debitQ.values);
  d1.rowCount === 1 && (await spirit(u)) === 6
    ? ok("debit of 4 applied — balance 6")
    : no(`debit returned ${d1.rowCount} rows, balance ${await spirit(u)}`);

  const overQ1 = debitTokensSql({
    userId: u, tokenType: "Spirit", amount: 100, sourceType: "recipe_ingestion",
    sourceId: null, transactionGroupId: randomUUID(), description: "overdraw",
  });
  const d2 = await c.query(overQ1.sql, overQ1.values);
  d2.rowCount === 0 && (await spirit(u)) === 6
    ? ok("debit of 100 REFUSED, balance untouched")
    : no(`overdraw returned ${d2.rowCount} rows, balance ${await spirit(u)}`);

  // ── multi-axis spend ─────────────────────────────────────────────────────
  console.log("\nmulti-axis spend (debitAllTokens)");
  const s = await mkFundedUser("multi spend", 100);
  const spendQ = debitAllTokensSql({
    userId: s, amounts: COST, description: "probe spend", idempotencyKey: null,
    intent: { kind: "spend", sourceType: "recipe_ingestion", sourceId: null },
  });
  const sp1 = await c.query(spendQ.sql, spendQ.values);
  const afterSpend = await balances(s);
  sp1.rowCount === 1 &&
  same(afterSpend, { spirit: 99, essence: 98, matter: 97, substance: 96 })
    ? ok("spend of 1/2/3/4 applied across all four axes")
    : no(`returned ${sp1.rowCount} rows, balances ${JSON.stringify(afterSpend)}`);

  // Over-spend on exactly ONE axis. The whole statement must refuse — a
  // per-axis check that passed three of four would debit three axes for a
  // purchase the user cannot afford.
  const overQ = debitAllTokensSql({
    userId: s, amounts: { spirit: 1, essence: 1, matter: 1, substance: 10_000 },
    description: "probe overspend", idempotencyKey: null,
    intent: { kind: "spend", sourceType: "recipe_ingestion", sourceId: null },
  });
  const sp2 = await c.query(overQ.sql, overQ.values);
  const afterOver = await balances(s);
  sp2.rowCount === 0 && same(afterOver, afterSpend)
    ? ok("over-spend on ONE axis refuses the whole statement — no axis moved")
    : no(`returned ${sp2.rowCount} rows, balances ${JSON.stringify(afterOver)}`);

  // ── premium purchase ─────────────────────────────────────────────────────
  console.log("\npremium purchase (debitAllTokens, purchase intent)");
  // Synthetic shop item, inside the rolled-back txn: the test must not depend
  // on production catalogue contents, which can change under it.
  const itemId = randomUUID();
  await c.query(
    `INSERT INTO shop_items (id, slug, title, category, cost_spirit, cost_essence, cost_matter, cost_substance, is_one_time, is_active)
     VALUES ($1,$2,'Probe Item','probe',1,2,3,4,true,true)`,
    [itemId, `probe-item-${itemId}`],
  );
  const pUser = await mkFundedUser("purchaser", 100);
  const buyQ = debitAllTokensSql({
    userId: pUser, amounts: COST, description: "probe purchase", idempotencyKey: null,
    intent: { kind: "purchase", shopItemId: itemId },
  });
  const b1 = await c.query(buyQ.sql, buyQ.values);
  const afterBuy = await balances(pUser);
  b1.rowCount === 1 &&
  (await purchaseCount(pUser)) === 1 &&
  same(afterBuy, { spirit: 99, essence: 98, matter: 97, substance: 96 })
    ? ok("purchase debits all four axes AND writes a user_purchases row")
    : no(
        `returned ${b1.rowCount} rows, purchases ${await purchaseCount(pUser)}, balances ${JSON.stringify(afterBuy)}`,
      );

  const buyOverQ = debitAllTokensSql({
    userId: pUser, amounts: { spirit: 1, essence: 1, matter: 1, substance: 10_000 },
    description: "probe overspend purchase", idempotencyKey: null,
    intent: { kind: "purchase", shopItemId: itemId },
  });
  const b2 = await c.query(buyOverQ.sql, buyOverQ.values);
  b2.rowCount === 0 &&
  (await purchaseCount(pUser)) === 1 &&
  same(await balances(pUser), afterBuy)
    ? ok("unaffordable purchase writes NO user_purchases row and moves no balance")
    : no(
        `returned ${b2.rowCount} rows, purchases ${await purchaseCount(pUser)}`,
      );

  // ── transmutation ────────────────────────────────────────────────────────
  console.log("\ntransmutation");
  const t = await mkFundedUser("transmuter", 100);
  const beforeT = await balances(t);
  const tQ = transmuteSql({
    fromColumn: "spirit", toColumn: "essence", userId: t,
    costAmount: 3, targetAmount: 1, transactionGroupId: randomUUID(),
    fromToken: "Spirit", toToken: "Essence",
    debitDescription: "probe transmute debit",
    creditDescription: "probe transmute credit",
    idempotencyKey: null,
  });
  const t1 = await c.query(tQ.sql, tQ.values);
  const afterT = await balances(t);
  t1.rowCount === 1 &&
  afterT.spirit === beforeT.spirit - 3 &&
  afterT.essence === beforeT.essence + 1 &&
  afterT.matter === beforeT.matter &&
  afterT.substance === beforeT.substance
    ? ok("moves BOTH axes — spirit -3, essence +1, others untouched")
    : no(`returned ${t1.rowCount} rows, ${JSON.stringify(beforeT)} -> ${JSON.stringify(afterT)}`);

  const tLedger = await c.query(
    `SELECT token_type, sum(amount)::numeric AS total FROM token_transactions
      WHERE user_id=$1 AND source_type='transmutation' GROUP BY token_type ORDER BY token_type`,
    [t],
  );
  const byToken = Object.fromEntries(
    tLedger.rows.map((r) => [r.token_type, Number(r.total)]),
  );
  byToken.Spirit === -3 && byToken.Essence === 1
    ? ok("both ledger halves written and net exactly -3 Spirit / +1 Essence")
    : no(`ledger nets ${JSON.stringify(byToken)}`);

  const tOverQ = transmuteSql({
    fromColumn: "spirit", toColumn: "essence", userId: t,
    costAmount: 10_000, targetAmount: 1, transactionGroupId: randomUUID(),
    fromToken: "Spirit", toToken: "Essence",
    debitDescription: "probe overdraw", creditDescription: "probe overdraw",
    idempotencyKey: null,
  });
  const t2 = await c.query(tOverQ.sql, tOverQ.values);
  t2.rowCount === 0 && same(await balances(t), afterT)
    ? ok("unaffordable transmutation moves NEITHER axis")
    : no(`returned ${t2.rowCount} rows, balances ${JSON.stringify(await balances(t))}`);

  // ── idempotency: a retry must not charge twice ───────────────────────────
  console.log("\nidempotency (a client retry must not double-charge)");
  const iUser = await mkFundedUser("idempotent", 100);
  const key = `probe-idem-${randomUUID()}`;
  const mkSpend = () =>
    debitAllTokensSql({
      userId: iUser, amounts: COST, description: "probe idem", idempotencyKey: key,
      intent: { kind: "spend", sourceType: "recipe_ingestion", sourceId: null },
    });
  const i1 = await attempt(() => {
    const q = mkSpend();
    return c.query(q.sql, q.values);
  });
  const afterFirst = await balances(iUser);
  i1.ok && i1.value.rowCount === 1
    ? ok("first spend applied")
    : no(`first spend failed: ${i1.error?.code ?? i1.value?.rowCount}`);

  const i2 = await attempt(() => {
    const q = mkSpend();
    return c.query(q.sql, q.values);
  });
  !i2.ok && i2.error?.code === "23505" && same(await balances(iUser), afterFirst)
    ? ok("replayed spend rejected with 23505 — balance charged exactly once")
    : no(
        `replay: ok=${i2.ok} code=${i2.error?.code} balances ${JSON.stringify(await balances(iUser))}`,
      );

  const tKey = `probe-tidem-${randomUUID()}`;
  const mkTransmute = () =>
    transmuteSql({
      fromColumn: "matter", toColumn: "substance", userId: iUser,
      costAmount: 3, targetAmount: 1, transactionGroupId: randomUUID(),
      fromToken: "Matter", toToken: "Substance",
      debitDescription: "probe t idem", creditDescription: "probe t idem",
      idempotencyKey: tKey,
    });
  const ti1 = await attempt(() => {
    const q = mkTransmute();
    return c.query(q.sql, q.values);
  });
  const afterT1 = await balances(iUser);
  ti1.ok && ti1.value.rowCount === 1
    ? ok("first transmutation applied")
    : no(`first transmutation failed: ${ti1.error?.code}`);

  const ti2 = await attempt(() => {
    const q = mkTransmute();
    return c.query(q.sql, q.values);
  });
  !ti2.ok && ti2.error?.code === "23505" && same(await balances(iUser), afterT1)
    ? ok("replayed transmutation rejected with 23505 — charged exactly once")
    : no(
        `transmute replay: ok=${ti2.ok} code=${ti2.error?.code} balances ${JSON.stringify(await balances(iUser))}`,
      );

  // ── the -25.0000 regression guard ────────────────────────────────────────
  // EVERY debit-side statement must fail CLOSED for a user with no balance row.
  // `[MEASURED 2026-07-27]` an upsert-shaped debit of 25 against such a user
  // produced spirit = -25.0000 — spending tokens that never existed. Asserting
  // the EFFECT rather than grepping for `ON CONFLICT` catches the regression
  // whatever shape the SQL is rewritten into.
  console.log("\ndebit-side statements must fail CLOSED for a user with NO balance row");
  const debitSideCases = [
    ...["Spirit", "Essence", "Matter", "Substance"].map((tokenType) => ({
      label: `debitTokens(${tokenType})`,
      run: (id) =>
        debitTokensSql({
          userId: id, tokenType, amount: 25, sourceType: "recipe_ingestion",
          sourceId: null, transactionGroupId: randomUUID(), description: "no row",
        }),
    })),
    {
      label: "debitAllTokens(spend)",
      run: (id) =>
        debitAllTokensSql({
          userId: id, amounts: { spirit: 25, essence: 25, matter: 25, substance: 25 },
          description: "no row", idempotencyKey: null,
          intent: { kind: "spend", sourceType: "recipe_ingestion", sourceId: null },
        }),
    },
    {
      label: "debitAllTokens(purchase)",
      run: (id) =>
        debitAllTokensSql({
          userId: id, amounts: { spirit: 25, essence: 25, matter: 25, substance: 25 },
          description: "no row", idempotencyKey: null,
          intent: { kind: "purchase", shopItemId: itemId },
        }),
    },
    {
      label: "transmute(spirit->essence)",
      run: (id) =>
        transmuteSql({
          fromColumn: "spirit", toColumn: "essence", userId: id,
          costAmount: 25, targetAmount: 1, transactionGroupId: randomUUID(),
          fromToken: "Spirit", toToken: "Essence",
          debitDescription: "no row", creditDescription: "no row",
          idempotencyKey: null,
        }),
    },
  ];

  for (const { label, run } of debitSideCases) {
    const v = await mkUser(`no balance ${label}`);
    const q = run(v);
    const res = await c.query(q.sql, q.values);
    const bal = await balances(v);
    const led = await ledgerCount(v);
    const pur = await purchaseCount(v);
    res.rowCount === 0 && bal === null && led === 0 && pur === 0
      ? ok(`${label} — 0 rows, no balance conjured, no ledger, no purchase`)
      : no(
          `${label} — rows=${res.rowCount} balance=${JSON.stringify(bal)} ledger=${led} purchases=${pur} (expected 0/null/0/0)`,
        );
  }

  // ── the ledger/balance invariant ─────────────────────────────────────────
  console.log("\ninvariant");
  const inv = await c.query(
    `SELECT b.spirit, COALESCE(sum(t.amount),0) AS ledger FROM token_balances b
       LEFT JOIN token_transactions t ON t.user_id=b.user_id AND t.token_type='Spirit'
      WHERE b.user_id=$1 GROUP BY b.spirit`,
    [u],
  );
  String(inv.rows[0].spirit) === String(inv.rows[0].ledger)
    ? ok(`ledger === balance (${inv.rows[0].ledger})`)
    : no(`ledger ${inv.rows[0].ledger} !== balance ${inv.rows[0].spirit}`);

  // Same invariant for the multi-axis path, on all four axes at once — a
  // per-axis decomposition that silently zeroed an axis would pass a
  // Spirit-only check.
  for (const [token, column] of [
    ["Spirit", "spirit"], ["Essence", "essence"],
    ["Matter", "matter"], ["Substance", "substance"],
  ]) {
    const r = await c.query(
      `SELECT b.${column}::numeric AS bal, COALESCE(sum(t.amount),0)::numeric AS ledger
         FROM token_balances b
         LEFT JOIN token_transactions t ON t.user_id=b.user_id AND t.token_type=$2
        WHERE b.user_id=$1 GROUP BY b.${column}`,
      [pUser, token],
    );
    Number(r.rows[0].bal) === Number(r.rows[0].ledger)
      ? ok(`purchaser ${token}: ledger === balance (${r.rows[0].ledger})`)
      : no(`purchaser ${token}: ledger ${r.rows[0].ledger} !== balance ${r.rows[0].bal}`);
  }

  // ── the unification changed no SQL ───────────────────────────────────────
  // The spend and premium-purchase statements were ~40 duplicated lines that
  // are now one builder. Compare its output to the inline SQL it replaced,
  // captured from the pre-refactor source. SQL comments are stripped before
  // comparing — PostgreSQL's lexer discards them, so they provably cannot
  // change semantics, and the two originals disagreed only about a comment.
  console.log("\nunification is semantics-free (vs pre-refactor fixtures)");
  const stripComments = (s) =>
    s.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").trimEnd();
  const fixture = (name) =>
    stripComments(readFileSync(`scripts/fixtures/${name}.pre.sql`, "utf8"));

  const renderedSpend = debitAllTokensSql({
    userId: "u", amounts: { spirit: 1, essence: 2, matter: 3, substance: 4 },
    description: "d", idempotencyKey: "k",
    intent: { kind: "spend", sourceType: "recipe_ingestion", sourceId: null },
  }).sql;
  const renderedBuy = debitAllTokensSql({
    userId: "u", amounts: { spirit: 1, essence: 2, matter: 3, substance: 4 },
    description: "d", idempotencyKey: "k",
    intent: { kind: "purchase", shopItemId: "i" },
  }).sql;

  stripComments(renderedSpend) === fixture("spend")
    ? ok("spend SQL is identical to the inline statement it replaced")
    : no("spend SQL DIFFERS from the pre-refactor statement");
  stripComments(renderedBuy) === fixture("purchase")
    ? ok("purchase SQL is identical to the inline statement it replaced")
    : no("purchase SQL DIFFERS from the pre-refactor statement");

  // Control: the comparison can actually detect a difference.
  stripComments(renderedSpend) !== fixture("purchase")
    ? ok("control: the comparison distinguishes the two statements")
    : no("CONTROL FAILED: spend and purchase fixtures compare equal");

  // ── the collector reshape changed no SQL either ──────────────────────────
  // credit/debit/getBalances moved from hand-numbered `$1..$8` beside a
  // hand-ordered array to the QueryParams collector. The parameters are
  // collected in the SAME order the arrays supplied them, so the rendered SQL
  // must be unchanged. Fixtures captured from the pre-reshape builders.
  console.log("\ncollector reshape is semantics-free (vs pre-reshape fixtures)");
  for (const tokenType of ["Spirit", "Essence", "Matter", "Substance"]) {
    const col = tokenType.toLowerCase();
    const credit = creditTokensSql({
      userId: "u", tokenType, amount: 1, sourceType: "signup_grant",
      sourceId: null, description: "d", transactionGroupId: "g",
      idempotencyKey: "k",
    }).sql;
    const debit = debitTokensSql({
      userId: "u", tokenType, amount: 1, sourceType: "recipe_ingestion",
      sourceId: null, transactionGroupId: "g", description: "d",
    }).sql;
    stripComments(credit) === fixture(`credit.${col}`)
      ? ok(`creditTokensSql(${tokenType}) SQL unchanged by the reshape`)
      : no(`creditTokensSql(${tokenType}) SQL CHANGED`);
    stripComments(debit) === fixture(`debit.${col}`)
      ? ok(`debitTokensSql(${tokenType}) SQL unchanged by the reshape`)
      : no(`debitTokensSql(${tokenType}) SQL CHANGED`);
  }
  stripComments(getBalancesSql("u").sql) === fixture("getBalances")
    ? ok("getBalancesSql SQL unchanged by the reshape")
    : no("getBalancesSql SQL CHANGED");

  // The reshape's real payload: the values array is now produced by the
  // builder, in binding order, rather than hand-written beside the `$n`s.
  const credited = creditTokensSql({
    userId: "U", tokenType: "Essence", amount: 7, sourceType: "signup_grant",
    sourceId: "SRC", description: "DESC", transactionGroupId: "GRP",
    idempotencyKey: "IDEM",
  });
  JSON.stringify(credited.values) ===
  JSON.stringify(["U", "Essence", 7, "signup_grant", "SRC", "DESC", "GRP", "IDEM"])
    ? ok("creditTokensSql binds values in $1..$8 order")
    : no(`creditTokensSql values are ${JSON.stringify(credited.values)}`);

  // And the column can no longer disagree with the token type, because there
  // is only one argument to get wrong.
  creditTokensSql({
    userId: "U", tokenType: "Matter", amount: 1, sourceType: "signup_grant",
    sourceId: null, description: null, transactionGroupId: null,
    idempotencyKey: null,
  }).sql.includes("INSERT INTO token_balances (user_id, matter, updated_at)")
    ? ok("column is derived from the token type — they cannot desync")
    : no("token type 'Matter' did not select the matter column");
} finally {
  await c.query("ROLLBACK");
  await c.end();
}

console.log(
  bad === 0
    ? "\nPASS — all economy statements behave correctly (rolled back)\n"
    : `\nFAILED: ${bad}\n`,
);
process.exit(bad === 0 ? 0 : 1);
