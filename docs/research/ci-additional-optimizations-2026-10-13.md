# Additional CI optimization opportunities

Date: 2026-10-13. Follow-up to [the first audit](ci-efficiency-audit-2026-10-13.md), concentrating on opportunities beyond lint-pass consolidation, code-health reuse, the daily source-check cron, and routine log verbosity. Current inspected source is optimization branch `a69ee07b`; PR #950 remains open. Its required-check naming mismatch remains a prerequisite to rolling out those changes.

## Recommended next changes

| Priority | Change | Evidence and expected effect |
| --- | --- | --- |
| 1 | Persist the Build leg's `.next/cache` | Its successful PR log explicitly reported no build cache, then spent roughly two minutes compiling. Warm build improvement is a candidate, not yet measured. |
| 2 | Let setup-bun read the existing package-manager pin | All seven declarations force `latest`, which disables the action's Bun executable cache and overrides `bun@1.3.13`. The recorded Build used Bun 1.4.3. |
| 3 | Move cheap rejection gates ahead of typed lint | An assertion or JSON-policy violation currently reaches rejection after approximately 6m27s of lint. Saves failed-run work without removing checks. |
| 4 | Give Jest's VM direct access to `Math`, after full-suite validation | Paired local corpus runs fell from 21.8–23.7s to 6.6–7.8s; all 64 tests passed in each run. This is a corpus-only result, not a hosted-CI saving. |
| 5 | Restore Bun's actual package cache | Five installs cost 91s of aggregate PR runner work. A package-cache restore may reduce this; a serialized install/artifact job can instead add latency. |
| 6 | Include Rust build-script flags in the Rust cache key | The script sets `RUSTFLAGS` after the cache action computes its key, allowing changed flags to miss invalidation. No current slowdown was measured. |

These target different outcomes. Build/Test improvements reduce those jobs' runner work, but Verify was the slowest job at 8m43s; they will not by themselves remove that successful-PR bottleneck. Cheap-gate ordering can improve the delay before certain failures substantially. Do not add estimates from parallel jobs together and call the sum a pipeline-time saving.

## Cache the build, with bounded compatible keys

Evidence: [Build job 114943180627](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663900/job/114943180627) reported the missing cache at `18:06:57.949`, completed compilation around `18:09:00.629`, then generated 115 pages. [ci.yml](../../.github/workflows/ci.yml) has no Next cache persistence.

