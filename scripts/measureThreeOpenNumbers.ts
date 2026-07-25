/**
 * Measures the three numbers §18 still has no measurement for.
 * READ-ONLY: issues only SELECTs. Never writes.
 *
 *   (a) full-chart SECT CANCELLATION — monica_full_chart is the mean of two
 *       sects that often have opposite signs, so the mean is a partial
 *       cancellation. How bad is it, across all 71?
 *   (b) full-chart SACRED-7 SCALE — |max|/2, the same derivation used for
 *       single-body (1.9875) and two-body (2.7095).
 *   (c) MOON-DUPLICATE POPULATION — re-measured, because every prior count is
 *       stale (the population grew 4822 -> 4869 in one hour).
 *
 * Run: railway run --service Postgres -- bun scripts/measureThreeOpenNumbers.ts
 */
import { Client } from 'pg'

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL
if (!url) {
  console.error('No DATABASE_PUBLIC_URL / DATABASE_URL in env')
  process.exit(1)
}

const num = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v)

function fmt(n: number | null, dp = 6): string {
  return n === null ? '     null' : n.toFixed(dp).padStart(11)
}

async function main() {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await c.connect()

  // ---------------------------------------------------------------- (a)
  console.log('='.repeat(76))
  console.log('(a) FULL-CHART SECT CANCELLATION')
  console.log('='.repeat(76))

  const fc = await c.query(`
    SELECT up.user_id,
           min(up.name)          AS name,
           up.monica_diurnal     AS d,
           up.monica_nocturnal   AS n,
           up.monica_full_chart  AS combined
    FROM user_profiles up
    WHERE up.monica_method = 'full-chart'
    GROUP BY up.user_id, up.monica_diurnal, up.monica_nocturnal, up.monica_full_chart
    ORDER BY min(up.name)
  `)

  let opposed = 0
  let sameSign = 0
  let hasZero = 0
  const ratios: number[] = []
  const rows: Array<{ name: string; d: number; n: number; comb: number; ratio: number }> = []

  for (const r of fc.rows) {
    const d = num(r.d)
    const n = num(r.n)
    const comb = num(r.combined)
    if (d === null || n === null || comb === null) continue

    if (d === 0 || n === 0) hasZero++
    else if (Math.sign(d) !== Math.sign(n)) opposed++
    else sameSign++

    // How much magnitude does averaging destroy?
    //   1.0 = none (sects agree), 0.0 = total (sects exactly cancel)
    const meanAbs = (Math.abs(d) + Math.abs(n)) / 2
    const ratio = meanAbs === 0 ? 1 : Math.abs(comb) / meanAbs
    ratios.push(ratio)
    rows.push({ name: r.name, d, n, comb, ratio })
  }

  console.log(`rows measured:            ${rows.length} of ${fc.rowCount}`)
  console.log(`sects OPPOSE in sign:     ${opposed}  (${((opposed / rows.length) * 100).toFixed(1)}%)`)
  console.log(`sects AGREE in sign:      ${sameSign}  (${((sameSign / rows.length) * 100).toFixed(1)}%)`)
  console.log(`one sect exactly zero:    ${hasZero}`)

  ratios.sort((a, b) => a - b)
  const pct = (p: number) => ratios[Math.min(ratios.length - 1, Math.floor((p / 100) * ratios.length))]
  console.log('')
  console.log('retained-magnitude ratio |mean| / mean(|d|,|n|)   (1.0 = lossless, 0.0 = total cancellation)')
  console.log(`  min    ${fmt(ratios[0])}`)
  console.log(`  p25    ${fmt(pct(25))}`)
  console.log(`  median ${fmt(pct(50))}`)
  console.log(`  p75    ${fmt(pct(75))}`)
  console.log(`  max    ${fmt(ratios[ratios.length - 1])}`)
  const mean = ratios.reduce((s, x) => s + x, 0) / ratios.length
  console.log(`  mean   ${fmt(mean)}`)

  const severe = rows.filter(r => r.ratio < 0.1).length
  const total = rows.filter(r => r.ratio < 0.01).length
  console.log('')
  console.log(`rows retaining <10% of magnitude: ${severe}`)
  console.log(`rows retaining  <1% of magnitude: ${total}   <- effectively destroyed`)

  console.log('')
  console.log('worst 8 (most cancellation):')
  console.log('  ratio        diurnal     nocturnal      stored   name')
  for (const r of [...rows].sort((a, b) => a.ratio - b.ratio).slice(0, 8)) {
    console.log(`  ${r.ratio.toFixed(4)}  ${fmt(r.d)} ${fmt(r.n)} ${fmt(r.comb)}   ${r.name}`)
  }

  // ---------------------------------------------------------------- (b)
  console.log('')
  console.log('='.repeat(76))
  console.log('(b) FULL-CHART SACRED-7 SCALE')
  console.log('='.repeat(76))

  const sc = await c.query(`
    SELECT max(abs(monica_full_chart)) AS max_abs,
           min(monica_full_chart)      AS min_v,
           max(monica_full_chart)      AS max_v,
           count(*)                    AS n
    FROM user_profiles
    WHERE monica_method = 'full-chart' AND monica_full_chart IS NOT NULL
  `)
  const s = sc.rows[0]
  const maxAbs = num(s.max_abs)
  console.log(`n:                  ${s.n}`)
  console.log(`range:              [${fmt(num(s.min_v))}, ${fmt(num(s.max_v))}]`)
  console.log(`|max|:              ${fmt(maxAbs)}`)
  console.log(`|max| / 2  (SCALE): ${fmt(maxAbs === null ? null : maxAbs / 2)}`)
  console.log('')
  console.log('compare: single-body 1.9875   two-body 2.7095   DEFAULT fallback 10')
  if (maxAbs !== null) {
    console.log(`ratio to single-body scale: ${(1.9875 / (maxAbs / 2)).toFixed(1)}x smaller`)
  }

  // ---------------------------------------------------------------- (c)
  console.log('')
  console.log('='.repeat(76))
  console.log('(c) MOON-DUPLICATE POPULATION (re-measured)')
  console.log('='.repeat(76))

  const tot = await c.query(`SELECT count(*) AS n FROM user_profiles`)
  console.log(`total user_profiles right now: ${tot.rows[0].n}   <- prior sessions saw 4822 / 4865 / 4869`)

  const dup = await c.query(`
    SELECT name, count(*) AS n, count(DISTINCT monica_two_body) AS distinct_monica
    FROM user_profiles
    WHERE name ILIKE '%moon%'
    GROUP BY name
    HAVING count(*) > 1
    ORDER BY count(*) DESC, name
    LIMIT 25
  `)
  console.log(`distinct Moon-named names appearing more than once: ${dup.rowCount}`)
  if (dup.rowCount) {
    console.log('  n  distinct_monica  name')
    for (const r of dup.rows) {
      console.log(`  ${String(r.n).padStart(2)}  ${String(r.distinct_monica).padStart(15)}  ${r.name}`)
    }
  }

  const moonTot = await c.query(`
    SELECT count(*) AS rows, count(DISTINCT name) AS names
    FROM user_profiles WHERE name ILIKE '%moon%'
  `)
  const mr = Number(moonTot.rows[0].rows)
  const mn = Number(moonTot.rows[0].names)
  console.log('')
  console.log(`Moon-named rows:   ${mr}`)
  console.log(`distinct names:    ${mn}`)
  console.log(`excess rows:       ${mr - mn}  <- the actual duplicate burden`)

  await c.end()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
