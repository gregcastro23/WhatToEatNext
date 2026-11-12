/**
 * Producer bodies: GET /api/table-invites/[token] (route.ts:30-33, service
 * getInvitePreview) and POST /api/table-invites/[token]/redeem (route.ts:36-102).
 * Network is blocked in Jest, so every body is a literal fixture.
 */
import { parseInvitePreviewBody, parseRedeemInviteBody } from "../inviteParsers";

const PREVIEW = {
  tableTitle: "Sunday Supper",
  hostName: "Ada",
  scheduledAt: "2026-11-15T18:30:00.000Z",
  venueName: "Ada's place",
  joinedCount: 3,
  valid: true,
};

describe("parseInvitePreviewBody", (): void => {
  it("rejects a real JSON null body with a specific message", (): void => {
    const body: unknown = JSON.parse("null");
    expect(body).toBeNull();
    expect(() => parseInvitePreviewBody(body)).toThrow("Invite preview response must be a JSON object");
  });

  it.each([[[]], ["text"], [7]])("rejects a non-object body (%j)", (value): void => {
    expect(() => parseInvitePreviewBody(value)).toThrow("Invite preview response must be a JSON object");
  });

  it("keeps the producer's success body and drops unread keys", (): void => {
    expect(parseInvitePreviewBody({ success: true, preview: PREVIEW })).toEqual({ preview: PREVIEW });
  });

  it("omits venueName when the producer omits it", (): void => {
    const { venueName: _omitted, ...withoutVenue } = PREVIEW;
    const out = parseInvitePreviewBody({ success: true, preview: withoutVenue });
    expect(out).toEqual({ preview: withoutVenue });
    expect(out.preview).not.toHaveProperty("venueName");
  });

  it("passes an expired invite (valid: false) through as a preview", (): void => {
    expect(parseInvitePreviewBody({ success: true, preview: { ...PREVIEW, valid: false } })).toEqual({
      preview: { ...PREVIEW, valid: false },
    });
  });

  it("reads a refusal body, or a null preview, as no preview", (): void => {
    expect(parseInvitePreviewBody({ success: false, message: "Invite not found" })).toEqual({});
    expect(parseInvitePreviewBody({ success: true, preview: null })).toEqual({});
  });

  it.each([
    ["tableTitle", 5, "Invite preview tableTitle must be a string"],
    ["hostName", null, "Invite preview hostName must be a string"],
    ["scheduledAt", 1763231400000, "Invite preview scheduledAt must be a string"],
    ["joinedCount", "3", "Invite preview joinedCount must be a number"],
    ["valid", "true", "Invite preview valid must be a boolean"],
  ])("rejects a preview whose %s is wrong-typed (%j)", (field, bad, message): void => {
    // control: the identical body is accepted while the field is valid, so the
    // rejection below is the parser's doing and not a malformed fixture.
    expect(parseInvitePreviewBody({ success: true, preview: PREVIEW })).toEqual({ preview: PREVIEW });
    expect(() => parseInvitePreviewBody({ success: true, preview: { ...PREVIEW, [field]: bad } })).toThrow(message);
  });

  it("rejects a joinedCount that is a number type but not finite", (): void => {
    // JSON.parse turns an out-of-range literal into Infinity, as a wire body would
    const huge: unknown = JSON.parse("1e999");
    expect(huge).toBe(Number.POSITIVE_INFINITY);
    expect(() => parseInvitePreviewBody({ success: true, preview: { ...PREVIEW, joinedCount: huge } })).toThrow(
      "Invite preview joinedCount must be a number",
    );
    // control: a finite count passes
    expect(parseInvitePreviewBody({ success: true, preview: { ...PREVIEW, joinedCount: 0 } }).preview?.joinedCount).toBe(0);
  });

  it("rejects a preview that is missing a required field", (): void => {
    const { joinedCount: _omitted, ...incomplete } = PREVIEW;
    expect(() => parseInvitePreviewBody({ success: true, preview: incomplete })).toThrow(
      "Invite preview joinedCount must be a number",
    );
  });

  it.each([["text"], [[]], [7]])("rejects a preview that is not an object (%j)", (preview): void => {
    expect(() => parseInvitePreviewBody({ success: true, preview })).toThrow("Invite preview must be a JSON object");
  });

  it("drops a wrong-typed venueName instead of rendering it", (): void => {
    expect(parseInvitePreviewBody({ preview: { ...PREVIEW, venueName: 5 } }).preview).not.toHaveProperty("venueName");
    // control: the same field with a string is kept
    expect(parseInvitePreviewBody({ preview: { ...PREVIEW, venueName: "Cafe" } }).preview).toHaveProperty(
      "venueName",
      "Cafe",
    );
  });
});

describe("parseRedeemInviteBody", (): void => {
  it("rejects a real JSON null body with a specific message", (): void => {
    const body: unknown = JSON.parse("null");
    expect(body).toBeNull();
    expect(() => parseRedeemInviteBody(body)).toThrow("Redeem response must be a JSON object");
  });

  it.each([[[]], ["text"], [7]])("rejects a non-object body (%j)", (value): void => {
    expect(() => parseRedeemInviteBody(value)).toThrow("Redeem response must be a JSON object");
  });

  it("keeps the producer's success body and drops alreadyMember", (): void => {
    expect(parseRedeemInviteBody({ success: true, tableId: "42", alreadyMember: false })).toEqual({
      success: true,
      tableId: "42",
    });
  });

  it("keeps a refusal and its message", (): void => {
    expect(parseRedeemInviteBody({ success: false, message: "This table is full" })).toEqual({
      success: false,
      message: "This table is full",
    });
  });

  it("keeps the message of the rate-limit 429 body", (): void => {
    expect(
      parseRedeemInviteBody({ error: "rate_limit_exceeded", message: "Too many requests. Please try again shortly." }),
    ).toEqual({ message: "Too many requests. Please try again shortly." });
  });

  it("reads an empty object as a refusal with no message", (): void => {
    expect(parseRedeemInviteBody({})).toEqual({});
  });

  it("drops wrong-typed fields so the page's success check fails", (): void => {
    const out = parseRedeemInviteBody({ success: "yes", tableId: 42, message: { text: "x" } });
    expect(out).toEqual({});
    // control: the identical keys with the right types are all kept
    expect(parseRedeemInviteBody({ success: true, tableId: "42", message: "x" })).toEqual({
      success: true,
      tableId: "42",
      message: "x",
    });
  });
});
