# Jest performance evidence for the CI audit

**Date checked:** 2026-10-13 · **Scope:** current Jest configuration, an existing successful CI run, and small local experiments. **READ** means code/official documentation; **MEASURED** means downloaded job logs or bounded local probes; **INFERRED** means a proposed improvement. Only this research note was added; no test, workflow or configuration files were changed.

## Existing CI evidence

**MEASURED:** [Test job 114943180508, run 38288663900](https://github.com/gregcastro23/WhatToEatNext/actions/runs/38288663900/job/114943180508) ran Jest 30.4.2 and ts-jest 29.4.9 on 2026-10-12. All 542 suites passed; 5,482 tests passed and 10 were skipped. Jest reported **117.381 seconds**. Suite durations overlap because CI uses two workers; their sum is not elapsed job time.

| Slow suite | Reported duration | Relevant detail |
| --- | ---: | --- |
| `src/lib/search/__tests__/corpus.test.ts` | 34.466 s | Self-name sweep: 7.554 s; exhaustive typo recovery: 22.480 s. |
| `src/lib/search/__tests__/loaderDegraded.test.ts` | 7.903 s | Four lifecycle tests each take 1.851–2.084 s. |
| `src/app/__tests__/canonicals.test.ts` | 7.173 s | Dynamically loads real route modules across 52 checks. |
| `src/__tests__/physics/esmsOscillator.test.ts` | 6.668 s | Numeric physics coverage. |
| `src/__tests__/thermodynamicAffinityCalibration.test.ts` | 5.691 s | Real population/calibration computation. |
| `src/components/nav/omnibar/__tests__/OmnibarShell.test.tsx` | 5.245 s | Actual browser/component suite. |

The job logs contain no observed exceeded-timeout, open-handle, forced-exit or late-microtask messages. There are no transform-cache hit statistics. `.github/workflows/ci.yml` restores no Jest cache across jobs/runs; built-in caching still operates within the process/job. These observations do not prove that every suite is leak-free.

## A measured improvement without deleting coverage

**MEASURED:** Tested the complete 64-test corpus suite locally with Node 22.23.1, Jest 30.4.2, ts-jest 29.4.9, `CI=true`, a 2 GiB Node heap, `--runInBand`, `--silent`, `--verbose=false` and the default reporter. Both variants used the same harness, merging the existing configuration into temporary JSON arguments, and the existing `.jest-cache` policy. The sole variant change was `sandboxInjectedGlobals: ["Math"]`. Results/logs were saved under `/tmp/ci-test-perf-*`; each invocation had a 55-second limit.

| Execution order | Process elapsed | Suite duration | Passed |
| --- | ---: | ---: | ---: |
| Baseline, first pair | 21.792 s | 21.075 s | 64 |
| Inject Math, first pair | 7.797 s | 7.063 s | 64 |
| Inject Math, reversed pair | 6.598 s | 5.750 s | 64 |
| Baseline, reversed pair | 23.712 s | 23.030 s | 64 |

The expensive typo test itself took **13.936/16.553 s** on baseline and **3.940/3.167 s** with Math injection; the self-name test took **4.506/4.755 s** versus **1.408/1.081 s**. The difference persists within test execution, beyond transform/startup timing. A preliminary baseline/Node-environment comparison passed all 64 tests but was slower with Node: **23.835 s versus 43.460 s** elapsed. Do not assume changing every non-DOM suite to Node will improve runtime.

**READ:** Jest documents faster VM global lookups through `sandboxInjectedGlobals`, including Math, and says the setting has no effect under native ESM. [Jest 30.4 configuration](https://jestjs.io/docs/30.4/configuration#sandboxinjectedglobals-arraystring).

**INFERRED:** Math injection is the strongest additional candidate to validate in CI. It preserves the exhaustive search checks. Static searches found no test assignments, spies or property replacements involving Math in `src`, `tests` or gate suites. Those searches and 64 passing tests do not replace full-suite validation after an implementation change. These are **corpus-only local measurements**, not predicted whole-CI savings.

## Configuration opportunities and constraints

- **READ:** `clearMocks: true` clears call state; `restoreMocks: true` restores spies/replaced properties. They serve different purposes. `resetMocks` is absent; enabling it would also remove mock implementations. [Jest mock semantics](https://jestjs.io/docs/jest-object#jestclearallmocks), [Jest resetMocks](https://jestjs.io/docs/configuration#resetmocks-boolean).
- **READ:** `resetModules: true` resets the module registry before every test, beyond Jest's existing isolation between files. [Jest resetModules](https://jestjs.io/docs/30.4/configuration#resetmodules-boolean). **MEASURED:** One local canonical-suite pair passed all 52 tests with elapsed **6.539 s** at the current setting versus **4.804 s** with `resetModules: false` (suite 5.865 versus 4.264 s). This single pair is preliminary. **INFERRED:** Evaluate replacing blanket resets with explicit isolation where mutable singleton state requires it. The canonical tests repeatedly import shared route/layout graphs; loader lifecycle tests explicitly require fresh state and call `jest.isolateModules`. Full-suite independence remains unverified.
- **READ:** Both setup files execute for every suite. The shared setup unconditionally imports React and DOM matchers, installs observers/matchMedia where applicable, and installs cleanup/error handling. [Jest setup lifecycle](https://jestjs.io/docs/30.4/configuration#setupfiles-array). **INFERRED:** Split DOM setup from core/network-safety setup when environments are classified. Preserve the rejecting fetch stub in both environments; it prevents previously observed real-socket leaks.
- **MEASURED:** A source inventory found 536 `.test`/`.spec` files under `src` and `tests`: 115 explicitly use Node, 21 explicitly use jsdom, and 400 inherit jsdom. Of the latter, 186 are in API/lib/service directories; directory location does not establish whether they depend on browser behavior. Per-suite environment docblocks are supported. [Jest environments](https://jestjs.io/docs/configuration#testenvironment-node--jsdom--string).
- **READ:** `loaderDegraded.test.ts` mocks the live recipe service but still calls the real static `getServerRecipes` path and builds catalogs after fresh loader imports. **INFERRED:** Lifecycle-only tests may use small static-catalog fixtures while the separate corpus suite continues validating actual catalogs. Do not remove the corpus coverage merely because it is slower.

## TypeScript, caching and parallelism

**MEASURED:** Parsing the actual configs through TypeScript and instantiating installed ts-jest's `ConfigSet` confirms **isolatedModules is already true**, inherited by `tsconfig.jest.json`. Its compiler uses per-file transpilation. Adding that option again is not a new optimization. Official ts-jest documentation says isolated mode loses full typechecking; disabling diagnostics may give only slight improvement. [ts-jest isolatedModules](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules), [ts-jest diagnostics](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/diagnostics).

The parsed root-file lists of `tsconfig.json`, `scripts/tsconfig.json` **and** `tsconfig.jest.json` contain zero `.test.ts/.tsx` or `.spec.ts/.tsx` roots because of excludes. Imported dependencies can still be checked by TypeScript, but the separate app/scripts checks do not establish complete semantic typechecking of test files. Do not justify disabling diagnostics by claiming that coverage already exists.

**READ:** Jest caches transformations and invalidates on source/config changes. [Jest transforms](https://jestjs.io/docs/code-transformation). **MEASURED:** The existing local `.jest-cache` was approximately 952 MiB before benchmarks. **INFERRED:** Evaluate persistent cache restore/save time and size before adding it; a large cache transfer can erase compile savings. The current job does not expose evidence to quantify that tradeoff.

**READ:** Jest sharding distributes suites, while open-handle detection implies serial execution and carries a significant performance penalty. [Jest sharding](https://jestjs.io/docs/cli#--shard), [open-handle detection](https://jestjs.io/docs/cli#--detectopenhandles). **INFERRED:** Additional shards can reduce waiting while repeating runner/setup/install work; they do not intrinsically reduce total runner minutes, and do not split the single exhaustive typo test. Keep open-handle tracing for diagnosis. Current `maxWorkers: 2` and `workerIdleMemoryLimit: "1GB"` should be benchmarked against actual runner resources before changing them.

**READ:** Physics suites import `docs/physics/esms_conformance.json` directly (`esmsConformance.test.ts`, `unifiedEngineWitness.test.ts`). **INFERRED:** Any selective-testing plan must retain these fixtures as relevant inputs; a blanket `docs/**` skip would omit meaningful validation.
