import { ingredientHref, ingredientSlug, slugForm } from "../ingredientSlug";

describe("ingredientSlug", () => {
  it("is the key in slug form", () => {
    expect(ingredientSlug("black_pepper")).toBe("black-pepper");
    expect(ingredientSlug("curry leaf")).toBe("curry-leaf");
  });

  it("repairs the one key an encoding accident damaged", () => {
    expect(ingredientSlug("gruy_re_cheese")).toBe("gruyere-cheese");
  });

  it("slug, key and name of one card share a form", () => {
    expect(new Set(["black-pepper", "black_pepper", "Black Pepper", " black  pepper "].map(slugForm))).toEqual(
      new Set(["black-pepper"]),
    );
    expect(slugForm("Gruyère Cheese")).toBe("gruyere-cheese");
    expect(slugForm("Egg White (Albumen)")).toBe("egg-white-albumen");
  });

  it("an href needs no encoding: slugs are [a-z0-9-]", () => {
    expect(ingredientHref("black-pepper")).toBe("/ingredients/black-pepper");
  });
});
