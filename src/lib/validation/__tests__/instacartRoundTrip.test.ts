import { parseEach } from "@/lib/api/json";
import {
  InstacartRetailersResponseSchema,
  InstacartRetailerSchema,
  toDomainInstacartRetailer,
  InstacartLinkResponseSchema,
} from "../instacartResponseSchemas";

describe("instacart producer-to-consumer round-trip coverage", () => {
  const producerRetailersPayload = {
    retailers: [
      {
        retailer_key: "sprouts",
        name: "Sprouts Farmers Market",
        retailer_logo_url: "https://d2lnr5mha7bycj.cloudfront.net/sprouts.png",
      },
      {
        retailer_key: "wegmans",
        name: "Wegmans",
        retailer_logo_url: "https://d2lnr5mha7bycj.cloudfront.net/wegmans.png",
      },
    ],
  };

  it("round-trips retailers from producer payload through InstacartRetailersResponseSchema and toDomainInstacartRetailer", () => {
    const parsed = InstacartRetailersResponseSchema.parse(producerRetailersPayload);
    expect(parsed.retailers.length).toBe(2);

    const domainRetailers = parsed.retailers.map(toDomainInstacartRetailer);
    expect(domainRetailers[0]).toEqual({
      retailer_key: "sprouts",
      name: "Sprouts Farmers Market",
      retailer_logo_url: "https://d2lnr5mha7bycj.cloudfront.net/sprouts.png",
    });
    expect(domainRetailers[1]).toEqual({
      retailer_key: "wegmans",
      name: "Wegmans",
      retailer_logo_url: "https://d2lnr5mha7bycj.cloudfront.net/wegmans.png",
    });
  });

  it("populates default empty string for retailer_logo_url when omitted by producer", () => {
    const payload = {
      retailers: [
        {
          retailer_key: "local_market",
          name: "Local Bodega",
        },
      ],
    };

    const parsed = InstacartRetailersResponseSchema.parse(payload);
    const first = parsed.retailers[0];
    if (!first) throw new Error("Expected at least one retailer");
    const domain = toDomainInstacartRetailer(first);
    expect(domain.retailer_logo_url).toBe("");
  });

  it("validates Instacart products_link and url round-trips", () => {
    const linkPayload = {
      products_link_url: "https://www.instacart.com/store/partner_recipes/xyz",
    };
    const parsed = InstacartLinkResponseSchema.parse(linkPayload);
    expect(parsed.products_link_url).toBe(
      "https://www.instacart.com/store/partner_recipes/xyz",
    );
  });

  it("resiliently drops malformed retailer items via parseEach and invokes onError", () => {
    const rawPayload = {
      retailers: [
        { retailer_key: "valid_1", name: "Valid Store" },
        { broken: "missing key and name" },
        { retailer_key: "valid_2", name: "Second Store" },
      ],
    };

    const parsed = InstacartRetailersResponseSchema.parse(rawPayload);
    const errors: unknown[] = [];
    const { items, kept, dropped } = parseEach(
      parsed.retailers,
      (item) => toDomainInstacartRetailer(InstacartRetailerSchema.parse(item)),
      {
        onError: (err) => errors.push(err),
      },
    );

    expect(kept).toBe(2);
    expect(dropped).toBe(1);
    expect(items.map((r) => r.retailer_key)).toEqual(["valid_1", "valid_2"]);
    expect(errors.length).toBe(1);
  });
});
