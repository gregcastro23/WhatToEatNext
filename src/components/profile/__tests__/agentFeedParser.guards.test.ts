/**
 * @jest-environment node
 *
 * Rejections and degradations for the three feed parsers. Every row is ONE valid
 * row (built from the declared type, every optional field populated) with exactly
 * one thing changed, so a rejection can only be the parser's. Each rejection has a
 * CONTROL (the same place holding a valid value is accepted). Non-finite numbers
 * come from JSON TEXT (`1e999`), because `JSON.stringify(Infinity)` is `null` and
 * would test a different case.
 */
import type { AgentAction, AgentArtifact, AgentInteraction } from "@/lib/agents/fetchAgentProfile";
import { isJsonRecord } from "@/lib/api/json";
import { parseAgentActions, parseAgentArtifacts, parseAgentInteractions } from "../agentFeedParser";

const INTERACTION: AgentInteraction = {
  id: "i-1",
  kind: "agent_to_agent",
  counterparty: { slug: "isaac-newton", name: "Isaac Newton", userId: "u-1" },
  topic: "Thermal conduction",
  messagePreview: "Heat moves...",
  messageCount: 12,
  startedAt: "2026-11-10T09:00:00.000Z",
  lastTurnAt: "2026-11-10T09:14:00.000Z",
  chatThread: "thread-1",
};
const ACTION: AgentAction = {
  id: "a-1",
  type: "recipe_critique",
  createdAt: "2026-11-10T09:20:00.000Z",
  metadata: { recipeId: "r-1", score: 4.5 },
  links: { chatThread: "thread-1", recipe: "r-1" },
};
const ARTIFACT: AgentArtifact = {
  id: "f-1",
  kind: "recipe",
  title: "Spelt bread",
  createdAt: "2026-11-09T08:00:00.000Z",
  summary: "A dense loaf",
  alchmKitchenPath: "/recipes/spelt-bread",
};

function record(value: unknown): Record<string, unknown> {
  if (!isJsonRecord(value)) throw new Error("fixture is not a record");
  return value;
}

function clone(value: unknown): Record<string, unknown> {
  return record(JSON.parse(JSON.stringify(value)));
}

interface Feed {
  path: string;
  parse: (value: unknown, issues: string[]) => unknown[];
  row: Record<string, unknown>;
}

const INTERACTIONS: Feed = { path: "agentInteractions", parse: parseAgentInteractions, row: clone(INTERACTION) };
const ACTIONS: Feed = { path: "agentActions", parse: parseAgentActions, row: clone(ACTION) };
const ARTIFACTS: Feed = { path: "agentArtifacts", parse: parseAgentArtifacts, row: clone(ARTIFACT) };
const FEEDS: Feed[] = [INTERACTIONS, ACTIONS, ARTIFACTS];

/** The row with the dotted `path` set to `value`, or removed when `gone` is true. */
function edit(row: Record<string, unknown>, path: string, value: unknown, gone = false): Record<string, unknown> {
  const out = clone(row);
  const keys = path.split(".");
  const last = keys.pop();
  let node = out;
  for (const key of keys) node = record(node[key]);
  if (last === undefined) throw new Error("empty path");
  if (gone) Reflect.deleteProperty(node, last);
  else node[last] = value;
  return out;
}

function without(row: Record<string, unknown>, path: string): Record<string, unknown> {
  return edit(row, path, undefined, true);
}

function runFeed(feed: Feed, input: unknown): { rows: unknown[]; issues: string[] } {
  const issues: string[] = [];
  return { rows: feed.parse(input, issues), issues };
}

function keepsRow(feed: Feed, row: Record<string, unknown>): void {
  expect(runFeed(feed, [row])).toStrictEqual({ rows: [row], issues: [] });
}

function dropsRow(feed: Feed, row: Record<string, unknown>): void {
  expect(runFeed(feed, [row])).toStrictEqual({ rows: [], issues: [`${feed.path}[0]: not a valid row`] });
}

const WRONG: Array<[string, unknown]> = [["a number", 7], ["null", null], ["an object", { x: 1 }], ["an array", ["x"]], ["a boolean", true]];
const NOT_RECORDS: Array<[string, unknown]> = [["a string", "x"], ["null", null], ["an array", []], ["a number", 7]];
const NOT_FINITE: Array<[string, unknown]> = [
  ["a string", "3"],
  ["null", null],
  ["Infinity from 1e999", JSON.parse("1e999")],
  ["-Infinity from -1e999", JSON.parse("-1e999")],
  ["an object", { x: 1 }],
  ["a boolean", true],
];

const REQUIRED_TEXT: Array<[string, Feed, string]> = [
  ...["id", "topic", "messagePreview", "startedAt", "lastTurnAt", "chatThread", "counterparty.name"].map((field): [string, Feed, string] => [`${INTERACTIONS.path}.${field}`, INTERACTIONS, field]),
  ...["id", "type", "createdAt"].map((field): [string, Feed, string] => [`${ACTIONS.path}.${field}`, ACTIONS, field]),
  ...["id", "title", "createdAt", "summary"].map((field): [string, Feed, string] => [`${ARTIFACTS.path}.${field}`, ARTIFACTS, field]),
];
const REQUIRED_RECORDS: Array<[string, Feed, string, unknown]> = [
  [`${INTERACTIONS.path}.counterparty`, INTERACTIONS, "counterparty", { name: "N" }],
  [`${ACTIONS.path}.metadata`, ACTIONS, "metadata", {}],
  [`${ACTIONS.path}.links`, ACTIONS, "links", {}],
];
const OPTIONAL_TEXT: Array<[string, Feed, string]> = [
  [`${INTERACTIONS.path}.counterparty.slug`, INTERACTIONS, "counterparty.slug"],
  [`${INTERACTIONS.path}.counterparty.userId`, INTERACTIONS, "counterparty.userId"],
  [`${ACTIONS.path}.links.chatThread`, ACTIONS, "links.chatThread"],
  [`${ACTIONS.path}.links.recipe`, ACTIONS, "links.recipe"],
  [`${ARTIFACTS.path}.alchmKitchenPath`, ARTIFACTS, "alchmKitchenPath"],
];

