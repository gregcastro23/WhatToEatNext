import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  SOURCE_ID,
  VERSION_ID,
  savedFixture,
} from "@/lib/recipes/__tests__/helpers/adaptationFixtures";
import { AdaptationRequestSchema } from "@/lib/recipes/savedAdaptationSchemas";
import { SavedAdaptationButton } from "../SavedAdaptationButton";

const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const FIRST_REQUEST = "44444444-4444-4444-8444-444444444444";
const NEXT_REQUEST = "55555555-5555-4555-8555-555555555555";

function clickSave(): void {
  fireEvent.click(screen.getByRole("button", { name: /Make Leonardo/ }));
}

function success(publication: "published" | "not-published" | "unknown" = "not-published"): Response {
  return new Response(JSON.stringify({ success: true, version: savedFixture(), publication }));
}

function requestId(index: number): string {
  const body = mockFetch.mock.calls[index]?.[1]?.body;
  if (typeof body !== "string") throw new Error("Missing JSON request body");
  const raw: unknown = JSON.parse(body);
  return AdaptationRequestSchema.parse(raw).clientRequestId;
}

function deferredResponse(): { response: Promise<Response>; resolve: (response: Response) => void } {
  let complete: ((response: Response) => void) | undefined;
  const response = new Promise<Response>((resolve) => { complete = resolve; });
  return {
    response,
    resolve(value) {
      if (complete === undefined) throw new Error("Missing response resolver");
      complete(value);
    },
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
  jest.spyOn(crypto, "randomUUID")
    .mockReturnValueOnce(FIRST_REQUEST)
    .mockReturnValue(NEXT_REQUEST);
});
afterEach(cleanup);

describe("SavedAdaptationButton mutation confirmation", () => {
  it.each([
    ["invalid JSON", () => new Response("not JSON", { status: 200 })],
    ["invalid version", () => new Response(JSON.stringify({ success: true, version: {} }))],
    ["unknown publication", () => new Response(JSON.stringify({ success: true, version: savedFixture(), publication: "maybe" }))],
    ["empty 204", () => new Response(null, { status: 204 })],
  ])("retains request identity after an unreadable 2xx: %s", async (_label, response) => {
    mockFetch.mockResolvedValueOnce(response()).mockResolvedValueOnce(success());
    render(<SavedAdaptationButton recipeId={SOURCE_ID} />);
    clickSave();
    expect(await screen.findByRole("alert")).toHaveTextContent("Save confirmation is unavailable");
    expect(screen.queryByRole("link", { name: "View saved version" })).not.toBeInTheDocument();

    clickSave();
    expect(await screen.findByRole("link", { name: "View saved version" })).toHaveAttribute("href", `/recipes/versions/${VERSION_ID}`);
    expect(requestId(0)).toBe(FIRST_REQUEST);
    expect(requestId(1)).toBe(FIRST_REQUEST);
    expect(screen.getByRole("status")).toHaveTextContent("not published");
    expect(mockFetch.mock.calls[0]?.[0]).toBe(`/api/recipes/${SOURCE_ID}/adapt`);
  });

  it("reuses the request ID after a lost response without claiming a rejection", async () => {
    mockFetch.mockRejectedValueOnce(new Error("lost response")).mockResolvedValueOnce(success("unknown"));
    render(<SavedAdaptationButton recipeId={SOURCE_ID} />);
    clickSave();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Retry the same action");
    expect(alert).not.toHaveTextContent("Server rejected");
    clickSave();
    expect(await screen.findByRole("status")).toHaveTextContent("Feed publication could not be confirmed");
    expect(requestId(1)).toBe(requestId(0));
  });

  it.each([
    ["unreadable body", () => new Response("unreadable rejection", { status: 503 }), "Server rejected the request (HTTP 503)"],
    ["wrong error shape", () => new Response(JSON.stringify({ success: false, error: { detail: "no" } }), { status: 422 }), "Server rejected the request (HTTP 422)"],
    ["server reason", () => new Response(JSON.stringify({ success: false, error: "Recipe unavailable" }), { status: 422 }), "Recipe unavailable"],
  ])("keeps HTTP rejection meaning with %s", async (_label, response, message) => {
    mockFetch.mockResolvedValueOnce(response()).mockResolvedValueOnce(success());
    render(<SavedAdaptationButton recipeId={SOURCE_ID} />);
    clickSave();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(message);
    expect(alert).not.toHaveTextContent("Save confirmation is unavailable");
    clickSave();
    await screen.findByRole("link", { name: "View saved version" });
    expect(requestId(1)).toBe(requestId(0));
  });

  it("preserves a prior good saved result while a fresh mutation is uncertain", async () => {
    mockFetch.mockResolvedValueOnce(success("published"))
      .mockResolvedValueOnce(new Response("unreadable success", { status: 200 }));
    render(<SavedAdaptationButton recipeId={SOURCE_ID} />);
    clickSave();
    await screen.findByRole("link", { name: "View saved version" });
    clickSave();
    await screen.findByRole("alert");
    expect(screen.getByRole("link", { name: "View saved version" })).toHaveAttribute("href", `/recipes/versions/${VERSION_ID}`);
    expect(screen.getByRole("status")).toHaveTextContent("Adapted action published");
    expect(requestId(0)).toBe(FIRST_REQUEST);
    expect(requestId(1)).toBe(NEXT_REQUEST);
  });

  it("does not display the previous recipe's saved result or error for a new source", async () => {
    mockFetch.mockResolvedValueOnce(success()).mockRejectedValueOnce(new Error("lost response"));
    const { rerender } = render(<SavedAdaptationButton recipeId={SOURCE_ID} />);
    clickSave();
    await screen.findByRole("link", { name: "View saved version" });
    clickSave();
    await screen.findByRole("alert");
    rerender(<SavedAdaptationButton recipeId="different-source" />);
    expect(screen.queryByRole("link", { name: "View saved version" })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps a late completion for an old recipe off the current recipe", async () => {
    const pending = deferredResponse();
    mockFetch.mockReturnValueOnce(pending.response);
    const { rerender } = render(<SavedAdaptationButton recipeId={SOURCE_ID} />);
    clickSave();
    rerender(<SavedAdaptationButton recipeId="different-source" />);
    await act(async () => { pending.resolve(success()); });
    await waitFor(() => expect(screen.getByRole("button", { name: /Make Leonardo/ })).toBeEnabled());
    expect(screen.queryByRole("link", { name: "View saved version" })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("treats a schema-valid response for the wrong source as uncertain and retains its request ID", async () => {
    const mismatched = savedFixture();
    mismatched.receipt.original.id = "different-source";
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true, version: mismatched, publication: "published" })))
      .mockResolvedValueOnce(success());
    render(<SavedAdaptationButton recipeId={SOURCE_ID} />);
    clickSave();
    expect(await screen.findByRole("alert")).toHaveTextContent("Save confirmation is unavailable");
    expect(screen.queryByRole("link", { name: "View saved version" })).not.toBeInTheDocument();
    clickSave();
    await screen.findByRole("link", { name: "View saved version" });
    expect(requestId(1)).toBe(requestId(0));
  });
});
