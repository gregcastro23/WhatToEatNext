import { DeliverectClient } from "../deliverect";

describe("DeliverectClient getMenu PLU fallback", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("falls back to itemId when plu is empty string or whitespace", async () => {
    const mockPayload = {
      categories: [
        {
          id: "cat-1",
          name: "Entrees",
          items: [
            { id: "item-real", plu: "", name: "Dish" },
            { id: "item-spaces", plu: "   ", name: "Dish 2" },
            { id: "item-explicit-plu", plu: "PLU-42", name: "Dish 3" },
            { id: "item-null-plu", plu: null, name: "Dish 4" },
          ],
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const client = new DeliverectClient({ apiKey: "test-key", baseUrl: "https://api.deliverect.test" });
    const menu = await client.getMenu("rest-1");

    expect(menu.categories).toHaveLength(1);
    const category = menu.categories[0];
    if (!category) throw new Error("Expected category to exist");
    const items = category.items;
    expect(items).toHaveLength(4);

    expect(items[0]).toMatchObject({
      id: "item-real",
      plu: "item-real",
      name: "Dish",
    });

    expect(items[1]).toMatchObject({
      id: "item-spaces",
      plu: "item-spaces",
      name: "Dish 2",
    });

    expect(items[2]).toMatchObject({
      id: "item-explicit-plu",
      plu: "PLU-42",
      name: "Dish 3",
    });

    expect(items[3]).toMatchObject({
      id: "item-null-plu",
      plu: "item-null-plu",
      name: "Dish 4",
    });
  });
});
