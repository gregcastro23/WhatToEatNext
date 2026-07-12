/**
 * @jest-environment node
 *
 * SAFETY-BOUNDARY GUARD (docs/plans/pr3-messaging-plan.md §0): DM and circle
 * message bodies must NEVER be written to SpacetimeDB (world-readable tables).
 * Only table-chat bodies mirror.
 *
 * This is a static assertion over the source tree: the ONLY module allowed to
 * reference the Spacetime chat-publish helper is the client TableChat surface
 * (useTableChat / TableChatPanel). Nothing on a DM or circle path, and nothing
 * in the SERVER send pipeline, may import or call it. If a future change wires
 * the publish helper into a DM/circle/server path, this test fails.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "src");

// Detect ACTUAL wiring (imports + call sites), not prose. Documentation that
// names the helper in a safety comment is fine — a real import or invocation
// on a forbidden path is the leak.
const IMPORTS_PUBLISH = /from\s+["']@\/lib\/spacetime\/liveTableChatPublish["']/;
const CALLS_PUBLISH = /publishLiveTableChat\w*\s*\(/;
const IMPORTS_GENERATED = /from\s+["']@\/lib\/spacetime\/generated/;
const IMPORTS_FEED_PUBLISH = /from\s+["']@\/lib\/spacetime\/liveFeedPublish["']/;
const CALLS_REDUCER = /\.reducers\.\w+\s*\(/;

/**
 * Files ALLOWED to WIRE the publish helper: the helper itself, and the client
 * table-chat surface that is table-only by construction.
 */
const ALLOWED = [
  "src/lib/spacetime/liveTableChatPublish.ts",
  "src/hooks/useTableChat.ts",
  "src/components/chat/TableChatPanel.tsx",
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === "generated") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("DM/circle bodies never reach SpacetimeDB", () => {
  const files = walk(SRC);

  it("the Spacetime chat-publish helper is WIRED ONLY by allow-listed table-chat files", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = file.slice(process.cwd().length + 1);
      if (ALLOWED.includes(rel)) continue;
      const text = readFileSync(file, "utf8");
      if (IMPORTS_PUBLISH.test(text) || CALLS_PUBLISH.test(text)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });

  it("no server chat code (src/lib/chat, src/app/api/chat) imports Spacetime bindings or calls a reducer", () => {
    const serverChat = files.filter(
      (f) => f.includes("/lib/chat/") || f.includes("/api/chat/"),
    );
    const offenders = serverChat.filter((f) => {
      const text = readFileSync(f, "utf8");
      return (
        IMPORTS_PUBLISH.test(text) ||
        IMPORTS_FEED_PUBLISH.test(text) ||
        IMPORTS_GENERATED.test(text) ||
        CALLS_REDUCER.test(text)
      );
    });
    expect(offenders.map((f) => f.slice(process.cwd().length + 1))).toEqual([]);
  });
});
