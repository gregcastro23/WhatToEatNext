/**
 * Self-contained WTEN copy of the ASOL ESMS identity contract. CI deliberately
 * does not reach into a sibling checkout; upstream changes require an explicit
 * fixture update and review in both repositories.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ESMS_SPL_UTILITY } from "@/lib/esms-chain/solanaMirror";

const EXPECTED = [
  { key: "spirit", name: "Spirit", symbol: "SPIRIT" },
  { key: "essence", name: "Essence", symbol: "ESSENCE" },
  { key: "matter", name: "Matter", symbol: "MATTER" },
  { key: "substance", name: "Substance", symbol: "SUBSTANCE" },
] as const;

interface MetadataIdentity {
  name: unknown;
  symbol: unknown;
  decimals: unknown;
}

describe("WTEN ↔ ASOL SPL identity parity", () => {
  it.each(EXPECTED)("pins $name / $symbol / 4 decimals", (expected) => {
    const metadata = JSON.parse(
      readFileSync(
        join(process.cwd(), "public", "metadata", "esms", `${expected.key}.json`),
        "utf8",
      ),
    ) as MetadataIdentity;

    expect(metadata).toMatchObject({
      name: expected.name,
      symbol: expected.symbol,
      decimals: 4,
    });
  });

  it("keeps the runtime disclosure on the same four-decimal identity", () => {
    expect(ESMS_SPL_UTILITY.decimals).toBe(4);
    expect(ESMS_SPL_UTILITY.soulbound).toBe(true);
    expect(ESMS_SPL_UTILITY.closedLoop).toBe(true);
  });
});
