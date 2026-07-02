import type { Metadata } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Sparkles, RefreshCw, ChevronLeft, ArrowRight, Box } from 'lucide-react'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/realitykit-usdkit-ios-27-spatial-computing`
const OG_IMG = `/api/og?name=RealityKit+%26+USDKit+in+iOS+27&summary=Reality+Composer+Pro+3%2C+USDKit+on+iOS%2C+and+RealityKit+4+%E2%80%94+spatial+computing+for+iPhone+developers.&category=System&impact=4&changeType=new`
const PUBLISHED = '2026-07-01'

export const metadata: Metadata = {
  title: 'RealityKit & USDKit in iOS 27: Spatial Computing for iOS Developers',
  description: 'Reality Composer Pro 3, USDKit expanding to iOS, and RealityKit 4 from WWDC 2026 — the complete reference for spatial computing development on iOS 27.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'RealityKit & USDKit in iOS 27 — SwiftChronicle',
    description: 'Reality Composer Pro 3, USDKit on iOS, and RealityKit 4 — spatial computing on iOS 27 explained.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'RealityKit & USDKit iOS 27' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RealityKit & USDKit in iOS 27',
    description: 'Reality Composer Pro 3, USDKit on iOS, RealityKit 4 — everything from WWDC 2026.',
    images: [OG_IMG],
  },
}

const SPATIAL_KEYWORDS = ['RealityKit', 'Reality Composer', 'USDKit', 'ARKit', 'RealityFoundation', 'ModelComponent']

const CHANGE_BADGES = {
  new:     { label: 'New',     cls: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10', icon: <Sparkles className="h-2.5 w-2.5" /> },
  updated: { label: 'Updated', cls: 'text-amber-400  border-amber-500/25  bg-amber-500/10',  icon: <RefreshCw className="h-2.5 w-2.5" /> },
}

export default async function SpatialComputingPage() {
  const allCaps = await db
    .select({
      slug: capabilities.slug,
      name: capabilities.name,
      summary: capabilities.summary,
      changeType: capabilities.changeType,
      frameworks: capabilities.frameworks,
      impactScore: capabilities.impactScore,
      availability: capabilities.availability,
      category: capabilities.category,
    })
    .from(capabilities)
    .where(eq(capabilities.status, 'ready'))
    .orderBy(desc(capabilities.impactScore))

  const spatialCaps = allCaps.filter(c =>
    c.frameworks.some(f => SPATIAL_KEYWORDS.some(kw => f.includes(kw))) ||
    (c.availability?.toLowerCase().includes('visionos'))
  )

  const newCaps     = spatialCaps.filter(c => c.changeType === 'new')
  const updatedCaps = spatialCaps.filter(c => c.changeType === 'updated')

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': PAGE_URL,
      headline: 'RealityKit & USDKit in iOS 27: Spatial Computing for iOS Developers',
      description: 'Complete reference for spatial computing changes in iOS 27 from WWDC 2026.',
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
        { '@type': 'ListItem', position: 3, name: 'RealityKit & USDKit in iOS 27', item: PAGE_URL },
      ],
    },
  ]

  const CapCard = ({ cap }: { cap: typeof spatialCaps[number] }) => {
    const badge = CHANGE_BADGES[cap.changeType as keyof typeof CHANGE_BADGES] ?? CHANGE_BADGES.new
    const isVisionOnly = cap.availability?.toLowerCase().includes('visionos') && !cap.availability?.toLowerCase().includes('ios')
    return (
      <Link
        href={`/features/${cap.slug}`}
        className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold group-hover:text-violet-400 transition-colors">{cap.name}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-1.5 py-0.5 ${badge.cls}`}>
              {badge.icon}{badge.label}
            </span>
            {isVisionOnly && (
              <span className="text-[10px] font-semibold text-violet-400 border border-violet-500/25 bg-violet-500/10 rounded-full px-1.5 py-0.5">
                visionOS
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{cap.summary}</p>
          {cap.frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cap.frameworks.filter(f => SPATIAL_KEYWORDS.some(kw => f.includes(kw))).slice(0, 3).map(fw => (
                <span key={fw} className="text-[10px] font-medium text-violet-400/60 border border-violet-500/20 rounded px-1.5 py-0.5">{fw}</span>
              ))}
              {cap.frameworks.filter(f => !SPATIAL_KEYWORDS.some(kw => f.includes(kw))).slice(0, 2).map(fw => (
                <span key={fw} className="text-[10px] text-muted-foreground/40 border border-white/[0.05] rounded px-1.5 py-0.5">{fw}</span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-0.5 mt-0.5">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i <= cap.impactScore ? 'bg-violet-500' : 'bg-white/[0.08]'}`} />
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
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-3 py-1 text-xs font-medium text-violet-400 mb-6">
          <Box className="h-3 w-3" /> Spatial Computing · iOS 27
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          RealityKit &amp; USDKit in iOS 27: Spatial Computing for iOS Developers
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          iOS 27 marks a turning point for spatial computing beyond the Vision Pro. USDKit — previously visionOS-only — is now available on iOS, meaning any iPhone can load, inspect, and render USD assets without a server or conversion step. Reality Composer Pro 3 adds a Script Graph for visual scripting, Plugin Extensions for custom tools, and a reworked physics system. RealityKit 4 brings per-object physics settings and improved material authoring.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This guide covers every spatial computing and AR capability tracked in SwiftChronicle for iOS 27. Entries include capabilities across RealityKit, ARKit, USDKit, and Reality Composer Pro.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Spatial APIs', count: spatialCaps.length, color: 'text-violet-400' },
            { label: 'New',          count: newCaps.length,     color: 'text-emerald-400' },
            { label: 'Updated',      count: updatedCaps.length, color: 'text-amber-400' },
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
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">New spatial computing APIs</h2>
          <div className="space-y-3">
            {newCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {updatedCaps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-5">Updated spatial computing APIs</h2>
          <div className="space-y-3">
            {updatedCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {spatialCaps.length === 0 && (
        <p className="text-muted-foreground text-sm">Spatial computing capabilities are being added. Check back soon.</p>
      )}

      <div className="mt-8 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">Browse all capabilities</p>
        <p className="text-xs text-muted-foreground mb-4">Filter by RealityKit, ARKit, or USDKit framework in the interactive capabilities browser.</p>
        <Link href="/features?framework=RealityKit" className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
          RealityKit capabilities in SwiftChronicle <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
