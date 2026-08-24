/**
 * SPL Token-2022 ESMS Metadata & Icon Fixture Verification (ADR-015 / Prompt K0).
 *
 * Verifies that the public static metadata JSON manifests and SVG icons:
 * 1. Match pinned SHA-256 digests matching AlchmAgentsSolana at commit 7183c95.
 * 2. Carry enum-pinned names ("Spirit", "Essence", "Matter", "Substance"), symbols ("SPIRIT", ...), decimals (4).
 * 3. Pass strict SVG security criteria (zero <script>, zero <foreignObject>, zero external URLs).
 * 4. Are unshadowed by Next.js redirects() or middleware matcher rules.
 * 5. Receive spec-valid static CORS headers (GET,OPTIONS only, no credentials) and must-revalidate caching.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TOKENS = ["spirit", "essence", "matter", "substance"] as const;
type TokenKey = (typeof TOKENS)[number];

/** Authoritative SHA-256 digests pinned to AlchmAgentsSolana@7183c95. */
const PINNED_DIGESTS: Record<string, string> = {
  "metadata/esms/spirit.json": "0cb525797ecab5007030da9882a8af288b1ab203e9054bb523f413e95b0a5dc5",
  "metadata/esms/essence.json": "770af5bd11c1f312dc598db6e556c99a15f0800d2167d8cbf0dbad3d964d6301",
  "metadata/esms/matter.json": "3dbfa64753f41c9f6c1cd48be1d2e99bc31abad65b295b8dedb514d38084503f",
  "metadata/esms/substance.json": "83c0a12137a619c32ff9c56bcb7bc73986470c1aa5c7f84cbcdf865821ed1069",
  "icons/esms/spirit.svg": "d2a8105f4906f9cd18c32739c99e81242a0c0db70b726411a79270dfea4f1737",
  "icons/esms/essence.svg": "2f3935f041f9486302e1bb7a8e43456a43b427adb953b2ddc9bbc54908c4819b",
  "icons/esms/matter.svg": "89700503a70d834976efa6f3bdd08b64c65971e450c1ccf01f8eb81f3f68309f",
  "icons/esms/substance.svg": "fb8aad0ad4aaa6e526c4d0efc7fdf2470ae86bbe802e3d400f516fbc51020b20",
};

const TOKEN_IDENTITY: Record<
  TokenKey,
  {
    name: string;
    symbol: string;
    element: string;
  }
> = {
  spirit: { name: "Spirit", symbol: "SPIRIT", element: "Fire" },
  essence: { name: "Essence", symbol: "ESSENCE", element: "Water" },
  matter: { name: "Matter", symbol: "MATTER", element: "Earth" },
  substance: { name: "Substance", symbol: "SUBSTANCE", element: "Air" },
};

function sha256(content: Buffer | string): string {
  return createHash("sha256").update(content).digest("hex");
}

