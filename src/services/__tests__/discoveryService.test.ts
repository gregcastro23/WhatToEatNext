/**
 * @jest-environment node
 *
 * Discovery service tests (PR 6). The REAL discoveryService runs against a
 * small in-memory fake of `@/lib/database/connection` that mirrors the SQL
 * semantics the service issues (same convention as the Table lifecycle test).
 * The fake enforces the visibility / block / exclusion rules; the service's own
 * JS (compatibility, haversine + radius filter, keyset cursor, seats-left,
 * row shaping) is the production code under test.
 *
 * Real historical-agent roster identities are used throughout (design-spec §4.8).
 */

// ── Roster identities ────────────────────────────────────────────────────
const V = "00000000-0000-0000-0000-0000000000v1"; // viewer — Marie Curie
const HP = "00000000-0000-0000-0000-0000000000hp"; // da Vinci — public host
const HC = "00000000-0000-0000-0000-0000000000hc"; // Tesla — commensals host
const HR = "00000000-0000-0000-0000-0000000000hr"; // Newton — private host
const HB = "00000000-0000-0000-0000-0000000000hb"; // Cleopatra — blocked host
const HE = "00000000-0000-0000-0000-0000000000he"; // Einstein — host of a table V joined
const HS = "00000000-0000-0000-0000-0000000000hs"; // Shakespeare — geo near
const HJ = "00000000-0000-0000-0000-0000000000hj"; // Jung — geo far

const NAMES: Record<string, string> = {
  [V]: "Marie Curie",
  [HP]: "Leonardo da Vinci",
  [HC]: "Nikola Tesla",
  [HR]: "Isaac Newton",
  [HB]: "Cleopatra",
  [HE]: "Albert Einstein",
  [HS]: "William Shakespeare",
  [HJ]: "Carl Jung",
};

interface FakeTable {
  id: string;
  host_id: string;
  title: string;
  scheduled_at: string;
  status: string;
  visibility: string;
  venue_type: string;
  venue_name: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  seat_cap: number | null;
  composite_balance: Record<string, number> | null;
  composite_dominant: string | null;
}

interface FakeUser {
  id: string;
  name: string;
  is_agent: boolean;
  is_active: boolean;
  discoverable?: boolean; // preferences.discoverable
  created_at: string;
  balance: Record<string, number> | null;
  dominant_element: string | null;
}

interface FakeCommensalship {
  a: string;
  b: string;
  status: "accepted" | "blocked";
}

interface FakeMember {
  table_id: string;
  user_id: string;
  rsvp_status: string;
}

const db = {
  tables: [] as FakeTable[],
  users: [] as FakeUser[],
  commensalships: [] as FakeCommensalship[],
  members: [] as FakeMember[],
  follows: new Set<string>(), // `${follower}->${followee}`
  hasFollowsTable: true,
  // Set per call so the fake knows the viewer without brittle param-indexing.
  currentViewer: null as string | null,
  currentGeo: false,
};

function reset() {
  db.tables = [];
  db.users = [];
  db.commensalships = [];
  db.members = [];
  db.follows = new Set();
  db.hasFollowsTable = true;
  db.currentViewer = null;
  db.currentGeo = false;
}

const knownUserIds = () => new Set(db.users.map((u) => u.id));

function accepted(x: string, y: string): boolean {
  return db.commensalships.some(
    (c) => c.status === "accepted" && ((c.a === x && c.b === y) || (c.a === y && c.b === x)),
  );
}
function blocked(x: string, y: string): boolean {
  return db.commensalships.some(
    (c) => c.status === "blocked" && ((c.a === x && c.b === y) || (c.a === y && c.b === x)),
  );
}

function extractParam(params: unknown[], pred: (p: unknown) => boolean): string | undefined {
  const found = params.find(pred);
  return typeof found === "string" ? found : undefined;
}

