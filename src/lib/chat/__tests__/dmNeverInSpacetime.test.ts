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

// The Spacetime CHAT-mirror reducers — the ONLY reducers that carry a message
// body into the world-readable live table. A direct call site (`.name(`,
// tolerant of the `connection.reducers` newline before the leading dot) from
// anywhere but the sanctioned publish helper is a leak vector: a client could
// pass a DM/circle body straight into the mirror, bypassing publishLiveTableChat*.
const CHAT_REDUCER_CALL =
  /\.\s*(sendTableChatMessage|deleteTableChatMessage|setTableChatMute|kickTableChatMember)\s*\(/;

/**
 * Files ALLOWED to WIRE the publish helper: the helper itself, and the client
 * table-chat surface that is table-only by construction.
 */
const ALLOWED = [
  "src/lib/spacetime/liveTableChatPublish.ts",
  "src/hooks/useTableChat.ts",
  "src/components/chat/TableChatPanel.tsx",
];

/**
 * The ONLY file permitted to call a Spacetime chat-mirror reducer directly.
 * Every legitimate table-chat caller goes THROUGH this helper — which is
 * table-only by construction — so a direct reducer call anywhere else is the
 * exact leak this guard exists to catch.
 */
const CHAT_REDUCER_ALLOWED = ["src/lib/spacetime/liveTableChatPublish.ts"];

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

  // BROAD SCOPE (all non-allowlisted src, client AND server): the critical
  // invariant. A CLIENT surface calling a chat-mirror reducer directly with a
  // DM/circle body would leak it to the world-readable table — this catches
  // that regardless of where the file lives.
  it("a Spacetime chat-mirror reducer is called ONLY from the sanctioned publish helper", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = file.slice(process.cwd().length + 1);
      if (CHAT_REDUCER_ALLOWED.includes(rel)) continue;
      const text = readFileSync(file, "utf8");
      if (CHAT_REDUCER_CALL.test(text)) offenders.push(rel);
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
