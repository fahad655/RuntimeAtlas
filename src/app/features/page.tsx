import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { FilterBar } from '@/components/features/FilterBar'
import { RequestForm } from '@/components/features/RequestForm'
import { Suspense } from 'react'
import type { Category } from '@/types'

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{ category?: string; framework?: string; sort?: string; hasDemo?: string }>
}

async function getCapabilities(sp: Awaited<PageProps['searchParams']>) {
  const conditions = [eq(capabilities.status, 'ready')]
  if (sp.category && sp.category !== 'All') {
    conditions.push(eq(capabilities.category, sp.category as Category))
  }

  const orderCol =
    sp.sort === 'trending' ? desc(capabilities.viewCount) :
    sp.sort === 'impact'   ? desc(capabilities.impactScore) :
    sp.sort === 'newest'   ? desc(capabilities.createdAt) :
                             desc(capabilities.rankScore)

  let rows = await db.select().from(capabilities)
    .where(and(...conditions))
    .orderBy(orderCol)
    .limit(200)

  if (sp.framework) rows = rows.filter(c => c.frameworks.includes(sp.framework!))
  if (sp.hasDemo === 'true') rows = rows.filter(c => c.demoId != null)
  return rows
}

// Group capabilities by their availability field (e.g. "iOS 27+", "iOS 28+")
// Preserves the sort order within each group.
function groupByRelease(caps: Awaited<ReturnType<typeof getCapabilities>>) {
  const map = new Map<string, typeof caps>()
  for (const cap of caps) {
    const key = cap.availability ?? 'iOS 27+'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(cap)
  }
  // Sort groups newest-release-first (iOS 28 before iOS 27, etc.)
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
}

// Map "iOS 27+" → "WWDC 2026", "iOS 26+" → "WWDC 2025", etc.
function wwdcYear(availability: string): string {
  const match = availability.match(/iOS\s*(\d+)/)
  if (!match) return ''
  const version = parseInt(match[1], 10)
  // iOS 27 shipped at WWDC 2026 (iOS version = year - 1999)
  const year = 1999 + version
  return `WWDC ${year}`
}

export default async function FeaturesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const caps = await getCapabilities(sp)
  const groups = groupByRelease(caps)
  const isFiltered = !!(sp.category && sp.category !== 'All') || !!sp.framework || sp.hasDemo === 'true'

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 animate-page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Capabilities</h1>
          <p className="text-muted-foreground text-sm mt-2">
            <span className="text-foreground font-semibold tabular-nums">{caps.length}</span>{' '}
            {caps.length === 1 ? 'capability' : 'capabilities'} tracked
          </p>
        </div>
        <div className="mt-1">
          <RequestForm />
        </div>
      </div>

      <Suspense>
        <FilterBar />
      </Suspense>

      {caps.length === 0 ? (
        <div className="text-center py-40 text-muted-foreground">
          <p className="text-base">No capabilities match your filters.</p>
        </div>
      ) : isFiltered ? (
        // Filtered view — no grouping, just the flat grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
          {caps.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
        </div>
      ) : (
        // Grouped by release
        <div className="space-y-12 mt-8">
          {groups.map(([release, group]) => (
            <section key={release}>
              {/* Release header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                  </span>
                  <h2 className="text-lg font-bold tracking-tight">{release}</h2>
                  <span className="text-xs text-muted-foreground font-mono">· {wwdcYear(release)}</span>
                </div>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {group.length} {group.length === 1 ? 'capability' : 'capabilities'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {group.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
