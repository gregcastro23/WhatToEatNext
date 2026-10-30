# GitHub Actions mechanics for the CI efficiency audit

**Date checked:** 2026-10-13 · **Scope:** triggers, concurrency, required checks, dependency/build caches and cost terminology.
**Evidence tags:** **READ** = official documentation or maintained action source; **INFERRED** = recommendation derived from those mechanics. This note does not establish this repository's live branch-protection settings or measured runner usage.

## Triggers and obsolete runs

- **READ:** Multiple matching events create separate workflow runs. Thus a workflow accepting feature-branch `push` and `pull_request` can launch twice for an update to an open PR. Restricting push validation to integration branches avoids that overlap. [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#using-multiple-events).
- **READ:** Default PR activity types are `opened`, `synchronize` and `reopened`. PR validation normally checks out the simulated merge result; it is not necessarily the same code as a branch-push run. **INFERRED:** Preserve PR validation when deduplicating triggers. [GitHub PR events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request).
- **READ:** A concurrency group normally permits one running and one pending run; newer pending work replaces the older pending run. `cancel-in-progress: true` additionally cancels the running member. **INFERRED:** It is appropriate for obsolete read-only PR validation, but requires separate reasoning for writes and monitoring. [GitHub concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).
- **READ:** Groups are repository-wide. Include workflow identity to prevent unrelated workflows cancelling each other. `github.head_ref` is defined for PR events; mixed-event expressions need a fallback. [GitHub concurrency examples](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#example-only-cancel-in-progress-jobs-or-runs-for-the-current-workflow).

## Required checks and selective execution

| Selection mechanism | Official behavior | Audit constraint |
| --- | --- | --- |
| Whole workflow skipped by paths, branches or commit message | Associated required checks remain Pending | Do not add whole-workflow filtering before verifying required-check settings. |
| Individual job skipped by `if` | Reports Success | Conditional jobs can avoid expensive work while still reporting a check. |
| Dependent job skipped after an upstream failure | May not block merging | A required final result job should run with `always()` and explicitly reject failed/cancelled required dependencies. |

**READ:** All three behaviors are documented in [GitHub required-check troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks#handling-skipped-but-required-checks). **INFERRED:** An always-triggered workflow with a cheap change classifier, conditional heavy jobs and a final result check preserves a reliable merge gate. Expected skips must be distinguished from failure-induced skips.

**READ:** Merge queues require `merge_group` in addition to ordinary PR triggers. **INFERRED:** Verify whether a merge queue is enabled before narrowing events. [GitHub required-check troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks#checks-from-some-workflow-jobs-are-not-evaluated).

## Cache semantics

- **READ:** `actions/setup-node@v4` supports npm/yarn/pnpm global package caches and does not cache `node_modules`; `cache-dependency-path` chooses files for its key, not the directory being cached. **INFERRED:** `cache: npm` plus a Bun lockfile does not become a Bun package cache. [setup-node v4 README](https://github.com/actions/setup-node/blob/v4/README.md#caching-global-packages-data).
- **READ:** Bun's registry cache defaults to `~/.bun/install/cache`, configurable through `BUN_INSTALL_CACHE_DIR` or `bunfig.toml`; Bun uses it to populate `node_modules`. **INFERRED:** Cache the directory consumed by the actual installer, and retain dependency installation when restoring package data alone. [Bun global cache](https://bun.sh/docs/pm/global-cache).
- **READ:** `actions/cache@v4` does not create a new cache after an exact primary-key hit. On a miss it saves when the job succeeds. Restore-key matches can be stale; changed dependencies still need installation. `cache-hit == 'true'` means an exact hit, not simply that any files were restored. [cache v4 README](https://github.com/actions/cache/blob/v4/README.md#usage).
- **INFERRED:** If one job saves a key containing `node_modules` and an empty `.next/cache` before a build, a later exact-hit build cannot update that cache with its newly generated Next.js files. Separate dependency and build caches; give build caches keys that allow new entries while using restore prefixes for reuse. This follows the exact-hit rule above.

## Scheduled production monitoring

- **READ:** Scheduled workflows execute only from the default branch; high load can delay or drop scheduled jobs, especially at the start of an hour. [GitHub schedule event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
- **INFERRED:** A scheduled production check and a push/manual run on the same default-branch ref can share a concurrency group. With cancellation enabled, one can interrupt the other and prevent the monitor from finishing. Include event purpose in the group or restrict cancellation to replaceable PR work. This follows the concurrency rule above.
- **INFERRED:** Keep serialization without cancellation for production writers whose interruption can leave partial work. Do not assume concurrency preserves every queued run; the default pending-run replacement behavior is separate from running-run cancellation.

## Runner time and model tokens

**READ:** GitHub Actions usage concerns runner minutes and storage; standard hosted runners for public repositories are free, while private repositories receive plan-dependent allowances. [GitHub Actions billing](https://docs.github.com/en/actions/concepts/billing-and-usage).

**INFERRED:** A deterministic build, lint or unit-test command consumes compute time rather than LLM inference tokens unless it or a called service actually invokes a model. Redundant CI can indirectly consume agent tokens when an assistant repeatedly reads logs, diagnoses avoidable failures or polls status. Report runner-minute savings and model-token savings separately; neither a test count nor a workflow duration establishes model usage.
