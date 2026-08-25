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
  dailyClaimTimestampSql,
  debitAllTokensSql,
  debitTokensSql,
  getBalancesSql,
  hasActivePurchaseSql,
  idempotencyProbeSql,
  shopItemDetailSql,
  shopItemForPurchaseSql,
  shopItemsSql,
  transactionCountSql,
  transactionsPageSql,
  transmuteSql,
  userOwnsItemSql,
  walletInvariantsSql,
  walletInvariantsTotalCountSql,
} from "../src/services/tokenEconomyQueries.ts";

const c = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
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

  // ── reads and bookkeeping ────────────────────────────────────────────────
  // These move no balance, but two of them decide whether money moves at all
  // (the idempotency probe) or which rows a user is shown, so a silent
  // misbehaviour is not harmless.
  console.log("\nreads and bookkeeping");

  // The probe must match the keys the WRITERS actually produce. This is a
  // cross-builder agreement: debitAllTokensSql writes `<prefix>:<TokenType>`,
  // one row per axis, and the probe searches on `<prefix>:%`. If those two
  // conventions ever drift, duplicate detection silently stops working and the
  // only thing standing between a client retry and a double-charge is the
  // unique index.
  {
    const pu = await mkFundedUser("probe convention", 100);
    const key = `probe-convention-${randomUUID()}`;
    const q = debitAllTokensSql({
      userId: pu, amounts: COST, description: "probe", idempotencyKey: key,
      intent: { kind: "spend", sourceType: "recipe_ingestion", sourceId: null },
    });
    await c.query(q.sql, q.values);
    const probe = idempotencyProbeSql(key);
    const hit = await c.query(probe.sql, probe.values);
    hit.rows.length === 1
      ? ok("idempotencyProbe FINDS the keys debitAllTokensSql writes")
      : no(`probe found ${hit.rows.length} rows for a key that was just written`);

    // Control: it must not match a different key. A probe that matched
    // everything would also "pass" the assertion above.
    const miss = idempotencyProbeSql(`${key}-other`);
    const missRes = await c.query(miss.sql, miss.values);
    missRes.rows.length === 0
      ? ok("control: the probe does NOT match an unrelated key")
      : no(`probe matched ${missRes.rows.length} rows for an unrelated key`);
  }

  // limit/offset are two adjacent integers — the swap this refactor exists to
  // prevent. Assert they are not transposed, by checking the pages differ and
  // the ordering is newest-first.
  {
    const tu = await mkUser("pager");
    for (let i = 0; i < 3; i++) {
      const q = creditTokensSql({
        userId: tu, tokenType: "Spirit", amount: i + 1, sourceType: "signup_grant",
        sourceId: null, description: `page probe ${i}`, transactionGroupId: randomUUID(),
        idempotencyKey: `page:${tu}:${i}`,
      });
      await c.query(q.sql, q.values);
    }
    const p1 = transactionsPageSql({ userId: tu, limit: 2, offset: 0 });
    const p2 = transactionsPageSql({ userId: tu, limit: 2, offset: 2 });
    const r1 = await c.query(p1.sql, p1.values);
    const r2 = await c.query(p2.sql, p2.values);
    r1.rows.length === 2 && r2.rows.length === 1
      ? ok("transactionsPage honours limit and offset in the right order")
      : no(`limit 2 offset 0 -> ${r1.rows.length} rows, offset 2 -> ${r2.rows.length} (expected 2 / 1)`);
    // A transposed limit/offset would be LIMIT 0 OFFSET 2, returning nothing —
    // so a non-empty first page is itself the discriminator.
    r1.rows[0] && new Date(r1.rows[0].created_at) >= new Date(r1.rows[1].created_at)
      ? ok("transactionsPage orders newest-first")
      : no("transactionsPage ordering is not newest-first");

    const cnt = transactionCountSql(tu);
    Number((await c.query(cnt.sql, cnt.values)).rows[0].total) === 3
      ? ok("transactionCount counts every row, unaffected by paging")
      : no("transactionCount disagrees with the rows written");
  }

  // The shop reads, and the date bound that used to be spliced into the text.
  {
    const su = await mkUser("shopper");
    const activeId = randomUUID();
    const inactiveId = randomUUID();
    const activeSlug = `probe-active-${activeId}`;
    const inactiveSlug = `probe-inactive-${inactiveId}`;
    const cat = `probe-cat-${randomUUID()}`;
    for (const [id, slug, isActive] of [
      [activeId, activeSlug, true],
      [inactiveId, inactiveSlug, false],
    ]) {
      await c.query(
        `INSERT INTO shop_items (id, slug, title, category, cost_spirit, cost_essence,
                                 cost_matter, cost_substance, is_one_time, is_active)
         VALUES ($1,$2,'Probe',$3,1,1,1,1,true,$4)`,
        [id, slug, cat, isActive],
      );
    }

    const forPurchase = shopItemForPurchaseSql(activeSlug);
    (await c.query(forPurchase.sql, forPurchase.values)).rows.length === 1
      ? ok("shopItemForPurchase finds an ACTIVE item")
      : no("shopItemForPurchase missed an active item");
    const inactiveLookup = shopItemForPurchaseSql(inactiveSlug);
    (await c.query(inactiveLookup.sql, inactiveLookup.values)).rows.length === 0
      ? ok("shopItemForPurchase refuses an INACTIVE item")
      : no("shopItemForPurchase returned an inactive item — it would be buyable");

    const detail = shopItemDetailSql(inactiveSlug);
    (await c.query(detail.sql, detail.values)).rows.length === 1
      ? ok("shopItemDetail reads an inactive item (display, not purchase)")
      : no("shopItemDetail could not read an inactive item");

    const listDefault = shopItemsSql({ category: cat });
    const listAll = shopItemsSql({ category: cat, onlyActive: false });
    const nDefault = (await c.query(listDefault.sql, listDefault.values)).rows.length;
    const nAll = (await c.query(listAll.sql, listAll.values)).rows.length;
    nDefault === 1 && nAll === 2
      ? ok("shopItems hides inactive by DEFAULT; onlyActive:false includes them")
      : no(`shopItems default -> ${nDefault}, onlyActive:false -> ${nAll} (expected 1 / 2)`);

    // hasActivePurchase, and the maxAgeDays bound that is now a parameter.
    const owns0 = userOwnsItemSql({ userId: su, slug: activeSlug });
    (await c.query(owns0.sql, owns0.values)).rows.length === 0
      ? ok("userOwnsItem is false before any purchase")
      : no("userOwnsItem reported ownership with no purchase");

    await c.query(
      `INSERT INTO user_purchases (user_id, shop_item_id, transaction_group_id, purchased_at)
       VALUES ($1,$2,$3, now() - interval '40 days')`,
      [su, activeId, randomUUID()],
    );
    const owns1 = userOwnsItemSql({ userId: su, slug: activeSlug });
    (await c.query(owns1.sql, owns1.values)).rows.length === 1
      ? ok("userOwnsItem is true after a purchase")
      : no("userOwnsItem missed a purchase");

    const anyAge = hasActivePurchaseSql({ userId: su, slug: activeSlug });
    (await c.query(anyAge.sql, anyAge.values)).rows.length === 1
      ? ok("hasActivePurchase with no age bound finds a 40-day-old purchase")
      : no("hasActivePurchase missed an unbounded purchase");

    const within30 = hasActivePurchaseSql({ userId: su, slug: activeSlug, maxAgeDays: 30 });
    (await c.query(within30.sql, within30.values)).rows.length === 0
      ? ok("hasActivePurchase(30) EXCLUDES the 40-day-old purchase — the bound binds")
      : no("maxAgeDays=30 still matched a 40-day-old purchase");

    const within90 = hasActivePurchaseSql({ userId: su, slug: activeSlug, maxAgeDays: 90 });
    (await c.query(within90.sql, within90.values)).rows.length === 1
      ? ok("hasActivePurchase(90) INCLUDES it — so the exclusion above is the bound, not a broken query")
      : no("maxAgeDays=90 failed to match a 40-day-old purchase");
  }

  // The daily-claim stamp writes the column its site names, and only that one.
  {
    const cu = await mkUser("claimer");
    const bal = getBalancesSql(cu);
    await c.query(bal.sql, bal.values);
    for (const [site, written, untouched] of [
      ["main", "last_daily_claim_at", "last_daily_claim_agents_at"],
      ["agents", "last_daily_claim_agents_at", "last_daily_claim_at"],
    ]) {
      const v = await mkUser(`claimer ${site}`);
      const b = getBalancesSql(v);
      await c.query(b.sql, b.values);
      const q = dailyClaimTimestampSql({ userId: v, site });
      await c.query(q.sql, q.values);
      const r = await c.query(
        `SELECT last_daily_claim_at, last_daily_claim_agents_at FROM token_balances WHERE user_id=$1`,
        [v],
      );
      r.rows[0][written] !== null && r.rows[0][untouched] === null
        ? ok(`dailyClaim(${site}) stamps ${written} and leaves ${untouched} alone`)
        : no(`dailyClaim(${site}) wrote ${JSON.stringify(r.rows[0])}`);
    }
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

  // ── walletInvariants dual-rail isolation & rotation ──────────────────────
  console.log("\nwalletInvariants (dual-rail ledger isolation and hourly scan rotation)");
  {
    const wUser = await mkUser("wallet-user");
    const walletAddress = `0x${randomUUID().replace(/-/g, "")}00000000`;
    await c.query(
      `UPDATE users SET wallet_address = $1 WHERE id = $2`,
      [walletAddress, wUser],
    );

    // Insert 10 Base claim and 50 Solana claim
    await c.query(
      `INSERT INTO esms_onchain_claims
        (user_id, wallet_address, claim_id, spirit, essence, matter, substance, status, target_chain, created_at, updated_at)
       VALUES
        ($1, $2, $3, 10, 0, 0, 0, 'minted', 'eip155:84532', now(), now()),
        ($1, $2, $4, 50, 0, 0, 0, 'minted', 'solana:mainnet-beta', now(), now())`,
      [wUser, walletAddress, `claim-base-${randomUUID()}`, `claim-sol-${randomUUID()}`],
    );

    // Scoped Base query must sum only Base claims (10 Spirit)
    const baseQuery = walletInvariantsSql({ rail: "eip155:84532", maxWallets: 100 });
    const baseRes = await c.query(baseQuery.sql, baseQuery.values);
    const userBaseRow = baseRes.rows.find((r) => r.wallet_address === walletAddress);
    Number(userBaseRow?.spirit) === 10
      ? ok("scoped Base invariant query sums only Base claims (10 Spirit)")
      : no(`scoped Base invariant query returned spirit=${userBaseRow?.spirit} (expected 10)`);

    // Scoped Solana query must sum only Solana claims (50 Spirit)
    const solQuery = walletInvariantsSql({ rail: "solana:mainnet-beta", maxWallets: 100 });
    const solRes = await c.query(solQuery.sql, solQuery.values);
    const userSolRow = solRes.rows.find((r) => r.wallet_address === walletAddress);
    Number(userSolRow?.spirit) === 50
      ? ok("scoped Solana invariant query sums only Solana claims (50 Spirit)")
      : no(`scoped Solana invariant query returned spirit=${userSolRow?.spirit} (expected 50)`);

    // Unscoped comparison (defect demonstration)
    const unscopedRes = await c.query(
      `SELECT u.wallet_address, COALESCE(SUM(c.spirit), 0) AS spirit
       FROM users u
       LEFT JOIN esms_onchain_claims c ON c.user_id = u.id AND c.status = 'minted'
       WHERE u.wallet_address = $1
       GROUP BY u.wallet_address`,
      [walletAddress],
    );
    Number(unscopedRes.rows[0]?.spirit) === 60
      ? ok("control: unscoped query counts all rails indiscriminately (60 Spirit)")
      : no(`control: unscoped query returned ${unscopedRes.rows[0]?.spirit}`);

    // Verify rotation expression is present in rendered SQL
    baseQuery.sql.includes("md5(u.wallet_address || to_char(now(), 'YYYY-MM-DD-HH24'))")
      ? ok("walletInvariantsSql contains deterministic hourly rotation expression")
      : no("walletInvariantsSql missing hourly rotation expression");

    // Check wallet count
    const totalCountQuery = walletInvariantsTotalCountSql();
    const countRes = await c.query(totalCountQuery.sql, totalCountQuery.values);
    Number(countRes.rows[0]?.total) >= 1
      ? ok(`walletInvariantsTotalCount returns positive count (${countRes.rows[0]?.total})`)
      : no(`walletInvariantsTotalCount returned ${countRes.rows[0]?.total}`);
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

  // ── the lifted reads changed no SQL either ──────────────────────────────
  // Every read moved out of TokenEconomyService verbatim. Fixtures captured
  // from origin/master's inline literals; each variant rendered the way the
  // original code rendered it.
  console.log("\nlifted reads are semantics-free (vs pre-lift fixtures)");
  const readCases = [
    ["idempotencyProbe", idempotencyProbeSql("K").sql],
    ["dailyClaim.main", dailyClaimTimestampSql({ userId: "u", site: "main" }).sql],
    ["dailyClaim.agents", dailyClaimTimestampSql({ userId: "u", site: "agents" }).sql],
    ["transactionsPage", transactionsPageSql({ userId: "u", limit: 1, offset: 0 }).sql],
    ["transactionCount", transactionCountSql("u").sql],
    ["shopItemForPurchase", shopItemForPurchaseSql("s").sql],
    ["userOwnsItem", userOwnsItemSql({ userId: "u", slug: "s" }).sql],
    ["shopItemDetail", shopItemDetailSql("s").sql],
    ["shopItems.default", shopItemsSql().sql],
    ["shopItems.category", shopItemsSql({ category: "x" }).sql],
    ["shopItems.all", shopItemsSql({ onlyActive: false }).sql],
    ["shopItems.categoryAll", shopItemsSql({ category: "x", onlyActive: false }).sql],
  ];
  for (const [name, rendered] of readCases) {
    stripComments(rendered) === fixture(name)
      ? ok(`${name} SQL unchanged by the lift`)
      : no(`${name} SQL CHANGED`);
  }

  // hasActivePurchase is the ONE read that deliberately changed: its day count
  // moved from spliced-into-the-text to a bound parameter. The no-bound variant
  // must still be identical; the bounded one must NOT interpolate its value.
  stripComments(hasActivePurchaseSql({ userId: "u", slug: "s" }).sql) ===
  fixture("hasActivePurchase.nodate")
    ? ok("hasActivePurchase (no age bound) SQL unchanged by the lift")
    : no("hasActivePurchase (no age bound) SQL CHANGED");

  const bounded = hasActivePurchaseSql({ userId: "u", slug: "s", maxAgeDays: 30 });
  !bounded.sql.includes("30") && bounded.values.includes(30)
    ? ok("hasActivePurchase(30) BINDS the day count — it appears in values, not in the SQL")
    : no(`maxAgeDays leaked into the statement text: ${bounded.sql}`);

  // The case that made this worth fixing: a hostile value must land in the
  // parameter list, not in the statement.
  const hostile = hasActivePurchaseSql({
    userId: "u", slug: "s", maxAgeDays: "1 days' OR true --",
  });
  !hostile.sql.includes("OR true") && hostile.values.includes("1 days' OR true --")
    ? ok("a hostile maxAgeDays cannot reach the statement text")
    : no("hostile maxAgeDays was interpolated into the SQL");

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
