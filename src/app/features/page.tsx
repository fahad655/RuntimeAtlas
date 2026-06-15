import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { FilterBar } from '@/components/features/FilterBar'
import { RequestForm } from '@/components/features/RequestForm'
import { Suspense } from 'react'
import { getGroupFrameworks } from '@/lib/frameworkGroups'
import type { Category } from '@/types'

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{ category?: string; framework?: string; changeType?: string; sort?: string; hasDemo?: string; q?: string }>
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

  // Framework filter: sp.framework is a group name — expand to individual framework strings
  if (sp.framework) {
    const groupFws = getGroupFrameworks(sp.framework)
    rows = rows.filter(c => c.frameworks.some(fw => groupFws.includes(fw)))
  }
  if (sp.changeType) rows = rows.filter(c => c.changeType === sp.changeType)
  if (sp.hasDemo === 'true') rows = rows.filter(c => c.demoId != null)
  if (sp.q) {
    const q = sp.q.toLowerCase()
    rows = rows.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.frameworks.some(fw => fw.toLowerCase().includes(q))
    )
  }
  return rows
}

function wwdcLabel(availability: string): string {
  const match = availability.match(/iOS\s*(\d+)/)
  if (!match) return 'WWDC'
  return `WWDC ${1999 + parseInt(match[1], 10)}`
}

const CHANGE_ORDER = ['new', 'updated', 'deprecated'] as const
const CHANGE_LABEL: Record<string, string> = { new: 'New', updated: 'Updated', deprecated: 'Deprecated' }
const CHANGE_STYLE: Record<string, string> = {
  new:        'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  updated:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
  deprecated: 'text-red-400 bg-red-500/10 border-red-500/20',
}

type Cap = Awaited<ReturnType<typeof getCapabilities>>[0]

function groupByWWDC(caps: Cap[]) {
  // Top level: by availability (iOS version → WWDC year)
  const byAvail = new Map<string, Cap[]>()
  for (const cap of caps) {
    const avail = cap.availability ?? 'iOS 27+'
    if (!byAvail.has(avail)) byAvail.set(avail, [])
    byAvail.get(avail)!.push(cap)
  }

  return Array.from(byAvail.entries())
    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
    .map(([avail, group]) => {
      const byCT = new Map<string, Cap[]>()
      for (const cap of group) {
        const ct = cap.changeType ?? 'new'
        if (!byCT.has(ct)) byCT.set(ct, [])
        byCT.get(ct)!.push(cap)
      }
      return {
        avail,
        wwdc: wwdcLabel(avail),
        total: group.length,
        subGroups: CHANGE_ORDER
          .filter(ct => byCT.has(ct))
          .map(ct => ({ ct, caps: byCT.get(ct)! })),
      }
    })
}

export default async function FeaturesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const caps = await getCapabilities(sp)
  const wwdcGroups = groupByWWDC(caps)
  const isFiltered = !!(sp.category && sp.category !== 'All') || !!sp.framework || !!sp.changeType || sp.hasDemo === 'true' || !!sp.q

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
        // WWDC → change type two-level grouping
        <div className="space-y-16 mt-8">
          {wwdcGroups.map(({ avail, wwdc, total, subGroups }) => (
            <section key={avail}>
              {/* WWDC top-level header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">{wwdc}</h2>
                  <span className="text-sm text-muted-foreground font-mono">{avail}</span>
                </div>
                <div className="flex-1 h-px bg-border/40 dark:bg-white/[0.06]" />
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {total} {total === 1 ? 'capability' : 'capabilities'}
                </span>
              </div>

              {/* Sub-groups by change type */}
              <div className="space-y-10">
                {subGroups.map(({ ct, caps: subCaps }) => (
                  <div key={ct}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${CHANGE_STYLE[ct]}`}>
                        {CHANGE_LABEL[ct]}
                      </span>
                      <div className="flex-1 h-px bg-border/30 dark:bg-white/[0.04]" />
                      <span className="text-xs text-muted-foreground tabular-nums">{subCaps.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {subCaps.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
