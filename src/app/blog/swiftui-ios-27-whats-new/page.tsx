import type { Metadata } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Sparkles, RefreshCw, AlertTriangle, ChevronLeft, ArrowRight, Layers } from 'lucide-react'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/swiftui-ios-27-whats-new`
const OG_IMG = `/api/og?name=SwiftUI+%26+Liquid+Glass+in+iOS+27&summary=Complete+guide+to+every+UI+change+in+iOS+27+%E2%80%94+Liquid+Glass+materials%2C+new+controls%2C+and+what+to+update.&category=UI&impact=5&changeType=new`
const PUBLISHED = '2026-07-01'

export const metadata: Metadata = {
  title: 'SwiftUI & Liquid Glass in iOS 27: Complete UI Change Reference',
  description: 'Every UI and SwiftUI change in iOS 27 from WWDC 2026 — Liquid Glass materials, .glassEffect(), new controls, UIKit changes, and what you need to update in your app.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'SwiftUI & Liquid Glass in iOS 27 — SwiftChronicle',
    description: 'Liquid Glass, .glassEffect(), new SwiftUI controls — complete reference for every UI API change in iOS 27.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'SwiftUI & Liquid Glass iOS 27' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwiftUI & Liquid Glass in iOS 27',
    description: 'Complete guide to every UI change in iOS 27 — Liquid Glass, new SwiftUI controls, UIKit updates.',
    images: [OG_IMG],
  },
}

const CHANGE_BADGES = {
  new:        { label: 'New',        cls: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10', icon: <Sparkles   className="h-2.5 w-2.5" /> },
  updated:    { label: 'Updated',    cls: 'text-amber-400  border-amber-500/25  bg-amber-500/10',  icon: <RefreshCw   className="h-2.5 w-2.5" /> },
  deprecated: { label: 'Deprecated', cls: 'text-red-400    border-red-500/25    bg-red-500/10',    icon: <AlertTriangle className="h-2.5 w-2.5" /> },
}

export default async function LiquidGlassPage() {
  const uiCaps = await db
    .select({
      slug: capabilities.slug,
      name: capabilities.name,
      summary: capabilities.summary,
      changeType: capabilities.changeType,
      frameworks: capabilities.frameworks,
      impactScore: capabilities.impactScore,
    })
    .from(capabilities)
    .where(and(eq(capabilities.status, 'ready'), eq(capabilities.category, 'UI')))
    .orderBy(desc(capabilities.impactScore))

  const newCaps        = uiCaps.filter(c => c.changeType === 'new')
  const updatedCaps    = uiCaps.filter(c => c.changeType === 'updated')
  const deprecatedCaps = uiCaps.filter(c => c.changeType === 'deprecated')

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': PAGE_URL,
      headline: 'SwiftUI & Liquid Glass in iOS 27: Complete UI Change Reference',
      description: 'Every UI and SwiftUI change in iOS 27 from WWDC 2026.',
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
        { '@type': 'ListItem', position: 3, name: 'SwiftUI & Liquid Glass in iOS 27', item: PAGE_URL },
      ],
    },
  ]

  const CapCard = ({ cap }: { cap: typeof uiCaps[number] }) => {
    const badge = CHANGE_BADGES[cap.changeType as keyof typeof CHANGE_BADGES] ?? CHANGE_BADGES.new
    return (
      <Link
        href={`/features/${cap.slug}`}
        className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-blue-500/20 hover:bg-blue-500/[0.03] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold group-hover:text-blue-400 transition-colors">{cap.name}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-1.5 py-0.5 ${badge.cls}`}>
              {badge.icon}{badge.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{cap.summary}</p>
          {cap.frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cap.frameworks.slice(0, 3).map(fw => (
                <span key={fw} className="text-[10px] text-muted-foreground/40 border border-white/[0.05] rounded px-1.5 py-0.5">{fw}</span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-0.5 mt-0.5">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i <= cap.impactScore ? 'bg-blue-500' : 'bg-white/[0.08]'}`} />
          ))}
        </div>
      </Link>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Blog
      </Link>

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/[0.08] px-3 py-1 text-xs font-medium text-blue-400 mb-6">
          <Layers className="h-3 w-3" /> SwiftUI Guide · iOS 27
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          SwiftUI &amp; Liquid Glass in iOS 27: The Complete UI Change Reference
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Liquid Glass is the most significant iOS design language change since the flat design shift in iOS 7. Introduced at WWDC 2026, it replaces the frosted glass materials from iOS 13–26 with a physically-based translucent material that refracts, specularly highlights, and tints based on the content behind it. The primary adoption path is a single SwiftUI modifier: <code className="text-xs bg-white/[0.07] rounded px-1.5 py-0.5">.glassEffect()</code>.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          But Liquid Glass is not the only story. iOS 27 also ships a new mesh gradient API, redesigned controls across the system, and several UIKit deprecations as Apple pushes developers toward pure SwiftUI. Here's every UI change tracked in SwiftChronicle.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'New UI APIs',     count: newCaps.length,        color: 'text-emerald-400' },
            { label: 'Updated',         count: updatedCaps.length,    color: 'text-amber-400' },
            { label: 'Deprecated',      count: deprecatedCaps.length, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

      {newCaps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">New UI APIs</h2>
          <div className="space-y-3">
            {newCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {updatedCaps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-5">Updated UI APIs</h2>
          <div className="space-y-3">
            {updatedCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {deprecatedCaps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-red-400 mb-5">Deprecated UI APIs</h2>
          <div className="space-y-3">
            {deprecatedCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {uiCaps.length === 0 && (
        <p className="text-muted-foreground text-sm">UI capabilities are being added. Check back soon.</p>
      )}

      <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">Browse UI capabilities interactively</p>
        <p className="text-xs text-muted-foreground mb-4">Filter by SwiftUI or UIKit, see before/after diffs for updated controls, and get the full implementation guide.</p>
        <Link href="/features?category=UI" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
          UI capabilities in SwiftChronicle <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
