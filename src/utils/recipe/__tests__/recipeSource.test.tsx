import { render, screen } from "@testing-library/react";
import { RecipeAttribution } from "@/components/recipes/RecipeAttribution";
import { parseRecipeSource, recipeSourceJsonLd } from "../recipeSource";

const BUA_LOI = {
  title: "Rice Balls in Coconut Milk (bua loy)",
  author: "Pailin Chongchitnant",
  publisher: "Hot Thai Kitchen",
  url: "https://hot-thai-kitchen.com/rice-balls-bua-loy/",
  accessed: "2026-09-26",
};

describe("parseRecipeSource", () => {
  it("keeps a complete credit, notes included", () => {
    expect(parseRecipeSource({ ...BUA_LOI, notes: "Serves 4 to 6." })).toEqual({ ...BUA_LOI, notes: "Serves 4 to 6." });
  });

  it("publishes no partial credit", () => {
    for (const key of ["title", "author", "publisher", "url", "accessed"] as const) {
      expect(parseRecipeSource({ ...BUA_LOI, [key]: " " })).toBeUndefined();
    }
    expect(parseRecipeSource(undefined)).toBeUndefined();
    expect(parseRecipeSource("Hot Thai Kitchen")).toBeUndefined();
  });

  it("requires an https link and an ISO access date", () => {
    expect(parseRecipeSource({ ...BUA_LOI, url: "http://hot-thai-kitchen.com/" })).toBeUndefined();
    expect(parseRecipeSource({ ...BUA_LOI, accessed: "Sept 26" })).toBeUndefined();
  });
});

describe("recipeSourceJsonLd", () => {
  it("is a schema.org Recipe with its author and publisher", () => {
    expect(recipeSourceJsonLd(BUA_LOI)).toEqual({
      "@type": "Recipe",
      name: BUA_LOI.title,
      url: BUA_LOI.url,
      author: { "@type": "Person", name: "Pailin Chongchitnant" },
      publisher: { "@type": "Organization", name: "Hot Thai Kitchen" },
    });
  });
});

describe("RecipeAttribution", () => {
  it("links the source and names its author and publisher", () => {
    render(<RecipeAttribution source={BUA_LOI} />);
    const link = screen.getByRole("link", { name: BUA_LOI.title });
    expect(link.getAttribute("href")).toBe(BUA_LOI.url);
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.parentElement?.textContent).toBe(`Adapted from ${BUA_LOI.title} by Pailin Chongchitnant (Hot Thai Kitchen)`);
  });

  it("names a self-published author once", () => {
    render(<RecipeAttribution source={{ ...BUA_LOI, author: "Vicky Pham", publisher: "Vicky Pham" }} />);
    expect(screen.getByText(/Adapted from/).textContent).toMatch(/ by Vicky Pham$/);
  });

  it("renders nothing without a source", () => {
    const { container } = render(<RecipeAttribution source={undefined} />);
    expect(container.innerHTML).toBe("");
  });
});
