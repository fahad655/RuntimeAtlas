import type { MetadataRoute } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,                   priority: 1.0, changeFrequency: 'daily' },
  { url: `${BASE}/features`,     priority: 0.9, changeFrequency: 'daily' },
  { url: `${BASE}/demos`,        priority: 0.8, changeFrequency: 'weekly' },
  { url: `${BASE}/mcp`,          priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/launch`,       priority: 0.5, changeFrequency: 'monthly' },
  { url: `${BASE}/about`,        priority: 0.5, changeFrequency: 'monthly' },
  { url: `${BASE}/privacy`,      priority: 0.3, changeFrequency: 'yearly' },
  { url: `${BASE}/terms`,        priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caps = await db
    .select({ slug: capabilities.slug, updatedAt: capabilities.updatedAt })
    .from(capabilities)
    .where(eq(capabilities.status, 'ready'))

  const capUrls: MetadataRoute.Sitemap = caps.map(c => ({
    url: `${BASE}/features/${c.slug}`,
    lastModified: c.updatedAt ?? undefined,
  }))

  return [...STATIC_PAGES, ...capUrls]
}
