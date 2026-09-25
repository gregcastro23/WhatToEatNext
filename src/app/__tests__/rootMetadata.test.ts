/**
 * @jest-environment node
 *
 * The root layout's metadata is inherited by every page that does not set the
 * same field. A page-specific field set there is therefore a site-wide claim:
 * `alternates.canonical: "/"` made /recipes, /cuisines, /ingredients… each
 * name the homepage as their canonical, and `openGraph.url` made every share
 * card point at the homepage (production, 2026-09-25).
 */
import { siteMetadata } from "../siteMetadata";

describe("root layout metadata", () => {
  it("sets no canonical, which every page without its own would inherit", () => {
    expect(siteMetadata.alternates?.canonical).toBeUndefined();
  });

  it("sets no og:url, which every share card without its own would inherit", () => {
    expect(siteMetadata.openGraph).toBeDefined();
    expect(Object.keys(siteMetadata.openGraph ?? {})).not.toContain("url");
  });

  it("still resolves relative page canonicals against the site", () => {
    expect(siteMetadata.metadataBase?.origin).toMatch(/^https?:\/\//);
  });
});
