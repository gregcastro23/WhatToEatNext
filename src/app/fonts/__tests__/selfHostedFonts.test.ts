/**
 * @jest-environment node
 *
 * The self-hosted fonts must reach every build as real woff2 bytes.
 *
 * `.gitattributes` routes `*.woff2` through Git LFS, and Vercel's builder does
 * not fetch LFS objects. A font stored as an LFS pointer would reach
 * next/font/local as ~130 bytes of pointer text. The build only logs a fontkit
 * error, then ships a "font" that every browser rejects. CI checks out with
 * `lfs: true`, so the on-disk bytes look fine there. The attribute check is
 * the one that sees what Vercel sees.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FONTS_DIR = path.resolve(__dirname, "..");
const SRC_PATH = /path: "\.\/([^"]+\.woff2)"/g;

function committedFonts(): string[] {
  return fs
    .readdirSync(FONTS_DIR, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".woff2"))
    .sort();
}

function referencedFonts(): string[] {
  const referenced = new Set<string>();
  const modules = fs.readdirSync(FONTS_DIR).filter((file) => file.endsWith(".ts"));
  for (const moduleFile of modules) {
    const source = fs.readFileSync(path.join(FONTS_DIR, moduleFile), "utf8");
    for (const [, file] of source.matchAll(SRC_PATH)) {
      if (file !== undefined) referenced.add(file);
    }
  }
  return [...referenced].sort();
}

describe("self-hosted fonts", () => {
  const fonts = committedFonts();

  it("are exactly the files the localFont() calls reference", () => {
    expect(fonts.length).toBeGreaterThan(0);
    expect(referencedFonts()).toEqual(fonts);
  });

  it("are not routed through Git LFS", () => {
    const attributes = execFileSync("git", ["check-attr", "filter", "--", ...fonts], {
      cwd: FONTS_DIR,
      encoding: "utf8",
    });
    const lfs = attributes.split("\n").filter((line) => line.endsWith(": lfs"));
    expect(lfs).toEqual([]);
  });

  it("are woff2 on disk", () => {
    const notWoff2 = fonts.filter((file) => {
      const magic = fs.readFileSync(path.join(FONTS_DIR, file)).subarray(0, 4);
      return magic.toString("latin1") !== "wOF2";
    });
    expect(notWoff2).toEqual([]);
  });
});
