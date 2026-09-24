/**
 * @jest-environment node
 *
 * public/ must hold real bytes, never Git LFS pointers.
 *
 * Vercel serves public/ verbatim and its builds do not fetch LFS objects, so
 * an LFS-stored asset ships to users as ~130 bytes of pointer text. That broke
 * /icon.png, /brand/logo.jpg, /icon.svg, /icons/**, and the ESMS token icons
 * that on-chain SPL metadata links to (ADR-015) — while CI stayed green,
 * because CI checks out with `lfs: true` and so saw the real files.
 *
 * Two independent failure modes, so two checks:
 *   1. A path under public/ resolving to the LFS filter. CI would smudge it to
 *      real bytes, so only the attribute reveals it.
 *   2. A pointer committed as a plain blob (no filter). Checkout writes the
 *      pointer text itself, so only the content reveals it.
 */

import { execFileSync } from "node:child_process";
import { closeSync, openSync, readSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const LFS_POINTER_HEADER = "version https://git-lfs.github.com/spec/v1";

function trackedPublicFiles(): string[] {
  return execFileSync("git", ["ls-files", "-z", "public"], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
}

function readHead(relPath: string, bytes: number): string {
  const fd = openSync(join(repoRoot, relPath), "r");
  try {
    const buf = Buffer.alloc(bytes);
    const read = readSync(fd, buf, 0, bytes, 0);
    return buf.subarray(0, read).toString("utf8");
  } finally {
    closeSync(fd);
  }
}

describe("public/ assets are served as real bytes", () => {
  const files = trackedPublicFiles();

  it("tracks public assets at all (guards against an empty scan)", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("routes no public/ path through the LFS filter", () => {
    // `git check-attr -z` emits NUL-separated <path> <attr> <value> triples.
    const out = execFileSync("git", ["check-attr", "-z", "--stdin", "filter"], {
      cwd: repoRoot,
      encoding: "utf8",
      input: files.join("\0"),
    }).split("\0");

    const lfsFiltered: string[] = [];
    for (let i = 0; i + 2 < out.length; i += 3) {
      if (out[i + 2] === "lfs") lfsFiltered.push(out[i] ?? "");
    }
    expect(lfsFiltered).toEqual([]);
  });

  it("contains no committed LFS pointer text", () => {
    const pointers = files.filter((f) =>
      readHead(f, LFS_POINTER_HEADER.length).startsWith(LFS_POINTER_HEADER),
    );
    expect(pointers).toEqual([]);
  });
});
