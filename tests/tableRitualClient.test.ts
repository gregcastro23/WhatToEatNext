import {
  parseTablePercentage,
  readTableRitualResponse,
} from "@/lib/tableRitualClient";

describe("table ritual client boundary", () => {
  it.each([null, undefined, "", "0", "not-a-number"])(
    "preserves the historical 25%% fallback for %p",
    (value) => {
      expect(parseTablePercentage(value)).toBe(25);
    },
  );

  it("clamps finite and infinite invite-link values to 0–100", () => {
    expect(parseTablePercentage("-20")).toBe(0);
    expect(parseTablePercentage("80")).toBe(80);
    expect(parseTablePercentage("120")).toBe(100);
    expect(parseTablePercentage("Infinity")).toBe(100);
  });

  it("accepts the shared rate-limit envelope without discarding its message", async () => {
    const response = new Response(
      JSON.stringify({ message: "Too many requests", retryAfter: 30 }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );

    await expect(readTableRitualResponse(response)).resolves.toMatchObject({
      message: "Too many requests",
    });
  });
});
