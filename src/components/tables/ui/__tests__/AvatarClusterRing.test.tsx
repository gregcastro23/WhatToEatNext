import { render, screen } from "@testing-library/react";
import { AvatarClusterRing } from "@/components/tables/ui/AvatarClusterRing";

describe("AvatarClusterRing accessible name", () => {
  it("falls back to a variant-based name when label and avatars are absent", () => {
    render(<AvatarClusterRing variant="live" />);
    expect(screen.getByRole("button", { name: "Live table" })).toBeInTheDocument();
  });

  it("names an empty upcoming tile by its variant", () => {
    render(<AvatarClusterRing variant="upcoming" />);
    expect(
      screen.getByRole("button", { name: "Upcoming table" }),
    ).toBeInTheDocument();
  });

  it("names an unlabeled host tile", () => {
    render(<AvatarClusterRing variant="host" />);
    expect(
      screen.getByRole("button", { name: "Host a Table" }),
    ).toBeInTheDocument();
  });

  it("prefixes the variant when members exist so the state is announced", () => {
    render(
      <AvatarClusterRing
        variant="live"
        label="LIVE"
        avatars={[
          { name: "Leonardo da Vinci", element: "Air" },
          { name: "Marie Curie", element: "Earth" },
        ]}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: "Live table: Leonardo da Vinci, Marie Curie",
      }),
    ).toBeInTheDocument();
  });

  it("uses the visible label for a member-less labeled tile", () => {
    render(<AvatarClusterRing variant="upcoming" label="8:00" />);
    expect(screen.getByRole("button", { name: "8:00" })).toBeInTheDocument();
  });
});
