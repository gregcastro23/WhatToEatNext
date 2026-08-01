/**
 * Recipe-NFT content commitment — schema v2 identity and integrity pins.
 *
 * Four defects fixed together while `recipe_nft_mints` is still 0 rows (the
 * last cheap window before anything is committed on-chain):
 *   1. `id` was inside the contentHash envelope, so the SAME dish minted again
 *      under a different client-chosen id produced a different hash and walked
 *      straight past the UNIQUE(content_hash) dedupe.
 *   2. User-visible content (tags, finishing/serving, leftovers, vitamins,
 *      minerals) was NOT committed — silently mutable post-mint.
 *   3. The content route recomputed the fingerprint from the live ingredient
 *      catalog while claiming `Cache-Control: immutable` (served bytes drifted
 *      from the hash in the URL whenever the catalog changed). Now the mint
 *      stores the exact envelope and the route serves it verbatim.
 *   4. A mint with on-chain enabled could commit a localhost/protected-preview
 *      contentURI permanently — now refused via isPublicCommitmentBase.
 */
import {
  buildRecipeNftContent,
  computeCommitments,
  CONTENT_SCHEMA_VERSION,
} from "@/lib/recipe-nft/content";
import { computeRecipeFingerprint } from "@/lib/recipe-nft/fingerprint";
import { parseRecipeForMint, type MintableRecipe } from "@/lib/recipe-nft/mintableRecipe";
import { featuredRecipe } from "@/data/featuredRecipe";
import { isPublicCommitmentBase } from "@/utils/urlUtils";

const baseRecipe = (): MintableRecipe =>
  JSON.parse(JSON.stringify(featuredRecipe)) as MintableRecipe;

const hashesOf = (r: MintableRecipe) => computeCommitments(r, computeRecipeFingerprint(r));

describe("content envelope schema v2", () => {
  it("pins the schema version", () => {
    expect(CONTENT_SCHEMA_VERSION).toBe(2);
  });

  it("keeps the client-chosen id OUT of the identity", () => {
    const a = baseRecipe();
    const b = baseRecipe();
    b.id = "totally-different-client-id";
    // THE DEFECT: under v1 these differed, so re-minting the same dish under a
    // fresh id bypassed the UNIQUE(content_hash) dedupe.
    expect(hashesOf(a).contentHash).toBe(hashesOf(b).contentHash);
    // POSITIVE CONTROL — the hash still discriminates real content: change one
    // ingredient quantity and every commitment that embeds content moves.
    const c = baseRecipe();
    c.ingredients[0].quantity = String(Number(c.ingredients[0].quantity || "1") + 1);
    expect(hashesOf(a).contentHash).not.toBe(hashesOf(c).contentHash);
    // And the envelope itself carries no id key at all.
    const envelope = buildRecipeNftContent(a, computeRecipeFingerprint(a));
    expect("id" in envelope).toBe(false);
  });

  it("commits the user-visible content v1 left mutable", () => {
    const recipe = baseRecipe();
    const envelope = buildRecipeNftContent(recipe, computeRecipeFingerprint(recipe)) as Record<
      string,
      unknown
    >;
    // Fields present on the recipe must land in the envelope (stableStringify
    // skips undefined, so optional-absent stays stable).
    for (const key of [
      "tags",
      "finishing_and_serving",
      "leftovers_and_storage",
      "vitamins",
      "minerals",
    ] as const) {
      if ((recipe as Record<string, unknown>)[key] !== undefined) {
        expect(envelope[key]).toEqual((recipe as Record<string, unknown>)[key]);
      }
    }
    // Moment-relative evaluations stay OUT: they grade fit-to-request, not the
    // recipe, and would make the same dish hash differently by mood.
    expect("alignment_score" in envelope).toBe(false);
    expect("alignment_notes" in envelope).toBe(false);
  });

  it("changes the hash when committed-but-previously-mutable content changes", () => {
    const a = baseRecipe();
    const b = baseRecipe();
    (b as Record<string, unknown>).finishing_and_serving = "Serve cold, garnish with regret.";
    expect(hashesOf(a).contentHash).not.toBe(hashesOf(b).contentHash);
  });

  it("round-trips the featured recipe through the mint parser", () => {
    // The stored-envelope path serves parseRecipeForMint(recipe_json)'s output;
    // if the featured recipe cannot round-trip, the ledger path is broken.
    const parsed = parseRecipeForMint(featuredRecipe);
    expect(parsed.ok).toBe(true);
  });
});

describe("isPublicCommitmentBase — no dead contentURIs on-chain", () => {
  const OLD = { ...process.env };
  afterEach(() => {
    process.env.VERCEL_URL = OLD.VERCEL_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = OLD.VERCEL_PROJECT_PRODUCTION_URL;
  });

  it("refuses localhost and loopback", () => {
    expect(isPublicCommitmentBase("http://localhost:3000")).toBe(false);
    expect(isPublicCommitmentBase("http://127.0.0.1:3000")).toBe(false);
    expect(isPublicCommitmentBase("http://app.localhost:3000")).toBe(false);
    expect(isPublicCommitmentBase("not a url")).toBe(false);
  });

  it("accepts the production site", () => {
    expect(isPublicCommitmentBase("https://alchm.kitchen")).toBe(true);
  });

  it("refuses a Deployment-Protection-gated Vercel deployment URL", () => {
    process.env.VERCEL_URL = "wten-abc123-team.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "alchm.kitchen";
    // The deployment URL returns 401 to the public — committing it on-chain
    // permanently points the token at a door that never opens.
    expect(isPublicCommitmentBase("https://wten-abc123-team.vercel.app")).toBe(false);
    // The production alias itself stays fine even when it IS the deployment.
    process.env.VERCEL_URL = "alchm.kitchen";
    expect(isPublicCommitmentBase("https://alchm.kitchen")).toBe(true);
  });
});
