import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { FilterBar } from '@/components/features/FilterBar'
import { RequestForm } from '@/components/features/RequestForm'
import { Suspense } from 'react'
import { getGroupFrameworks } from '@/lib/frameworkGroups'
import { Sparkles, RefreshCw, AlertTriangle, FlaskConical } from 'lucide-react'
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

// ── Platform detection ────────────────────────────────────────────────────────

const OS_ORDER = ['iOS', 'macOS', 'watchOS', 'tvOS', 'visionOS', 'Developer Tools'] as const
type OS = typeof OS_ORDER[number]

const OS_CONFIG: Record<OS, {
  label: string
  dot: string
  ring: string
  ping: string
  badge: string
}> = {
  iOS:               { label: 'iOS',            dot: 'bg-blue-500',   ring: 'ring-blue-500/30',   ping: 'bg-blue-400',   badge: 'border-blue-500/20 bg-blue-500/10 text-blue-400' },
  macOS:             { label: 'macOS',          dot: 'bg-purple-500', ring: 'ring-purple-500/30', ping: 'bg-purple-400', badge: 'border-purple-500/20 bg-purple-500/10 text-purple-400' },
  watchOS:           { label: 'watchOS',        dot: 'bg-teal-500',   ring: 'ring-teal-500/30',   ping: 'bg-teal-400',   badge: 'border-teal-500/20 bg-teal-500/10 text-teal-400' },
  tvOS:              { label: 'tvOS',           dot: 'bg-orange-500', ring: 'ring-orange-500/30', ping: 'bg-orange-400', badge: 'border-orange-500/20 bg-orange-500/10 text-orange-400' },
  visionOS:          { label: 'visionOS',       dot: 'bg-violet-500', ring: 'ring-violet-500/30', ping: 'bg-violet-400', badge: 'border-violet-500/20 bg-violet-500/10 text-violet-400' },
  'Developer Tools': { label: 'Developer Tools',dot: 'bg-zinc-500',   ring: 'ring-zinc-500/30',   ping: 'bg-zinc-400',   badge: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400' },
}

function primaryPlatform(availability: string): OS {
  if (/iOS/i.test(availability))        return 'iOS'
  if (/macOS/i.test(availability))      return 'macOS'
  if (/watchOS/i.test(availability))    return 'watchOS'
  if (/tvOS/i.test(availability))       return 'tvOS'
  if (/visionOS/i.test(availability))   return 'visionOS'
  return 'Developer Tools'
}

// ── Change-type subsection config ─────────────────────────────────────────────

const CHANGE_ORDER = ['new', 'updated', 'deprecated'] as const

const SECTION_CONFIG: Record<string, {
  icon: React.ReactNode
  label: string
  desc: string
  border: string
  gradient: string
  iconBox: string
  color: string
}> = {
  new: {
    icon: <Sparkles className="h-4 w-4" />,
    label: 'New APIs',
    desc: 'Introduced at WWDC 2026',
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/[0.08] via-emerald-500/[0.03] to-transparent',
    iconBox: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400',
    color: 'text-emerald-400',
  },
  updated: {
    icon: <RefreshCw className="h-4 w-4" />,
    label: 'Updated APIs',
    desc: 'Changed or enhanced at WWDC 2026',
    border: 'border-amber-500/20',
    gradient: 'from-amber-500/[0.08] via-amber-500/[0.03] to-transparent',
    iconBox: 'bg-amber-500/10 border border-amber-500/25 text-amber-400',
    color: 'text-amber-400',
  },
  deprecated: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: 'Deprecated',
    desc: 'Removed or replaced at WWDC 2026',
    border: 'border-red-500/20',
    gradient: 'from-red-500/[0.08] via-red-500/[0.03] to-transparent',
    iconBox: 'bg-red-500/10 border border-red-500/25 text-red-400',
    color: 'text-red-400',
  },
}

// ── Grouping ──────────────────────────────────────────────────────────────────

type Cap = Awaited<ReturnType<typeof getCapabilities>>[0]

function groupByPlatform(caps: Cap[]) {
  const byOS = new Map<OS, Map<string, Cap[]>>()

  for (const cap of caps) {
    const os = primaryPlatform(cap.availability ?? 'iOS 27+')
    const ct = cap.changeType ?? 'new'
    if (!byOS.has(os)) byOS.set(os, new Map())
    const ctMap = byOS.get(os)!
    if (!ctMap.has(ct)) ctMap.set(ct, [])
    ctMap.get(ct)!.push(cap)
  }

  return OS_ORDER
    .filter(os => byOS.has(os))
    .map(os => ({
      os,
      total: Array.from(byOS.get(os)!.values()).reduce((s, a) => s + a.length, 0),
      subGroups: CHANGE_ORDER
        .filter(ct => byOS.get(os)!.has(ct))
        .map(ct => ({ ct, caps: byOS.get(os)!.get(ct)! })),
    }))
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FeaturesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const caps = await getCapabilities(sp)
  const platformGroups = groupByPlatform(caps)
  const isFiltered = !!(sp.category && sp.category !== 'All') || !!sp.framework || !!sp.changeType || sp.hasDemo === 'true' || !!sp.q

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 animate-page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Capabilities</h1>
          <p className="text-muted-foreground text-sm mt-2">
            <span className="text-foreground font-semibold tabular-nums">{caps.length}</span>{' '}
            {caps.length === 1 ? 'capability' : 'capabilities'} tracked across Apple platforms
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
        // Filtered: flat grid, no grouping
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
          {caps.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
        </div>
      ) : (
        // Grouped: platform → change type
        <div className="space-y-16 mt-8">
          {platformGroups.map(({ os, total, subGroups }) => {
            const osCfg = OS_CONFIG[os]
            return (
              <section key={os}>
                {/* Platform header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${osCfg.ping} opacity-60`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${osCfg.dot}`} />
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">{osCfg.label}</h2>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${osCfg.badge}`}>
                      {total} {total === 1 ? 'capability' : 'capabilities'}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border/40 dark:bg-white/[0.06]" />
                </div>

                {/* Change-type subsections */}
                <div className="space-y-10">
                  {subGroups.map(({ ct, caps: subCaps }) => {
                    const cfg = SECTION_CONFIG[ct]
                    const demoCount = subCaps.filter(c => c.demoId != null).length
                    return (
                      <div key={ct}>
                        <div className={`relative rounded-2xl border ${cfg.border} overflow-hidden mb-5`}>
                          <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient}`} />
                          <div className="relative flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBox}`}>
                                {cfg.icon}
                              </div>
                              <div>
                                <p className={`font-bold text-sm leading-tight ${cfg.color}`}>{cfg.label}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{cfg.desc}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {demoCount > 0 && (
                                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground border border-white/[0.07] rounded-full px-2.5 py-1">
                                  <FlaskConical className="h-3 w-3" />
                                  {demoCount} with demo
                                </div>
                              )}
                              <span className={`text-3xl font-bold tabular-nums ${cfg.color}`}>{subCaps.length}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {subCaps.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