Restore **`.next/cache` only**, then still run the complete build and route-size check. Use a cache schema/version, runner OS/architecture, runtime/dependency/config inputs, and a source-specific primary key; use a compatible prefix to restore a previous source revision. Save the updated cache after the producer build. An exact cache key is immutable, so a constant lockfile-only key can repeatedly restore an old entry without saving newly generated contents. Do not treat a restored complete `.next` tree or route-type directory as proof of a fresh build/typecheck. This recommendation follows [Next 15's CI cache guidance](https://nextjs.org/docs/15/pages/guides/ci-build-caching) and [actions/cache save semantics](https://github.com/actions/cache/blob/v4/README.md).

Measure restore/save time and compressed size. This machine's cache is **2.7GB**, almost entirely Webpack data; that is a local observation, not the size of a clean Linux CI cache. A large upload can erase a small compiler improvement. Keep build caching separate from dependency caching, and consider retention of obsolete source keys. Vercel already configures its own Next build cache; the missing persistence found here is in GitHub Actions.

## Stop overriding the Bun pin

[package.json](../../package.json) declares `bun@1.3.13`; every setup-bun declaration in the three Bun-consuming workflows instead sets `bun-version: latest`. The recorded Build downloaded 1.4.3 and `check-version.cjs` printed a mismatch warning.

The [setup-bun documentation](https://github.com/oven-sh/setup-bun#usage) says omitted version input reads `packageManager`, and its [v2 implementation](https://raw.githubusercontent.com/oven-sh/setup-bun/v2/src/action.ts) disables executable caching for moving versions. Use the existing pin as the single source of truth rather than introducing another hard-coded version. This reduces executable downloads and runtime drift; no saved-time amount was measured. It does not create a package dependency cache.

## Reject invalid changes sooner

In [package.json](../../package.json), `verify:static` currently places `check:read-json`, `check:bare-json`, and `check:diff-assertions` after normal lint and lint-debt. Those syntax/diff checks can execute earlier, after dependency installation, without waiting for typed lint. Retain all existing gates and their limits. The current `&&` chain already stops at the first failure, so this changes which failure appears first rather than reducing successful-run coverage. A cast violation could be rejected before spending the measured 6m27s in two ESLint phases.

There is also smaller scope for batching the diff assertion gate's Git calls: it invokes `git cat-file` and `git diff` for each changed file in [diffAssertions.ts](../../scripts/lib/diffAssertions.ts). A single unified diff plus shared blob/file handling could reduce roughly two subprocesses per changed source file. Preserve rename/new-file/line-overlap behavior; no large-refactor benchmark was run.

## Optimize the expensive numerical test, preserving its cases

The recorded [Test job](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663900/job/114943180508) passed 542 suites / 5,482 tests in 117.381s of Jest execution. [corpus.test.ts](../../src/lib/search/__tests__/corpus.test.ts) took 34.466s, including a 22.480s typo sweep. This makes it a concrete target rather than a reason to remove catalog coverage.

Jest provides `sandboxInjectedGlobals`, allowing direct VM access to a hot global such as `Math`; see [the official configuration reference](https://jestjs.io/docs/configuration#sandboxinjectedglobals-arraystring). The local experiment kept the corpus's 64 tests and existing test cache policy, using temporary JSON configuration only. In baseline → Math → Math → baseline order, elapsed process times were **21.792s → 7.797s → 6.598s → 23.712s**, with all 64 tests passing each time. The repeated reversal supports an improvement beyond simply warming the transform cache. These are local same-harness measurements, not a forecast for the entire CI suite. Details and limits are recorded in [the test-performance note](ci-test-performance-2026-10-13.md). Validate the full existing suite before applying a global setting. The documented option does not affect native ESM; a future runtime-mode change needs reevaluation.

Do not assume that switching mathematical tests to Node is faster: the investigated corpus became slower in the initial Node-environment comparison. Also, `isolatedModules: true` is already inherited by ts-jest here, so enabling it is not a new optimization. Application and script typechecks exclude test roots; they cannot be cited as full semantic checking of the tests themselves.

## Cache packages rather than shipping an installed dependency tree

setup-bun's executable cache is separate from Bun's package cache. Restore `~/.bun/install/cache` with compatible OS/architecture, pinned Bun and dependency keys, and retain `bun install --frozen-lockfile`. The [official cache example](https://github.com/actions/cache/blob/main/examples.md#bun) documents the package directory.

The five current PR installations cost 18s + 19s + 20s + 19s + 15s. Their parallel execution means this is 91 seconds of runner work, not 91 seconds of elapsed PR delay. Measure the package cache's own transport overhead before estimating a reduction.

Avoid assuming an “install once” job is better: all consumers must wait for it, and compressing/downloading `node_modules` adds work. The local installed tree is **3.8GB**, and portability depends on matching native package/runtime/OS inputs. Package cache reuse preserves installation validation and avoids making a separate setup job the pipeline barrier. The [GitHub artifacts/cache distinction](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts#artifacts-versus-dependency-caching) supports treating these as different mechanisms.

## Correct Rust cache invalidation

[ci.yml](../../.github/workflows/ci.yml) invokes `Swatinem/rust-cache` before [build-thermo-wasm.sh](../../scripts/build-thermo-wasm.sh) introduces its remap `RUSTFLAGS`. The action reads environment inputs while computing its restore key; its manifest-derived key does not include that script. If flags change while its key inputs remain stable, Cargo recompiles but the unchanged exact-hit cache is not subsequently replaced. Include the build-script hash in the action key, or define the same effective flags before restore and compilation without appending them twice. Evidence: [key source](https://raw.githubusercontent.com/Swatinem/rust-cache/v2/src/config.ts), [save source](https://raw.githubusercontent.com/Swatinem/rust-cache/v2/src/save.ts).

The existing action already caches `~/.cargo/bin` by default, so an extra wasm-bindgen executable cache is not automatically needed. Rust took only 21s in the inspected warm run; treat this as cache correctness and prevention of later recompilation, not a demonstrated large saving today.

## Smaller or deferred opportunities

- **Profile the configuration CI actually runs:** the existing `lint:profile` script uses `eslint.config.fast.mjs`, while CI's normal and debt passes use the comprehensive and audit configurations. `TIMING=1 bun run lint` and the equivalent audit measurement would expose the relevant rule workload. Do not assume the first reported typed rule alone is responsible: it can absorb TypeScript initialization cost. Compare suspect rules separately with consistent conditions, preserving required checks. [typescript-eslint profiling guidance](https://typescript-eslint.io/troubleshooting/typed-linting/performance/).
- **Targeted history:** Verify fetches full history of every branch/tag, while its diff gate needs a resolvable base, merge base and base blobs. A verified synthetic PR merge plus its explicit event base can allow a narrower fetch. Keep fallback/deepening for missing history and separate handling for push events. Simply changing depth to 1 would break current default base resolution. [GitHub PR merge behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request), [checkout history controls](https://github.com/actions/checkout/blob/v6/README.md).
- **Redundant safe-directory steps:** checkout@v6 already sets a safe directory by default; the explicit steps repeat that in the three matrix legs plus the same-repo SQL job. Removing four steps per same-repo PR is tidy but only a minor performance opportunity. [checkout default](https://github.com/actions/checkout/blob/v6/README.md).
- **Shared syntax indexing:** several scanners independently read/parse the same source. A shared inventory and lazy AST store can keep their independent checks. Seven syntax scans measured about 3.6s combined locally; this is much less urgent than minutes of typed lint. Cache parsed edges/results by content and scanner/config version, then aggregate the complete corpus; do not substitute changed-file counts for whole-repository debt ceilings.
- **Jest cache transport:** `.jest-cache` is not restored by CI, but the local directory is 952MB. Benchmark restore/compression before persisting it. Blanket resets or environment changes also require evidence; retain existing isolation unless full-suite behavior has been verified.
- **Targeted test setup and fixtures:** `resetModules: true` resets the registry before every test. A single local 52-test canonical-suite comparison passed with elapsed time falling from 6.539s to 4.804s when blanket resets were disabled; this is preliminary, not full-suite independence evidence. Keep explicit isolation for lifecycle tests. The loader-degradation suite also loads real static catalogs despite testing lifecycle behavior; smaller injected catalog fixtures could preserve those checks while the separate exhaustive corpus suite continues guarding real data. Unconditional DOM setup can likewise be separated from pure/server setup, preserving fetch safety. Details are in the linked test-performance note.
- **Changed-file classification:** use narrowly defined input categories and preserve stable required check results. A sample of the latest 30 merged PRs, covering September 29 through October 12, contained zero PRs limited to README/LICENSE or Markdown under research/plans/ADRs/runbooks. That specific prose-only shortcut therefore has limited immediate payoff in the sample. Never skip all `docs/**`: two tests consume `docs/physics/esms_conformance.json` as a golden fixture.
- **Sharding:** Test was already substantially shorter than Verify. Extra test shards add runner setup/install cost and do not currently fix the overall critical path; do not prioritize them solely for a faster Test label.
- **Conditional GitLab:** if its mirror is active, split dependency/build/lint caches. The current setup job is their only writer, while producer jobs use `policy: pull`, so new build/lint caches are not saved. GitLab execution remains unverified.

No large accidental tracked TypeScript root was found. Cheap local config parsing showed 2,328 roots; 56 generated Spacetime files total only 60.9KB. Two scratch analyzers leak into local typechecking but are Git-ignored, so they do not establish hosted-CI overhead. Imported runtime data remains necessary even if excluded from initial root discovery. Do not remove such files solely to shrink the apparent program.

## Follow-up correction and verification

The first audit's 15-suite duplicate count was incorrect. The baseline `strictIndex` ignore pattern was stale and matched no existing file. Loading the actual base configuration and running discovery found all 16 gate suites in the general partition; the new split removes **16** duplicate executions. The first report has been corrected.

Only research notes were written. Inspection used current source, recorded successful job logs, official documentation/action implementation, a bounded PR-file sample, cheap config/discovery scans, and a limited test benchmark. No full verification chain/build or new GitHub Actions run was started. The targeted test benchmark is deliberately smaller than a complete rollout validation.
