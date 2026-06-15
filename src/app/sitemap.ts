import type { MetadataRoute } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq } from 'drizzle-orm'

const BASE = 'https://runtimeatlas.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caps = await db
    .select({ slug: capabilities.slug, updatedAt: capabilities.updatedAt })
    .from(capabilities)
    .where(eq(capabilities.status, 'ready'))

  const capUrls = caps.map(c => ({
    url: `${BASE}/features/${c.slug}`,
    lastModified: c.updatedAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE,             lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE}/features`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${BASE}/demos`,    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/mcp`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...capUrls,
  ]
}
