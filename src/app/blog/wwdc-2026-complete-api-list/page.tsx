import type { Metadata } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import Link from 'next/link'
import { Sparkles, RefreshCw, AlertTriangle, ChevronLeft, ArrowRight } from 'lucide-react'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/wwdc-2026-complete-api-list`
const OG_IMG = `/api/og?name=WWDC+2026+Complete+API+List&summary=Every+new+and+updated+iOS+27+SDK+capability+from+WWDC+2026+%E2%80%94+organized+by+category.&category=AI&impact=5`
const PUBLISHED = '2026-06-30'

export const metadata: Metadata = {
  title: 'WWDC 2026: Complete iOS 27 SDK API Reference',
  description: 'Every new, updated, and deprecated iOS 27 SDK capability from WWDC 2026, organized by category — the comprehensive reference Apple forgot to ship.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'WWDC 2026: Complete iOS 27 SDK API Reference — SwiftChronicle',
    description: 'Every new and updated iOS 27 SDK capability from WWDC 2026, organized by category.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'WWDC 2026 Complete API List' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WWDC 2026: Complete iOS 27 SDK API Reference',
    description: 'Every new and updated iOS 27 capability from WWDC 2026, organized by category.',
    images: [OG_IMG],
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  AI:          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UI:          'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Performance: 'bg-green-500/10 text-green-400 border-green-500/20',
  Safety:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Store:       'bg-teal-500/10 text-teal-400 border-teal-500/20',
  System:      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

const CATEGORY_ORDER = ['AI', 'UI', 'Performance', 'Safety', 'Store', 'System'] as const

const CHANGE_BADGES: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  new:        { label: 'New',        icon: <Sparkles className="h-2.5 w-2.5" />,       cls: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10' },
  updated:    { label: 'Updated',    icon: <RefreshCw className="h-2.5 w-2.5" />,      cls: 'text-amber-400  border-amber-500/25  bg-amber-500/10'  },
  deprecated: { label: 'Deprecated', icon: <AlertTriangle className="h-2.5 w-2.5" />,  cls: 'text-red-400    border-red-500/25    bg-red-500/10'    },
}

export default async function CompleteApiListPage() {
  const caps = await db
    .select({
      slug: capabilities.slug,
      name: capabilities.name,
      summary: capabilities.summary,
      category: capabilities.category,
      changeType: capabilities.changeType,
      frameworks: capabilities.frameworks,
      impactScore: capabilities.impactScore,
      availability: capabilities.availability,
    })
    .from(capabilities)
    .where(eq(capabilities.status, 'ready'))
    .orderBy(desc(capabilities.impactScore))

  const newCount        = caps.filter(c => c.changeType === 'new').length
  const updatedCount    = caps.filter(c => c.changeType === 'updated').length
  const deprecatedCount = caps.filter(c => c.changeType === 'deprecated').length

  const byCategory = CATEGORY_ORDER.map(cat => ({
    category: cat,
    caps: caps.filter(c => c.category === cat),
  })).filter(g => g.caps.length > 0)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': PAGE_URL,
      headline: 'WWDC 2026: Complete iOS 27 SDK API Reference',
      description: 'Every new, updated, and deprecated iOS 27 SDK capability from WWDC 2026.',
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { '@type': 'Person', name: 'Fahad Shafique' },
      publisher: { '@type': 'Organization', name: 'SwiftChronicle', url: BASE },
      mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: 'WWDC 2026: Complete iOS 27 SDK API Reference', item: PAGE_URL },
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Blog
      </Link>

      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-3 py-1 text-xs font-medium text-violet-400 mb-6">
          Reference · WWDC 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          WWDC 2026: Complete iOS 27 SDK API Reference
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Every WWDC, Apple ships hundreds of new APIs across dozens of frameworks. This reference documents every new, updated, and deprecated capability tracked in SwiftChronicle from WWDC 2026 — organized by category, ordered by impact.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Click any capability to see its full detail page including a compilable Swift code demo, what changed from iOS 26, and implementation gotchas.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total tracked', count: caps.length, color: 'text-foreground' },
            { label: 'New',           count: newCount,     color: 'text-emerald-400' },
            { label: 'Updated',       count: updatedCount, color: 'text-amber-400' },
            { label: 'Deprecated',    count: deprecatedCount, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

      {/* By category */}
      <div className="space-y-14">
        {byCategory.map(({ category, caps: catCaps }) => {
          const catColor = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.System
          return (
            <section key={category}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`inline-flex items-center text-xs font-semibold border rounded-full px-2.5 py-1 ${catColor}`}>
                  {category}
                </span>
                <span className="text-sm text-muted-foreground">{catCaps.length} {catCaps.length === 1 ? 'capability' : 'capabilities'}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <div className="space-y-2">
                {catCaps.map(cap => {
                  const badge = CHANGE_BADGES[cap.changeType] ?? CHANGE_BADGES.new
                  return (
                    <Link
                      key={cap.slug}
                      href={`/features/${cap.slug}`}
                      className="group flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-transparent hover:border-violet-500/20 hover:bg-white/[0.03] transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-medium group-hover:text-violet-400 transition-colors">{cap.name}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-1.5 py-0.5 ${badge.cls}`}>
                            {badge.icon}{badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{cap.summary}</p>
                        {cap.frameworks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {cap.frameworks.slice(0, 3).map(fw => (
                              <span key={fw} className="text-[10px] text-muted-foreground/40 border border-white/[0.05] rounded px-1.5 py-0.5">{fw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-1 mt-0.5">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i <= cap.impactScore ? 'bg-violet-500' : 'bg-white/[0.08]'}`} />
                        ))}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-14 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">Interactive capabilities browser</p>
        <p className="text-xs text-muted-foreground mb-4">Filter by platform, framework, or change type and get the full breakdown including Swift code demos.</p>
        <Link
          href="/features"
          className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
        >
          Open the capabilities browser <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
