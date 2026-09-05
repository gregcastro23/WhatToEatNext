import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * `tsconfig.strict-index.json` used to exist to enforce
 * `noUncheckedIndexedAccess`. That flag has been true in the base config since
 * Phase 13 (50b15d51), so the project bought no signal over `bun run typecheck`
 * while costing a full 8 GB program build; it now carries
 * `exactOptionalPropertyTypes` instead.
 *
 * The one thing the old gate did provide was a pin: if someone weakened the
 * base config, the gate would still enforce the flag. These assertions restore
 * that pin at ~0 cost instead of paying for a second whole-program compile.
 */
const repoRoot = path.resolve(__dirname, "../../..");

function readJsonc(relPath: string): Record<string, unknown> {
  const raw = readFileSync(path.join(repoRoot, relPath), "utf8");
  // Strip // line comments; the configs use them and JSON.parse will not.
  return JSON.parse(raw.replace(/^\s*\/\/.*$/gm, "")) as Record<
    string,
    unknown
  >;
}

describe("tsconfig strictness pins", () => {
  const base = readJsonc("tsconfig.json").compilerOptions as Record<
    string,
    unknown
  >;

  it("keeps strict mode on", () => {
    expect(base.strict).toBe(true);
  });

  it("keeps noUncheckedIndexedAccess on in the BASE config", () => {
    // Turning this off silently reintroduces the defect class that Phase 13
    // cleared and that caused ~48% of tracked lint debt before it.
    expect(base.noUncheckedIndexedAccess).toBe(true);
  });

  it("keeps noFallthroughCasesInSwitch on", () => {
    expect(base.noFallthroughCasesInSwitch).toBe(true);
  });

  it("points the strict-flags project at a tier the base config lacks", () => {
    // If these ever agree, the strict-flags gate is a redundant 8 GB no-op
    // again and must be re-pointed at the next tier (or retired).
    const strictProject = readJsonc("tsconfig.strict-index.json")
      .compilerOptions as Record<string, unknown>;
    expect(strictProject.exactOptionalPropertyTypes).toBe(true);
    expect(base.exactOptionalPropertyTypes).not.toBe(true);
  });
});
