/**
 * @jest-environment node
 *
 * No RPC credential may reach the /admin/chain payload or a log line, on any
 * path: the `devnet.rpc` field, `devnet.error`, `mainnet.error`, and the
 * server-side error log. Alchemy keeps its key in the URL PATH, so stripping a
 * `?query` is not enough. FAKE values only; nothing here reads a real env value.
 * Devnet and mainnet carry DIFFERENT keys so that forgetting either URL shows.
 *
 * @file src/services/admin/__tests__/solanaProgressSecrecy.test.ts
 */

import { z } from "zod";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { loggedText } from "@/__tests__/helpers/loggedText";
import type { SolanaManifests } from "@/services/admin/solanaManifests";

jest.mock("@/services/admin/solanaManifests", () => ({ readManifests: jest.fn() }));
jest.mock("@/services/admin/githubClient", () => ({
  ...jest.requireActual<typeof import("@/services/admin/githubClient")>("@/services/admin/githubClient"),
  githubGet: jest.fn(),
}));

const DEVNET_KEY = "FAKEKEY123";
const MAINNET_KEY = "FAKEKEY456";
const KEYS = [DEVNET_KEY, MAINNET_KEY];
const realFetch = global.fetch;

const MANIFESTS: SolanaManifests = {
  devnet: {
    genesisHash: "GENESIS",
    programId: "ProgramId1111",
    programConfigPda: "ConfigPda1111",
    programDataAddress: "ProgramData1111",
    deployer: "Deployer1111",
    mints: [{ symbol: "SPIRIT", address: "MintSpirit1111", decimals: 4 }],
  },
  governance: null,
  audit: null,
  mainnet: { status: "pending", programId: "MainProgram1111", mints: { spirit: { address: "MainMint1111", symbol: "SPIRIT" } } },
};

const KEYED_BY_PATH = {
  label: "key in the URL path (Alchemy)",
  devnet: `https://solana-devnet.g.alchemy.com/v2/${DEVNET_KEY}`,
  mainnet: `https://solana-mainnet.g.alchemy.com/v2/${MAINNET_KEY}`,
  devnetOrigin: "https://solana-devnet.g.alchemy.com",
  mainnetOrigin: "https://solana-mainnet.g.alchemy.com",
};
const KEYED_BY_QUERY = {
  label: "key in the query string",
  devnet: `https://x.example/?api-key=${DEVNET_KEY}`,
  mainnet: `https://y.example/?api-key=${MAINNET_KEY}`,
  devnetOrigin: "https://x.example",
  mainnetOrigin: "https://y.example",
};

type Reply = { ok: boolean; status: number; body: unknown } | Error;

const ANSWERS: Record<string, unknown> = {
  getSlot: 123,
  getGenesisHash: "GENESIS",
  getMultipleAccounts: { value: [{ owner: "o", executable: true, lamports: 1 }, null] },
};

const BodySchema = z.object({ method: z.string() });

function methodOf(init: unknown): string {
  if (typeof init !== "object" || init === null || !("body" in init)) return "";
  return BodySchema.parse(JSON.parse(String(init.body))).method;
}

/** Route every RPC POST through `reply`, and remember each URL that was requested. */
function stubRpc(reply: (url: string, method: string) => Reply): string[] {
  const requested: string[] = [];
  installFetchMock(
    jest.fn(async (url: unknown, init: unknown) => {
      requested.push(String(url));
      const r = reply(String(url), methodOf(init));
      if (r instanceof Error) throw r;
      return { ok: r.ok, status: r.status, json: async () => r.body };
    }),
  );
  return requested;
}

async function loadProgress(urls: { devnet: string; mainnet: string }) {
  jest.resetModules();
  process.env.SOLANA_DEVNET_RPC_URL = urls.devnet;
  process.env.SOLANA_MAINNET_RPC_URL = urls.mainnet;
  delete process.env.INTERNAL_API_SECRET;
  const manifests = await import("@/services/admin/solanaManifests");
  const github = await import("@/services/admin/githubClient");
  jest.mocked(manifests.readManifests).mockResolvedValue(MANIFESTS);
  jest.mocked(github.githubGet).mockResolvedValue({ ok: false, reason: "error", detail: "github not reachable in test" });
  const { getSolanaProgress } = await import("@/services/admin/solanaProgressService");
  return getSolanaProgress();
}

/** Fails with the offending key named, instead of a bare "expected not to contain". */
function expectNoKey(text: string): void {
  for (const key of KEYS) expect({ key, leaked: text.includes(key) }).toEqual({ key, leaked: false });
}

