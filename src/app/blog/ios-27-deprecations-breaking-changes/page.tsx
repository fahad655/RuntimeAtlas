import type { Metadata } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import Link from 'next/link'
import { AlertTriangle, ChevronLeft, ArrowRight } from 'lucide-react'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/ios-27-deprecations-breaking-changes`
const OG_IMG = `/api/og?name=iOS+27+Breaking+Changes+%26+Deprecations&summary=Complete+reference+of+every+deprecated+iOS+27+API+from+WWDC+2026.+Know+what+to+remove+before+beta.&category=System&impact=3&changeType=deprecated`
const PUBLISHED = '2026-06-30'

export const metadata: Metadata = {
  title: 'iOS 27 Breaking Changes & Deprecations',
  description: 'Complete reference of every deprecated iOS 27 API from WWDC 2026 — organized by impact score so you can prioritize migration before the first public beta.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'iOS 27 Breaking Changes & Deprecations — SwiftChronicle',
    description: 'Every deprecated iOS 27 API from WWDC 2026, organized by impact score. Know what to remove before the first public beta.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'iOS 27 Breaking Changes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iOS 27 Breaking Changes & Deprecations',
    description: 'Every deprecated iOS 27 API from WWDC 2026, organized by impact score.',
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

export default async function DeprecationsPage() {
  const deps = await db
    .select({
      id: capabilities.id,
      slug: capabilities.slug,
      name: capabilities.name,
      summary: capabilities.summary,
      whyItMatters: capabilities.whyItMatters,
      frameworks: capabilities.frameworks,
      category: capabilities.category,
      impactScore: capabilities.impactScore,
      availability: capabilities.availability,
    })
    .from(capabilities)
    .where(and(eq(capabilities.status, 'ready'), eq(capabilities.changeType, 'deprecated')))
    .orderBy(desc(capabilities.impactScore))

  const highImpact = deps.filter(d => d.impactScore >= 4)
  const medImpact  = deps.filter(d => d.impactScore === 3)
  const lowImpact  = deps.filter(d => d.impactScore <= 2)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': PAGE_URL,
      headline: 'iOS 27 Breaking Changes & Deprecations: Complete Developer Reference',
      description: 'Complete reference of every deprecated iOS 27 API from WWDC 2026.',
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
        { '@type': 'ListItem', position: 1, name: 'Home',        item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Blog',        item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: 'iOS 27 Breaking Changes & Deprecations', item: PAGE_URL },
      ],
    },
  ]

  const ImpactDots = ({ score }: { score: number }) => (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i <= score ? 'bg-red-400' : 'bg-white/[0.1]'}`} />
      ))}
    </span>
  )

  const DepSection = ({ title, items, accent }: { title: string; items: typeof deps; accent: string }) => (
    items.length === 0 ? null : (
      <div className="mb-12">
        <h2 className={`text-sm font-semibold uppercase tracking-widest mb-5 ${accent}`}>{title}</h2>
        <div className="space-y-3">
          {items.map(d => (
            <Link
              key={d.slug}
              href={`/features/${d.slug}`}
              className="group flex items-start gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-red-500/20 hover:bg-red-500/[0.03] transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold group-hover:text-red-400 transition-colors">{d.name}</span>
                  <span className={`text-[10px] font-semibold border rounded-full px-1.5 py-0.5 ${CATEGORY_COLORS[d.category] ?? CATEGORY_COLORS.System}`}>
                    {d.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{d.summary}</p>
                {d.frameworks.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {d.frameworks.slice(0, 3).map(fw => (
                      <span key={fw} className="text-[10px] text-muted-foreground/50 border border-white/[0.06] rounded px-1.5 py-0.5">
                        {fw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2 mt-0.5">
                <ImpactDots score={d.impactScore} />
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-red-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  )

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

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/[0.08] px-3 py-1 text-xs font-medium text-red-400 mb-6">
          <AlertTriangle className="h-3 w-3" />
          Breaking Changes · iOS 27
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          iOS 27 Breaking Changes &amp; Deprecations: Complete Developer Reference
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          With every major iOS release, Apple retires APIs in favour of modern alternatives. iOS 27, introduced at WWDC 2026, is no exception. This reference collects every deprecated capability from the iOS 27 SDK, organized by impact score, so you can prioritize your migration work before the first public beta.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          High-impact deprecations are APIs that appear in many codebases and have no direct drop-in replacement. Low-impact ones are typically niche or already have obvious alternatives in place. Click any entry to see the full detail page including Swift code and gotchas.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'High impact', count: highImpact.length, color: 'text-red-400' },
            { label: 'Medium impact', count: medImpact.length, color: 'text-amber-400' },
            { label: 'Low impact', count: lowImpact.length, color: 'text-muted-foreground' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

      <DepSection title="High impact — act before beta" items={highImpact} accent="text-red-400" />
      <DepSection title="Medium impact — plan your migration" items={medImpact} accent="text-amber-400" />
      <DepSection title="Low impact" items={lowImpact} accent="text-muted-foreground" />

      {deps.length === 0 && (
        <p className="text-muted-foreground text-sm">No deprecated APIs tracked yet. Check back as more capabilities are published.</p>
      )}

      <div className="mt-8 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">See all capabilities</p>
        <p className="text-xs text-muted-foreground mb-4">Browse every new and updated API alongside the deprecated ones in the full capabilities listing.</p>
        <Link
          href="/features?changeType=deprecated"
          className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
        >
          Deprecated APIs in SwiftChronicle <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
