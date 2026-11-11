/**
 * The restaurant payload parser, fed what the route really sends: every body
 * goes through JSON.stringify/JSON.parse first, so `undefined` keys vanish and
 * a `NaN` becomes `null`, exactly as on the wire. The one body that must carry
 * explicit nulls (providers do send them) is written as a JSON literal, since a
 * typed fixture cannot hold a `null` where the type says `string | undefined`.
 */
import type { AlchmScoredRestaurant, RestaurantSearchResponse } from "@/types/yelp";
import { parseRestaurantSearchResponse } from "../restaurantSearchParser";

const COSMIC = { currentZodiac: "Scorpio", planetaryHour: "Mars", dominantElement: "Water" };

function row(id: string, latitude = 40.7): AlchmScoredRestaurant {
  return {
    externalId: id,
    name: `Place ${id}`,
    business: {
      id,
      name: `Place ${id}`,
      url: `https://example.test/${id}`,
      phone: "",
      rating: 4.5,
      review_count: 12,
      price: undefined,
      categories: [{ alias: "thai", title: "Thai" }],
      location: { address1: "1 Main St", city: "Town", state: "NY", zip_code: "", display_address: ["1 Main St"] },
      coordinates: { latitude, longitude: -74 },
      is_closed: false,
    },
    alchmScore: 0.8,
    elementalMatch: 0.7,
    planetaryAlignment: 0.6,
    thermodynamicAffinity: 0,
    dominantElement: "Water",
    matchReasons: ["Water hour"],
    cuisineElement: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 },
  };
}

function wire(body: unknown): unknown {
  return JSON.parse(JSON.stringify(body));
}

function body(restaurants: AlchmScoredRestaurant[]): RestaurantSearchResponse {
  return { restaurants, cosmicContext: COSMIC, source: "osm" };
}

/** A row whose optional fields arrive as explicit JSON nulls, as some providers send them. */
function nullOptionalsBody(price: string): unknown {
  return JSON.parse(`{
    "cosmicContext": ${JSON.stringify(COSMIC)},
    "source": null,
    "sourceNotice": null,
    "restaurants": [{
      "externalId": null, "imageUrl": null, "isPartner": null, "partnerRestaurantId": null,
      "business": {
        "id": "n1", "name": "Null Place", "url": "https://example.test/n1", "phone": "",
        "rating": 3, "review_count": 1, "price": ${price}, "distance": null, "image_url": null,
        "categories": [], "is_closed": false,
        "location": { "address1": "", "city": "", "state": "", "zip_code": "", "display_address": [] },
        "coordinates": { "latitude": 1, "longitude": 2 }
      },
      "alchmScore": 0.5, "elementalMatch": 0.5, "planetaryAlignment": 0.5, "thermodynamicAffinity": 0,
      "dominantElement": "Fire", "matchReasons": [],
      "cuisineElement": { "Fire": 1, "Water": 0, "Earth": 0, "Air": 0 }
    }]
  }`);
}

describe("parseRestaurantSearchResponse", (): void => {
  it("keeps a well-formed response, rows in order", (): void => {
    const parsed = parseRestaurantSearchResponse(wire(body([row("a"), row("b")])));
    expect(parsed.restaurants.map((r) => r.business.id)).toEqual(["a", "b"]);
    expect(parsed.source).toBe("osm");
    expect(parsed.cosmicContext.currentZodiac).toBe("Scorpio");
  });

  it("reads explicit nulls on optional fields as absent", (): void => {
    const parsed = parseRestaurantSearchResponse(nullOptionalsBody("null"));
    const [first] = parsed.restaurants;
    expect(first?.business.id).toBe("n1");
    expect(first?.business.price).toBeUndefined();
    expect(first?.business.distance).toBeUndefined();
    expect(first?.business.image_url).toBeUndefined();
    expect(first?.externalId).toBeUndefined();
    expect(first?.partnerRestaurantId).toBeUndefined();
    expect(parsed.source).toBeUndefined();
    expect(parsed.sourceNotice).toBeUndefined();
  });

  it("control: an optional field of the wrong type drops its row rather than passing as null", (): void => {
    // Same body, price is the number 5 instead of null/"$$": the only row is rejected.
    expect((): unknown => parseRestaurantSearchResponse(nullOptionalsBody("5"))).toThrow("no row matched");
    expect(parseRestaurantSearchResponse(nullOptionalsBody('"$$"')).restaurants[0]?.business.price).toBe("$$");
  });

  it.each([[{}], [{ restaurants: null }]])("reads a missing or null restaurants list as empty (%j)", (extra): void => {
    const parsed = parseRestaurantSearchResponse(wire({ cosmicContext: COSMIC, ...extra }));
    expect(parsed.restaurants).toEqual([]);
  });

  it("passes an error body through, whatever else is missing", (): void => {
    const parsed = parseRestaurantSearchResponse(wire({ error: "Provider unavailable" }));
    expect(parsed.error).toBe("Provider unavailable");
    expect(parsed.restaurants).toEqual([]);
  });

  it("drops one row that does not match and keeps its neighbours", (): void => {
    // NaN serialises to null, the way a bad coordinate reaches the client.
    const parsed = parseRestaurantSearchResponse(wire(body([row("a"), row("bad", Number.NaN), row("c")])));
    expect(parsed.restaurants.map((r) => r.business.id)).toEqual(["a", "c"]);
  });

  it("control: the same row is kept once its coordinate is a number", (): void => {
    const parsed = parseRestaurantSearchResponse(wire(body([row("bad", 0)])));
    expect(parsed.restaurants.map((r) => r.business.id)).toEqual(["bad"]);
  });

  it("fails loudly when rows arrived and none matched", (): void => {
    const rows = [row("x", Number.NaN), row("y", Number.NaN)];
    expect((): unknown => parseRestaurantSearchResponse(wire(body(rows)))).toThrow("no row matched");
  });

  it("rejects a body without cosmicContext or error", (): void => {
    expect((): unknown => parseRestaurantSearchResponse(wire({ restaurants: [] }))).toThrow("cosmicContext");
  });

  it("rejects a source the client does not know", (): void => {
    expect((): unknown => parseRestaurantSearchResponse(wire({ ...body([]), source: "mystery" }))).toThrow("source");
  });

  it.each([[null], [[]], ["text"], [7]])("rejects a non-object body (%j)", (value): void => {
    expect((): unknown => parseRestaurantSearchResponse(value)).toThrow("malformed");
  });
});
