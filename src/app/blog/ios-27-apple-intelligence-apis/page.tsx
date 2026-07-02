import type { Metadata } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Sparkles, RefreshCw, ChevronLeft, ArrowRight, Cpu } from 'lucide-react'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/ios-27-apple-intelligence-apis`
const OG_IMG = `/api/og?name=iOS+27+On-Device+AI+%26+Apple+Intelligence&summary=Foundation+Models%2C+Image+Playground%2C+Writing+Tools+%E2%80%94+every+AI+API+in+iOS+27+explained.&category=AI&impact=5&changeType=new`
const PUBLISHED = '2026-07-01'

export const metadata: Metadata = {
  title: 'iOS 27 On-Device AI & Apple Intelligence: Foundation Models and Beyond',
  description: 'Complete guide to every AI capability in iOS 27 — Foundation Models for on-device LLM inference, Image Playground integration, Writing Tools APIs, and more from WWDC 2026.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'iOS 27 On-Device AI & Apple Intelligence — SwiftChronicle',
    description: 'Foundation Models, Image Playground, Writing Tools — every AI API in iOS 27 explained with Swift code and implementation gotchas.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'iOS 27 AI APIs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iOS 27 On-Device AI & Apple Intelligence',
    description: 'Every AI capability in iOS 27 — Foundation Models, Image Playground, Writing Tools and more.',
    images: [OG_IMG],
  },
}

const CHANGE_BADGES = {
  new:     { label: 'New',     cls: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10', icon: <Sparkles className="h-2.5 w-2.5" /> },
  updated: { label: 'Updated', cls: 'text-amber-400  border-amber-500/25  bg-amber-500/10',  icon: <RefreshCw className="h-2.5 w-2.5" /> },
}

export default async function AICapabilitiesPage() {
  const aiCaps = await db
    .select({
      slug: capabilities.slug,
      name: capabilities.name,
      summary: capabilities.summary,
      changeType: capabilities.changeType,
      frameworks: capabilities.frameworks,
      impactScore: capabilities.impactScore,
      whyItMatters: capabilities.whyItMatters,
    })
    .from(capabilities)
    .where(and(eq(capabilities.status, 'ready'), eq(capabilities.category, 'AI')))
    .orderBy(desc(capabilities.impactScore))

  const newCaps     = aiCaps.filter(c => c.changeType === 'new')
  const updatedCaps = aiCaps.filter(c => c.changeType === 'updated')

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': PAGE_URL,
      headline: 'iOS 27 On-Device AI & Apple Intelligence: Foundation Models and Beyond',
      description: 'Complete guide to every AI capability in iOS 27 from WWDC 2026.',
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
        { '@type': 'ListItem', position: 3, name: 'iOS 27 On-Device AI & Apple Intelligence', item: PAGE_URL },
      ],
    },
  ]

  const CapCard = ({ cap }: { cap: typeof aiCaps[number] }) => {
    const badge = CHANGE_BADGES[cap.changeType as keyof typeof CHANGE_BADGES] ?? CHANGE_BADGES.new
    return (
      <Link
        href={`/features/${cap.slug}`}
        className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-purple-500/20 hover:bg-purple-500/[0.03] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold group-hover:text-purple-400 transition-colors">{cap.name}</span>
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
            <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i <= cap.impactScore ? 'bg-purple-500' : 'bg-white/[0.08]'}`} />
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
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/[0.08] px-3 py-1 text-xs font-medium text-purple-400 mb-6">
          <Cpu className="h-3 w-3" /> AI Guide · iOS 27
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          iOS 27 On-Device AI &amp; Apple Intelligence: Foundation Models and Beyond
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          iOS 27 is Apple's most significant AI release since Siri launched in 2011. The FoundationModels framework puts on-device LLM inference directly in your app — no API key, no server round-trips, no privacy exposure. But Foundation Models is just one piece. This guide covers every AI capability in iOS 27, from Image Playground integration to the new Writing Tools extensibility APIs.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All entries link to their full detail page with compilable Swift code, implementation gotchas, and Apple documentation. Impact scores reflect how broadly applicable each API is across typical iOS apps.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Total AI APIs', count: aiCaps.length, color: 'text-purple-400' },
            { label: 'New',           count: newCaps.length, color: 'text-emerald-400' },
            { label: 'Updated',       count: updatedCaps.length, color: 'text-amber-400' },
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
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">New AI APIs</h2>
          <div className="space-y-3">
            {newCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {updatedCaps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-5">Updated AI APIs</h2>
          <div className="space-y-3">
            {updatedCaps.map(cap => <CapCard key={cap.slug} cap={cap} />)}
          </div>
        </div>
      )}

      {aiCaps.length === 0 && (
        <p className="text-muted-foreground text-sm">AI capabilities are being added. Check back soon.</p>
      )}

      <div className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">Browse AI capabilities interactively</p>
        <p className="text-xs text-muted-foreground mb-4">Filter by framework, sort by impact, and get the full Swift code for every AI API in one place.</p>
        <Link href="/features?category=AI" className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
          AI capabilities in SwiftChronicle <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
