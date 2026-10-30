import { parseEnvFileText } from "../env";

describe("parseEnvFileText", () => {
  it("reads assignments and strips surrounding quotes", () => {
    expect(
      parseEnvFileText('DATABASE_URL="postgres://a/b"\nOTHER=\'x\'\nPLAIN=value'),
    ).toEqual({ DATABASE_URL: "postgres://a/b", OTHER: "x", PLAIN: "value" });
  });

  it("keeps an empty value as the empty string", () => {
    expect(parseEnvFileText("EMPTY=\nALSO_EMPTY=  ")).toEqual({ EMPTY: "", ALSO_EMPTY: "" });
  });

  it("ignores comments, blank lines and lowercase keys", () => {
    expect(parseEnvFileText("# COMMENT=1\n\nlower=1\nKEY=1")).toEqual({ KEY: "1" });
  });
});

describe("sync-agentic-users canonical roster & CLI flags", () => {
  it("parses --dry-run, --only-missing, --include-non-npc, and --slug filters", async () => {
    const { parseSyncCliArgs } = await import("../../sync-agentic-users");
    expect(parseSyncCliArgs(["--dry-run", "--only-missing", "--slug=chiron,isaac-newton"])).toEqual({
      dryRun: true,
      onlyMissing: true,
      includeNonNpc: false,
      slugFilter: new Set(["chiron", "isaac-newton"]),
    });
    expect(parseSyncCliArgs(["-n", "--include-non-npc"])).toEqual({
      dryRun: true,
      onlyMissing: false,
      includeNonNpc: true,
      slugFilter: null,
    });
  });

  it("includes chiron in canonical historical NPCs and excludes greg-castro-1991 unless explicitly requested", async () => {
    const { isCanonicalHistoricalNpcSlug, parseSyncCliArgs } = await import("../../sync-agentic-users");
    const defaultCli = parseSyncCliArgs([]);
    expect(isCanonicalHistoricalNpcSlug("chiron", defaultCli)).toBe(true);
    expect(isCanonicalHistoricalNpcSlug("isaac-newton", defaultCli)).toBe(true);
    expect(isCanonicalHistoricalNpcSlug("greg-castro-1991", defaultCli)).toBe(false);
    expect(isCanonicalHistoricalNpcSlug("", defaultCli)).toBe(false);

    const explicitSlug = parseSyncCliArgs(["--slug=greg-castro-1991"]);
    expect(isCanonicalHistoricalNpcSlug("greg-castro-1991", explicitSlug)).toBe(true);
    expect(isCanonicalHistoricalNpcSlug("chiron", explicitSlug)).toBe(false);
  });

  it("derives planet positions from chart without fabricated longitude fields", async () => {
    const { derivePositionsFromChart } = await import("../../sync-agentic-users");
    const positions = derivePositionsFromChart({
      planets: {
        Sun: { sign: "Scorpio", degree: 8.9 },
        Moon: { sign: "Cancer", degree: 18.9 },
      },
    });
    expect(positions).toEqual([
      { planet: "Sun", sign: "Scorpio", degree: 9 },
      { planet: "Moon", sign: "Cancer", degree: 19 },
    ]);
    for (const p of positions) {
      expect("longitude" in p).toBe(false);
    }
  });
});
