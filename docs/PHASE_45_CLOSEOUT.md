# Phase 45 closeout — verified merged tree

Recorded 2026-10-15. Phase base: `790252390f4c0e52c5267523060234156e972521`. Implementation merged as `6019ebdf6cc5499df3b548027391a0f8556d650d` through [PR #962](https://github.com/gregcastro23/WhatToEatNext/pull/962). Its tree is identical to tested head `d44b2dd6c87238574f50da982c4b1220d053b716`; both resolve to `0c8da740a186c24c4ce6b4176d35a06ae39f8450`.

## Gate evidence

[Final-head CI run](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38695864762) passed Verify (`bun run verify:static`), Build (`bun run build`), Test, and Rust. Test recorded 5,882 passed / 25 skipped; script-gate tests separately recorded 284 passed across 16 suites. Script typing had zero errors. A skipped test is not evidence of executed behavior.

[Monica Integrity run](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38695864853) passed the no-fabricated-fallback scan, disposable PostgreSQL refund proof, and pre-merge SQL job. Code-health and agent-data drift were skipped; deployment/provider behavior was not established by these results.

On the merged implementation, the opt-in command below actually passed all seven PostgreSQL tests. It exercised two clients contending on the real primary key, lost-response replay, requester isolation, changed-input rejection, immutable distinct versions, JSONB hash round-trips, actor foreign keys, publication identity, and the real feed writer without rating/cooking evidence:

```sh
SAVED_ADAPTATION_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:55439/phase45_test \
  bun run jest --runInBand --runTestsByPath \
  src/lib/recipes/__tests__/savedAdaptationPersistence.postgres.test.ts
```

The local destination was a disposable PostgreSQL 16.14 database. Tests used a random isolated schema and the production schema definitions. This did not query or mutate a production database. The follow-up CI change supplies this suite's explicit test variable and runs it in the existing secret-free PostgreSQL 16 service; without that variable the ordinary application suite intentionally skips it.

Refund evidence also includes four SQL scenarios and three production-service PostgreSQL cases proving exact positive NET-axis restoration, no extra replay credit, and rollback after an injected intermediate failure. The admin proof prepares twelve actual shipped statements, rejects a wrong-column control with code 42703, executes nine scenarios, and always rolls back. Its initial expected error uses a savepoint so transaction pooling cannot invalidate fixture isolation. Real loopback HTTP verified receiver timeout and redirect refusal.

## Actual gate deltas

These are observed counts, separate from committed ceilings. The starting lint measurement ran on a clean checkout of `79025239`; final lint values come from the exact-head CI log above. AST/cast counts were re-scanned from a `git archive 6019ebdf src` snapshot, excluding the unrelated working-tree profile edits.

| Measure | Actual starting tree | Merged implementation | Delta |
|---|---:|---:|---:|
| Tracked lint debt | 1,222 | 1,219 | −3 |
| Declined-rule pool | 4,679 | 4,675 | −4 |
| Prefer-nullish sub-pool | 197 | 197 | 0 |
| Single / total unchecked assertion sites | 2,711 / 2,868 | 2,711 / 2,868 | 0 / 0 |
| Loose optionality, domain / wire | 95 / 89 | 95 / 89 | 0 / 0 |
| Bare JSON casts, production / total | 71 / 80 | 71 / 80 | 0 / 0 |
| Cast scan, total | 158 | 158 | 0 |
| Route-validation debt / script typing errors | 0 / 0 | 0 / 0 | 0 / 0 |

At the implementation merge the committed lint ceilings were still 1,222 tracked, 199 nullish, and 4,680 declined. PR #962's “down 2/down 5” wording compares against those ceilings; it is not the actual starting-to-final delta. No ceiling increase is authorized by spare headroom. This follow-up ran `bun run next typegen` and `bun run lint:debt:ratchet` on the clean merged source, then lowered those ceilings to 1,219 / 197 / 4,675. Assertion, cast and optionality ceilings stayed unchanged. The ratchet produced the file; no baseline values were edited by hand.

## Resolver coverage correction

A fresh same-input resolver census on `6019ebdf` loaded 1,112 static recipes / 9,752 ingredient lines. Input SHA-256: `d5343617dc6593d40c0c64c89f7816cc29978f1ca00b54c82ebd45d39b6eb73d`.

- Unresolved lines: 4,376 (44.87%) → 2,984 (30.60%): 1,392 fewer, or 14.27 percentage points.
- Unresolved first ingredients: 651 → 510.
- The earlier 2,718 / 27.87% result belonged to a draft with five unsupported form/composition mappings. It is superseded.

Method: load `getServerRecipes`, preserve every ingredient line and its original quantity/unit, call `recipeGateHelpers.resolveSingleIngredient`, and hash the exact normalized inputs. This measures static catalog coverage, not recipe safety, verification rate, production traffic, or user failure rate.

## Product and operational limits

Six supported restrictions receive text screening; keto, paleo, halal, kosher, and other unsupported requests remain explicitly unevaluated. Recipe text does not establish product-specific allergen certification. Pressure/time processes do not become verified from a keyword or a new unsupported temperature ceiling.

C2 supports Leonardo's bounded chicken-to-tofu action with exact supported substitutions in instructions. It requires stored chart/preferences and explicit live provider/actor evidence. Missing/degraded/malformed/no-op responses do not save an adaptation. Saved ingredient, instruction and cart views agree; nutrition, ESMS, elemental and planetary readings remain unavailable. Publication can be published, not-published or unknown. Neither an adaptation nor an unrated reflection creates physical cooking evidence or a rating.

Live inference, deployed profile availability, production measurements/data remediation, ASOL-side delivery monitoring, and new production migrations were not performed. `docs/PHASE_45_RECOVERY_DESIGN.md` records the remaining durability, measurement, alerting and product decisions. The implementation does not guarantee refund recovery after a process kill.

The preserved AgentProfile/page edits and the uncommitted next-session handoff are separate work. Phase 45 did not authorize a new blanket seed/ledger, cast, assertion, optionality, or scripts campaign.