describe("/admin/chain Solana payload never carries an RPC credential", () => {
  const saved = { devnet: process.env.SOLANA_DEVNET_RPC_URL, mainnet: process.env.SOLANA_MAINNET_RPC_URL, secret: process.env.INTERNAL_API_SECRET };
  let errorLog: jest.SpyInstance;

  beforeEach(() => {
    errorLog = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorLog.mockRestore();
    global.fetch = realFetch;
    const restore = (name: string, value: string | undefined): void => {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    };
    restore("SOLANA_DEVNET_RPC_URL", saved.devnet);
    restore("SOLANA_MAINNET_RPC_URL", saved.mainnet);
    restore("INTERNAL_API_SECRET", saved.secret);
  });

  describe.each([KEYED_BY_PATH, KEYED_BY_QUERY])("$label", (cfg) => {
    it("shows the endpoint's origin as `devnet.rpc` and nothing that follows it", async () => {
      const requested = stubRpc((_url, method) => ({ ok: true, status: 200, body: { result: ANSWERS[method] ?? null } }));
      const progress = await loadProgress(cfg);

      expect(progress.devnet.rpc).toBe(cfg.devnetOrigin);
      expectNoKey(JSON.stringify(progress));
      // The witness that makes the absence above mean something: both keys WERE in use.
      expect(requested.some((u) => u.includes(DEVNET_KEY))).toBe(true);
      expect(requested.some((u) => u.includes(MAINNET_KEY))).toBe(true);
    });

    it("keeps the keys out of devnet.error / mainnet.error / the log when fetch echoes the URL it was given", async () => {
      stubRpc((url) => new TypeError(`Failed to parse URL from ${url}`));
      const progress = await loadProgress(cfg);

      expect(progress.devnet.error).toBe(`Failed to parse URL from ${cfg.devnetOrigin}`);
      expect(progress.mainnet.error).toBe(`Failed to parse URL from ${cfg.mainnetOrigin}`);
      expectNoKey(JSON.stringify(progress));
      expect(errorLog).toHaveBeenCalled();
      expectNoKey(loggedText(errorLog.mock.calls));
    });

    it("keeps the keys out when the provider's own JSON-RPC error echoes the URL and the bare key", async () => {
      stubRpc((url) => ({
        ok: true,
        status: 200,
        body: { error: { message: `bad key ${url === cfg.devnet ? DEVNET_KEY : MAINNET_KEY} for ${url}` } },
      }));
      const progress = await loadProgress(cfg);

      expect(progress.devnet.error).toContain(`bad key [redacted] for ${cfg.devnetOrigin}`);
      expect(progress.mainnet.error).toContain(`bad key [redacted] for ${cfg.mainnetOrigin}`);
      expectNoKey(JSON.stringify(progress));
      expectNoKey(loggedText(errorLog.mock.calls));
    });

    it("control: an HTTP failure still reports its real cause (the redaction does not blind the panel)", async () => {
      stubRpc(() => ({ ok: false, status: 401, body: {} }));
      const progress = await loadProgress(cfg);

      expect(progress.devnet.error).toMatch(/^get(Slot|GenesisHash): HTTP 401$/);
      expect(progress.mainnet.error).toBe("getMultipleAccounts: HTTP 401");
    });
  });

  // These use the real Node `fetch`: it rejects BEFORE any network I/O and puts
  // the whole URL, credentials included, in the TypeError message.
  describe("a malformed or credential-bearing env value (real fetch, no network)", () => {
    it.each([
      ["a URL with no scheme", `solana-devnet.g.alchemy.com/v2/${DEVNET_KEY}`, `solana-mainnet.g.alchemy.com/v2/${MAINNET_KEY}`],
      ["a host that does not parse", `https://solana devnet.example/v2/${DEVNET_KEY}`, `https://solana mainnet.example/v2/${MAINNET_KEY}`],
      ["userinfo credentials", `https://FAKEUSER:${DEVNET_KEY}@devnet.example/`, `https://FAKEUSER:${MAINNET_KEY}@mainnet.example/`],
    ])("%s", async (_label, devnet, mainnet) => {
      const progress = await loadProgress({ devnet, mainnet });

      expect(progress.devnet.error).toEqual(expect.any(String));
      expect(progress.mainnet.error).toEqual(expect.any(String));
      const serialised = JSON.stringify(progress);
      expectNoKey(serialised);
      expect(serialised).not.toContain("FAKEUSER");
      expect(errorLog).toHaveBeenCalled();
      const logged = loggedText(errorLog.mock.calls);
      expectNoKey(logged);
      expect(logged).not.toContain("FAKEUSER");
    });
  });
});
