import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://alchm.kitchen'
  const now = new Date()

  const publicRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '', changeFrequency: 'hourly', priority: 1 },
    { path: '/menu-planner', changeFrequency: 'daily', priority: 0.9 },
    { path: '/recipe-builder', changeFrequency: 'daily', priority: 0.9 },
    { path: '/recipes', changeFrequency: 'daily', priority: 0.85 },
    { path: '/cuisines', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/cooking-methods', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/quantities', changeFrequency: 'daily', priority: 0.8 },
    { path: '/cosmic-recipe', changeFrequency: 'daily', priority: 0.7 },
    { path: '/commensal', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/pantry', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/food-tracking', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/sauces', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/restaurants', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/premium', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/upgrade', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
