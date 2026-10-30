# CI efficiency audit

Date: 2026-10-13. Scope: the current optimization branch at `a69ee07b`, its base `bd0a5b13`, live GitHub workflow runs, and the active master ruleset. This investigation did not trigger CI or run a full local build, test suite, or verification chain. Workflow and application code were not changed.

## Main finding: the optimizations are not deployed

[PR #950](https://github.com/gregcastro23/WhatToEatNext/pull/950) is open and GitHub reports its merge state as `BLOCKED`. Its CI and Monica PR jobs passed. However, adding `fetch-depth` to the matrix changed the automatically generated check names, while the active `master: proven before merge` ruleset still requires the previous names:

| Required by ruleset 20950461 | Reported by PR #950 |
| --- | --- |
| `checks (Verify, bun run verify:static)` | `checks (Verify, bun run verify:static, 0)` |
| `checks (Build, bun run build)` | `checks (Build, bun run build, 1)` |
| `checks (Test, bun run test --passWithNoTests)` | `checks (Test, bun run test --passWithNoTests, 1)` |
| `rust` | `rust` |

The new green matrix checks do not satisfy the old required contexts. The ruleset has no bypass actors and also prevents deletion and non-fast-forward updates; no review requirement is listed there. Evidence: read-only `gh api repos/gregcastro23/WhatToEatNext/rulesets/20950461`, `gh pr checks 950`, and `gh pr view 950 --json mergeStateStatus`.

**Recommended first change:** explicitly name the matrix job so auxiliary matrix fields cannot change the required context. Under `jobs.checks` in [ci.yml](../../.github/workflows/ci.yml), preserve the currently required names with:

```yaml
name: checks (${{ matrix.name }}, ${{ matrix.command }})
```

Validate the names in the resulting PR check rollup before merging. A cleaner naming scheme could be introduced later with a coordinated ruleset change; that is unnecessary for restoring this PR's compatibility.

Live master's `ci.yml` and `monica-integrity.yml` blobs still match this branch's pre-optimization base (`c2bac822…` and `fc61319c…`). Recent runs demonstrate the remaining double trigger: Monica push run [38334904144](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38334904144) and PR run [38334907682](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38334907682) share head SHA `a1154eed…`. Therefore the checkout's improvements must not be described as already active on master.

## Measured work in the optimized PR

These are elapsed job durations, not billed minutes or isolated causal savings. The jobs run in parallel.

| Job | Elapsed | Evidence |
| --- | ---: | --- |
| Verify | 8m43s | [job 114943180599](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663900/job/114943180599) |
| Build | 2m59s | [job 114943180627](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663900/job/114943180627) |
| Test | 2m26s | [job 114943180508](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663900/job/114943180508) |
| Rust | 21s | [job 114943180081](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663900/job/114943180081) |
| Monica static/Python | 45s | [job 114943088132](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663785/job/114943088132) |
| Pre-merge SQL | 1m13s | [job 114943087790](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663785/job/114943087790) |

Verify's log timestamps isolate its largest workload:

- Normal source ESLint: `18:08:20.810` to the next command at `18:11:50.764`, approximately **3m30s**.
- Audit source ESLint: `[2/6]` at `18:12:03.490` to `[3/6]` at `18:15:00.846`, approximately **2m57s**.
- Together: approximately **6m27s**, about 74% of Verify's job duration. The second figure covers the audit lint phase, not the later AST debt scans.

The five Bun dependency-install steps in this PR took 18s, 19s, 20s, 19s and 15s. That is **91 seconds of aggregate runner work**, not 91 seconds of pipeline delay.

## Remaining opportunities, in priority order

1. **Master code-health repeats verification computation.** [ci.yml](../../.github/workflows/ci.yml) runs a separate master-only job; [codeHealthSnapshot.ts](../../scripts/codeHealthSnapshot.ts) generates route types, executes the same clean application TypeScript check, and runs source ESLint with the same normal config as Verify. Its telemetry purpose is useful, but the computation repeats. In the recent master [code-health job](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38318260406/job/115039978713), the entire job took **3m54s**. Have verification produce structured readings and let telemetry consume them. Preserve diagnostics on failures, per-commit identity, and the dashboard's independent/nonblocking posting behavior. The observed 3m54s is a job-size opportunity, not a guaranteed saving: some extraction and posting work remains, and failure capture needs design.

2. **Two full source ESLint traversals overlap heavily.** [package.json](../../package.json) invokes normal lint and `lint:debt`; [checkLintDebt.ts](../../scripts/checkLintDebt.ts) scans `src` again using [eslint.config.audit.mjs](../../eslint.config.audit.mjs). Consolidating traversal and diagnostics is worth investigating given the timings above. **Do not simply delete normal lint:** eight normal error rules become warnings in the audit config, including optional chaining, readonly, accessibility, destructuring, and arrow style. The audit also enables rules normal lint intentionally does not enforce. A combined pass must preserve normal error severity, the normal warning cap, audited debt ceilings, exclusions, and later AST checks. Benchmark the final combined pass rather than assuming all 2m57s disappears.

3. **The daily integrity schedule reruns source-only checks.** `fabricated-fallback-scan` in [monica-integrity.yml](../../.github/workflows/monica-integrity.yml) has no event condition. It performs two source scans, a dependency install, Python setup, and nine pytest invocations on the daily schedule. The latest scheduled [source-check job](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38279190901/job/114912013597) took **47s**, while the independent database monitor ran beside it. Restrict the source job to push/PR events, retaining the database monitor's daily schedule. This removes one source-validation job per scheduled run. Monitor concurrency should also distinguish scheduled monitoring from replaceable PR work: the current ref-only group with cancellation allows a master push and schedule to cancel one another.

4. **Reduce cold setup and scope specialist work.** Current workflows do not restore a Bun package cache or the ESLint cache across runners. Evaluate caching the actual Bun package directory with a key including OS, Bun version and lockfile; retain frozen installation. Content-based ESLint caching can help unchanged files if correctly keyed to lint/config/tool inputs, but type-aware cross-file changes need invalidation. Rust/WASM and all nine pre-merge SQL checks currently run even for unrelated PRs. Use complete input/dependency filters and keep the required check results present. Rust was only 21s in this warm-cache sample, so prioritize the larger ESLint work. Do not add workflow-level path filters that leave required checks pending; see the [official-mechanics note](ci-actions-mechanics-2026-10-13.md).

5. **README-only Pages pushes redeploy identical documentation.** [gh-pages.yml](../../.github/workflows/gh-pages.yml) triggers on root `README.md`, but uploads only `./docs` and has no copy or rendering step involving that README. Remove this trigger unless a documentation dependency is deliberately added.

## Existing improvements and limits

The branch removes unused graphics-package installation, uses shallow Build/Test checkouts, removes LFS setup, restricts Monica feature-branch execution to PRs, and partitions Jest gate helpers from application tests. These are supported by source inspection and successful PR jobs.

Cheap Jest discovery found **542 tracked application suites** and **16 tracked gate suites**, with no overlap: 558 combined. A follow-up discovery using the actual base-commit Jest configuration confirmed that the partition removes **16 previously duplicated suites**. The old `strictIndex` exclusion was stale: no such suite exists at either the base or current commit, so that pattern excluded nothing. This corrects the initial audit's mistaken count of 15. `verify` still combines the dedicated gate partition and application tests. Plain `test` now intentionally covers only the application partition. Two additional local Finder-copy tests are untracked and are not checked out by CI.

The typegen presence guard in `checkLintDebt.ts` is safe inside `verify:static` because `typecheck` generates fresh route types earlier. It is weaker for standalone `lint:debt` and ratchet commands: directory existence does not establish freshness after a route edit or checkout change. Prefer standalone generation by default and an explicit skip only in the chain that has just generated types. This is a source-supported standalone-command risk, not an observed CI failure.

Do not attribute the full before/after Test or Build job reduction to removing duplicated tests: package installation, checkout, system dependencies and test selection changed together, and hosted-runner variance remains. No controlled per-change benchmark was performed.

## Checks that should remain

- **Verify, Build and Test:** [next.config.js](../../next.config.js) explicitly disables lint and TypeScript checking during builds. A successful build does not replace Verify; bundling and route-size checks add different coverage.
- **Scripts typecheck:** uses its own TypeScript project; application checking excludes scripts.
- **Scanner unit tests and source gates:** one validates the scanner's behavior, the other inspects current application source.
- **Python, host Rust, newly built WASM and committed WASM:** distinct runtimes/artifacts and failure modes. Their shared golden vectors are intentional.
- **SQL and production drift checks:** query behavior and evolving live data are independent of unit-test mocks. Keep daily data monitoring and the guarded nightly backfill.

The optimized configuration starts six GitHub runner jobs for a same-repo PR, five for a fork PR, and seven for a master push, plus Pages when applicable. Its two daily schedules start three jobs total. These counts exclude external Vercel checks and the extra feature-branch push job still present on unoptimized master.

## Current failures are not all redundant checks

The recent master and scheduled Monica data jobs failed at **Balances reconcile with their own ledger**. That is a live-data integrity failure and is not evidence for removing the check. The latest Dependabot Monica PR failed at **Require the database secret**, before SQL validation. Repeating that run without changing credential availability cannot fix it. Decide how dependency-bot SQL validation obtains an isolated test database or other authorized credential path; do not weaken validation or switch to privileged execution of untrusted PR code. Those problems are separate from the required-name blocker in PR #950.

## Token consumption

No direct model-inference step was found in the checked-in GitHub workflows or traced CI scripts. Normal builds, Jest, TypeScript and ESLint consume runner work; elapsed time does not establish LLM token usage. PR checks also include an external **Vercel Agent Review**, whose configuration, implementation and billing were not established by this repository audit.

The concrete agent-side opportunities are shorter routine logs and fewer unnecessary reruns: [jest.config.js](../../jest.config.js) currently enables `verbose: true`, and local pre-push runs full `verify` again. Retain useful failure diagnostics while saving full logs to a file/artifact and returning a concise result. Use existing CI results for the same SHA when appropriate; fetch step summaries first and only read the failed job's bounded logs when needed. Avoid repeated full-log polling. The existing `FAST_PUSH`/`SKIP_VERIFY` options skip the entire local gate, which is a policy choice rather than an optimization of its checks. No token amount was measured.

## Conditional GitLab findings

Only a GitHub remote is configured. GitLab execution or a mirror was not established, so [.gitlab-ci.yml](../../.gitlab-ci.yml) is not counted as realized cost. If active, it repeats an integration-name test subset and TypeScript checking; its PostgreSQL setup adds no coverage for the observed mock-based integration files. Its Docker validation precedes image building and swallows failures, and its linting quality job invokes two nonexistent package scripts then echoes success. It also builds Next separately and inside the frontend Dockerfile. These should be cleaned up if that pipeline is actually used.

GitHub lists three historical workflow IDs whose source files are absent from master's current four-file workflow directory. Their most recent runs were on 2026-02-06. They were excluded from current execution counts despite their API `active` labels.

## Validation performed

Read source and the optimization diff, resolved actual ESLint rule severities, discovered Jest partitions without running tests, examined successful PR job steps and filtered logs, read current master/scheduled job summaries, verified workflow blob identity, and read the active master ruleset. Only this report and the linked official-documentation research note were added. No workflow was dispatched, rerun, merged or reconfigured.