function parseMiddlewareMatcher(rootDir: string): string[] {
  const src = readFileSync(join(rootDir, "src", "middleware.ts"), "utf8");
  const start = src.indexOf("matcher:");
  if (start === -1) throw new Error("middleware.ts: no `matcher:` key found");
  const open = src.indexOf("[", start);
  const close = src.indexOf("]", open);
  if (open === -1 || close === -1) {
    throw new Error("middleware.ts: matcher array is not delimited");
  }

  const body = src
    .slice(open, close)
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");

  const entries = [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (entries.length === 0) {
    throw new Error("middleware.ts: parsed 0 matcher entries");
  }
  return entries;
}

/** Parses header rules specifically from next.config.js text. */
function parseHeaderRule(
  nextConfigSrc: string,
  targetSource: string,
): { key: string; value: string }[] | null {
  const start = nextConfigSrc.indexOf("async headers()");
  if (start === -1) return null;
  const end = nextConfigSrc.indexOf("async redirects()", start);
  if (end === -1) return null;
  const body = nextConfigSrc.slice(start, end);

  // Find target source block
  const sourceIdx = body.indexOf(`source: "${targetSource}"`);
  if (sourceIdx === -1) return null;

  // Find the headers array in this entry
  const headersStart = body.indexOf("headers: [", sourceIdx);
  if (headersStart === -1) return null;
  const headersEnd = body.indexOf("],", headersStart);
  if (headersEnd === -1) return null;
  const headersContent = body.slice(headersStart, headersEnd);

  const entries: { key: string; value: string }[] = [];

  // Check if it spreads staticCorsHeaders
  if (headersContent.includes("...staticCorsHeaders")) {
    const staticCorsStart = body.indexOf("const staticCorsHeaders = [");
    if (staticCorsStart !== -1) {
      const staticCorsEnd = body.indexOf("];", staticCorsStart);
      const staticCorsBody = body.slice(staticCorsStart, staticCorsEnd);
      for (const m of staticCorsBody.matchAll(/{\s*key:\s*"([^"]+)",\s*value:\s*"([^"]+)"\s*}/g)) {
        entries.push({ key: m[1], value: m[2] });
      }
    }
  }

  // Check if it spreads api corsHeaders
  if (headersContent.includes("...corsHeaders")) {
    const corsStart = body.indexOf("const corsHeaders = [");
    if (corsStart !== -1) {
      const corsEnd = body.indexOf("];", corsStart);
      const corsBody = body.slice(corsStart, corsEnd);
      for (const m of corsBody.matchAll(/{\s*key:\s*"([^"]+)",\s*value:\s*"([^"]+)"\s*}/g)) {
        entries.push({ key: m[1], value: m[2] });
      }
    }
  }

  // Parse explicit header entries
  for (const m of headersContent.matchAll(/{\s*key:\s*"([^"]+)",\s*value:\s*"([^"]+)"\s*}/g)) {
    entries.push({ key: m[1], value: m[2] });
  }

  return entries;
}

describe("SPL Token-2022 Metadata & Icon Integrity (Prompt K0 / ADR-015)", () => {
  const rootDir = process.cwd();

  describe("SHA-256 Digest Pinning (Self-contained CI gate for AlchmAgentsSolana@7183c95)", () => {
    it.each(Object.entries(PINNED_DIGESTS))(
      "verifies %s matches pinned SHA-256 digest",
      (relPath, expectedDigest) => {
        const fullPath = join(rootDir, "public", relPath);
        expect(existsSync(fullPath)).toBe(true);

        const content = readFileSync(fullPath);
        const actualDigest = sha256(content);
        expect(actualDigest).toBe(expectedDigest);
      },
    );

    it("verifies byte-equality against sibling ASOL repository manifests if present", () => {
      const asolTokensDir = join(rootDir, "..", "AlchmAgentsSolana", "metadata", "solana", "tokens");
      if (!existsSync(asolTokensDir)) {
        // Self-contained digest pin above runs in CI; this validates live sibling working copy
        return;
      }

      for (const token of TOKENS) {
        const localPath = join(rootDir, "public", "metadata", "esms", `${token}.json`);
        const asolPath = join(asolTokensDir, `${token}.json`);

        const localContent = readFileSync(localPath, "utf8").trim();
        const asolContent = readFileSync(asolPath, "utf8").trim();

        expect(localContent).toBe(asolContent);
      }
    });
  });

  describe("Enum-pinned Token-2022 schema integrity", () => {
    it.each(TOKENS)("public/metadata/esms/%s.json conforms to on-chain SPL identity", (token) => {
      const manifestPath = join(rootDir, "public", "metadata", "esms", `${token}.json`);
      const raw = readFileSync(manifestPath, "utf8");
      const data = JSON.parse(raw);
      const identity = TOKEN_IDENTITY[token];

      // Exact enum-pinned identity
      expect(data.name).toBe(identity.name);
      expect(data.symbol).toBe(identity.symbol);
      expect(data.decimals).toBe(4);
      expect(data.image).toBeNull();

      // Attributes specification
      expect(Array.isArray(data.attributes)).toBe(true);
      expect(data.attributes).toHaveLength(4);

      const attrMap = Object.fromEntries(
        data.attributes.map((a: { trait_type: string; value: string | number }) => [
          a.trait_type,
          a.value,
        ]),
      );

      expect(attrMap.Element).toBe(identity.element);
      expect(attrMap.Decimals).toBe(4);
      expect(attrMap.Soulbound).toBe("Non-Transferable");
      expect(attrMap.BurnAuthority).toBe("Permissioned");
    });
  });

  describe("Techno-occult SVG icon assets and security constraints", () => {
    it.each(TOKENS)("public/icons/esms/%s.svg exists and satisfies Web3 SVG security gates", (token) => {
      const iconPath = join(rootDir, "public", "icons", "esms", `${token}.svg`);
      expect(existsSync(iconPath)).toBe(true);

      const svg = readFileSync(iconPath, "utf8");

      // Valid structure
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
      expect(svg).toContain('viewBox="0 0 512 512"');

      // Security gates: zero script, zero foreignObject, zero external fetches
      const lower = svg.toLowerCase();
      expect(lower).not.toContain("<script");
      expect(lower).not.toContain("<foreignobject");
      expect(lower).not.toContain('href="http');
      expect(lower).not.toContain('xlink:href="http');
      expect(lower).not.toContain("@import");
      expect(lower).not.toContain("url(http");
    });
  });

  describe("Routing hygiene, middleware, and Next.js headers", () => {
    const nextConfigSrc = readFileSync(join(rootDir, "next.config.js"), "utf8");

    it("ensures no next.config.js redirects shadow /metadata/esms/* or /icons/esms/*", () => {
      const redirectBlockMatch = nextConfigSrc.match(/async redirects\(\)\s*\{([\s\S]*?)\n\s*\}/);
      expect(redirectBlockMatch).not.toBeNull();
      const redirectBlock = redirectBlockMatch![1];

      const sourceRegex = /source:\s*"([^"]+)"/g;
      const sources: string[] = [];
      for (const m of redirectBlock.matchAll(sourceRegex)) {
        sources.push(m[1]);
      }

      expect(sources.length).toBeGreaterThan(0);
      for (const src of sources) {
        expect(src.startsWith("/metadata")).toBe(false);
        expect(src.startsWith("/icons/esms")).toBe(false);
      }
    });

    it("ensures middleware matcher does not intercept public static metadata routes", () => {
      const matchers = parseMiddlewareMatcher(rootDir);
      expect(Array.isArray(matchers)).toBe(true);
      for (const m of matchers) {
        expect(m.startsWith("/metadata")).toBe(false);
        expect(m.startsWith("/icons/esms")).toBe(false);
      }
    });

    it("configures spec-valid CORS and must-revalidate caching headers for /metadata/esms/:path*", () => {
      const headers = parseHeaderRule(nextConfigSrc, "/metadata/esms/:path*");
      expect(headers).not.toBeNull();

      const headerMap = Object.fromEntries(headers!.map((h) => [h.key, h.value]));

      // Allow-Origin: * must NOT be paired with Allow-Credentials: true
      expect(headerMap["Access-Control-Allow-Origin"]).toBe("*");
      expect(headerMap["Access-Control-Allow-Credentials"]).toBeUndefined();
      expect(headerMap["Access-Control-Allow-Methods"]).toBe("GET,OPTIONS");
      expect(headerMap["Cache-Control"]).toBe("public, max-age=3600, must-revalidate");
    });

    it("configures spec-valid CORS and must-revalidate caching headers for /icons/esms/:path*", () => {
      const headers = parseHeaderRule(nextConfigSrc, "/icons/esms/:path*");
      expect(headers).not.toBeNull();

      const headerMap = Object.fromEntries(headers!.map((h) => [h.key, h.value]));

      expect(headerMap["Access-Control-Allow-Origin"]).toBe("*");
      expect(headerMap["Access-Control-Allow-Credentials"]).toBeUndefined();
      expect(headerMap["Access-Control-Allow-Methods"]).toBe("GET,OPTIONS");
      expect(headerMap["Cache-Control"]).toBe("public, max-age=3600, must-revalidate");
    });
  });
});
