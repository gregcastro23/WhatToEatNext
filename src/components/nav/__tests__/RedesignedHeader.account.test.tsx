/**
 * @jest-environment jsdom
 *
 * RedesignedHeader — account menu. Regression guard for the live-site audit
 * finding: an authenticated user had no way to sign out from the global nav.
 * The user chip was a plain <Link href="/profile">, so signing out meant
 * knowing to visit /profile and finding an icon-only button there.
 *
 * These assert the MECHANISM (chip opens a menu; the menu's sign-out control
 * calls next-auth signOut), not merely that some element says "Sign out".
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { RedesignedHeader } from "../RedesignedHeader";

const mockSignOut = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: jest.fn() }),
}));

// The header lazy-loads three unrelated widgets (messages, notifications,
// cart). They pull their own data hooks and are not under test here, so
// next/dynamic is stubbed to a no-op rather than mocking each one.
jest.mock("next/dynamic", () => () => {
  const Stub = () => null;
  Stub.displayName = "DynamicStub";
  return Stub;
});

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    status: "authenticated",
    data: { user: { name: "Ada Lovelace", email: "ada@example.com", id: "abcd1234efgh" } },
  }),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe("RedesignedHeader account menu", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
  });

  const openMenu = () => {
    const chip = screen.getByRole("button", { name: /your account/i });
    fireEvent.click(chip);
    return chip;
  };

  it("exposes the account chip as a menu trigger, collapsed by default", () => {
    render(<RedesignedHeader />);
    const chip = screen.getByRole("button", { name: /your account/i });
    expect(chip).toHaveAttribute("aria-haspopup", "menu");
    expect(chip).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu", { name: /account/i })).not.toBeInTheDocument();
  });

  it("opens a menu containing a visible, labelled Sign out control", () => {
    render(<RedesignedHeader />);
    const chip = openMenu();
    expect(chip).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("menu", { name: /account/i });
    expect(menu).toBeInTheDocument();

    // A real accessible name, not a title-attribute tooltip.
    const signOut = screen.getByRole("menuitem", { name: /^sign out$/i });
    expect(signOut).toBeInTheDocument();
  });

  it("calls signOut and returns the user to the homepage", () => {
    render(<RedesignedHeader />);
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /^sign out$/i }));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("closes on Escape without signing the user out", () => {
    render(<RedesignedHeader />);
    const chip = openMenu();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(chip).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu", { name: /account/i })).not.toBeInTheDocument();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("closes on an outside mousedown", () => {
    render(<RedesignedHeader />);
    const chip = openMenu();

    fireEvent.mouseDown(document.body);

    expect(chip).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu", { name: /account/i })).not.toBeInTheDocument();
  });

  it("still shows the account destinations alongside sign out", () => {
    render(<RedesignedHeader />);
    openMenu();
    for (const label of [/^profile$/i, /^preferences$/i, /^esms vault$/i, /account & sessions/i]) {
      expect(screen.getByRole("menuitem", { name: label })).toBeInTheDocument();
    }
  });
});
