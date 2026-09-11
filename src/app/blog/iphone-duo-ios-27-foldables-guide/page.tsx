import type { Metadata } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Sparkles, RefreshCw, AlertTriangle, ChevronLeft, ArrowRight, Smartphone } from 'lucide-react'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/iphone-duo-ios-27-foldables-guide`
const OG_IMG = `/api/og?name=iPhone+Duo+%26+Foldables+in+iOS+27&summary=Complete+developer+guide+to+iPhone+Duo+%E2%80%94+app+resizability%2C+ArrangementView%2C+hinge+angle%2C+scene+accessories%2C+and+the+dual+camera+system.&category=Foldables&impact=5&changeType=new`
const PUBLISHED = '2026-09-11'

export const metadata: Metadata = {
  title: 'iPhone Duo & Foldables in iOS 27: The Complete Developer Guide',
  description: 'Every iPhone Duo capability tracked in SwiftChronicle — app resizability, ArrangementView and reserved regions, vertical toolbars, hinge angle, scene accessories, and the dual front camera system.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'iPhone Duo & Foldables in iOS 27 — SwiftChronicle',
    description: 'App resizability, ArrangementView, hinge angle, scene accessories, dual cameras — the complete iPhone Duo developer reference.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'iPhone Duo & Foldables in iOS 27' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iPhone Duo & Foldables in iOS 27',
    description: 'The complete developer guide to building for iPhone Duo — layouts, toolbars, hinge angle, scenes, and cameras.',
    images: [OG_IMG],
  },
}

const CHANGE_BADGES = {
  new:        { label: 'New',        cls: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10', icon: <Sparkles     className="h-2.5 w-2.5" /> },
  updated:    { label: 'Updated',    cls: 'text-amber-400  border-amber-500/25  bg-amber-500/10',  icon: <RefreshCw     className="h-2.5 w-2.5" /> },
  deprecated: { label: 'Deprecated', cls: 'text-red-400    border-red-500/25    bg-red-500/10',    icon: <AlertTriangle className="h-2.5 w-2.5" /> },
}

export default async function IPhoneDuoGuidePage() {
  const duoCaps = await db
    .select({
      slug: capabilities.slug,
      name: capabilities.name,
      summary: capabilities.summary,
      changeType: capabilities.changeType,
      frameworks: capabilities.frameworks,
      impactScore: capabilities.impactScore,
    })
    .from(capabilities)
    .where(and(eq(capabilities.status, 'ready'), eq(capabilities.category, 'Foldables')))
    .orderBy(desc(capabilities.impactScore))

  const newCaps        = duoCaps.filter(c => c.changeType === 'new')
  const updatedCaps    = duoCaps.filter(c => c.changeType === 'updated')
  const deprecatedCaps = duoCaps.filter(c => c.changeType === 'deprecated')

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': PAGE_URL,
      headline: 'iPhone Duo & Foldables in iOS 27: The Complete Developer Guide',
      description: 'Every iPhone Duo capability tracked in SwiftChronicle, from app resizability to the dual camera system.',
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
        { '@type': 'ListItem', position: 3, name: 'iPhone Duo & Foldables in iOS 27', item: PAGE_URL },
      ],
    },
  ]

  const CapCard = ({ cap }: { cap: typeof duoCaps[number] }) => {
    const badge = CHANGE_BADGES[cap.changeType as keyof typeof CHANGE_BADGES] ?? CHANGE_BADGES.new
    return (
      <Link
        href={`/features/${cap.slug}`}
        className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-pink-500/20 hover:bg-pink-500/[0.03] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold group-hover:text-pink-400 transition-colors">{cap.name}</span>
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
            <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i <= cap.impactScore ? 'bg-pink-500' : 'bg-white/[0.08]'}`} />
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
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-pink-500/[0.08] px-3 py-1 text-xs font-medium text-pink-400 mb-6">
          <Smartphone className="h-3 w-3" /> Foldables Guide · iOS 27
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          iPhone Duo &amp; Foldables in iOS 27: The Complete Developer Guide
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          iPhone Duo is Apple&apos;s first folding iPhone — an outer display for one-handed use and a wider inner display for multitasking, joined by a hinge that apps can query and react to directly. It ships with a reimagined iOS built around resizability: two size classes instead of interface orientation, reserved regions instead of hardcoded coordinates, and layout containers that adapt automatically as the device opens and closes.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Build against the iOS 27 / 27.1 SDK and simulate every pose with the DeviceHub simulator in Xcode — no hardware required to get started. Here&apos;s every iPhone Duo capability tracked in SwiftChronicle, sourced from Apple&apos;s iPhone Duo Tech Talks.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'New APIs',   count: newCaps.length,        color: 'text-emerald-400' },
            { label: 'Updated',    count: updatedCaps.length,    color: 'text-amber-400' },
            { label: 'Deprecated', count: deprecatedCaps.length, color: 'text-red-400' },
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
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">New in iOS 27</h2>
          <div className="space-y-3">
            {newCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {updatedCaps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-5">Updated</h2>
          <div className="space-y-3">
            {updatedCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {deprecatedCaps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-red-400 mb-5">Deprecated</h2>
          <div className="space-y-3">
            {deprecatedCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {duoCaps.length === 0 && (
        <p className="text-muted-foreground text-sm">iPhone Duo capabilities are being added. Check back soon.</p>
      )}

      <div className="mt-8 rounded-2xl border border-pink-500/20 bg-pink-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">Browse Foldables capabilities interactively</p>
        <p className="text-xs text-muted-foreground mb-4">Filter by framework, see the full code demos, and track implementation gotchas for every iPhone Duo API.</p>
        <Link href="/features?category=Foldables" className="inline-flex items-center gap-1.5 text-sm text-pink-400 hover:text-pink-300 transition-colors font-medium">
          Foldables capabilities in SwiftChronicle <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
