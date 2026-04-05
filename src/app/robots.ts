import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/onboarding',
          '/profile',
        ],
      },
    ],
    sitemap: 'https://alchm.kitchen/sitemap.xml',
    host: 'https://alchm.kitchen',
  }
}