describe.each(REQUIRED_TEXT)("required string %s", (_name, feed, field) => {
  it("CONTROL: a string, even an empty one, is accepted", () => {
    keepsRow(feed, edit(feed.row, field, ""));
  });

  it.each(WRONG)("drops a row whose field is %s", (_label, wrong) => {
    dropsRow(feed, edit(feed.row, field, wrong));
  });

  it("drops a row whose field is missing", () => {
    dropsRow(feed, without(feed.row, field));
  });
});

describe.each(REQUIRED_RECORDS)("required object %s", (_name, feed, field, ok) => {
  it("CONTROL: a valid object is accepted", () => {
    keepsRow(feed, edit(feed.row, field, ok));
  });

  it.each(NOT_RECORDS)("drops a row whose field is %s", (_label, wrong) => {
    dropsRow(feed, edit(feed.row, field, wrong));
  });

  it("drops a row whose field is missing", () => {
    dropsRow(feed, without(feed.row, field));
  });
});

describe.each(OPTIONAL_TEXT)("optional string %s", (_name, feed, field) => {
  it("CONTROL: a string is kept", () => {
    keepsRow(feed, edit(feed.row, field, "kept"));
  });

  it("absent is fine and reports nothing", () => {
    keepsRow(feed, without(feed.row, field));
  });

  it.each(WRONG)("omits it when it is %s, reports it by path, keeps the row", (_label, wrong) => {
    expect(runFeed(feed, [edit(feed.row, field, wrong)])).toStrictEqual({
      rows: [without(feed.row, field)],
      issues: [`${feed.path}[0].${field}: not a string`],
    });
  });
});

describe("union fields must match their declared union exactly", () => {
  it.each(["agent_to_agent", "agent_to_user"])("CONTROL: interaction kind %s is accepted", (kind) => {
    keepsRow(INTERACTIONS, edit(INTERACTIONS.row, "kind", kind));
  });

  it.each(["agent", "AGENT_TO_AGENT", "agent_to_user ", "", 7, null])("rejects interaction kind %p", (kind) => {
    dropsRow(INTERACTIONS, edit(INTERACTIONS.row, "kind", kind));
  });

  it("rejects a missing interaction kind", () => {
    dropsRow(INTERACTIONS, without(INTERACTIONS.row, "kind"));
  });

  it.each(["recipe", "lab_entry", "insight"])("CONTROL: artifact kind %s is accepted", (kind) => {
    keepsRow(ARTIFACTS, edit(ARTIFACTS.row, "kind", kind));
  });

  it.each(["Recipe", "lab", "insights", "recipe ", "", 7, null])("rejects artifact kind %p", (kind) => {
    dropsRow(ARTIFACTS, edit(ARTIFACTS.row, "kind", kind));
  });

  it("rejects a missing artifact kind", () => {
    dropsRow(ARTIFACTS, without(ARTIFACTS.row, "kind"));
  });
});

describe("interaction messageCount must be a finite number", () => {
  it.each([0, 1, 412, -1, 2.5])("CONTROL: %p is accepted", (count) => {
    keepsRow(INTERACTIONS, edit(INTERACTIONS.row, "messageCount", count));
  });

  it.each(NOT_FINITE)("drops a row whose count is %s", (_label, wrong) => {
    dropsRow(INTERACTIONS, edit(INTERACTIONS.row, "messageCount", wrong));
  });

  it("drops a row whose count is missing", () => {
    dropsRow(INTERACTIONS, without(INTERACTIONS.row, "messageCount"));
  });
});

describe.each(FEEDS)("$path as a whole", (feed) => {
  it.each<[string, unknown]>([["an object", { x: 1 }], ["a string", "x"], ["a number", 7], ["a boolean", true]])(
    "%s is not a feed: [] and one issue",
    (_label, wrong) => {
      expect(runFeed(feed, wrong)).toStrictEqual({ rows: [], issues: [`${feed.path}: not an array`] });
    },
  );

  it("a feed whose every row is bad is [] plus one report per row, never a failure", () => {
    const rows = ["junk", null, [], 7, true, { id: 1 }];
    const { rows: kept, issues } = runFeed(feed, rows);
    expect(kept).toStrictEqual([]);
    expect(issues).toStrictEqual(rows.map((_row, index) => `${feed.path}[${index}]: not a valid row`));
  });

  it("keeps good rows in order and names the index of each bad one", () => {
    const second = edit(feed.row, "id", "second");
    expect(runFeed(feed, [feed.row, "junk", second, null, []])).toStrictEqual({
      rows: [feed.row, second],
      issues: [`${feed.path}[1]: not a valid row`, `${feed.path}[3]: not a valid row`, `${feed.path}[4]: not a valid row`],
    });
  });

  it("a dropped row reports once, even when its optional fields are also bad", () => {
    const bad = edit(edit(feed.row, "id", 1), feed === ACTIONS ? "links.recipe" : feed === ARTIFACTS ? "alchmKitchenPath" : "counterparty.slug", 7);
    dropsRow(feed, bad);
  });
});
