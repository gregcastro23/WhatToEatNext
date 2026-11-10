/**
 * WebSiteJsonLd & OpenSearch tests (plan Phase 6, issue #870).
 */
import { render } from "@testing-library/react";
import fs from "fs";
import path from "path";
import React from "react";
import { z } from "zod";
import WebSiteJsonLd from "../WebSiteJsonLd";

const WebSiteJsonLdSchema = z.object({
  "@context": z.string(),
  "@type": z.string(),
  name: z.string(),
  url: z.string(),
  potentialAction: z.object({
    "@type": z.string(),
    target: z.object({
      "@type": z.string(),
      urlTemplate: z.string(),
    }),
    "query-input": z.string(),
  }),
});

describe("WebSiteJsonLd", () => {
  it("renders valid Schema.org WebSite structured data with SearchAction", () => {
    const { container } = render(<WebSiteJsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const json = WebSiteJsonLdSchema.parse(JSON.parse(script?.textContent ?? "{}"));

    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("WebSite");
    expect(json.name).toBe("Alchm Kitchen");
    expect(json.url).toMatch(/^https?:\/\//);

    expect(json.potentialAction).toBeDefined();
    expect(json.potentialAction["@type"]).toBe("SearchAction");
    expect(json.potentialAction.target["@type"]).toBe("EntryPoint");
    expect(json.potentialAction.target.urlTemplate).toContain("/search?q={search_term_string}");
    expect(json.potentialAction["query-input"]).toBe("required name=search_term_string");
  });
});

describe("public/opensearch.xml", () => {
  it("contains a valid OpenSearch 1.1 description with search and suggestion URLs", () => {
    const filePath = path.resolve(process.cwd(), "public/opensearch.xml");
    expect(fs.existsSync(filePath)).toBe(true);

    const xml = fs.readFileSync(filePath, "utf-8");
    expect(xml).toContain('<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">');
    expect(xml).toContain("<ShortName>Alchm Kitchen</ShortName>");
    expect(xml).toContain("<Description>");
    expect(xml).toContain('template="https://alchm.kitchen/search?q={searchTerms}"');
    expect(xml).toContain('template="https://alchm.kitchen/api/search/suggest?q={searchTerms}"');
    expect(xml).toContain('type="application/x-suggestions+json"');
  });
});