async function fakeQuery(sql: string, params: unknown[] = []): Promise<{ rows: any[]; rowCount: number }> {
  const q = sql.trim();

  // follows table probe
  if (q.includes("to_regclass('public.follows')")) {
    return { rows: [{ reg: db.hasFollowsTable ? "follows" : null }], rowCount: 1 };
  }

  // getUserElementalProfile — return no chart (compat resolves null) unless the
  // viewer has a balance on file.
  if (q.startsWith("SELECT natal_chart, birth_data FROM user_profiles")) {
    const uid = params[0] as string;
    const user = db.users.find((u) => u.id === uid);
    if (user?.balance) {
      return { rows: [{ natal_chart: { elementalBalance: user.balance, dominantElement: "Fire", dominantModality: "Fixed", alchemicalProperties: { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 } }, birth_data: null }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (q.startsWith("SELECT profile FROM users")) {
    return { rows: [], rowCount: 0 };
  }

  // Mutual-commensal: viewer's accepted partners
  if (q.includes("THEN addressee_id ELSE requester_id END AS partner") && q.includes("FROM commensalships")) {
    const viewer = params[0] as string;
    const partners = db.commensalships
      .filter((c) => c.status === "accepted" && (c.a === viewer || c.b === viewer))
      .map((c) => (c.a === viewer ? c.b : c.a));
    return { rows: partners.map((p) => ({ partner: p })), rowCount: partners.length };
  }
  // Mutual-commensal aggregate
  if (q.includes("x.candidate") && q.includes("GROUP BY x.candidate")) {
    const candidates = params[0] as string[];
    const viewerPartners = new Set(params[1] as string[]);
    const counts = new Map<string, number>();
    for (const cand of candidates) {
      const candPartners = db.commensalships
        .filter((c) => c.status === "accepted" && (c.a === cand || c.b === cand))
        .map((c) => (c.a === cand ? c.b : c.a));
      const mutual = candPartners.filter((p) => viewerPartners.has(p)).length;
      if (mutual > 0) counts.set(cand, mutual);
    }
    return { rows: [...counts].map(([candidate, mutual]) => ({ candidate, mutual })), rowCount: counts.size };
  }

  // ── Tables discovery ──────────────────────────────────────────────────
  if (q.includes("FROM tables t") && q.includes("LEFT JOIN LATERAL")) {
    const viewer = db.currentViewer;
    const uids = knownUserIds();
    const element = extractParam(params, (p) => ["Fire", "Water", "Earth", "Air"].includes(p as string));
    const likeRaw = extractParam(params, (p) => typeof p === "string" && (p as string).startsWith("%") && (p as string).endsWith("%"));
    const qTerm = likeRaw ? likeRaw.slice(1, -1).toLowerCase() : undefined;
    const cursorTs = extractParam(params, (p) => typeof p === "string" && /^\d{4}-\d\d-\d\dT/.test(p as string));
    const cursorId = extractParam(params, (p) => typeof p === "string" && db.tables.some((t) => t.id === p));
    const fetchLimit = Number(params[params.length - 1]) || 60;

    let rows = db.tables.filter((t) => {
      if (t.status !== "planned" && t.status !== "live") return false;
      // visibility gate
      if (viewer) {
        const vis = t.visibility === "public" || (t.visibility === "commensals" && accepted(t.host_id, viewer));
        if (!vis) return false;
        if (blocked(t.host_id, viewer)) return false;
        if (t.host_id === viewer) return false;
        if (db.members.some((m) => m.table_id === t.id && m.user_id === viewer)) return false;
      } else {
        if (t.visibility !== "public") return false;
      }
      if (qTerm) {
        const hay = `${t.title} ${t.venue_name ?? ""}`.toLowerCase();
        if (!hay.includes(qTerm)) return false;
      }
      if (element && t.composite_dominant !== element) return false;
      if (db.currentGeo && t.venue_lat == null) return false; // bbox requires non-null coords
      if (cursorTs && cursorId) {
        if (!(t.scheduled_at > cursorTs || (t.scheduled_at === cursorTs && t.id > cursorId))) return false;
      }
      return true;
    });
    rows.sort((x, y) => (x.scheduled_at < y.scheduled_at ? -1 : x.scheduled_at > y.scheduled_at ? 1 : x.id < y.id ? -1 : 1));
    rows = rows.slice(0, fetchLimit);

    const out = rows.map((t) => {
      const host = db.users.find((u) => u.id === t.host_id);
      const joined = db.members.filter((m) => m.table_id === t.id && m.rsvp_status === "joined").length;
      return {
        id: t.id,
        title: t.title,
        scheduled_at: t.scheduled_at,
        status: t.status,
        venue_type: t.venue_type,
        venue_name: t.venue_name,
        venue_lat: t.venue_lat,
        venue_lng: t.venue_lng,
        seat_cap: t.seat_cap,
        composite_balance: t.composite_balance,
        composite_dominant: t.composite_dominant,
        host_id: t.host_id,
        host_name: host?.name ?? null,
        host_avatar: null,
        host_dominant: host?.dominant_element ?? null,
        joined_count: joined,
        photo_url: null,
      };
    });
    void uids;
    return { rows: out, rowCount: out.length };
  }

  // ── People discovery ──────────────────────────────────────────────────
  if (q.includes("FROM users u") && q.includes("u.is_active = true")) {
    const viewer = db.currentViewer!;
    const kind = q.includes("u.is_agent = false")
      ? "people"
      : q.includes("u.is_agent = true")
        ? "agents"
        : "all";
    const element = extractParam(params, (p) => ["Fire", "Water", "Earth", "Air"].includes(p as string));
    const likeRaw = extractParam(params, (p) => typeof p === "string" && (p as string).startsWith("%") && (p as string).endsWith("%"));
    const qTerm = likeRaw ? likeRaw.slice(1, -1).toLowerCase() : undefined;
    const matchSort = q.includes("elementalBalance' IS NOT NULL");
    const fetchLimit = Number(params[params.length - 1]) || 200;

    let rows = db.users.filter((u) => {
      if (!u.is_active) return false;
      if (u.id === viewer) return false;
      if (blocked(u.id, viewer)) return false;
      const discoverable = u.discoverable !== false;
      if (!discoverable && !u.is_agent) return false;
      if (kind === "people" && u.is_agent) return false;
      if (kind === "agents" && !u.is_agent) return false;
      if (qTerm && !u.name.toLowerCase().includes(qTerm)) return false;
      if (element && u.dominant_element !== element) return false;
      if (matchSort && !u.balance) return false;
      return true;
    });
    rows.sort((x, y) => (x.created_at < y.created_at ? 1 : x.created_at > y.created_at ? -1 : x.id < y.id ? 1 : -1));
    rows = rows.slice(0, fetchLimit);

    const out = rows.map((u) => ({
      id: u.id,
      display_name: u.name,
      avatar_url: null,
      bio: null,
      dominant_element: u.dominant_element,
      balance: u.balance,
      is_agent: u.is_agent,
      created_at: u.created_at,
      viewer_follows: db.hasFollowsTable ? db.follows.has(`${viewer}->${u.id}`) : null,
      is_commensal: accepted(u.id, viewer),
    }));
    return { rows: out, rowCount: out.length };
  }

  throw new Error(`FakeDb: unhandled query: ${q}`);
}

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (sql: string, params?: unknown[]) => fakeQuery(sql, params),
  withTransaction: (op: (client: { query: typeof fakeQuery }) => Promise<unknown>) =>
    op({ query: fakeQuery }),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { discoverTables, discoverPeople } from "@/services/discoveryService";

function seedUsers() {
  const base = "2026-01-01T00:00:00.000Z";
  db.users = Object.entries(NAMES).map(([id, name], i) => ({
    id,
    name,
    is_agent: [HP, HC, HR, HB, HS, HJ].includes(id), // hosts are agents (roster)
    is_active: true,
    created_at: new Date(Date.parse(base) + i * 1000).toISOString(),
    balance: null,
    dominant_element: null,
  }));
}

function makeTable(over: Partial<FakeTable>): FakeTable {
  return {
    id: over.id!,
    host_id: over.host_id!,
    title: over.title ?? "A Table",
    scheduled_at: over.scheduled_at ?? "2026-08-01T18:00:00.000Z",
    status: over.status ?? "planned",
    visibility: over.visibility ?? "public",
    venue_type: over.venue_type ?? "home",
    venue_name: over.venue_name ?? null,
    venue_lat: over.venue_lat ?? null,
    venue_lng: over.venue_lng ?? null,
    seat_cap: over.seat_cap ?? null,
    composite_balance: over.composite_balance ?? null,
    composite_dominant: over.composite_dominant ?? null,
  };
}

beforeEach(() => {
  reset();
  seedUsers();
});

describe("discoverTables — visibility matrix (public / commensals / private × anon / stranger / commensal / blocked)", () => {
  beforeEach(() => {
    db.commensalships = [
      { a: V, b: HC, status: "accepted" }, // viewer is a commensal of the commensals-host
      { a: V, b: HB, status: "blocked" }, // viewer is blocked with the blocked-host
    ];
    db.tables = [
      makeTable({ id: "t-pub", host_id: HP, visibility: "public", scheduled_at: "2026-08-01T00:00:00.000Z", title: "Public Feast" }),
      makeTable({ id: "t-comm", host_id: HC, visibility: "commensals", scheduled_at: "2026-08-02T00:00:00.000Z", title: "Commensals Only" }),
      makeTable({ id: "t-priv", host_id: HR, visibility: "private", scheduled_at: "2026-08-03T00:00:00.000Z", title: "Private" }),
      makeTable({ id: "t-block", host_id: HB, visibility: "public", scheduled_at: "2026-08-04T00:00:00.000Z", title: "Blocked Host Public" }),
      makeTable({ id: "t-self", host_id: V, visibility: "public", scheduled_at: "2026-08-05T00:00:00.000Z", title: "My Own" }),
      makeTable({ id: "t-joined", host_id: HE, visibility: "public", scheduled_at: "2026-08-06T00:00:00.000Z", title: "Already Joined" }),
    ];
    db.members = [{ table_id: "t-joined", user_id: V, rsvp_status: "joined" }];
  });

  const ids = (r: { tables: { id: string }[] }) => r.tables.map((t) => t.id).sort();

  it("anon sees public tables only (incl. the blocked-host's public table — block is per-viewer)", async () => {
    db.currentViewer = null;
    const r = await discoverTables({}, null);
    // Every public table (t-self/t-joined are public and anon has no membership).
    expect(ids(r)).toEqual(["t-block", "t-joined", "t-pub", "t-self"].sort());
    expect(r.tables.every((t) => t.compatibility === null)).toBe(true);
  });

  it("a stranger sees public only — never commensals or private", async () => {
    const STRANGER = "00000000-0000-0000-0000-00000000str1";
    db.users.push({ id: STRANGER, name: "Stranger", is_agent: false, is_active: true, created_at: "2026-01-01T00:00:00.000Z", balance: null, dominant_element: null });
    db.currentViewer = STRANGER;
    const r = await discoverTables({}, STRANGER);
    expect(ids(r)).toEqual(["t-block", "t-joined", "t-pub", "t-self"].sort());
  });

  it("a commensal sees the host's commensals table; blocked + private + own + joined are excluded", async () => {
    db.currentViewer = V;
    const r = await discoverTables({}, V);
    // public (t-pub) + commensals-of-HC (t-comm); NOT t-block (blocked),
    // t-priv (private), t-self (own), t-joined (member).
    expect(ids(r)).toEqual(["t-comm", "t-pub"].sort());
  });

  it("private tables never surface, for anyone", async () => {
    db.currentViewer = V;
    const rV = await discoverTables({}, V);
    db.currentViewer = null;
    const rAnon = await discoverTables({}, null);
    expect([...rV.tables, ...rAnon.tables].some((t) => t.id === "t-priv")).toBe(false);
  });

  it("never exposes home coordinates, venue_address, or member lists in the row payload", async () => {
    db.currentViewer = null;
    const r = await discoverTables({}, null);
    const row = r.tables.find((t) => t.id === "t-pub")!;
    expect(row.venue).toEqual({ type: "home" }); // home → bare type, no name/geo
    expect(JSON.stringify(row)).not.toContain("venue_lat");
    expect(JSON.stringify(row)).not.toContain("address");
    expect(row).not.toHaveProperty("members");
  });
});

describe("discoverTables — keyset pagination determinism", () => {
  beforeEach(() => {
    db.tables = [
      makeTable({ id: "k-1", host_id: HP, scheduled_at: "2026-08-01T00:00:00.000Z", title: "One" }),
      makeTable({ id: "k-2", host_id: HP, scheduled_at: "2026-08-02T00:00:00.000Z", title: "Two" }),
      makeTable({ id: "k-3", host_id: HP, scheduled_at: "2026-08-03T00:00:00.000Z", title: "Three" }),
    ];
    db.currentViewer = null;
  });

  it("paginates soonest-first with a stable cursor and no overlaps/gaps", async () => {
    const p1 = await discoverTables({ limit: 1 }, null);
    expect(p1.tables.map((t) => t.id)).toEqual(["k-1"]);
    expect(p1.nextCursor).toBeTruthy();

    const p2 = await discoverTables({ limit: 1, cursor: p1.nextCursor! }, null);
    expect(p2.tables.map((t) => t.id)).toEqual(["k-2"]);

    const p3 = await discoverTables({ limit: 1, cursor: p2.nextCursor! }, null);
    expect(p3.tables.map((t) => t.id)).toEqual(["k-3"]);
    expect(p3.nextCursor).toBeNull(); // exhausted
  });
});

describe("discoverTables — geo prefilter + home-table exclusion", () => {
  beforeEach(() => {
    // Center ~ San Francisco.
    db.tables = [
      makeTable({ id: "g-near", host_id: HS, venue_type: "restaurant", venue_name: "Near", venue_lat: 37.7752, venue_lng: -122.4185 }),
      makeTable({ id: "g-far", host_id: HJ, venue_type: "restaurant", venue_name: "Far", venue_lat: 40.7128, venue_lng: -74.006 }), // NYC
      makeTable({ id: "g-home", host_id: HP, venue_type: "home", venue_lat: null, venue_lng: null }),
    ];
    db.currentViewer = null;
    db.currentGeo = true;
  });

  it("returns only tables within radius, computes distanceKm, and never includes home (null-coord) tables", async () => {
    const r = await discoverTables({ lat: 37.7749, lng: -122.4194, radiusKm: 25, sort: "distance" }, null);
    expect(r.tables.map((t) => t.id)).toEqual(["g-near"]);
    const near = r.tables[0];
    expect(typeof near.distanceKm).toBe("number");
    expect(near.distanceKm!).toBeLessThan(1); // a few hundred meters
  });
});

describe("discoverPeople — directory opt-out + agents first-class + follow degradation", () => {
  beforeEach(() => {
    db.users = [
      { id: HP, name: "Leonardo da Vinci", is_agent: true, is_active: true, created_at: "2026-01-05T00:00:00.000Z", balance: null, dominant_element: "Fire" },
      { id: HC, name: "Nikola Tesla", is_agent: true, is_active: true, created_at: "2026-01-04T00:00:00.000Z", balance: null, dominant_element: "Air" },
      { id: "u-open", name: "Ada Lovelace", is_agent: false, is_active: true, discoverable: true, created_at: "2026-01-03T00:00:00.000Z", balance: null, dominant_element: null },
      { id: "u-opted-out", name: "Hidden Human", is_agent: false, is_active: true, discoverable: false, created_at: "2026-01-02T00:00:00.000Z", balance: null, dominant_element: null },
    ];
    db.follows = new Set([`${V}->${HP}`]);
    db.currentViewer = V;
  });

  it("excludes opted-out humans but always includes agents (they ignore the opt-out)", async () => {
    const r = await discoverPeople({ kind: "all" }, V);
    const idsOut = r.people.map((p) => p.id);
    expect(idsOut).toContain(HP);
    expect(idsOut).toContain(HC);
    expect(idsOut).toContain("u-open");
    expect(idsOut).not.toContain("u-opted-out");
  });

  it("kind=agents returns only agents; follow-state reflects the follows table", async () => {
    const r = await discoverPeople({ kind: "agents" }, V);
    expect(r.people.every((p) => p.isAgent)).toBe(true);
    const daVinci = r.people.find((p) => p.id === HP)!;
    expect(daVinci.followState).toBe("following");
    const tesla = r.people.find((p) => p.id === HC)!;
    expect(tesla.followState).toBe("not_following");
  });

  it("hides follow-state (null) when the follows table is unavailable", async () => {
    db.hasFollowsTable = false;
    const r = await discoverPeople({ kind: "agents" }, V);
    expect(r.people.every((p) => p.followState === null)).toBe(true);
  });
});
