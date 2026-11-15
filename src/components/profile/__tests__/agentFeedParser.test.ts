/**
 * @jest-environment node
 *
 * Round trips for parseAgentInteractions / parseAgentActions / parseAgentArtifacts.
 *
 * REAL DATA: none exists in this repo. MEASURED 2026-11-14 by searching src/ docs/
 * scripts/ tests/ mcp-server/ database/ public/ data/ for the row field names
 * (messagePreview, alchmKitchenPath): the rows come from ASOL and no file stores
 * any. The only feed values the repo itself produces are `[]`: the route's
 * external-agent path writes all three feeds as empty literals
 * (src/app/api/users/[userId]/route.ts:229-278) and its DB path defaults them to
 * `[]` when the ASOL fetch fails (396-447). So the corpus is `[]` plus rows built
 * from the declared types (src/lib/agents/fetchAgentProfile.ts:8-42) that populate
 * EVERY field, optional ones included, and cover every member of every union.
 */
import type { AgentAction, AgentArtifact, AgentInteraction } from "@/lib/agents/fetchAgentProfile";
import { isJsonRecord } from "@/lib/api/json";
import { parseAgentActions, parseAgentArtifacts, parseAgentInteractions } from "../agentFeedParser";

const INTERACTIONS: AgentInteraction[] = [
  {
    id: "i-1",
    kind: "agent_to_agent",
    counterparty: { slug: "isaac-newton", name: "Isaac Newton", userId: "u-1" },
    topic: "Thermal conduction in a stew",
    messagePreview: "Heat moves from the pot into the broth...",
    messageCount: 12,
    startedAt: "2026-11-10T09:00:00.000Z",
    lastTurnAt: "2026-11-10T09:14:00.000Z",
    chatThread: "thread-1",
  },
  {
    id: "i-2",
    kind: "agent_to_user",
    counterparty: { name: "A Guest" },
    topic: "",
    messagePreview: "",
    messageCount: 0,
    startedAt: "2026-11-11T10:00:00.000Z",
    lastTurnAt: "2026-11-11T10:00:00.000Z",
    chatThread: "thread-2",
  },
];

const ACTIONS: AgentAction[] = [
  {
    id: "a-1",
    type: "recipe_critique",
    createdAt: "2026-11-10T09:20:00.000Z",
    metadata: { recipeId: "r-1", score: 4.5, tags: ["a", "b"], nested: { deep: null, flag: false } },
    links: { chatThread: "thread-1", recipe: "r-1" },
  },
  { id: "a-2", type: "note", createdAt: "2026-11-10T09:21:00.000Z", metadata: {}, links: {} },
];

const ARTIFACTS: AgentArtifact[] = [
  { id: "f-1", kind: "recipe", title: "Spelt bread", createdAt: "2026-11-09T08:00:00.000Z", summary: "A dense loaf", alchmKitchenPath: "/recipes/spelt-bread" },
  { id: "f-2", kind: "lab_entry", title: "Brine ratios", createdAt: "2026-11-09T08:10:00.000Z", summary: "Salt at 3 percent" },
  { id: "f-3", kind: "insight", title: "Fire dominates", createdAt: "2026-11-09T08:20:00.000Z", summary: "Heat and speed" },
];

interface Feed {
  path: string;
  parse: (value: unknown, issues: string[]) => unknown[];
  rows: unknown[];
}

const FEEDS: Feed[] = [
  { path: "agentInteractions", parse: parseAgentInteractions, rows: INTERACTIONS },
  { path: "agentActions", parse: parseAgentActions, rows: ACTIONS },
  { path: "agentArtifacts", parse: parseAgentArtifacts, rows: ARTIFACTS },
];

function onTheWire(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function record(value: unknown): Record<string, unknown> {
  if (!isJsonRecord(value)) throw new Error("fixture row is not a record");
  return value;
}

function wireRows(rows: unknown[]): Array<Record<string, unknown>> {
  const wire = onTheWire(rows);
  if (!Array.isArray(wire)) throw new Error("rows did not round trip as an array");
  return wire.map((row: unknown) => record(row));
}

/** An unknown key on the row and on its nested objects, but not inside `metadata` (an open record, copied as it is). */
function withExtras(row: Record<string, unknown>): Record<string, unknown> {
  const { counterparty, links } = row;
  return {
    ...row,
    extra: "x",
    ...(isJsonRecord(counterparty) ? { counterparty: { ...counterparty, extra: "x" } } : {}),
    ...(isJsonRecord(links) ? { links: { ...links, extra: "x" } } : {}),
  };
}

describe.each(FEEDS)("$path round trips", ({ path, parse, rows }) => {
  it("reproduces rows built from the declared type exactly, with no issues", () => {
    const wire = onTheWire(rows);
    const issues: string[] = [];
    expect(parse(wire, issues)).toStrictEqual(wire);
    expect(issues).toEqual([]);
  });

  it("keeps the order and content of a long feed", () => {
    const base = wireRows(rows);
    const wire = Array.from({ length: 200 }, (_, index) => ({ ...base[index % base.length], id: `row-${index}` }));
    const issues: string[] = [];
    expect(parse(wire, issues)).toStrictEqual(wire);
    expect(issues).toEqual([]);
  });

  it("an empty feed, the route's own literal, stays empty with no issues", () => {
    const issues: string[] = [];
    expect(parse([], issues)).toStrictEqual([]);
    expect(issues).toEqual([]);
  });

  it("null, undefined and JSON null are a normal answer: [] and nothing reported", () => {
    const fromJson: unknown = JSON.parse("null");
    expect(fromJson).toBeNull();
    for (const value of [fromJson, null, undefined]) {
      const issues: string[] = [];
      expect(parse(value, issues)).toStrictEqual([]);
      expect(issues).toEqual([]);
    }
  });

  it("unknown keys are not copied, at any level above metadata", () => {
    const base = wireRows(rows);
    const issues: string[] = [];
    expect(parse(base.map(withExtras), issues)).toStrictEqual(base);
    expect(issues).toEqual([]);
  });

  it("does not modify its input", () => {
    const wire = onTheWire(rows);
    const before = JSON.stringify(wire);
    parse(wire, []);
    expect(JSON.stringify(wire)).toBe(before);
  });

  it("names its own feed in every report", () => {
    const issues: string[] = [];
    parse("not a feed", issues);
    expect(issues).toEqual([`${path}: not an array`]);
  });
});

describe("the declared unions are all exercised by the fixtures", () => {
  it("covers both interaction kinds and all three artifact kinds", () => {
    expect(new Set(INTERACTIONS.map((row) => row.kind))).toStrictEqual(new Set(["agent_to_agent", "agent_to_user"]));
    expect(new Set(ARTIFACTS.map((row) => row.kind))).toStrictEqual(new Set(["recipe", "lab_entry", "insight"]));
  });
});
