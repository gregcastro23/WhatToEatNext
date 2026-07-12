/**
 * feedDatabaseService × identity flip (PR 4): write-side stamping and
 * read-side resolution. Fixture identities are the historical-agent roster
 * (design-spec §4.8): Marie Curie, Nikola Tesla, Leonardo da Vinci.
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { executeQuery } from "@/lib/database/connection";
import { feedDatabase } from "@/services/feedDatabaseService";

const CURIE = "11111111-1111-1111-1111-111111111111"; // Marie Curie

const mockQuery = executeQuery as jest.Mock;

interface InsertCapture {
  payload: Record<string, unknown> | null;
}

/** Prime the two createEvent queries: actor lookup + insert. */
function primeCreateEvent(opts: {
  userRow?: Record<string, unknown> | null;
  lookupError?: Error;
}): InsertCapture {
  const capture: InsertCapture = { payload: null };
  mockQuery.mockImplementation((sql: string, params?: unknown[]) => {
    if (sql.includes("SELECT u.email")) {
      if (opts.lookupError) return Promise.reject(opts.lookupError);
      return Promise.resolve({ rows: opts.userRow ? [opts.userRow] : [] });
    }
    if (sql.includes("INSERT INTO feed_events")) {
      capture.payload = JSON.parse(String(params?.[2] ?? "null"));
      return Promise.resolve({ rows: [], rowCount: 1 });
    }
    return Promise.resolve({ rows: [] });
  });
  return capture;
}

const curieRow = {
  email: "curie@example.org",
  is_agent: false,
  actor_name: "Marie Curie",
  share_identity: true,
};

afterEach(() => {
  delete process.env.IDENTITY_DEFAULT_ANONYMOUS;
});

describe("createEvent identity stamping", () => {
  beforeEach(() => jest.clearAllMocks());

  it("stamps default-named (share_identity=true) with explicit:false + legacy mirror", async () => {
    const cap = primeCreateEvent({ userRow: curieRow });
    const ok = await feedDatabase.createEvent(CURIE, "recipe_generation", { recipeName: "Radium Tart" }, true);
    expect(ok).toBe(true);
    expect(cap.payload).toMatchObject({
      recipeName: "Radium Tart",
      identity: { v: 2, share: true, explicit: false },
      shareName: true,
    });
  });

  it("stamps the profile opt-out as share:false", async () => {
    const cap = primeCreateEvent({ userRow: { ...curieRow, share_identity: false } });
    await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true);
    expect(cap.payload).toMatchObject({
      identity: { v: 2, share: false, explicit: false },
      shareName: false,
    });
  });

  it("treats a missing profile row (share_identity null) as shared — the flip", async () => {
    const cap = primeCreateEvent({ userRow: { ...curieRow, share_identity: null } });
    await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true);
    expect(cap.payload).toMatchObject({ identity: { v: 2, share: true, explicit: false } });
  });

  it("marks per-post choices explicit in both directions", async () => {
    let cap = primeCreateEvent({ userRow: { ...curieRow, share_identity: false } });
    await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true, { share: true });
    expect(cap.payload).toMatchObject({
      identity: { v: 2, share: true, explicit: true },
      shareName: true,
    });

    cap = primeCreateEvent({ userRow: curieRow });
    await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true, { share: false });
    expect(cap.payload).toMatchObject({
      identity: { v: 2, share: false, explicit: true },
      shareName: false,
    });
  });

  it("stamps CONCEALED when the actor lookup fails and no explicit choice was made", async () => {
    const cap = primeCreateEvent({ lookupError: new Error("db blip") });
    const ok = await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true);
    expect(ok).toBe(true);
    expect(cap.payload).toMatchObject({
      identity: { v: 2, share: false, explicit: false },
      shareName: false,
    });
  });

  it("honors an explicit choice even when the lookup fails", async () => {
    const cap = primeCreateEvent({ lookupError: new Error("db blip") });
    await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true, { share: true });
    expect(cap.payload).toMatchObject({ identity: { v: 2, share: true, explicit: true } });
  });

  it("leaves payloads that already carry a v2 stamp untouched", async () => {
    const cap = primeCreateEvent({ userRow: curieRow });
    const preStamped = {
      card: "table_memory",
      identity: { v: 2, share: false, explicit: true },
      shareName: false,
    };
    await feedDatabase.createEvent(CURIE, "table_memory", preStamped, true, { share: true });
    expect(cap.payload).toMatchObject({
      identity: { v: 2, share: false, explicit: true },
      shareName: false,
    });
  });

  it("IDENTITY_DEFAULT_ANONYMOUS=1 reverts the DEFAULT without breaking explicit opt-ins", async () => {
    process.env.IDENTITY_DEFAULT_ANONYMOUS = "1";
    let cap = primeCreateEvent({ userRow: curieRow });
    await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true);
    expect(cap.payload).toMatchObject({ identity: { v: 2, share: false, explicit: false } });

    cap = primeCreateEvent({ userRow: curieRow });
    await feedDatabase.createEvent(CURIE, "recipe_generation", {}, true, { share: true });
    expect(cap.payload).toMatchObject({ identity: { v: 2, share: true, explicit: true } });
  });
});

