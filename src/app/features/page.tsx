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

export default async function FeaturesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const caps = await getCapabilities(sp)

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 animate-page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">iOS 27 Capabilities</h1>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
          {caps.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
        </div>
      )}
    </div>
  )
}
