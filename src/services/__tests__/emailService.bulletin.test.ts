/**
 * @jest-environment node
 *
 * Regression coverage: Bulletin template rendering with null vs omitted/undefined natalChart.
 * Note: Exercises renderBulletinEmail directly (the template invoked by emailService.sendWeeklyDigestEmail).
 */

import { renderBulletinEmail } from "@/lib/email/templates/bulletin";

describe("bulletin email template regression coverage", () => {
  it("renders correctly when natalChart is null", () => {
    const result = renderBulletinEmail({
      name: "Test User",
      natalChart: null,
      unsubscribeUrl: "https://example.com/unsub",
    });

    expect(result.subject).toBeDefined();
    expect(result.html).toContain("Test");
    expect(result.text).toContain("Test");
    expect(result.html).toContain("https://example.com/unsub");
  });

  it("renders correctly when natalChart is omitted/undefined", () => {
    const result = renderBulletinEmail({
      name: "Greg",
    });

    expect(result.subject).toBeDefined();
    expect(result.html).toContain("Greg");
    expect(result.text).toContain("Greg");
  });
});
