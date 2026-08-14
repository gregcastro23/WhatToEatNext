/**
 * The welcome-grant alarm has to be ACTIONABLE, and it has to stay honest
 * while being so.
 *
 * A bare count told the operator that N users hold no welcome grant and then
 * linked them to an unfiltered `/admin/users`, which cannot answer "which N?".
 * Naming them introduces three ways to lie that the count alone could not:
 * showing a truncated list as if it were complete, showing an EMPTY list under
 * a non-zero count (which reads as "nobody", when it means the identity query
 * failed), and naming anyone at all when the check is not live.
 *
 * The count↔roster set equality is proven against a real PostgreSQL in
 * `scripts/checkWelcomeGrantCoverageBehaviour.mjs`. This file covers only what
 * that gate cannot see: what the operator ends up looking at.
 */
import { render, screen } from "@testing-library/react";
import { EconomyIntegrityPanel } from "@/app/admin/_dashboard/integrity";
import { FALLBACK_DATA } from "@/app/admin/_dashboard/data";
import type { EconomyIntegrityData } from "@/services/economyIntegrityService";

const YIELD = FALLBACK_DATA.cosmicYield;

const mkUser = (n: number) => ({
  id: `00000000-0000-0000-0000-00000000000${n}`,
  email: `missing${n}@example.invalid`,
  createdAt: new Date(Date.now() - n * 3_600_000).toISOString(),
});

function renderPanel(welcomeGrant: EconomyIntegrityData["welcomeGrant"]) {
  return render(
    <EconomyIntegrityPanel
      integrity={{ ...FALLBACK_DATA.economyIntegrity, welcomeGrant }}
      cosmicYield={YIELD}
    />,
  );
}

/** The roster's own heading — present only when the roster renders. */
const ROSTER = /WITHOUT A WELCOME GRANT/;

describe("welcome-grant roster", () => {
  it("names each ungranted user and links to that user, not to a user list", () => {
    renderPanel({
      humansWithoutGrant: 2,
      missing: [mkUser(1), mkUser(2)],
      live: true,
    });

    expect(screen.getByText(ROSTER)).toBeInTheDocument();
    const first = screen.getByText("missing1@example.invalid");
    expect(first).toHaveAttribute(
      "href",
      "/admin/users/00000000-0000-0000-0000-000000000001",
    );
    expect(screen.getByText("missing2@example.invalid")).toBeInTheDocument();

    // The dead end this replaced: a link to the unfiltered user list.
    expect(
      document.querySelector('a[href="/admin/users"]'),
    ).not.toBeInTheDocument();
    // A complete list must not claim there is more.
    expect(screen.queryByText(/more not shown/)).not.toBeInTheDocument();
  });

  it("discloses truncation rather than passing a capped list off as all of them", () => {
    const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(mkUser);
    renderPanel({ humansWithoutGrant: 25, missing, live: true });

    // 25 counted − 9 named = 16 unnamed. Derived from the two numbers, so it
    // stays correct if WELCOME_GRANT_SAMPLE_LIMIT ever changes.
    expect(screen.getByText(/\+ 16 more not shown/)).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("says the identities are unavailable instead of rendering an empty list", () => {
    // The count query succeeded, the identity query did not. An empty roster
    // under a count of 3 would read as a contradiction; silence would read as
    // "no such users".
    renderPanel({ humansWithoutGrant: 3, missing: [], live: true });

    expect(screen.getByText(/identities unavailable/)).toBeInTheDocument();
    expect(screen.queryByText(/more not shown/)).not.toBeInTheDocument();
  });

  it("names nobody when the check itself is not live", () => {
    // A stale non-zero count with no live query behind it must not put user
    // emails on screen as if they were a current finding.
    renderPanel({ humansWithoutGrant: 4, missing: [mkUser(1)], live: false });

    expect(screen.queryByText(ROSTER)).not.toBeInTheDocument();
    expect(
      screen.queryByText("missing1@example.invalid"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("grant check unreadable")).toBeInTheDocument();
  });

  it("renders no roster at all when every non-agent holds a grant", () => {
    renderPanel({ humansWithoutGrant: 0, missing: [], live: true });

    expect(screen.getByText("COVERED")).toBeInTheDocument();
    expect(screen.queryByText(ROSTER)).not.toBeInTheDocument();
  });
});
