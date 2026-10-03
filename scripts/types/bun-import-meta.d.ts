/**
 * The two Bun `import.meta` fields scripts use. Scripts run under `bun`, but
 * bun-types is not installed, so without this `tsc -p scripts` reports them as
 * missing. Declared here rather than cast at each call site.
 *
 * Global on purpose (no import/export): it merges into the built-in ImportMeta.
 * Only scripts/tsconfig.json includes it; the root tsconfig excludes scripts/.
 *
 * @file scripts/types/bun-import-meta.d.ts
 */

interface ImportMeta {
  /** True when this module is the process entrypoint (`bun scripts/foo.ts`). */
  readonly main: boolean;
  /** Absolute path of the directory containing this module. */
  readonly dir: string;
}
