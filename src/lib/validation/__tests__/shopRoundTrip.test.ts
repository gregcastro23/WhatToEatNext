import { parseEach } from "@/lib/api/json";
import {
  RawShopItemsResponseSchema,
  ShopItemSchema,
  toDomainShopItem,
  type ShopItemWire,
} from "../shopResponseSchemas";

describe("shop producer-to-consumer round-trip coverage", () => {
  const producerPayload = {
    items: [
      {
        id: "item_hermetic_crucible",
        slug: "hermetic-crucible",
        title: "Hermetic Crucible",
        description: "Alchemical vessel for mineral attunement",
        category: "vessels",
        isOneTime: true,
        baseCost: {
          spirit: 50,
          essence: 10,
          matter: 25,
          substance: 0,
        },
        liveCost: {
          spirit: 45,
          essence: 10,
          matter: 25,
          substance: 0,
        },
        owned: false,
      },
      {
        id: "item_lunar_phial",
        slug: "lunar-phial",
        title: "Lunar Phial",
        description: null,
        category: "consumables",
        isOneTime: false,
        baseCost: {
          spirit: 10,
          essence: 20,
          matter: 5,
          substance: 0,
        },
        liveCost: {
          spirit: 10,
          essence: 20,
          matter: 5,
          substance: 0,
        },
        owned: true,
      },
    ],
  };

  it("round-trips shop items from producer payload through ShopItemSchema and toDomainShopItem", () => {
    const raw = RawShopItemsResponseSchema.parse(producerPayload);
    expect(raw.items?.length).toBe(2);

    const { items, kept, dropped } = parseEach(raw.items ?? [], (item) =>
      toDomainShopItem(ShopItemSchema.parse(item)),
    );

    expect(kept).toBe(2);
    expect(dropped).toBe(0);
    expect(items[0]).toEqual({
      id: "item_hermetic_crucible",
      slug: "hermetic-crucible",
      title: "Hermetic Crucible",
      description: "Alchemical vessel for mineral attunement",
      category: "vessels",
      isOneTime: true,
      baseCost: {
        spirit: 50,
        essence: 10,
        matter: 25,
        substance: 0,
      },
      liveCost: {
        spirit: 45,
        essence: 10,
        matter: 25,
        substance: 0,
      },
      owned: false,
    });
    expect(items[1]?.description).toBeNull();
    expect(items[1]?.owned).toBe(true);
  });

  it("provides element-level resilience: preserves valid items when corrupted items exist", () => {
    const payloadWithCorruptedItem = {
      items: [
        ...producerPayload.items,
        {
          id: "corrupted_item",
          // missing slug, title, costs
          category: "unknown",
        },
      ],
    };

    const raw = RawShopItemsResponseSchema.parse(payloadWithCorruptedItem);
    expect(raw.items?.length).toBe(3);

    const { items, kept, dropped } = parseEach(raw.items ?? [], (item) =>
      toDomainShopItem(ShopItemSchema.parse(item)),
    );

    expect(kept).toBe(2);
    expect(dropped).toBe(1);
    expect(items.map((i) => i.id)).toEqual([
      "item_hermetic_crucible",
      "item_lunar_phial",
    ]);
  });
});