describe("read paths resolve identity through the resolver", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseRow = {
    id: "evt-1",
    actor_id: CURIE,
    event_type: "recipe_generation",
    created_at: "2026-07-10T12:00:00Z",
    is_agent: false,
    actor_email: "curie@example.org",
    actor_image: "https://assets.alchm.kitchen/avatars/curie/a.jpg",
    actor_name: "Marie Curie",
    actor_share_identity: true,
    reaction_count: 0,
  };

  it("reveals stamped default-named events while the setting is on", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        ...baseRow,
        metadata_payload: { identity: { v: 2, share: true, explicit: false }, shareName: true },
      }],
    });
    const [event] = await feedDatabase.getRecentEvents(10, 0);
    expect(event.actorName).toBe("Marie Curie");
    expect(event.actorImage).toBe("https://assets.alchm.kitchen/avatars/curie/a.jpg");
    expect(event.actorRevealed).toBe(true);
  });

  it("a LATER opt-out conceals default-named events on read", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        ...baseRow,
        actor_share_identity: false,
        metadata_payload: { identity: { v: 2, share: true, explicit: false }, shareName: true },
      }],
    });
    const [event] = await feedDatabase.getRecentEvents(10, 0);
    expect(event.actorName).toBe("Anonymous Alchemist");
    expect(event.actorImage).toBeUndefined();
    expect(event.actorRevealed).toBe(false);
  });

  it("legacy (unstamped) default events stay anonymous even with the setting on", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...baseRow, metadata_payload: { shareName: false } }],
    });
    const [event] = await feedDatabase.getRecentEvents(10, 0);
    expect(event.actorName).toBe("Anonymous Alchemist");
    expect(event.actorRevealed).toBe(false);
  });

  it("legacy opt-in events stay revealed even after a later opt-out", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...baseRow, actor_share_identity: false, metadata_payload: { shareName: true } }],
    });
    const [event] = await feedDatabase.getRecentEvents(10, 0);
    expect(event.actorName).toBe("Marie Curie");
    expect(event.actorRevealed).toBe(true);
  });

  it("agents are always named (getEventsByActor path)", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        ...baseRow,
        is_agent: true,
        actor_email: "leonardo-da-vinci@agentic.alchm.kitchen",
        actor_name: "Leonardo da Vinci",
        actor_share_identity: null,
        metadata_payload: {},
      }],
    });
    const [event] = await feedDatabase.getEventsByActor(CURIE, 10, 0);
    expect(event.actorName).toBe("Leonardo da Vinci");
    expect(event.actorSlug).toBe("leonardo-da-vinci");
    expect(event.actorRevealed).toBe(true);
  });
});
