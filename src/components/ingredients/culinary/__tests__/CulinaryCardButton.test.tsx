/** @jest-environment jsdom */

/**
 * The card is loaded and fetched only when asked for, and closing it returns
 * focus to the button. Faked: fetch, and the card body.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { installFetchMock } from "../../../../__tests__/helpers/fetchMock";
import { CulinaryCardButton } from "../CulinaryCardButton";
import * as mockDialogChunk from "../CulinaryCardDialog";

jest.mock("../CulinaryCardBody", () => ({ CulinaryCardBody: () => null }));

// The real dialog chunk, imported with this file: jest.config's resetModules
// would give a chunk required mid-test its own copy of React.
jest.mock("next/dynamic", () => {
  const React: typeof import("react") = jest.requireActual("react");
  return () =>
    function DynamicLoaded(props: import("../CulinaryCardDialog").CulinaryCardDialogProps) {
      return React.createElement(mockDialogChunk.CulinaryCardDialog, props);
    };
});

it("loads and fetches the card only on click, then hands focus back", async () => {
  const fetchMock = installFetchMock(jest.fn(() => Promise.resolve({ ok: false, status: 404 })));
  render(<CulinaryCardButton name="bacon" title="Bacon" />);
  const button = screen.getByRole("button", { name: "Culinary card" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();

  fireEvent.click(button);
  expect(await screen.findByRole("dialog", undefined, { timeout: 5000 })).toBeInTheDocument();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/ingredients/bacon/culinary"), { timeout: 5000 });
  expect(await screen.findByText(/no culinary card/, undefined, { timeout: 5000 })).toBeInTheDocument();

  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(button).toHaveFocus());
});
