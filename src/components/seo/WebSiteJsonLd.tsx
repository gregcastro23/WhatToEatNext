import React from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alchm.kitchen";

/**
 * WebSite structured data with SearchAction (plan Phase 6, issue #870).
 * Powers Google Sitelinks Searchbox and semantic search indexing.
 */
export default function WebSiteJsonLd(): React.ReactElement {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Alchm Kitchen",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
